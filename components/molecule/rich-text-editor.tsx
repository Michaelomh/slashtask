'use client';

import { cn } from '@/lib/utils';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useRef, useState } from 'react';
import { Markdown } from 'tiptap-markdown';

type RichTextEditorProps = {
  value: string;
  onChange: (markdown: string, plainText: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  className?: string;
};

export function RichTextEditor({
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder = 'Description',
  className,
}: RichTextEditorProps) {
  const lastMarkdown = useRef(value);
  const [isEditing, setEditing] = useState(false);

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
        class: `tiptap-content`,
      },
    },
    onFocus() {
      setEditing(true);
      onFocus?.();
    },
    onBlur() {
      setEditing(false);
      onBlur?.();
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
    <div
      className={cn(
        'flex flex-col border border-transparent',
        isEditing && 'border-border rounded-md px-2 py-2',
        !(isEditing || value.length > 0) && 'h-8',
        className
      )}
    >
      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
