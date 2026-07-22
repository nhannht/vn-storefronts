# Tiệm Táo showcase

This storefront is a public portfolio product, so it needs at least 2 real
showcase images before it counts as shipped. Set up here as a checklist; the
images are supplied or approved by the owner, not auto-captured.

Capture against the running dev server (`bun run dev` in this folder, backend
up on :9000), both themes available via the nav toggle.

## Needed images (0/2 minimum, 5 recommended)

- [ ] `home-dark.png` - home hero, dark theme, the WebGL Orb behind the copy
      and the specular CTA. The signature shot.
- [ ] `home-light.png` - same hero in light (champagne) theme, to show the
      dark/light system.
- [ ] `pdp.png` - product detail: price, "Trả góp 0%" installment block, the
      color segmented control, and the sticky glass buy bar.
- [ ] `checkout-cod.png` - checkout with the COD method selected and the order
      summary (Vietnamese, VND).
- [ ] `order-confirmed.png` - the order confirmation screen after a completed
      COD purchase.

## Notes

- Prices render region-aware: VND on `/vi`, USD on `/en`.
- Diacritics to verify on capture: "Tiệm Táo", "Trả góp", the per-month
  installment line.
- Do not show the Steam/persona or any personal account; this is a demo store.
