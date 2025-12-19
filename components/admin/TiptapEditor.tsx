"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import Placeholder from "@tiptap/extension-placeholder";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function TiptapEditor({
  content,
  onChange,
  placeholder = "Mulai menulis artikel Anda di sini...",
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Configure heading levels
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        // BulletList and OrderedList are included by default in StarterKit
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        // ListItem is required for lists
        listItem: {
          HTMLAttributes: {
            class: "ml-4",
          },
        },
        // Blockquote styling
        blockquote: {
          HTMLAttributes: {
            class: "border-l-4 border-gray-300 pl-4 italic",
          },
        },
        // Code block styling
        codeBlock: {
          HTMLAttributes: {
            class: "bg-gray-100 rounded p-4 font-mono text-sm",
          },
        },
        // Horizontal rule
        horizontalRule: {
          HTMLAttributes: {
            class: "my-4 border-t-2 border-gray-300",
          },
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: false, // Disable base64, use Cloudinary instead
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          class: "text-amber-600 underline hover:text-amber-700 cursor-pointer",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
        defaultAlignment: "left",
      }),
      TextStyle,
      Color.configure({
        types: ["textStyle"],
      }),
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: "highlight",
        },
      }),
      Typography,
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[300px] px-4 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return (
      <div className="border border-gray-300 rounded-lg p-4 text-center text-gray-500">
        Loading editor...
      </div>
    );
  }

  // Helper functions
  const addImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          alert("File terlalu besar. Maksimal 10MB.");
          return;
        }

        // Show loading placeholder
        const loadingId = `loading-${Date.now()}`;
        editor
          .chain()
          .focus()
          .insertContent(`<p id="${loadingId}">⏳ Uploading image...</p>`)
          .run();

        // Upload to Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "zari-honey/articles");

        const response = await fetch("/api/admin/cloudinary-upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();

        // Remove loading text and insert image
        const { state } = editor;
        const loadingNode = state.doc.textBetween(
          0,
          state.doc.content.size,
          "\n"
        );
        const loadingPos = loadingNode.indexOf("⏳ Uploading image...");

        if (loadingPos !== -1) {
          editor.commands.deleteRange({
            from: loadingPos,
            to: loadingPos + 22,
          });
        }

        // Insert the image
        editor
          .chain()
          .focus()
          .setImage({
            src: data.url,
            alt: file.name,
          })
          .run();
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Gagal upload gambar. Silakan coba lagi.");
      }
    };

    input.click();
  };

  const addLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Masukkan URL link:", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const setTextColor = () => {
    const color = window.prompt("Masukkan warna teks (hex code):", "#000000");
    if (color) {
      editor.chain().focus().setColor(color).run();
    }
  };

  const setHighlightColor = () => {
    const color = window.prompt(
      "Masukkan warna highlight (hex code):",
      "#FFFF00"
    );
    if (color) {
      editor.chain().focus().setHighlight({ color }).run();
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1 sticky top-0 z-10">
        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            editor.isActive("bold")
              ? "bg-amber-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            editor.isActive("italic")
              ? "bg-amber-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            editor.isActive("underline")
              ? "bg-amber-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          title="Underline (Ctrl+U)"
        >
          <u>U</u>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            editor.isActive("strike")
              ? "bg-amber-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          title="Strikethrough"
        >
          <s>S</s>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            editor.isActive("code")
              ? "bg-amber-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          title="Inline Code"
        >
          {"</>"}
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* Headings */}
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`px-3 py-1 text-sm rounded transition-colors ${
            editor.isActive("heading", { level: 1 })
              ? "bg-amber-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`px-3 py-1 text-sm rounded transition-colors ${
            editor.isActive("heading", { level: 2 })
              ? "bg-amber-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`px-3 py-1 text-sm rounded transition-colors ${
            editor.isActive("heading", { level: 3 })
              ? "bg-amber-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          title="Heading 3"
        >
          H3
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* Text Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            editor.isActive({ textAlign: "left" })
              ? "bg-amber-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          title="Align Left"
        >
          ⬅
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            editor.isActive({ textAlign: "center" })
              ? "bg-amber-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          title="Align Center"
        >
          ↔
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            editor.isActive({ textAlign: "right" })
              ? "bg-amber-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          title="Align Right"
        >
          ➡
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            editor.isActive({ textAlign: "justify" })
              ? "bg-amber-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          title="Justify"
        >
          ⬌
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            editor.isActive("bulletList")
              ? "bg-amber-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            editor.isActive("orderedList")
              ? "bg-amber-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          title="Numbered List"
        >
          1. List
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* Blockquote & Code Block */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            editor.isActive("blockquote")
              ? "bg-amber-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          title="Blockquote"
        >
          &quot;
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            editor.isActive("codeBlock")
              ? "bg-amber-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          title="Code Block"
        >
          {"{ }"}
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* Colors */}
        <button
          type="button"
          onClick={setTextColor}
          className="px-3 py-1 text-sm rounded bg-white text-gray-700 hover:bg-gray-100 transition-colors"
          title="Text Color"
        >
          🎨 Text
        </button>
        <button
          type="button"
          onClick={setHighlightColor}
          className="px-3 py-1 text-sm rounded bg-white text-gray-700 hover:bg-gray-100 transition-colors"
          title="Highlight Color"
        >
          🖍 Mark
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetHighlight().run()}
          className="px-2 py-1 text-xs rounded bg-white text-gray-700 hover:bg-gray-100 transition-colors"
          title="Remove Highlight"
        >
          ✕
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* Link & Image */}
        <button
          type="button"
          onClick={addLink}
          className="px-3 py-1 text-sm rounded bg-white text-gray-700 hover:bg-gray-100 transition-colors"
          title="Add/Edit Link"
        >
          🔗 Link
        </button>
        <button
          type="button"
          onClick={addImage}
          className="px-3 py-1 text-sm rounded bg-white text-gray-700 hover:bg-gray-100 transition-colors"
          title="Add Image"
        >
          🖼 Image
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* Horizontal Rule */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="px-3 py-1 text-sm rounded bg-white text-gray-700 hover:bg-gray-100 transition-colors"
          title="Horizontal Line"
        >
          ―
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* Undo/Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="px-3 py-1 text-sm rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Undo (Ctrl+Z)"
        >
          ↶
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="px-3 py-1 text-sm rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Redo (Ctrl+Y)"
        >
          ↷
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* Clear Formatting */}
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
          className="px-3 py-1 text-sm rounded bg-white text-gray-700 hover:bg-gray-100 transition-colors"
          title="Clear Formatting"
        >
          🧹 Clear
        </button>
      </div>

      {/* Editor Content */}
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
