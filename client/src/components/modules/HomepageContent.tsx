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

export default function HomepageContent() {
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [services, setServices] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [uniqueValue, setUniqueValue] = useState("");
  const [tone, setTone] = useState("professional");
  const [sections, setSections] = useState("full");
  const [result, setResult] = useState("");
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("/api/generate-homepage-content", "POST", data);
      return await response.json();
    },
    onSuccess: (data) => {
      setResult(data.content);
      toast({
        title: "Başarılı!",
        description: "Ana sayfa içeriği oluşturuldu.",
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
    if (!businessName.trim() || !industry.trim() || !services.trim()) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen işletme adı, sektör ve hizmetleri girin.",
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate({
      businessName: businessName.trim(),
      industry: industry.trim(),
      services: services.trim(),
      targetAudience: targetAudience.trim(),
      uniqueValue: uniqueValue.trim(),
      tone,
      sections
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
    a.download = "ana-sayfa-icerigi.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Ana Sayfa Yazısı Üretici
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Profesyonel ana sayfa içerikleri oluşturun
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>İşletme Bilgileri</CardTitle>
            <CardDescription>
              Ana sayfa içeriği için gerekli bilgileri girin
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
                  placeholder="Örn: Elit Teknoloji, Doğal Güzellik Merkezi"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="industry">Sektör *</Label>
                <Input
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Örn: Yazılım geliştirme, Güzellik ve bakım"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="services">Hizmetler/Ürünler *</Label>
                <Textarea
                  id="services"
                  value={services}
                  onChange={(e) => setServices(e.target.value)}
                  placeholder="Örn: Web tasarım, mobil uygulama, e-ticaret çözümleri"
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="audience">Hedef Kitle</Label>
                <Textarea
                  id="audience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Örn: KOBİ'ler, girişimciler, teknoloji şirketleri"
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="uniqueValue">Benzersiz Değer Önerisi</Label>
                <Textarea
                  id="uniqueValue"
                  value={uniqueValue}
                  onChange={(e) => setUniqueValue(e.target.value)}
                  placeholder="Örn: 15 yıllık deneyim, 7/24 destek, ücretsiz danışmanlık"
                  className="mt-1"
                  rows={2}
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
                    <SelectItem value="corporate">Kurumsal</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="trustworthy">Güvenilir</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sections">İçerik Kapsamı</Label>
                <Select value={sections} onValueChange={setSections}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hero">Sadece Hero Bölümü</SelectItem>
                    <SelectItem value="about">Hakkımızda + Hero</SelectItem>
                    <SelectItem value="services">Hizmetler + Hero</SelectItem>
                    <SelectItem value="full">Tam Ana Sayfa</SelectItem>
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
                  "İçerik Oluştur"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Oluşturulan İçerik</CardTitle>
            <CardDescription>
              Ana sayfa için optimize edilmiş içerik
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
                <p>İçerik oluşturmak için formu doldurun</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}