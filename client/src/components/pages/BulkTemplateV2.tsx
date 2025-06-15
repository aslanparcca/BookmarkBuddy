import { useState, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Info, Layers, Heading, Settings, Image, Edit, Globe, Link, Youtube, FileText, Send } from "lucide-react";
import FileDropZone from "@/components/FileDropZone";

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
  excludedUrls: string;
  customUrls: string;
  
  // Görsel Seçenekleri
  imageSource: string;
  featuredImage: string;
  autoImageInsertion: boolean;
  subheadingImages: { [key: string]: string };
  
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
  const [showStep2, setShowStep2] = useState(false);

  const [generatedTitles, setGeneratedTitles] = useState<GeneratedTitle[]>([]);
  const [selectedGenerateType, setSelectedGenerateType] = useState("1");
  const [currentInfoEnabled, setCurrentInfoEnabled] = useState(false);
  const [imageSource, setImageSource] = useState("0");
  
  const [settings, setSettings] = useState<BulkV2Settings>({
    language: "1",
    aiModel: "gemini_2.5_flash",
    sectionLength: "s",
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
    faqNormal: false,
    faqSchema: false,
    metaDescription: false,
    articleSummary: false,
    h3Subheadings: false,
    table: false,
    list: false,
    boldText: true,
    italicText: false,
    quote: false,
    customHtml: "",
    customHtmlPosition: "none",
    website: "",
    category: "",
    categoryId: "",
    tags: "",
    publishStatus: "draft",
    publishDate: "",
    contentFeatures: [] as string[],
    internalLinks: "Yok",
    externalLinks: "Yok",
    manualInternalLinks: "",
    manualExternalLinks: ""
  });

  // Fetch websites
  const websitesQuery = useQuery<Website[]>({
    queryKey: ['/api/websites'],
    retry: false,
  });

  const websites = websitesQuery.data || [];

  // Fetch categories for selected website using useMemo
  const categories = useMemo(() => {
    const selectedWebsite = websites.find(w => w.id.toString() === settings.websiteId);
    return selectedWebsite?.categories || [];
  }, [websites, settings.websiteId]);

  const generateTitlesMutation = useMutation({
    mutationFn: async (settings: BulkV2Settings) => {
      return await apiRequest("POST", "/api/bulk-titles-v2", settings);
    },
    onSuccess: (data: any) => {
      setGeneratedTitles(data.titles || []);
      setShowStep2(true);
      toast({
        title: "Başarılı",
        description: `${data.titles?.length || 0} adet başlık oluşturuldu!`,
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Oturum Süresi Doldu",
          description: "Tekrar giriş yapılıyor...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Hata",
        description: error.message || "Başlık oluşturma işlemi başarısız oldu",
        variant: "destructive",
      });
    },
  });

  const generateArticlesMutation = useMutation({
    mutationFn: async (data: { titles: GeneratedTitle[], settings: BulkV2Settings }) => {
      return await apiRequest("POST", "/api/generate-bulk-articles-v2", data);
    },
    onSuccess: (data: any) => {
      if (data.successCount !== undefined && data.successCount !== null) {
        toast({
          title: "Başarılı",
          description: data.message || `${data.successCount} makale oluşturuldu!`,
        });
      } else {
        toast({
          title: "Hata",
          description: "Makale oluşturma işlemi tamamlanamadı",
          variant: "destructive",
        });
      }
      setLoading(false);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Oturum Süresi Doldu",
          description: "Tekrar giriş yapılıyor...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      // Check for quota limit errors
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes("quota") || errorMessage.includes("rate limit") || errorMessage.includes("429")) {
        toast({
          title: "API Limit Aşıldı",
          description: "Gemini API günlük kullanım limitiniz doldu. Lütfen daha sonra tekrar deneyin veya ücretli API key kullanın.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Hata",
          description: error.message || "Makale oluşturma işlemi başarısız oldu",
          variant: "destructive",
        });
      }
      setLoading(false);
    },
  });

  // Website sync mutation for category loading
  const syncWebsiteMutation = useMutation({
    mutationFn: async (websiteId: number) => {
      return await apiRequest("POST", `/api/websites/${websiteId}/sync`, {});
    },
    onSuccess: () => {
      // Refetch websites to get updated categories
      websitesQuery.refetch();
    },
    onError: (error: Error) => {
      console.error("Website sync error:", error);
    },
  });

  const handleFileSelect = async (file: File) => {
    console.log("Excel file selected:", file.name);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/process-excel-template', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Excel processing response:", data);
      console.log("Excel Debug Info:", data.debug);
      
      if (data.success && data.articles) {
        // Excel'den gelen verileri alt başlıklar ve firma dahil tam olarak kaydet
        const articlesData = data.articles.map((article: any) => ({
          title: article.title,
          focusKeyword: article.focusKeyword,
          imageKeyword: article.otherKeywords ? article.otherKeywords.split(',')[0].trim() : article.focusKeyword,
          otherKeywords: article.otherKeywords,
          subheadings: article.subheadings || [],
          companyName: article.companyName || '',
          contentLength: article.contentLength || ''
        }));
        
        setGeneratedTitles(articlesData);
        setShowStep2(true);
        
        toast({
          title: "Başarılı",
          description: `${articlesData.length} makale başlığı Excel'den yüklendi`,
        });
      }
    } catch (error) {
      console.error("Excel processing error:", error);
      toast({
        title: "Hata",
        description: "Excel dosyası işlenirken hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleGenerateArticles = () => {
    if (generatedTitles.length === 0) {
      toast({
        title: "Hata",
        description: "Önce başlık oluşturmanız gerekiyor",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    generateArticlesMutation.mutate({
      titles: generatedTitles,
      settings
    });
  };

  const handleGenerateTitles = () => {
    if (selectedGenerateType === "1" && !settings.keywords) {
      toast({
        title: "Hata",
        description: "Lütfen anahtar kelimeleri giriniz",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedGenerateType === "2" && !settings.websiteId) {
      toast({
        title: "Hata", 
        description: "Lütfen bir web sitesi seçiniz",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedGenerateType === "3" && !settings.competitorUrl) {
      toast({
        title: "Hata",
        description: "Lütfen rakip site URL'sini giriniz",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedGenerateType === "4" && !settings.customTitle) {
      toast({
        title: "Hata",
        description: "Lütfen makale başlıklarını giriniz",
        variant: "destructive",
      });
      return;
    }

    // Custom title processing - no API call needed
    if (selectedGenerateType === "4") {
      const customTitles = settings.customTitle
        .split('\n')
        .filter(title => title.trim() !== '')
        .slice(0, 40) // Max 40 titles
        .map(title => ({
          title: title.trim(),
          focusKeyword: title.trim(),
          imageKeyword: title.trim()
        }));
      
      if (customTitles.length === 0) {
        toast({
          title: "Hata",
          description: "Lütfen en az bir başlık giriniz",
          variant: "destructive",
        });
        return;
      }
      
      setGeneratedTitles(customTitles);
      setShowStep2(true);
      toast({
        title: "Başarılı!",
        description: `${customTitles.length} adet başlık işlendi.`,
      });
      return;
    }

    setLoading(true);
    generateTitlesMutation.mutate({
      ...settings,
      generateType: selectedGenerateType
    });
    setLoading(false);
  };

  const updateGeneratedTitle = (index: number, field: keyof GeneratedTitle, value: string) => {
    const updated = [...generatedTitles];
    updated[index] = { ...updated[index], [field]: value };
    setGeneratedTitles(updated);
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Title Generation */}
      <Card className="border-2 border-primary">
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Toplu Makale Oluştur V2
              <Youtube className="w-5 h-5 text-gray-400 hover:text-red-600 cursor-pointer" />
            </CardTitle>
            
            <Button variant="outline" size="sm" className="mt-2 md:mt-0">
              <Info className="w-4 h-4 mr-1" />
              Bilgilendirme
            </Button>
          </div>
        </CardHeader>

        <CardContent className="mt-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Side - Generation Type Selection */}
            <div className="w-full md:w-2/5 lg:w-1/3 pr-0 md:pr-6 md:border-r">
              <RadioGroup
                value={selectedGenerateType}
                onValueChange={setSelectedGenerateType}
                className="space-y-4"
              >
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="1" id="type1" className="mt-1" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="type1" className="font-semibold">Anahtar Kelime</Label>
                    <p className="text-sm text-muted-foreground">
                      Girilen anahtar kelimelere göre öneriler oluşturulur
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 border-t border-b border-dashed py-4">
                  <RadioGroupItem value="2" id="type2" className="mt-1" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="type2" className="font-semibold">Web Siteniz</Label>
                    <p className="text-sm text-muted-foreground">
                      Kayıtlı web sitelerinize göre öneriler oluşturulur
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 border-b border-dashed pb-4">
                  <RadioGroupItem value="3" id="type3" className="mt-1" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="type3" className="font-semibold">Rakip Siteler</Label>
                    <p className="text-sm text-muted-foreground">
                      Rakip sitelerin içeriklerine göre öneriler oluşturulur
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 border-b border-dashed pb-4">
                  <RadioGroupItem value="4" id="type4" className="mt-1" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="type4" className="font-semibold">Başlıkları Kendim Gireceğim</Label>
                    <p className="text-sm text-muted-foreground">
                      Başlıkları kendiniz yazabilir veya kopyala/yapıştır yapabilirsiniz
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="excel" id="typeExcel" className="mt-1" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="typeExcel" className="font-semibold">Excel Dosyası Yükleyeceğim</Label>
                    <p className="text-sm text-muted-foreground">
                      Başlık ve alt başlıkları Excel dosyası olarak yükleyebilirsiniz
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Right Side - Dynamic Content */}
            <div className="w-full md:w-3/5 lg:w-2/3 mt-4 md:mt-0">
              {/* Language Selection */}
              <div className="mb-6">
                <Label htmlFor="language">Dil</Label>
                <Select value={settings.language} onValueChange={(value) => setSettings({...settings, language: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Lütfen bir dil seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Türkçe</SelectItem>
                    <SelectItem value="2">İngilizce</SelectItem>
                    <SelectItem value="5">Almanca</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dynamic Content Based on Selection */}
              {selectedGenerateType === "1" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="keywords">Anahtar Kelimeler</Label>
                    <Input
                      id="keywords"
                      placeholder="Anahtar kelimeleri aralarına virgül koyarak giriniz"
                      value={settings.keywords}
                      onChange={(e) => setSettings({...settings, keywords: e.target.value})}
                    />
                  </div>
                  
                  <RadioGroup
                    value={settings.keywordType}
                    onValueChange={(value) => setSettings({...settings, keywordType: value})}
                    className="space-y-3"
                  >
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="1" id="keyword1" className="mt-1" />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="keyword1" className="font-semibold">Anahtar kelimeler beraber değerlendirilsin</Label>
                          <p className="text-sm text-muted-foreground">
                            Anahtar kelimelerin hepsini kapsayacak başlıklar oluşturulur
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="2" id="keyword2" className="mt-1" />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="keyword2" className="font-semibold">Anahtar kelimeler ayrı ayrı değerlendirilsin</Label>
                          <p className="text-sm text-muted-foreground">
                            Anahtar kelimeler birbirinden bağımsız değerlendirilerek başlıklar oluşturulur
                          </p>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {selectedGenerateType === "2" && (
                <div>
                  <Label htmlFor="website">Web Siteniz</Label>
                  <Select value={settings.websiteId} onValueChange={(value) => setSettings({...settings, websiteId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Lütfen bir web sitesi seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8180">https://akyurtnakliyat.org.tr</SelectItem>
                      <SelectItem value="8178">https://ankaracagrinakliyat.com</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-sm text-muted-foreground mt-2">
                    <p>- Bu seçenek <span className="underline">sadece WordPress sistemler</span> için çalışmaktadır.</p>
                    <p>- Web Sitelerim bölümünden yeni bir site ekleyebilirsiniz.</p>
                  </div>
                </div>
              )}

              {selectedGenerateType === "3" && (
                <div>
                  <Label htmlFor="competitorUrl">Rakip Site URL Adresi</Label>
                  <Input
                    id="competitorUrl"
                    placeholder="https://www.ornek-domain.com şeklinde giriniz"
                    value={settings.competitorUrl}
                    onChange={(e) => setSettings({...settings, competitorUrl: e.target.value})}
                  />
                  <div className="text-sm text-muted-foreground mt-2">
                    <p>- Bu seçenek <span className="underline">sadece WordPress sistemler</span> için çalışmaktadır.</p>
                    <p>- WordPress harici sistemler için hata mesajı görüntülenecektir.</p>
                  </div>
                </div>
              )}



              {selectedGenerateType === "excel" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="excel-file">Excel Dosyası</Label>
                    <FileDropZone
                      onFileSelect={handleFileSelect}
                      accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      maxSize={10 * 1024 * 1024} // 10MB
                    />
                    <div className="text-sm text-muted-foreground mt-2">
                      <ul className="list-disc pl-5">
                        <li>Örnek Excel dosyasını buradan indirebilirsiniz.</li>
                        <li>Lütfen dosya hakkındaki gereksinimleri okuyunuz.</li>
                        <li>En fazla 40 adet başlık yükleyebilirsiniz.</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="text-black font-medium">
                    ⬇️⬇️ Lütfen aşağıdaki formdan makale özelliklerini seçiniz.
                  </div>
                </div>
              )}

              {/* Title Count and Generate Button */}
              {selectedGenerateType !== "excel" && (
                <div className="mt-6 flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Adet"
                    min="1"
                    max="40"
                    value={settings.titleCount}
                    onChange={(e) => setSettings({...settings, titleCount: parseInt(e.target.value) || 10})}
                    className="w-20"
                  />
                  <Button 
                    onClick={handleGenerateTitles}
                    disabled={generateTitlesMutation.isPending}
                    className="font-medium"
                  >
                    {generateTitlesMutation.isPending ? "Oluşturuluyor..." : 
                     selectedGenerateType === "4" ? "Yukarıdaki Başlıkları Kullan" : "Başlık Oluştur"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Step 2: General Settings - Excel dosyası yüklendiğinde göster */}
      {showStep2 && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Genel Ayarlar
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="aiModel">Yapay Zeka Modeli</Label>
                <Select value={settings.aiModel} onValueChange={(value) => setSettings({...settings, aiModel: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini_2.5_flash">Gemini 2.5 Flash (En Güncel)</SelectItem>
                    <SelectItem value="gemini_2.5_pro">Gemini 2.5 Pro (Deep Think)</SelectItem>
                    <SelectItem value="gemini_2.0_flash">Gemini 2.0 Flash</SelectItem>
                    <SelectItem value="gemini_2.0_flash_lite">Gemini 2.0 Flash Lite</SelectItem>
                    <SelectItem value="gemini_2.0_flash_thinking">Gemini 2.0 Flash Thinking (Deneysel)</SelectItem>
                    <SelectItem value="gemini_1.5_flash">Gemini 1.5 Flash (Emekli Edilecek)</SelectItem>
                    <SelectItem value="gemini_1.5_pro">Gemini 1.5 Pro (Emekli Edilecek)</SelectItem>
                  </SelectContent>
                </Select>
              </div>



              <div>
                <Label htmlFor="folder">Klasör</Label>
                <Select value={settings.folder} onValueChange={(value) => setSettings({...settings, folder: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Makaleleriniz için bir klasör seçebilirsiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="11275">Akyurt Nakliyat</SelectItem>
                    <SelectItem value="11163">Ankara Özpolat</SelectItem>
                    <SelectItem value="11108">Asansörlü Nakliyat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subheadingType">Alt Başlık Tipi</Label>
                <Select value={settings.subheadingType} onValueChange={(value) => setSettings({...settings, subheadingType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="h2">H2</SelectItem>
                    <SelectItem value="h2h3">H2 + H3</SelectItem>
                  </SelectContent>
                </Select>
              </div>



              <div>
                <Label htmlFor="writingStyle">Yazı Stili</Label>
                <Select value={settings.writingStyle} onValueChange={(value) => setSettings({...settings, writingStyle: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Makaleniz için bir yazım tarzı seçebilirsiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">Arkadaşça</SelectItem>
                    <SelectItem value="informative">Bilgilendirici</SelectItem>
                    <SelectItem value="academic">Akademik</SelectItem>
                    <SelectItem value="professional">Profesyonel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Güncel Bilgiler */}
      {showStep2 && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              Güncel Bilgiler
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
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
                    <SelectItem value="0">Evet (Ekstra Kredi)</SelectItem>
                    <SelectItem value="1">Hayır</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-2">
                  Bu özelliği etkinleştirdiğinizde içerik oluşturulurken önce webde güncel bilgiler aranır, sonra doğrulaması yapılan veriler toplanır ve bu bilgiler kullanılarak içerik üretilir. Bu sayede oluşturulan içerikler en yeni ve en doğru bilgileri içerir.
                </p>
              </div>

              {currentInfoEnabled && (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="webSearchSource">Arama Kaynağı</Label>
                      <Select value={settings.webSearchSource} onValueChange={(value) => setSettings({...settings, webSearchSource: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Google Organik Arama" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="google">Google Organik Arama</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="searchQuery">Arama Sorgusu</Label>
                      <Input
                        id="searchQuery"
                        placeholder="Odak anahtar kelime kullanılsın"
                        value={settings.webSearchSource}
                        onChange={(e) => setSettings({...settings, webSearchSource: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="searchCountry">Arama Yapılacak Ülke</Label>
                      <Select value={settings.excludedUrls} onValueChange={(value) => setSettings({...settings, excludedUrls: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Türkiye" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tr">Türkiye</SelectItem>
                          <SelectItem value="us">Amerika</SelectItem>
                          <SelectItem value="uk">İngiltere</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="searchLanguage">Arama Dili</Label>
                      <Select value={settings.customUrls} onValueChange={(value) => setSettings({...settings, customUrls: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Hepsi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Hepsi</SelectItem>
                          <SelectItem value="tr">Türkçe</SelectItem>
                          <SelectItem value="en">İngilizce</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="excludedLinks">Hariç Tutulacak Linkler</Label>
                    <Input
                      id="excludedLinks"
                      placeholder="Yok"
                      value={settings.excludedUrls}
                      onChange={(e) => setSettings({...settings, excludedUrls: e.target.value})}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Linkler Makale Sonuna Eklemesin mi?
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="linkEffect"
                        checked={false}
                        onCheckedChange={() => {}}
                      />
                      <Label htmlFor="linkEffect" className="font-medium">Etkinleşmesin</Label>
                    </div>

                    <div>
                      <Label htmlFor="linkStructure">Link Yapısı</Label>
                      <Select value="nofollow" onValueChange={() => {}}>
                        <SelectTrigger>
                          <SelectValue placeholder="NoFollow (Tavsiye edilir)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nofollow">NoFollow (Tavsiye edilir)</SelectItem>
                          <SelectItem value="follow">Follow</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* İç & Dış Linkler */}
      {showStep2 && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="w-5 h-5 text-primary" />
              İç & Dış Linkler
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="internalLinks">İç Linkler</Label>
                <Select value={settings.internalLinks} onValueChange={(value) => setSettings({...settings, internalLinks: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yok">Yok</SelectItem>
                    <SelectItem value="Otomatik">Otomatik</SelectItem>
                    <SelectItem value="Manuel">Manuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="externalLinks">Dış Linkler</Label>
                <Select value={settings.externalLinks} onValueChange={(value) => setSettings({...settings, externalLinks: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yok">Yok</SelectItem>
                    <SelectItem value="Otomatik">Otomatik</SelectItem>
                    <SelectItem value="Manuel">Manuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Manuel Link Input Areas */}
            {settings.internalLinks === "Manuel" && (
              <div>
                <Label htmlFor="manualInternalLinks">Manuel İç Linkler</Label>
                <Textarea
                  id="manualInternalLinks"
                  placeholder="Her satıra bir link yazın:&#10;https://example.com/sayfa1&#10;https://example.com/sayfa2&#10;https://example.com/sayfa3"
                  className="min-h-[120px] mt-2"
                  value={settings.manualInternalLinks || ''}
                  onChange={(e) => setSettings({...settings, manualInternalLinks: e.target.value})}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Her satıra bir iç link yazın. Makale içinde uygun yerlere yerleştirilecek.
                </p>
              </div>
            )}

            {settings.externalLinks === "Manuel" && (
              <div>
                <Label htmlFor="manualExternalLinks">Manuel Dış Linkler</Label>
                <Textarea
                  id="manualExternalLinks"
                  placeholder="Her satıra bir link yazın:&#10;https://wikipedia.org/artikel1&#10;https://authoritysite.com/page&#10;https://reference.com/info"
                  className="min-h-[120px] mt-2"
                  value={settings.manualExternalLinks || ''}
                  onChange={(e) => setSettings({...settings, manualExternalLinks: e.target.value})}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Her satıra bir dış link yazın. Makale içinde uygun yerlere yerleştirilecek.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Image Options */}
      {showStep2 && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5 text-primary" />
              Görsel Seçenekleri
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="imageSource">Makale Resmi</Label>
                  <Select value={imageSource} onValueChange={(value) => {
                    setImageSource(value);
                    setSettings({...settings, imageSource: value});
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Görsel istemiyorum</SelectItem>
                      <SelectItem value="1">Unsplash (Ücretsiz)</SelectItem>
                      <SelectItem value="5">Pexels (Ücretsiz)</SelectItem>
                      <SelectItem value="6">Pixabay (Ücretsiz)</SelectItem>
                      <SelectItem value="3">Google (Ücretsiz)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Öne Çıkan Görsel Seçin */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 bg-gray-400 rounded"></div>
                  <Label className="text-gray-700 font-medium">Öne Çıkan Görsel Seçin</Label>
                  <button className="ml-auto">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">
                    <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-lg font-medium">Kendi görsellerinizi yükleyin</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Lütfen yükleme işleminden sonra öne çıkan görsel olarak seçmeyi unutmayınız
                    </p>
                  </div>
                  
                  <div className="flex gap-3 justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="featuredImageUpload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Create a URL for the file (in real implementation, upload to server)
                          const imageUrl = URL.createObjectURL(file);
                          setSettings({...settings, featuredImage: imageUrl});
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('featuredImageUpload')?.click()}
                      className="bg-blue-500 text-white hover:bg-blue-600 border-0"
                    >
                      Dosya Seç
                    </Button>
                    <Button
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        const url = prompt('Görsel URL\'sini girin:');
                        if (url) {
                          setSettings({...settings, featuredImage: url});
                        }
                      }}
                      className="border-gray-300"
                    >
                      URL'den Çek
                    </Button>
                  </div>
                  
                  {settings.featuredImage && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700">
                        ✓ Öne çıkan görsel seçildi: {settings.featuredImage.length > 50 ? settings.featuredImage.substring(0, 50) + '...' : settings.featuredImage}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSettings({...settings, featuredImage: ''})}
                        className="mt-2 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Kaldır
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Otomatik Görsel Ekleme */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoImageInsertion"
                  checked={settings.autoImageInsertion}
                  onCheckedChange={(checked) => setSettings({...settings, autoImageInsertion: checked as boolean})}
                />
                <Label htmlFor="autoImageInsertion" className="font-medium">
                  Alt başlıklara otomatik görsel ekle
                </Label>
              </div>
              
              {settings.autoImageInsertion && (
                <>
                  <div className="ml-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Otomatik Görsel Ekleme Sistemi</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Alt başlık içeriğine uygun görseller otomatik olarak bulunup eklenecek</li>
                      <li>• Örnek: "Evden Eve Nakliyat" alt başlığı için nakliyat görseli eklenecek</li>
                      <li>• Görseller paragraf sonlarına yerleştirilecek</li>
                      <li>• Kendi görsellerinizi yükleyebilir veya URL'den çekebilirsiniz</li>
                    </ul>
                  </div>

                  {/* Alt Başlık Görselleri */}
                  {generatedTitles.length > 0 && generatedTitles[0]?.subheadings && (
                    <div className="ml-6 mt-4 space-y-4">
                      <h4 className="font-medium text-gray-900">Alt Başlık Görselleri</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Her alt başlık için özel görsel seçebilirsiniz. Görsel seçmediğiniz başlıklar için otomatik görsel aranacak.
                      </p>
                      
                      {generatedTitles[0].subheadings.map((subheading: string, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-gray-800">{subheading}</h5>
                            {settings.subheadingImages[subheading] && (
                              <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                                ✓ Görsel seçildi
                              </span>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id={`subheading-image-${index}`}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const imageUrl = URL.createObjectURL(file);
                                  setSettings({
                                    ...settings,
                                    subheadingImages: {
                                      ...settings.subheadingImages,
                                      [subheading]: imageUrl
                                    }
                                  });
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById(`subheading-image-${index}`)?.click()}
                              className="bg-blue-500 text-white hover:bg-blue-600 border-0"
                            >
                              Dosya Seç
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const url = prompt(`"${subheading}" için görsel URL'sini girin:`);
                                if (url) {
                                  setSettings({
                                    ...settings,
                                    subheadingImages: {
                                      ...settings.subheadingImages,
                                      [subheading]: url
                                    }
                                  });
                                }
                              }}
                              className="border-gray-300"
                            >
                              URL'den Çek
                            </Button>
                            {settings.subheadingImages[subheading] && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newImages = { ...settings.subheadingImages };
                                  delete newImages[subheading];
                                  setSettings({
                                    ...settings,
                                    subheadingImages: newImages
                                  });
                                }}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                Kaldır
                              </Button>
                            )}
                          </div>
                          
                          {settings.subheadingImages[subheading] && (
                            <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
                              <strong>Seçili görsel:</strong> {settings.subheadingImages[subheading].length > 60 ? 
                                settings.subheadingImages[subheading].substring(0, 60) + '...' : 
                                settings.subheadingImages[subheading]
                              }
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}</div>

            {imageSource !== "0" && (
              <div className="mt-4 text-sm text-muted-foreground">
                <ul className="list-disc pl-5">
                  <li>Lütfen yukarıdaki formda her makale için resim anahtar kelimesi giriniz.</li>
                  <li>Bu servis ücretsiz bir stok görsel servisidir ve her anahtar kelimeniz için görsel bulunamayabilir.</li>
                  <li>Lütfen İngilizce bir anahtar kelime giriniz.</li>
                  <li>Lütfen makale başlığınızı resim anahtar kelimesi olarak yazmayınız.</li>
                  <li>Lütfen makalenizde görmek istediğiniz görsele dair bir anahtar kelime giriniz.</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 5: Content Features */}
      {showStep2 && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-primary" />
              İçerik Özellikleri
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="faqNormal" 
                    checked={settings.faqNormal}
                    onCheckedChange={(checked) => setSettings({...settings, faqNormal: checked as boolean})}
                  />
                  <Label htmlFor="faqNormal" className="font-medium">Sıkça Sorulan Sorular (Normal)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="faqSchema" 
                    checked={settings.faqSchema}
                    onCheckedChange={(checked) => setSettings({...settings, faqSchema: checked as boolean})}
                  />
                  <Label htmlFor="faqSchema" className="font-medium">Sıkça Sorulan Sorular (Normal + Schema)</Label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="metaDescription" 
                    checked={settings.metaDescription}
                    onCheckedChange={(checked) => setSettings({...settings, metaDescription: checked as boolean})}
                  />
                  <Label htmlFor="metaDescription" className="font-medium">Meta Açıklama</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="articleSummary" 
                    checked={settings.articleSummary}
                    onCheckedChange={(checked) => setSettings({...settings, articleSummary: checked as boolean})}
                  />
                  <Label htmlFor="articleSummary" className="font-medium">Makale Özeti</Label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="table" 
                    checked={settings.table}
                    onCheckedChange={(checked) => setSettings({...settings, table: checked as boolean})}
                  />
                  <Label htmlFor="table" className="font-medium">Tablo</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="list" 
                    checked={settings.list}
                    onCheckedChange={(checked) => setSettings({...settings, list: checked as boolean})}
                  />
                  <Label htmlFor="list" className="font-medium">Liste</Label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="boldText" 
                    checked={settings.boldText}
                    onCheckedChange={(checked) => setSettings({...settings, boldText: checked as boolean})}
                  />
                  <Label htmlFor="boldText" className="font-medium">Kalın Yazılar</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="italicText" 
                    checked={settings.italicText}
                    onCheckedChange={(checked) => setSettings({...settings, italicText: checked as boolean})}
                  />
                  <Label htmlFor="italicText" className="font-medium">İtalik Yazılar</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="quote" 
                    checked={settings.quote}
                    onCheckedChange={(checked) => setSettings({...settings, quote: checked as boolean})}
                  />
                  <Label htmlFor="quote" className="font-medium">Alıntı</Label>
                </div>
              </div>
            </div>

            <hr className="my-6 border-dashed" />

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="customHtmlPosition">Özel HTML</Label>
                <Select value={settings.customHtmlPosition} onValueChange={(value) => setSettings({...settings, customHtmlPosition: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Eklenmesin</SelectItem>
                    <SelectItem value="start">Makalelerin En Başına</SelectItem>
                    <SelectItem value="middle">Makalelerin Ortalarına</SelectItem>
                    <SelectItem value="end">Makalelerin En Sonuna</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {settings.customHtmlPosition !== "none" && (
              <div className="mt-4">
                <Label htmlFor="customHtml">HTML Kodu</Label>
                <Textarea
                  id="customHtml"
                  placeholder="HTML kodunuzu buraya giriniz"
                  value={settings.customHtml}
                  onChange={(e) => setSettings({...settings, customHtml: e.target.value})}
                  rows={4}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 6: Publishing Settings */}
      {showStep2 && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Sitenizde Yayınlama
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="website">Web Sitesi</Label>
                <Select 
                  value={settings.website} 
                  onValueChange={(value) => {
                    setSettings({...settings, website: value, categoryId: ""});
                    // Trigger category sync when website is selected
                    if (value && value !== "none" && websites && websites.length > 0) {
                      const selectedWebsite = websites.find(w => w.id.toString() === value);
                      if (selectedWebsite) {
                        syncWebsiteMutation.mutate(selectedWebsite.id);
                      }
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Lütfen bir web sitesi seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {!websites || websites.length === 0 ? (
                      <SelectItem value="none">Henüz web siteniz bulunmuyor</SelectItem>
                    ) : (
                      websites.map((website) => (
                        <SelectItem key={website.id} value={website.id.toString()}>
                          {website.url}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Kategori</Label>
                <Select value={settings.categoryId} onValueChange={(value) => setSettings({...settings, categoryId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Lütfen bir kategori seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Kategori seçiniz</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id?.toString() || "default"}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="publishStatus">Yayınlama Durumu</Label>
                <Select value={settings.publishStatus} onValueChange={(value) => setSettings({...settings, publishStatus: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Taslak</SelectItem>
                    <SelectItem value="publish">Yayınla</SelectItem>
                    <SelectItem value="private">Özel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <Label htmlFor="tags">Etiketler</Label>
                <Input
                  id="tags"
                  placeholder="Etiketleri virgül ile ayırarak giriniz"
                  value={settings.tags}
                  onChange={(e) => setSettings({...settings, tags: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}




      {/* Final Action */}
      {showStep2 && (
        <Card className="border-2 border-primary">
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <Button 
                size="lg" 
                className="px-8"
                onClick={handleGenerateArticles}
                disabled={generateArticlesMutation.isPending}
              >
                <Edit className="w-4 h-4 mr-2" />
                {generateArticlesMutation.isPending ? "Oluşturuluyor..." : "Makaleleri Oluştur"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}