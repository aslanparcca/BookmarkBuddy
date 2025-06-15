import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Mic, MicOff, Volume2, Download, Play, Pause, RotateCcw, Languages, FileText, Zap } from "lucide-react";

interface VoiceToTextProps {
  setLoading: (loading: boolean) => void;
}

interface RecognitionResult {
  transcript: string;
  confidence: number;
  language: string;
  duration: number;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function VoiceToText({ setLoading }: VoiceToTextProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [finalContent, setFinalContent] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("tr-TR");
  const [contentType, setContentType] = useState("blog");
  const [aiEnhancement, setAiEnhancement] = useState(true);
  const [confidence, setConfidence] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout>();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const languages = [
    { code: "tr-TR", name: "Türkçe", flag: "🇹🇷" },
    { code: "en-US", name: "English (US)", flag: "🇺🇸" },
    { code: "en-GB", name: "English (UK)", flag: "🇬🇧" },
    { code: "de-DE", name: "Deutsch", flag: "🇩🇪" },
    { code: "fr-FR", name: "Français", flag: "🇫🇷" },
    { code: "es-ES", name: "Español", flag: "🇪🇸" },
    { code: "it-IT", name: "Italiano", flag: "🇮🇹" },
    { code: "pt-BR", name: "Português", flag: "🇧🇷" },
    { code: "ru-RU", name: "Русский", flag: "🇷🇺" },
    { code: "ar-SA", name: "العربية", flag: "🇸🇦" },
    { code: "zh-CN", name: "中文", flag: "🇨🇳" },
    { code: "ja-JP", name: "日本語", flag: "🇯🇵" },
    { code: "ko-KR", name: "한국어", flag: "🇰🇷" }
  ];

  const enhanceContentMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/enhance-voice-content', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (response) => {
      setFinalContent(response.content || "");
      toast({
        title: "Başarılı",
        description: "İçerik AI ile geliştirildi",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "İçerik geliştirme sırasında hata oluştu",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = selectedLanguage;

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
            setConfidence(result[0].confidence * 100);
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        setTranscript(prev => prev + finalTranscript + interimTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Ses Tanıma Hatası",
          description: "Mikrofon izni kontrol edin veya farklı tarayıcı deneyin",
          variant: "destructive"
        });
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [selectedLanguage]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.lang = selectedLanguage;
        recognitionRef.current.start();
        setIsRecording(true);
        setRecordingDuration(0);

        // Start timer
        timerRef.current = setInterval(() => {
          setRecordingDuration(prev => prev + 1);
        }, 1000);

        toast({
          title: "Kayıt Başladı",
          description: "Konuşmaya başlayabilirsiniz",
        });
      }

      // Start audio recording for playback
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start();

    } catch (error) {
      toast({
        title: "Mikrofon Erişimi",
        description: "Mikrofon izni gerekli",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    toast({
      title: "Kayıt Durduruldu",
      description: `${Math.floor(recordingDuration / 60)}:${(recordingDuration % 60).toString().padStart(2, '0')} süre kaydedildi`,
    });
  };

  const clearTranscript = () => {
    setTranscript("");
    setFinalContent("");
    setRecordingDuration(0);
    setConfidence(0);
  };

  const enhanceWithAI = () => {
    if (!transcript.trim()) {
      toast({
        title: "Uyarı",
        description: "Önce ses kaydı yapın",
        variant: "destructive"
      });
      return;
    }

    enhanceContentMutation.mutate({
      transcript,
      language: selectedLanguage,
      contentType,
      enhance: aiEnhancement
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadContent = () => {
    const content = finalContent || transcript;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-content-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const selectedLang = languages.find(lang => lang.code === selectedLanguage);

  return (
    <div className="pb-20">
      <div className="p-2 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Mic className="w-8 h-8 text-purple-600" />
          <h1 className="text-2xl font-bold">Sesli İçerik Oluşturucu</h1>
          <Badge variant="outline" className="text-purple-600 border-purple-600">
            <Languages className="w-3 h-3 mr-1" />
            Çok Dilli
          </Badge>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recording Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Ses Kaydı Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="language">Konuşma Dili</Label>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            <span className="flex items-center gap-2">
                              <span>{lang.flag}</span>
                              <span>{lang.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="contentType">İçerik Türü</Label>
                    <Select value={contentType} onValueChange={setContentType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blog">Blog Makalesi</SelectItem>
                        <SelectItem value="notes">Not Alma</SelectItem>
                        <SelectItem value="email">E-posta</SelectItem>
                        <SelectItem value="social">Sosyal Medya</SelectItem>
                        <SelectItem value="script">Sunum/Script</SelectItem>
                        <SelectItem value="interview">Röportaj</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Recording Controls */}
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                        : 'bg-purple-500 hover:bg-purple-600'
                    }`}>
                      <Button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={enhanceContentMutation.isPending}
                        className="w-full h-full bg-transparent hover:bg-transparent border-0 shadow-none"
                      >
                        {isRecording ? (
                          <MicOff className="w-12 h-12 text-white" />
                        ) : (
                          <Mic className="w-12 h-12 text-white" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-lg font-mono">
                      {formatDuration(recordingDuration)}
                    </div>
                    
                    {selectedLang && (
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <span>{selectedLang.flag}</span>
                        <span>{selectedLang.name}</span>
                      </div>
                    )}

                    {confidence > 0 && (
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">
                          Güven Oranı: {confidence.toFixed(1)}%
                        </div>
                        <Progress value={confidence} className="h-2" />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearTranscript}
                      disabled={isRecording}
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Temizle
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadContent}
                      disabled={!transcript && !finalContent}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      İndir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Transcript */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Canlı Transkript
                  </span>
                  {isRecording && (
                    <Badge variant="destructive" className="animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full mr-1" />
                      Kaydediyor
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Konuşmaya başladığınızda metin burada görünecek..."
                  rows={8}
                  className="resize-none font-mono"
                />
                <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
                  <span>{transcript.length} karakter</span>
                  <span>{transcript.split(' ').filter(word => word.length > 0).length} kelime</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Enhancement Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  AI Geliştirme
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    Ses kayıtınız AI ile geliştirilip düzgün formatta içeriğe dönüştürülecek
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={enhanceWithAI}
                  disabled={!transcript.trim() || enhanceContentMutation.isPending}
                  className="w-full"
                >
                  {enhanceContentMutation.isPending ? "İşleniyor..." : "AI ile Geliştir"}
                </Button>
              </CardContent>
            </Card>

            {/* Enhanced Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Geliştirilmiş İçerik
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={finalContent}
                  onChange={(e) => setFinalContent(e.target.value)}
                  placeholder="AI geliştirmesi sonrası içerik burada görünecek..."
                  rows={12}
                  className="resize-none"
                />
                
                {finalContent && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                    <div className="flex items-center gap-2 text-green-700 text-sm">
                      <Zap className="w-4 h-4" />
                      <span>İçerik AI ile başarıyla geliştirildi</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Content Stats */}
            {(transcript || finalContent) && (
              <Card>
                <CardHeader>
                  <CardTitle>İçerik İstatistikleri</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Ham Transkript:</span>
                        <span className="font-medium">{transcript.length} karakter</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Kelime Sayısı:</span>
                        <span className="font-medium">{transcript.split(' ').filter(w => w.length > 0).length}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>İşlenmiş İçerik:</span>
                        <span className="font-medium">{finalContent.length} karakter</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Kayıt Süresi:</span>
                        <span className="font-medium">{formatDuration(recordingDuration)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}