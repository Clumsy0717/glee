# GLEE Portfolio

A personal portfolio site built with HTML, CSS, JavaScript, and Bootstrap 5.

## Folder Structure

```
portfolio/
├── index.html          # Main HTML file
├── README.md           # This file
├── css/
│   └── style.css       # All custom styles & CSS variables
├── js/
│   └── main.js         # Scroll reveal, marquee, navbar effects
└── assets/
    └── images/         # Place your own photos here
        └── (your-photo.jpg)
```

## Features

- **Infinite marquee** testimonials carousel (CSS animation + JS duplication)
- **Hero portrait** with purple drop-shadow effect
- **Scroll reveal** animations on all sections
- **Sticky navbar** with blur + shadow on scroll
- **Fully responsive** — mobile & desktop layouts
- **Bootstrap 5** grid + components

## How to Use

1. Open `index.html` in any browser — no build tools needed.
2. Replace the hero `<img src="...">` with your own photo in `assets/images/`.
3. Update the text in `index.html` (name, bio, project descriptions, social links).
4. Tweak colors in `css/style.css` under the `:root { }` block.

## Customization

All design tokens live in `css/style.css`:

```css
:root {
  --purple-bg: #c084fc;     /* Hero + testimonials background */
  --purple-dark: #9b5de5;   /* Accent color */
  --section-bg: #f3e8ff;    /* Socials section background */
  --footer-bg: #1a0a2e;     /* Footer background */
}
```

Change `--purple-bg` to instantly re-theme the whole site.
