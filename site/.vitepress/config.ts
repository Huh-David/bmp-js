import { defineConfig } from "vitepress";

const base = process.env.GITHUB_ACTIONS === "true" ? "/bmp-js/" : "/";

export default defineConfig({
  title: "@huh-david/bmp-js",
  description: "TypeScript BMP encoder/decoder with fixture-backed reliability.",
  base,
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Quickstart", link: "/quickstart" },
      { text: "API", link: "/api" },
      { text: "Compatibility", link: "/compatibility" },
      { text: "Contributing", link: "/contributing" },
      { text: "GitHub", link: "https://github.com/Huh-David/bmp-js" },
      { text: "npm", link: "https://www.npmjs.com/package/@huh-david/bmp-js" },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Home", link: "/" },
          { text: "Quickstart", link: "/quickstart" },
          { text: "API", link: "/api" },
          { text: "Compatibility", link: "/compatibility" },
          { text: "Contributing", link: "/contributing" },
        ],
      },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/Huh-David/bmp-js" }],
    search: {
      provider: "local",
    },
    footer: {
      message: "MIT Licensed",
      copyright: "Copyright © Huh-David",
    },
  },
});
