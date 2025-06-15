import { useState } from "react";
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      return await apiRequest("POST", "/api/seo-indexing/submit", data);
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="submit">URL Gönder</TabsTrigger>
          <TabsTrigger value="jobs">İndeksleme İşleri</TabsTrigger>
          <TabsTrigger value="stats">İstatistikler</TabsTrigger>
        </TabsList>

        {/* Submit URLs Tab */}
        <TabsContent value="submit" className="space-y-6">
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