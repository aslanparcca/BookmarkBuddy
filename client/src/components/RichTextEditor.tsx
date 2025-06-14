import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const toolbarButtons = [
    { command: "bold", icon: "fas fa-bold", tooltip: "Kalın" },
    { command: "italic", icon: "fas fa-italic", tooltip: "İtalik" },
    { command: "underline", icon: "fas fa-underline", tooltip: "Altı Çizili" },
    { command: "separator" },
    { command: "formatBlock", value: "h2", icon: "fas fa-heading", tooltip: "Başlık" },
    { command: "insertUnorderedList", icon: "fas fa-list-ul", tooltip: "Madde Liste" },
    { command: "insertOrderedList", icon: "fas fa-list-ol", tooltip: "Numaralı Liste" },
    { command: "separator" },
    { command: "undo", icon: "fas fa-undo", tooltip: "Geri Al" },
    { command: "redo", icon: "fas fa-redo", tooltip: "İleri Al" },
  ];

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center space-x-2">
          {toolbarButtons.map((button, index) => (
            button.command === "separator" ? (
              <div key={index} className="w-px h-6 bg-slate-300 mx-2"></div>
            ) : (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => executeCommand(button.command, button.value)}
                className="p-2 hover:bg-slate-200"
                title={button.tooltip}
              >
                <i className={button.icon}></i>
              </Button>
            )
          ))}
        </div>
      </div>
      
      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="p-6 min-h-96 prose max-w-none focus:outline-none"
        style={{ minHeight: "400px" }}
        suppressContentEditableWarning={true}
      >
        {!content && (
          <p className="text-slate-400 italic">{placeholder}</p>
        )}
      </div>
    </div>
  );
}
