import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Article } from "@shared/schema";

type DatabaseArticle = {
  id: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  userId: string;
  title: string;
  content: string | null;
  htmlContent: string | null;
  status: string;
  category: string | null;
  focusKeyword: string | null;
  otherKeywords: string | null;
  metaDescription: string | null;
  summary: string | null;
  wordCount: number;
  readingTime: number;
  keywords: unknown;
  seoSettings: unknown;
  aiSettings: unknown;
};
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import ArticleViewModal from "@/components/ArticleViewModal";
import ArticleEditModal from "@/components/ArticleEditModal";

interface ArticlesResponse {
  articles: DatabaseArticle[];
  total: number;
  page: number;
  limit: number;
}

export default function ArticlesNew() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArticles, setSelectedArticles] = useState<number[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<DatabaseArticle | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data, isLoading, error } = useQuery<ArticlesResponse>({
    queryKey: ["/api/articles", currentPage, limit, searchTerm],
    retry: false,
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("/api/articles", "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Tüm makaleler silindi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      setSelectedArticles([]);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Hata",
        description: "Makaleler silinirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const deleteArticleMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/articles/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Makale silindi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      setSelectedArticles(prev => prev.filter(id => id !== selectedArticle?.id));
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Hata",
        description: "Makale silinirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <main className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-slate-600">Makaleler yükleniyor...</span>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    if (isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return null;
    }
    
    return (
      <main className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="text-center py-12">
            <div className="text-red-500 mb-2">
              <i className="fas fa-exclamation-triangle text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-slate-600 mb-2">Hata</h3>
            <p className="text-slate-500">Makaleler yüklenirken bir hata oluştu.</p>
          </div>
        </div>
      </main>
    );
  }

  const articles = data?.articles || [];
  const total = data?.total || 0;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedArticles(articles.map(article => article.id));
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

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "Tarih yok";
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-100 text-green-800">
            Yayınlandı
          </div>
        );
      case 'draft':
        return (
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
            Taslak
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
            Taslak
          </div>
        );
    }
  };

  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">İçeriklerim</h2>
            <p className="text-slate-600 text-sm">Oluşturduğunuz tüm makaleler</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 w-64"
                placeholder="Makale ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
            </div>
            <button
              onClick={() => deleteAllMutation.mutate()}
              disabled={deleteAllMutation.isPending || articles.length === 0}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border hover:text-accent-foreground h-10 px-4 py-2 bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
            >
              <i className="fas fa-trash mr-2"></i>
              {deleteAllMutation.isPending ? "Siliniyor..." : "Tümünü Sil"}
            </button>
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground h-10 px-4 py-2 bg-primary-600 hover:bg-primary-700">
              <i className="fas fa-plus mr-2"></i>
              Yeni Makale
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-12">
                    <Checkbox
                      checked={selectedArticles.length === articles.length && articles.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                    Başlık
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                    Kategori
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                    Durum
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                    Tarih
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {articles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <div className="text-slate-400 mb-4">
                        <i className="fas fa-file-alt text-4xl"></i>
                      </div>
                      <h3 className="text-lg font-medium text-slate-600 mb-2">Henüz makale yok</h3>
                      <p className="text-slate-500">İlk makalenizi oluşturmak için AI Editor'ü kullanın.</p>
                    </td>
                  </tr>
                ) : (
                  articles.map((article) => (
                    <tr key={article.id} className="border-b transition-colors data-[state=selected]:bg-muted hover:bg-slate-50">
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                        <Checkbox
                          checked={selectedArticles.includes(article.id)}
                          onCheckedChange={(checked) => handleSelectArticle(article.id, checked as boolean)}
                        />
                      </td>
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                        <div>
                          <h4 className="font-medium text-slate-900">{article.title}</h4>
                          <p className="text-slate-500 text-sm">
                            {article.wordCount} kelime • {article.readingTime} dk okuma
                          </p>
                        </div>
                      </td>
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                        {article.category ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {article.category}
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Kategori Yok
                          </span>
                        )}
                      </td>
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                        {getStatusBadge(article.status)}
                      </td>
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-slate-600 text-sm">
                        {formatDate(article.createdAt)}
                      </td>
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedArticle(article);
                              setIsEditModalOpen(true);
                            }}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent h-9 rounded-md px-3 text-slate-400 hover:text-primary-600"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedArticle(article);
                              setIsViewModalOpen(true);
                            }}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent h-9 rounded-md px-3 text-slate-400 hover:text-emerald-600"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent h-9 rounded-md px-3 text-slate-400 hover:text-blue-600">
                            <i className="fas fa-paper-plane"></i>
                          </button>
                          <button
                            onClick={() => deleteArticleMutation.mutate(article.id)}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent h-9 rounded-md px-3 text-slate-400 hover:text-red-600"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ArticleViewModal
        article={selectedArticle as any}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedArticle(null);
        }}
        onEdit={(article) => {
          setIsViewModalOpen(false);
          setSelectedArticle(article as any);
          setIsEditModalOpen(true);
        }}
      />

      <ArticleEditModal
        article={selectedArticle as any}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedArticle(null);
        }}
      />
    </main>
  );
}