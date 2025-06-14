import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Link2, Settings, Image, FileText, Upload, Link } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface URLRewriteSettings {
  // URL
  url: string;
  
  // Genel Ayarlar
  language: string;
  aiModel: string;
  classifier: string;
  writingStyle: string;
  targetAudience: string;
  narrator: string;
  
  // Görsel Seçenekleri
  articleImage: string;
  
  // İçerik Özellikleri
  faqNormal: boolean;
  faqSchema: boolean;
  metaDescription: boolean;
  articleSummary: boolean;
  table: boolean;
  list: boolean;
  quote: boolean;
  boldText: boolean;
  italicText: boolean;
  youtubeVideo: boolean;
  customHtml: string;
  
  // Yayınlama
  website: string;
  category: string;
  tags: string;
  publishStatus: string;
  
  // İç & Dış Linkler
  internalLinks: string;
  externalLinks: string;
}

interface Website {
  id: number;
  url: string;
  name: string;
  platform: string;
  categories?: string[];
}

export default function URLRewrite() {
  // Fetch websites
  const { data: websites = [] } = useQuery<Website[]>({
    queryKey: ['/api/websites'],
    retry: false,
  });

  // Fetch categories for selected website
  const selectedWebsite = websites.find(w => w.id.toString() === settings.website);
  const categories = selectedWebsite?.categories || [];

  const [settings, setSettings] = useState<URLRewriteSettings>({
    url: "",
    language: "Türkçe",
    aiModel: "Gemini 2.5 Flash Preview",
    classifier: "",
    writingStyle: "",
    targetAudience: "Genel",
    narrator: "Genel",
    articleImage: "Görsel istemiyorum",
    faqNormal: false,
    faqSchema: false,
    metaDescription: false,
    articleSummary: false,
    table: false,
    list: false,
    quote: false,
    boldText: true,
    italicText: false,
    youtubeVideo: false,
    customHtml: "Eklenmesin",
    website: "",
    category: "",
    tags: "",
    publishStatus: "",
    internalLinks: "Yok",
    externalLinks: "Yok"
  });

  const [openSections, setOpenSections] = useState({
    general: true,
    visual: false,
    content: false,
    publishing: false,
    links: false
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const urlRewriteMutation = useMutation({
    mutationFn: async (settings: URLRewriteSettings) => {
      return await apiRequest("/api/url-rewrite", "POST", settings);
    },
    onSuccess: (data) => {
      toast({
        title: "Başarılı",
        description: "URL içeriği başarıyla yeniden yazıldı!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Oturum Süresi Doldu",
          description: "Lütfen tekrar giriş yapın",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Hata",
        description: error.message || "URL yeniden yazma işlemi başarısız oldu",
        variant: "destructive",
      });
    },
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleGenerate = () => {
    if (!settings.url) {
      toast({
        title: "Hata",
        description: "Lütfen bir URL girin",
        variant: "destructive",
      });
      return;
    }
    
    urlRewriteMutation.mutate(settings);
  };

  return (
    <div className="space-y-6">
      {/* URL Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Link2 className="w-5 h-5 text-purple-600" />
            URL
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              placeholder="https://"
              value={settings.url}
              onChange={(e) => setSettings({...settings, url: e.target.value})}
              className="text-base"
            />
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Lütfen yeniden yazılmasını istediğiniz yazının URL bilgisini giriniz.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Bu bölüm <strong>makale formatındaki içerikler</strong> için idealdir. Diğer içerikler için kullanmanızı tavsiye etmiyoruz.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Linkteği görseller, videolar, galeri, form gibi öğeler alınmamaktadır <strong>sadece metin</strong> yeniden yazılmaktadır.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Daha detaylı bilgi almak için lütfen <a href="#" className="text-red-500 underline">tıklayınız</a>.</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Genel Ayarlar */}
      <Card>
        <Collapsible open={openSections.general} onOpenChange={() => toggleSection('general')}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-600" />
                  Genel Ayarlar
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${openSections.general ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="language">Makale Dili</Label>
                <Select value={settings.language} onValueChange={(value) => setSettings({...settings, language: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Türkçe">🇹🇷 Türkçe</SelectItem>
                    <SelectItem value="English">🇺🇸 English</SelectItem>
                    <SelectItem value="Deutsch">🇩🇪 Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                <Label htmlFor="classifier">Klasör</Label>
                <Select value={settings.classifier} onValueChange={(value) => setSettings({...settings, classifier: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Makaleniz için bir klasör seçebilirsiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="genel">Genel</SelectItem>
                    <SelectItem value="teknoloji">Teknoloji</SelectItem>
                    <SelectItem value="saglik">Sağlık</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="writingStyle">Yazı Stili</Label>
                <Select value={settings.writingStyle} onValueChange={(value) => setSettings({...settings, writingStyle: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Makaleniz için bir yazı stili seçebilirsiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="genel">Genel</SelectItem>
                    <SelectItem value="resmi">Resmi</SelectItem>
                    <SelectItem value="samimi">Samimi</SelectItem>
                    <SelectItem value="akademik">Akademik</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="text-red-500">İpucu:</span> Oluşturulan yazının, kaynak linklerinden daha farklı olması için konuya uygun bir yazı stili segmentini tavsiye ediyoruz.
                </p>
              </div>

              <div>
                <Label htmlFor="targetAudience">Hedef Kitle ℹ️</Label>
                <Select value={settings.targetAudience} onValueChange={(value) => setSettings({...settings, targetAudience: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Genel">Genel</SelectItem>
                    <SelectItem value="Uzman">Uzman</SelectItem>
                    <SelectItem value="Yeni Başlayan">Yeni Başlayan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="narrator">Anlatıcı / Bakış Açısı ℹ️</Label>
                <Select value={settings.narrator} onValueChange={(value) => setSettings({...settings, narrator: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Genel">Genel</SelectItem>
                    <SelectItem value="Birinci Şahıs">Birinci Şahıs</SelectItem>
                    <SelectItem value="Üçüncü Şahıs">Üçüncü Şahıs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Görsel Seçenekleri */}
      <Card>
        <Collapsible open={openSections.visual} onOpenChange={() => toggleSection('visual')}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Image className="w-5 h-5 text-purple-600" />
                  Görsel Seçenekleri
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${openSections.visual ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div>
                <Label htmlFor="articleImage">Makale Görseli</Label>
                <Select value={settings.articleImage} onValueChange={(value) => setSettings({...settings, articleImage: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Görsel istemiyorum">Görsel istemiyorum</SelectItem>
                    <SelectItem value="AI ile oluştur">AI ile oluştur</SelectItem>
                    <SelectItem value="Manuel yükle">Manuel yükle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* İçerik Özellikleri */}
      <Card>
        <Collapsible open={openSections.content} onOpenChange={() => toggleSection('content')}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  İçerik Özellikleri
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${openSections.content ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="faqNormal"
                  checked={settings.faqNormal}
                  onCheckedChange={(checked) => setSettings({...settings, faqNormal: checked as boolean})}
                />
                <Label htmlFor="faqNormal" className="text-sm">Sıkça Sorulan Sorular (Normal)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="faqSchema"
                  checked={settings.faqSchema}
                  onCheckedChange={(checked) => setSettings({...settings, faqSchema: checked as boolean})}
                />
                <Label htmlFor="faqSchema" className="text-sm">Sıkça Sorulan Sorular (Normal + Schema)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="metaDescription"
                  checked={settings.metaDescription}
                  onCheckedChange={(checked) => setSettings({...settings, metaDescription: checked as boolean})}
                />
                <Label htmlFor="metaDescription" className="text-sm">Meta Açıklama</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="articleSummary"
                  checked={settings.articleSummary}
                  onCheckedChange={(checked) => setSettings({...settings, articleSummary: checked as boolean})}
                />
                <Label htmlFor="articleSummary" className="text-sm">Makale Özeti</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="table"
                  checked={settings.table}
                  onCheckedChange={(checked) => setSettings({...settings, table: checked as boolean})}
                />
                <Label htmlFor="table" className="text-sm">Tablo ℹ️</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="list"
                  checked={settings.list}
                  onCheckedChange={(checked) => setSettings({...settings, list: checked as boolean})}
                />
                <Label htmlFor="list" className="text-sm">Liste ℹ️</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="quote"
                  checked={settings.quote}
                  onCheckedChange={(checked) => setSettings({...settings, quote: checked as boolean})}
                />
                <Label htmlFor="quote" className="text-sm">Alıntı</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="boldText"
                  checked={settings.boldText}
                  onCheckedChange={(checked) => setSettings({...settings, boldText: checked as boolean})}
                />
                <Label htmlFor="boldText" className="text-sm">Kalın Yazılar</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="italicText"
                  checked={settings.italicText}
                  onCheckedChange={(checked) => setSettings({...settings, italicText: checked as boolean})}
                />
                <Label htmlFor="italicText" className="text-sm">İtalik Yazılar</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="youtubeVideo"
                  checked={settings.youtubeVideo}
                  onCheckedChange={(checked) => setSettings({...settings, youtubeVideo: checked as boolean})}
                />
                <Label htmlFor="youtubeVideo" className="text-sm">YouTube Video</Label>
              </div>

              <div className="col-span-2 md:col-span-4">
                <Label htmlFor="customHtml">Özel HTML</Label>
                <Select value={settings.customHtml} onValueChange={(value) => setSettings({...settings, customHtml: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Eklenmesin">Eklenmesin</SelectItem>
                    <SelectItem value="Özel kod ekle">Özel kod ekle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Yayınlama */}
      <Card>
        <Collapsible open={openSections.publishing} onOpenChange={() => toggleSection('publishing')}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-purple-600" />
                  Yayınlama
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${openSections.publishing ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="website">Web Sitesi</Label>
                <Select value={settings.website} onValueChange={(value) => setSettings({...settings, website: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Lütfen bir web sitesi seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {websites.length === 0 ? (
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
                <Select value={settings.category} onValueChange={(value) => setSettings({...settings, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Lütfen önce bir web sitesi seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {!settings.website || settings.website === "none" ? (
                      <SelectItem value="none">Kategori seçmek için önce web sitesi seçiniz</SelectItem>
                    ) : categories.length === 0 ? (
                      <SelectItem value="none">Bu web sitesinde kategori bulunamadı</SelectItem>
                    ) : (
                      categories.map((category, index) => (
                        <SelectItem key={index} value={category}>
                          {category}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tags">Etiketler</Label>
                <Select value={settings.tags} onValueChange={(value) => setSettings({...settings, tags: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Lütfen önce bir web sitesi seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tag1">Tag 1</SelectItem>
                    <SelectItem value="tag2">Tag 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="publishStatus">Yayın Durumu</Label>
                <Select value={settings.publishStatus} onValueChange={(value) => setSettings({...settings, publishStatus: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Lütfen bir yayın durumu seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Taslak</SelectItem>
                    <SelectItem value="published">Yayınlanmış</SelectItem>
                    <SelectItem value="scheduled">Zamanlanmış</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* İç & Dış Linkler */}
      <Card>
        <Collapsible open={openSections.links} onOpenChange={() => toggleSection('links')}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Link className="w-5 h-5 text-purple-600" />
                  İç & Dış Linkler
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${openSections.links ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="internalLinks">İç Linkler ℹ️</Label>
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
                <Label htmlFor="externalLinks">Dış Linkler ℹ️</Label>
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
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Generate Button */}
      <div className="flex justify-center">
        <Button 
          onClick={handleGenerate}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
          disabled={!settings.url || urlRewriteMutation.isPending}
        >
          {urlRewriteMutation.isPending ? (
            <>
              <span className="mr-2 animate-spin">⟳</span>
              İşleniyor...
            </>
          ) : (
            <>
              <span className="mr-2">🔄</span>
              Yeniden Yazdır
            </>
          )}
        </Button>
      </div>
    </div>
  );
}