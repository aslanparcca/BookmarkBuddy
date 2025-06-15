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

export default function FacebookAdsText() {
  const [product, setProduct] = useState("");
  const [benefits, setBenefits] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [callToAction, setCallToAction] = useState("");
  const [tone, setTone] = useState("engaging");
  const [length, setLength] = useState("medium");
  const [count, setCount] = useState("5");
  const [result, setResult] = useState("");
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("/api/generate-facebook-ads-text", "POST", data);
      return await response.json();
    },
    onSuccess: (data) => {
      setResult(data.content);
      toast({
        title: "Başarılı!",
        description: "Facebook Ads metinleri oluşturuldu.",
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
      targetAudience: targetAudience.trim(),
      callToAction: callToAction.trim(),
      tone,
      length,
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
    a.download = "facebook-ads-metinleri.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Facebook Ads Ana Metin Üretici
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Etkili Facebook reklam metinleri yazın
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Metin Bilgileri</CardTitle>
            <CardDescription>
              Facebook Ads ana metni için gerekli bilgileri girin
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
                  placeholder="Örn: Online pazarlama kursu, Organik gıda marketi"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="benefits">Faydalar ve Özellikler *</Label>
                <Textarea
                  id="benefits"
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  placeholder="Örn: Sertifikalı eğitmenler, 7/24 destek, pratik projeler, iş garantisi"
                  className="mt-1"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="audience">Hedef Kitle</Label>
                <Textarea
                  id="audience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Örn: Kariyer değiştirmek isteyen 25-45 yaş arası profesyoneller"
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="cta">Eylem Çağrısı</Label>
                <Input
                  id="cta"
                  value={callToAction}
                  onChange={(e) => setCallToAction(e.target.value)}
                  placeholder="Örn: Hemen başla, Daha fazla bilgi al, Kayıt ol"
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
                    <SelectItem value="engaging">İlgi Çekici</SelectItem>
                    <SelectItem value="emotional">Duygusal</SelectItem>
                    <SelectItem value="storytelling">Hikaye Anlatıcı</SelectItem>
                    <SelectItem value="problem-solving">Problem Çözücü</SelectItem>
                    <SelectItem value="conversational">Sohbet Tarzı</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="length">Metin Uzunluğu</Label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Kısa (50-100 kelime)</SelectItem>
                    <SelectItem value="medium">Orta (100-200 kelime)</SelectItem>
                    <SelectItem value="long">Uzun (200-300 kelime)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="count">Metin Sayısı</Label>
                <Select value={count} onValueChange={setCount}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Metin</SelectItem>
                    <SelectItem value="5">5 Metin</SelectItem>
                    <SelectItem value="8">8 Metin</SelectItem>
                    <SelectItem value="10">10 Metin</SelectItem>
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
                  "Metin Oluştur"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Oluşturulan Metinler</CardTitle>
            <CardDescription>
              Facebook Ads için optimize edilmiş ana metinler
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <Textarea
                  value={result}
                  readOnly
                  className="min-h-[400px] font-mono text-sm"
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
                <p>Metin oluşturmak için formu doldurun</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}