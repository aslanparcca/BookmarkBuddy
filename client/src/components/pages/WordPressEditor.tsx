import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface WordPressEditorProps {
  setLoading: (loading: boolean) => void;
}

interface WordPressSettings {
  focusKeywords: string;
  writingStyle: string;
  language: string;
  aiModel: string;
  length: string;
  faqType: string;
  title: string;
  content: string;
  metaDescription: string;
  youtubeVideo: string;
  summary: string;
  includeMetaDescription: boolean;
  includeSummary: boolean;
  includeYouTube: boolean;
}

export default function WordPressEditor({ setLoading }: WordPressEditorProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [settings, setSettings] = useState<WordPressSettings>({
    focusKeywords: '',
    writingStyle: '',
    language: 'Türkçe',
    aiModel: 'Gemini 2.5 Flash Preview',
    length: 'Uzun',
    faqType: 'Hayır',
    title: '',
    content: '',
    metaDescription: '',
    youtubeVideo: '',
    summary: '',
    includeMetaDescription: false,
    includeSummary: false,
    includeYouTube: false
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      setLoading(true);
      const response = await apiRequest('/api/wordpress/generate', {
        method: 'POST',
        body: JSON.stringify(settings),
      });
      return response;
    },
    onSuccess: (data: any) => {
      toast({
        title: "Başarılı!",
        description: "WordPress makalesi başarıyla oluşturuldu.",
      });
      
      // Update settings with generated content
      setSettings(prev => ({
        ...prev,
        title: data.article.title,
        content: data.article.content,
        metaDescription: data.article.metaDescription || '',
        summary: data.article.summary || '',
        youtubeVideo: data.article.youtubeVideo || ''
      }));
      
      setCurrentStep(4);
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

  const steps = [
    { number: 1, title: "Temel Bilgiler", subtitle: "Temel bilgileri girin" },
    { number: 2, title: "Başlık Seç", subtitle: "En başlık seçin" },
    { number: 3, title: "Tastak Oluştur", subtitle: "AI taslakları kontrol edin" },
    { number: 4, title: "Makale Oluştur", subtitle: "Makalenizi oluşturun" }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-slate-700">Odak Anahtar Kelime (Focus Keyword) *</Label>
              <Input
                placeholder="Lütfen 1 adet odak anahtar kelime (focus keyword) giriniz"
                value={settings.focusKeywords}
                onChange={(e) => setSettings({...settings, focusKeywords: e.target.value})}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-slate-700">Yazı Stili</Label>
                <Select value={settings.writingStyle} onValueChange={(value) => setSettings({...settings, writingStyle: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Lütfen bir yazı stili seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="profesyonel">Profesyonel</SelectItem>
                    <SelectItem value="samimi">Samimi</SelectItem>
                    <SelectItem value="eğitici">Eğitici</SelectItem>
                    <SelectItem value="pazarlama">Pazarlama</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">Yapay Zeka Modeli</Label>
                <Select value={settings.aiModel} onValueChange={(value) => setSettings({...settings, aiModel: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gemini 2.5 Flash Preview">Gemini 2.5 Flash Preview</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-xs text-blue-600 mt-1">1 kelime: 1 kredi</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-slate-700">Makale Dili</Label>
                <Select value={settings.language} onValueChange={(value) => setSettings({...settings, language: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Türkçe">🇹🇷 Türkçe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">Sıkça Sorulan Sorular</Label>
                <Select value={settings.faqType} onValueChange={(value) => setSettings({...settings, faqType: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hayır">Hayır</SelectItem>
                    <SelectItem value="Evet">Evet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-700">Makale Uzunluğu</Label>
              <Select value={settings.length} onValueChange={(value) => setSettings({...settings, length: value})}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kısa">Kısa</SelectItem>
                  <SelectItem value="Orta">Orta</SelectItem>
                  <SelectItem value="Uzun">Uzun</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-700">Makale Resmi</Label>
              <Input
                placeholder="Görsel istemikyorum"
                className="mt-1"
                disabled
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="meta" 
                  checked={settings.includeMetaDescription}
                  onCheckedChange={(checked) => setSettings({...settings, includeMetaDescription: checked as boolean})}
                />
                <Label htmlFor="meta" className="text-sm text-slate-700">Meta Açıklama</Label>
                <span className="text-xs text-slate-500">Makalenizin meta açıklamasını otomatik oluştur</span>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="summary" 
                  checked={settings.includeSummary}
                  onCheckedChange={(checked) => setSettings({...settings, includeSummary: checked as boolean})}
                />
                <Label htmlFor="summary" className="text-sm text-slate-700">Makale Özeti</Label>
                <span className="text-xs text-slate-500">Makalenizin kısa bir özetini çıkarır</span>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="youtube" 
                  checked={settings.includeYouTube}
                  onCheckedChange={(checked) => setSettings({...settings, includeYouTube: checked as boolean})}
                />
                <Label htmlFor="youtube" className="text-sm text-slate-700">YouTube Video</Label>
                <span className="text-xs text-slate-500">Makaleniz için YouTube videosunu otomatik oluştur</span>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Başlık Seçimi</h3>
            <p className="text-slate-600">En uygun başlığı seçin veya özel bir başlık girin.</p>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <input type="radio" name="title" className="text-blue-600" />
                    <span className="text-slate-800">
                      {settings.focusKeywords ? `${settings.focusKeywords} ile ilgili örnek başlık ${i}` : `Örnek başlık ${i}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Özel Başlık</Label>
              <Input
                placeholder="Kendi başlığınızı yazın..."
                value={settings.title}
                onChange={(e) => setSettings({...settings, title: e.target.value})}
                className="mt-1"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Taslak Kontrol</h3>
            <p className="text-slate-600">AI tarafından oluşturulan taslağı kontrol edin ve onaylayın.</p>
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 mb-2">Oluşturulan Taslak:</h4>
              <p className="text-slate-700 text-sm">
                {settings.focusKeywords ? `${settings.focusKeywords} konulu makale taslağı burada görünecek...` : "Taslak oluşturuluyor..."}
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Makale Oluşturma Tamamlandı</h3>
            <p className="text-slate-600">Makaleniz başarıyla oluşturuldu. Aşağıdaki alanlarda düzenleyebilirsiniz.</p>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-700">Makale Başlığı</Label>
                <Input
                  value={settings.title}
                  onChange={(e) => setSettings({...settings, title: e.target.value})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-slate-700">Makale İçeriği</Label>
                <Textarea
                  value={settings.content}
                  onChange={(e) => setSettings({...settings, content: e.target.value})}
                  className="mt-1 min-h-48"
                  placeholder="Oluşturulan makale içeriği burada görünecek..."
                />
              </div>
              
              {settings.includeMetaDescription && (
                <div>
                  <Label className="text-sm font-medium text-slate-700">Meta Açıklama</Label>
                  <Textarea
                    value={settings.metaDescription}
                    onChange={(e) => setSettings({...settings, metaDescription: e.target.value})}
                    className="mt-1 h-20"
                    placeholder="Meta açıklama burada görünecek..."
                  />
                </div>
              )}

              {settings.includeSummary && (
                <div>
                  <Label className="text-sm font-medium text-slate-700">Makale Özeti</Label>
                  <Textarea
                    value={settings.summary}
                    onChange={(e) => setSettings({...settings, summary: e.target.value})}
                    className="mt-1 h-20"
                    placeholder="Makale özeti burada görünecek..."
                  />
                </div>
              )}

              {settings.includeYouTube && (
                <div>
                  <Label className="text-sm font-medium text-slate-700">YouTube Video</Label>
                  <Input
                    value={settings.youtubeVideo}
                    onChange={(e) => setSettings({...settings, youtubeVideo: e.target.value})}
                    className="mt-1"
                    placeholder="YouTube video metni burada görünecek..."
                  />
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">WordPress Makalesi Oluştur</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">Geliştirmeler</Button>
          <Button variant="outline" size="sm">✨ Fiyatlar</Button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep >= step.number 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-200 text-slate-600'
                  }
                `}>
                  {step.number}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">{step.title}</div>
                  <div className="text-xs text-slate-500">{step.subtitle}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="w-8 h-px bg-slate-200 mx-4"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Geri
          </Button>
          
          <div className="flex space-x-2">
            {currentStep < 4 ? (
              <Button
                onClick={() => {
                  if (currentStep === 3) {
                    generateMutation.mutate();
                  } else {
                    setCurrentStep(currentStep + 1);
                  }
                }}
                disabled={generateMutation.isPending || (currentStep === 1 && !settings.focusKeywords)}
                className="bg-blue-600 text-white"
              >
                {currentStep === 3 
                  ? (generateMutation.isPending ? "Oluşturuluyor..." : "Kaydet >")
                  : "İleri"
                }
              </Button>
            ) : (
              <Button className="bg-blue-600 text-white">
                WordPress'e Gönder
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}