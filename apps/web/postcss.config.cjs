module.exports = {
  plugins: [
    require("tailwindcss"),
    require("autoprefixer"),
    {
      postcssPlugin: true,
      Declaration: {
        "font-display": (node) => {
          if (node.parent.name === "font-face" && node.parent.type === "atrule")
            node.value = "swap";
        },
      },
    },
  ],
};
