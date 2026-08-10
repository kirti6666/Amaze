/**
 * Minimal, dependency-free PDF writer.
 *
 * Why hand-rolled instead of pdfkit / @react-pdf/renderer?
 *  - Zero new npm dependencies (nothing to install, no package.json change).
 *  - No font files to bundle — we only use the PDF "standard 14" fonts
 *    (Helvetica family), which every PDF reader already has built in. That
 *    makes it completely safe on Vercel/serverless, where bundling font
 *    assets is the usual failure mode for PDF libraries.
 *  - Output is tiny (a few KB) and generation is instant.
 *
 * Coordinate system: this class exposes a TOP-LEFT origin with y growing
 * downward (like CSS), which is far easier to lay a document out in. It is
 * converted to PDF's bottom-left origin internally.
 *
 * Encoding note: standard-14 fonts use WinAnsiEncoding, which has no glyph for
 * the rupee sign (₹, U+20B9). `sanitize()` transliterates it to "Rs." and maps
 * other common typographic characters to safe equivalents, so text never
 * renders as garbage. The on-screen HTML invoice keeps the real ₹ symbol.
 */

export type FontName = "regular" | "bold" | "italic";

export interface TextOptions {
  font?: FontName;
  size?: number;
  color?: [number, number, number]; // 0..1 RGB
  align?: "left" | "right" | "center";
  /** Width of the box used for right/center alignment. */
  width?: number;
}

export interface RectOptions {
  fill?: [number, number, number];
  stroke?: [number, number, number];
  lineWidth?: number;
}

// ---------------------------------------------------------------------------
// Glyph widths (units per 1000) for the standard-14 Helvetica faces, ASCII
// 32..126. Used to measure strings so we can right-align numbers and truncate
// long product titles accurately.
// ---------------------------------------------------------------------------
const HELVETICA_WIDTHS = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
  333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];

const HELVETICA_BOLD_WIDTHS = [
  278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611,
  975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556,
  333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611,
  611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584,
];

/** Replace characters the standard-14 WinAnsi encoding can't represent. */
export function sanitize(input: string): string {
  return String(input ?? "")
    .replace(/\u20B9/g, "Rs.") // ₹
    .replace(/[\u2018\u2019\u201B]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u00D7/g, "x")
    .replace(/\u2212/g, "-")
    .replace(/\u20AC/g, "EUR")
    .replace(/[^\x20-\x7E]/g, ""); // drop anything else non-printable-ASCII
}

interface PageState {
  ops: string[];
}

export class PdfDoc {
  readonly width: number;
  readonly height: number;
  private pages: PageState[] = [];
  private current!: PageState;

  constructor(width = 595.28, height = 841.89) {
    // Default is A4 in points.
    this.width = width;
    this.height = height;
    this.addPage();
  }

  get pageCount(): number {
    return this.pages.length;
  }

  addPage(): void {
    this.current = { ops: [] };
    this.pages.push(this.current);
  }

  /** Width of `str` in points at the given font/size. */
  textWidth(str: string, font: FontName = "regular", size = 10): number {
    const table = font === "bold" ? HELVETICA_BOLD_WIDTHS : HELVETICA_WIDTHS;
    const clean = sanitize(str);
    let total = 0;
    for (let i = 0; i < clean.length; i++) {
      const code = clean.charCodeAt(i);
      const w = code >= 32 && code <= 126 ? table[code - 32] : 556;
      total += w;
    }
    return (total * size) / 1000;
  }

  /** Truncate with an ellipsis so the string fits `maxWidth`. */
  truncate(str: string, maxWidth: number, font: FontName = "regular", size = 10): string {
    const clean = sanitize(str);
    if (this.textWidth(clean, font, size) <= maxWidth) return clean;
    let out = clean;
    while (out.length > 1 && this.textWidth(out + "...", font, size) > maxWidth) {
      out = out.slice(0, -1);
    }
    return out + "...";
  }

  /** Greedy word-wrap into lines that each fit `maxWidth`. */
  wrap(str: string, maxWidth: number, font: FontName = "regular", size = 10): string[] {
    const words = sanitize(str).split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (this.textWidth(candidate, font, size) <= maxWidth) {
        line = candidate;
      } else {
        if (line) lines.push(line);
        line = this.textWidth(word, font, size) > maxWidth
          ? this.truncate(word, maxWidth, font, size)
          : word;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  /**
   * Draw a single line of text. `y` is the TOP of the text box; the baseline is
   * offset down by roughly the cap height so boxes line up predictably.
   */
  text(str: string, x: number, y: number, opts: TextOptions = {}): void {
    const { font = "regular", size = 10, color = [0, 0, 0], align = "left", width = 0 } = opts;
    const clean = sanitize(str);
    if (!clean) return;

    let drawX = x;
    if (align !== "left" && width > 0) {
      const w = this.textWidth(clean, font, size);
      drawX = align === "right" ? x + width - w : x + (width - w) / 2;
    }

    const baselineY = this.height - (y + size * 0.8);
    const fontRef = font === "bold" ? "/F2" : font === "italic" ? "/F3" : "/F1";

    this.current.ops.push(
      `q ${fmt(color[0])} ${fmt(color[1])} ${fmt(color[2])} rg`,
      `BT ${fontRef} ${fmt(size)} Tf 1 0 0 1 ${fmt(drawX)} ${fmt(baselineY)} Tm (${escapeText(clean)}) Tj ET Q`
    );
  }

  line(x1: number, y1: number, x2: number, y2: number, opts: { width?: number; color?: [number, number, number] } = {}): void {
    const { width = 0.5, color = [0.8, 0.8, 0.8] } = opts;
    this.current.ops.push(
      `q ${fmt(color[0])} ${fmt(color[1])} ${fmt(color[2])} RG ${fmt(width)} w ` +
        `${fmt(x1)} ${fmt(this.height - y1)} m ${fmt(x2)} ${fmt(this.height - y2)} l S Q`
    );
  }

  rect(x: number, y: number, w: number, h: number, opts: RectOptions = {}): void {
    const { fill, stroke, lineWidth = 0.5 } = opts;
    if (!fill && !stroke) return;

    const parts: string[] = ["q"];
    if (fill) parts.push(`${fmt(fill[0])} ${fmt(fill[1])} ${fmt(fill[2])} rg`);
    if (stroke) parts.push(`${fmt(stroke[0])} ${fmt(stroke[1])} ${fmt(stroke[2])} RG ${fmt(lineWidth)} w`);
    parts.push(`${fmt(x)} ${fmt(this.height - y - h)} ${fmt(w)} ${fmt(h)} re`);
    parts.push(fill && stroke ? "B" : fill ? "f" : "S");
    parts.push("Q");
    this.current.ops.push(parts.join(" "));
  }

  /** Serialize the document to a Buffer ready to stream or attach to an email. */
  build(): Buffer {
    const objects: string[] = [];
    const addObject = (body: string): number => {
      objects.push(body);
      return objects.length;
    };

    // Reserve 1 = Catalog, 2 = Pages (bodies patched in after page objects exist).
    addObject("");
    addObject("");

    const fontRegular = addObject(
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"
    );
    const fontBold = addObject(
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>"
    );
    const fontItalic = addObject(
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>"
    );

    const resources =
      `<< /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R /F3 ${fontItalic} 0 R >> >>`;

    const pageRefs: number[] = [];
    for (const page of this.pages) {
      const content = page.ops.join("\n");
      const contentRef = addObject(
        `<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`
      );
      const pageRef = addObject(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${fmt(this.width)} ${fmt(this.height)}] ` +
          `/Resources ${resources} /Contents ${contentRef} 0 R >>`
      );
      pageRefs.push(pageRef);
    }

    objects[0] = "<< /Type /Catalog /Pages 2 0 R >>";
    objects[1] =
      `<< /Type /Pages /Kids [${pageRefs.map((r) => `${r} 0 R`).join(" ")}] /Count ${pageRefs.length} >>`;

    // Assemble the file, recording byte offsets for the cross-reference table.
    let out = "%PDF-1.4\n";
    const offsets: number[] = [];
    objects.forEach((body, i) => {
      offsets.push(Buffer.byteLength(out, "latin1"));
      out += `${i + 1} 0 obj\n${body}\nendobj\n`;
    });

    const xrefStart = Buffer.byteLength(out, "latin1");
    out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (const off of offsets) {
      out += `${String(off).padStart(10, "0")} 00000 n \n`;
    }
    out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

    return Buffer.from(out, "latin1");
  }
}

/** PDF numbers: trim to 2dp and avoid scientific notation / "-0". */
function fmt(n: number): string {
  if (!Number.isFinite(n)) return "0";
  const v = Math.round(n * 100) / 100;
  return Object.is(v, -0) ? "0" : String(v);
}

function escapeText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}
