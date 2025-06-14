import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface ModernHtmlEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: string;
}

interface ToolbarItem {
  command: string;
  icon: string;
  tooltip: string;
  onClick?: () => void;
  dropdown?: { label: string; value: string; }[];
  active?: boolean;
}

export default function ModernHtmlEditor({ 
  content, 
  onChange, 
  placeholder = "İçeriğinizi buraya yazın...",
  height = "400px"
}: ModernHtmlEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [sourceContent, setSourceContent] = useState(content);

  useEffect(() => {
    if (editorRef.current && !isSourceMode && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, [content, isSourceMode]);

  const handleInput = () => {
    if (editorRef.current && !isSourceMode) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertHtml = (html: string) => {
    if (editorRef.current) {
      document.execCommand('insertHTML', false, html);
      handleInput();
    }
  };

  const toggleSourceMode = () => {
    if (isSourceMode) {
      // Switch to visual mode
      if (editorRef.current) {
        editorRef.current.innerHTML = sourceContent;
        onChange(sourceContent);
      }
    } else {
      // Switch to source mode
      if (editorRef.current) {
        setSourceContent(editorRef.current.innerHTML);
      }
    }
    setIsSourceMode(!isSourceMode);
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSourceContent(e.target.value);
    onChange(e.target.value);
  };

  const toolbarGroups: { name: string; items: ToolbarItem[] }[] = [
    {
      name: "clipboard",
      items: [
        { command: "undo", icon: "fas fa-undo", tooltip: "Geri Al" },
        { command: "redo", icon: "fas fa-redo", tooltip: "İleri Al" },
      ]
    },
    {
      name: "basicstyles", 
      items: [
        { command: "bold", icon: "fas fa-bold", tooltip: "Kalın" },
        { command: "italic", icon: "fas fa-italic", tooltip: "İtalik" },
        { command: "underline", icon: "fas fa-underline", tooltip: "Altı Çizili" },
        { command: "strikeThrough", icon: "fas fa-strikethrough", tooltip: "Üstü Çizili" },
      ]
    },
    {
      name: "paragraph",
      items: [
        { command: "insertUnorderedList", icon: "fas fa-list-ul", tooltip: "Madde Liste" },
        { command: "insertOrderedList", icon: "fas fa-list-ol", tooltip: "Numaralı Liste" },
        { command: "outdent", icon: "fas fa-outdent", tooltip: "Girintıyi Azalt" },
        { command: "indent", icon: "fas fa-indent", tooltip: "Girintıyi Artır" },
      ]
    },
    {
      name: "links",
      items: [
        { 
          command: "createLink", 
          icon: "fas fa-link", 
          tooltip: "Bağlantı Ekle",
          onClick: () => {
            const url = prompt('Bağlantı URL\'sini girin:');
            if (url) executeCommand('createLink', url);
          }
        },
        { command: "unlink", icon: "fas fa-unlink", tooltip: "Bağlantıyı Kaldır" },
      ]
    },
    {
      name: "styles",
      items: [
        {
          command: "formatBlock",
          icon: "fas fa-heading",
          tooltip: "Başlık",
          dropdown: [
            { label: "Normal", value: "div" },
            { label: "Başlık 1", value: "h1" },
            { label: "Başlık 2", value: "h2" },
            { label: "Başlık 3", value: "h3" },
          ]
        },
      ]
    },
    {
      name: "alignment",
      items: [
        { command: "justifyLeft", icon: "fas fa-align-left", tooltip: "Sola Hizala" },
        { command: "justifyCenter", icon: "fas fa-align-center", tooltip: "Ortala" },
        { command: "justifyRight", icon: "fas fa-align-right", tooltip: "Sağa Hizala" },
      ]
    },
    {
      name: "tools",
      items: [
        {
          command: "source",
          icon: "fas fa-code",
          tooltip: isSourceMode ? "Görsel Mod" : "Kaynak Mod",
          onClick: toggleSourceMode,
          active: isSourceMode
        },
      ]
    }
  ];

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
        <div className="flex flex-wrap items-center gap-1">
          {toolbarGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="flex items-center">
              {group.items.map((item, itemIndex) => (
                <div key={itemIndex} className="relative">
                  {'dropdown' in item && item.dropdown ? (
                    <select
                      onChange={(e) => executeCommand(item.command, e.target.value)}
                      className="px-2 py-1 text-xs border border-slate-300 rounded bg-white hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      title={item.tooltip}
                    >
                      {item.dropdown.map((option: any, optIndex: number) => (
                        <option key={optIndex} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={`h-8 w-8 p-0 hover:bg-slate-200 ${'active' in item && item.active ? 'bg-slate-300' : ''}`}
                      onClick={() => 'onClick' in item && item.onClick ? item.onClick() : executeCommand(item.command)}
                      title={item.tooltip}
                    >
                      <i className={`${item.icon} text-xs`}></i>
                    </Button>
                  )}
                </div>
              ))}
              {groupIndex < toolbarGroups.length - 1 && (
                <div className="w-px h-6 bg-slate-300 mx-2"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative">
        {isSourceMode ? (
          <textarea
            value={sourceContent}
            onChange={handleSourceChange}
            className="w-full p-4 font-mono text-sm bg-slate-50 border-0 focus:outline-none resize-none"
            style={{ height, fontFamily: 'monospace' }}
            placeholder="HTML kaynak kodunu buraya yazın..."
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="w-full p-4 bg-white border-0 focus:outline-none overflow-auto"
            style={{ height, minHeight: height }}
            data-placeholder={placeholder}
            suppressContentEditableWarning={true}
          />
        )}
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 text-xs text-slate-600">
        <div className="flex justify-between items-center">
          <span>
            {isSourceMode ? 'Kaynak Modu' : 'Görsel Mod'} | 
            Kelime Sayısı: {content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length}
          </span>
          <span>
            HTML Editor v1.0
          </span>
        </div>
      </div>

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          font-style: italic;
        }
        
        [contenteditable] h1 { font-size: 2em; font-weight: bold; margin: 0.67em 0; }
        [contenteditable] h2 { font-size: 1.5em; font-weight: bold; margin: 0.75em 0; }
        [contenteditable] h3 { font-size: 1.17em; font-weight: bold; margin: 0.83em 0; }
        [contenteditable] h4 { font-size: 1em; font-weight: bold; margin: 1.12em 0; }
        [contenteditable] h5 { font-size: 0.83em; font-weight: bold; margin: 1.5em 0; }
        [contenteditable] h6 { font-size: 0.75em; font-weight: bold; margin: 1.67em 0; }
        [contenteditable] p { margin: 1em 0; }
        [contenteditable] ul, [contenteditable] ol { margin: 1em 0; padding-left: 2em; }
        [contenteditable] li { margin: 0.5em 0; }
        [contenteditable] table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        [contenteditable] td, [contenteditable] th { border: 1px solid #ddd; padding: 8px; }
        [contenteditable] blockquote { margin: 1em 0; padding-left: 1em; border-left: 3px solid #ccc; }
        [contenteditable] img { max-width: 100%; height: auto; }
        [contenteditable] a { color: #3b82f6; text-decoration: underline; }
      `}</style>
    </div>
  );
}