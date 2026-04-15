'use client';

import { cn } from '@/lib/utils';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Markdown } from 'tiptap-markdown';

interface RichTextEditorProps {
  value: string;
  onChange: (markdown: string, plainText: string) => void;
  placeholder?: string;
  className?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}

function ToolbarButton({ onClick, active, children, title }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault(); // keep editor focus
        onClick();
      }}
      className={cn(
        'flex h-6 w-6 items-center justify-center rounded transition-colors',
        active
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Description',
  className,
}: RichTextEditorProps) {
  const lastMarkdown = useRef(value);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Markdown.configure({
        transformPastedText: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'tiptap-content',
      },
    },
    onUpdate({ editor }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const markdown = (editor.storage as any).markdown.getMarkdown();
      const plainText = editor.getText();
      lastMarkdown.current = markdown;
      onChange(markdown, plainText);
    },
  });

  // Sync external value changes (e.g. loading from DB) without looping
  useEffect(() => {
    if (!editor || value === lastMarkdown.current) return;
    lastMarkdown.current = value;
    editor.commands.setContent(value);
  }, [value, editor]);

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Toolbar */}
      <div className="mb-1 flex items-center gap-0.5">
        <ToolbarButton
          title="Bold"
          active={editor?.isActive('bold')}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold className="size-3.5" />
        </ToolbarButton>

        <ToolbarButton
          title="Italic"
          active={editor?.isActive('italic')}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-3.5" />
        </ToolbarButton>

        <div className="bg-border mx-1 h-4 w-px" />

        <ToolbarButton
          title="Heading 1"
          active={editor?.isActive('heading', { level: 1 })}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="size-3.5" />
        </ToolbarButton>

        <ToolbarButton
          title="Heading 2"
          active={editor?.isActive('heading', { level: 2 })}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="size-3.5" />
        </ToolbarButton>

        <ToolbarButton
          title="Heading 3"
          active={editor?.isActive('heading', { level: 3 })}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="size-3.5" />
        </ToolbarButton>

        <div className="bg-border mx-1 h-4 w-px" />

        <ToolbarButton
          title="Bullet list"
          active={editor?.isActive('bulletList')}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List className="size-3.5" />
        </ToolbarButton>

        <ToolbarButton
          title="Ordered list"
          active={editor?.isActive('orderedList')}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-3.5" />
        </ToolbarButton>

        <div className="bg-border mx-1 h-4 w-px" />

        <ToolbarButton
          title="Inline code"
          active={editor?.isActive('code')}
          onClick={() => editor?.chain().focus().toggleCode().run()}
        >
          <Code className="size-3.5" />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
