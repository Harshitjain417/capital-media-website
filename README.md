# Capital Media: Video & Motion Studio for Finance + SaaS

Agency website aimed at US finance and SaaS clients. Plain HTML/CSS/JS, so there is nothing to install.
Open it by double-clicking `index.html`.

## Edit everything in `js/data.js`
- `SITE`: name, email, Calendly link, socials, rotating hero niches
- `EXPERIENCE`: the "team experience" brand wall. **Only list brands you personally worked on, and check your current job contract/NDA first.**
- `CASES`: case studies (brief, insight, what we made, results, quote). **The included case studies are samples. Replace the numbers and quotes with real, provable ones before going live.**
- `SERVICES`

The KPI numbers (500+ videos, 48h…) are in `index.html`. Search for `data-to`.

## Videos
Each case study shows an animated "results chart" until you add a video:
`assets/videos/case-1.mp4`, `case-2.mp4`, `case-3.mp4` (MP4/H.264, ideally under 15 MB).
The video plays muted in the card and in the case-study page.

## Page structure
1. Ticker tape of results + live NYSE open/closed status
2. Hero: "Video that makes [brokerages / fund managers / …] impossible to ignore" + live candlestick chart with crosshair
3. Team experience wall
4. 01 Promise: scroll-lit statement + KPIs
5. 02 Who it's for: expanding Finance / SaaS panels
6. 03 Case studies: stacking cards that open into a full case-study page (← → keys, Next case, Esc)
7. 04 Services
8. 05 Process: growth chart that draws itself as you scroll
9. 06 Free sample edit offer + New York / SF / India clocks

## Put it online
Drag the folder onto app.netlify.com/drop, then connect your domain (e.g. capitalmedia.studio).

## Two designs
- **Version 1** (warm gold, `index.html`): stacking case-study cards and a scroll-drawn growth chart.
- **Version 2** (cobalt, `v2/index.html`): zoom-through "CAPITAL" hero, sideways case gallery and a quote-board rate card.

Both read their content from `js/data.js`.

## Preview locally
Double-click `Start Website.bat` (needs Node.js), or run `node server.js`, then open:
- http://localhost:5500/ (Version 1)
- http://localhost:5500/v2/ (Version 2)
