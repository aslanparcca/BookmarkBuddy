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
import { Copy, Download, FileText } from "lucide-react";

interface TitleGeneratorProps {
  setLoading: (loading: boolean) => void;
}

export default function TitleGenerator({ setLoading }: TitleGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [titleCount, setTitleCount] = useState('20');
  const [titleStyle, setTitleStyle] = useState('mixed');
  const [language, setLanguage] = useState('tr');
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const { toast } = useToast();

  const generateTitlesMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/generate-titles', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      setGeneratedTitles(data.titles || []);
      setLoading(false);
      toast({
        title: "Başarılı",
        description: `${data.titles?.length || 0} başlık oluşturuldu.`,
      });
    },
    onError: (error: any) => {
      setLoading(false);
      toast({
        title: "Hata",
        description: error.message || "Başlık oluşturma sırasında bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({
        title: "Uyarı",
        description: "Lütfen konu veya ana fikri girin.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    generateTitlesMutation.mutate({
      topic: topic.trim(),
      keywords: keywords.trim(),
      titleCount: parseInt(titleCount),
      titleStyle,
      language
    });
  };

  const copyTitle = (title: string) => {
    navigator.clipboard.writeText(title);
    toast({
      title: "Kopyalandı",
      description: "Başlık panoya kopyalandı.",
    });
  };

  const copyAllTitles = () => {
    const allTitles = generatedTitles.join('\n');
    navigator.clipboard.writeText(allTitles);
    toast({
      title: "Kopyalandı",
      description: "Tüm başlıklar panoya kopyalandı.",
    });
  };

  const downloadTitles = () => {
    const content = generatedTitles.map((title, index) => `${index + 1}. ${title}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `makale-basliklari-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "İndirildi",
      description: "Başlıklar dosya olarak indirildi.",
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            Makale Başlığı Üretici
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="topic">Konu / Ana Fikir *</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Örn: Dijital pazarlama stratejileri"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="keywords">Anahtar Kelimeler (Opsiyonel)</Label>
                <Textarea
                  id="keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="Örn: SEO, sosyal medya, e-ticaret"
                  className="mt-1 h-24"
                />
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
                    <SelectItem value="es">İspanyolca</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="titleCount">Başlık Sayısı</Label>
                <Select value={titleCount} onValueChange={setTitleCount}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 Başlık</SelectItem>
                    <SelectItem value="20">20 Başlık</SelectItem>
                    <SelectItem value="30">30 Başlık</SelectItem>
                    <SelectItem value="50">50 Başlık</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="titleStyle">Başlık Stili</Label>
                <Select value={titleStyle} onValueChange={setTitleStyle}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mixed">Karışık Stil</SelectItem>
                    <SelectItem value="clickbait">Dikkat Çekici</SelectItem>
                    <SelectItem value="professional">Profesyonel</SelectItem>
                    <SelectItem value="question">Soru Formatında</SelectItem>
                    <SelectItem value="howto">Nasıl Yapılır</SelectItem>
                    <SelectItem value="listicle">Liste Formatında</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generateTitlesMutation.isPending}
                className="w-full mt-4"
                size="lg"
              >
                {generateTitlesMutation.isPending ? 'Oluşturuluyor...' : 'Başlık Oluştur'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {generatedTitles.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Oluşturulan Başlıklar ({generatedTitles.length})</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={copyAllTitles}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Tümünü Kopyala
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={downloadTitles}
                >
                  <Download className="h-4 w-4 mr-2" />
                  İndir
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {generatedTitles.map((title, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-medium flex-1 pr-4">{title}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyTitle(title)}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}