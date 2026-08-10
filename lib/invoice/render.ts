import { PdfDoc } from "./pdf";
import type { InvoiceSnapshot } from "./compute";

/**
 * Draws a GST-compliant tax invoice onto a PDF and returns the bytes.
 *
 * Layout follows the conventions of a real Indian tax invoice:
 *   title bar -> seller identity + invoice meta -> Bill To / Ship To ->
 *   line-item table with HSN and per-line tax -> totals with CGST/SGST or IGST
 *   -> amount in words -> HSN/SAC-wise tax summary -> bank/declaration/signature.
 */

const PAGE_MARGIN = 36;
const LINE_GRAY: [number, number, number] = [0.78, 0.78, 0.8];
const HEAD_BG: [number, number, number] = [0.94, 0.95, 0.97];
const MUTED: [number, number, number] = [0.42, 0.45, 0.5];
const DARK: [number, number, number] = [0.07, 0.09, 0.15];

/** 1234.5 -> "1,234.50" (Indian invoices read fine with plain grouping). */
function money(n: number): string {
  const v = Number.isFinite(n) ? n : 0;
  const neg = v < 0;
  const fixed = Math.abs(v).toFixed(2);
  const [whole, dec] = fixed.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${neg ? "-" : ""}${grouped}.${dec}`;
}

function dateOnly(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}

interface Column {
  key: string;
  label: string;
  width: number;
  align: "left" | "right" | "center";
}

export function renderInvoicePdf(snap: InvoiceSnapshot): Buffer {
  const doc = new PdfDoc();
  const left = PAGE_MARGIN;
  const right = doc.width - PAGE_MARGIN;
  const contentWidth = right - left;
  const bottomLimit = doc.height - PAGE_MARGIN - 28; // keep room for the footer

  const gst = snap.taxConfig.gstEnabled;

  // Column set adapts to whether GST is enabled at all.
  const columns: Column[] = gst
    ? [
        { key: "idx", label: "#", width: 20, align: "left" },
        { key: "desc", label: "Description", width: 150, align: "left" },
        { key: "hsn", label: "HSN/SAC", width: 50, align: "left" },
        { key: "qty", label: "Qty", width: 28, align: "right" },
        { key: "rate", label: "Rate", width: 58, align: "right" },
        { key: "taxable", label: "Taxable", width: 62, align: "right" },
        { key: "gstpc", label: "GST%", width: 34, align: "right" },
        { key: "tax", label: "Tax", width: 58, align: "right" },
        { key: "amount", label: "Amount", width: contentWidth - 460, align: "right" },
      ]
    : [
        { key: "idx", label: "#", width: 24, align: "left" },
        { key: "desc", label: "Description", width: 300, align: "left" },
        { key: "qty", label: "Qty", width: 40, align: "right" },
        { key: "rate", label: "Rate", width: 70, align: "right" },
        { key: "amount", label: "Amount", width: contentWidth - 434, align: "right" },
      ];

  const colX: number[] = [];
  let acc = left;
  for (const c of columns) {
    colX.push(acc);
    acc += c.width;
  }

  let y = PAGE_MARGIN;
  let pageNo = 1;

  /* ---------------------------------------------------------------- *
   * Header blocks
   * ---------------------------------------------------------------- */

  function drawTitleBar(): void {
    doc.rect(left, y, contentWidth, 26, { fill: HEAD_BG, stroke: LINE_GRAY });
    doc.text(snap.document.title || "TAX INVOICE", left, y + 8, {
      font: "bold",
      size: 13,
      align: "center",
      width: contentWidth,
      color: DARK,
    });
    y += 26;
  }

  function drawSellerAndMeta(): void {
    const boxTop = y;
    const metaWidth = 210;
    const sellerWidth = contentWidth - metaWidth;

    // ---- Seller (left) ----
    let sy = boxTop + 8;
    const sx = left + 8;
    const s = snap.seller;

    const sellerTitle = s.tradeName || s.legalName || "";
    if (sellerTitle) {
      doc.text(sellerTitle, sx, sy, { font: "bold", size: 11, color: DARK });
      sy += 14;
    }
    if (s.legalName && s.tradeName && s.legalName !== s.tradeName) {
      doc.text(s.legalName, sx, sy, { size: 8, color: MUTED });
      sy += 10;
    }

    const addressParts = [
      s.addressLine1,
      s.addressLine2,
      [s.city, s.state, s.pincode].filter(Boolean).join(", "),
      s.country,
    ].filter(Boolean) as string[];
    for (const part of addressParts) {
      for (const lineText of doc.wrap(part, sellerWidth - 16, "regular", 8.5)) {
        doc.text(lineText, sx, sy, { size: 8.5, color: MUTED });
        sy += 10;
      }
    }

    const idBits: string[] = [];
    if (s.gstin) idBits.push(`GSTIN: ${s.gstin}`);
    if (s.pan) idBits.push(`PAN: ${s.pan}`);
    if (s.cin) idBits.push(`CIN: ${s.cin}`);
    for (const bit of idBits) {
      doc.text(bit, sx, sy, { size: 8.5, font: "bold", color: DARK });
      sy += 10;
    }

    const contactBits = [s.phone, s.email, s.website].filter(Boolean) as string[];
    if (contactBits.length) {
      for (const lineText of doc.wrap(contactBits.join("  |  "), sellerWidth - 16, "regular", 8)) {
        doc.text(lineText, sx, sy, { size: 8, color: MUTED });
        sy += 9.5;
      }
    }

    // ---- Invoice meta (right) ----
    const mx = left + sellerWidth;
    let my = boxTop + 8;
    const rows: [string, string][] = [
      ["Invoice No.", snap.invoiceNumber],
      ["Invoice Date", dateOnly(snap.issuedAt)],
      ["Order No.", `#${snap.order.shortId}`],
      ["Order Date", dateOnly(snap.order.placedAt)],
      ["Payment", snap.order.paymentMethod],
    ];
    if (gst && snap.placeOfSupply) rows.push(["Place of Supply", snap.placeOfSupply]);
    if (snap.order.razorpayPaymentId) rows.push(["Payment Ref", snap.order.razorpayPaymentId]);

    for (const [label, value] of rows) {
      doc.text(label, mx + 8, my, { size: 8, color: MUTED });
      const valueWidth = metaWidth - 16 - 78;
      doc.text(doc.truncate(value, valueWidth, "bold", 8.5), mx + 8 + 78, my, {
        size: 8.5,
        font: "bold",
        color: DARK,
      });
      my += 12;
    }

    const boxHeight = Math.max(sy, my) + 8 - boxTop;
    doc.rect(left, boxTop, contentWidth, boxHeight, { stroke: LINE_GRAY });
    doc.line(mx, boxTop, mx, boxTop + boxHeight, { color: LINE_GRAY });
    y = boxTop + boxHeight;
  }

  function drawParties(): void {
    const boxTop = y;
    const half = contentWidth / 2;
    const b = snap.buyer;

    const partyLines: string[] = [];
    if (b.name) partyLines.push(b.name);
    partyLines.push(...b.addressLines);
    const cityLine = [b.city, b.state, b.pincode].filter(Boolean).join(", ");
    if (cityLine) partyLines.push(cityLine);
    if (b.phone) partyLines.push(`Phone: ${b.phone}`);
    if (b.email) partyLines.push(`Email: ${b.email}`);
    if (gst && b.stateCode) partyLines.push(`State Code: ${b.stateCode}`);

    const drawParty = (title: string, x: number) => {
      let py = boxTop + 8;
      doc.text(title, x + 8, py, { font: "bold", size: 8.5, color: DARK });
      py += 12;
      for (const raw of partyLines) {
        for (const lineText of doc.wrap(raw, half - 16, "regular", 8.5)) {
          doc.text(lineText, x + 8, py, { size: 8.5, color: MUTED });
          py += 10;
        }
      }
      return py;
    };

    const endA = drawParty("BILL TO", left);
    const endB = drawParty("SHIP TO", left + half);

    const boxHeight = Math.max(endA, endB) + 6 - boxTop;
    doc.rect(left, boxTop, contentWidth, boxHeight, { stroke: LINE_GRAY });
    doc.line(left + half, boxTop, left + half, boxTop + boxHeight, { color: LINE_GRAY });
    y = boxTop + boxHeight;
  }

  /** Vertical column separators + side borders for one table row band. */
  function drawRowGrid(top: number, height: number): void {
    for (let i = 1; i < colX.length; i++) {
      doc.line(colX[i], top, colX[i], top + height, { color: LINE_GRAY });
    }
    doc.line(left, top, left, top + height, { color: LINE_GRAY });
    doc.line(right, top, right, top + height, { color: LINE_GRAY });
  }

  function drawTableHeader(): void {
    doc.rect(left, y, contentWidth, 20, { fill: HEAD_BG, stroke: LINE_GRAY });
    columns.forEach((c, i) => {
      doc.text(c.label, colX[i] + 4, y + 6, {
        font: "bold",
        size: 8,
        color: DARK,
        align: c.align,
        width: c.width - 8,
      });
    });
    drawRowGrid(y, 20);
    y += 20;
  }

  function drawFooter(): void {
    const fy = doc.height - PAGE_MARGIN - 14;
    doc.line(left, fy - 6, right, fy - 6, { color: LINE_GRAY });
    if (snap.document.footerText) {
      doc.text(doc.truncate(snap.document.footerText, contentWidth - 70, "regular", 7.5), left, fy, {
        size: 7.5,
        color: MUTED,
      });
    }
    doc.text(`Page ${pageNo}`, right - 60, fy, { size: 7.5, color: MUTED, align: "right", width: 60 });
  }

  /** Start a fresh page and re-draw the item table header. */
  function newPage(): void {
    drawFooter();
    doc.addPage();
    pageNo += 1;
    y = PAGE_MARGIN;
    doc.text(`${snap.document.title || "TAX INVOICE"} — ${snap.invoiceNumber} (continued)`, left, y, {
      font: "bold",
      size: 9,
      color: DARK,
    });
    y += 18;
    drawTableHeader();
  }

  /** Ensure `needed` vertical points are available, paginating if not. */
  function ensureSpace(needed: number, withTableHeader = false): void {
    if (y + needed <= bottomLimit) return;
    if (withTableHeader) {
      newPage();
    } else {
      drawFooter();
      doc.addPage();
      pageNo += 1;
      y = PAGE_MARGIN;
    }
  }

  /* ---------------------------------------------------------------- *
   * Build the document
   * ---------------------------------------------------------------- */

  drawTitleBar();
  drawSellerAndMeta();
  drawParties();
  drawTableHeader();

  // ---- Line items ----
  for (const line of snap.lines) {
    const descWidth = columns.find((c) => c.key === "desc")!.width - 8;
    const titleLines = doc.wrap(line.title, descWidth, "regular", 8.5);
    const variantLines = line.variant ? doc.wrap(line.variant, descWidth, "italic", 7.5) : [];
    const rowHeight = Math.max(20, 8 + titleLines.length * 10 + variantLines.length * 9);

    ensureSpace(rowHeight, true);

    const rowTop = y;
    const cells: Record<string, string> = {
      idx: String(line.index),
      hsn: line.hsn || "-",
      qty: String(line.quantity),
      rate: money(line.unitPrice),
      taxable: money(line.taxableValue),
      gstpc: line.gstRate ? `${line.gstRate}%` : "-",
      tax: money(line.cgst + line.sgst + line.igst),
      amount: money(line.lineTotal),
    };

    columns.forEach((c, i) => {
      if (c.key === "desc") {
        let ty = rowTop + 5;
        for (const t of titleLines) {
          doc.text(t, colX[i] + 4, ty, { size: 8.5, color: DARK });
          ty += 10;
        }
        for (const v of variantLines) {
          doc.text(v, colX[i] + 4, ty, { size: 7.5, color: MUTED, font: "italic" });
          ty += 9;
        }
      } else {
        doc.text(cells[c.key] ?? "", colX[i] + 4, rowTop + 5, {
          size: 8.5,
          color: DARK,
          align: c.align,
          width: c.width - 8,
        });
      }
    });

    drawRowGrid(rowTop, rowHeight);
    y = rowTop + rowHeight;
    doc.line(left, y, right, y, { color: LINE_GRAY });
  }

  // ---- Totals + amount in words ----
  const totals = snap.totals;
  const totalRows: [string, string, boolean][] = [];

  totalRows.push(["Gross Amount", money(totals.gross), false]);
  if (totals.discount > 0) {
    totalRows.push([
      `Discount${snap.order.couponCode ? ` (${snap.order.couponCode})` : ""}`,
      `-${money(totals.discount)}`,
      false,
    ]);
  }
  if (gst) totalRows.push(["Taxable Value", money(totals.taxableValue), false]);
  if (gst && !snap.isInterState && totals.cgst > 0) {
    totalRows.push(["CGST", money(totals.cgst), false]);
    totalRows.push(["SGST", money(totals.sgst), false]);
  }
  if (gst && snap.isInterState && totals.igst > 0) {
    totalRows.push(["IGST", money(totals.igst), false]);
  }
  totalRows.push([
    totals.shippingFee > 0 ? "Shipping / Delivery" : "Shipping / Delivery (Free)",
    money(totals.shippingFee),
    false,
  ]);
  if (Math.abs(totals.roundOff) >= 0.01) {
    totalRows.push(["Round Off", money(totals.roundOff), false]);
  }
  totalRows.push(["Grand Total", `Rs. ${money(totals.grandTotal)}`, true]);

  const totalsHeight = totalRows.length * 14 + 14;
  ensureSpace(totalsHeight + 40);

  const totalsWidth = 220;
  const totalsX = right - totalsWidth;
  const totalsTop = y + 6;

  // Amount in words sits to the left of the totals block.
  if (snap.document.showAmountInWords) {
    let wy = totalsTop + 4;
    doc.text("Amount in Words", left + 2, wy, { size: 7.5, color: MUTED });
    wy += 11;
    for (const w of doc.wrap(snap.amountInWords, contentWidth - totalsWidth - 16, "bold", 8.5)) {
      doc.text(w, left + 2, wy, { size: 8.5, font: "bold", color: DARK });
      wy += 11;
    }
  }

  let ty = totalsTop;
  for (const [label, value, strong] of totalRows) {
    if (strong) {
      doc.rect(totalsX, ty - 2, totalsWidth, 18, { fill: HEAD_BG, stroke: LINE_GRAY });
    }
    doc.text(label, totalsX + 8, ty + 2, {
      size: strong ? 9.5 : 8.5,
      font: strong ? "bold" : "regular",
      color: strong ? DARK : MUTED,
    });
    doc.text(value, totalsX, ty + 2, {
      size: strong ? 9.5 : 8.5,
      font: strong ? "bold" : "regular",
      color: DARK,
      align: "right",
      width: totalsWidth - 8,
    });
    ty += strong ? 18 : 14;
  }
  y = Math.max(ty, totalsTop) + 10;

  // ---- HSN / SAC summary ----
  if (gst && snap.document.showHsnSummary && snap.hsnSummary.length > 0) {
    ensureSpace(40 + snap.hsnSummary.length * 14);

    doc.text("HSN / SAC Summary", left, y, { font: "bold", size: 9, color: DARK });
    y += 14;

    const hsnCols: Column[] = snap.isInterState
      ? [
          { key: "hsn", label: "HSN/SAC", width: 110, align: "left" },
          { key: "taxable", label: "Taxable Value", width: 110, align: "right" },
          { key: "rate", label: "IGST %", width: 80, align: "right" },
          { key: "igst", label: "IGST Amt", width: 110, align: "right" },
          { key: "total", label: "Total Tax", width: contentWidth - 410, align: "right" },
        ]
      : [
          { key: "hsn", label: "HSN/SAC", width: 90, align: "left" },
          { key: "taxable", label: "Taxable Value", width: 95, align: "right" },
          { key: "rate", label: "Rate", width: 55, align: "right" },
          { key: "cgst", label: "CGST", width: 85, align: "right" },
          { key: "sgst", label: "SGST", width: 85, align: "right" },
          { key: "total", label: "Total Tax", width: contentWidth - 410, align: "right" },
        ];

    const hx: number[] = [];
    let hacc = left;
    for (const c of hsnCols) {
      hx.push(hacc);
      hacc += c.width;
    }

    doc.rect(left, y, contentWidth, 16, { fill: HEAD_BG, stroke: LINE_GRAY });
    hsnCols.forEach((c, i) => {
      doc.text(c.label, hx[i] + 4, y + 4, {
        font: "bold",
        size: 7.5,
        color: DARK,
        align: c.align,
        width: c.width - 8,
      });
    });
    y += 16;

    for (const row of snap.hsnSummary) {
      const cells: Record<string, string> = {
        hsn: row.hsn,
        taxable: money(row.taxableValue),
        rate: `${row.gstRate}%`,
        cgst: money(row.cgst),
        sgst: money(row.sgst),
        igst: money(row.igst),
        total: money(row.cgst + row.sgst + row.igst),
      };
      hsnCols.forEach((c, i) => {
        doc.text(cells[c.key] ?? "", hx[i] + 4, y + 4, {
          size: 8,
          color: DARK,
          align: c.align,
          width: c.width - 8,
        });
      });
      y += 14;
      doc.line(left, y, right, y, { color: LINE_GRAY });
    }
    y += 8;
  }

  // ---- Bank details / declaration / signature ----
  const blocks: string[] = [];
  if (snap.document.showBankDetails) {
    const b = snap.bank;
    const bankBits = [
      b.accountName && `A/c Name: ${b.accountName}`,
      b.bankName && `Bank: ${b.bankName}`,
      b.accountNumber && `A/c No: ${b.accountNumber}`,
      b.ifsc && `IFSC: ${b.ifsc}`,
      b.branch && `Branch: ${b.branch}`,
    ].filter(Boolean) as string[];
    if (bankBits.length) blocks.push(`Bank Details — ${bankBits.join("  |  ")}`);
  }
  if (snap.document.terms) blocks.push(`Terms & Conditions — ${snap.document.terms}`);
  if (snap.document.notes) blocks.push(snap.document.notes);
  if (snap.document.declaration) blocks.push(`Declaration — ${snap.document.declaration}`);

  const signatureWidth = 170;

  // Reserve room for the signature block so it is never split across pages.
  ensureSpace(74);

  const sigTop = y + 4;
  doc.text(snap.seller.tradeName || snap.seller.legalName || "", right - signatureWidth, sigTop, {
    size: 8,
    font: "bold",
    color: DARK,
    align: "right",
    width: signatureWidth,
  });
  doc.line(right - signatureWidth, sigTop + 46, right, sigTop + 46, { color: LINE_GRAY });
  doc.text(snap.document.signatureLabel || "Authorised Signatory", right - signatureWidth, sigTop + 50, {
    size: 7.5,
    color: MUTED,
    align: "right",
    width: signatureWidth,
  });

  // Text blocks flow beside the signature, then across the full width once the
  // signature area is cleared (or after a page break).
  const sigBottom = sigTop + 62;
  let by = sigTop;

  for (const block of blocks) {
    const narrow = by < sigBottom;
    const width = narrow ? contentWidth - signatureWidth - 16 : contentWidth;
    for (const lineText of doc.wrap(block, width, "regular", 7.5)) {
      if (by + 9.5 > bottomLimit) {
        drawFooter();
        doc.addPage();
        pageNo += 1;
        by = PAGE_MARGIN;
      }
      doc.text(lineText, left + 2, by, { size: 7.5, color: MUTED });
      by += 9.5;
    }
    by += 4;
  }

  y = Math.max(by, sigBottom);

  drawFooter();
  return doc.build();
}
