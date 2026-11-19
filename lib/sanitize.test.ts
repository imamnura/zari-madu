import { describe, it, expect } from "vitest";
import { sanitizeRichHtml } from "./sanitize";

describe("sanitizeRichHtml", () => {
  it("returns an empty string for empty input", () => {
    expect(sanitizeRichHtml(null)).toBe("");
    expect(sanitizeRichHtml(undefined)).toBe("");
    expect(sanitizeRichHtml("")).toBe("");
  });

  it("removes script tags and their content", () => {
    const out = sanitizeRichHtml('<p>Madu</p><script>alert("xss")</script>');
    expect(out).toBe("<p>Madu</p>");
  });

  it("removes inline event handlers", () => {
    const out = sanitizeRichHtml('<img src="https://res.cloudinary.com/x.jpg" onerror="alert(1)">');
    expect(out).not.toContain("onerror");
    expect(out).toContain('src="https://res.cloudinary.com/x.jpg"');
  });

  it("removes javascript: and data: URLs", () => {
    expect(sanitizeRichHtml('<a href="javascript:alert(1)">x</a>')).not.toContain("javascript:");
    expect(sanitizeRichHtml('<img src="data:image/svg+xml;base64,PHN2Zz4=">')).not.toContain("data:");
  });

  it("removes iframes, forms and style tags", () => {
    const out = sanitizeRichHtml(
      '<iframe src="https://evil.example"></iframe><form><input></form><style>body{}</style><p>ok</p>',
    );
    expect(out).toBe("<p>ok</p>");
  });

  it("drops dangerous CSS but keeps Tiptap color and alignment", () => {
    const out = sanitizeRichHtml(
      '<p style="text-align: center; position: fixed"><span style="color: #a06f12; background-image: url(x)">Madu</span></p>',
    );
    expect(out).toContain("text-align:center");
    expect(out).toContain("color:#a06f12");
    expect(out).not.toContain("position");
    expect(out).not.toContain("background-image");
  });

  it("keeps the formatting Tiptap produces", () => {
    const html =
      '<h2>Manfaat</h2><p><strong>Kuat</strong> <em>alami</em> <u>murni</u> <s>gula</s></p>' +
      '<ul class="list-disc pl-6 my-2"><li class="my-1 pl-1">Satu</li></ul>' +
      '<blockquote class="border-l-4">Kutipan</blockquote>' +
      '<mark data-color="#fef08a" style="background-color: #fef08a">sorot</mark>';
    const out = sanitizeRichHtml(html);
    expect(out).toContain("<h2>Manfaat</h2>");
    expect(out).toContain("<strong>Kuat</strong>");
    expect(out).toContain('<ul class="list-disc pl-6 my-2">');
    expect(out).toContain('data-color="#fef08a"');
    expect(out).toContain("<blockquote");
  });

  it("forces safe rel on links that open a new tab", () => {
    const out = sanitizeRichHtml('<a href="https://zarihoney.com" target="_blank">Toko</a>');
    expect(out).toContain('rel="noopener noreferrer nofollow"');
    expect(out).toContain('href="https://zarihoney.com"');
  });
});
