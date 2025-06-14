import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Moon, Info, Youtube } from "lucide-react";
import FileDropZone from "@/components/FileDropZone";

interface BulkDreamProps {
  setLoading: (loading: boolean) => void;
}

interface DreamSettings {
  generateType: string;
  customDreamSubjects: string;
  language: string;
  aiModel: string;
  subheadingCount: string;
  sectionLength: string;
  imageSource: string;
  folder: string;
  metaDescription: boolean;
  excerpt: boolean;
}

interface GeneratedDreamSubject {
  subject: string;
  imageKeyword: string;
}

export default function BulkDream({ setLoading }: BulkDreamProps) {
  const { toast } = useToast();
  const [showStep2, setShowStep2] = useState(false);
  const [showStep3, setShowStep3] = useState(false);
  const [generatedSubjects, setGeneratedSubjects] = useState<GeneratedDreamSubject[]>([]);
  const [selectedGenerateType, setSelectedGenerateType] = useState("di-manual");
  const [imageSource, setImageSource] = useState("0");
  
  const [settings, setSettings] = useState<DreamSettings>({
    generateType: "di-manual",
    customDreamSubjects: "",
    language: "1",
    aiModel: "gemini_2.5_flash",
    subheadingCount: "",
    sectionLength: "",
    imageSource: "0",
    folder: "",
    metaDescription: false,
    excerpt: false
  });

  const processDreamSubjectsMutation = useMutation({
    mutationFn: async (subjects: string[]) => {
      return await apiRequest("/api/process-dream-subjects", "POST", { subjects });
    },
    onSuccess: (data: any) => {
      const subjectData = data.subjects || [];
      setGeneratedSubjects(subjectData.map((subject: string) => ({
        subject: subject,
        imageKeyword: subject.toLowerCase().replace(/[^a-zA-Z0-9]/g, ' ')
      })));
      setShowStep2(true);
      toast({
        title: "Başarılı",
        description: `${subjectData.length} rüya konusu işlendi!`,
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
        description: error.message || "İşlem başarısız oldu",
        variant: "destructive",
      });
    },
  });

  const generateDreamArticlesMutation = useMutation({
    mutationFn: async (settings: DreamSettings & { subjects: GeneratedDreamSubject[] }) => {
      return await apiRequest("/api/bulk-dream-articles", "POST", settings);
    },
    onSuccess: (data: any) => {
      toast({
        title: "Başarılı",
        description: `${data.count} rüya tabiri makalesi oluşturuldu!`,
      });
      setLoading(false);
    },
    onError: (error: Error) => {
      setLoading(false);
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
        description: error.message || "Rüya tabiri oluşturma işlemi başarısız oldu",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (file: File) => {
    console.log("Excel file selected:", file.name);
    toast({
      title: "Excel Desteği",
      description: "Excel dosyası yükleme özelliği henüz aktif değil",
      variant: "destructive",
    });
  };

  const handleNextStep = () => {
    if (selectedGenerateType === "di-manual" && !settings.customDreamSubjects.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen rüya konularını giriniz",
        variant: "destructive",
      });
      return;
    }

    if (selectedGenerateType === "di-excel") {
      toast({
        title: "Excel Desteği",
        description: "Excel dosyası işleme özelliği henüz aktif değil",
        variant: "destructive",
      });
      return;
    }

    // Process manual dream subjects
    const subjects = settings.customDreamSubjects
      .split('\n')
      .map(subject => subject.trim())
      .filter(subject => subject.length > 0);

    if (subjects.length === 0) {
      toast({
        title: "Hata",
        description: "Lütfen en az bir rüya konusu giriniz",
        variant: "destructive",
      });
      return;
    }

    if (subjects.length > 50) {
      toast({
        title: "Hata",
        description: "En fazla 50 rüya konusu girebilirsiniz",
        variant: "destructive",
      });
      return;
    }

    processDreamSubjectsMutation.mutate(subjects);
  };

  const updateGeneratedSubject = (index: number, field: keyof GeneratedDreamSubject, value: string) => {
    const updated = [...generatedSubjects];
    updated[index] = { ...updated[index], [field]: value };
    setGeneratedSubjects(updated);
  };

  const handleCreateArticles = () => {
    if (generatedSubjects.length === 0) {
      toast({
        title: "Hata",
        description: "Lütfen önce rüya konularını işleyiniz",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    generateDreamArticlesMutation.mutate({
      ...settings,
      subjects: generatedSubjects
    });
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Dream Subject Input */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-primary" />
              Toplu Rüya Tabiri Makalesi Oluştur
              <Youtube className="w-5 h-5 text-gray-400 hover:text-red-600 cursor-pointer" />
            </CardTitle>
            
            <Button variant="outline" size="sm" className="mt-2 md:mt-0">
              <Info className="w-4 h-4 mr-1" />
              Yardım
            </Button>
          </div>
        </CardHeader>

        <CardContent className="mt-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Side - Generation Type Selection */}
            <div className="w-full md:w-2/5 lg:w-1/3 pr-0 md:pr-6 md:border-r">
              <RadioGroup
                value={selectedGenerateType}
                onValueChange={setSelectedGenerateType}
                className="space-y-4"
              >
                <div className="flex items-start space-x-2 border-b border-dashed pb-4">
                  <RadioGroupItem value="di-manual" id="diManual" className="mt-1" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="diManual" className="font-semibold">Rüya Konularını Kendim Gireceğim</Label>
                    <p className="text-sm text-muted-foreground">
                      Rüya konularını kendiniz yazabilir veya kopyala/yapıştır yapabilirsiniz
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="di-excel" id="diExcel" className="mt-1" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="diExcel" className="font-semibold">Excel Dosyası Yükleyeceğim</Label>
                    <p className="text-sm text-muted-foreground">
                      Tüm bilgileri Excel dosyası olarak yükleyebilirsiniz
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Right Side - Dynamic Content */}
            <div className="w-full md:w-3/5 lg:w-2/3 mt-4 md:mt-0">
              {selectedGenerateType === "di-manual" && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="customDreamSubjects">Rüya Konuları</Label>
                    <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                  </div>
                  <div className="flex">
                    <span className="inline-flex items-start px-3 py-2 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                      1) Rüyada
                    </span>
                    <Textarea
                      id="customDreamSubjects"
                      rows={10}
                      placeholder="..."
                      value={settings.customDreamSubjects}
                      onChange={(e) => setSettings({...settings, customDreamSubjects: e.target.value})}
                      className="rounded-l-none"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground mt-2 space-y-1">
                    <p>* Lütfen <span className="underline">her satıra sadece 1 adet rüya konusu</span> yazınız.</p>
                    <p>* Bu bölüme sadece rüya konusu yazılmalı, rüya konusunun başına "Rüyada" veya "Dreaming of" gibi eklemeler <span className="underline text-destructive">yapılmamalıdır</span>.</p>
                    <p>* Bu bölüme sadece rüya konusu yazılmalı, rüya konusunun sonuna "Ne Anlama Gelir?", "Nasıl Yorumlanır?" veya "Nedir?" gibi eklemeler <span className="underline text-destructive">yapılmamalıdır</span>.</p>
                    <p>* En fazla 50 adet rüya konusu girebilirsiniz.</p>
                  </div>
                </div>
              )}

              {selectedGenerateType === "di-excel" && (
                <div>
                  <Label htmlFor="excel-file">Excel Dosyası</Label>
                  <FileDropZone
                    onFileSelect={handleFileSelect}
                    accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    maxSize={10 * 1024 * 1024}
                  />
                  <div className="text-sm text-muted-foreground mt-2">
                    <ul className="list-disc pl-5">
                      <li>Örnek Excel dosyasını buradan indirebilirsiniz.</li>
                      <li>Lütfen dosya hakkındaki gereksinimleri okuyunuz.</li>
                      <li>En fazla 50 adet rüya konusu yükleyebilirsiniz.</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <Button 
                  onClick={handleNextStep}
                  disabled={processDreamSubjectsMutation.isPending}
                  className="font-medium"
                >
                  {processDreamSubjectsMutation.isPending ? "İşleniyor..." : "Sonraki Adım"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Dream Subjects Review */}
      {showStep2 && (
        <Card>
          <CardHeader>
            <CardTitle>Rüya Konuları</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">
                      Rüya Konuları
                      <Info className="w-4 h-4 inline ml-1 text-muted-foreground cursor-pointer" />
                    </th>
                    {imageSource !== "0" && (
                      <th className="text-left p-2 font-medium">
                        Resim Anahtar Kelimesi
                        <Info className="w-4 h-4 inline ml-1 text-muted-foreground cursor-pointer" />
                      </th>
                    )}
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {generatedSubjects.map((subject, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">
                        <Input
                          value={subject.subject}
                          onChange={(e) => updateGeneratedSubject(index, 'subject', e.target.value)}
                        />
                      </td>
                      {imageSource !== "0" && (
                        <td className="p-2">
                          <Input
                            value={subject.imageKeyword}
                            onChange={(e) => updateGeneratedSubject(index, 'imageKeyword', e.target.value)}
                            placeholder="İngilizce anahtar kelime"
                          />
                        </td>
                      )}
                      <td className="p-2">
                        <Button variant="ghost" size="sm">×</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <Button onClick={() => setShowStep3(true)}>
                Makale Özelliklerini Belirle
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Article Properties */}
      {showStep3 && (
        <Card>
          <CardHeader>
            <CardTitle>Makale Özellikleri</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Basic Settings */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="language">Dil</Label>
                <Select value={settings.language} onValueChange={(value) => setSettings({...settings, language: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Türkçe</SelectItem>
                    <SelectItem value="2">İngilizce</SelectItem>
                    <SelectItem value="5">Almanca</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="aiModel">Yapay Zeka Modeli</Label>
                <Select value={settings.aiModel} onValueChange={(value) => setSettings({...settings, aiModel: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt4o_mini">GPT-4o mini</SelectItem>
                    <SelectItem value="gemini_2.5_flash">Gemini 2.5 Flash</SelectItem>
                    <SelectItem value="gemini_1.5_flash">Gemini 1.5 Flash</SelectItem>
                    <SelectItem value="gemini_1.5_pro">Gemini 1.5 Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="subheadingCount">Benzer Rüya Konusu Sayısı</Label>
                  <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                </div>
                <Select value={settings.subheadingCount} onValueChange={(value) => setSettings({...settings, subheadingCount: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Lütfen bir seçim yapınız" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="7">7</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="9">9</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="sectionLength">Benzer Rüyaların Açıklama Uzunluğu</Label>
                  <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                </div>
                <Select value={settings.sectionLength} onValueChange={(value) => setSettings({...settings, sectionLength: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Lütfen bir seçim yapınız" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="s">Kısa</SelectItem>
                    <SelectItem value="m">Orta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="imageSource">Makale Resmi</Label>
                <Select value={imageSource} onValueChange={(value) => {
                  setImageSource(value);
                  setSettings({...settings, imageSource: value});
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Görsel istemiyorum</SelectItem>
                    <SelectItem value="1">Unsplash (Ücretsiz)</SelectItem>
                    <SelectItem value="5">Pexels (Ücretsiz)</SelectItem>
                    <SelectItem value="6">Pixabay (Ücretsiz)</SelectItem>
                    <SelectItem value="3">Google (Ücretsiz)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="folder">Klasör</Label>
                <Select value={settings.folder} onValueChange={(value) => setSettings({...settings, folder: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Makaleleriniz için bir klasör seçebilirsiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="11275">Akyurt Nakliyat</SelectItem>
                    <SelectItem value="11163">Ankara Özpolat</SelectItem>
                    <SelectItem value="11108">Asansörlü Nakliyat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {imageSource !== "0" && (
              <div className="text-sm text-muted-foreground">
                <ul className="list-disc pl-5">
                  <li>Lütfen yukarıdaki formda her makale için resim anahtar kelimesi giriniz.</li>
                  <li>Bu servis ücretsiz bir stok görsel servisidir ve her anahtar kelimeniz için görsel bulunamayabilir.</li>
                  <li>Lütfen İngilizce bir anahtar kelime giriniz.</li>
                  <li>Lütfen makale başlığınızı resim anahtar kelimesi olarak yazmayınız.</li>
                  <li>Lütfen makalenizde görmek istediğiniz görsele dair bir anahtar kelime giriniz.</li>
                </ul>
              </div>
            )}

            {/* Additional Options */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="metaDescription" 
                  checked={settings.metaDescription}
                  onCheckedChange={(checked) => setSettings({...settings, metaDescription: checked as boolean})}
                />
                <div>
                  <Label htmlFor="metaDescription" className="font-medium">Meta Açıklama</Label>
                  <p className="text-sm text-muted-foreground">Makalenin meta açıklaması oluşturulur.</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="excerpt" 
                  checked={settings.excerpt}
                  onCheckedChange={(checked) => setSettings({...settings, excerpt: checked as boolean})}
                />
                <div>
                  <Label htmlFor="excerpt" className="font-medium">Makale Özeti</Label>
                  <p className="text-sm text-muted-foreground">Makalenin kısa bir özeti (excerpt) çıkarılır.</p>
                </div>
              </div>
            </div>

            {/* Create Button */}
            <div className="pt-4">
              <Button 
                onClick={handleCreateArticles}
                disabled={generateDreamArticlesMutation.isPending}
                size="lg"
                className="font-medium"
              >
                {generateDreamArticlesMutation.isPending ? "Oluşturuluyor..." : "Toplu Rüya Tabiri Oluştur"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}