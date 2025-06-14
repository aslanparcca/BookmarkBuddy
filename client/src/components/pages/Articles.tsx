import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import ArticleViewModal from "@/components/ArticleViewModal";
import ArticleEditModal from "@/components/ArticleEditModal";

export default function Articles() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['/api/articles'],
    enabled: true,
  });

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

  const filteredArticles = articles.filter((article: any) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (article.category && article.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
          </div>
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.map((article: any) => (
                  <TableRow key={article.id} className="hover:bg-slate-50">
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
