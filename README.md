# Mastouri Studio — Portfolio Website

The portfolio of Mastouri Dhia, full-stack developer.
Built with plain **HTML, CSS, and JavaScript** (no frameworks, no build step).

---

## 1. Project Structure

```
├── index.html              ← Main page (all content lives here)
├── css/
│   ├── styles.css          ← All styling + design tokens (CSS variables)
│   ├── case-study.css      ← Case-study pages
│   └── outside.css         ← "Outside the Frame" page
├── js/
│   └── main.js             ← Interactions (menu, intro, scroll, video)
├── fonts/                  ← Local font files (woff2)
├── images/
│   ├── hero-portrait.jpg                 (hero photo)
│   ├── about-float-baby.jpg              (about section photo)
│   ├── intro/intro-1..4.webp             (intro loader chip images)
│   ├── certificates/                     (certificate previews)
│   ├── projects/<project>/               (project artwork & screens)
│   └── tech/                             (technology logos)
├── videos/                 ← Showreel and project videos
├── work/<project>/         ← Case-study pages
├── audio/                  ← Sound for the "Outside the Frame" section
├── outside/                ← "Outside the Frame" page
├── 404.html                ← "Page not found" page (served by Netlify)
├── netlify.toml            ← Netlify settings (headers, caching)
├── sitemap.xml, robots.txt ← For search engines
└── README.md               ← This file
```

---

## 2. How to Launch Locally

Because the site uses local fonts and images, **open it through a local server**
(not by double-clicking `index.html`). Any of these work:

**Option A — Python (if installed):**
```powershell
python -m http.server 8000
```

**Option B — Node (if installed):**
```powershell
npx serve .
```

Then open **http://localhost:8000** in your browser.

---

## 3. Which File Controls What

| Part of the site         | File                  |
|--------------------------|-----------------------|
| All page content & text  | `index.html`          |
| Colors, fonts, spacing   | `css/styles.css` (top `:root` variables) |
| Layout & visual styling  | `css/styles.css`      |
| Menu, intro, animations  | `js/main.js`          |
| Case-study pages         | `work/<project>/index.html` |
| Outside the Frame page   | `outside/index.html`  |
| Images                   | `images/`             |

---

## 4. How to Customize

### Change colors, fonts, spacing
Open `css/styles.css`. The **first block** (`:root`) holds all design tokens.
Change any value and the whole site updates.

### Change text
All text is in `index.html`. Search for the section you want:
- Hero name/tagline → `<section id="top">`
- About bio → `<section id="studio">`
- Experience → `<section id="experience">`
- Selected Projects → `<section id="projects">`
- Certificates → `<section id="certificates">`
- Outside the Frame → `<section id="outside">`
- Footer/contact → `<footer id="contact">`

### Change an image
1. Put your new image in `images/`.
2. In `index.html`, find the `<img src="images/...">` tag and update the path.

### Add a certificate
Add one `<li class="cert">` inside `.certs-list` in `index.html`.
`data-preview` is the image shown next to the cursor on hover.

---

## 5. Going Live (Netlify)

1. Push this repo to GitHub, then in Netlify: **Add new site → Import an existing project**
   and pick the repo. No build command; `netlify.toml` already sets the publish folder.
   (Deploying from Git keeps `.vscode/`, `.claude/` and other git-ignored files off the site.)
2. Once you know the live address, replace the placeholder `your-domain.com` everywhere
   (page `<head>` tags, `sitemap.xml`, `robots.txt`) with it, e.g. from Git Bash:
   ```bash
   grep -rl "your-domain.com" --include=*.html --include=*.xml --include=*.txt . \
     | xargs sed -i "s#your-domain.com#mastouri.netlify.app#g"
   ```
   Then commit and push. (This also switches on analytics, which only counts visits on that domain.)
3. **Analytics:** Umami Cloud ([cloud.umami.is](https://cloud.umami.is)) is already set up on every
   page with the site's Website ID. In the Umami dashboard, set the website's domain to the live one.
   Besides page views, it records: contact form sends (with the topic picked), email clicks,
   case-study opens, outbound links (GitHub, LinkedIn, atej.tn…) and "Step inside".
4. Submit `https://<your-domain>/sitemap.xml` in
   [Google Search Console](https://search.google.com/search-console).

---

## 6. Notes

- **Showreel video**: `videos/showreel/showreel-9s.mp4` (poster `showreel-9s-poster.webp`).
- **Contact form**: sent through Web3Forms to contactmastourid@gmail.com (key in `index.html`).
- **Tech logos**: monochrome SVGs from Simple Icons in `images/tech/`, tinted via CSS masks.
- **Fonts**: Funnel Display, Archivo and Space Grotesk (Google Fonts, SIL Open Font License),
  stored in `fonts/`.
