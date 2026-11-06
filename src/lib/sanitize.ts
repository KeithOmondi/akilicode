import DOMPurify from "dompurify";

/**
 * Lesson notes, assignments and blog posts are HTML (or Markdown turned into HTML) written by
 * admins. A page that renders them with dangerouslySetInnerHTML would run any <script>, onerror=…
 * or javascript: link hidden in that text — in a CHILD's or PARENT's logged-in browser.
 * Always pass such HTML through sanitizeHtml() first.
 */
const ALLOWED_TAGS = [
  "a", "b", "i", "em", "strong", "u", "s", "p", "br", "hr", "span", "div", "blockquote", "pre", "code",
  "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "table", "thead", "tbody", "tr", "th", "td",
  "img", "figure", "figcaption", "sup", "sub", "mark", "details", "summary",
];
const ALLOWED_ATTR = ["href", "title", "alt", "src", "class", "id", "colspan", "rowspan", "width", "height", "target", "rel"];

let hooked = false;
const ensureHook = () => {
  if (hooked) return;
  hooked = true;
  // Links that leave the site open in a new tab and cannot reach back into this page.
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A") {
      node.setAttribute("rel", "noopener noreferrer nofollow");
      if (node.getAttribute("href")?.startsWith("http")) node.setAttribute("target", "_blank");
    }
  });
};

export const sanitizeHtml = (html: string | null | undefined): string => {
  ensureHook();
  return DOMPurify.sanitize(html ?? "", {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|\/|#)/i, // no javascript:, data:, vbscript:
    FORBID_TAGS: ["style", "script", "iframe", "object", "embed", "form", "input", "button", "svg", "math"],
  });
};
