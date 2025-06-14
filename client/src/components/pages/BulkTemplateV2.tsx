import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
import { Info, Layers, Heading, Settings, Image, Edit, Globe, Link, Youtube } from "lucide-react";
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
  tags: string;
  publishStatus: string;
  publishDate: string;
}

interface GeneratedTitle {
  title: string;
  focusKeyword: string;
  imageKeyword: string;
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
    imageSource: "0",
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
    tags: "",
    publishStatus: "draft",
    publishDate: ""
  });

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
      toast({
        title: "Başarılı",
        description: `${data.successCount} makale oluşturuldu!`,
      });
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
      toast({
        title: "Hata",
        description: error.message || "Makale oluşturma işlemi başarısız oldu",
        variant: "destructive",
      });
      setLoading(false);
    },
  });

  const handleFileSelect = (file: File) => {
    // Excel file processing will be handled here
    console.log("Excel file selected:", file.name);
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

              {selectedGenerateType === "4" && (
                <div>
                  <Label htmlFor="customTitle">Makale Başlıkları</Label>
                  <Textarea
                    id="customTitle"
                    rows={10}
                    placeholder="Lütfen her satıra sadece 1 adet başlık yazınız"
                    value={settings.customTitle}
                    onChange={(e) => setSettings({...settings, customTitle: e.target.value})}
                    className="resize-none"
                  />
                  <div className="text-sm text-muted-foreground mt-2">
                    <p>* Lütfen <span className="underline">her satıra sadece 1 adet başlık</span> yazınız.</p>
                    <p>* En fazla 40 adet başlık girebilirsiniz.</p>
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Generated Titles (Only show if titles are generated) */}
      {showStep2 && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heading className="w-5 h-5 text-primary" />
              Makale Başlıkları
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Alert className="mb-6">
              <Info className="w-4 h-4" />
              <AlertDescription>
                Lütfen makale başlıkları, odak anahtar kelimeler ve resim anahtar kelimelerini kontrol ederek gerekli gördüğünüz düzenlemeleri yapmayı unutmayın.
              </AlertDescription>
            </Alert>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Makale Başlığı</th>
                    <th className="text-left p-2 font-medium">Odak Anahtar Kelime</th>
                    {imageSource !== "0" && (
                      <th className="text-left p-2 font-medium">Resim Anahtar Kelimesi</th>
                    )}
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {generatedTitles.map((title, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">
                        <Input
                          value={title.title}
                          onChange={(e) => updateGeneratedTitle(index, 'title', e.target.value)}
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          value={title.focusKeyword}
                          onChange={(e) => updateGeneratedTitle(index, 'focusKeyword', e.target.value)}
                        />
                      </td>
                      {imageSource !== "0" && (
                        <td className="p-2">
                          <Input
                            value={title.imageKeyword}
                            onChange={(e) => updateGeneratedTitle(index, 'imageKeyword', e.target.value)}
                          />
                        </td>
                      )}
                      <td className="p-2">
                        <Button variant="ghost" size="sm">×</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: General Settings */}
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
                <Label htmlFor="sectionLength">Bölüm Uzunluğu</Label>
                <Select value={settings.sectionLength} onValueChange={(value) => setSettings({...settings, sectionLength: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="s">Kısa [1.000-1.500 kelime]</SelectItem>
                    <SelectItem value="m">Orta [1.200-1.700 kelime]</SelectItem>
                    <SelectItem value="l">Uzun [1.500-2.000 kelime]</SelectItem>
                    <SelectItem value="xl">Çok Uzun [2.000-2.500 kelime]</SelectItem>
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
                <Label htmlFor="subheadingCount">Alt Başlık Sayısı (H2)</Label>
                <Select value={settings.subheadingCount} onValueChange={(value) => setSettings({...settings, subheadingCount: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Lütfen bir alt başlık sayısı seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 20}, (_, i) => (
                      <SelectItem key={i+1} value={String(i+1)}>{i+1}</SelectItem>
                    ))}
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
                <Select value={settings.website} onValueChange={(value) => setSettings({...settings, website: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Lütfen bir web sitesi seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Henüz web siteniz bulunmuyor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Kategori</Label>
                <Select value={settings.category} onValueChange={(value) => setSettings({...settings, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Lütfen bir kategori seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Kategori seçmek için önce web sitesi seçiniz</SelectItem>
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

      {/* Step 7: Final Action */}
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