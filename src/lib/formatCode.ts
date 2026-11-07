export type Lang = "html" | "css" | "js";

/**
 * "Tidy" button: lays the code out neatly (indentation, spacing, line breaks), the way VS Code's
 * Format Document does. The formatter is large, so it is only downloaded the first time it is used.
 * Throws a short, readable message when the code has a mistake that stops it being formatted.
 */
export const formatCode = async (lang: Lang, code: string): Promise<string> => {
  const [prettier, html, postcss, babel, estree] = await Promise.all([
    import("prettier/standalone"),
    import("prettier/plugins/html"),
    import("prettier/plugins/postcss"),
    import("prettier/plugins/babel"),
    import("prettier/plugins/estree"),
  ]);
  const parser = lang === "html" ? "html" : lang === "css" ? "css" : "babel";
  try {
    return await prettier.format(code, {
      parser,
      plugins: [html.default ?? html, postcss.default ?? postcss, babel.default ?? babel, estree.default ?? estree] as never,
      printWidth: 80,
      tabWidth: 2,
    });
  } catch (e) {
    const first = String((e as Error).message || "").split("\n")[0].replace(/\s*\(\d+:\d+\)\s*$/, "");
    throw new Error(first || "There is a mistake in your code", { cause: e });
  }
};
