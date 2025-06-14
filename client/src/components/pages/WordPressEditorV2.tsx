import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface WordPressV2EditorProps {
  setLoading: (loading: boolean) => void;
}

interface WordPressV2Settings {
  // Genel Ayarlar
  language: string;
  aiModel: string;
  classifier: string;
  writingStyle: string;
  narrator: string;
  writingType: string;
  targetKeyword: string;
  sectionLength: string;
  
  // Başlık Ayarları
  focusKeyword: string;
  articleTopic: string;
  articleTitle: string;
  titleType: string;
  titleCount: number;
  
  // Güncel Bilgiler
  currentInfo: string;
  searchSource: string;
  searchQuery: string;
  searchLanguage: string;
  searchDate: string;
  linksAfterEffect: string;
  linkStructure: string;
  
  // Anahtar Kelimeler
  keywords: string;
  keywordType: string;
  
  // Alt Başlıklar
  creationType: string;
  suggestionType: string;
  promptType: string;
  subtitleType: string;
  h2Count: number;
  
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

export default function WordPressEditorV2({ setLoading }: WordPressV2EditorProps) {
  const [settings, setSettings] = useState<WordPressV2Settings>({
    // Genel Ayarlar
    language: 'Türkçe',
    aiModel: 'Gemini 2.5 Flash Preview',
    classifier: '',
    writingStyle: '',
    narrator: '',
    writingType: '',
    targetKeyword: '',
    sectionLength: 'Çok Uzun (1.500-2.000 kelime)',
    
    // Başlık Ayarları
    focusKeyword: '',
    articleTopic: '',
    articleTitle: '',
    titleType: 'Genel',
    titleCount: 10,
    
    // Güncel Bilgiler
    currentInfo: 'Evet (Ekstra Kredi)',
    searchSource: 'Google Organik Arama',
    searchQuery: '',
    searchLanguage: 'Türkçe',
    searchDate: 'Hepsi',
    linksAfterEffect: 'Yok',
    linkStructure: 'NoFollow (Tavsiye edilir)',
    
    // Anahtar Kelimeler
    keywords: '',
    keywordType: 'Anahtar Kelime Kümesi',
    
    // Alt Başlıklar
    creationType: 'Şimdi oluşturacağım',
    suggestionType: 'Özelleşmiş Öneri',
    promptType: 'Prompt 1 (Tavsiye edilir)',
    subtitleType: 'H2 + H3',
    h2Count: 20,
    
    // Görsel Seçenekleri
    articleImage: 'Görsel istemiyorum',
    
    // İçerik Özellikleri
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
    customHtml: 'Eklenmesim',
    
    // Yayınlama
    website: '',
    category: '',
    tags: '',
    publishStatus: '',
    
    // İç & Dış Linkler
    internalLinks: 'Yok',
    externalLinks: 'Yok'
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      setLoading(true);
      const response = await apiRequest('POST', '/api/wordpress/generate-v2', settings);
      return await response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Başarılı!",
        description: "WordPress V2 makalesi başarıyla oluşturuldu.",
      });
      setLoading(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: "Makale oluşturulurken bir hata oluştu: " + error.message,
        variant: "destructive",
      });
      setLoading(false);
    },
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">WordPress Makalesi V2</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">Geliştirmeler</Button>
          <Button variant="outline" size="sm">✨ Fiyatlar</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Genel Ayarlar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">⚙️</span>
              </div>
              Genel Ayarlar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-sm">Makale Dili</Label>
                <Select value={settings.language} onValueChange={(value) => setSettings({...settings, language: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Türkçe">🇹🇷 Türkçe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm">Yapay Zeka Modeli</Label>
                <Select value={settings.aiModel} onValueChange={(value) => setSettings({...settings, aiModel: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gemini 2.5 Flash Preview">
                      Gemini 2.5 Flash Preview
                      <Badge variant="secondary" className="ml-2 text-xs">1 kelime: 1 kredi</Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm">Klasör</Label>
                <Select value={settings.classifier} onValueChange={(value) => setSettings({...settings, classifier: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Makaleniz için bir klasör seçebilirsiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="genel">Genel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-sm">Yazı Stili</Label>
                <Select value={settings.writingStyle} onValueChange={(value) => setSettings({...settings, writingStyle: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Makaleniz için bir yazım tarzı seçebilirsiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="genel">Genel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm">Anlatıcı / Bakış Açısı</Label>
                <Select value={settings.narrator} onValueChange={(value) => setSettings({...settings, narrator: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Genel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="genel">Genel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm">Yazı Türü</Label>
                <Select value={settings.writingType} onValueChange={(value) => setSettings({...settings, writingType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Genel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="genel">Genel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Hedef Kitle</Label>
                <Select value={settings.targetKeyword} onValueChange={(value) => setSettings({...settings, targetKeyword: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Genel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="genel">Genel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm">Bölüm Uzunluğu</Label>
                <Select value={settings.sectionLength} onValueChange={(value) => setSettings({...settings, sectionLength: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Çok Uzun (1.500-2.000 kelime)">Çok Uzun (1.500-2.000 kelime)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-orange-600 mt-1">
                  Uyarı: Lütfen çok uzun seçeneğini kullanırken dikkatlı olunuz. Yanlış kullanımda çok uzun makalelerin oluşturulmasına ve bu da çok fazla kredininizin harcanmasına sebep olabilir.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Başlık Ayarları */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm">H</span>
              </div>
              Başlık Ayarları
              <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center ml-auto">
                <span className="text-white text-xs">💡</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm">Odak Anahtar Kelime</Label>
              <Input
                placeholder="Sadece 1 adet odak anahtar kelime giriniz"
                value={settings.focusKeyword}
                onChange={(e) => setSettings({...settings, focusKeyword: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-sm">Başlık Tipi</Label>
                <Select value={settings.titleType} onValueChange={(value) => setSettings({...settings, titleType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Genel">Genel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm">Öneri Tipi</Label>
                <Select value={settings.suggestionType} onValueChange={(value) => setSettings({...settings, suggestionType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Genel Öneri">Genel Öneri</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label className="text-sm">Başlık Adedi</Label>
                  <Input
                    type="number"
                    value={settings.titleCount}
                    onChange={(e) => setSettings({...settings, titleCount: parseInt(e.target.value)})}
                  />
                </div>
                <Button size="sm">Üret</Button>
              </div>
            </div>

            <div>
              <Label className="text-sm">Makale Konusu</Label>
              <Textarea
                placeholder="(Zorunlu Değil) Daha kaliteli başlıklar için makale konunuzu kısaca girmeniz (tavsiye ederiz)"
                value={settings.articleTopic}
                onChange={(e) => setSettings({...settings, articleTopic: e.target.value})}
                rows={3}
              />
            </div>

            <div>
              <Label className="text-sm">Makale Başlığı</Label>
              <Textarea
                placeholder="Lütfen bir makale başlığı giriniz veya yapay zeka yardımı ile oluşturunuz"
                value={settings.articleTitle}
                onChange={(e) => setSettings({...settings, articleTitle: e.target.value})}
                rows={2}
              />
              <p className="text-xs text-orange-600 mt-1">
                💡 Lütfen odak anahtar kelimenizin makale başlığı içinde geçtiğinden emin olun.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Güncel Bilgiler */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">🌟</span>
              </div>
              Güncel Bilgiler
              <Badge variant="secondary" className="bg-green-500 text-white">YENİ</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm">Güncel Bilgiler</Label>
              <Select value={settings.currentInfo} onValueChange={(value) => setSettings({...settings, currentInfo: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Evet (Ekstra Kredi)">Evet (Ekstra Kredi)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-slate-600 mt-1">
                Bu özelliği etkinleştirdiğinizde içerik oluşturulurken önce webde güncel bilgiler aranır, sonra doğrulanan veriler toplanır ve bu bilgiler kullanılarak içerik üretilir. Bu sayede oluşturulan içerikler en yeni ve doğru bilgileri içerir.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Arama Kaynağı</Label>
                <Select value={settings.searchSource} onValueChange={(value) => setSettings({...settings, searchSource: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Google Organik Arama">Google Organik Arama</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm">Arama Sorgusu</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Aramak istediğiniz sorguyu giriniz"
                    value={settings.searchQuery}
                    onChange={(e) => setSettings({...settings, searchQuery: e.target.value})}
                  />
                  <Button size="sm" variant="outline">⚡</Button>
                  <Button size="sm" variant="outline">🔍</Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-sm">Arama Yapılacak Ülke</Label>
                <Select value={settings.searchLanguage} onValueChange={(value) => setSettings({...settings, searchLanguage: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Türkiye">Türkiye</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm">Arama Dili</Label>
                <Select value={settings.searchDate} onValueChange={(value) => setSettings({...settings, searchDate: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Türkçe">Türkçe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm">Arama Tarihi</Label>
                <Select value={settings.searchDate} onValueChange={(value) => setSettings({...settings, searchDate: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hepsi">Hepsi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-sm">Hariç Tutulacak Linkler</Label>
                <Select value={settings.linksAfterEffect} onValueChange={(value) => setSettings({...settings, linksAfterEffect: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yok">Yok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm">Linkler Makale Sonuna Eklensin mi?</Label>
                <Select value={settings.linkStructure} onValueChange={(value) => setSettings({...settings, linkStructure: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Eklenmesim">Eklenmesim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm">Link Yapısı</Label>
                <Select value={settings.linkStructure} onValueChange={(value) => setSettings({...settings, linkStructure: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NoFollow (Tavsiye edilir)">NoFollow (Tavsiye edilir)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Anahtar Kelimeler */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">🔍</span>
              </div>
              Anahtar Kelimeler
              <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center ml-auto">
                <span className="text-white text-xs">💡</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm">Anahtar Kelimeler</Label>
              <Input
                placeholder="Anahtar kelimeleri arasında virgül koyarak giriniz"
                value={settings.keywords}
                onChange={(e) => setSettings({...settings, keywords: e.target.value})}
              />
              <p className="text-xs text-orange-600 mt-1">
                💡 Lütfen en fazla 3-4 adet anahtar kelime kullanın.
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <Label className="text-sm">Anahtar Kelime Tipi</Label>
                <Select value={settings.keywordType} onValueChange={(value) => setSettings({...settings, keywordType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Anahtar Kelime Kümesi">Anahtar Kelime Kümesi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" className="mt-6">Üret</Button>
            </div>
          </CardContent>
        </Card>

        {/* Alt Başlıklar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm">H</span>
              </div>
              Alt Başlıklar
              <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center ml-auto">
                <span className="text-white text-xs">💡</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm">Oluşturma Tipi</Label>
              <Select value={settings.creationType} onValueChange={(value) => setSettings({...settings, creationType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Şimdi oluşturacağım">Şimdi oluşturacağım</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-slate-600 mt-1">
                Aşağıdaki "Üret" butonunu kullanarak ya da kendiniz manuel girerek alt başlıkları oluşturabilirsiniz.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label className="text-sm">Öneri Tipi</Label>
                <Select value={settings.suggestionType} onValueChange={(value) => setSettings({...settings, suggestionType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Özelleşmiş Öneri">Özelleşmiş Öneri</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm">Prompt Tipi</Label>
                <Select value={settings.promptType} onValueChange={(value) => setSettings({...settings, promptType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Prompt 1 (Tavsiye edilir)">Prompt 1 (Tavsiye edilir)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm">Alt Başlık Tipi</Label>
                <Select value={settings.subtitleType} onValueChange={(value) => setSettings({...settings, subtitleType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="H2 + H3">H2 + H3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label className="text-sm">H2 Adet</Label>
                  <Input
                    type="number"
                    value={settings.h2Count}
                    onChange={(e) => setSettings({...settings, h2Count: parseInt(e.target.value)})}
                  />
                </div>
                <Button size="sm">Üret</Button>
                <Button size="sm" variant="outline">+</Button>
                <Button size="sm" variant="outline">📋</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Görsel Seçenekleri */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">🖼️</span>
              </div>
              Görsel Seçenekleri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label className="text-sm">Makale Görseli</Label>
              <Select value={settings.articleImage} onValueChange={(value) => setSettings({...settings, articleImage: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Görsel istemiyorum">Görsel istemiyorum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* İçerik Özellikleri */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">📝</span>
              </div>
              İçerik Özellikleri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-3">
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
                    id="metaDescription" 
                    checked={settings.metaDescription}
                    onCheckedChange={(checked) => setSettings({...settings, metaDescription: checked as boolean})}
                  />
                  <Label htmlFor="metaDescription" className="text-sm">Meta Açıklama</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="quote" 
                    checked={settings.quote}
                    onCheckedChange={(checked) => setSettings({...settings, quote: checked as boolean})}
                  />
                  <Label htmlFor="quote" className="text-sm">Alıntı</Label>
                </div>
              </div>
              
              <div className="space-y-3">
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
                    id="table" 
                    checked={settings.table}
                    onCheckedChange={(checked) => setSettings({...settings, table: checked as boolean})}
                  />
                  <Label htmlFor="table" className="text-sm">Tablo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="boldText" 
                    checked={settings.boldText}
                    onCheckedChange={(checked) => setSettings({...settings, boldText: checked as boolean})}
                  />
                  <Label htmlFor="boldText" className="text-sm">Kalın Yazılar</Label>
                </div>
              </div>
              
              <div className="space-y-3">
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
                    id="list" 
                    checked={settings.list}
                    onCheckedChange={(checked) => setSettings({...settings, list: checked as boolean})}
                  />
                  <Label htmlFor="list" className="text-sm">Liste</Label>
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
              </div>
            </div>

            <div className="mt-4">
              <Label className="text-sm">Özel HTML</Label>
              <Select value={settings.customHtml} onValueChange={(value) => setSettings({...settings, customHtml: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Eklenmesim">Eklenmesim</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Yayınlama */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm">🚀</span>
              </div>
              Yayınlama
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm">Web Sitesi</Label>
              <Select value={settings.website} onValueChange={(value) => setSettings({...settings, website: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Lütfen bir web sitesi seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="site1">Site 1</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Kategori</Label>
                <Select value={settings.category} onValueChange={(value) => setSettings({...settings, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Lütfen önce bir web sitesi seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="genel">Genel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm">Etiketler</Label>
                <Select value={settings.tags} onValueChange={(value) => setSettings({...settings, tags: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Lütfen önce bir web sitesi seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="etiket1">Etiket 1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-sm">Yayın Durumu</Label>
              <Select value={settings.publishStatus} onValueChange={(value) => setSettings({...settings, publishStatus: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Lütfen bir yayın durumu seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Taslak</SelectItem>
                  <SelectItem value="publish">Yayınla</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* İç & Dış Linkler */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">🔗</span>
              </div>
              İç & Dış Linkler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm">İç Linkler</Label>
              <Select value={settings.internalLinks} onValueChange={(value) => setSettings({...settings, internalLinks: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yok">Yok</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm">Dış Linkler</Label>
              <Select value={settings.externalLinks} onValueChange={(value) => setSettings({...settings, externalLinks: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yok">Yok</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generate Button */}
      <div className="mt-8 flex justify-center">
        <Button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending || !settings.focusKeyword}
          className="bg-blue-600 text-white px-8 py-3 text-lg"
          size="lg"
        >
          {generateMutation.isPending ? "Oluşturuluyor..." : "✨ Makale Oluştur"}
        </Button>
      </div>
    </div>
  );
}