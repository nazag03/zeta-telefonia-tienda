import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" }, screens: { "2xl": "1280px" } },
    extend: {
      colors: {
        
        
        graphite: "#2a2d34",
        mute: "#6b6f78",
        line: "#e6e7ea",
        mist: "#f4f5f7",
        snow: "#fbfbfc",
        whatsapp: { DEFAULT: "#25d366", dark: "#1da851" },
        ink: {
          DEFAULT: "#0a0b0e",
          2: "#15171c",
          950: "#070707",
          900: "#0d0d0e",
          850: "#131315",
          800: "#19191c",
          700: "#232327",
          600: "#2f2f34",
          500: "#4a4a52",
          400: "#76767f",
          300: "#a3a3ab",
          200: "#cfcfd4",
          100: "#ececef",
        },
        brand: {
          50: "#fff4ec",
          100: "#ffe3cf",
          200: "#ffc59e",
          300: "#ff9f63",
          400: "#ff8336",
          500: "#f76a12",
          600: "#dc5508",
          700: "#b5420a",
          800: "#8f3510",
          900: "#6e2a0f",
        },
      },
      borderRadius: {
        card: "1.75rem",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      transitionDuration: {
        900: "900ms",
        1100: "1100ms",
        1500: "1500ms",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(247,106,18,.35), 0 10px 40px -10px rgba(247,106,18,.45)",
        card: "0 1px 0 rgba(255,255,255,.04) inset, 0 20px 40px -24px rgba(0,0,0,.8)",
        soft: "0 1px 2px rgb(10 11 14 / 0.04), 0 8px 24px -8px rgb(10 11 14 / 0.08)",
        lift: "0 2px 4px rgb(10 11 14 / 0.04), 0 24px 48px -16px rgb(10 11 14 / 0.18)",
      },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "none" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        shimmer: { from: { backgroundPosition: "-200% 0" }, to: { backgroundPosition: "200% 0" } },
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgb(37 211 102 / 0.45)" },
          "70%, 100%": { boxShadow: "0 0 0 14px rgb(37 211 102 / 0)" },
        },
        "rise-in": { from: { opacity: "0", transform: "translateY(24px)" }, to: { opacity: "1", transform: "none" } },
        "scale-in": { from: { opacity: "0", transform: "scale(.92) translateY(40px)" }, to: { opacity: "1", transform: "none" } },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-in-right": { from: { transform: "translateX(105%)" }, to: { transform: "none" } },
        "drop-in": { from: { opacity: "0", transform: "translateY(-16px) scale(.98)" }, to: { opacity: "1", transform: "none" } },
      },
      animation: {
        "fade-up": "fade-up .7s cubic-bezier(.2,.7,.2,1) both",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 1.6s linear infinite",
        marquee: "marquee 40s linear infinite",
        "float-slow": "float 7s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.16, 1, 0.3, 1) infinite",
        "rise-in": "rise-in 1s cubic-bezier(0.16, 1, 0.3, 1) both",
        "scale-in": "scale-in 1.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in .3s ease both",
        "slide-in-right": "slide-in-right .55s cubic-bezier(0.16, 1, 0.3, 1) both",
        "drop-in": "drop-in .45s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
