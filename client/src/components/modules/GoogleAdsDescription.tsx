import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function GoogleAdsDescription() {
  const [product, setProduct] = useState("");
  const [benefits, setBenefits] = useState("");
  const [callToAction, setCallToAction] = useState("");
  const [tone, setTone] = useState("professional");
  const [count, setCount] = useState("5");
  const [result, setResult] = useState("");
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("/api/generate-google-ads-description", "POST", data);
      return await response.json();
    },
    onSuccess: (data) => {
      setResult(data.content);
      toast({
        title: "Başarılı!",
        description: "Google Ads açıklamaları oluşturuldu.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.trim() || !benefits.trim()) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen ürün/hizmet ve faydaları girin.",
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate({
      product: product.trim(),
      benefits: benefits.trim(),
      callToAction: callToAction.trim(),
      tone,
      count: parseInt(count)
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    toast({
      title: "Kopyalandı!",
      description: "İçerik panoya kopyalandı.",
    });
  };

  const downloadAsText = () => {
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "google-ads-aciklamalari.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Google Ads Açıklaması Üretici
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Etkileyici Google Ads açıklamaları oluşturun
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Açıklama Bilgileri</CardTitle>
            <CardDescription>
              Google Ads açıklamaları için gerekli bilgileri girin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="product">Ürün/Hizmet *</Label>
                <Input
                  id="product"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="Örn: Premium Fitness Üyeliği, Web Tasarım Hizmeti"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="benefits">Faydalar ve Özellikler *</Label>
                <Textarea
                  id="benefits"
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  placeholder="Örn: 24/7 açık, profesyonel eğitmenler, modern ekipmanlar, ücretsiz park"
                  className="mt-1"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="cta">Eylem Çağrısı</Label>
                <Input
                  id="cta"
                  value={callToAction}
                  onChange={(e) => setCallToAction(e.target.value)}
                  placeholder="Örn: Hemen üye ol, Ücretsiz deneme al, İletişime geç"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="tone">Ton</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Profesyonel</SelectItem>
                    <SelectItem value="friendly">Samimi</SelectItem>
                    <SelectItem value="persuasive">İkna Edici</SelectItem>
                    <SelectItem value="exciting">Heyecanlı</SelectItem>
                    <SelectItem value="trustworthy">Güvenilir</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="count">Açıklama Sayısı</Label>
                <Select value={count} onValueChange={setCount}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Açıklama</SelectItem>
                    <SelectItem value="5">5 Açıklama</SelectItem>
                    <SelectItem value="10">10 Açıklama</SelectItem>
                    <SelectItem value="15">15 Açıklama</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={generateMutation.isPending}
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  "Açıklama Oluştur"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Oluşturulan Açıklamalar</CardTitle>
            <CardDescription>
              Google Ads için optimize edilmiş açıklamalar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <Textarea
                  value={result}
                  readOnly
                  className="min-h-[300px] font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button onClick={copyToClipboard} size="sm" variant="outline">
                    <Copy className="mr-2 h-4 w-4" />
                    Kopyala
                  </Button>
                  <Button onClick={downloadAsText} size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    İndir
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                <p>Açıklama oluşturmak için formu doldurun</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}