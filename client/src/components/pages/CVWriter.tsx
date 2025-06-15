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

interface CVWriterProps {
  setLoading: (loading: boolean) => void;
}

export default function CVWriter({ setLoading }: CVWriterProps) {
  const [fullName, setFullName] = useState('');
  const [profession, setProfession] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  const [skills, setSkills] = useState('');
  const [contact, setContact] = useState('');
  const [language, setLanguage] = useState('tr');
  const [style, setStyle] = useState('standard');
  const [generatedCV, setGeneratedCV] = useState('');
  const { toast } = useToast();

  const generateCVMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/generate-cv', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      setGeneratedCV(data.cvText || '');
      setLoading(false);
      toast({
        title: "Başarılı",
        description: "CV oluşturuldu.",
      });
    },
    onError: (error: any) => {
      setLoading(false);
      toast({
        title: "Hata",
        description: error.message || "CV oluşturma sırasında bir hata oluştu.",
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
    generateCVMutation.mutate({
      fullName: fullName.trim(),
      profession: profession.trim(),
      experience: experience.trim(),
      education: education.trim(),
      skills: skills.trim(),
      contact: contact.trim(),
      language,
      style
    });
  };

  const copyCV = () => {
    navigator.clipboard.writeText(generatedCV);
    toast({
      title: "Kopyalandı",
      description: "CV panoya kopyalandı.",
    });
  };

  const downloadCV = () => {
    const blob = new Blob([generatedCV], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cv-${fullName.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "İndirildi",
      description: "CV dosya olarak indirildi.",
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            CV Yazarı
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
                  placeholder="Örn: Ayşe Kaya"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="profession">Meslek/Pozisyon *</Label>
                <Input
                  id="profession"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="Örn: Frontend Developer"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="contact">İletişim Bilgileri (Opsiyonel)</Label>
                <Textarea
                  id="contact"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Örn: E-posta, telefon, LinkedIn profili"
                  className="mt-1 h-20"
                />
              </div>

              <div>
                <Label htmlFor="experience">İş Deneyimi (Opsiyonel)</Label>
                <Textarea
                  id="experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Örn: ABC Şirketi - Frontend Developer (2020-2023)"
                  className="mt-1 h-32"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="education">Eğitim (Opsiyonel)</Label>
                <Textarea
                  id="education"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="Örn: İstanbul Üniversitesi - Bilgisayar Mühendisliği"
                  className="mt-1 h-20"
                />
              </div>

              <div>
                <Label htmlFor="skills">Yetenekler/Teknolojiler (Opsiyonel)</Label>
                <Textarea
                  id="skills"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="Örn: React, JavaScript, Python, Git"
                  className="mt-1 h-32"
                />
              </div>

              <div>
                <Label htmlFor="style">CV Stili</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standart</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="creative">Yaratıcı</SelectItem>
                    <SelectItem value="professional">Profesyonel</SelectItem>
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
                disabled={generateCVMutation.isPending}
                className="w-full mt-4"
                size="lg"
              >
                {generateCVMutation.isPending ? 'Oluşturuluyor...' : 'CV Oluştur'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {generatedCV && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Oluşturulan CV</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={copyCV}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Kopyala
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={downloadCV}
                >
                  <Download className="h-4 w-4 mr-2" />
                  İndir
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="prose prose-sm max-w-none whitespace-pre-line">
                {generatedCV}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}