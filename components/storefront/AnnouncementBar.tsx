import Link from "next/link";
import { storefrontAppearance } from "./appearance";
import { getSiteSettings } from "@/lib/site-settings";

/**
 * Thin promo bar pinned above the header, running as a continuous marquee.
 * Renders nothing unless the admin has enabled it (and given it text) in
 * Site Settings â†’ Announcement.
 *
 * How the loop is seamless: the message list is rendered twice, side by side,
 * and the track slides exactly -50% before snapping back. Because the second
 * copy is pixel-identical to the first and sits where the first started, the
 * reset is invisible — no gap, no jump.
 *
 * The admin can write several messages separated by "Â·" and each becomes its
 * own item with a divider, so one settings field drives the whole ticker.
 */
export async function AnnouncementBar() {
  const settings = storefrontAppearance(await getSiteSettings());
  const { enabled, text, link } = settings.announcement;

  if (!enabled || !text.trim()) return null;

  const messages = text
    .split("Â·")
    .map((m) => m.trim())
    .filter(Boolean);

  // Short messages would leave visible gaps in a wide viewport, so repeat the
  // set until the track is comfortably wider than any realistic screen.
  const totalChars = messages.join("").length;
  const repeats = Math.max(2, Math.ceil(90 / Math.max(totalChars, 1)));
  const sequence = Array.from({ length: repeats }, () => messages).flat();

  const track = (
    <div className="marquee-track flex shrink-0 items-center">
      {sequence.map((m, i) => (
        <span key={i} className="flex items-center whitespace-nowrap">
          <span className="px-5 text-[12.5px] font-medium tracking-wide md:text-[13px]">
            {m}
          </span>
          <span aria-hidden="true" className="text-[9px] opacity-60">
            ◆
          </span>
        </span>
      ))}
    </div>
  );

  const bar = (
    <div className="marquee flex overflow-hidden py-2.5">
      {track}
      {/* Duplicate copy — aria-hidden so screen readers announce the text once. */}
      <div aria-hidden="true" className="contents">
        {track}
      </div>
    </div>
  );

  return (
    <div className="store-announcement relative overflow-hidden bg-primary text-primary-foreground">
      {bar}
      {link && (
        <Link
          href={link}
          className="absolute inset-0"
          aria-label={messages.join(". ")}
        />
      )}
    </div>
  );
}
