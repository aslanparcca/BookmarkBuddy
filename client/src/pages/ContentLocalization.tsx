import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Globe, Languages, MapPin, Users, Calendar, Zap, Download, Copy, RefreshCw } from "lucide-react";

interface ContentLocalizationProps {
  setLoading: (loading: boolean) => void;
}

interface LocalizationResult {
  language: string;
  country: string;
  content: string;
  culturalAdaptations: string[];
  localizationScore: number;
}

export default function ContentLocalization({ setLoading }: ContentLocalizationProps) {
  const [originalContent, setOriginalContent] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("tr");
  const [targetMarkets, setTargetMarkets] = useState<string[]>([]);
  const [contentType, setContentType] = useState("marketing");
  const [culturalAdaptation, setCulturalAdaptation] = useState(true);
  const [localizationResults, setLocalizationResults] = useState<LocalizationResult[]>([]);
  const [processingProgress, setProcessingProgress] = useState(0);

  const { toast } = useToast();

  const languages = [
    { code: "tr", name: "Türkçe", flag: "🇹🇷", markets: ["Turkey"] },
    { code: "en", name: "English", flag: "🇺🇸", markets: ["United States", "United Kingdom", "Canada", "Australia"] },
    { code: "de", name: "Deutsch", flag: "🇩🇪", markets: ["Germany", "Austria", "Switzerland"] },
    { code: "fr", name: "Français", flag: "🇫🇷", markets: ["France", "Canada", "Belgium", "Switzerland"] },
    { code: "es", name: "Español", flag: "🇪🇸", markets: ["Spain", "Mexico", "Argentina", "Colombia"] },
    { code: "it", name: "Italiano", flag: "🇮🇹", markets: ["Italy"] },
    { code: "pt", name: "Português", flag: "🇧🇷", markets: ["Brazil", "Portugal"] },
    { code: "ru", name: "Русский", flag: "🇷🇺", markets: ["Russia", "Kazakhstan"] },
    { code: "ar", name: "العربية", flag: "🇸🇦", markets: ["Saudi Arabia", "UAE", "Egypt"] },
    { code: "zh", name: "中文", flag: "🇨🇳", markets: ["China", "Taiwan", "Hong Kong"] },
    { code: "ja", name: "日本語", flag: "🇯🇵", markets: ["Japan"] },
    { code: "ko", name: "한국어", flag: "🇰🇷", markets: ["South Korea"] }
  ];

  const markets = [
    { code: "US", name: "Amerika Birleşik Devletleri", flag: "🇺🇸", culture: "Individualist, Doğrudan İletişim" },
    { code: "UK", name: "Birleşik Krallık", flag: "🇬🇧", culture: "Nezaket, Ironi Kullanımı" },
    { code: "DE", name: "Almanya", flag: "🇩🇪", culture: "Disiplin, Detaycı, Zamanında" },
    { code: "FR", name: "Fransa", flag: "🇫🇷", culture: "Kültür Odaklı, Sanat Sevgisi" },
    { code: "ES", name: "İspanya", flag: "🇪🇸", culture: "Sosyal, Aile Değerleri" },
    { code: "IT", name: "İtalya", flag: "🇮🇹", culture: "Tutku, Sanat, Gastronomi" },
    { code: "BR", name: "Brezilya", flag: "🇧🇷", culture: "Sıcakkanlı, Sosyal" },
    { code: "JP", name: "Japonya", flag: "🇯🇵", culture: "Saygı, Uyum, Kalite" },
    { code: "CN", name: "Çin", flag: "🇨🇳", culture: "Kolektif, Uzun Vadeli" },
    { code: "KR", name: "Güney Kore", flag: "🇰🇷", culture: "Teknoloji, Hiyerarşi" },
    { code: "SA", name: "Suudi Arabistan", flag: "🇸🇦", culture: "Geleneksel, Dini Değerler" },
    { code: "RU", name: "Rusya", flag: "🇷🇺", culture: "Güçlü, Doğrudan" }
  ];

  const localizeContentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/localize-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Yerelleştirme sırasında hata oluştu');
      return response.json();
    },
    onSuccess: (data) => {
      setLocalizationResults(data.results || []);
      setProcessingProgress(100);
      toast({
        title: "Yerelleştirme Tamamlandı",
        description: `${data.results?.length || 0} pazar için içerik hazırlandı`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "İçerik yerelleştirme sırasında hata oluştu",
        variant: "destructive"
      });
      setProcessingProgress(0);
    }
  });

  const toggleMarket = (marketCode: string) => {
    setTargetMarkets(prev => 
      prev.includes(marketCode) 
        ? prev.filter(m => m !== marketCode)
        : [...prev, marketCode]
    );
  };

  const startLocalization = () => {
    if (!originalContent.trim()) {
      toast({
        title: "Uyarı",
        description: "Lütfen yerelleştirilecek içerik girin",
        variant: "destructive"
      });
      return;
    }

    if (targetMarkets.length === 0) {
      toast({
        title: "Uyarı",
        description: "En az bir hedef pazar seçin",
        variant: "destructive"
      });
      return;
    }

    setProcessingProgress(0);
    setLocalizationResults([]);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    localizeContentMutation.mutate({
      content: originalContent,
      sourceLanguage,
      targetMarkets,
      contentType,
      culturalAdaptation
    });
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Kopyalandı",
      description: "İçerik panoya kopyalandı",
    });
  };

  const downloadContent = (result: LocalizationResult) => {
    const blob = new Blob([result.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-${result.country.toLowerCase()}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSelectedMarkets = () => {
    return markets.filter(m => targetMarkets.includes(m.code));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="pb-20">
      <div className="p-2 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-8 h-8 text-purple-600" />
          <h1 className="text-2xl font-bold">İçerik Yerelleştirme</h1>
          <Badge variant="outline" className="text-purple-600 border-purple-600">
            <Languages className="w-3 h-3 mr-1" />
            Kültürel Adaptasyon
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Content Input Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="w-5 h-5" />
                  Kaynak İçerik
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="sourceLanguage">Kaynak Dil</Label>
                    <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            <span className="flex items-center gap-2">
                              <span>{lang.flag}</span>
                              <span>{lang.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="contentType">İçerik Türü</Label>
                    <Select value={contentType} onValueChange={setContentType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="marketing">Pazarlama</SelectItem>
                        <SelectItem value="product">Ürün Açıklaması</SelectItem>
                        <SelectItem value="website">Web Sitesi</SelectItem>
                        <SelectItem value="social">Sosyal Medya</SelectItem>
                        <SelectItem value="email">E-posta</SelectItem>
                        <SelectItem value="legal">Yasal Metin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="culturalAdaptation"
                      checked={culturalAdaptation}
                      onCheckedChange={setCulturalAdaptation}
                    />
                    <Label htmlFor="culturalAdaptation">Kültürel Adaptasyon</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="originalContent">Kaynak İçerik</Label>
                  <Textarea
                    id="originalContent"
                    value={originalContent}
                    onChange={(e) => setOriginalContent(e.target.value)}
                    placeholder="Yerelleştirilecek içeriğinizi buraya yazın..."
                    rows={12}
                    className="resize-none"
                  />
                  <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
                    <span>{originalContent.length} karakter</span>
                    <span>{originalContent.split(' ').filter(word => word.length > 0).length} kelime</span>
                  </div>
                </div>

                {culturalAdaptation && (
                  <Alert>
                    <MapPin className="h-4 w-4" />
                    <AlertDescription>
                      Kültürel adaptasyon etkinleştirildi. İçerik her hedef pazarın kültürel özelliklerine göre uyarlanacak.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Localization Results */}
            {localizationResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Yerelleştirme Sonuçları
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue={localizationResults[0]?.country || "first"} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4">
                      {localizationResults.slice(0, 4).map((result, index) => (
                        <TabsTrigger key={index} value={result.country}>
                          {markets.find(m => m.name === result.country)?.flag} {result.country}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {localizationResults.map((result, index) => (
                      <TabsContent key={index} value={result.country} className="mt-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-semibold">{result.country}</span>
                              <Badge variant="outline">{result.language}</Badge>
                              <span className={`font-medium ${getScoreColor(result.localizationScore)}`}>
                                Uyarlama Skoru: {result.localizationScore}/100
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => copyToClipboard(result.content)}
                              >
                                <Copy className="w-4 h-4 mr-1" />
                                Kopyala
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => downloadContent(result)}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                İndir
                              </Button>
                            </div>
                          </div>

                          <Textarea
                            value={result.content}
                            readOnly
                            rows={8}
                            className="bg-gray-50"
                          />

                          {result.culturalAdaptations.length > 0 && (
                            <div className="mt-4">
                              <Label className="text-sm font-medium">Kültürel Uyarlamalar:</Label>
                              <div className="mt-2 space-y-2">
                                {result.culturalAdaptations.map((adaptation, idx) => (
                                  <div key={idx} className="flex items-start gap-2 text-sm p-2 bg-blue-50 rounded border border-blue-200">
                                    <Users className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <span>{adaptation}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Target Markets Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Hedef Pazarlar
                  </span>
                  <Badge variant="secondary">{targetMarkets.length} seçili</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {markets.map((market) => (
                    <div 
                      key={market.code}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        targetMarkets.includes(market.code) 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => toggleMarket(market.code)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-2">
                          <span className="text-lg">{market.flag}</span>
                          <span className="font-medium">{market.name}</span>
                        </span>
                        {targetMarkets.includes(market.code) && (
                          <Badge variant="default">Seçili</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{market.culture}</p>
                    </div>
                  ))}
                </div>

                {processingProgress > 0 && processingProgress < 100 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>İşleniyor...</span>
                      <span>{processingProgress}%</span>
                    </div>
                    <Progress value={processingProgress} className="h-2" />
                  </div>
                )}

                <Button
                  onClick={startLocalization}
                  disabled={localizeContentMutation.isPending || targetMarkets.length === 0}
                  className="w-full mt-4"
                  size="lg"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {localizeContentMutation.isPending ? "İşleniyor..." : "Yerelleştirmeyi Başlat"}
                </Button>
              </CardContent>
            </Card>

            {/* Selected Markets Summary */}
            {targetMarkets.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Seçili Pazarlar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getSelectedMarkets().map((market) => (
                      <div key={market.code} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <span>{market.flag}</span>
                          <span>{market.name}</span>
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleMarket(market.code)}
                        >
                          <RefreshCw className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Localization Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Yerelleştirme İpuçları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Yerel tatiller ve önemli tarihler dikkate alınır</span>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Kültürel değerler ve sosyal normlar uyarlanır</span>
                </div>
                <div className="flex items-start gap-2">
                  <Languages className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Dil yapısı ve iletişim tarzı optimize edilir</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span>Yerel referanslar ve örnekler eklenir</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}