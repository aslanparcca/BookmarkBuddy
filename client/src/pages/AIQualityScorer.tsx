import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Target, CheckCircle, AlertTriangle, TrendingUp, Settings, Award, Brain } from "lucide-react";

interface AIQualityScorerProps {
  setLoading: (loading: boolean) => void;
}

interface QualityMetric {
  name: string;
  weight: number;
  enabled: boolean;
  score: number;
  feedback: string;
}

interface QualityReport {
  overallScore: number;
  metrics: QualityMetric[];
  recommendations: string[];
  grade: string;
}

export default function AIQualityScorer({ setLoading }: AIQualityScorerProps) {
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState("blog");
  const [targetAudience, setTargetAudience] = useState("general");
  const [qualityReport, setQualityReport] = useState<QualityReport | null>(null);
  
  const [metrics, setMetrics] = useState<QualityMetric[]>([
    { name: "Okunabilirlik", weight: 20, enabled: true, score: 0, feedback: "" },
    { name: "SEO Uyumluluğu", weight: 25, enabled: true, score: 0, feedback: "" },
    { name: "Dilbilgisi ve Yazım", weight: 15, enabled: true, score: 0, feedback: "" },
    { name: "İçerik Tutarlılığı", weight: 20, enabled: true, score: 0, feedback: "" },
    { name: "Etkileşim Potansiyeli", weight: 15, enabled: true, score: 0, feedback: "" },
    { name: "Özgünlük", weight: 5, enabled: true, score: 0, feedback: "" }
  ]);

  const { toast } = useToast();

  const analyzeContentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/analyze-content-quality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Analiz sırasında hata oluştu');
      return response.json();
    },
    onSuccess: (data) => {
      setQualityReport(data);
      setMetrics(data.metrics || metrics);
      toast({
        title: "Analiz Tamamlandı",
        description: `Genel skor: ${data.overallScore}/100`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "İçerik analizi sırasında hata oluştu",
        variant: "destructive"
      });
    }
  });

  const updateMetricWeight = (index: number, weight: number) => {
    const newMetrics = [...metrics];
    newMetrics[index].weight = weight;
    setMetrics(newMetrics);
  };

  const toggleMetric = (index: number) => {
    const newMetrics = [...metrics];
    newMetrics[index].enabled = !newMetrics[index].enabled;
    setMetrics(newMetrics);
  };

  const analyzeContent = () => {
    if (!content.trim()) {
      toast({
        title: "Uyarı",
        description: "Lütfen analiz edilecek içerik girin",
        variant: "destructive"
      });
      return;
    }

    const enabledMetrics = metrics.filter(m => m.enabled);
    const totalWeight = enabledMetrics.reduce((sum, m) => sum + m.weight, 0);
    
    if (totalWeight !== 100) {
      toast({
        title: "Uyarı", 
        description: "Metrik ağırlıkları toplamı 100 olmalıdır",
        variant: "destructive"
      });
      return;
    }

    analyzeContentMutation.mutate({
      content,
      contentType,
      targetAudience,
      metrics: enabledMetrics
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getGradeIcon = (grade: string) => {
    switch (grade) {
      case 'A': return <Award className="w-5 h-5 text-green-600" />;
      case 'B': return <CheckCircle className="w-5 h-5 text-yellow-600" />;
      case 'C': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default: return <Target className="w-5 h-5 text-red-600" />;
    }
  };

  const resetToDefaults = () => {
    setMetrics([
      { name: "Okunabilirlik", weight: 20, enabled: true, score: 0, feedback: "" },
      { name: "SEO Uyumluluğu", weight: 25, enabled: true, score: 0, feedback: "" },
      { name: "Dilbilgisi ve Yazım", weight: 15, enabled: true, score: 0, feedback: "" },
      { name: "İçerik Tutarlılığı", weight: 20, enabled: true, score: 0, feedback: "" },
      { name: "Etkileşim Potansiyeli", weight: 15, enabled: true, score: 0, feedback: "" },
      { name: "Özgünlük", weight: 5, enabled: true, score: 0, feedback: "" }
    ]);
  };

  const totalWeight = metrics.filter(m => m.enabled).reduce((sum, m) => sum + m.weight, 0);

  return (
    <div className="pb-20">
      <div className="p-2 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <BarChart className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold">AI Kalite Puanlama Sistemi</h1>
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <Brain className="w-3 h-3 mr-1" />
            Özelleştirilebilir
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Content Input */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  İçerik Analizi
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
                        <SelectItem value="news">Haber Makalesi</SelectItem>
                        <SelectItem value="product">Ürün Açıklaması</SelectItem>
                        <SelectItem value="social">Sosyal Medya</SelectItem>
                        <SelectItem value="email">E-posta</SelectItem>
                        <SelectItem value="academic">Akademik Metin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="targetAudience">Hedef Kitle</Label>
                    <Select value={targetAudience} onValueChange={setTargetAudience}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Genel Kitle</SelectItem>
                        <SelectItem value="professional">Profesyonel</SelectItem>
                        <SelectItem value="academic">Akademik</SelectItem>
                        <SelectItem value="technical">Teknik</SelectItem>
                        <SelectItem value="casual">Gündelik</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="content">Analiz Edilecek İçerik</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="İçeriğinizi buraya yapıştırın..."
                    rows={12}
                    className="resize-none"
                  />
                  <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
                    <span>{content.length} karakter</span>
                    <span>{content.split(' ').filter(word => word.length > 0).length} kelime</span>
                  </div>
                </div>

                <Button
                  onClick={analyzeContent}
                  disabled={analyzeContentMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  <BarChart className="w-4 h-4 mr-2" />
                  {analyzeContentMutation.isPending ? "Analiz Ediliyor..." : "Kalite Analizi Yap"}
                </Button>
              </CardContent>
            </Card>

            {/* Quality Report */}
            {qualityReport && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Kalite Raporu
                    </span>
                    <div className="flex items-center gap-2">
                      {getGradeIcon(qualityReport.grade)}
                      <span className={`text-2xl font-bold ${getScoreColor(qualityReport.overallScore)}`}>
                        {qualityReport.overallScore}/100
                      </span>
                      <Badge variant="outline">{qualityReport.grade} Notı</Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="scores" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="scores">Metrik Skorları</TabsTrigger>
                      <TabsTrigger value="recommendations">Öneriler</TabsTrigger>
                    </TabsList>

                    <TabsContent value="scores" className="mt-4">
                      <div className="space-y-4">
                        {qualityReport.metrics.map((metric, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{metric.name}</span>
                              <span className={`font-bold ${getScoreColor(metric.score)}`}>
                                {metric.score}/100
                              </span>
                            </div>
                            <Progress value={metric.score} className="h-2" />
                            {metric.feedback && (
                              <p className="text-sm text-muted-foreground">{metric.feedback}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="recommendations" className="mt-4">
                      <div className="space-y-3">
                        {qualityReport.recommendations.map((recommendation, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Quality Metrics Configuration */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Metrik Ayarları
                  </span>
                  <Button variant="outline" size="sm" onClick={resetToDefaults}>
                    Varsayılan
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`text-sm p-2 rounded ${totalWeight === 100 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  Toplam Ağırlık: {totalWeight}% / 100%
                </div>

                {metrics.map((metric, index) => (
                  <div key={index} className="space-y-3 p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{metric.name}</span>
                      <Switch
                        checked={metric.enabled}
                        onCheckedChange={() => toggleMetric(index)}
                      />
                    </div>
                    
                    {metric.enabled && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span>Ağırlık</span>
                          <span className="font-medium">{metric.weight}%</span>
                        </div>
                        <Slider
                          value={[metric.weight]}
                          onValueChange={(value) => updateMetricWeight(index, value[0])}
                          max={50}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quality Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Puanlama Rehberi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span><strong>80-100:</strong> Mükemmel (A)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span><strong>60-79:</strong> İyi (B)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span><strong>40-59:</strong> Orta (C)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span><strong>0-39:</strong> Zayıf (D)</span>
                </div>
                
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <p className="text-xs text-muted-foreground">
                    Metriklerin ağırlıklarını ihtiyaçlarınıza göre ayarlayarak 
                    kendi kalite standartlarınızı oluşturabilirsiniz.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}