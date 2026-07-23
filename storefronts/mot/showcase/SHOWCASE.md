# Mọt showcase

This storefront is a public portfolio product, so it needs at least 2 real
showcase images before it counts as shipped. Set up here as a checklist; the
images are supplied or approved by the owner, not auto-captured.

Capture against the running dev server (`bun run dev` in this folder, backend
up on :9000). Mọt is light/paper by default; the sage night theme is an opt-in
toggle in the nav.

## Needed images (0/2 minimum, 5 recommended)

- [ ] `home-light.png` - home hero, light paper theme, the Card Nav and the
      serif wordmark. The signature shot.
- [ ] `home-night.png` - same hero in the sage night theme, to show the
      light/night system.
- [ ] `pdp.png` - product detail: the "Đọc thử" reading preview passage set in
      serif, the softcover/hardcover edition picker, and add to shelf.
- [ ] `listing.png` - author-first browse with the typographic covers (no
      photography, title + author on sage-family tints).
- [ ] `checkout-cod.png` - checkout with the COD method selected and the order
      summary (Vietnamese, VND).
- [ ] `order-confirmed.png` - the order confirmation screen after a completed
      COD purchase.

## Notes

- Prices render region-aware: VND on `/vi`, USD on `/en`.
- Diacritics to verify on capture: "Mọt", "Đọc thử", "Truyện Kiều", and the
  author names "Nguyễn Du", "Vũ Trọng Phụng", "Tô Hoài".
- Do not show the Steam/persona or any personal account; this is a demo store.
