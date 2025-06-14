import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import FileDropZone from "@/components/FileDropZone";
import { FileSpreadsheet, Download, Upload, CheckCircle, XCircle, Play } from "lucide-react";

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

  const processExcelMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiRequest("POST", "/api/process-excel-template", formData);
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
      const response = await apiRequest("POST", "/api/generate-from-excel-template", {
        articles,
        settings: { publishStatus: 'draft' }
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
      </div>

      {/* Step 1: File Upload */}
      {step === 1 && (
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
      )}

      {/* Step 2: Review Articles */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>İşlenen Makaleler ({processedArticles.length})</span>
              <Button 
                onClick={handleGenerateArticles}
                className="flex items-center gap-2"
                disabled={generateArticlesMutation.isPending}
              >
                <Play className="w-4 h-4" />
                Makaleleri Oluştur
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {generateArticlesMutation.isPending && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Makaleler oluşturuluyor...</span>
                  <span className="text-sm text-gray-600">{generationProgress}%</span>
                </div>
                <Progress value={generationProgress} className="w-full" />
              </div>
            )}

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {processedArticles.map((article, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">{article.title}</h4>
                      <p className="text-sm text-gray-600">{article.description}</p>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div><span className="font-medium">Kategori:</span> {article.category}</div>
                      <div><span className="font-medium">Odak Anahtar:</span> {article.focusKeyword}</div>
                      <div><span className="font-medium">Diğer Kelimeler:</span> {article.otherKeywords}</div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div><span className="font-medium">Dil:</span> {article.language}</div>
                      <div><span className="font-medium">İçerik Uzunluğu:</span> {article.contentLength}</div>
                      <div><span className="font-medium">Alt Başlık:</span> {article.subheadings.length} adet</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-6">
              <Button variant="outline" onClick={resetProcess}>
                Yeni Dosya Yükle
              </Button>
              <div className="text-sm text-gray-600">
                {processedArticles.length} makale hazır
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Results */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Oluşturma Sonuçları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {generationResults.filter(r => r.status === 'success').length}
                  </div>
                  <div className="text-sm text-gray-600">Başarılı</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {generationResults.filter(r => r.status === 'failed').length}
                  </div>
                  <div className="text-sm text-gray-600">Başarısız</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {generationResults.length}
                  </div>
                  <div className="text-sm text-gray-600">Toplam</div>
                </div>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {generationResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {result.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <h4 className="font-medium">{result.title}</h4>
                      {result.error && (
                        <p className="text-sm text-red-600">{result.error}</p>
                      )}
                    </div>
                  </div>
                  {result.status === 'success' && (
                    <div className="text-right text-sm text-gray-600">
                      <div>{result.wordCount} kelime</div>
                      <div>{result.readingTime} dk okuma</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-6">
              <Button onClick={resetProcess}>
                Yeni İşlem Başlat
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}