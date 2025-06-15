import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Eye, Brain, Sparkles, Zap, CheckCircle, AlertCircle, TrendingUp, Target } from "lucide-react";

interface AIContentPreviewProps {
  setLoading: (loading: boolean) => void;
}

interface ContentSuggestion {
  type: 'improvement' | 'seo' | 'readability' | 'engagement';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  suggested: string;
}

interface QualityMetrics {
  readability: number;
  seoScore: number;
  engagement: number;
  overall: number;
}

export default function AIContentPreview({ setLoading }: AIContentPreviewProps) {
  const [content, setContent] = useState("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [contentType, setContentType] = useState("blog");
  const [realTimeMode, setRealTimeMode] = useState(true);
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics>({
    readability: 0,
    seoScore: 0,
    engagement: 0,
    overall: 0
  });
  const [previewHtml, setPreviewHtml] = useState("");
  const debounceRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  const generateSuggestionsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/ai-content-suggestions', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (response) => {
      setSuggestions(response.suggestions || []);
      setQualityMetrics(response.metrics || { readability: 0, seoScore: 0, engagement: 0, overall: 0 });
      setPreviewHtml(response.preview || "");
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "AI önerileri alınırken hata oluştu",
        variant: "destructive"
      });
    }
  });

  const applySuggestionMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/apply-suggestion', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (response) => {
      setContent(response.content || "");
      toast({
        title: "Başarılı",
        description: "Öneri uygulandı",
      });
    }
  });

  // Real-time analysis with debounce
  useEffect(() => {
    if (realTimeMode && content.length > 50) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      
      debounceRef.current = setTimeout(() => {
        generateSuggestionsMutation.mutate({
          content,
          targetKeyword,
          contentType
        });
      }, 1000);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [content, targetKeyword, contentType, realTimeMode]);

  const handleAnalyze = () => {
    if (!content.trim()) {
      toast({
        title: "Uyarı",
        description: "Lütfen analiz edilecek içerik girin",
        variant: "destructive"
      });
      return;
    }

    generateSuggestionsMutation.mutate({
      content,
      targetKeyword,
      contentType
    });
  };

  const applySuggestion = (suggestion: ContentSuggestion) => {
    applySuggestionMutation.mutate({
      content,
      suggestion: suggestion.suggested,
      type: suggestion.type
    });
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'seo': return <Target className="w-4 h-4" />;
      case 'readability': return <Eye className="w-4 h-4" />;
      case 'engagement': return <TrendingUp className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="pb-20">
      <div className="p-2 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold">Etkileşimli İçerik Önizlemesi</h1>
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <Zap className="w-3 h-3 mr-1" />
            Gerçek Zamanlı AI
          </Badge>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Content Input Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  İçerik Girişi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contentType">İçerik Türü</Label>
                    <Select value={contentType} onValueChange={setContentType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blog">Blog Makalesi</SelectItem>
                        <SelectItem value="product">Ürün Açıklaması</SelectItem>
                        <SelectItem value="landing">Landing Page</SelectItem>
                        <SelectItem value="social">Sosyal Medya</SelectItem>
                        <SelectItem value="email">E-posta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="targetKeyword">Hedef Anahtar Kelime</Label>
                    <Input
                      id="targetKeyword"
                      placeholder="SEO hedef kelimesi"
                      value={targetKeyword}
                      onChange={(e) => setTargetKeyword(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="content">İçerik</Label>
                  <Textarea
                    id="content"
                    placeholder="İçeriğinizi buraya yazın. Gerçek zamanlı AI önerileri için en az 50 karakter girin..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={12}
                    className="resize-none"
                  />
                  <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
                    <span>{content.length} karakter</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${realTimeMode ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span>{realTimeMode ? 'Gerçek zamanlı analiz aktif' : 'Manuel analiz'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleAnalyze}
                    disabled={generateSuggestionsMutation.isPending}
                    className="flex-1"
                  >
                    {generateSuggestionsMutation.isPending ? "Analiz ediliyor..." : "Analiz Et"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setRealTimeMode(!realTimeMode)}
                  >
                    {realTimeMode ? "Manuel Mod" : "Gerçek Zamanlı"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quality Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Kalite Metrikleri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Okunabilirlik</span>
                      <span className="font-medium">{qualityMetrics.readability}%</span>
                    </div>
                    <Progress value={qualityMetrics.readability} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>SEO Skoru</span>
                      <span className="font-medium">{qualityMetrics.seoScore}%</span>
                    </div>
                    <Progress value={qualityMetrics.seoScore} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Etkileşim Potansiyeli</span>
                      <span className="font-medium">{qualityMetrics.engagement}%</span>
                    </div>
                    <Progress value={qualityMetrics.engagement} className="h-2" />
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold">Genel Skor</span>
                      <span className="font-bold text-lg">{qualityMetrics.overall}%</span>
                    </div>
                    <Progress value={qualityMetrics.overall} className="h-3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Suggestions and Preview Panel */}
          <div className="space-y-6">
            <Tabs defaultValue="suggestions" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="suggestions">AI Önerileri</TabsTrigger>
                <TabsTrigger value="preview">Canlı Önizleme</TabsTrigger>
              </TabsList>

              <TabsContent value="suggestions" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Akıllı Öneriler
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {suggestions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>İçerik analizi için metin girin</p>
                        </div>
                      ) : (
                        suggestions.map((suggestion, index) => (
                          <div key={index} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                {getSuggestionIcon(suggestion.type)}
                                <span className="font-medium">{suggestion.title}</span>
                                <Badge variant={getImpactColor(suggestion.impact) as any}>
                                  {suggestion.impact === 'high' ? 'Yüksek' : 
                                   suggestion.impact === 'medium' ? 'Orta' : 'Düşük'} Etki
                                </Badge>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground">
                              {suggestion.description}
                            </p>
                            
                            <div className="bg-blue-50 p-3 rounded border border-blue-200">
                              <p className="text-sm">{suggestion.suggested}</p>
                            </div>
                            
                            <Button
                              size="sm"
                              onClick={() => applySuggestion(suggestion)}
                              disabled={applySuggestionMutation.isPending}
                              className="w-full"
                            >
                              Öneriyi Uygula
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preview" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Canlı Önizleme
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="min-h-[400px] border rounded-lg p-4 bg-white">
                      {previewHtml ? (
                        <div 
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: previewHtml }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <div className="text-center">
                            <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>İçerik önizlemesi için analiz çalıştırın</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}