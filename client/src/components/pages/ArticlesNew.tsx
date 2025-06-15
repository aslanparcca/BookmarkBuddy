import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { isUnauthorizedError } from "@/lib/authUtils";
import ArticleViewModal from "@/components/ArticleViewModal";
import ArticleEditModal from "@/components/ArticleEditModal";

interface Website {
  id: number;
  url: string;
  type: string;
  categories?: string[];
}

interface ArticleResponse {
  articles: any[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export default function ArticlesNew() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState<number[]>([]);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [publishStatus, setPublishStatus] = useState<string>("draft");
  const [perPage, setPerPage] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const offset = (currentPage - 1) * perPage;

  const { data: responseData, isLoading, refetch } = useQuery<ArticleResponse>({
    queryKey: ['/api/articles', { limit: perPage, offset, search: searchQuery }],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: perPage.toString(),
        offset: offset.toString(),
      });
      if (searchQuery.trim()) {
        params.append('search', searchQuery);
      }
      return await apiRequest('GET', `/api/articles?${params}`) as any;
    },
    enabled: true,
  });

  const articles = responseData?.articles || [];
  const pagination = responseData?.pagination || { limit: 25, offset: 0, total: 0, hasMore: false };

  // Fetch websites
  const { data: websites = [] } = useQuery<Website[]>({
    queryKey: ['/api/websites'],
    retry: false,
  });

  // Categories for selected website
  const categories = useMemo(() => {
    const selectedWebsiteData = websites.find(w => w.id.toString() === selectedWebsite);
    return selectedWebsiteData?.categories || [];
  }, [websites, selectedWebsite]);

  const deleteMutation = useMutation({
    mutationFn: async (articleId: number) => {
      await apiRequest('DELETE', `/api/articles/${articleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      toast({
        title: "Makale Silindi",
        description: "Makale başarıyla silindi.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Makale silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', '/api/articles');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      setSelectedArticles([]);
      toast({
        title: "Başarılı",
        description: "Tüm makaleler silindi.",
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
        description: error.message || "Makaleler silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const sendArticlesMutation = useMutation({
    mutationFn: async ({ articleIds, websiteId, category, status }: { 
      articleIds: number[], 
      websiteId: string, 
      category: string, 
      status: string 
    }) => {
      await apiRequest('POST', '/api/send-articles-to-website', {
        articleIds,
        websiteId: parseInt(websiteId),
        category,
        publishStatus: status
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      setIsSendDialogOpen(false);
      setSelectedArticles([]);
      setSelectedWebsite("");
      setSelectedCategory("");
      toast({
        title: "Başarılı",
        description: "Makaleler web sitenize gönderildi.",
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
        description: error.message || "Makale gönderilirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const bulkDeleteSelectedMutation = useMutation({
    mutationFn: async (articleIds: number[]) => {
      await Promise.all(articleIds.map(id => 
        apiRequest('DELETE', `/api/articles/${id}`)
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      setSelectedArticles([]);
      toast({
        title: "Başarılı",
        description: "Seçilen makaleler silindi.",
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
        description: error.message || "Makaleler silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const filteredArticles = useMemo(() => {
    return articles.filter((article: any) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.category && article.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [articles, searchQuery]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedArticles(filteredArticles.map((article: any) => article.id));
    } else {
      setSelectedArticles([]);
    }
  };

  const handleSelectArticle = (articleId: number, checked: boolean) => {
    if (checked) {
      setSelectedArticles(prev => [...prev, articleId]);
    } else {
      setSelectedArticles(prev => prev.filter(id => id !== articleId));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'draft': { label: 'Taslak', variant: 'secondary' as const },
      'published': { label: 'Yayınlandı', variant: 'default' as const },
      'archived': { label: 'Arşivlendi', variant: 'outline' as const },
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const totalPages = Math.ceil(pagination.total / perPage);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Refresh Alert Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 rounded-full p-2">
            <i className="fas fa-info-circle text-blue-600"></i>
          </div>
          <div>
            <h3 className="font-medium text-blue-900">Yeni makaleler oluşturuldu</h3>
            <p className="text-sm text-blue-700">Yeni oluşturulan makaleleri görmek için listeyi yenileyin.</p>
          </div>
        </div>
        <button 
          onClick={() => refetch()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Listeyi Yenile
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      {/* Header */}
      <div className="border-b border-slate-200 p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Left side - Title and dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button variant="outline" className="justify-start min-w-[200px]">
                <i className="fas fa-folder-open mr-2"></i>
                Tüm İçeriklerim ({pagination.total})
              </Button>
            </div>
            
            {/* REFRESH BUTTON */}
            <Button 
              onClick={() => refetch()} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <i className="fas fa-sync-alt"></i>
              Yenile
            </Button>
          </div>

          {/* Right side - Search and controls */}
          <div className="flex flex-row gap-2 items-center">
            {/* Search */}
            <div className="flex items-center">
              <Input
                type="text"
                placeholder="Gelişmiş Arama"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-r-none border-r-0 min-w-[200px]"
              />
              <Button
                variant="outline"
                className="rounded-l-none border-l-0 px-3"
                onClick={() => setShowFilters(!showFilters)}
              >
                <i className="fas fa-filter"></i>
              </Button>
            </div>

            {/* Per page selector */}
            <Select value={perPage.toString()} onValueChange={(value) => {
              setPerPage(parseInt(value));
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="200">200</SelectItem>
              </SelectContent>
            </Select>

            {/* Actions dropdown */}
            <div className="relative">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <i className="fas fa-bars"></i>
                İşlemler
              </Button>
              
              {selectedArticles.length > 0 && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-2 z-10 min-w-[200px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-blue-600 hover:bg-blue-50"
                    onClick={() => setIsSendDialogOpen(true)}
                  >
                    <i className="fas fa-paper-plane mr-2"></i>
                    Seçilenleri Web Sitemde Yayınla
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-red-600 hover:bg-red-50"
                    onClick={() => {
                      if (window.confirm(`${selectedArticles.length} makaleyi silmek istediğinizden emin misiniz?`)) {
                        bulkDeleteSelectedMutation.mutate(selectedArticles);
                      }
                    }}
                    disabled={bulkDeleteSelectedMutation.isPending}
                  >
                    <i className="fas fa-trash mr-2"></i>
                    Seçilenleri Sil
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters section */}
        {showFilters && (
          <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Başlık</label>
                <Input placeholder="Başlık" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Durum</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Hepsi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Hepsi</SelectItem>
                    <SelectItem value="draft">Taslak Durumundakiler</SelectItem>
                    <SelectItem value="published">Tamamlananlar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Yayın Durumu</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Hepsi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Hepsi</SelectItem>
                    <SelectItem value="published">Yayınlananlar</SelectItem>
                    <SelectItem value="draft">Yayınlanmayanlar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" className="w-full">
                  <i className="fas fa-search mr-2"></i>
                  Filtrele
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <i className="fas fa-file-alt text-4xl"></i>
            </div>
            <h3 className="text-lg font-medium text-slate-600 mb-2">
              Henüz makale yok - 
              <span 
                onClick={() => refetch()}
                className="text-blue-600 hover:text-blue-800 cursor-pointer underline text-base"
              >
                Yenile
              </span>
            </h3>
            <p className="text-slate-500 mb-4">İlk makalenizi oluşturmak için AI Editor'ü kullanın.</p>
            <div className="mt-4">
              <button 
                onClick={() => refetch()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Listeyi Yenile
              </button>
            </div>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-12 font-bold">#</TableHead>
                  <TableHead className="w-12 text-center">
                    <Checkbox
                      checked={selectedArticles.length === filteredArticles.length && filteredArticles.length > 0}
                      onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                    />
                  </TableHead>
                  <TableHead className="font-bold">İçerik</TableHead>
                  <TableHead className="font-bold">Şablon</TableHead>
                  <TableHead className="font-bold text-center w-20">Kelime</TableHead>
                  <TableHead className="font-bold text-center w-20">Kredi</TableHead>
                  <TableHead className="font-bold text-center">Tarih</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.map((article: any, index: number) => (
                  <TableRow key={article.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono text-sm">
                      {(currentPage - 1) * perPage + index + 1}
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={selectedArticles.includes(article.id)}
                        onCheckedChange={(checked) => handleSelectArticle(article.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div 
                        className="cursor-pointer hover:text-blue-600"
                        onClick={() => {
                          setSelectedArticle(article);
                          setIsViewModalOpen(true);
                        }}
                      >
                        <div className="font-medium truncate max-w-[300px]">{article.title}</div>
                        <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                          {getStatusBadge(article.status)}
                          <span>•</span>
                          <span>{article.readingTime || 5} dk okuma</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">AI Editör</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-mono text-sm">{article.wordCount || 0}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-mono text-sm">1</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm text-slate-600">
                        {format(new Date(article.createdAt), 'dd.MM.yyyy HH:mm', { locale: tr })}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="border-t border-slate-200 px-4 py-3 flex items-center justify-between">
              <div className="text-sm text-slate-500">
                {(currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, pagination.total)} / {pagination.total} makale
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <i className="fas fa-chevron-left"></i>
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={currentPage === pageNum ? "bg-blue-600 text-white" : ""}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <i className="fas fa-chevron-right"></i>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bulk Actions Floating Panel */}
      {selectedArticles.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border border-slate-200 rounded-lg shadow-lg p-3 flex items-center gap-3 z-50">
          <span className="text-sm font-medium">{selectedArticles.length} makale seçildi</span>
          <Button
            size="sm"
            variant="outline"
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
            onClick={() => setIsSendDialogOpen(true)}
          >
            <i className="fas fa-paper-plane mr-1"></i>
            Siteye Gönder
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => {
              if (window.confirm(`${selectedArticles.length} makaleyi silmek istediğinizden emin misiniz?`)) {
                bulkDeleteSelectedMutation.mutate(selectedArticles);
              }
            }}
            disabled={bulkDeleteSelectedMutation.isPending}
          >
            <i className="fas fa-trash mr-1"></i>
            Sil
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedArticles([])}
          >
            <i className="fas fa-times"></i>
          </Button>
        </div>
      )}

      {/* Send Articles Dialog */}
      <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Makaleleri Web Sitesine Gönder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Web Sitesi</label>
              <Select value={selectedWebsite} onValueChange={setSelectedWebsite}>
                <SelectTrigger>
                  <SelectValue placeholder="Web sitesi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {websites.map((website) => (
                    <SelectItem key={website.id} value={website.id.toString()}>
                      {website.url}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Kategori</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={!selectedWebsite}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category, index) => (
                    <SelectItem key={index} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Yayın Durumu</label>
              <Select value={publishStatus} onValueChange={setPublishStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Taslak</SelectItem>
                  <SelectItem value="publish">Yayınla</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsSendDialogOpen(false)}
                className="flex-1"
              >
                İptal
              </Button>
              <Button
                onClick={() => {
                  if (!selectedWebsite || !selectedCategory) {
                    toast({
                      title: "Hata",
                      description: "Lütfen web sitesi ve kategori seçin.",
                      variant: "destructive",
                    });
                    return;
                  }
                  sendArticlesMutation.mutate({
                    articleIds: selectedArticles,
                    websiteId: selectedWebsite,
                    category: selectedCategory,
                    status: publishStatus
                  });
                }}
                disabled={sendArticlesMutation.isPending || !selectedWebsite || !selectedCategory}
                className="flex-1"
              >
                {sendArticlesMutation.isPending ? 'Gönderiliyor...' : 'Gönder'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ArticleViewModal
        article={selectedArticle}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedArticle(null);
        }}
        onEdit={(article) => {
          setIsViewModalOpen(false);
          setSelectedArticle(article);
          setIsEditModalOpen(true);
        }}
      />

      <ArticleEditModal
        article={selectedArticle}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedArticle(null);
        }}
      />
      </div>
    </div>
  );
}