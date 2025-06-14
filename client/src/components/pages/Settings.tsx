import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Settings() {
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/settings'],
    enabled: true,
  });

  const [formData, setFormData] = useState({
    geminiApiKey: '',
    geminiModel: 'gemini-2.5-flash',
    wordpressUrl: '',
    wordpressUsername: '',
    wordpressAppPassword: '',
    defaultLanguage: 'tr',
    defaultWordCount: '800-1200',
    defaultTone: 'professional',
    autoPublish: false,
    includeSeo: true,
    includeImages: false,
  });

  // Update form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData({
        geminiApiKey: settings.geminiApiKey || '',
        geminiModel: settings.geminiModel || 'gemini-2.5-flash',
        wordpressUrl: settings.wordpressUrl || '',
        wordpressUsername: settings.wordpressUsername || '',
        wordpressAppPassword: settings.wordpressAppPassword || '',
        defaultLanguage: settings.defaultLanguage || 'tr',
        defaultWordCount: settings.defaultWordCount || '800-1200',
        defaultTone: settings.defaultTone || 'professional',
        autoPublish: settings.autoPublish || false,
        includeSeo: settings.includeSeo !== false,
        includeImages: settings.includeImages || false,
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/settings', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Ayarlar Kaydedildi",
        description: "Tüm ayarlarınız başarıyla kaydedildi.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Ayarlar kaydedilirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (section: string) => {
    let dataToSave = {};
    
    switch (section) {
      case 'api':
        dataToSave = {
          geminiApiKey: formData.geminiApiKey,
          geminiModel: formData.geminiModel,
        };
        break;
      case 'wordpress':
        dataToSave = {
          wordpressUrl: formData.wordpressUrl,
          wordpressUsername: formData.wordpressUsername,
          wordpressAppPassword: formData.wordpressAppPassword,
          autoPublish: formData.autoPublish,
          includeSeo: formData.includeSeo,
          includeImages: formData.includeImages,
        };
        break;
      case 'export':
        dataToSave = {
          defaultLanguage: formData.defaultLanguage,
          defaultWordCount: formData.defaultWordCount,
          defaultTone: formData.defaultTone,
        };
        break;
      default:
        dataToSave = formData;
    }
    
    saveMutation.mutate(dataToSave);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="space-y-3">
                  <div className="h-10 bg-slate-200 rounded"></div>
                  <div className="h-10 bg-slate-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* API Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-primary-100 text-primary-600 flex items-center justify-center rounded-lg">
              <i className="fas fa-key"></i>
            </div>
            <CardTitle>API Yapılandırması</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="gemini-api-key">Gemini API Anahtarı</Label>
            <div className="relative">
              <Input
                id="gemini-api-key"
                type={showApiKey ? "text" : "password"}
                placeholder="API anahtarınızı girin..."
                value={formData.geminiApiKey}
                onChange={(e) => setFormData({...formData, geminiApiKey: e.target.value})}
                className="pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <i className={`fas ${showApiKey ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </Button>
            </div>
            <p className="text-slate-500 text-xs mt-2">API anahtarınız güvenli olarak şifrelenir</p>
          </div>
          
          <div>
            <Label htmlFor="gemini-model">Model Seçimi</Label>
            <Select value={formData.geminiModel} onValueChange={(value) => setFormData({...formData, geminiModel: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini-2.5-flash">gemini-2.5-flash (En Güncel)</SelectItem>
                <SelectItem value="gemini-2.5-pro">gemini-2.5-pro (En Güçlü)</SelectItem>
                <SelectItem value="gemini-2.0-flash">gemini-2.0-flash</SelectItem>
                <SelectItem value="gemini-2.0-flash-lite">gemini-2.0-flash-lite</SelectItem>
                <SelectItem value="gemini-1.5-pro">gemini-1.5-pro (Eski)</SelectItem>
                <SelectItem value="gemini-1.5-flash">gemini-1.5-flash (Eski)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
              <span className="text-emerald-700 font-medium">API Bağlantısı Aktif</span>
            </div>
            <Button variant="link" className="text-emerald-600 hover:text-emerald-800 text-sm font-medium p-0">
              Test Et
            </Button>
          </div>
          
          <Button 
            onClick={() => handleSubmit('api')}
            disabled={saveMutation.isPending}
            className="w-full bg-primary-600 hover:bg-primary-700"
          >
            Ayarları Kaydet
          </Button>
        </CardContent>
      </Card>

      {/* WordPress Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-100 text-blue-600 flex items-center justify-center rounded-lg">
              <i className="fab fa-wordpress"></i>
            </div>
            <CardTitle>WordPress Entegrasyonu</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="wp-url">Site URL</Label>
            <Input
              id="wp-url"
              type="url"
              placeholder="https://siteniz.com"
              value={formData.wordpressUrl}
              onChange={(e) => setFormData({...formData, wordpressUrl: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="wp-username">Kullanıcı Adı</Label>
            <Input
              id="wp-username"
              type="text"
              placeholder="WordPress kullanıcı adı"
              value={formData.wordpressUsername}
              onChange={(e) => setFormData({...formData, wordpressUsername: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="wp-password">Uygulama Şifresi</Label>
            <Input
              id="wp-password"
              type="password"
              placeholder="WordPress uygulama şifresi"
              value={formData.wordpressAppPassword}
              onChange={(e) => setFormData({...formData, wordpressAppPassword: e.target.value})}
            />
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <Checkbox
                checked={formData.autoPublish}
                onCheckedChange={(checked) => setFormData({...formData, autoPublish: !!checked})}
              />
              <span className="text-sm text-slate-700">Otomatik yayınlama</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <Checkbox
                checked={formData.includeSeo}
                onCheckedChange={(checked) => setFormData({...formData, includeSeo: !!checked})}
              />
              <span className="text-sm text-slate-700">SEO meta verileri ekle</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <Checkbox
                checked={formData.includeImages}
                onCheckedChange={(checked) => setFormData({...formData, includeImages: !!checked})}
              />
              <span className="text-sm text-slate-700">Öne çıkan görsel oluştur</span>
            </label>
          </div>
          
          <Button 
            onClick={() => handleSubmit('wordpress')}
            disabled={saveMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            WordPress'e Bağlan
          </Button>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded-lg">
              <i className="fas fa-chart-bar"></i>
            </div>
            <CardTitle>Kullanım İstatistikleri</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">API Kullanımı</span>
              <span className="text-sm text-slate-500">2,340 / 10,000</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "23.4%" }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Aylık Makale</span>
              <span className="text-sm text-slate-500">47 / 100</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-primary-500 h-2 rounded-full" style={{ width: "47%" }}></div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">156</p>
              <p className="text-slate-500 text-sm">Toplam Makale</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">234K</p>
              <p className="text-slate-500 text-sm">Toplam Kelime</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-orange-100 text-orange-600 flex items-center justify-center rounded-lg">
              <i className="fas fa-download"></i>
            </div>
            <CardTitle>Dışa Aktarma</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Varsayılan Format</Label>
            <Select defaultValue="html">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="markdown">Markdown</SelectItem>
                <SelectItem value="txt">Plain Text</SelectItem>
                <SelectItem value="docx">Word Document</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <Checkbox defaultChecked />
              <span className="text-sm text-slate-700">Meta verilerini dahil et</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <Checkbox />
              <span className="text-sm text-slate-700">Görsel linklerini dahil et</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <Checkbox defaultChecked />
              <span className="text-sm text-slate-700">Otomatik yedekleme</span>
            </label>
          </div>
          
          <div className="pt-4 space-y-3">
            <Button className="w-full bg-orange-600 hover:bg-orange-700">
              <i className="fas fa-download mr-2"></i>
              Tüm Makaleleri İndir
            </Button>
            
            <Button variant="outline" className="w-full">
              <i className="fas fa-cloud-download-alt mr-2"></i>
              Yedek Oluştur
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
