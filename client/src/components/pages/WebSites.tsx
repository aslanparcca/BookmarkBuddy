import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Globe, Plus, ExternalLink, MoreVertical, Edit, Trash2, RefreshCw, Check, X } from "lucide-react";

interface Website {
  id: number;
  url: string;
  type: string;
  seoPlugin: string;
  gscConnected: boolean;
  apiConnected: boolean;
}

interface WebSitesProps {
  setCurrentPage: (page: any) => void;
  setEditWebsiteId: (id: string) => void;
}

export default function WebSites({ setCurrentPage, setEditWebsiteId }: WebSitesProps) {
  const { toast } = useToast();
  const [searchUrl, setSearchUrl] = useState("");

  const { data: websites = [], isLoading } = useQuery<Website[]>({
    queryKey: ['/api/websites'],
    retry: false,
  });

  const syncWebsiteDataMutation = useMutation({
    mutationFn: async (websiteId: number) => {
      return await apiRequest("POST", `/api/websites/${websiteId}/sync`);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Kategori ve etiketler güncellendi",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/websites'] });
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
        description: error.message || "Güncelleme işlemi başarısız oldu",
        variant: "destructive",
      });
    },
  });

  const deleteWebsiteMutation = useMutation({
    mutationFn: async (websiteId: number) => {
      return await apiRequest("DELETE", `/api/websites/${websiteId}`);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Web sitesi silindi",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/websites'] });
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
        description: error.message || "Silme işlemi başarısız oldu",
        variant: "destructive",
      });
    },
  });

  const filteredWebsites = (websites as Website[]).filter((website: Website) => 
    website.url.toLowerCase().includes(searchUrl.toLowerCase())
  );

  const handleSyncWebsite = (websiteId: number) => {
    syncWebsiteDataMutation.mutate(websiteId);
  };

  const handleDeleteWebsite = (websiteId: number) => {
    if (confirm("Bu web sitesini silmek istediğinizden emin misiniz?")) {
      deleteWebsiteMutation.mutate(websiteId);
    }
  };

  const handleAddBlogger = () => {
    window.open("https://accounts.google.com/o/oauth2/v2/auth?response_type=code&access_type=offline&client_id=458247813814-gpruticnghjorctlaj08471pp9gh2gh1.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Fapp.contety.com%2Faccount%2Fwebsite%2Fblogger%2Fcallback", "_blank");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pt-1 pb-0">
            <h2 className="text-xl font-semibold mb-2 md:mb-0">
              Web Sitelerim <span className="text-sm text-muted-foreground font-normal">({filteredWebsites.length})</span>
            </h2>

            <div className="flex flex-col md:flex-row gap-2">
              <div className="me-2 mb-2 md:mb-0">
                <Input
                  type="text"
                  placeholder="URL Ara"
                  value={searchUrl}
                  onChange={(e) => setSearchUrl(e.target.value)}
                  className="w-full md:w-auto"
                />
              </div>
              <Button 
                variant="outline" 
                className="me-2 font-medium"
                onClick={handleAddBlogger}
              >
                <Plus className="w-4 h-4 mr-2" />
                Blogger
              </Button>
              <Button 
                className="me-2 font-medium"
                onClick={() => setCurrentPage && setCurrentPage('add-website')}
              >
                <Plus className="w-4 h-4 mr-2" />
                WordPress
              </Button>
              <Button variant="secondary" className="font-medium">
                <Plus className="w-4 h-4 mr-2" />
                XenForo
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="text-nowrap">
                  <th className="font-semibold p-3 text-left">#</th>
                  <th className="font-semibold p-3 text-left">URL</th>
                  <th className="font-semibold p-3 text-center">Tür</th>
                  <th className="font-semibold p-3 text-center">SEO Eklentisi</th>
                  <th className="font-semibold p-3 text-center" title="Google Search Console (GSC) Entegrasyonu">GSC</th>
                  <th className="font-semibold p-3 text-center">API Durumu</th>
                  <th className="font-semibold p-3 text-end"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      Yükleniyor...
                    </td>
                  </tr>
                ) : filteredWebsites.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      {searchUrl ? "Arama kriterinize uygun web sitesi bulunamadı" : "Henüz web siteniz bulunmuyor"}
                    </td>
                  </tr>
                ) : (
                  filteredWebsites.map((website: Website, index: number) => (
                    <tr key={website.id} className="border-b hover:bg-muted/30">
                      <td className="font-semibold py-3 pl-4 pr-0 w-12">{index + 1}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              setEditWebsiteId(website.id.toString());
                              setCurrentPage('edit-website');
                            }}
                            className="text-primary hover:underline text-left"
                            title="Bilgileri Düzenle"
                          >
                            {website.url}
                          </button>
                          <a 
                            href={website.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                      <td className="text-center py-3 px-3">
                        <Badge variant="secondary">{website.type}</Badge>
                      </td>
                      <td className="text-center py-3 px-3">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {website.seoPlugin}
                        </Badge>
                      </td>
                      <td className="text-center py-3 px-3">
                        {website.gscConnected ? (
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-red-600 mx-auto" />
                        )}
                      </td>
                      <td className="text-center py-3 px-3">
                        <Badge 
                          variant={website.apiConnected ? "default" : "destructive"}
                          className={website.apiConnected ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-red-100 text-red-800 hover:bg-red-100"}
                        >
                          {website.apiConnected ? "API Bağlı" : "API Bağlı Değil"}
                        </Badge>
                      </td>
                      <td className="text-end py-3 px-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => {
                                setEditWebsiteId(website.id.toString());
                                setCurrentPage('edit-website');
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Düzenle
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setEditWebsiteId(website.id.toString());
                                setCurrentPage('edit-website');
                                setTimeout(() => {
                                  const gscElement = document.getElementById('gsc-cont');
                                  if (gscElement) {
                                    gscElement.scrollIntoView({ behavior: 'smooth' });
                                  }
                                }, 100);
                              }}
                            >
                              <Globe className="w-4 h-4 mr-2" />
                              GSC Entegrasyonu
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleSyncWebsite(website.id)}
                              disabled={syncWebsiteDataMutation.isPending}
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Kategori ve Etiketleri Güncelle
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteWebsite(website.id)}
                              className="text-destructive focus:text-destructive"
                              disabled={deleteWebsiteMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}