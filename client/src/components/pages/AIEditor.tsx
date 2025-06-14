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





        {/* Genel Ayarlar Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="h-6 w-6 bg-purple-500 text-white flex items-center justify-center rounded text-xs">
              <i className="fas fa-cog text-xs"></i>
            </div>
            <h3 className="text-base font-medium text-slate-800">Genel Ayarlar</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-sm text-slate-600">Yapay Zeka Modeli</Label>
              <Select value="Gemini 2.0 Flash" onValueChange={() => {}}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gemini 2.0 Flash">Gemini 2.0 Flash</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-blue-600 mt-1">
                1 kelime: 1 kredi
              </div>
            </div>
            
            <div>
              <Label className="text-sm text-slate-600">Bölüm Uzunluğu</Label>
              <Select value="Çok Uzun" onValueChange={() => {}}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kısa">Kısa</SelectItem>
                  <SelectItem value="Orta">Orta</SelectItem>
                  <SelectItem value="Uzun">Uzun</SelectItem>
                  <SelectItem value="Çok Uzun">Çok Uzun</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-blue-600 mt-1">
                (1.500-2.000 kelime)
              </div>
            </div>
            
            <div>
              <Label className="text-sm text-slate-600">Klasör</Label>
              <Select value="" onValueChange={() => {}}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Makaleleriniz için bir klasör seçebilirsiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="genel">Genel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm text-slate-600">Alt Başlık Tipi</Label>
              <Select value="H2 + H3" onValueChange={() => {}}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="H2">H2</SelectItem>
                  <SelectItem value="H3">H3</SelectItem>
                  <SelectItem value="H2 + H3">H2 + H3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm text-slate-600">Alt Başlık Sayısı (H2)</Label>
              <Select value="20" onValueChange={() => {}}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm text-slate-600">Yazı Stili</Label>
              <Select value="" onValueChange={() => {}}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Makaleniz için bir yazım tarzı seçebilirsiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="profesyonel">Profesyonel</SelectItem>
                  <SelectItem value="samimi">Samimi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm text-slate-600">Anlatıcı / Bakış Açısı</Label>
              <Select value="Genel" onValueChange={() => {}}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Genel">Genel</SelectItem>
                  <SelectItem value="1. Tekil Şahıs">1. Tekil Şahıs</SelectItem>
                  <SelectItem value="2. Tekil Şahıs">2. Tekil Şahıs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm text-slate-600">Yazı Türü</Label>
              <Select value="Genel" onValueChange={() => {}}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Genel">Genel</SelectItem>
                  <SelectItem value="Blog">Blog</SelectItem>
                  <SelectItem value="Haber">Haber</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm text-slate-600">Hedef Kitle</Label>
              <Select value="Genel" onValueChange={() => {}}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Genel">Genel</SelectItem>
                  <SelectItem value="Uzman">Uzman</SelectItem>
                  <SelectItem value="Yeni Başlayan">Yeni Başlayan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
            <span className="font-semibold">Uyarı:</span> Lütfen çok uzun seçeneğini kullanırken dikkatli olunuz. Yanlış kullanılması çok uzun makalelerin oluşturulmasına ve bu da çok fazla kredinizin harcanmasına sebep olabilir.
          </div>
        </div>

        {/* Güncel Bilgiler Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="h-6 w-6 bg-green-500 text-white flex items-center justify-center rounded text-xs">
              <span className="text-xs font-bold">✓</span>
            </div>
            <h3 className="text-base font-medium text-slate-800">Güncel Bilgiler</h3>
            <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">Yeni</div>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label className="text-sm text-slate-600">Güncel Bilgiler</Label>
              <Select value="Evet (Ekstra Kredi)" onValueChange={() => {}}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Evet (Ekstra Kredi)">Evet (Ekstra Kredi)</SelectItem>
                  <SelectItem value="Hayır">Hayır</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
              Bu özelliği etkinleştirdiğinizde içerik oluşturulurken önce webde güncel bilgiler aranır, sonra doğrulanları veriler toplanır ve bu bilgiler kullanılarak içerik üretilir. Bu sayede oluşturulan içerikler en yeni ve doğru bilgileri içerir.
            </div>
            
            <div className="space-y-2">
              <div>
                <Label className="text-sm text-slate-600">Arama Kaynağı</Label>
                <Select value="Google Organik Arama" onValueChange={() => {}}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Google Organik Arama">Google Organik Arama</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm text-slate-600">Arama Sorgusu</Label>
                <Input 
                  placeholder="Odak anahtar kelime kullanılsın"
                  className="h-9"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-sm text-slate-600">Arama Yapılacak Ülke</Label>
                  <Select value="Türkiye" onValueChange={() => {}}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Türkiye">Türkiye</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm text-slate-600">Arama Dili</Label>
                  <Select value="Türkçe" onValueChange={() => {}}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Türkçe">Türkçe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm text-slate-600">Arama Tarihi</Label>
                  <Select value="Hepsi" onValueChange={() => {}}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hepsi">Hepsi</SelectItem>
                      <SelectItem value="Son 24 saat">Son 24 saat</SelectItem>
                      <SelectItem value="Son hafta">Son hafta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-sm text-slate-600">Hariç Tutulacak Linkler</Label>
                  <Select value="Yok" onValueChange={() => {}}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yok">Yok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm text-slate-600">Linkler Makale Sonuna Eklensin mi?</Label>
                  <Select value="Eklenmesinn" onValueChange={() => {}}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Eklenmesinn">Eklenmesin</SelectItem>
                      <SelectItem value="Eklensin">Eklensin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm text-slate-600">Link Yapısı</Label>
                  <Select value="NoFollow (Tavsize edilir)" onValueChange={() => {}}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NoFollow (Tavsize edilir)">NoFollow (Tavsiye edilir)</SelectItem>
                      <SelectItem value="DoFollow">DoFollow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Görsel Seçenekleri Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="h-6 w-6 bg-blue-500 text-white flex items-center justify-center rounded text-xs">
              <i className="fas fa-image text-xs"></i>
            </div>
            <h3 className="text-base font-medium text-slate-800">Görsel Seçenekleri</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label className="text-sm text-slate-600">Makale Resmi</Label>
              <Select value="Görsel istemikyorum" onValueChange={() => {}}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Görsel istemiyorum">Görsel istemiyorum</SelectItem>
                  <SelectItem value="Unsplash (Ücretsiz)">Unsplash (Ücretsiz)</SelectItem>
                  <SelectItem value="Pexels (Ücretsiz)">Pexels (Ücretsiz)</SelectItem>
                  <SelectItem value="Pixabay (Ücretsiz)">Pixabay (Ücretsiz)</SelectItem>
                  <SelectItem value="Google (Ücretsiz)">Google (Ücretsiz)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* İçerik Özellikleri Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="h-6 w-6 bg-purple-500 text-white flex items-center justify-center rounded text-xs">
              <i className="fas fa-edit text-xs"></i>
            </div>
            <h3 className="text-base font-medium text-slate-800">İçerik Özellikleri</h3>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            <label className="flex items-center space-x-2 text-xs cursor-pointer">
              <Checkbox className="h-4 w-4" />
              <span className="text-slate-700">Sıkça Sorulan Sorular (Normal)</span>
            </label>
            <label className="flex items-center space-x-2 text-xs cursor-pointer">
              <Checkbox className="h-4 w-4" />
              <span className="text-slate-700">Meta Açıklama</span>
            </label>
            <label className="flex items-center space-x-2 text-xs cursor-pointer">
              <Checkbox className="h-4 w-4" />
              <span className="text-slate-700">Tablo</span>
            </label>
            <label className="flex items-center space-x-2 text-xs cursor-pointer">
              <Checkbox checked className="h-4 w-4" />
              <span className="text-slate-700">Kalın Yazılar</span>
            </label>
            <label className="flex items-center space-x-2 text-xs cursor-pointer">
              <Checkbox className="h-4 w-4" />
              <span className="text-slate-700">Sıkça Sorulan Sorular (Normal + Schema)</span>
            </label>
            <label className="flex items-center space-x-2 text-xs cursor-pointer">
              <Checkbox className="h-4 w-4" />
              <span className="text-slate-700">Makale Özeti</span>
            </label>
            <label className="flex items-center space-x-2 text-xs cursor-pointer">
              <Checkbox className="h-4 w-4" />
              <span className="text-slate-700">Liste</span>
            </label>
            <label className="flex items-center space-x-2 text-xs cursor-pointer">
              <Checkbox className="h-4 w-4" />
              <span className="text-slate-700">İtalik Yazılar</span>
            </label>
            <label className="flex items-center space-x-2 text-xs cursor-pointer">
              <Checkbox className="h-4 w-4" />
              <span className="text-slate-700">Alıntı</span>
            </label>
            
            <div className="col-span-4 mt-2">
              <Label className="text-sm text-slate-600">Özel HTML</Label>
              <Select value="Eklenmesinn" onValueChange={() => {}}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Eklenmesinn">Eklenmesin</SelectItem>
                  <SelectItem value="Eklensin">Eklensin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Sitenizde Yayınlama Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="h-6 w-6 bg-purple-500 text-white flex items-center justify-center rounded text-xs">
              <i className="fas fa-rocket text-xs"></i>
            </div>
            <h3 className="text-base font-medium text-slate-800">Sitenizde Yayınlama</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-sm text-slate-600">Web Sitesi</Label>
              <Select value="" onValueChange={() => {}}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Lütfen bir web sitesi seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="site1">Site 1</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm text-slate-600">Kategori</Label>
              <Select value="" onValueChange={() => {}}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Lütfen önce bir web sitesi seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kategori1">Kategori 1</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm text-slate-600">Etiketler</Label>
              <Select value="" onValueChange={() => {}}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Lütfen önce bir web sitesi seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="etiket1">Etiket 1</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-3">
              <Label className="text-sm text-slate-600">Yayın Durumu</Label>
              <Select value="" onValueChange={() => {}}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Lütfen bir yayın durumu seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="taslak">Taslak</SelectItem>
                  <SelectItem value="yayinla">Yayınla</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* İç & Dış Linkler Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="h-6 w-6 bg-blue-500 text-white flex items-center justify-center rounded text-xs">
              <i className="fas fa-link text-xs"></i>
            </div>
            <h3 className="text-base font-medium text-slate-800">İç & Dış Linkler</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
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
            
            <div>
              <Label className="text-sm text-slate-600">Dış Linkler</Label>
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
