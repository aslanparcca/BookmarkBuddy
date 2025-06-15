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
import { Copy, Download, User } from "lucide-react";

interface AboutGeneratorProps {
  setLoading: (loading: boolean) => void;
}

export default function AboutGenerator({ setLoading }: AboutGeneratorProps) {
  const [fullName, setFullName] = useState('');
  const [profession, setProfession] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [achievements, setAchievements] = useState('');
  const [personalInfo, setPersonalInfo] = useState('');
  const [language, setLanguage] = useState('tr');
  const [tone, setTone] = useState('professional');
  const [generatedAbout, setGeneratedAbout] = useState('');
  const { toast } = useToast();

  const generateAboutMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/generate-about', {
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
      setGeneratedAbout(data.aboutText || '');
      setLoading(false);
      toast({
        title: "Başarılı",
        description: "Hakkımda yazısı oluşturuldu.",
      });
    },
    onError: (error: any) => {
      setLoading(false);
      toast({
        title: "Hata",
        description: error.message || "Hakkımda yazısı oluşturma sırasında bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!fullName.trim() || !profession.trim()) {
      toast({
        title: "Uyarı",
        description: "Lütfen ad soyad ve meslek bilgilerini girin.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    generateAboutMutation.mutate({
      fullName: fullName.trim(),
      profession: profession.trim(),
      experience: experience.trim(),
      skills: skills.trim(),
      achievements: achievements.trim(),
      personalInfo: personalInfo.trim(),
      language,
      tone
    });
  };

  const copyText = () => {
    navigator.clipboard.writeText(generatedAbout);
    toast({
      title: "Kopyalandı",
      description: "Hakkımda yazısı panoya kopyalandı.",
    });
  };

  const downloadText = () => {
    const blob = new Blob([generatedAbout], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hakkimda-${fullName.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "İndirildi",
      description: "Hakkımda yazısı dosya olarak indirildi.",
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-green-600" />
            Hakkımda Yazısı Üretici
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Ad Soyad *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Örn: Ahmet Yılmaz"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="profession">Meslek/Uzmanlık Alanı *</Label>
                <Input
                  id="profession"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="Örn: Yazılım Geliştirici, Grafik Tasarımcı"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="experience">Deneyim (Opsiyonel)</Label>
                <Textarea
                  id="experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Örn: 5 yıllık web geliştirme deneyimi, ABC şirketinde çalıştım"
                  className="mt-1 h-24"
                />
              </div>

              <div>
                <Label htmlFor="skills">Yetenekler/Beceriler (Opsiyonel)</Label>
                <Textarea
                  id="skills"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="Örn: JavaScript, React, Photoshop, UI/UX tasarım"
                  className="mt-1 h-24"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="achievements">Başarılar/Projeler (Opsiyonel)</Label>
                <Textarea
                  id="achievements"
                  value={achievements}
                  onChange={(e) => setAchievements(e.target.value)}
                  placeholder="Örn: 50+ web sitesi geliştirdim, XYZ ödülü aldım"
                  className="mt-1 h-24"
                />
              </div>

              <div>
                <Label htmlFor="personalInfo">Kişisel Bilgiler (Opsiyonel)</Label>
                <Textarea
                  id="personalInfo"
                  value={personalInfo}
                  onChange={(e) => setPersonalInfo(e.target.value)}
                  placeholder="Örn: Hobi ve ilgi alanları, eğitim durumu"
                  className="mt-1 h-24"
                />
              </div>

              <div>
                <Label htmlFor="tone">Yazım Tonu</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Profesyonel</SelectItem>
                    <SelectItem value="friendly">Samimi</SelectItem>
                    <SelectItem value="formal">Resmi</SelectItem>
                    <SelectItem value="creative">Yaratıcı</SelectItem>
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
                disabled={generateAboutMutation.isPending}
                className="w-full mt-4"
                size="lg"
              >
                {generateAboutMutation.isPending ? 'Oluşturuluyor...' : 'Hakkımda Yazısı Oluştur'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {generatedAbout && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Oluşturulan Hakkımda Yazısı</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={copyText}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Kopyala
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={downloadText}
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
                {generatedAbout.split('\n').map((paragraph, index) => (
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