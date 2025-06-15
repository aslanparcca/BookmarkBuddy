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

export default function ContactPage() {
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [contactMethods, setContactMethods] = useState("");
  const [location, setLocation] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [tone, setTone] = useState("professional");
  const [sections, setSections] = useState("full");
  const [result, setResult] = useState("");
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("/api/generate-contact-page", "POST", data);
      return await response.json();
    },
    onSuccess: (data) => {
      setResult(data.content);
      toast({
        title: "Başarılı!",
        description: "İletişim sayfası içeriği oluşturuldu.",
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
    if (!businessName.trim() || !industry.trim()) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen işletme adı ve sektör bilgilerini girin.",
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate({
      businessName: businessName.trim(),
      industry: industry.trim(),
      contactMethods: contactMethods.trim(),
      location: location.trim(),
      workingHours: workingHours.trim(),
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
    a.download = "iletisim-sayfasi.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          İletişim Sayfası Yazısı Üretici
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Güven veren iletişim sayfası metinleri oluşturun
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>İletişim Bilgileri</CardTitle>
            <CardDescription>
              İletişim sayfası için gerekli bilgileri girin
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
                  placeholder="Örn: Teknoloji Çözümleri Ltd., Sağlık Merkezi"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="industry">Sektör *</Label>
                <Input
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Örn: Bilişim teknolojileri, Sağlık hizmetleri"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="contactMethods">İletişim Yöntemleri</Label>
                <Textarea
                  id="contactMethods"
                  value={contactMethods}
                  onChange={(e) => setContactMethods(e.target.value)}
                  placeholder="Örn: Telefon, email, WhatsApp, canlı destek"
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="location">Konum/Adres</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Örn: İstanbul Levent, Ankara Çankaya"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="workingHours">Çalışma Saatleri</Label>
                <Input
                  id="workingHours"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  placeholder="Örn: Pazartesi-Cuma 09:00-18:00"
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
                    <SelectItem value="welcoming">Karşılayıcı</SelectItem>
                    <SelectItem value="helpful">Yardımsever</SelectItem>
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
                    <SelectItem value="basic">Temel İletişim</SelectItem>
                    <SelectItem value="detailed">Detaylı Bilgi</SelectItem>
                    <SelectItem value="faq">SSS Dahil</SelectItem>
                    <SelectItem value="full">Tam İletişim Sayfası</SelectItem>
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
              İletişim sayfası için optimize edilmiş içerik
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