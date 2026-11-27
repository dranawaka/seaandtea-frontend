# Things to do

The public catalogue is activities, events and restaurants. Booking stays off this site, so the buttons say "View tours" or "Message a guide".

## Prerender

`vercel.json` runs `node scripts/prerender-things-to-do.js` after the React build. The script reads `REACT_APP_API_BASE_URL`. If that variable is missing, or the API does not answer within 10 seconds, it prints a warning and exits 0 so the deploy still succeeds.

`public/robots.txt` keeps `Disallow: /*?*`, which already keeps filtered list URLs out of search results. The sitemap lines point at `https://www.seaandtea.com/sitemap.xml` and `https://www.seaandtea.com/sitemap-things-to-do.xml`.

JSON-LD builders live in `src/modules/thingstodo/utils/seo.js` as CommonJS so the browser bundle and the prerender script share one file.

## Deploy hook

In the Vercel project, open Settings → Git → Deploy Hooks and create a hook for the production branch. Copy the URL into the backend environment as `THINGS_TO_DO_DEPLOY_HOOK_URL` (property `things-to-do.deploy-hook-url`). Leave it empty until the hook exists. Publishing or updating a catalogue item asks that URL to rebuild the static HTML. A failed hook does not fail the save.

## Acceptance (26 Nov 2026)

Checked against a local API (`spring-boot:run` with the `local` profile, H2, seed loaded) and the dev site.

- Pass: hub shows “Things to do in Sri Lanka”, November in-season activities, confirmed event dates, restaurants, and places. Nav and footer include Things to do.
- Pass: `/things-to-do/activities?category=SURFING&month=11` lists Weligama as in season and Arugam Bay as out of season, with a “Try …” link.
- Pass: an in-season activity and Arugam Bay (out of season in November) show the season bar, opposite-season link, sources, and the guide block (tours or the empty-state copy).
- Pass: Kandy Esala Perahera says dates are not announced and are usually in July to August. The 2026 row stays confirmed; 2027 does not invent a day.
- Pass: Ministry of Crab shows “Open in Google Maps”, a phone link, and no rating.
- Pass: `/admin/things-to-do` shows Access Denied when nobody is signed in.
- Pass: `npm test -- --watchAll=false` (13 tests), `node scripts/prerender-things-to-do.test.js`, and `npm run build`.

