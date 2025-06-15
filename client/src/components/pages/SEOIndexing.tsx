import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Search, Globe, CheckCircle, XCircle, Clock, RefreshCw, Plus, Upload, FileText, BarChart3 } from "lucide-react";

interface IndexingJob {
  id: number;
  websiteId: number;
  websiteName: string;
  urls: string[];
  searchEngines: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  results: IndexingResult[];
  createdAt: string;
}

interface IndexingResult {
  url: string;
  searchEngine: string;
  status: 'success' | 'failed' | 'pending';
  indexedAt?: string;
  error?: string;
}

interface Website {
  id: number;
  url: string;
  name: string;
  platform: string;
}

export default function SEOIndexing() {
  const [selectedWebsite, setSelectedWebsite] = useState<string>("");
  const [urlsToIndex, setUrlsToIndex] = useState<string>("");
  const [selectedEngines, setSelectedEngines] = useState<string[]>(['google']);
  const [activeTab, setActiveTab] = useState("submit");
  const [googleIndexingEnabled, setGoogleIndexingEnabled] = useState(false);
  const [indexNowEnabled, setIndexNowEnabled] = useState(false);
  const [googleServiceAccount, setGoogleServiceAccount] = useState("");
  const [googleSiteDomain, setGoogleSiteDomain] = useState("");
  const [indexNowApiKey, setIndexNowApiKey] = useState("");
  const [indexNowDomain, setIndexNowDomain] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load SEO API settings
  const { data: seoApiSettings } = useQuery({
    queryKey: ["/api/seo-api-settings"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/seo-api-settings");
      return await response.json();
    },
  });

  // Update state when settings are loaded
  React.useEffect(() => {
    if (seoApiSettings) {
      setGoogleIndexingEnabled(seoApiSettings.googleIndexingEnabled || false);
      setGoogleServiceAccount(seoApiSettings.googleServiceAccountKey || "");
      setGoogleSiteDomain(seoApiSettings.googleSiteDomain || "");
      setIndexNowEnabled(seoApiSettings.indexNowEnabled || false);
      setIndexNowApiKey(seoApiSettings.indexNowApiKey || "");
      setIndexNowDomain(seoApiSettings.indexNowDomain || "");
    }
  }, [seoApiSettings]);

  // Save SEO API settings mutation
  const saveSeoApiSettingsMutation = useMutation({
    mutationFn: async (settingsData: any) => {
      const response = await apiRequest("POST", "/api/seo-api-settings", settingsData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seo-api-settings"] });
      toast({
        title: "Başarılı",
        description: "SEO API ayarları kaydedildi",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Ayarlar kaydedilemedi",
        variant: "destructive",
      });
    },
  });

  // Generate IndexNow key mutation
  const generateIndexNowKeyMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/seo-api-settings/generate-indexnow-key");
      return await response.json();
    },
    onSuccess: (data) => {
      setIndexNowApiKey(data.apiKey);
      toast({
        title: "Başarılı",
        description: "IndexNow API anahtarı oluşturuldu",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "API anahtarı oluşturulamadı",
        variant: "destructive",
      });
    },
  });

  // Test Google API mutation
  const testGoogleApiMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/seo-api-settings/test-google-api", {
        serviceAccountKey: googleServiceAccount,
        siteDomain: googleSiteDomain,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Başarılı",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "API test edilemedi",
        variant: "destructive",
      });
    },
  });

  // Test IndexNow key mutation
  const testIndexNowKeyMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/seo-api-settings/test-indexnow-key", {
        apiKey: indexNowApiKey,
        domain: indexNowDomain,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Başarılı",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "API key test edilemedi",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/json') {
        toast({
          title: "Hata",
          description: "Lütfen geçerli bir JSON dosyası seçin",
          variant: "destructive",
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          JSON.parse(content); // Validate JSON
          setGoogleServiceAccount(content);
          setUploadedFileName(file.name);
          toast({
            title: "Başarılı",
            description: "JSON dosyası yüklendi",
          });
        } catch (error) {
          toast({
            title: "Hata",
            description: "Geçersiz JSON dosyası",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSaveApiSettings = () => {
    const settingsData = {
      googleIndexingEnabled,
      googleServiceAccountKey: googleServiceAccount,
      googleSiteDomain,
      indexNowEnabled,
      indexNowApiKey,
      indexNowDomain,
    };
    saveSeoApiSettingsMutation.mutate(settingsData);
  };

  // Fetch websites
  const { data: websites = [] } = useQuery<Website[]>({
    queryKey: ['/api/websites'],
    retry: false,
  });

  // Fetch indexing jobs
  const { data: indexingJobs = [], isLoading } = useQuery<IndexingJob[]>({
    queryKey: ['/api/seo-indexing/jobs'],
    retry: false,
  });

  const submitIndexingMutation = useMutation({
    mutationFn: async (data: { websiteId: string, urls: string[], searchEngines: string[] }) => {
      const response = await apiRequest("POST", "/api/seo-indexing/submit", data);
      return await response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "İndeksleme İşi Başlatıldı",
        description: `${data.urlCount || 0} URL ${data.searchEngines?.length || 0} arama motorunda indexlenmeye başladı`,
      });
      setUrlsToIndex("");
      setSelectedWebsite("");
      queryClient.invalidateQueries({ queryKey: ['/api/seo-indexing/jobs'] });
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
        description: error.message || "İndeksleme işi başlatılamadı",
        variant: "destructive",
      });
    },
  });

  const generateSitemapUrlsMutation = useMutation({
    mutationFn: async (websiteId: string) => {
      return await apiRequest("POST", `/api/seo-indexing/generate-sitemap-urls/${websiteId}`, {});
    },
    onSuccess: (data: any) => {
      if (data.urls && Array.isArray(data.urls)) {
        setUrlsToIndex(data.urls.join('\n'));
        toast({
          title: "Sitemap URL'leri Yüklendi",
          description: `${data.urls.length} URL sitemap'ten alındı`,
        });
      } else {
        toast({
          title: "Hata",
          description: "URL'ler alınamadı",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Sitemap URL'leri alınamadı",
        variant: "destructive",
      });
    },
  });

  const handleEngineToggle = (engine: string) => {
    setSelectedEngines(prev => 
      prev.includes(engine) 
        ? prev.filter(e => e !== engine)
        : [...prev, engine]
    );
  };

  const handleSubmitIndexing = () => {
    if (!selectedWebsite || !urlsToIndex.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen web sitesi seçin ve URL'leri girin",
        variant: "destructive",
      });
      return;
    }

    if (selectedEngines.length === 0) {
      toast({
        title: "Hata",
        description: "En az bir arama motoru seçin",
        variant: "destructive",
      });
      return;
    }

    const urls = urlsToIndex.split('\n').filter(url => url.trim()).map(url => url.trim());
    
    if (urls.length === 0) {
      toast({
        title: "Hata",
        description: "Geçerli URL'ler girin",
        variant: "destructive",
      });
      return;
    }

    submitIndexingMutation.mutate({
      websiteId: selectedWebsite,
      urls,
      searchEngines: selectedEngines
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Bekliyor', variant: 'secondary' as const, icon: Clock },
      running: { label: 'Çalışıyor', variant: 'default' as const, icon: RefreshCw },
      completed: { label: 'Tamamlandı', variant: 'default' as const, icon: CheckCircle },
      failed: { label: 'Başarısız', variant: 'destructive' as const, icon: XCircle },
      success: { label: 'Başarılı', variant: 'default' as const, icon: CheckCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const searchEngines = [
    { id: 'google', name: 'Google', icon: 'fab fa-google', color: 'text-blue-600' },
    { id: 'bing', name: 'Bing', icon: 'fab fa-microsoft', color: 'text-orange-500' },
    { id: 'yandex', name: 'Yandex', icon: 'fas fa-search', color: 'text-red-500' },
    { id: 'yahoo', name: 'Yahoo', icon: 'fab fa-yahoo', color: 'text-purple-600' },
    { id: 'baidu', name: 'Baidu', icon: 'fas fa-search', color: 'text-blue-800' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SEO İndeksleme Paneli</h1>
          <p className="text-gray-600">Web sitelerinizi arama motorlarında otomatik olarak indexleyin</p>
        </div>
        <div className="flex items-center gap-2">
          <Search className="w-6 h-6 text-blue-500" />
          <Globe className="w-6 h-6 text-green-500" />
          <BarChart3 className="w-6 h-6 text-purple-500" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="submit">URL Gönder</TabsTrigger>
          <TabsTrigger value="api-settings">API Ayarları</TabsTrigger>
          <TabsTrigger value="jobs">İndeksleme İşleri</TabsTrigger>
          <TabsTrigger value="stats">İstatistikler</TabsTrigger>
        </TabsList>

        {/* Submit URLs Tab */}
        <TabsContent value="submit" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">TOPLAM SITE</p>
                    <p className="text-2xl font-bold text-gray-900">{websites.length}</p>
                    <p className="text-xs text-green-600">+{websites.length} eklendi</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">TOPLAM SITEMAP</p>
                    <p className="text-2xl font-bold text-gray-900">1</p>
                    <p className="text-xs text-green-600">+1 eklendi</p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">IPV4 PROXY</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                    <p className="text-xs text-yellow-600">Yapılandırılmadı</p>
                  </div>
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-4 h-4 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">IPV6 PROXY</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                    <p className="text-xs text-green-600">+0 eklendi</p>
                  </div>
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-4 h-4 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Site Management Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Site Listesi
                </CardTitle>
                <Button 
                  variant="default" 
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {/* Add site functionality */}}
                >
                  + Siteye Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">ID</TableHead>
                      <TableHead>Site Adı</TableHead>
                      <TableHead>Site URL</TableHead>
                      <TableHead>Sitemap URL</TableHead>
                      <TableHead>Sitemap İçeriği</TableHead>
                      <TableHead>Son Ping</TableHead>
                      <TableHead>Proxy</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {websites.map((website) => (
                      <TableRow key={website.id}>
                        <TableCell className="font-medium">{website.id}</TableCell>
                        <TableCell>{website.name}</TableCell>
                        <TableCell>
                          <a href={website.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {website.url}
                          </a>
                        </TableCell>
                        <TableCell>
                          <span className="text-green-600">sitemap.xml</span>
                          <br />
                          <span className="text-xs text-gray-500">Sitemap güncelleme: {new Date().toLocaleDateString('tr-TR')}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-blue-600">76</span> URL
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-gray-500">{new Date().toLocaleDateString('tr-TR')} 17:30</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">Aktif</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="outline" className="w-8 h-8 p-0 bg-blue-500 hover:bg-blue-600 border-blue-500">
                              <i className="fab fa-twitter text-white text-xs"></i>
                            </Button>
                            <Button size="sm" variant="outline" className="w-8 h-8 p-0 bg-green-500 hover:bg-green-600 border-green-500">
                              <i className="fab fa-whatsapp text-white text-xs"></i>
                            </Button>
                            <Button size="sm" variant="outline" className="w-8 h-8 p-0 bg-blue-600 hover:bg-blue-700 border-blue-600">
                              <i className="fab fa-telegram text-white text-xs"></i>
                            </Button>
                            <Button size="sm" variant="outline" className="w-8 h-8 p-0 bg-gray-500 hover:bg-gray-600 border-gray-500">
                              <i className="fas fa-cog text-white text-xs"></i>
                            </Button>
                            <Button size="sm" variant="outline" className="w-8 h-8 p-0 bg-red-500 hover:bg-red-600 border-red-500">
                              <i className="fas fa-trash text-white text-xs"></i>
                            </Button>
                            <Button size="sm" variant="outline" className="w-8 h-8 p-0 bg-orange-500 hover:bg-orange-600 border-orange-500">
                              <i className="fas fa-bell text-white text-xs"></i>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                URL İndeksleme Gönderimi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Website Selection */}
              <div className="space-y-2">
                <Label htmlFor="website">Web Sitesi</Label>
                <Select value={selectedWebsite} onValueChange={setSelectedWebsite}>
                  <SelectTrigger>
                    <SelectValue placeholder="Web sitesi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {websites.map((website) => (
                      <SelectItem key={website.id} value={website.id.toString()}>
                        {website.url} - {website.platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {websites.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Henüz web siteniz yok. <strong>Web Sitelerim</strong> bölümünden ekleyebilirsiniz.
                  </p>
                )}
              </div>

              {/* Auto-generate URLs */}
              {selectedWebsite && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => generateSitemapUrlsMutation.mutate(selectedWebsite)}
                    disabled={generateSitemapUrlsMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    {generateSitemapUrlsMutation.isPending ? "Yükleniyor..." : "Sitemap'ten URL'leri Al"}
                  </Button>
                  <span className="text-sm text-gray-500">Otomatik olarak tüm sayfaları bulur</span>
                </div>
              )}

              {/* Quick URL Templates */}
              <div className="space-y-2">
                <Label>Hızlı URL Şablonları</Label>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const website = websites.find(w => w.id.toString() === selectedWebsite);
                      if (website) {
                        const commonUrls = [
                          website.url,
                          `${website.url}/hakkimizda`,
                          `${website.url}/iletisim`,
                          `${website.url}/blog`,
                          `${website.url}/hizmetler`
                        ].join('\n');
                        setUrlsToIndex(urlsToIndex + (urlsToIndex ? '\n' : '') + commonUrls);
                      }
                    }}
                    disabled={!selectedWebsite}
                  >
                    Temel Sayfalar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const website = websites.find(w => w.id.toString() === selectedWebsite);
                      if (website) {
                        setUrlsToIndex(`${website.url}/sitemap.xml`);
                      }
                    }}
                    disabled={!selectedWebsite}
                  >
                    Sitemap URL
                  </Button>
                </div>
              </div>

              {/* URLs Input */}
              <div className="space-y-2">
                <Label htmlFor="urls">İndekslenecek URL'ler</Label>
                <Textarea
                  id="urls"
                  placeholder="Her satıra bir URL girin&#10;https://example.com/sayfa1&#10;https://example.com/sayfa2"
                  value={urlsToIndex}
                  onChange={(e) => setUrlsToIndex(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-gray-500">
                  {urlsToIndex.split('\n').filter(url => url.trim()).length} URL girdiniz
                </p>
              </div>

              {/* Search Engine Selection */}
              <div className="space-y-3">
                <Label>Arama Motorları</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {searchEngines.map((engine) => (
                    <div
                      key={engine.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedEngines.includes(engine.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleEngineToggle(engine.id)}
                    >
                      <div className="flex items-center space-x-2">
                        <i className={`${engine.icon} ${engine.color}`}></i>
                        <span className="font-medium">{engine.name}</span>
                        {selectedEngines.includes(engine.id) && (
                          <CheckCircle className="w-4 h-4 text-blue-500 ml-auto" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmitIndexing}
                disabled={submitIndexingMutation.isPending}
                className="w-full"
                size="lg"
              >
                {submitIndexingMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    İndeksleme Başlatılıyor...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    İndekslemeyi Başlat
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Settings Tab */}
        <TabsContent value="api-settings" className="space-y-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">API Ayarları</h3>
              <p className="text-blue-700 text-sm">
                Arama motoru indeksleme API'lerini yapılandırın ve yönetin.
              </p>
              <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                <CheckCircle className="w-4 h-4" />
                <span>API ayarlarını yapılandırarak sitelerinizin arama motorlarında daha hızlı indekslenmesini sağlayabilirsiniz.</span>
              </div>
            </div>

            {/* API Selection Buttons */}
            <div className="flex gap-4">
              <Button
                variant={googleIndexingEnabled ? "default" : "outline"}
                onClick={() => setGoogleIndexingEnabled(!googleIndexingEnabled)}
                className="flex-1 h-12"
              >
                <i className="fab fa-google mr-2"></i>
                Google API
              </Button>
              <Button
                variant={indexNowEnabled ? "default" : "outline"}
                onClick={() => setIndexNowEnabled(!indexNowEnabled)}
                className="flex-1 h-12"
              >
                <Globe className="w-4 h-4 mr-2" />
                IndexNow API
              </Button>
            </div>

            {/* Google Indexing API Settings */}
            {googleIndexingEnabled && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <i className="fab fa-google text-blue-600"></i>
                    Google Indexing API Ayarları
                    <Badge variant="secondary" className="ml-2">Beta</Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Google Indexing API, URL'leri Google İndeksleme göndermenizi ve durumlarını kontrol etmenizi sağlar. <a href="#" className="text-blue-600 hover:underline">Dokümantasyon</a>
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-700">
                      <strong>Not:</strong> Google Indexing API, URL'leri Google İndeksleme göndermenizi ve durumlarını kontrol etmenizi sağlar. API için gerekli yetkilendirme bilgilerini aşağıda yapılandırabilirsiniz.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="googleApiEnabled" 
                      checked={googleIndexingEnabled}
                      onChange={(e) => setGoogleIndexingEnabled(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="googleApiEnabled">Google Indexing API'yi etkinleştir</Label>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="googleServiceAccount">Servis Hesabı JSON Anahtarı</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="jsonFileInput"
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => document.getElementById('jsonFileInput')?.click()}
                          className="flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Dosya Seç
                        </Button>
                        {uploadedFileName && (
                          <span className="text-sm text-green-600">
                            ✓ {uploadedFileName}
                          </span>
                        )}
                      </div>
                      <textarea
                        id="googleServiceAccount"
                        value={googleServiceAccount}
                        onChange={(e) => setGoogleServiceAccount(e.target.value)}
                        placeholder="Google Cloud Console'den oluşturduğunuz service hesabınızın JSON anahtarını yapıştırın veya yukarıdan dosya seçin"
                        className="w-full h-24 p-2 border border-gray-300 rounded-md text-sm font-mono mt-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        JSON dosyası seçebilir veya içeriği doğrudan yapıştırabilirsiniz
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="googleSiteDomain">Servis Hesabı E-Posta</Label>
                      <Input
                        id="googleSiteDomain"
                        value={googleSiteDomain}
                        onChange={(e) => setGoogleSiteDomain(e.target.value)}
                        placeholder="dursoft@gmail.com"
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Google Cloud Console'dan oluşturduğunuz servis hesabınızın e-posta adresi
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="googleTestDomain">Site Domaini (Test için)</Label>
                      <Input
                        id="googleTestDomain"
                        placeholder="fegeled.com"
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Sitenizin domaini adı (www olmadan ve http:// veya https:// protokolü olmadan) *enel test için gerekli.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        onClick={handleSaveApiSettings}
                        disabled={saveSeoApiSettingsMutation.isPending}
                      >
                        <RefreshCw className="w-4 h-4" />
                        {saveSeoApiSettingsMutation.isPending ? "Kaydediliyor..." : "Ayarları Kaydet"}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        onClick={() => testGoogleApiMutation.mutate()}
                        disabled={testGoogleApiMutation.isPending || !googleServiceAccount || !googleSiteDomain}
                      >
                        <CheckCircle className="w-4 h-4" />
                        {testGoogleApiMutation.isPending ? "Test Ediliyor..." : "API Bağlantısı Test Et"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* IndexNow API Settings */}
            {indexNowEnabled && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-600" />
                    IndexNow API Ayarları
                    <Badge variant="secondary" className="ml-2">Beta</Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    IndexNow, tek bir API ile birden fazla arama motorunu (Bing, Yandex vb.) aynı anda bilgilendirmenizi sağlar. <a href="#" className="text-blue-600 hover:underline">Resmi Site</a>
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-700">
                      <strong>Not:</strong> IndexNow, Bing, Yandex, Seznam.cz gibi çeşitli arama motorlarına aynı anda URL göndermenizi sağlayan bir protokoldür.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="indexNowApiEnabled" 
                      checked={indexNowEnabled}
                      onChange={(e) => setIndexNowEnabled(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="indexNowApiEnabled">IndexNow API'yi etkinleştir</Label>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="indexNowDomain">Ana Domain</Label>
                      <Input
                        id="indexNowDomain"
                        value={indexNowDomain}
                        onChange={(e) => setIndexNowDomain(e.target.value)}
                        placeholder="fegeled.com"
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Sitenizin domain adı (www olmadan ve http:// veya https:// protokolü olmadan)
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="indexNowApiKey">API Key</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="indexNowApiKey"
                          value={indexNowApiKey}
                          onChange={(e) => setIndexNowApiKey(e.target.value)}
                          placeholder="nALeZRXCJr6VWWrKYFK97XK95y2SeehSMZnS"
                          className="flex-1"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => generateIndexNowKeyMutation.mutate()}
                          disabled={generateIndexNowKeyMutation.isPending}
                        >
                          {generateIndexNowKeyMutation.isPending ? "Üretiliyor..." : "Üret"}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        API key boş bırakılırsa sistem otomatik olarak oluşturacaktır.
                      </p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <h4 className="font-medium text-yellow-800 mb-2">IndexNow Hakkında:</h4>
                      <p className="text-sm text-yellow-700 mb-2">
                        IndexNow aşağıdaki arama motorları tarafından desteklenmektedir:
                      </p>
                      <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                        <li><strong>Bing</strong> - Yandex - Seznam.cz - Naver - DuckDuckGo</li>
                      </ul>
                      
                      <h5 className="font-medium text-yellow-800 mt-3 mb-1">Kurulum Adımları:</h5>
                      <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                        <li>API Key Oluşturun - "Üret" düğmesine tıklayın veya kendi anahtarınızı değiştiriniz girin.</li>
                        <li>Doğrulama Dosyası - Kaydettiğinizde sistem kök dizininize bir dosya daha oluşturacaktır.</li>
                        <li>Dosya Erişimi Kontrol Edin - API key dosyasının web sunucunuzun kök dizinindeki olmması gerektiği.</li>
                      </ol>
                      
                      <p className="text-sm text-yellow-700 mt-2">
                        <strong>Önemli:</strong> API key dosyasının web sitenizin kök dizinindeki olması gerektiği.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        onClick={handleSaveApiSettings}
                        disabled={saveSeoApiSettingsMutation.isPending}
                      >
                        <RefreshCw className="w-4 h-4" />
                        {saveSeoApiSettingsMutation.isPending ? "Kaydediliyor..." : "Ayarları Kaydet"}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        onClick={() => testIndexNowKeyMutation.mutate()}
                        disabled={testIndexNowKeyMutation.isPending || !indexNowApiKey || !indexNowDomain}
                      >
                        <CheckCircle className="w-4 h-4" />
                        {testIndexNowKeyMutation.isPending ? "Kontrol Ediliyor..." : "API Key Dosyasını Kontrol Et"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* IndexNow API Details Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  IndexNow API Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  IndexNow, tek bir API ile birden fazla arama motorunu (Bing, Yandex vb.) aynı anda bilgilendirmenizi sağlar. <a href="#" className="text-blue-600 hover:underline">Resmi Site</a>
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">IndexNow Hakkında:</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    IndexNow aşağıdaki arama motorları tarafından desteklenmektedir:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                    <div>• <strong>Bing</strong></div>
                    <div>• <strong>Yandex</strong></div>
                    <div>• <strong>Seznam.cz</strong></div>
                    <div>• <strong>Naver</strong></div>
                    <div>• <strong>DuckDuckGo</strong></div>
                  </div>
                  
                  <h5 className="font-medium text-gray-800 mt-4 mb-2">Kurulum Adımları:</h5>
                  <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                    <li><strong>API Key Oluşturun</strong> - "Üret" düğmesine tıklayın veya kendi anahtarınızı değiştirin.</li>
                    <li><strong>Doğrulama Dosyası</strong> - Kaydettiğinizde sistem kök dizininize bir dosya oluşturacaktır.</li>
                    <li><strong>Dosya Erişimi Kontrol Edin</strong> - API key dosyasının web sunucunuzun kök dizininde olması gerekir.</li>
                  </ol>
                  
                  <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800">
                    <strong>Önemli:</strong> API key dosyasının web sitenizin kök dizininde olması gerekir.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Indexing Jobs Tab */}
        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                İndeksleme İşleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                  <p className="text-gray-500 mt-2">İşler yükleniyor...</p>
                </div>
              ) : indexingJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 mx-auto text-gray-300" />
                  <p className="text-gray-500 mt-2">Henüz indeksleme işi yok</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {indexingJobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{job.websiteName}</h3>
                          <p className="text-sm text-gray-500">
                            {job.urls.length} URL • {job.searchEngines.join(', ')}
                          </p>
                        </div>
                        {getStatusBadge(job.status)}
                      </div>
                      
                      {job.status === 'running' && (
                        <div className="mb-3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>İlerleme</span>
                            <span>{job.progress}%</span>
                          </div>
                          <Progress value={job.progress} className="h-2" />
                        </div>
                      )}

                      {job.results.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Sonuçlar:</h4>
                          <div className="max-h-40 overflow-y-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="text-xs">URL</TableHead>
                                  <TableHead className="text-xs">Motor</TableHead>
                                  <TableHead className="text-xs">Durum</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {job.results.map((result, index) => (
                                  <TableRow key={index}>
                                    <TableCell className="text-xs max-w-xs truncate">
                                      {result.url}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                      {result.searchEngine}
                                    </TableCell>
                                    <TableCell>
                                      {getStatusBadge(result.status)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Toplam URL</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {indexingJobs.reduce((total, job) => total + job.urls.length, 0)}
                </div>
                <p className="text-xs text-gray-500">İndekslemeye gönderilen</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Başarılı İndeks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {indexingJobs.reduce((total, job) => 
                    total + job.results.filter(r => r.status === 'success').length, 0
                  )}
                </div>
                <p className="text-xs text-gray-500">Başarıyla indexlenen</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Aktif İşler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {indexingJobs.filter(job => job.status === 'running').length}
                </div>
                <p className="text-xs text-gray-500">Şu an çalışan</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Arama Motoru Dağılımı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {searchEngines.map((engine) => {
                  const engineResults = indexingJobs.reduce((total, job) => 
                    total + job.results.filter(r => r.searchEngine === engine.id).length, 0
                  );
                  const engineSuccess = indexingJobs.reduce((total, job) => 
                    total + job.results.filter(r => r.searchEngine === engine.id && r.status === 'success').length, 0
                  );
                  
                  return (
                    <div key={engine.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <i className={`${engine.icon} ${engine.color}`}></i>
                        <span>{engine.name}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {engineSuccess}/{engineResults} başarılı
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}