# Mastouri Studio — Portfolio Website

The portfolio of Mastouri Dhia, full-stack developer and AI engineer.
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
│   ├── intro/intro-1..4.jpg              (intro loader chip images)
│   ├── certificates/                     (certificate previews)
│   ├── projects/<project>/               (project artwork & screens)
│   └── tech/                             (technology logos)
├── videos/                 ← Showreel and project videos
├── work/<project>/         ← Case-study pages
├── outside/                ← "Outside the Frame" page
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

## 5. Notes

- **Showreel video**: `videos/showreel/showreel-9s.mp4` (poster `showreel-9s-poster.webp`).
  `showreel-9s.html` is its animated source and is not loaded by the site.
- **Tech logos**: monochrome SVGs from Simple Icons in `images/tech/`, tinted via CSS masks.
- **Fonts**: Funnel Display, Archivo and Space Grotesk (Google Fonts, SIL Open Font License)
  plus Geist, stored in `fonts/`.
