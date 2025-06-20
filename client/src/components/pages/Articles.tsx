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
  categories?: (string | { id?: string | number; name?: string })[];
}

export default function Articles() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState<number[]>([]);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [publishStatus, setPublishStatus] = useState<string>("draft");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: articles = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/articles'],
    enabled: true,
  });

  // Fetch websites
  const { data: websites = [] } = useQuery<Website[]>({
    queryKey: ['/api/websites'],
    retry: false,
  });

  // Categories for selected website
  const categories = useMemo(() => {
    const selectedWebsiteData = websites.find(w => w.id.toString() === selectedWebsite);
    const websiteCategories = selectedWebsiteData?.categories || [];
    
    // Handle both array and empty cases
    if (!Array.isArray(websiteCategories) || websiteCategories.length === 0) {
      return [];
    }
    
    return websiteCategories;
  }, [websites, selectedWebsite]) as (string | { id?: string | number; name?: string })[];

  // Auto-sync categories when website is selected
  const syncCategoriesMutation = useMutation({
    mutationFn: async (websiteId: string) => {
      return await apiRequest(`/api/websites/${websiteId}/sync`, "POST", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/websites'] });
    },
    onError: (error: Error) => {
      console.error('Category sync failed:', error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (articleId: number) => {
      await apiRequest(`/api/articles/${articleId}`, 'DELETE');
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
      return await apiRequest('/api/articles', 'DELETE');
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      toast({
        title: "Toplu Silme Başarılı",
        description: `${data.deletedCount} makale başarıyla silindi.`,
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

  const sendToWebsiteMutation = useMutation({
    mutationFn: async (data: { articleIds: number[], websiteId: string, category: string, publishStatus: string }) => {
      return await apiRequest("/api/articles/send-to-website", "POST", data);
    },
    onSuccess: (data) => {
      toast({
        title: "Başarılı",
        description: `${selectedArticles.length} makale siteye gönderildi`,
      });
      setSelectedArticles([]);
      setIsSendDialogOpen(false);
      setSelectedWebsite("");
      setSelectedCategory("");
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

  const filteredArticles = articles.filter((article: any) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (article.category && article.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedArticles = filteredArticles.slice(startIndex, endIndex);

  // Reset to first page when changing items per page or search
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Selection functions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedArticles(paginatedArticles.map((article: any) => article.id));
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

  const handleSendToWebsite = () => {
    if (!selectedWebsite || !selectedCategory) {
      toast({
        title: "Hata",
        description: "Lütfen site ve kategori seçin",
        variant: "destructive",
      });
      return;
    }

    sendToWebsiteMutation.mutate({
      articleIds: selectedArticles,
      websiteId: selectedWebsite,
      category: selectedCategory,
      publishStatus: publishStatus
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Taslak', variant: 'secondary' as const },
      published: { label: 'Yayınlandı', variant: 'default' as const },
      archived: { label: 'Arşivlendi', variant: 'outline' as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-purple-100 text-purple-800',
      'bg-indigo-100 text-indigo-800',
      'bg-emerald-100 text-emerald-800',
      'bg-orange-100 text-orange-800',
    ];
    
    const colorIndex = category ? category.length % colors.length : 0;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[colorIndex]}`}>
        {category || 'Kategori Yok'}
      </span>
    );
  };

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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">İçeriklerim</h2>
          <p className="text-slate-600 text-sm">Oluşturduğunuz tüm makaleler</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Makale ara..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 w-64"
            />
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
          </div>
          
          {articles.length > 0 && (
            <Button 
              variant="outline" 
              className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
              onClick={() => {
                if (window.confirm(`Tüm makalelerinizi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
                  bulkDeleteMutation.mutate();
                }
              }}
              disabled={bulkDeleteMutation.isPending}
            >
              <i className="fas fa-trash mr-2"></i>
              {bulkDeleteMutation.isPending ? 'Siliniyor...' : 'Tümünü Sil'}
            </Button>
          )}
          
          {selectedArticles.length > 0 && (
            <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
                  <i className="fas fa-paper-plane mr-2"></i>
                  Siteye Gönder ({selectedArticles.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Siteye Gönder</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Web Sitesi</label>
                    <Select value={selectedWebsite} onValueChange={setSelectedWebsite}>
                      <SelectTrigger>
                        <SelectValue placeholder="Site seçin" />
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
                  
                  {selectedWebsite && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Kategori</label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Kategori seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category, index) => (
                            <SelectItem key={index} value={typeof category === 'string' ? category : category.name || category.id?.toString() || `category-${index}`}>
                              {typeof category === 'string' ? category : category.name || 'Unnamed Category'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Yayınlama Durumu</label>
                    <Select value={publishStatus} onValueChange={setPublishStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Durum seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Taslak</SelectItem>
                        <SelectItem value="publish">Yayınla</SelectItem>
                        <SelectItem value="future">Zamanla</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsSendDialogOpen(false)}>
                      İptal
                    </Button>
                    <Button 
                      onClick={handleSendToWebsite}
                      disabled={sendToWebsiteMutation.isPending || !selectedWebsite || !selectedCategory}
                    >
                      {sendToWebsiteMutation.isPending ? "Gönderiliyor..." : "Gönder"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          <Button className="bg-primary-600 hover:bg-primary-700">
            <i className="fas fa-plus mr-2"></i>
            Yeni Makale
          </Button>
        </div>
      </div>

      {filteredArticles.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-file-alt text-slate-300 text-4xl mb-4"></i>
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz makale yok'}
          </h3>
          <p className="text-slate-500">
            {searchQuery ? 'Farklı bir arama terimi deneyin.' : 'İlk makalenizi oluşturmak için AI editörünü kullanın.'}
          </p>
        </div>
      ) : (
        <>
          {/* Pagination Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600">Sayfa başına:</span>
                <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
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
              </div>
              <div className="text-sm text-slate-600">
                {filteredArticles.length} makaleden {startIndex + 1}-{Math.min(endIndex, filteredArticles.length)} arası gösteriliyor
              </div>
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <i className="fas fa-chevron-left"></i>
                </Button>
                
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  <i className="fas fa-chevron-right"></i>
                </Button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedArticles.length === paginatedArticles.length && paginatedArticles.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedArticles.map((article: any) => (
                  <TableRow key={article.id} className="hover:bg-slate-50">
                    <TableCell>
                      <Checkbox
                        checked={selectedArticles.includes(article.id)}
                        onCheckedChange={(checked) => handleSelectArticle(article.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <h4 className="font-medium text-slate-900">{article.title}</h4>
                        <p className="text-slate-500 text-sm">
                          {article.wordCount || 0} kelime • {article.readingTime || 0} dk okuma
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getCategoryBadge(article.category)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(article.status)}
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">
                      {article.createdAt ? format(new Date(article.createdAt), 'dd MMMM yyyy', { locale: tr }) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-primary-600"
                          onClick={() => {
                            setSelectedArticle(article);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-emerald-600"
                          onClick={() => {
                            setSelectedArticle(article);
                            setIsViewModalOpen(true);
                          }}
                        >
                          <i className="fas fa-eye"></i>
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-400 hover:text-blue-600"
                              onClick={() => {
                                setSelectedArticles([article.id]);
                                setSelectedWebsite("");
                                setSelectedCategory("");
                              }}
                            >
                              <i className="fas fa-paper-plane"></i>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Siteye Gönder</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Makale</label>
                                <div className="p-2 bg-gray-50 rounded text-sm">
                                  {article.title}
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Web Sitesi</label>
                                <Select value={selectedWebsite} onValueChange={(value) => {
                                  setSelectedWebsite(value);
                                  setSelectedCategory('');
                                  
                                  // Auto-sync categories if website has no categories
                                  const selectedWebsiteData = websites.find(w => w.id.toString() === value);
                                  if (selectedWebsiteData && (!selectedWebsiteData.categories || selectedWebsiteData.categories.length === 0)) {
                                    syncCategoriesMutation.mutate(value);
                                  }
                                }}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Site seçin" />
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
                              
                              {selectedWebsite && (
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Kategori</label>
                                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Kategori seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {categories.map((category, index) => (
                                        <SelectItem key={index} value={typeof category === 'string' ? category : category.name || category.id?.toString() || `category-${index}`}>
                                          {typeof category === 'string' ? category : category.name || 'Unnamed Category'}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                              
                              <div className="flex justify-end space-x-2">
                                <DialogTrigger asChild>
                                  <Button variant="outline">İptal</Button>
                                </DialogTrigger>
                                <Button 
                                  onClick={handleSendToWebsite}
                                  disabled={sendToWebsiteMutation.isPending || !selectedWebsite || !selectedCategory}
                                >
                                  {sendToWebsiteMutation.isPending ? "Gönderiliyor..." : "Gönder"}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(article.id)}
                          disabled={deleteMutation.isPending}
                          className="text-slate-400 hover:text-red-600"
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination placeholder */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
            <p className="text-slate-600 text-sm">
              Toplam {filteredArticles.length} makale gösteriliyor
            </p>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                <i className="fas fa-chevron-left"></i>
              </Button>
              <Button variant="outline" size="sm" className="bg-primary-600 text-white">
                1
              </Button>
              <Button variant="outline" size="sm" disabled>
                <i className="fas fa-chevron-right"></i>
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
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
  );
}
