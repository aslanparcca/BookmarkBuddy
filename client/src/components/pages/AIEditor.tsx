import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import RichTextEditor from "@/components/RichTextEditor";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AIEditorProps {
  setLoading: (loading: boolean) => void;
}

export default function AIEditor({ setLoading }: AIEditorProps) {
  const [titles, setTitles] = useState<string[]>(['']);
  const [focusKeywords, setFocusKeywords] = useState<string[]>(['']);
  const [settings, setSettings] = useState({
    articleType: 'Blog Yazısı',
    tone: 'Profesyonel',
    wordCount: '800-1200 kelime',
    targetAudience: 'Genel',
    includeIntro: true,
    includeFaq: false,
    includeConclusion: true,
    includeMetaDescription: false,
    includeSubheadings: false,
    includeInternalLinks: false,
  });
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [bulkArticles, setBulkArticles] = useState<any[]>([]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: async () => {
      const validTitles = titles.filter(title => title.trim() !== '');
      if (validTitles.length === 0) {
        throw new Error('En az bir başlık girmelisiniz');
      }

      const validKeywords = focusKeywords.filter(keyword => keyword.trim() !== '');
      const response = await apiRequest('POST', '/api/generate-content', {
        titles: validTitles,
        settings,
        focusKeywords: validKeywords,
      });
      return await response.json();
    },
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (data) => {
      setContent(data.content);
      setWordCount(data.wordCount);
      setReadingTime(data.readingTime);
      toast({
        title: "İçerik Oluşturuldu!",
        description: "Yeni makale başarıyla oluşturuldu.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "İçerik oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const saveArticleMutation = useMutation({
    mutationFn: async () => {
      const validTitles = titles.filter(title => title.trim() !== '');
      const response = await apiRequest('POST', '/api/articles', {
        title: validTitles[0] || 'Başlıksız Makale',
        content,
        htmlContent: content,
        wordCount,
        readingTime,
        status: 'draft',
        aiSettings: settings,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      toast({
        title: "Makale Kaydedildi!",
        description: "Makale başarıyla kaydedildi.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Makale kaydedilirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const addTitle = () => {
    setTitles([...titles, '']);
  };

  const updateTitle = (index: number, value: string) => {
    const newTitles = [...titles];
    newTitles[index] = value;
    setTitles(newTitles);
  };

  const removeTitle = (index: number) => {
    if (titles.length > 1) {
      setTitles(titles.filter((_, i) => i !== index));
    }
  };

  const addFocusKeyword = () => {
    setFocusKeywords([...focusKeywords, '']);
  };

  const updateFocusKeyword = (index: number, value: string) => {
    const newKeywords = [...focusKeywords];
    newKeywords[index] = value;
    setFocusKeywords(newKeywords);
  };

  const removeFocusKeyword = (index: number) => {
    if (focusKeywords.length > 1) {
      setFocusKeywords(focusKeywords.filter((_, i) => i !== index));
    }
  };

  const bulkUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('excelFile', file);
      
      const response = await fetch('/api/bulk-upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Dosya yüklenirken hata oluştu');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.articles) {
        setBulkArticles(data.articles);
        toast({
          title: "Excel Dosyası Yüklendi!",
          description: `${data.articles.length} makale başlığı bulundu.`,
        });
      } else {
        toast({
          title: "Toplu İş Başlatıldı!",
          description: `${data.totalArticles} makale oluşturma işlemi başlatıldı.`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Dosya yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (file: File) => {
    bulkUploadMutation.mutate(file);
  };

  const copyContent = () => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Kopyalandı!",
      description: "İçerik panoya kopyalandı.",
    });
  };

  const exportContent = () => {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'makale.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {/* Settings Panel */}
      <div className="space-y-4">
        {/* Article Titles Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="h-6 w-6 bg-blue-500 text-white flex items-center justify-center rounded text-xs font-semibold">
              H
            </div>
            <h3 className="text-base font-medium text-slate-800">Makale Başlıkları</h3>
          </div>
          
          <div className="space-y-2">
            {titles.map((title, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-sm text-slate-500 w-6">{index + 1}.</span>
                <Input
                  type="text"
                  placeholder="Lütfen bir başlık yazınız..."
                  value={title}
                  onChange={(e) => updateTitle(index, e.target.value)}
                  className="flex-1 text-sm"
                />
                <Input
                  type="text"
                  placeholder="Odak anahtar kelime..."
                  value={focusKeywords[index] || ''}
                  onChange={(e) => updateFocusKeyword(index, e.target.value)}
                  className="flex-1 text-sm"
                />
                {titles.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTitle(index)}
                    className="text-slate-400 hover:text-red-500 h-8 w-8 p-0"
                  >
                    <i className="fas fa-times text-xs"></i>
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          <Button
            variant="ghost"
            onClick={addTitle}
            className="mt-3 text-blue-600 hover:text-blue-700 text-sm h-8"
          >
            + Yeni Başlık Ekle
          </Button>
        </div>





        {/* General Settings Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-base font-medium text-slate-800 mb-4">Genel Ayarlar</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm text-slate-600">Yazı Türü</Label>
              <Select value={settings.articleType} onValueChange={(value) => setSettings({...settings, articleType: value})}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Blog Yazısı">Blog Yazısı</SelectItem>
                  <SelectItem value="Haber Makalesi">Haber Makalesi</SelectItem>
                  <SelectItem value="Rehber İçerik">Rehber İçerik</SelectItem>
                  <SelectItem value="Ürün İncelemesi">Ürün İncelemesi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm text-slate-600">Anlatım Şekli</Label>
              <Select value={settings.tone} onValueChange={(value) => setSettings({...settings, tone: value})}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2. Tekil Şahıs">2. Tekil Şahıs</SelectItem>
                  <SelectItem value="1. Çoğul Şahıs">1. Çoğul Şahıs</SelectItem>
                  <SelectItem value="Genel">Genel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm text-slate-600">Anlatım Türü</Label>
              <Select value={settings.wordCount} onValueChange={(value) => setSettings({...settings, wordCount: value})}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Örnek">Örnek</SelectItem>
                  <SelectItem value="Memnuel">Memnuel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm text-slate-600">Alt Başlık Türü</Label>
              <Select value={settings.targetAudience} onValueChange={(value) => setSettings({...settings, targetAudience: value})}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="H2">H2</SelectItem>
                  <SelectItem value="H3">H3</SelectItem>
                  <SelectItem value="H4">H4</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Content Features Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="h-6 w-6 bg-purple-500 text-white flex items-center justify-center rounded text-xs font-semibold">
              <i className="fas fa-magic text-xs"></i>
            </div>
            <h3 className="text-base font-medium text-slate-800">İçerik Özellikleri</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'includeIntro', label: 'SSS Eklensin' },
              { key: 'includeFaq', label: 'Makale Özetli' },
              { key: 'includeConclusion', label: 'Aile Yazısı' },
              { key: 'includeMetaDescription', label: 'Meta Açıklama' },
              { key: 'includeSubheadings', label: 'Tablo' },
              { key: 'includeInternalLinks', label: 'Liste' },
            ].map((feature) => (
              <label key={feature.key} className="flex items-center space-x-2 text-xs cursor-pointer">
                <Checkbox
                  checked={settings[feature.key as keyof typeof settings] as boolean}
                  onCheckedChange={(checked) => setSettings({...settings, [feature.key]: checked})}
                  className="h-4 w-4"
                />
                <span className="text-slate-700">{feature.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* İç & Dış Linkler Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="h-6 w-6 bg-blue-500 text-white flex items-center justify-center rounded text-xs font-semibold">
              <i className="fas fa-link text-xs"></i>
            </div>
            <h3 className="text-base font-medium text-slate-800">İç & Dış Linkler</h3>
          </div>
          
          <div className="space-y-2">
            <div>
              <Label className="text-sm text-slate-600">İç Linkler</Label>
              <Select value="Yok" onValueChange={() => {}}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yok">Yok</SelectItem>
                  <SelectItem value="Örnekli">Örnekli</SelectItem>
                  <SelectItem value="Manuel">Manuel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 text-sm"
        >
          {generateMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Makale Oluştur
            </>
          ) : (
            <>
              Makale Oluştur
            </>
          )}
        </Button>
      </div>

      {/* Editor Panel */}
      <div className="bg-white rounded-lg border border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-base font-medium text-slate-800">Oluşturulan İçerik</h3>
          <p className="text-slate-500 text-sm mt-1">Yapay zeka tarafından oluşturulan makalenizi burada görüntüleyebilirsiniz</p>
        </div>
        
        <div className="flex-1">
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Yapay zeka tarafından oluşturulan makaleniz burada görünecek..."
          />
        </div>
        
        {/* Editor Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center space-x-4 text-sm text-slate-500">
            <span>{wordCount} kelime</span>
            <span>{content.length} karakter</span>
            <span>{readingTime} dk okuma</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={exportContent}>
              <i className="fas fa-download mr-2"></i>
              Dışa Aktar
            </Button>
            <Button onClick={copyContent}>
              <i className="fas fa-copy mr-2"></i>
              Kopyala
            </Button>
            <Button 
              onClick={() => saveArticleMutation.mutate()}
              disabled={saveArticleMutation.isPending || !content}
              className="bg-primary-600 hover:bg-primary-700"
            >
              {saveArticleMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <i className="fas fa-save mr-2"></i>
              )}
              Kaydet
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
