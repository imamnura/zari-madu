import sanitizeHtml from "sanitize-html";

const COLOR_VALUE = [
  /^#[0-9a-f]{3,8}$/i,
  /^rgba?\(\s*[\d.\s,%]+\)$/i,
  /^hsla?\(\s*[\d.\s,%deg]+\)$/i,
  /^[a-z]+$/i,
];

/**
 * Allowlist mengikuti output TiptapEditor (StarterKit, Image, Link, Underline,
 * TextAlign, TextStyle + Color, Highlight multicolor). Tag/atribut lain dibuang.
 */
const RICH_TEXT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "hr",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "strong", "b", "em", "i", "u", "s", "mark", "span", "sub", "sup",
    "ul", "ol", "li",
    "blockquote", "pre", "code",
    "a", "img",
  ],
  allowedAttributes: {
    "*": ["class", "style"],
    a: ["href", "target", "rel", "title"],
    img: ["src", "alt", "title", "width", "height"],
    mark: ["data-color"],
    ol: ["start"],
  },
  allowedStyles: {
    "*": {
      color: COLOR_VALUE,
      "background-color": COLOR_VALUE,
      "text-align": [/^(left|right|center|justify)$/],
    },
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https"] },
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs:
        attribs.target === "_blank"
          ? { ...attribs, rel: "noopener noreferrer nofollow" }
          : attribs,
    }),
  },
};

/** Bersihkan HTML rich text (artikel, deskripsi produk) sebelum `dangerouslySetInnerHTML`. */
export function sanitizeRichHtml(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, RICH_TEXT_OPTIONS);
}
