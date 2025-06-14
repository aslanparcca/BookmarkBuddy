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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ChefHat, Info, Youtube } from "lucide-react";
import FileDropZone from "@/components/FileDropZone";

interface BulkRecipeProps {
  setLoading: (loading: boolean) => void;
}

interface RecipeSettings {
  generateType: string;
  customRecipes: string;
  language: string;
  aiModel: string;
  imageSource: string;
  folder: string;
  
  // Recipe Content Options
  description: boolean;
  ingredients: boolean;
  instructions: boolean;
  time: boolean;
  yield: boolean;
  nutrition: boolean;
  tools: boolean;
  tips: boolean;
  difficulty: boolean;
  categoryCuisine: boolean;
  service: boolean;
  storage: boolean;
  benefits: boolean;
  vegan: boolean;
  similarRecipes: boolean;
  
  // Display Options
  ingredientsDisplayType: string;
  nutritionDisplayType: string;
  
  // Additional Options
  metaDescription: boolean;
  excerpt: boolean;
}

interface GeneratedRecipe {
  name: string;
  imageKeyword: string;
}

export default function BulkRecipe({ setLoading }: BulkRecipeProps) {
  const { toast } = useToast();
  const [showStep2, setShowStep2] = useState(false);
  const [showStep3, setShowStep3] = useState(false);
  const [generatedRecipes, setGeneratedRecipes] = useState<GeneratedRecipe[]>([]);
  const [selectedGenerateType, setSelectedGenerateType] = useState("recipe-manual");
  const [imageSource, setImageSource] = useState("0");
  
  const [settings, setSettings] = useState<RecipeSettings>({
    generateType: "recipe-manual",
    customRecipes: "",
    language: "1",
    aiModel: "gemini_2.5_flash",
    imageSource: "0",
    folder: "",
    
    // Recipe Content - Required ones are checked by default
    description: true,
    ingredients: true,
    instructions: true,
    time: true,
    yield: true,
    nutrition: false,
    tools: false,
    tips: false,
    difficulty: false,
    categoryCuisine: false,
    service: false,
    storage: false,
    benefits: false,
    vegan: false,
    similarRecipes: false,
    
    // Display Options
    ingredientsDisplayType: "1",
    nutritionDisplayType: "2",
    
    // Additional Options
    metaDescription: false,
    excerpt: false
  });

  const processRecipesMutation = useMutation({
    mutationFn: async (recipes: string[]) => {
      return await apiRequest("POST", "/api/process-recipes", { recipes });
    },
    onSuccess: (data: any) => {
      const recipeData = data.recipes || [];
      setGeneratedRecipes(recipeData.map((recipe: string) => ({
        name: recipe,
        imageKeyword: recipe.toLowerCase().replace(/[^a-zA-Z0-9]/g, ' ')
      })));
      setShowStep2(true);
      toast({
        title: "Başarılı",
        description: `${recipeData.length} yemek tarifi işlendi!`,
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

  const generateRecipesMutation = useMutation({
    mutationFn: async (settings: RecipeSettings & { recipes: GeneratedRecipe[] }) => {
      return await apiRequest("POST", "/api/bulk-recipes", settings);
    },
    onSuccess: (data: any) => {
      toast({
        title: "Başarılı",
        description: `${data.count} yemek tarifi oluşturuldu!`,
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
        description: error.message || "Tarif oluşturma işlemi başarısız oldu",
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
    if (selectedGenerateType === "recipe-manual" && !settings.customRecipes.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen yemek isimlerini giriniz",
        variant: "destructive",
      });
      return;
    }

    if (selectedGenerateType === "recipe-excel") {
      toast({
        title: "Excel Desteği",
        description: "Excel dosyası işleme özelliği henüz aktif değil",
        variant: "destructive",
      });
      return;
    }

    // Process manual recipes
    const recipes = settings.customRecipes
      .split('\n')
      .map(recipe => recipe.trim())
      .filter(recipe => recipe.length > 0);

    if (recipes.length === 0) {
      toast({
        title: "Hata",
        description: "Lütfen en az bir yemek ismi giriniz",
        variant: "destructive",
      });
      return;
    }

    if (recipes.length > 50) {
      toast({
        title: "Hata",
        description: "En fazla 50 yemek ismi girebilirsiniz",
        variant: "destructive",
      });
      return;
    }

    processRecipesMutation.mutate(recipes);
  };

  const updateGeneratedRecipe = (index: number, field: keyof GeneratedRecipe, value: string) => {
    const updated = [...generatedRecipes];
    updated[index] = { ...updated[index], [field]: value };
    setGeneratedRecipes(updated);
  };

  const handleCreateRecipes = () => {
    if (generatedRecipes.length === 0) {
      toast({
        title: "Hata",
        description: "Lütfen önce yemek isimlerini işleyiniz",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    generateRecipesMutation.mutate({
      ...settings,
      recipes: generatedRecipes
    });
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Recipe Input */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-primary" />
              Toplu Yemek Tarifi Oluştur
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
                  <RadioGroupItem value="recipe-manual" id="recipeManual" className="mt-1" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="recipeManual" className="font-semibold">Yemekleri Kendim Gireceğim</Label>
                    <p className="text-sm text-muted-foreground">
                      Yemek isimlerini kendiniz yazabilir veya kopyala/yapıştır yapabilirsiniz
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="recipe-excel" id="recipeExcel" className="mt-1" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="recipeExcel" className="font-semibold">Excel Dosyası Yükleyeceğim</Label>
                    <p className="text-sm text-muted-foreground">
                      Tüm bilgileri Excel dosyası olarak yükleyebilirsiniz
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Right Side - Dynamic Content */}
            <div className="w-full md:w-3/5 lg:w-2/3 mt-4 md:mt-0">
              {selectedGenerateType === "recipe-manual" && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="customRecipes">Yemek İsimleri</Label>
                    <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                  </div>
                  <Textarea
                    id="customRecipes"
                    rows={10}
                    placeholder="Lütfen her satıra sadece 1 adet yemek ismi yazınız"
                    value={settings.customRecipes}
                    onChange={(e) => setSettings({...settings, customRecipes: e.target.value})}
                  />
                  <div className="text-sm text-muted-foreground mt-2 space-y-1">
                    <p>* Lütfen <span className="underline">her satıra sadece 1 adet yemek ismi</span> yazınız.</p>
                    <p>* Bu bölüme sadece yemeğin ismi yazılmalı, yemek isminin sonuna "Tarif", "Tarifi", "Nasıl Yapılır?" veya "Recipe" gibi eklemeler <span className="underline text-destructive">yapılmamalıdır</span>.</p>
                    <p>* En fazla 50 adet yemek ismi girebilirsiniz.</p>
                  </div>
                </div>
              )}

              {selectedGenerateType === "recipe-excel" && (
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
                      <li>En fazla 50 adet yemek ismi yükleyebilirsiniz.</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <Button 
                  onClick={handleNextStep}
                  disabled={processRecipesMutation.isPending}
                  className="font-medium"
                >
                  {processRecipesMutation.isPending ? "İşleniyor..." : "Sonraki Adım"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Recipe Names Review */}
      {showStep2 && (
        <Card>
          <CardHeader>
            <CardTitle>Yemek İsimleri</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">
                      Yemek İsmi
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
                  {generatedRecipes.map((recipe, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">
                        <Input
                          value={recipe.name}
                          onChange={(e) => updateGeneratedRecipe(index, 'name', e.target.value)}
                        />
                      </td>
                      {imageSource !== "0" && (
                        <td className="p-2">
                          <Input
                            value={recipe.imageKeyword}
                            onChange={(e) => updateGeneratedRecipe(index, 'imageKeyword', e.target.value)}
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
                Tarif Özelliklerini Belirle
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Recipe Properties */}
      {showStep3 && (
        <Card>
          <CardHeader>
            <CardTitle>Tarif Özellikleri</CardTitle>
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
                    <SelectItem value="gemini_2.5_flash">Gemini 2.5 Flash (En Güncel)</SelectItem>
                    <SelectItem value="gemini_2.5_pro">Gemini 2.5 Pro (Deep Think)</SelectItem>
                    <SelectItem value="gemini_2.0_flash">Gemini 2.0 Flash</SelectItem>
                    <SelectItem value="gemini_2.0_flash_lite">Gemini 2.0 Flash Lite</SelectItem>
                    <SelectItem value="gemini_2.0_flash_thinking">Gemini 2.0 Flash Thinking (Deneysel)</SelectItem>
                    <SelectItem value="gemini_1.5_flash">Gemini 1.5 Flash (Emekli Edilecek)</SelectItem>
                    <SelectItem value="gemini_1.5_pro">Gemini 1.5 Pro (Emekli Edilecek)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="imageSource">Tarif Görseli</Label>
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
                    <SelectValue placeholder="Tarifleriniz için bir klasör seçebilirsiniz" />
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
                  <li>Lütfen yukarıdaki formda her tarif için resim anahtar kelimesi giriniz.</li>
                  <li>Bu servis ücretsiz bir stok görsel servisidir ve her anahtar kelimeniz için görsel bulunamayabilir.</li>
                  <li>Lütfen İngilizce bir anahtar kelime giriniz.</li>
                  <li>Lütfen yemek ismini resim anahtar kelimesi olarak yazmayınız.</li>
                  <li>Lütfen tarifinizde görmek istediğiniz görsele dair bir anahtar kelime giriniz.</li>
                </ul>
              </div>
            )}

            <Separator />

            {/* Recipe Content Options */}
            <div>
              <h4 className="font-medium text-sm mb-4 underline">Tarif İçeriği</h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[
                  { key: 'description', label: 'Kısa Bilgilendirme', required: true },
                  { key: 'ingredients', label: 'Malzemeler', required: true },
                  { key: 'instructions', label: 'Yapılışı', required: true },
                  { key: 'time', label: 'Süre', required: true },
                  { key: 'yield', label: 'Kaç Kişilik', required: true },
                  { key: 'nutrition', label: 'Besin Değerleri', required: false },
                  { key: 'tools', label: 'Gerekli Araç Gereçler', required: false },
                  { key: 'tips', label: 'İpuçları', required: false },
                  { key: 'difficulty', label: 'Zorluk Derecesi', required: false },
                  { key: 'categoryCuisine', label: 'Kategori ve Mutfak', required: false },
                  { key: 'service', label: 'Servis ve Sunum Önerileri', required: false },
                  { key: 'storage', label: 'Saklama Koşulları', required: false },
                  { key: 'benefits', label: 'Sağlığa Faydaları', required: false },
                  { key: 'vegan', label: 'Veganlar İçin Öneriler', required: false },
                  { key: 'similarRecipes', label: 'Benzer Tarifler', required: false },
                ].map((option) => (
                  <div key={option.key} className="flex items-center space-x-2">
                    <Checkbox 
                      id={option.key}
                      checked={settings[option.key as keyof RecipeSettings] as boolean}
                      onCheckedChange={(checked) => setSettings({...settings, [option.key]: checked})}
                      disabled={option.required}
                    />
                    <Label 
                      htmlFor={option.key} 
                      className={`${option.required ? 'opacity-50' : ''}`}
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Display Options */}
            <div>
              <h4 className="font-medium text-sm mb-4 underline">Görüntülenme Seçenekleri</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="font-medium mb-3 block">Malzemeler Nasıl Görüntülensin?</Label>
                  <RadioGroup
                    value={settings.ingredientsDisplayType}
                    onValueChange={(value) => setSettings({...settings, ingredientsDisplayType: value})}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="ing1" />
                      <Label htmlFor="ing1">Liste</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2" id="ing2" />
                      <Label htmlFor="ing2">Tablo</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="font-medium mb-3 block">Besin Değerleri Nasıl Görüntülensin?</Label>
                  <RadioGroup
                    value={settings.nutritionDisplayType}
                    onValueChange={(value) => setSettings({...settings, nutritionDisplayType: value})}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="nut1" />
                      <Label htmlFor="nut1">Liste</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2" id="nut2" />
                      <Label htmlFor="nut2">Tablo</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            <Separator />

            {/* Additional Options */}
            <div>
              <h4 className="font-medium text-sm mb-4 underline">Ek Seçenekler</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="metaDescription" 
                    checked={settings.metaDescription}
                    onCheckedChange={(checked) => setSettings({...settings, metaDescription: checked as boolean})}
                  />
                  <div>
                    <Label htmlFor="metaDescription" className="font-medium">Meta Açıklama</Label>
                    <p className="text-sm text-muted-foreground">Tarif için meta açıklaması oluşturulur.</p>
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
            </div>

            <Separator />

            {/* Important Notice */}
            <div>
              <h4 className="font-medium text-sm mb-4 underline">Önemli Hatırlatma</h4>
              <p className="text-sm text-muted-foreground">
                Oluşturulan tarifler, yemek tarifi yapılandırılmış verilerini içerecek şekilde oluşturulmaktadır. 
                Ancak bu verilerin düzgün bir şekilde oluşturulabilmesi için lütfen ayarlara dikkat ediniz.
              </p>
            </div>

            {/* Create Button */}
            <div className="pt-4">
              <Button 
                onClick={handleCreateRecipes}
                disabled={generateRecipesMutation.isPending}
                size="lg"
                className="font-medium"
              >
                {generateRecipesMutation.isPending ? "Oluşturuluyor..." : "Toplu Yemek Tarifi Oluştur"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}