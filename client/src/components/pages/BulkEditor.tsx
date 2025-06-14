import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FileDropZone from "@/components/FileDropZone";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

interface BulkEditorProps {
  setLoading: (loading: boolean) => void;
}

export default function BulkEditor({ setLoading }: BulkEditorProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [settings, setSettings] = useState({
    language: 'Türkçe',
    wordCount: '800-1200 kelime',
    tone: 'Profesyonel',
  });
  const [jobId, setJobId] = useState<number | null>(null);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });

  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('settings', JSON.stringify(settings));

      const response = await apiRequest('POST', '/api/bulk-upload', formData);
      return await response.json();
    },
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (data) => {
      setJobId(data.jobId);
      setProgress({ completed: 0, total: data.totalArticles });
      toast({
        title: "Dosya Yüklendi!",
        description: `${data.totalArticles} makale oluşturma işlemi başlatıldı.`,
      });
      
      // Poll for progress updates
      pollProgress(data.jobId);
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Dosya yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const pollProgress = async (jobId: number) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/bulk-jobs/${jobId}`, {
          credentials: 'include',
        });
        const job = await response.json();
        
        setProgress({
          completed: job.completedArticles,
          total: job.totalArticles,
        });

        if (job.status === 'completed' || job.status === 'failed') {
          clearInterval(interval);
          setLoading(false);
          
          if (job.status === 'completed') {
            toast({
              title: "Tamamlandı!",
              description: `${job.completedArticles} makale başarıyla oluşturuldu.`,
            });
          } else {
            toast({
              title: "Hata",
              description: "Toplu işlem sırasında bir hata oluştu.",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error('Progress polling error:', error);
        clearInterval(interval);
        setLoading(false);
      }
    }, 2000);

    // Clean up after 30 minutes
    setTimeout(() => clearInterval(interval), 30 * 60 * 1000);
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const startBulkGeneration = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const downloadTemplate = () => {
    // Create sample Excel data
    const sampleData = [
      { 'Başlık': 'AI ve Makine Öğrenmesi', 'Anahtar Kelimeler': 'ai, makine öğrenmesi, teknoloji', 'Kategori': 'Teknoloji' },
      { 'Başlık': 'SEO Optimizasyonu Rehberi', 'Anahtar Kelimeler': 'seo, optimizasyon, web', 'Kategori': 'Pazarlama' },
    ];

    const csv = [
      'Başlık,Anahtar Kelimeler,Kategori',
      ...sampleData.map(row => `"${row.Başlık}","${row['Anahtar Kelimeler']}","${row.Kategori}"`)
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk-articles-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
      <div className="text-center mb-8">
        <div className="h-16 w-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-layer-group text-white text-xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Toplu Makale Oluştur</h2>
        <p className="text-slate-600">Excel dosyası yükleyerek birden çok makale oluşturun</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* File Upload */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">1. Excel Dosyası Yükle</h3>
          
          <FileDropZone onFileSelect={handleFileSelect} />
          
          {selectedFile && (
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <i className="fas fa-file-excel text-emerald-600"></i>
                <div>
                  <p className="font-medium text-emerald-900">{selectedFile.name}</p>
                  <p className="text-emerald-700 text-sm">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Sample Template */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
              <div>
                <h4 className="font-medium text-blue-900">Excel Şablon Formatı</h4>
                <p className="text-blue-700 text-sm mt-1">
                  Dosyanızda şu sütunlar bulunmalıdır: <strong>Başlık, Anahtar Kelimeler, Kategori</strong>
                </p>
                <Button
                  variant="link"
                  onClick={downloadTemplate}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 p-0 h-auto"
                >
                  <i className="fas fa-download mr-1"></i>
                  Örnek şablonu indir
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">2. Toplu Ayarlar</h3>
          
          <div className="space-y-4">
            <div>
              <Label>Dil</Label>
              <Select value={settings.language} onValueChange={(value) => setSettings({...settings, language: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Türkçe">Türkçe</SelectItem>
                  <SelectItem value="İngilizce">İngilizce</SelectItem>
                  <SelectItem value="Almanca">Almanca</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Kelime Sayısı</Label>
              <Select value={settings.wordCount} onValueChange={(value) => setSettings({...settings, wordCount: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="500-800 kelime">500-800 kelime</SelectItem>
                  <SelectItem value="800-1200 kelime">800-1200 kelime</SelectItem>
                  <SelectItem value="1200-1500 kelime">1200-1500 kelime</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Yazım Stili</Label>
              <Select value={settings.tone} onValueChange={(value) => setSettings({...settings, tone: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Profesyonel">Profesyonel</SelectItem>
                  <SelectItem value="Samimi">Samimi</SelectItem>
                  <SelectItem value="Eğitici">Eğitici</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="pt-4">
              <Button
                onClick={startBulkGeneration}
                disabled={!selectedFile || uploadMutation.isPending}
                className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <i className="fas fa-rocket mr-2"></i>
                Toplu Üretimi Başlat
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      {jobId && (
        <div className="mt-8 border-t border-slate-200 pt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">İşlem Durumu</h3>
          
          <div className="bg-slate-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-700">İlerleme</span>
              <span className="text-sm text-slate-500">{progress.completed} / {progress.total} makale</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}%` }}
              ></div>
            </div>
            
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Tamamlanan:</span>
                <span className="text-emerald-600 font-medium">{progress.completed} makale</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Kalan:</span>
                <span className="text-slate-500">{progress.total - progress.completed} makale</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
