/** @type {import('tailwindcss').Config} */
export default {
  // Only the admin panel (AdminLayout.jsx) toggles a `dark` class on <html>;
  // the public site never does, so `dark:` utilities are inert there.
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Navy blue — primary brand color.
        // NOTE: token is still named "forest" so every existing forest-* class
        // across the app (Navbar, Footer, cards, etc.) picks up the new color
        // automatically without having to touch every file.
        forest: {
          50: "#f0f5fb",
          100: "#dbe6f3",
          200: "#b3c9e6",
          300: "#85a8d6",
          400: "#5883c0",
          500: "#3a63a3",
          600: "#294c84",
          700: "#1c3a68",
          800: "#12294d",
          900: "#0b1f3a",
          950: "#071527",
        },
        // Champagne Gold — 2%, rare premium highlight only (kickers, dividers,
        // a single standout CTA). Anchored on #C9A227.
        gilt: {
          50: "#faf6e9",
          100: "#f3e9c4",
          200: "#e8d68e",
          300: "#dcc25c",
          400: "#d2b03e",
          500: "#c9a227",
          600: "#a3831f",
          700: "#7f6519",
          800: "#665217",
          900: "#544313",
        },
        // Dark Text (#18231E, 8%) and Muted (#66756D, 5%) — both exact hexes,
        // one ramp for body copy and secondary/muted text.
        ink: {
          50: "#f5f7f5",
          100: "#e6eae6",
          400: "#93a099",
          600: "#66756d",
          800: "#34413b",
          900: "#18231e",
        },
        // Warm Ivory background — 55%. Anchored on #F7F5EF.
        cream: {
          50: "#ffffff",
          100: "#f7f5ef",
          200: "#efebe0",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "'Georgia'", "serif"],
        sans: ["'Manrope'", "'Segoe UI'", "system-ui", "sans-serif"],
        // Same stack as `sans` — several components use `font-body` directly;
        // defining it here (instead of leaving it undefined) makes that class
        // actually apply Manrope instead of silently falling back to the browser default.
        body: ["'Manrope'", "'Segoe UI'", "system-ui", "sans-serif"],
        // Nepali typeface, used site-wide whenever the language is switched to
        // Nepali (see the html[lang="ne"] override in index.css). Real Unicode
        // Devanagari font under the hood (Noto Sans Devanagari) — named `preeti`
        // per request, kept distinct from `body` so English stays on Manrope.
        preeti: ["'Noto Sans Devanagari'", "'Manrope'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        // Navy-tinted glow + a thin glassy top highlight for a premium sheen.
        soft: "0 8px 30px -8px rgba(11, 31, 58, 0.20), inset 0 1px 0 rgba(255,255,255,0.5)",
        card: "0 4px 18px -6px rgba(11, 31, 58, 0.14), inset 0 1px 0 rgba(255,255,255,0.5)",
        lift: "0 20px 45px -15px rgba(11, 31, 58, 0.32), inset 0 1px 0 rgba(255,255,255,0.6)",
      },
      borderRadius: {
        xl2: "1.5rem",
        xl3: "2rem",
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      animation: {
        "fade-up": "fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both",
        float: "float 6s ease-in-out infinite",
        // Plain CSS animation (not Framer Motion) specifically so it can be
        // paused with the `hover:[animation-play-state:paused]` utility —
        // hovering any card inside pauses the whole strip so the hover
        // enlarge effect on that card is actually readable.
        marquee: "marquee 28s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(16px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        marquee: {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0%)" },
        },
      },
    },
  },
  plugins: [],
};
