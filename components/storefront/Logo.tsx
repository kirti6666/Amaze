/**
 * Brand lockup — tiger mark + wordmark.
 *
 * The mark is a single evenodd path: head, stripes, eyes and muzzle are all
 * cut-outs of one shape, so it renders correctly on any background and stays
 * legible down to favicon size. It fills with `currentColor`, so the colour is
 * inherited from whatever context it's dropped into (header, footer, invoice).
 *
 * The wordmark is live text in the display face rather than outlines, which
 * keeps it crisp at every size, selectable, and consistent with the headings
 * it sits above. `/public/brand/tiger-logo.svg` is the flattened equivalent for
 * places that can't render React (email, marketplaces, print).
 */

export function TigerMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M32 56.8C27.6 56.8 22.4 54.6 19 49.4L10.5 48.8 15 43.8 5.5 41.8 13 37.6C11 33.4 10.6 28.4 11.6 23.8 10.6 17.6 12.4 11.6 16.6 9.4 20.4 7.4 24 9.6 25.6 14.2 27.6 13.6 29.8 13.3 32 13.3 34.2 13.3 36.4 13.6 38.4 14.2 40 9.6 43.6 7.4 47.4 9.4 51.6 11.6 53.4 17.6 52.4 23.8 53.4 28.4 53 33.4 51 37.6L58.5 41.8 49 43.8 53.5 48.8 45 49.4C41.6 54.6 36.4 56.8 32 56.8ZM18.4 21.8 15.4 29.8 19 30.8 22 22.6ZM24.2 19 22.2 28.4 25.5 29 27.3 19.6ZM29.8 17.9 29.3 27.7 31.8 27.9 32 18.2ZM45.6 21.8 48.6 29.8 45 30.8 42 22.6ZM39.8 19 41.8 28.4 38.5 29 36.7 19.6ZM34.2 17.9 34.7 27.7 32.2 27.9 32 18.2ZM14.8 32.2C18.4 30.2 24 31.6 28.2 35.6 23.4 36.8 17.6 35.6 14.8 32.2ZM49.2 32.2C45.6 30.2 40 31.6 35.8 35.6 40.6 36.8 46.4 35.6 49.2 32.2ZM28.4 41.2C28.4 40.4 29 40 29.8 40L34.2 40C35 40 35.6 40.4 35.6 41.2L32 46.2Z"
      />
      {/* Irises sit on top of the eye cut-outs — the one place the mark breaks
          from monochrome, so the accent lands exactly where the eye goes. */}
      <g className="fill-primary">
        <path d="M18.2 32.6C20.4 31.4 23.6 32.4 26 35.1 22.6 35.6 19.8 34.6 18.2 32.6Z" />
        <path d="M45.8 32.6C43.6 31.4 40.4 32.4 38 35.1 41.4 35.6 44.2 34.6 45.8 32.6Z" />
      </g>
    </svg>
  );
}

export function Logo({
  storeName = "Tiger",
  tagline,
  className = "",
  markClassName = "h-9 w-9",
  wordClassName = "text-[22px] md:text-2xl",
}: {
  storeName?: string;
  /** Optional strapline under the wordmark. Hidden below `sm` to protect the bar height. */
  tagline?: string;
  className?: string;
  markClassName?: string;
  wordClassName?: string;
}) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <TigerMark className={`${markClassName} shrink-0`} />
      <span className="flex flex-col leading-none">
        <span
          className={`font-display font-extrabold uppercase leading-none tracking-tightest ${wordClassName}`}
        >
          {storeName}
          <span className="ml-0.5 align-super text-[0.42em] font-semibold tracking-normal text-primary">
            ®
          </span>
        </span>
        {tagline && (
          <span className="dose mt-1 hidden text-[8.5px] uppercase leading-none tracking-[0.24em] text-muted sm:block">
            {tagline}
          </span>
        )}
      </span>
    </span>
  );
}
