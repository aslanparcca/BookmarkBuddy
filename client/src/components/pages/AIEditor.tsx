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
      <div className="space-y-6">
        {/* Article Titles Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-10 w-10 bg-primary-100 text-primary-600 flex items-center justify-center rounded-lg">
              <i className="fas fa-heading"></i>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Makale Başlıkları</h3>
          </div>
          
          <div className="space-y-3">
            {titles.map((title, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Input
                  type="text"
                  placeholder={index === 0 ? "Ana başlık girin..." : "Başlık girin..."}
                  value={title}
                  onChange={(e) => updateTitle(index, e.target.value)}
                  className="flex-1"
                />
                {titles.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTitle(index)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          <Button
            variant="ghost"
            onClick={addTitle}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            <i className="fas fa-plus mr-2"></i>
            Yeni Başlık Ekle
          </Button>
        </div>

        {/* Focus Keywords Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-10 w-10 bg-blue-100 text-blue-600 flex items-center justify-center rounded-lg">
              <i className="fas fa-key"></i>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Odak Anahtar Kelimeler</h3>
          </div>
          
          <div className="space-y-3">
            {focusKeywords.map((keyword, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Input
                  type="text"
                  placeholder="Odak anahtar kelime..."
                  value={keyword}
                  onChange={(e) => updateFocusKeyword(index, e.target.value)}
                  className="flex-1"
                />
                {focusKeywords.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFocusKeyword(index)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          <Button
            variant="ghost"
            onClick={addFocusKeyword}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            <i className="fas fa-plus mr-2"></i>
            Yeni Anahtar Kelime Ekle
          </Button>
        </div>

        {/* Bulk Upload Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-10 w-10 bg-green-100 text-green-600 flex items-center justify-center rounded-lg">
              <i className="fas fa-upload"></i>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Toplu Makale Yükleme</h3>
          </div>
          
          <div className="mb-4">
            <Label className="text-sm text-slate-600">Excel dosyası yükleyerek toplu makale oluşturun</Label>
          </div>
          
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
              className="hidden"
              id="excel-upload"
            />
            <label htmlFor="excel-upload" className="cursor-pointer">
              <div className="text-slate-400 mb-2">
                <i className="fas fa-file-excel text-3xl"></i>
              </div>
              <p className="text-sm text-slate-600">Excel dosyası seçin veya buraya sürükleyin</p>
              <p className="text-xs text-slate-400 mt-1">Desteklenen formatlar: .xlsx, .xls</p>
            </label>
          </div>
          
          {bulkArticles.length > 0 && (
            <>
              <div className="mt-4">
                <p className="text-sm text-green-600 mb-2">
                  <i className="fas fa-check mr-2"></i>
                  {bulkArticles.length} makale başlığı yüklendi
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {bulkArticles.slice(0, 5).map((article, index) => (
                    <div key={index} className="text-xs text-slate-500 truncate">
                      • {article.title}
                    </div>
                  ))}
                  {bulkArticles.length > 5 && (
                    <div className="text-xs text-slate-400">ve {bulkArticles.length - 5} makale daha...</div>
                  )}
                </div>
              </div>
              <Button
                onClick={() => {
                  if (bulkArticles.length > 0) {
                    const formData = new FormData();
                    formData.append('articles', JSON.stringify(bulkArticles));
                    formData.append('settings', JSON.stringify(settings));
                    
                    fetch('/api/bulk-generate', {
                      method: 'POST',
                      body: formData,
                    }).then(response => response.json())
                      .then(data => {
                        toast({
                          title: "Toplu Makale Üretimi Başlatıldı!",
                          description: data.totalArticles + " makale oluşturuluyor.",
                        });
                      });
                  }
                }}
                disabled={bulkArticles.length === 0 || bulkUploadMutation.isPending}
                className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <i className="fas fa-magic mr-2"></i>
                Toplu Makale Oluştur ({bulkArticles.length})
              </Button>
            </>
          )}
        </div>

        {/* General Settings Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Genel Ayarlar</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Yazı Türü</Label>
              <Select value={settings.articleType} onValueChange={(value) => setSettings({...settings, articleType: value})}>
                <SelectTrigger>
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
              <Label>Anlatım Tarzı</Label>
              <Select value={settings.tone} onValueChange={(value) => setSettings({...settings, tone: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Profesyonel">Profesyonel</SelectItem>
                  <SelectItem value="Samimi">Samimi</SelectItem>
                  <SelectItem value="Eğitici">Eğitici</SelectItem>
                  <SelectItem value="Satış Odaklı">Satış Odaklı</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Kelime Sayısı</Label>
              <Select value={settings.wordCount} onValueChange={(value) => setSettings({...settings, wordCount: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="500-800 kelime">500-800 kelime</SelectItem>
                  <SelectItem value="800-1200 kelime">800-1200 kelime</SelectItem>
                  <SelectItem value="1200-1500 kelime">1200-1500 kelime</SelectItem>
                  <SelectItem value="1500+ kelime">1500+ kelime</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Hedef Kitle</Label>
              <Select value={settings.targetAudience} onValueChange={(value) => setSettings({...settings, targetAudience: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Genel">Genel</SelectItem>
                  <SelectItem value="Profesyoneller">Profesyoneller</SelectItem>
                  <SelectItem value="Yeni Başlayanlar">Yeni Başlayanlar</SelectItem>
                  <SelectItem value="Uzmanlar">Uzmanlar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Content Features Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-10 w-10 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded-lg">
              <i className="fas fa-magic"></i>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">İçerik Özellikleri</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'includeIntro', label: 'Giriş Paragrafı' },
              { key: 'includeFaq', label: 'FAQ Bölümü' },
              { key: 'includeConclusion', label: 'Sonuç Bölümü' },
              { key: 'includeMetaDescription', label: 'Meta Açıklama' },
              { key: 'includeSubheadings', label: 'Alt Başlıklar' },
              { key: 'includeInternalLinks', label: 'İç Bağlantılar' },
            ].map((feature) => (
              <label key={feature.key} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                <Checkbox
                  checked={settings[feature.key as keyof typeof settings] as boolean}
                  onCheckedChange={(checked) => setSettings({...settings, [feature.key]: checked})}
                />
                <span className="text-sm font-medium text-slate-700">{feature.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="w-full bg-primary-600 text-white py-4 rounded-xl font-semibold hover:bg-primary-700 shadow-lg"
        >
          {generateMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              İçerik Oluşturuluyor...
            </>
          ) : (
            <>
              <i className="fas fa-magic mr-2"></i>
              İçerik Oluştur
            </>
          )}
        </Button>
      </div>

      {/* Editor Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Oluşturulan İçerik</h3>
          <p className="text-slate-500 text-sm mt-1">AI tarafından oluşturulan makalenizi düzenleyebilirsiniz</p>
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
