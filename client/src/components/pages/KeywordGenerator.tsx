import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Copy, Download, Search } from "lucide-react";

interface KeywordGeneratorProps {
  setLoading: (loading: boolean) => void;
}

export default function KeywordGenerator({ setLoading }: KeywordGeneratorProps) {
  const [mainKeyword, setMainKeyword] = useState('');
  const [industry, setIndustry] = useState('');
  const [language, setLanguage] = useState('tr');
  const [keywordCount, setKeywordCount] = useState('20');
  const [keywordType, setKeywordType] = useState('mixed');
  const [generatedKeywords, setGeneratedKeywords] = useState<string[]>([]);
  const { toast } = useToast();

  const generateKeywordsMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/generate-keywords', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      setGeneratedKeywords(data.keywords || []);
      setLoading(false);
      toast({
        title: "Başarılı",
        description: `${data.keywords?.length || 0} anahtar kelime oluşturuldu.`,
      });
    },
    onError: (error: any) => {
      setLoading(false);
      toast({
        title: "Hata",
        description: error.message || "Anahtar kelime oluşturma sırasında bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!mainKeyword.trim()) {
      toast({
        title: "Uyarı",
        description: "Lütfen ana anahtar kelimeyi girin.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    generateKeywordsMutation.mutate({
      mainKeyword: mainKeyword.trim(),
      industry: industry.trim(),
      language,
      keywordCount: parseInt(keywordCount),
      keywordType
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopyalandı",
      description: "Anahtar kelime panoya kopyalandı.",
    });
  };

  const copyAllKeywords = () => {
    const allKeywords = generatedKeywords.join('\n');
    navigator.clipboard.writeText(allKeywords);
    toast({
      title: "Kopyalandı",
      description: "Tüm anahtar kelimeler panoya kopyalandı.",
    });
  };

  const downloadKeywords = () => {
    const content = generatedKeywords.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anahtar-kelimeler-${mainKeyword.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "İndirildi",
      description: "Anahtar kelimeler dosya olarak indirildi.",
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            Anahtar Kelime Üretici
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="mainKeyword">Ana Anahtar Kelime *</Label>
                <Input
                  id="mainKeyword"
                  value={mainKeyword}
                  onChange={(e) => setMainKeyword(e.target.value)}
                  placeholder="Örn: dijital pazarlama"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="industry">Sektör / Konu (Opsiyonel)</Label>
                <Input
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Örn: teknoloji, sağlık, eğitim"
                  className="mt-1"
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
                <Label htmlFor="keywordCount">Anahtar Kelime Sayısı</Label>
                <Select value={keywordCount} onValueChange={setKeywordCount}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 Anahtar Kelime</SelectItem>
                    <SelectItem value="20">20 Anahtar Kelime</SelectItem>
                    <SelectItem value="30">30 Anahtar Kelime</SelectItem>
                    <SelectItem value="50">50 Anahtar Kelime</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="keywordType">Anahtar Kelime Türü</Label>
                <Select value={keywordType} onValueChange={setKeywordType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mixed">Karışık (Kısa + Uzun)</SelectItem>
                    <SelectItem value="short">Kısa Anahtar Kelimeler</SelectItem>
                    <SelectItem value="long">Uzun Kuyruk Anahtar Kelimeler</SelectItem>
                    <SelectItem value="questions">Soru Formatında</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generateKeywordsMutation.isPending}
                className="w-full mt-4"
                size="lg"
              >
                {generateKeywordsMutation.isPending ? 'Oluşturuluyor...' : 'Anahtar Kelime Oluştur'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {generatedKeywords.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Oluşturulan Anahtar Kelimeler ({generatedKeywords.length})</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={copyAllKeywords}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Tümünü Kopyala
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={downloadKeywords}
                >
                  <Download className="h-4 w-4 mr-2" />
                  İndir
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {generatedKeywords.map((keyword, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-medium">{keyword}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(keyword)}
                    className="ml-2 h-8 w-8 p-0"
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