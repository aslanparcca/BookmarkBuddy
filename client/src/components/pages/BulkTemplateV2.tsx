import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Info, Upload, FileText, Globe, Image, Settings, ExternalLink, Send } from "lucide-react";

interface BulkTemplateV2Props {
  setLoading: (loading: boolean) => void;
}

interface BulkV2Settings {
  // Genel Ayarlar
  language: string;
  aiModel: string;
  sectionLength: string;
  folder: string;
  subheadingType: string;
  subheadingCount: string;
  writingStyle: string;
  
  // Oluşturma Tipi
  generateType: string;
  keywords: string;
  keywordType: string;
  websiteId: string;
  competitorUrl: string;
  customTitle: string;
  titleCount: number;
  
  // Güncel Bilgiler
  currentInfo: boolean;
  webSearchSource: string;
  searchQueryType?: string;
  searchCountry?: string;
  searchLanguage?: string;
  searchDate?: string;
  excludedUrlsEnabled?: string;
  sourceLinksDisplay?: string;
  sourceLinksRel?: string;
  excludedUrls: string;
  customUrls: string;
  
  // Görsel Seçenekleri
  imageSource: string;
  featuredImage: string;
  autoImageInsertion: boolean;
  subheadingImages: { [key: string]: string };
  descriptiveAltText: boolean;
  
  // İçerik Özellikleri
  faqNormal: boolean;
  faqSchema: boolean;
  metaDescription: boolean;
  articleSummary: boolean;
  h3Subheadings: boolean;
  table: boolean;
  list: boolean;
  boldText: boolean;
  italicText: boolean;
  quote: boolean;
  customHtml: string;
  customHtmlPosition: string;
  
  // Yayınlama
  website: string;
  category: string;
  categoryId: string;
  tags: string;
  publishStatus: string;
  publishDate: string;
  
  // İçerik Özellikleri (Array)
  contentFeatures: string[];
  
  // İç & Dış Linkler
  internalLinks: string;
  externalLinks: string;
  manualInternalLinks: string;
  manualExternalLinks: string;
}

interface GeneratedTitle {
  title: string;
  focusKeyword: string;
  imageKeyword: string;
  otherKeywords?: string;
  subheadings?: string[];
  companyName?: string;
  contentLength?: string;
}

interface Website {
  id: number;
  url: string;
  name: string;
  platform: string;
  categories?: Category[];
}

interface Category {
  id: number;
  name: string;
}

export default function BulkTemplateV2({ setLoading }: BulkTemplateV2Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showStep2, setShowStep2] = useState(false);
  const [generatedTitles, setGeneratedTitles] = useState<GeneratedTitle[]>([]);
  const [selectedGenerateType, setSelectedGenerateType] = useState("1");
  const [currentInfoEnabled, setCurrentInfoEnabled] = useState(false);
  const [imageSource, setImageSource] = useState("0");
  
  const [settings, setSettings] = useState<BulkV2Settings>({
    language: "1",
    aiModel: "gemini_2.5_flash",
    sectionLength: "medium",
    folder: "",
    subheadingType: "h2",
    subheadingCount: "",
    writingStyle: "",
    generateType: "1",
    keywords: "",
    keywordType: "1",
    websiteId: "",
    competitorUrl: "",
    customTitle: "",
    titleCount: 10,
    currentInfo: false,
    webSearchSource: "",
    excludedUrls: "",
    customUrls: "",
    imageSource: "none",
    featuredImage: "",
    autoImageInsertion: true,
    subheadingImages: {},
    descriptiveAltText: false,
    faqNormal: false,
    faqSchema: false,
    metaDescription: false,
    articleSummary: false,
    h3Subheadings: false,
    table: false,
    list: false,
    boldText: false,
    italicText: false,
    quote: false,
    customHtml: "",
    customHtmlPosition: "",
    website: "",
    category: "",
    categoryId: "",
    tags: "",
    publishStatus: "",
    publishDate: "",
    contentFeatures: [],
    internalLinks: "",
    externalLinks: "",
    manualInternalLinks: "",
    manualExternalLinks: ""
  });

  // Fetch websites
  const { data: websites = [] } = useQuery({
    queryKey: ['/api/websites'],
  });

  // Sync website categories mutation
  const syncWebsiteMutation = useMutation({
    mutationFn: async (websiteId: string) => {
      return apiRequest(`/api/websites/${websiteId}/sync-categories`, 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/websites'] });
    }
  });

  const categories = useMemo(() => {
    if (!settings.website || !websites) return [];
    const selectedWebsite = websites.find((w: Website) => w.id.toString() === settings.website);
    return selectedWebsite?.categories || [];
  }, [settings.website, websites]);

  // Generate titles mutation
  const generateTitlesMutation = useMutation({
    mutationFn: async (settings: BulkV2Settings) => {
      return apiRequest('/api/generate-bulk-titles-v2', 'POST', settings);
    },
    onSuccess: (data) => {
      if (data.success && data.titles) {
        setGeneratedTitles(data.titles);
        setShowStep2(true);
        toast({
          title: "Başarılı",
          description: `${data.titles.length} başlık oluşturuldu`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Generate articles mutation
  const generateArticlesMutation = useMutation({
    mutationFn: async (data: { titles: GeneratedTitle[], settings: BulkV2Settings }) => {
      return apiRequest('/api/generate-bulk-articles-v2', 'POST', data);
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Başarılı",
          description: `${data.created} makale oluşturuldu`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/process-excel-template', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success && result.articles) {
        setGeneratedTitles(result.articles);
        setShowStep2(true);
        toast({
          title: "Başarılı",
          description: `${result.articles.length} başlık yüklendi`,
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Dosya işlenirken hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleGenerateArticles = () => {
    generateArticlesMutation.mutate({
      titles: generatedTitles,
      settings: settings
    });
  };

  return (
    <div className="space-y-6">
      {/* Excel Upload Section */}
      <Card className="border-2 border-dashed border-gray-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Excel Dosyası Yükle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileSelect(file);
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            <p className="text-sm text-muted-foreground">
              Excel dosyanızı seçin ve başlıklar otomatik olarak yüklenecektir.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Güncel Bilgiler */}
      {showStep2 && (
        <Card className="border-2 border-primary relative">
          <div className="absolute top-0 right-0 bg-green-500 text-white px-2 py-1 text-xs rounded-bl-md">
            Yeni
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              Güncel Bilgiler
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="currentInfo">Güncel Bilgiler</Label>
                  <Select 
                    value={currentInfoEnabled ? "1" : "0"} 
                    onValueChange={(value) => {
                      const enabled = value === "1";
                      setCurrentInfoEnabled(enabled);
                      setSettings({...settings, currentInfo: enabled});
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Evet (Ekstra Kredi)</SelectItem>
                      <SelectItem value="0">Hayır</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="lg:col-span-2 flex items-end">
                  <p className="text-sm text-muted-foreground">
                    Bu özelliği etkinleştirdiğinizde içerik oluşturulurken önce webde güncel bilgiler aranır, sonra doğrulanan veriler toplanır ve bu bilgiler kullanılarak içerik üretilir. Bu sayede oluşturulan içerikler en yeni ve doğru bilgileri içerir.
                  </p>
                </div>
              </div>

              {currentInfoEnabled && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-semibold text-blue-900 mb-1">Fiyatlandırma:</div>
                      <div className="text-blue-800">
                        Güncel bilgiler özelliğini kullanmak ekstra kredi gerektirir. İçerik oluştururken kullanılan kredi miktarının <strong>4 katı ek kredi</strong> harcanır. Oluşturulan içeriğin kelime sayısı 1000'den az olsa bile en az 1000 kelime üzerinden hesaplama yapılır.
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="webSearchSource">Arama Kaynağı</Label>
                      <Select value={settings.webSearchSource || "web"} onValueChange={(value) => setSettings({...settings, webSearchSource: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Google Organik Arama" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="web">Google Organik Arama</SelectItem>
                          <SelectItem value="news">Google News</SelectItem>
                          <SelectItem value="custom">Kendi Linklerimi Gireceğim</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {settings.webSearchSource !== "custom" && (
                      <div className="lg:col-span-2">
                        <Label htmlFor="searchQueryType">Arama Sorgusu</Label>
                        <Select value={settings.searchQueryType || "focus_keyword"} onValueChange={(value) => setSettings({...settings, searchQueryType: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Odak anahtar kelime kullanılsın" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="focus_keyword">Odak anahtar kelime kullanılsın</SelectItem>
                            <SelectItem value="title">Makale başlığı kullanılsın</SelectItem>
                            <SelectItem value="custom">Özel sorgu gireceğim</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {settings.webSearchSource !== "custom" && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="searchCountry">Arama Yapılacak Ülke</Label>
                        <Select value={settings.searchCountry || "tr"} onValueChange={(value) => setSettings({...settings, searchCountry: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tr">Türkiye</SelectItem>
                            <SelectItem value="us">Amerika Birleşik Devletleri</SelectItem>
                            <SelectItem value="de">Almanya</SelectItem>
                            <SelectItem value="fr">Fransa</SelectItem>
                            <SelectItem value="uk">İngiltere</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="searchLanguage">Arama Dili</Label>
                        <Select value={settings.searchLanguage || "tr"} onValueChange={(value) => setSettings({...settings, searchLanguage: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tr">Türkçe</SelectItem>
                            <SelectItem value="en">İngilizce</SelectItem>
                            <SelectItem value="de">Almanca</SelectItem>
                            <SelectItem value="fr">Fransızca</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="searchDate">Arama Tarihi</Label>
                        <Select value={settings.searchDate || "all"} onValueChange={(value) => setSettings({...settings, searchDate: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Hepsi" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Hepsi</SelectItem>
                            <SelectItem value="last_hour">Son 1 Saat</SelectItem>
                            <SelectItem value="last_24_hours">Son 24 Saat</SelectItem>
                            <SelectItem value="last_week">Son 1 Hafta</SelectItem>
                            <SelectItem value="last_month">Son 1 Ay</SelectItem>
                            <SelectItem value="last_year">Son 1 Yıl</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="excludedUrlsEnabled">Hariç Tutulacak Linkler</Label>
                        <Select value={settings.excludedUrlsEnabled || "0"} onValueChange={(value) => setSettings({...settings, excludedUrlsEnabled: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Yok</SelectItem>
                            <SelectItem value="1">Var</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="sourceLinksDisplay">Linkler Makale Sonuna Eklensin mi?</Label>
                      <Select value={settings.sourceLinksDisplay || "none"} onValueChange={(value) => setSettings({...settings, sourceLinksDisplay: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Eklenmesin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Eklenmesin</SelectItem>
                          <SelectItem value="url">URL</SelectItem>
                          <SelectItem value="title">Link Başlığı</SelectItem>
                          <SelectItem value="title_url">URL + Link Başlığı</SelectItem>
                          <SelectItem value="link_title_url">Link Başlığı + URL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="sourceLinksRel">Link Yapısı</Label>
                      <Select 
                        value={settings.sourceLinksRel || "nofollow"} 
                        onValueChange={(value) => setSettings({...settings, sourceLinksRel: value})}
                        disabled={settings.sourceLinksDisplay === "none"}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dofollow">DoFollow</SelectItem>
                          <SelectItem value="nofollow">NoFollow (Tavsiye edilir)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {settings.excludedUrlsEnabled === "1" && settings.webSearchSource !== "custom" && (
                    <div>
                      <Label htmlFor="excludedUrls">Hariç Tutulacak Linkler</Label>
                      <Textarea
                        placeholder="Lütfen bir satıra 1 adet URL giriniz."
                        value={settings.excludedUrls}
                        onChange={(e) => setSettings({...settings, excludedUrls: e.target.value})}
                        rows={3}
                      />
                      <div className="text-sm text-muted-foreground mt-2">
                        <ul className="list-disc pl-5">
                          <li>Lütfen her satıra <span className="text-red-600 underline">1 adet</span> link giriniz.</li>
                          <li>Lütfen en fazla <span className="text-red-600 underline">10 adet</span> link giriniz.</li>
                          <li><span className="underline">https://www.site-ismi.com</span> şeklinde bir link girerseniz o domaindeki tüm sayfalar hariç tutulur.</li>
                          <li><span className="underline">https://www.site-ismi.com/iletisim</span> şeklinde bir link girerseniz sadece ilgili sayfa hariç tutulur.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {settings.webSearchSource === "custom" && (
                    <div>
                      <Label htmlFor="customUrls">Kendi Linklerim</Label>
                      <Textarea
                        placeholder="Lütfen her satıra 1 adet URL yazınız."
                        value={settings.customUrls}
                        onChange={(e) => setSettings({...settings, customUrls: e.target.value})}
                        rows={3}
                      />
                      <div className="text-sm text-muted-foreground mt-2">
                        <ul className="list-disc pl-5">
                          <li>Lütfen her satıra <span className="text-red-600 underline">1 adet</span> link giriniz.</li>
                          <li>Lütfen en fazla <span className="text-red-600 underline">5 adet</span> link giriniz.</li>
                          <li>Bu linkler sıra ile incelenecek ve içerikleri alınabilen <span className="text-red-600 underline">ilk 3 link</span> kullanılacaktır.</li>
                          <li>PDF, Word, Excel, JSON, XML gibi dosya linkleri kabul edilmemektedir.</li>
                          <li>YouTube, X, Facebook, Instagram, Pinterest, TikTok gibi sosyal medya linkleri kabul edilmemektedir.</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Articles Button */}
      {showStep2 && (
        <Card>
          <CardContent className="pt-6">
            <Button 
              onClick={handleGenerateArticles}
              disabled={generateArticlesMutation.isPending}
              className="w-full"
            >
              {generateArticlesMutation.isPending ? "Makaleler Oluşturuluyor..." : "Makaleleri Oluştur"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}