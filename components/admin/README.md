# Admin Components

## TiptapEditor

Rich text editor component based on Tiptap, configured for article content creation.

### Features

**Text Formatting:**

- Bold, Italic, Underline, Strikethrough
- Inline Code
- Text Color & Highlighting

**Structure:**

- Headings (H1-H6)
- Paragraphs with text alignment (left, center, right, justify)
- Bullet Lists & Ordered Lists
- Blockquotes
- Code Blocks
- Horizontal Rules

**Media:**

- Images (URL or base64)
- Links with auto-detection

**Utilities:**

- Undo/Redo
- Clear Formatting
- Typography enhancement for better paste handling

### Configuration

The editor is configured according to Tiptap documentation:

#### StarterKit Extensions

- **Heading**: Levels 1-6 configured
- **BulletList**: `keepMarks: true, keepAttributes: false`
- **OrderedList**: `keepMarks: true, keepAttributes: false`
- **ListItem**: Custom HTML attributes with left margin
- **Blockquote**: Custom styling with border and padding
- **CodeBlock**: Background and font styling
- **HorizontalRule**: Custom border styling

#### Additional Extensions

- **Image**: Inline support, base64 allowed, responsive styling
- **Link**: Auto-link enabled, opens in new tab, HTTPS default
- **TextAlign**: Supports heading & paragraph alignment
- **Color**: Text color support via TextStyle
- **Highlight**: Multi-color highlighting
- **Typography**: Improves paste formatting from external sources
- **Placeholder**: Shows hint text when editor is empty

### Usage

```tsx
import TiptapEditor from "@/components/admin/TiptapEditor";

function MyComponent() {
  const [content, setContent] = useState("");

  return (
    <TiptapEditor
      content={content}
      onChange={(html) => setContent(html)}
      placeholder="Start writing..."
    />
  );
}
```

### Props

| Prop          | Type                     | Default                                 | Description                   |
| ------------- | ------------------------ | --------------------------------------- | ----------------------------- |
| `content`     | `string`                 | -                                       | Initial HTML content          |
| `onChange`    | `(html: string) => void` | -                                       | Callback when content changes |
| `placeholder` | `string`                 | "Mulai menulis artikel Anda di sini..." | Placeholder text              |

### Commands

All toolbar buttons use Tiptap's chain commands API for optimal performance:

```tsx
// Example: Toggle bold
editor.chain().focus().toggleBold().run();

// Example: Set text alignment
editor.chain().focus().setTextAlign("center").run();

// Example: Clear formatting
editor.chain().focus().clearNodes().unsetAllMarks().run();
```

### Keyboard Shortcuts

- **Ctrl+B**: Bold
- **Ctrl+I**: Italic
- **Ctrl+U**: Underline
- **Ctrl+Z**: Undo
- **Ctrl+Y / Ctrl+Shift+Z**: Redo

### Styling

The editor uses Tailwind CSS with prose styling for optimal typography. All toolbar buttons have hover states and active states (amber background when active).

### SSR Configuration

The editor includes `immediatelyRender: false` to prevent hydration mismatches in Next.js.
