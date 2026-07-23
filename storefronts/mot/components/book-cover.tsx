import "./book-cover.css";

// The typographic book cover, shared by the listing card and the PDP. mot has no
// cover photography, so a cover is a title page in type: an author eyebrow, the
// serif title as the centred hero, and the "Mọt" colophon at the foot, washed in
// one calm tint. All material is paper - no glass, no photo slot.
//
// Presentational and server-safe (no hooks): the caller passes the resolved
// brand name and the tint, so the same component renders inside a client card and
// a server PDP. `tint` is a --cover-* custom-property NAME (the listing picks it
// by render index, the PDP by a stable per-book hash). `titleTag` lets the card
// keep its <h3> while the PDP renders a decorative <span> under its own <h1>.
export function BookCover({
  author,
  title,
  brandName,
  tint,
  size = "sm",
  titleTag: TitleTag = "h3",
}: {
  author?: string;
  title: string;
  brandName: string;
  tint: string;
  size?: "sm" | "lg";
  titleTag?: "h1" | "h3" | "span";
}) {
  return (
    <div
      className={size === "lg" ? "mot-cover mot-cover--lg" : "mot-cover"}
      style={{ backgroundColor: `var(${tint})` }}
    >
      {author && <p className="mot-cover-author">{author}</p>}
      <TitleTag className="mot-cover-title font-serif">{title}</TitleTag>
      <span aria-hidden="true" className="mot-cover-mark font-serif">
        {brandName}
      </span>
    </div>
  );
}
