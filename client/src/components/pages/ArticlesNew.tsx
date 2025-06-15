import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Article {
  id: number;
  title: string;
  content: string;
  status: string;
  category?: string;
  wordCount: number;
  readingTime: number;
  createdAt: string;
}

interface ArticlesResponse {
  articles: Article[];
  total: number;
}

export default function ArticlesNew() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, error, refetch } = useQuery<ArticlesResponse>({
    queryKey: ["/api/articles"],
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
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
      toast({
        title: "Hata",
        description: "Makaleler silinirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Makaleler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    if (isUnauthorizedError(error as Error)) {
      window.location.href = "/api/login";
      return null;
    }
    
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-red-500 mb-4">
            <i className="fas fa-exclamation-triangle text-3xl"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Hata</h3>
          <p className="text-gray-600 mb-4">Makaleler yüklenirken bir hata oluştu.</p>
          <button 
            onClick={() => refetch()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Yeniden Dene
          </button>
        </div>
      </div>
    );
  }

  const articles = data?.articles || [];
  const total = data?.total || 0;

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      published: "bg-green-100 text-green-800",
      draft: "bg-yellow-100 text-yellow-800",
      archived: "bg-gray-100 text-gray-800"
    };
    
    const statusLabels = {
      published: "Yayınlandı",
      draft: "Taslak",
      archived: "Arşivlendi"
    };
    
    const colorClass = statusColors[status as keyof typeof statusColors] || statusColors.draft;
    const label = statusLabels[status as keyof typeof statusLabels] || "Taslak";
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">İçeriklerim</h2>
              <p className="text-gray-600 text-sm mt-1">Oluşturduğunuz tüm makaleler ({total})</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Makale ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
              
              {articles.length > 0 && (
                <button
                  onClick={() => deleteAllMutation.mutate()}
                  disabled={deleteAllMutation.isPending}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 disabled:opacity-50"
                >
                  <i className="fas fa-trash mr-2"></i>
                  {deleteAllMutation.isPending ? "Siliniyor..." : "Tümünü Sil"}
                </button>
              )}
              
              <button
                onClick={() => refetch()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <i className="fas fa-sync-alt mr-2"></i>
                Yenile
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <i className="fas fa-file-alt text-4xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                {searchTerm ? "Arama sonucu bulunamadı" : "Henüz makale yok"}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? `"${searchTerm}" için sonuç bulunamadı.` 
                  : "İlk makalenizi oluşturmak için AI Editor'ü kullanın."
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Aramayı temizle
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Başlık
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredArticles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{article.title}</div>
                          <div className="text-sm text-gray-500">
                            {article.wordCount} kelime • {article.readingTime} dk okuma
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {article.category ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {article.category}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">Kategori yok</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(article.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(article.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <i className="fas fa-eye"></i>
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}