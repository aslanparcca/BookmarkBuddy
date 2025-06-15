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
import { Copy, Download, HelpCircle } from "lucide-react";

interface FAQGeneratorProps {
  setLoading: (loading: boolean) => void;
}

export default function FAQGenerator({ setLoading }: FAQGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [questionCount, setQuestionCount] = useState('10');
  const [language, setLanguage] = useState('tr');
  const [tone, setTone] = useState('helpful');
  const [generatedFAQs, setGeneratedFAQs] = useState<any[]>([]);
  const { toast } = useToast();

  const generateFAQMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/generate-faq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'An error occurred');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedFAQs(data.faqs || []);
      setLoading(false);
      toast({
        title: "Başarılı",
        description: `${data.faqs?.length || 0} SSS oluşturuldu.`,
      });
    },
    onError: (error: any) => {
      setLoading(false);
      toast({
        title: "Hata",
        description: error.message || "SSS oluşturma sırasında bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({
        title: "Uyarı",
        description: "Lütfen konuyu girin.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    generateFAQMutation.mutate({
      topic: topic.trim(),
      targetAudience: targetAudience.trim(),
      questionCount: parseInt(questionCount),
      language,
      tone
    });
  };

  const copyFAQ = (question: string, answer: string) => {
    const faqText = `S: ${question}\nC: ${answer}`;
    navigator.clipboard.writeText(faqText);
    toast({
      title: "Kopyalandı",
      description: "SSS panoya kopyalandı.",
    });
  };

  const copyAllFAQs = () => {
    const allFAQs = generatedFAQs.map((faq, index) => 
      `${index + 1}. S: ${faq.question}\nC: ${faq.answer}\n`
    ).join('\n');
    navigator.clipboard.writeText(allFAQs);
    toast({
      title: "Kopyalandı",
      description: "Tüm SSS'ler panoya kopyalandı.",
    });
  };

  const downloadFAQs = () => {
    const content = generatedFAQs.map((faq, index) => 
      `${index + 1}. SORU: ${faq.question}\nCEVAP: ${faq.answer}\n\n`
    ).join('');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sss-${topic.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "İndirildi",
      description: "SSS'ler dosya olarak indirildi.",
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            Sıkça Sorulan Sorular Üretici
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="topic">Konu *</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Örn: E-ticaret siparişleri, Yazılım geliştirme"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="targetAudience">Hedef Kitle (Opsiyonel)</Label>
                <Input
                  id="targetAudience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Örn: Yeni müşteriler, deneyimli kullanıcılar"
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
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="questionCount">Soru Sayısı</Label>
                <Select value={questionCount} onValueChange={setQuestionCount}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Soru</SelectItem>
                    <SelectItem value="10">10 Soru</SelectItem>
                    <SelectItem value="15">15 Soru</SelectItem>
                    <SelectItem value="20">20 Soru</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tone">Cevap Tonu</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="helpful">Yardımcı</SelectItem>
                    <SelectItem value="professional">Profesyonel</SelectItem>
                    <SelectItem value="friendly">Samimi</SelectItem>
                    <SelectItem value="detailed">Detaylı</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generateFAQMutation.isPending}
                className="w-full mt-4"
                size="lg"
              >
                {generateFAQMutation.isPending ? 'Oluşturuluyor...' : 'SSS Oluştur'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {generatedFAQs.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Oluşturulan SSS ({generatedFAQs.length})</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={copyAllFAQs}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Tümünü Kopyala
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={downloadFAQs}
                >
                  <Download className="h-4 w-4 mr-2" />
                  İndir
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedFAQs.map((faq, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 pr-4">
                      S{index + 1}: {faq.question}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyFAQ(faq.question, faq.answer)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-gray-800 leading-relaxed">
                    <span className="font-medium">Cevap:</span> {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}