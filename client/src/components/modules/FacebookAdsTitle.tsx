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

export default function FacebookAdsTitle() {
  const [product, setProduct] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [objective, setObjective] = useState("");
  const [tone, setTone] = useState("engaging");
  const [count, setCount] = useState("5");
  const [result, setResult] = useState("");
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("/api/generate-facebook-ads-title", "POST", data);
      return await response.json();
    },
    onSuccess: (data) => {
      setResult(data.content);
      toast({
        title: "Başarılı!",
        description: "Facebook Ads başlıkları oluşturuldu.",
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
    if (!product.trim() || !targetAudience.trim()) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen ürün/hizmet ve hedef kitle bilgilerini girin.",
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate({
      product: product.trim(),
      targetAudience: targetAudience.trim(),
      objective: objective.trim(),
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
    a.download = "facebook-ads-basliklari.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Facebook Ads Başlığı Üretici
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Dikkat çekici Facebook reklam başlıkları oluşturun
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Başlık Bilgileri</CardTitle>
            <CardDescription>
              Facebook Ads başlıkları için gerekli bilgileri girin
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
                  placeholder="Örn: Yoga kursu, E-ticaret sitesi, Organik çay"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="audience">Hedef Kitle *</Label>
                <Textarea
                  id="audience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Örn: 25-40 yaş arası kadınlar, sağlıklı yaşam tarzını benimseyen"
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="objective">Reklam Amacı</Label>
                <Input
                  id="objective"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Örn: Satış artırma, farkındalık yaratma, üye kayıt"
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
                    <SelectItem value="fun">Eğlenceli</SelectItem>
                    <SelectItem value="inspirational">İlham Verici</SelectItem>
                    <SelectItem value="professional">Profesyonel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="count">Başlık Sayısı</Label>
                <Select value={count} onValueChange={setCount}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Başlık</SelectItem>
                    <SelectItem value="5">5 Başlık</SelectItem>
                    <SelectItem value="10">10 Başlık</SelectItem>
                    <SelectItem value="15">15 Başlık</SelectItem>
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
                  "Başlık Oluştur"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Oluşturulan Başlıklar</CardTitle>
            <CardDescription>
              Facebook Ads için optimize edilmiş başlıklar
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
                <p>Başlık oluşturmak için formu doldurun</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}