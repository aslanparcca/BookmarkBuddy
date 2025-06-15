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

export default function CustomerReview() {
  const [businessName, setBusinessName] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [positivePoints, setPositivePoints] = useState("");
  const [customerProfile, setCustomerProfile] = useState("");
  const [rating, setRating] = useState("5");
  const [reviewStyle, setReviewStyle] = useState("detailed");
  const [count, setCount] = useState("5");
  const [result, setResult] = useState("");
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("/api/generate-customer-review", "POST", data);
      return await response.json();
    },
    onSuccess: (data) => {
      setResult(data.content);
      toast({
        title: "Başarılı!",
        description: "Müşteri yorumları oluşturuldu.",
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
    if (!businessName.trim() || !serviceType.trim()) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen işletme adı ve hizmet türünü girin.",
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate({
      businessName: businessName.trim(),
      serviceType: serviceType.trim(),
      positivePoints: positivePoints.trim(),
      customerProfile: customerProfile.trim(),
      rating: parseInt(rating),
      reviewStyle,
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
    a.download = "musteri-yorumlari.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Müşteri Yorumu Üretici
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Gerçekçi müşteri yorum ve değerlendirmeleri oluşturun
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Yorum Bilgileri</CardTitle>
            <CardDescription>
              Müşteri yorumları için gerekli bilgileri girin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="businessName">İşletme Adı *</Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Örn: Lezzet Lokantası, Teknoloji Merkezi"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="serviceType">Hizmet/Ürün Türü *</Label>
                <Input
                  id="serviceType"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  placeholder="Örn: Yemek servisi, Web tasarım, Kuaför hizmeti"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="positivePoints">Övülecek Özellikler</Label>
                <Textarea
                  id="positivePoints"
                  value={positivePoints}
                  onChange={(e) => setPositivePoints(e.target.value)}
                  placeholder="Örn: Hızlı teslimat, kaliteli malzeme, güler yüzlü personel"
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="customerProfile">Müşteri Profili</Label>
                <Input
                  id="customerProfile"
                  value={customerProfile}
                  onChange={(e) => setCustomerProfile(e.target.value)}
                  placeholder="Örn: Genç profesyonel, Aile, İş insanı"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="rating">Puan</Label>
                <Select value={rating} onValueChange={setRating}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Yıldız (Mükemmel)</SelectItem>
                    <SelectItem value="4">4 Yıldız (Çok İyi)</SelectItem>
                    <SelectItem value="3">3 Yıldız (İyi)</SelectItem>
                    <SelectItem value="mixed">Karışık (3-5 yıldız)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reviewStyle">Yorum Tarzı</Label>
                <Select value={reviewStyle} onValueChange={setReviewStyle}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="detailed">Detaylı</SelectItem>
                    <SelectItem value="short">Kısa</SelectItem>
                    <SelectItem value="emotional">Duygusal</SelectItem>
                    <SelectItem value="professional">Profesyonel</SelectItem>
                    <SelectItem value="casual">Gündelik</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="count">Yorum Sayısı</Label>
                <Select value={count} onValueChange={setCount}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Yorum</SelectItem>
                    <SelectItem value="5">5 Yorum</SelectItem>
                    <SelectItem value="10">10 Yorum</SelectItem>
                    <SelectItem value="15">15 Yorum</SelectItem>
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
                  "Yorum Oluştur"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Oluşturulan Yorumlar</CardTitle>
            <CardDescription>
              Gerçekçi müşteri değerlendirmeleri
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
                <p>Yorum oluşturmak için formu doldurun</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}