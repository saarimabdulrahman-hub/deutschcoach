import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./contexts/**/*.{js,ts,jsx,tsx,mdx}",
    "../packages/shared/ui/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "var(--color-page-bg)",
        card: "var(--color-card-bg)",
        border: "var(--color-border)",
        accent: "var(--color-accent)",
        "accent-light": "var(--color-accent-light)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        muted: "var(--color-text-muted)",
      },
      fontSize: {
        hero: ["var(--text-hero)", { lineHeight: "1.1" }],
        "page-title": ["var(--text-page-title)", { lineHeight: "1.3" }],
        caption: ["var(--text-caption)", { lineHeight: "1.4" }],
        micro: ["var(--text-micro)", { lineHeight: "1.2" }],
      },
      spacing: {
        "4xs": "var(--space-1)",
        "3xs": "var(--space-2)",
        "2xs": "var(--space-3)",
        xs: "var(--space-4)",
        sm: "var(--space-5)",
        md: "var(--space-6)",
        lg: "var(--space-8)",
        xl: "var(--space-10)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        dropdown: "var(--shadow-dropdown)",
        glow: "var(--shadow-glow)",
        ring: "var(--shadow-ring)",
      },
      zIndex: {
        dropdown: "var(--z-dropdown)",
        sticky: "var(--z-sticky)",
        overlay: "var(--z-overlay)",
        modal: "var(--z-modal)",
        toast: "var(--z-toast)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        normal: "var(--duration-normal)",
        slow: "var(--duration-slow)",
      },
    },
  },
  plugins: [],
};

export default config;
