import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    // generative-ui-kit ships source (not just compiled dist) so its
    // Tailwind classes are scanned here too — otherwise any utility class
    // used only inside the library gets silently purged from production CSS.
    "../../packages/generative-ui-kit/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
