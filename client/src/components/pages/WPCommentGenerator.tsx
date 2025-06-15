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
import { Copy, Download, MessageCircle } from "lucide-react";

interface WPCommentGeneratorProps {
  setLoading: (loading: boolean) => void;
}

export default function WPCommentGenerator({ setLoading }: WPCommentGeneratorProps) {
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [commentCount, setCommentCount] = useState('10');
  const [commentTone, setCommentTone] = useState('mixed');
  const [language, setLanguage] = useState('tr');
  const [generatedComments, setGeneratedComments] = useState<any[]>([]);
  const { toast } = useToast();

  const generateCommentsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/generate-wp-comments', {
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
      setGeneratedComments(data.comments || []);
      setLoading(false);
      toast({
        title: "Başarılı",
        description: `${data.comments?.length || 0} yorum oluşturuldu.`,
      });
    },
    onError: (error: any) => {
      setLoading(false);
      toast({
        title: "Hata",
        description: error.message || "Yorum oluşturma sırasında bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!postTitle.trim()) {
      toast({
        title: "Uyarı",
        description: "Lütfen makale başlığını girin.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    generateCommentsMutation.mutate({
      postTitle: postTitle.trim(),
      postContent: postContent.trim(),
      commentCount: parseInt(commentCount),
      commentTone,
      language
    });
  };

  const copyComment = (comment: string) => {
    navigator.clipboard.writeText(comment);
    toast({
      title: "Kopyalandı",
      description: "Yorum panoya kopyalandı.",
    });
  };

  const downloadComments = () => {
    const content = generatedComments.map((comment, index) => 
      `Yorum ${index + 1}:\nYazarı: ${comment.author}\nE-posta: ${comment.email}\nİçerik: ${comment.content}\n\n`
    ).join('');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wordpress-yorumlari-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "İndirildi",
      description: "Yorumlar dosya olarak indirildi.",
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            WordPress Yorum Üretici
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="postTitle">Makale Başlığı *</Label>
                <Input
                  id="postTitle"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="Örn: WordPress SEO Rehberi"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="postContent">Makale İçeriği (Opsiyonel)</Label>
                <Textarea
                  id="postContent"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Makale içeriğinin bir kısmını girin (daha gerçekçi yorumlar için)"
                  className="mt-1 h-32"
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
                <Label htmlFor="commentCount">Yorum Sayısı</Label>
                <Select value={commentCount} onValueChange={setCommentCount}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Yorum</SelectItem>
                    <SelectItem value="10">10 Yorum</SelectItem>
                    <SelectItem value="15">15 Yorum</SelectItem>
                    <SelectItem value="20">20 Yorum</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="commentTone">Yorum Tonu</Label>
                <Select value={commentTone} onValueChange={setCommentTone}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mixed">Karışık (Pozitif + Nötr)</SelectItem>
                    <SelectItem value="positive">Pozitif</SelectItem>
                    <SelectItem value="neutral">Nötr</SelectItem>
                    <SelectItem value="appreciative">Takdir Edici</SelectItem>
                    <SelectItem value="questioning">Soru Sorucu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generateCommentsMutation.isPending}
                className="w-full mt-4"
                size="lg"
              >
                {generateCommentsMutation.isPending ? 'Oluşturuluyor...' : 'Yorum Oluştur'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {generatedComments.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Oluşturulan Yorumlar ({generatedComments.length})</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={downloadComments}
              >
                <Download className="h-4 w-4 mr-2" />
                İndir
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedComments.map((comment, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{comment.author}</h4>
                      <p className="text-sm text-gray-600">{comment.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyComment(`Yazar: ${comment.author}\nE-posta: ${comment.email}\nYorum: ${comment.content}`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-gray-800 leading-relaxed">{comment.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}