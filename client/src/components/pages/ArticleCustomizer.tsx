import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Edit, Info, Youtube } from "lucide-react";

interface ArticleCustomizerSettings {
  generateType: string;
  websiteId: string;
  categoryIds: string[];
  postStatus: string;
  competitorUrl: string;
  searchQuery: string;
}

export default function ArticleCustomizer() {
  const { toast } = useToast();
  const [selectedGenerateType, setSelectedGenerateType] = useState("1");
  
  const [settings, setSettings] = useState<ArticleCustomizerSettings>({
    generateType: "1",
    websiteId: "8180",
    categoryIds: [],
    postStatus: "publish",
    competitorUrl: "",
    searchQuery: ""
  });

  const listArticlesMutation = useMutation({
    mutationFn: async (settings: ArticleCustomizerSettings) => {
      return await apiRequest("/api/list-articles-for-customization", "POST", settings);
    },
    onSuccess: (data: any) => {
      toast({
        title: "Başarılı",
        description: `${data.articles?.length || 0} makale listelendi!`,
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
        description: error.message || "Makale listeleme işlemi başarısız oldu",
        variant: "destructive",
      });
    },
  });

  const handleListArticles = () => {
    if (selectedGenerateType === "2" && !settings.competitorUrl.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen hedef site URL adresini giriniz",
        variant: "destructive",
      });
      return;
    }

    listArticlesMutation.mutate(settings);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-primary" />
              Makale Özgünleştir
              <Youtube className="w-5 h-5 text-gray-400 hover:text-red-600 cursor-pointer" />
            </CardTitle>
            
            <Button variant="outline" size="sm" className="mt-2 md:mt-0">
              <Info className="w-4 h-4 mr-1" />
              Bilgilendirme
            </Button>
          </div>
        </CardHeader>

        <CardContent className="mt-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Side - Source Selection */}
            <div className="w-full md:w-2/5 lg:w-1/3 pr-0 md:pr-6 md:border-r">
              <RadioGroup
                value={selectedGenerateType}
                onValueChange={(value) => {
                  setSelectedGenerateType(value);
                  setSettings({...settings, generateType: value});
                }}
                className="space-y-4"
              >
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="1" id="websiteSource" className="mt-1" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="websiteSource" className="font-semibold">Web Siteniz</Label>
                    <p className="text-sm text-muted-foreground">
                      Kayıtlı web sitelerinizin içerikleri listelenir
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 border-t border-dashed pt-4">
                  <RadioGroupItem value="2" id="competitorSource" className="mt-1" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="competitorSource" className="font-semibold">Diğer Siteler</Label>
                    <p className="text-sm text-muted-foreground">
                      Diğer sitelerin içerikleri listelenir
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Right Side - Dynamic Content */}
            <div className="w-full md:w-3/5 lg:w-2/3 mt-4 md:mt-0">
              {selectedGenerateType === "1" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="websiteId">Web Siteniz</Label>
                    <Select value={settings.websiteId} onValueChange={(value) => setSettings({...settings, websiteId: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8180">https://akyurtnakliyat.org.tr</SelectItem>
                        <SelectItem value="8178">https://ankaracagrinakliyat.com</SelectItem>
                        <SelectItem value="400">https://ankaraozpolatnakliyat.com</SelectItem>
                        <SelectItem value="8167">https://boztasnakliyat.com</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="text-sm text-muted-foreground mt-1 space-y-1">
                      <p>* Bu seçenek <span className="underline">sadece WordPress siteleriniz</span> için çalışmaktadır.</p>
                      <p>* Blogger ve diğer siteleriniz için özgünleştirme işlemi yapılamamaktadır.</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="categoryIds">Kategori</Label>
                      <Select disabled>
                        <SelectTrigger>
                          <SelectValue placeholder="Kategori seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tüm Kategoriler</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="postStatus">Yayın Durumu</Label>
                      <Select value={settings.postStatus} onValueChange={(value) => setSettings({...settings, postStatus: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Hepsi</SelectItem>
                          <SelectItem value="publish">Sadece Yayındakiler</SelectItem>
                          <SelectItem value="future">Sadece Zamanlanmışlar</SelectItem>
                          <SelectItem value="draft">Sadece Taslaklar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {selectedGenerateType === "2" && (
                <div>
                  <Label htmlFor="competitorUrl">Hedef Site URL Adresi</Label>
                  <Input
                    id="competitorUrl"
                    type="url"
                    placeholder="https://www.ornek-domain.com şeklinde giriniz"
                    value={settings.competitorUrl}
                    onChange={(e) => setSettings({...settings, competitorUrl: e.target.value})}
                  />
                  <div className="text-sm text-muted-foreground mt-1 space-y-1">
                    <p>* Bu seçenek <span className="underline">sadece WordPress sistemler</span> için çalışmaktadır.</p>
                    <p>* WordPress harici sistemler için hata mesajı görüntülenecektir.</p>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <Label htmlFor="searchQuery">Arama Terimi</Label>
                <Input
                  id="searchQuery"
                  placeholder="Eğer bir kelime ile arama yapmak isterseniz lütfen arama yapmak istediğiniz kelimeyi giriniz"
                  value={settings.searchQuery}
                  onChange={(e) => setSettings({...settings, searchQuery: e.target.value})}
                />
                <div className="text-sm text-muted-foreground mt-1">
                  Bu bölüm mecburi değildir. Eğer bir kelime girerseniz, girilen kelime yazı başlıklarında aranır.
                </div>
              </div>

              <div className="mt-6">
                <Button 
                  onClick={handleListArticles}
                  disabled={listArticlesMutation.isPending}
                  className="font-medium"
                >
                  {listArticlesMutation.isPending ? "Listeleniyor..." : "Makaleleri Listele"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}