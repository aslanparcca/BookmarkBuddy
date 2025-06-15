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
import { Copy, Download, Wrench } from "lucide-react";

interface ServiceDescriptionWriterProps {
  setLoading: (loading: boolean) => void;
}

export default function ServiceDescriptionWriter({ setLoading }: ServiceDescriptionWriterProps) {
  const [serviceName, setServiceName] = useState('');
  const [serviceDetails, setServiceDetails] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [benefits, setBenefits] = useState('');
  const [language, setLanguage] = useState('tr');
  const [tone, setTone] = useState('professional');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const { toast } = useToast();

  const generateDescriptionMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/generate-service-description', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      setGeneratedDescription(data.serviceDescription || '');
      setLoading(false);
      toast({
        title: "Başarılı",
        description: "Hizmet açıklaması oluşturuldu.",
      });
    },
    onError: (error: any) => {
      setLoading(false);
      toast({
        title: "Hata",
        description: error.message || "Hizmet açıklaması oluşturma sırasında bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!serviceName.trim()) {
      toast({
        title: "Uyarı",
        description: "Lütfen hizmet adını girin.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    generateDescriptionMutation.mutate({
      serviceName: serviceName.trim(),
      serviceDetails: serviceDetails.trim(),
      targetAudience: targetAudience.trim(),
      benefits: benefits.trim(),
      language,
      tone
    });
  };

  const copyDescription = () => {
    navigator.clipboard.writeText(generatedDescription);
    toast({
      title: "Kopyalandı",
      description: "Hizmet açıklaması panoya kopyalandı.",
    });
  };

  const downloadDescription = () => {
    const blob = new Blob([generatedDescription], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hizmet-aciklamasi-${serviceName.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "İndirildi",
      description: "Hizmet açıklaması dosya olarak indirildi.",
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-orange-600" />
            Hizmet Açıklaması Yazarı
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="serviceName">Hizmet Adı *</Label>
                <Input
                  id="serviceName"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="Örn: Web Tasarım Hizmeti"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="serviceDetails">Hizmet Detayları (Opsiyonel)</Label>
                <Textarea
                  id="serviceDetails"
                  value={serviceDetails}
                  onChange={(e) => setServiceDetails(e.target.value)}
                  placeholder="Örn: Responsive web tasarımı, SEO optimizasyonu, mobil uyumluluk"
                  className="mt-1 h-24"
                />
              </div>

              <div>
                <Label htmlFor="targetAudience">Hedef Kitle (Opsiyonel)</Label>
                <Input
                  id="targetAudience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Örn: Küçük işletmeler, e-ticaret firmaları"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="benefits">Faydalar/Avantajlar (Opsiyonel)</Label>
                <Textarea
                  id="benefits"
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  placeholder="Örn: Hızlı teslimat, uygun fiyat, 7/24 destek"
                  className="mt-1 h-24"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="tone">Yazım Tonu</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Profesyonel</SelectItem>
                    <SelectItem value="friendly">Samimi</SelectItem>
                    <SelectItem value="persuasive">İkna Edici</SelectItem>
                    <SelectItem value="technical">Teknik</SelectItem>
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
              <CardTitle>Oluşturulan Hizmet Açıklaması</CardTitle>
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
              <div className="prose prose-sm max-w-none">
                {generatedDescription.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 last:mb-0 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}