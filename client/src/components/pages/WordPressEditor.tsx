import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/RichTextEditor";

interface WordPressEditorProps {
  setLoading: (loading: boolean) => void;
}

export default function WordPressEditor({ setLoading }: WordPressEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div>
            <Label htmlFor="wp-title">Makale Başlığı</Label>
            <Input
              id="wp-title"
              type="text"
              placeholder="Makale başlığını buraya girin..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label>Makale</Label>
            <div className="mt-1 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="WordPress makalenizi buraya yazın..."
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">WordPress Ayarları</h3>
          <p className="text-slate-500 text-sm">WordPress entegrasyonu için ayarlar sayfasından yapılandırma yapmanız gerekmektedir.</p>
        </div>
      </div>
    </div>
  );
}
