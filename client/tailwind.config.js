/** @type {import('tailwindcss').Config} */
export default {
  // Only the admin panel (AdminLayout.jsx) toggles a `dark` class on <html>;
  // the public site never does, so `dark:` utilities are inert there.
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Premium NGO green palette. NOTE: token is still named "forest" so
        // every existing forest-* class across the app (Navbar, Footer,
        // cards, etc.) picks up the new color automatically without having
        // to touch every file. Exact anchors from the palette: 100 = Soft
        // Mint #EAF5EC, 400 = Sage #6FAF7A, 600 = Forest Green (primary)
        // #3F9654, 700 = the darker stop of the hero gradient #2F7D45,
        // 900 = Deep Forest (dark) #173B25.
        forest: {
          50: "#f5faf6",
          100: "#eaf5ec",
          200: "#c9e6cd",
          300: "#9ed2a8",
          400: "#6faf7a",
          500: "#58a066",
          600: "#3f9654",
          700: "#2f7d45",
          800: "#235c34",
          900: "#173b25",
          950: "#0d2416",
        },
        // Soft Gold accent — anchored on #C9A65B, with Champagne #F3E9CF as
        // the light tier. Used sparingly (kickers, dividers, one CTA).
        gilt: {
          50: "#fbf7ec",
          100: "#f3e9cf",
          200: "#e9d7a8",
          300: "#ddc37e",
          400: "#d3b46a",
          500: "#c9a65b",
          600: "#a8863f",
          700: "#866a32",
          800: "#6d5628",
          900: "#584622",
        },
        // Heading (Charcoal Green #18241D) and body/muted (Muted Gray
        // #5F6862) — both exact hexes, one ramp for body copy and
        // secondary/muted text.
        ink: {
          50: "#f5f7f5",
          100: "#e6eae6",
          400: "#93a099",
          600: "#5f6862",
          800: "#33403a",
          900: "#18241d",
        },
        // Warm Ivory background — anchored on #F8F7F2, with Pure White as
        // the lightest tier.
        cream: {
          50: "#ffffff",
          100: "#f8f7f2",
          200: "#efece3",
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
        // Deep-forest-tinted glow + a thin glassy top highlight for a premium sheen.
        soft: "0 8px 30px -8px rgba(23, 59, 37, 0.20), inset 0 1px 0 rgba(255,255,255,0.5)",
        card: "0 4px 18px -6px rgba(23, 59, 37, 0.14), inset 0 1px 0 rgba(255,255,255,0.5)",
        lift: "0 20px 45px -15px rgba(23, 59, 37, 0.32), inset 0 1px 0 rgba(255,255,255,0.6)",
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
