import type { Editor } from "@tiptap/react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useCallback, useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bold,
  Code,
  CornerDownLeft,
  Eraser,
  Italic,
  List,
  ListOrdered,
  Pilcrow,
  Redo2,
  Undo2,
} from "lucide-react";

const extensions = [StarterKit];

const toolbarButtonBase =
  "flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition-colors duration-150";

const getToolbarButtonClasses = (options: {
  active?: boolean;
  disabled?: boolean;
}) => {
  if (options.disabled) {
    return `${toolbarButtonBase} border-[#E0E1E6] text-[#C7C7CC] opacity-50 cursor-not-allowed`;
  }

  if (options.active) {
    return `${toolbarButtonBase} border-[#5850DE] bg-[#E8E6FC] text-[#5850DE]`;
  }

  return `${toolbarButtonBase} border-[#E0E1E6] text-[#60646C] hover:border-[#5850DE] hover:text-[#5850DE]`;
};

interface ToolbarButtonProps {
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  active?: boolean;
  disabled?: boolean;
}

const ToolbarButton = ({
  onClick,
  icon: Icon,
  label,
  active,
  disabled,
}: ToolbarButtonProps) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onClick={onClick}
    disabled={disabled}
    className={getToolbarButtonClasses({ active, disabled })}
  >
    <Icon className="h-4 w-4" />
    <span className="sr-only">{label}</span>
  </button>
);

function MenuBar({ editor }: { editor: Editor }) {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      isBold: ctx.editor.isActive("bold") ?? false,
      canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
      isItalic: ctx.editor.isActive("italic") ?? false,
      canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
      isCode: ctx.editor.isActive("code") ?? false,
      canCode: ctx.editor.can().chain().toggleCode().run() ?? false,
      canClearMarks: ctx.editor.can().chain().unsetAllMarks().run() ?? false,
      isParagraph: ctx.editor.isActive("paragraph") ?? false,
      isBulletList: ctx.editor.isActive("bulletList") ?? false,
      isOrderedList: ctx.editor.isActive("orderedList") ?? false,
      canUndo: ctx.editor.can().chain().undo().run() ?? false,
      canParagraph: ctx.editor.can().chain().setParagraph().run() ?? false,
      canBulletList: ctx.editor.can().chain().toggleBulletList().run() ?? false,
      canOrderedList:
        ctx.editor.can().chain().toggleOrderedList().run() ?? false,
      canHardBreak: ctx.editor.can().chain().setHardBreak().run() ?? false,
      canRedo: ctx.editor.can().chain().redo().run() ?? false,
    }),
  });

  return (
    <div className="bg-[#F8F9FB] rounded-t-xl border border-[#E0E1E6] border-b-0">
      <div className="px-4 py-3 text-sm flex flex-wrap items-center gap-2">
        <ToolbarButton
          label="Bold"
          icon={Bold}
          active={editorState.isBold}
          disabled={!editorState.canBold}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="Italic"
          icon={Italic}
          active={editorState.isItalic}
          disabled={!editorState.canItalic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label="Inline code"
          icon={Code}
          active={editorState.isCode}
          disabled={!editorState.canCode}
          onClick={() => editor.chain().focus().toggleCode().run()}
        />
        <ToolbarButton
          label="Clear formatting"
          icon={Eraser}
          disabled={!editorState.canClearMarks}
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
        />
        <ToolbarButton
          label="Paragraph"
          icon={Pilcrow}
          active={editorState.isParagraph}
          disabled={!editorState.canParagraph}
          onClick={() => editor.chain().focus().setParagraph().run()}
        />
        <ToolbarButton
          label="Bullet list"
          icon={List}
          active={editorState.isBulletList}
          disabled={!editorState.canBulletList}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label="Ordered list"
          icon={ListOrdered}
          active={editorState.isOrderedList}
          disabled={!editorState.canOrderedList}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          label="Hard break"
          icon={CornerDownLeft}
          disabled={!editorState.canHardBreak}
          onClick={() => editor.chain().focus().setHardBreak().run()}
        />
        <ToolbarButton
          label="Undo"
          icon={Undo2}
          disabled={!editorState.canUndo}
          onClick={() => editor.chain().focus().undo().run()}
        />
        <ToolbarButton
          label="Redo"
          icon={Redo2}
          disabled={!editorState.canRedo}
          onClick={() => editor.chain().focus().redo().run()}
        />
      </div>
    </div>
  );
}

interface TiptapProps {
  value: string;
  onChange: (content: string) => void;
  onBlur?: () => void;
  editable?: boolean;
  helperText?: string;
  placeholder?: string;
}

const TiptapEditor: React.FC<TiptapProps> = ({
  value,
  onChange,
  onBlur,
  editable = true,
  helperText,
  placeholder = "Write your content here...",
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const editor = useEditor({
    extensions,
    content: value || null,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  useEffect(() => {
    if (!editor) return;

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => {
      setIsFocused(false);
      onBlur?.();
    };

    editor.on("focus", handleFocus);
    editor.on("blur", handleBlur);

    return () => {
      editor.off("focus", handleFocus);
      editor.off("blur", handleBlur);
    };
  }, [editor, onBlur]);

  const handleEditorWrapperMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!editor) return;

      const target = event.target as HTMLElement;
      const clickedInsideEditor = Boolean(target.closest(".ProseMirror"));

      if (!clickedInsideEditor) {
        event.preventDefault();
      }

      editor.chain().focus().run();
    },
    [editor],
  );

  if (!editor) return null;

  const isEditorEmpty = editor.isEmpty;

  return (
    <div>
      {helperText ? (
        <p className="text-[#8E8E93] mb-2 text-xs font-medium">{helperText}</p>
      ) : null}
      <MenuBar editor={editor} />
      <div
        className={`relative rounded-b-xl border transition-colors bg-white cursor-text ${
          isFocused ? "border-[#5850DE]" : "border-[#E0E1E6]"
        }`}
        onMouseDown={handleEditorWrapperMouseDown}
      >
        {isEditorEmpty ? (
          <p className="pointer-events-none absolute left-4 top-4 text-sm text-[#8E8E93]">
            {placeholder}
          </p>
        ) : null}
        <EditorContent
          editor={editor}
          className="rich-text px-4 py-4 text-sm text-[#1B173A] min-h-[180px] focus:outline-none w-full"
        />
      </div>
    </div>
  );
};

export default TiptapEditor;
