import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info, Youtube, ChevronDown } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface BulkTemplateV1Props {
  setLoading: (loading: boolean) => void;
}

interface BulkV1Settings {
  generateType: string;
  languageId: string;
  keywords: string;
  keywordType: string;
  websiteId: string;
  competitorUrl: string;
  customTitle: string;
  titleCount: number;
}

export default function BulkTemplateV1({ setLoading }: BulkTemplateV1Props) {
  const [settings, setSettings] = useState<BulkV1Settings>({
    generateType: "1",
    languageId: "1",
    keywords: "",
    keywordType: "1",
    websiteId: "",
    competitorUrl: "",
    customTitle: "",
    titleCount: 10
  });

  const [showStep2, setShowStep2] = useState(false);
  const [generatedTitles, setGeneratedTitles] = useState<Array<{title: string, focusKeyword: string}>>([]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateTitlesMutation = useMutation({
    mutationFn: async (settings: BulkV1Settings) => {
      return await apiRequest("/api/bulk-titles-v1", "POST", settings);
    },
    onSuccess: (data: any) => {
      setGeneratedTitles(data.titles || []);
      setShowStep2(true);
      toast({
        title: "Başarılı",
        description: `${data.titles?.length || 0} adet başlık oluşturuldu!`,
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Oturum Süresi Doldu",
          description: "Lütfen tekrar giriş yapın",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Hata",
        description: error.message || "Başlık oluşturma işlemi başarısız oldu",
        variant: "destructive",
      });
    },
  });

  const handleGenerateTitles = () => {
    if (settings.generateType === "1" && !settings.keywords) {
      toast({
        title: "Hata",
        description: "Lütfen anahtar kelimeler girin",
        variant: "destructive",
      });
      return;
    }
    
    if (settings.generateType === "2" && !settings.websiteId) {
      toast({
        title: "Hata",
        description: "Lütfen bir web sitesi seçin",
        variant: "destructive",
      });
      return;
    }
    
    if (settings.generateType === "3" && !settings.competitorUrl) {
      toast({
        title: "Hata",
        description: "Lütfen rakip site URL'si girin",
        variant: "destructive",
      });
      return;
    }
    
    if (settings.generateType === "4" && !settings.customTitle) {
      toast({
        title: "Hata",
        description: "Lütfen makale başlıklarını girin",
        variant: "destructive",
      });
      return;
    }
    
    generateTitlesMutation.mutate(settings);
  };

  const renderContentByType = () => {
    switch(settings.generateType) {
      case "1":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="keywords">Anahtar Kelimeler</Label>
              <Textarea
                id="keywords"
                value={settings.keywords}
                onChange={(e) => setSettings({...settings, keywords: e.target.value})}
                placeholder="Anahtar kelimeleri aralarına virgül koyarak giriniz"
                maxLength={500}
                className="min-h-[80px]"
              />
            </div>
            
            <div className="space-y-3">
              <RadioGroup 
                value={settings.keywordType} 
                onValueChange={(value) => setSettings({...settings, keywordType: value})}
              >
                <div className="flex items-start space-x-2 p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <RadioGroupItem value="1" id="keywordType1" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="keywordType1" className="font-semibold">
                      Anahtar kelimeler beraber değerlendirilsin
                    </Label>
                    <p className="text-sm text-gray-600">
                      Anahtar kelimelerin hepsini kapsayacak başlıklar oluşturulur
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="2" id="keywordType2" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="keywordType2" className="font-semibold">
                      Anahtar kelimeler ayrı ayrı değerlendirilsin
                    </Label>
                    <p className="text-sm text-gray-600">
                      Anahtar kelimeler birbirinden bağımsız değerlendirilerek başlıklar oluşturulur
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case "2":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="websiteId">Web Siteniz</Label>
              <Select value={settings.websiteId} onValueChange={(value) => setSettings({...settings, websiteId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Lütfen bir web sitesi seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="demo1">https://example1.com</SelectItem>
                  <SelectItem value="demo2">https://example2.com</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-gray-600 mt-2 space-y-1">
                <div>- Bu seçenek <u>sadece WordPress sistemler</u> için çalışmaktadır.</div>
                <div>- <a href="#" className="font-medium underline">Web Sitelerim</a> bölümünden yeni bir site ekleyebilirsiniz.</div>
              </div>
            </div>
          </div>
        );

      case "3":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="competitorUrl">Rakip Site URL Adresi</Label>
              <Input
                id="competitorUrl"
                value={settings.competitorUrl}
                onChange={(e) => setSettings({...settings, competitorUrl: e.target.value})}
                placeholder="https://www.ornek-domain.com şeklinde giriniz"
              />
              <div className="text-sm text-gray-600 mt-2 space-y-1">
                <div>- Bu seçenek <u>sadece WordPress sistemler</u> için çalışmaktadır.</div>
                <div>- WordPress harici sistemler için hata mesajı görüntülenecektir.</div>
              </div>
            </div>
          </div>
        );

      case "4":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="customTitle">Makale Başlıkları</Label>
              <Textarea
                id="customTitle"
                value={settings.customTitle}
                onChange={(e) => setSettings({...settings, customTitle: e.target.value})}
                placeholder="Lütfen her satıra sadece 1 adet başlık yazınız"
                rows={10}
                className="min-h-[200px]"
              />
              <div className="text-sm text-gray-600 mt-2 space-y-1">
                <div>* Lütfen <u>her satıra sadece 1 adet başlık</u> yazınız.</div>
                <div>* En fazla 40 adet başlık girebilirsiniz.</div>
              </div>
            </div>
          </div>
        );

      case "excel":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="excelFile">Excel Dosyası</Label>
              <Input
                id="excelFile"
                type="file"
                accept=".xlsx,.xls"
                className="cursor-pointer"
              />
              <div className="text-sm text-gray-600 mt-2">
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Örnek Excel dosyasını{" "}
                    <a href="#" className="font-medium underline" target="_blank">
                      buradan
                    </a>{" "}
                    indirebilirsiniz. Lütfen dosya hakkındaki{" "}
                    <span className="text-red-600 cursor-pointer font-medium underline">
                      gereksinimleri
                    </span>{" "}
                    okuyunuz.
                  </li>
                </ul>
              </div>
            </div>
            <div className="text-black font-medium flex items-center gap-1">
              <ChevronDown className="w-4 h-4" />
              <ChevronDown className="w-4 h-4" />
              Lütfen aşağıdaki formdan makale özelliklerini seçiniz.
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Configuration */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Toplu Makale Oluştur V1
              <Youtube className="w-5 h-5 text-gray-400 hover:text-red-600 cursor-pointer" />
            </CardTitle>
            
            <Button variant="outline" size="sm" className="mt-2 md:mt-0">
              <Info className="w-4 h-4 mr-1" />
              Bilgilendirme
            </Button>
          </div>
        </CardHeader>

        <CardContent className="mt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Sidebar - Generation Types */}
            <div className="w-full md:w-2/5 lg:w-1/3 space-y-3 border-r pr-6">
              <RadioGroup 
                value={settings.generateType} 
                onValueChange={(value) => setSettings({...settings, generateType: value})}
                className="space-y-4"
              >
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="1" id="generateType1" className="mt-1" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="generateType1" className="font-bold">
                      Anahtar Kelime
                    </Label>
                    <p className="text-sm text-gray-600">
                      Girilen anahtar kelimelere göre öneriler oluşturulur
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 border-t border-b border-dashed py-3">
                  <RadioGroupItem value="2" id="generateType2" className="mt-1" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="generateType2" className="font-bold">
                      Web Siteniz
                    </Label>
                    <p className="text-sm text-gray-600">
                      Kayıtlı web sitelerinize göre öneriler oluşturulur
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 border-b border-dashed pb-3">
                  <RadioGroupItem value="3" id="generateType3" className="mt-1" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="generateType3" className="font-bold">
                      Rakip Siteler
                    </Label>
                    <p className="text-sm text-gray-600">
                      Rakip sitelerin içeriklerine göre öneriler oluşturulur
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 border-b border-dashed pb-3">
                  <RadioGroupItem value="4" id="generateType4" className="mt-1" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="generateType4" className="font-bold">
                      Başlıkları Kendim Gireceğim
                    </Label>
                    <p className="text-sm text-gray-600">
                      Başlıkları kendiniz yazabilir veya kopyala/yapıştır yapabilirsiniz
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="excel" id="generateTypeExcel" className="mt-1" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="generateTypeExcel" className="font-bold">
                      Excel Dosyası Yükleyeceğim
                    </Label>
                    <p className="text-sm text-gray-600">
                      Başlık ve alt başlıkları Excel dosyası olarak yükleyebilirsiniz
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Right Content */}
            <div className="w-full md:w-3/5 lg:w-2/3 space-y-6">
              {/* Language Selection */}
              <div>
                <Label htmlFor="languageId">Dil</Label>
                <Select value={settings.languageId} onValueChange={(value) => setSettings({...settings, languageId: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">🇹🇷 Türkçe</SelectItem>
                    <SelectItem value="2">🇺🇸 İngilizce</SelectItem>
                    <SelectItem value="5">🇩🇪 Almanca</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dynamic Content Based on Generation Type */}
              {renderContentByType()}

              {/* Title Count and Generate Button */}
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={settings.titleCount}
                  onChange={(e) => setSettings({...settings, titleCount: parseInt(e.target.value) || 10})}
                  placeholder="Adet"
                  min={1}
                  max={40}
                  className="w-20"
                />
                <Button 
                  onClick={handleGenerateTitles}
                  disabled={generateTitlesMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {generateTitlesMutation.isPending ? (
                    <>
                      <span className="animate-spin mr-2">⟳</span>
                      İşleniyor...
                    </>
                  ) : (
                    "Başlık Oluştur"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Generated Titles */}
      {showStep2 && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Makale Başlıkları</CardTitle>
          </CardHeader>
          <CardContent className="mt-4">
            <Alert className="mb-4">
              <Info className="w-4 h-4" />
              <AlertDescription>
                Lütfen makale başlıkları, odak anahtar kelimeler ve resim anahtar kelimelerini kontrol ederek gerekli gördüğünüz düzenlemeleri yapmayı unutmayın.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 font-semibold text-sm border-b pb-2">
                <div className="col-span-8">Makale Başlığı</div>
                <div className="col-span-4">Odak Anahtar Kelime</div>
              </div>
              
              {generatedTitles.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-center py-3 border-b">
                  <div className="col-span-8">
                    <Input 
                      value={item.title}
                      onChange={(e) => {
                        const updated = [...generatedTitles];
                        updated[index].title = e.target.value;
                        setGeneratedTitles(updated);
                      }}
                      className="w-full"
                    />
                  </div>
                  <div className="col-span-4">
                    <Input 
                      value={item.focusKeyword}
                      onChange={(e) => {
                        const updated = [...generatedTitles];
                        updated[index].focusKeyword = e.target.value;
                        setGeneratedTitles(updated);
                      }}
                      className="w-full"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <Button className="bg-green-600 hover:bg-green-700 px-8">
                Makaleleri Oluştur
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}