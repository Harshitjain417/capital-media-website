# Capital Media: Creative Video Studio for Finance + SaaS

Agency website for US finance, fintech and SaaS clients. Plain HTML/CSS/JS, so there is nothing to install.

## Live
- **Current (cinematic):** https://harshitjain417.github.io/capital-media-website/
- **Classic V1 (gold):** https://harshitjain417.github.io/capital-media-website/classic/
- **Classic V2 (cobalt):** https://harshitjain417.github.io/capital-media-website/v2/

The classic versions are also frozen in the git tag `classic-v1`.

## Folders
- `index.html`, `styles/`, `scripts/`: the current cinematic site
- `assets/img/`: scene photos (hill, fog, lamp, window, stairs, wall, dusk)
- `js/data.js`: shared content (name, email, case studies, services, brand list)
- `classic/`: frozen copy of Version 1, with its own `data.js`
- `v2/`: Version 2 (reads `js/data.js`)

## Edit content
Everything lives in `js/data.js`.
- `EXPERIENCE`: the brand list. Only list brands you personally worked on, and check your job contract/NDA first.
- `CASES`: case studies. **The included numbers and quotes are samples.** Replace them with real, provable results.

## Images
The current photos are small (about 700px wide). For a sharp desktop hero, swap in landscape versions (2560px wide or more) with the same file names in `assets/img/`. Make sure you own or have licensed every image.

## Preview locally
Double-click `Start Website.bat` (needs Node.js), or run `node server.js`, then open http://localhost:5500/.
