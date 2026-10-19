# DEALS4U.biz

An incremental game about a horribly annoying website.

You land on a page full of pop-up ads, cookie banners, newsletter modals, a
chatbot, CAPTCHAs, a paywall, a glitter cursor and a 4,000-word life story, all
standing between you and the free game at the bottom of the page. Closing
annoyances earns **patience**; spend it in the Website Repair Kit to fix them
one by one. Once the site is fully repaired, the game at the bottom finally
loads: **Webmaster Tycoon**, an incremental game about building the most
annoying website on the internet.

In Webmaster Tycoon, publishing clickbait builds **hype**; fill the meter to go
viral for a while (bigger clicks and income). Visitors browse your site and
sometimes make a run for the ✕; click them before they escape for a bounty.
Sponsors pop up now and then for a short income boost.

## Running it

```sh
npm install
npm run dev
```

Other scripts: `npm run build`, `npm test`, `npm run lint`, `npm run format`.

## Code layout

- `src/data.ts` – fixes, upgrades and tycoon buildings (tune the pacing here)
- `src/state.ts` – game state, reducer, save/load (covered by `state.test.ts`)
- `src/pests/` – one component per annoyance (named so ad blockers leave them alone)
- `src/Shop.tsx` – the Website Repair Kit sidebar
- `src/GameFrame.tsx`, `src/Tycoon.tsx` – the game at the bottom of the page
