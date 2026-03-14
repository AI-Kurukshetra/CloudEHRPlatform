import sanitizeHtml from "sanitize-html";

const allowedTags = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "ul",
  "ol",
  "li",
  "blockquote",
  "h2",
  "h3",
  "a"
];

export function sanitizeRichText(html: string) {
  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes: {
      a: ["href", "target", "rel"]
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
        target: "_blank"
      })
    }
  }).trim();
}

export function plainTextFromRichText(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {}
  }).trim();
}

