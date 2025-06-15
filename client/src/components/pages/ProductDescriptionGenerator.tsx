import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Copy, Download, Tag } from "lucide-react";

interface ProductDescriptionGeneratorProps {
  setLoading: (loading: boolean) => void;
}

export default function ProductDescriptionGenerator({ setLoading }: ProductDescriptionGeneratorProps) {
  const [productName, setProductName] = useState('');
  const [productFeatures, setProductFeatures] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [language, setLanguage] = useState('tr');
  const [tone, setTone] = useState('sales');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const { toast } = useToast();

  const generateDescriptionMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/generate-product-description', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      setGeneratedDescription(data.productDescription || '');
      setLoading(false);
      toast({
        title: "Başarılı",
        description: "Ürün açıklaması oluşturuldu.",
      });
    },
    onError: (error: any) => {
      setLoading(false);
      toast({
        title: "Hata",
        description: error.message || "Ürün açıklaması oluşturma sırasında bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!productName.trim()) {
      toast({
        title: "Uyarı",
        description: "Lütfen ürün adını girin.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    generateDescriptionMutation.mutate({
      productName: productName.trim(),
      productFeatures: productFeatures.trim(),
      targetAudience: targetAudience.trim(),
      price: price.trim(),
      category: category.trim(),
      language,
      tone
    });
  };

  const copyDescription = () => {
    navigator.clipboard.writeText(generatedDescription);
    toast({
      title: "Kopyalandı",
      description: "Ürün açıklaması panoya kopyalandı.",
    });
  };

  const downloadDescription = () => {
    const blob = new Blob([generatedDescription], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `urun-aciklamasi-${productName.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "İndirildi",
      description: "Ürün açıklaması dosya olarak indirildi.",
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-red-600" />
            Ürün Açıklaması Üretici
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="productName">Ürün Adı *</Label>
                <Input
                  id="productName"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Örn: Kablosuz Bluetooth Kulaklık"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="category">Kategori (Opsiyonel)</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Örn: Elektronik, Giyim, Ev & Yaşam"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="price">Fiyat (Opsiyonel)</Label>
                <Input
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Örn: 299 TL"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="productFeatures">Ürün Özellikleri (Opsiyonel)</Label>
                <Textarea
                  id="productFeatures"
                  value={productFeatures}
                  onChange={(e) => setProductFeatures(e.target.value)}
                  placeholder="Örn: Gürültü önleme, 20 saat pil ömrü, su geçirmez"
                  className="mt-1 h-24"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="targetAudience">Hedef Kitle (Opsiyonel)</Label>
                <Input
                  id="targetAudience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Örn: Müzik severler, sporcular, öğrenciler"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="tone">Yazım Tonu</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Satış Odaklı</SelectItem>
                    <SelectItem value="informative">Bilgilendirici</SelectItem>
                    <SelectItem value="technical">Teknik</SelectItem>
                    <SelectItem value="casual">Samimi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="language">Dil</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tr">Türkçe</SelectItem>
                    <SelectItem value="en">İngilizce</SelectItem>
                    <SelectItem value="de">Almanca</SelectItem>
                    <SelectItem value="fr">Fransızca</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generateDescriptionMutation.isPending}
                className="w-full mt-4"
                size="lg"
              >
                {generateDescriptionMutation.isPending ? 'Oluşturuluyor...' : 'Açıklama Oluştur'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {generatedDescription && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Oluşturulan Ürün Açıklaması</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={copyDescription}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Kopyala
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={downloadDescription}
                >
                  <Download className="h-4 w-4 mr-2" />
                  İndir
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="prose prose-sm max-w-none whitespace-pre-line">
                {generatedDescription}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}