import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import FileDropZone from "@/components/FileDropZone";
import { FileSpreadsheet, Download, Upload, CheckCircle, XCircle, Play, Settings, Image, FileText } from "lucide-react";
import AIModelSelector from "@/components/shared/AIModelSelector";

interface ExcelTemplateProps {
  setLoading: (loading: boolean) => void;
}

interface ProcessedArticle {
  title: string;
  focusKeyword: string;
  otherKeywords: string;
  description: string;
  category: string;
  tags: string;
  imageKeyword: string;
  subheadings: string[];
  writingStyle: string;
  language: string;
  metaDescription: string;
  targetAudience: string;
  contentType: string;
  contentLength: string;
}

interface GenerationResult {
  id?: number;
  title: string;
  wordCount?: number;
  readingTime?: number;
  status: 'success' | 'failed';
  error?: string;
}

export default function ExcelTemplate({ setLoading }: ExcelTemplateProps) {
  const [step, setStep] = useState(1);
  const [processedArticles, setProcessedArticles] = useState<ProcessedArticle[]>([]);
  const [generationResults, setGenerationResults] = useState<GenerationResult[]>([]);
  const [generationProgress, setGenerationProgress] = useState(0);
  const { toast } = useToast();

  // İçerik kalite ayarları
  const [settings, setSettings] = useState({
    aiModel: 'gemini-2.0-flash',
    sectionLength: 'orta',
    writingStyle: 'profesyonel',
    targetAudience: 'genel',
    contentFeatures: [] as string[],
    generateImages: false,
    publishStatus: 'draft'
  });

  const processExcelMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiRequest("/api/process-excel-template", "POST", formData);
      return await response.json();
    },
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (data: any) => {
      console.log("Excel processing response:", data);
      setProcessedArticles(data.articles || []);
      setStep(2);
      toast({
        title: "Excel Dosyası İşlendi!",
        description: `${data.count} makale şablonu başarıyla işlendi.`,
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
        description: error.message || "Excel dosyası işlenirken hata oluştu",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const generateArticlesMutation = useMutation({
    mutationFn: async (articles: ProcessedArticle[]) => {
      console.log("Sending articles to backend:", articles.length, articles);
      const response = await apiRequest("/api/generate-from-excel-template", "POST", {
        articles,
        settings: settings
      });
      return await response.json();
    },
    onMutate: () => {
      setLoading(true);
      setGenerationProgress(0);
    },
    onSuccess: (data: any) => {
      setGenerationResults(data.results || []);
      setStep(3);
      setGenerationProgress(100);
      toast({
        title: "Makaleler Oluşturuldu!",
        description: `${data.count || 0}/${data.total || 0} makale başarıyla oluşturuldu.`,
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
        description: error.message || "Makale oluşturma işlemi başarısız oldu",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const handleFileSelect = (file: File) => {
    processExcelMutation.mutate(file);
  };

  const handleGenerateArticles = () => {
    generateArticlesMutation.mutate(processedArticles);
  };

  const resetProcess = () => {
    setStep(1);
    setProcessedArticles([]);
    setGenerationResults([]);
    setGenerationProgress(0);
  };

  const downloadTemplate = () => {
    // Excel şablonu indirme linkini aç
    window.open('/assets/toplu_makale_sablonu.xlsx', '_blank');
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Excel Şablonu ile Toplu Makale Oluştur
        </h1>
        <Button 
          onClick={downloadTemplate}
          variant="outline" 
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Şablon İndir
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
            1
          </div>
          <div className={`w-12 h-1 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
            2
          </div>
          <div className={`w-12 h-1 ${step >= 3 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
            3
          </div>
        </div>
        <div className="ml-4 text-sm text-gray-600">
          {step === 1 && "Excel Dosyası Yükle"}
          {step === 2 && "Makaleleri İncele"}
          {step === 3 && "Sonuçlar"}
        </div>
      </div>

      {/* Step 1: Excel File Upload with Quality Settings */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Excel Dosyası Yükle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <FileSpreadsheet className="w-16 h-16 mx-auto text-green-500 mb-4" />
                  <p className="text-gray-600 mb-4">
                    Excel şablonunu doldurun ve yükleyin. Şablon aşağıdaki kolonları içermelidir:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                    <div>• Başlık</div>
                    <div>• Anahtar Kelimeler</div>
                    <div>• Açıklama</div>
                    <div>• Kategori</div>
                    <div>• Etiketler</div>
                    <div>• Görsel Anahtar</div>
                    <div>• Yazım Stili</div>
                    <div>• Dil</div>
                    <div>• Meta Açıklama</div>
                    <div>• Odak Anahtar</div>
                    <div>• Hedef Kitle</div>
                    <div>• İçerik Tipi</div>
                  </div>
                </div>

                <FileDropZone
                  onFileSelect={handleFileSelect}
                  accept=".xlsx,.xls"
                  maxSize={10 * 1024 * 1024} // 10MB
                />

                <div className="text-center">
                  <Button 
                    onClick={downloadTemplate}
                    variant="outline" 
                    className="flex items-center gap-2 mx-auto"
                  >
                    <Download className="w-4 h-4" />
                    Örnek Şablon İndir
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* İçerik Kalite Ayarları */}
          <div className="space-y-4">
            {/* Genel Ayarlar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="w-5 h-5" />
                  Genel Ayarlar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <AIModelSelector
                    selectedModel={settings.aiModel}
                    onModelChange={(model) => setSettings(prev => ({ ...prev, aiModel: model }))}
                    compact={true}
                  />
                </div>

                <div>
                  <Label htmlFor="section-length">Bölüm Uzunluğu</Label>
                  <Select value={settings.sectionLength} onValueChange={(value) => setSettings(prev => ({ ...prev, sectionLength: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Uzunluk seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kisa">Kısa (500-800 kelime)</SelectItem>
                      <SelectItem value="orta">Orta (1000-1500 kelime)</SelectItem>
                      <SelectItem value="uzun">Uzun (1500-2000 kelime)</SelectItem>
                      <SelectItem value="cok_uzun">Çok Uzun (2000-2500 kelime)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="writing-style">Yazı Stili</Label>
                  <Select value={settings.writingStyle} onValueChange={(value) => setSettings(prev => ({ ...prev, writingStyle: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Stil seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="profesyonel">Profesyonel</SelectItem>
                      <SelectItem value="samimi">Samimi</SelectItem>
                      <SelectItem value="teknik">Teknik</SelectItem>
                      <SelectItem value="eglenceli">Eğlenceli</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Görsel Seçenekleri */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Image className="w-5 h-5" />
                  Görsel Seçenekleri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="generate-images" 
                    checked={settings.generateImages}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, generateImages: checked as boolean }))}
                  />
                  <Label htmlFor="generate-images">Görsel İstemiyorum</Label>
                </div>
              </CardContent>
            </Card>

            {/* İçerik Özellikleri */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5" />
                  İçerik Özellikleri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="faq"
                      checked={settings.contentFeatures.includes('faq')}
                      onCheckedChange={(checked) => {
                        setSettings(prev => ({
                          ...prev,
                          contentFeatures: checked 
                            ? [...prev.contentFeatures, 'faq']
                            : prev.contentFeatures.filter(f => f !== 'faq')
                        }));
                      }}
                    />
                    <Label htmlFor="faq">Sıkça Sorulan Sorular (Normal)</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="meta-description"
                      checked={settings.contentFeatures.includes('meta')}
                      onCheckedChange={(checked) => {
                        setSettings(prev => ({
                          ...prev,
                          contentFeatures: checked 
                            ? [...prev.contentFeatures, 'meta']
                            : prev.contentFeatures.filter(f => f !== 'meta')
                        }));
                      }}
                    />
                    <Label htmlFor="meta-description">Meta Açıklama</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="tables"
                      checked={settings.contentFeatures.includes('tables')}
                      onCheckedChange={(checked) => {
                        setSettings(prev => ({
                          ...prev,
                          contentFeatures: checked 
                            ? [...prev.contentFeatures, 'tables']
                            : prev.contentFeatures.filter(f => f !== 'tables')
                        }));
                      }}
                    />
                    <Label htmlFor="tables">Tablo</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="lists"
                      checked={settings.contentFeatures.includes('lists')}
                      onCheckedChange={(checked) => {
                        setSettings(prev => ({
                          ...prev,
                          contentFeatures: checked 
                            ? [...prev.contentFeatures, 'lists']
                            : prev.contentFeatures.filter(f => f !== 'lists')
                        }));
                      }}
                    />
                    <Label htmlFor="lists">Liste</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="bold"
                      checked={settings.contentFeatures.includes('bold')}
                      onCheckedChange={(checked) => {
                        setSettings(prev => ({
                          ...prev,
                          contentFeatures: checked 
                            ? [...prev.contentFeatures, 'bold']
                            : prev.contentFeatures.filter(f => f !== 'bold')
                        }));
                      }}
                    />
                    <Label htmlFor="bold">Kalın Yazılar</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="italic"
                      checked={settings.contentFeatures.includes('italic')}
                      onCheckedChange={(checked) => {
                        setSettings(prev => ({
                          ...prev,
                          contentFeatures: checked 
                            ? [...prev.contentFeatures, 'italic']
                            : prev.contentFeatures.filter(f => f !== 'italic')
                        }));
                      }}
                    />
                    <Label htmlFor="italic">İtalik Yazılar</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="quotes"
                      checked={settings.contentFeatures.includes('quotes')}
                      onCheckedChange={(checked) => {
                        setSettings(prev => ({
                          ...prev,
                          contentFeatures: checked 
                            ? [...prev.contentFeatures, 'quotes']
                            : prev.contentFeatures.filter(f => f !== 'quotes')
                        }));
                      }}
                    />
                    <Label htmlFor="quotes">Alıntı</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Step 2: Review Articles */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Makale Listesi ({processedArticles.length} adet)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {processedArticles.map((article, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{article.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Odak: {article.focusKeyword} | Kategori: {article.category}
                        </p>
                        {article.description && (
                          <p className="text-sm text-gray-500 mt-1">{article.description}</p>
                        )}
                      </div>
                      <div className="text-sm text-gray-400 ml-4">
                        #{index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t">
                <Button variant="outline" onClick={resetProcess}>
                  Yeniden Başla
                </Button>
                <Button onClick={handleGenerateArticles} className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Makaleleri Oluştur
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Generation Results */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Makale Oluşturma Sonuçları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={generationProgress} className="w-full" />
              
              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {generationResults.map((result, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${result.status === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {result.status === 'success' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <div>
                          <h3 className="font-medium">{result.title}</h3>
                          {result.status === 'success' ? (
                            <p className="text-sm text-gray-600">
                              {result.wordCount} kelime • {result.readingTime} dk okuma
                            </p>
                          ) : (
                            <p className="text-sm text-red-600">{result.error}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t">
                <Button variant="outline" onClick={resetProcess}>
                  Yeni Dosya Yükle
                </Button>
                <div className="text-sm text-gray-600">
                  {generationResults.filter(r => r.status === 'success').length} başarılı, {generationResults.filter(r => r.status === 'failed').length} başarısız
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}