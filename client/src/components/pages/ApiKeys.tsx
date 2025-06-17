import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ChevronDown, Key, Trash2, Eye, EyeOff } from "lucide-react";

interface ApiKey {
  id: number;
  title: string;
  service: string;
  isDefault: boolean;
  createdAt: string;
  maskedKey: string;
}

export default function ApiKeys() {
  const [service, setService] = useState('openai');
  const [title, setTitle] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [organization, setOrganization] = useState('');
  const [isDefault, setIsDefault] = useState('1');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showKey, setShowKey] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch API keys
  const { data: apiKeys = [], isLoading } = useQuery<ApiKey[]>({
    queryKey: ['/api/api-keys'],
    retry: false,
  });

  // Add API key mutation
  const addApiKeyMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/api-keys", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/api-keys'] });
      toast({
        title: "Başarılı",
        description: "API Key başarıyla eklendi",
      });
      // Reset form
      setTitle('');
      setApiKey('');
      setOrganization('');
      setTermsAccepted(false);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Oturum Süresi Doldu",
          description: "Tekrar giriş yapılıyor...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Hata",
        description: error.message || "API Key eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Delete API key mutation
  const deleteApiKeyMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/api-keys/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/api-keys'] });
      toast({
        title: "Başarılı",
        description: "API Key başarıyla silindi",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "API Key silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !apiKey || !termsAccepted) {
      toast({
        title: "Hata",
        description: "Lütfen tüm gerekli alanları doldurun ve şartları kabul edin.",
        variant: "destructive",
      });
      return;
    }

    addApiKeyMutation.mutate({
      service,
      title,
      apiKey,
      organization: service === 'openai' ? organization : undefined,
      isDefault: isDefault === '1'
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Bu API Key'i silmek istediğinizden emin misiniz?")) {
      deleteApiKeyMutation.mutate(id);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Add API Key Form - Left Side */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Yeni API Key Ekle
                </CardTitle>
                <Button variant="outline" size="sm">
                  Kendi API Keylerim
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Service Selection */}
                <div>
                  <Label htmlFor="service">
                    Servis Kategorisi <span className="text-red-500">*</span>
                  </Label>
                  <Select value={service} onValueChange={setService}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ai_providers" disabled className="font-semibold text-primary">
                        — AI Sağlayıcıları —
                      </SelectItem>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="gemini">Google AI / Gemini</SelectItem>
                      <SelectItem value="perplexity">Perplexity</SelectItem>
                      <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                      <SelectItem value="runware">Runware</SelectItem>
                      <SelectItem value="deepl">DeepL</SelectItem>
                      <SelectItem value="replicate">Replicate</SelectItem>
                      <SelectItem value="stability_ai">Stability AI</SelectItem>
                      <SelectItem value="hugging_face">Hugging Face</SelectItem>
                      <SelectItem value="google_services" disabled className="font-semibold text-primary mt-2">
                        — Google Servisleri —
                      </SelectItem>
                      <SelectItem value="google_search">Google Search API</SelectItem>
                      <SelectItem value="google_maps">Google Maps API</SelectItem>
                      <SelectItem value="google_places">Google Places API</SelectItem>
                      <SelectItem value="google_geocoding">Google Geocoding API</SelectItem>
                      <SelectItem value="google_directions">Google Directions API</SelectItem>
                      <SelectItem value="google_streetview">Google Street View API</SelectItem>
                      <SelectItem value="google_firebase">Firebase APIs</SelectItem>
                      <SelectItem value="google_cloud">Google Cloud Platform</SelectItem>
                      <SelectItem value="google_translate">Google Translate API</SelectItem>
                      <SelectItem value="google_youtube">YouTube Data API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* API Key Title */}
                <div>
                  <Label htmlFor="title">
                    API Key ismi <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Lütfen API keyinizi tanımlamak için bir isim giriniz"
                    maxLength={255}
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Bu isim içerik oluşturma sırasında kullanmak istediğiniz API keyi seçmeniz için kullanılacaktır.
                  </p>
                </div>

                {/* API Key */}
                <div>
                  <Label htmlFor="api_key">
                    API Key <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="api_key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Lütfen API keyinizi giriniz"
                    maxLength={255}
                    required
                  />
                  {service === 'openai' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Bu bilgiye{" "}
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        OpenAI API Keys <i className="fas fa-external-link-alt text-xs"></i>
                      </a>{" "}
                      sayfasından ulaşabilirsiniz. Daha sonra değiştirilemez.
                    </p>
                  )}
                  {service === 'gemini' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Bu bilgiye{" "}
                      <a
                        href="https://aistudio.google.com/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Gemini API Keys <i className="fas fa-external-link-alt text-xs"></i>
                      </a>{" "}
                      sayfasından ulaşabilirsiniz. Daha sonra değiştirilemez.
                    </p>
                  )}
                  {service === 'anthropic' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Bu bilgiye{" "}
                      <a
                        href="https://console.anthropic.com/dashboard"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Anthropic Console <i className="fas fa-external-link-alt text-xs"></i>
                      </a>{" "}
                      sayfasından ulaşabilirsiniz. Claude AI modelleri için gereklidir.
                    </p>
                  )}
                  {service === 'perplexity' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Bu bilgiye{" "}
                      <a
                        href="https://www.perplexity.ai/settings/api"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Perplexity API Settings <i className="fas fa-external-link-alt text-xs"></i>
                      </a>{" "}
                      sayfasından ulaşabilirsiniz. Perplexity AI arama için gereklidir.
                    </p>
                  )}
                  {service === 'elevenlabs' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Bu bilgiye{" "}
                      <a
                        href="https://elevenlabs.io/app/speech-synthesis"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        ElevenLabs Platform <i className="fas fa-external-link-alt text-xs"></i>
                      </a>{" "}
                      sayfasından ulaşabilirsiniz. Ses sentezi ve dubbing için gereklidir.
                    </p>
                  )}
                  {service === 'runware' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Bu bilgiye{" "}
                      <a
                        href="https://runware.ai/dashboard"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Runware Dashboard <i className="fas fa-external-link-alt text-xs"></i>
                      </a>{" "}
                      sayfasından ulaşabilirsiniz. AI görsel üretimi için gereklidir.
                    </p>
                  )}
                  {service === 'deepl' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Bu bilgiye{" "}
                      <a
                        href="https://www.deepl.com/pro-api"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        DeepL API <i className="fas fa-external-link-alt text-xs"></i>
                      </a>{" "}
                      sayfasından ulaşabilirsiniz. Profesyonel çeviri hizmetleri için gereklidir.
                    </p>
                  )}
                  {service === 'replicate' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Bu bilgiye{" "}
                      <a
                        href="https://replicate.com/account/api-tokens"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Replicate API Tokens <i className="fas fa-external-link-alt text-xs"></i>
                      </a>{" "}
                      sayfasından ulaşabilirsiniz. Açık kaynak AI modelleri için gereklidir.
                    </p>
                  )}
                  {service === 'stability_ai' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Bu bilgiye{" "}
                      <a
                        href="https://platform.stability.ai/account/keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Stability AI Platform <i className="fas fa-external-link-alt text-xs"></i>
                      </a>{" "}
                      sayfasından ulaşabilirsiniz. Stable Diffusion görsel üretimi için gereklidir.
                    </p>
                  )}
                  {service === 'hugging_face' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Bu bilgiye{" "}
                      <a
                        href="https://huggingface.co/settings/tokens"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Hugging Face Tokens <i className="fas fa-external-link-alt text-xs"></i>
                      </a>{" "}
                      sayfasından ulaşabilirsiniz. Hugging Face Hub modelleri için gereklidir.
                    </p>
                  )}
                  {service === 'google_search' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Bu bilgiye{" "}
                      <a
                        href="https://console.developers.google.com/apis/credentials"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Google Cloud Console <i className="fas fa-external-link-alt text-xs"></i>
                      </a>{" "}
                      sayfasından Custom Search JSON API aktif ederek ulaşabilirsiniz. Güncel bilgi toplama için gereklidir.
                    </p>
                  )}
                  {service === 'google_maps' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Bu bilgiye{" "}
                      <a
                        href="https://console.cloud.google.com/apis/library/maps-backend.googleapis.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Google Maps Platform <i className="fas fa-external-link-alt text-xs"></i>
                      </a>{" "}
                      sayfasından Maps JavaScript API aktif ederek ulaşabilirsiniz. Harita entegrasyonu için gereklidir.
                    </p>
                  )}
                  {service === 'google_places' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Bu bilgiye{" "}
                      <a
                        href="https://console.cloud.google.com/apis/library/places-backend.googleapis.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Google Places API <i className="fas fa-external-link-alt text-xs"></i>
                      </a>{" "}
                      sayfasından Places API aktif ederek ulaşabilirsiniz. Mekan bilgileri için gereklidir.
                    </p>
                  )}
                  {service === 'google_geocoding' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Bu bilgiye{" "}
                      <a
                        href="https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Google Geocoding API <i className="fas fa-external-link-alt text-xs"></i>
                      </a>{" "}
                      sayfasından Geocoding API aktif ederek ulaşabilirsiniz. Adres-koordinat dönüşümü için gereklidir.
                    </p>
                  )}
                  {service === 'google_directions' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Bu bilgiye{" "}
                      <a
                        href="https://console.cloud.google.com/apis/library/directions-backend.googleapis.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Google Directions API <i className="fas fa-external-link-alt text-xs"></i>
                      </a>{" "}
                      sayfasından Directions API aktif ederek ulaşabilirsiniz. Yol tarifi için gereklidir.
                    </p>
                  )}
                  {service === 'google_streetview' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Bu bilgiye{" "}
                      <a
                        href="https://console.cloud.google.com/apis/library/street-view-image-backend.googleapis.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Google Street View API <i className="fas fa-external-link-alt text-xs"></i>
                      </a>{" "}
                      sayfasından Street View Static API aktif ederek ulaşabilirsiniz. Sokak görüntüleri için gereklidir.
                    </p>
                  )}
                  {service === 'google_firebase' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Bu bilgiye{" "}
                      <a
                        href="https://console.firebase.google.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Firebase Console <i className="fas fa-external-link-alt text-xs"></i>
                      </a>{" "}
                      sayfasından Firebase projenizi oluşturup API anahtarınızı alabilirsiniz. Realtime Database, Cloud Firestore, FCM için gereklidir.
                    </p>
                  )}
                  {service === 'google_cloud' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Bu bilgiye{" "}
                      <a
                        href="https://console.cloud.google.com/apis/credentials"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Google Cloud Console <i className="fas fa-external-link-alt text-xs"></i>
                      </a>{" "}
                      sayfasından ilgili Cloud API'yi aktif ederek ulaşabilirsiniz. Compute Engine, BigQuery, Pub/Sub vb. için gereklidir.
                    </p>
                  )}
                  {service === 'google_translate' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Bu bilgiye{" "}
                      <a
                        href="https://console.cloud.google.com/apis/library/translate.googleapis.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Google Translate API <i className="fas fa-external-link-alt text-xs"></i>
                      </a>{" "}
                      sayfasından Cloud Translation API aktif ederek ulaşabilirsiniz. Dil çevirisi için gereklidir.
                    </p>
                  )}
                  {service === 'google_youtube' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Bu bilgiye{" "}
                      <a
                        href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        YouTube Data API <i className="fas fa-external-link-alt text-xs"></i>
                      </a>{" "}
                      sayfasından YouTube Data API v3 aktif ederek ulaşabilirsiniz. YouTube verilerine erişim için gereklidir.
                    </p>
                  )}
                </div>

                {/* Organization (OpenAI only) */}
                {service === 'openai' && (
                  <div>
                    <Label htmlFor="organization">Organization</Label>
                    <Input
                      id="organization"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="Lütfen organization bilginizi giriniz (Mecburi değildir)"
                      maxLength={255}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Bu bilgiye{" "}
                      <a
                        href="https://platform.openai.com/account/organization"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        OpenAI Organization <i className="fas fa-external-link-alt text-xs"></i>
                      </a>{" "}
                      sayfasından ulaşabilirsiniz. Daha sonra değiştirilemez.
                    </p>
                  </div>
                )}

                {/* Default API Key */}
                <div>
                  <Label>Varsayılan API Key</Label>
                  <p className="text-sm text-muted-foreground mt-1 mb-3">
                    İçerik oluşturma formunda seçili olarak gelsin mi?
                  </p>
                  <RadioGroup value={isDefault} onValueChange={setIsDefault}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="default-yes" />
                      <Label htmlFor="default-yes">Evet</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="0" id="default-no" />
                      <Label htmlFor="default-no">Hayır</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Terms */}
                <div>
                  <Label>API Key Şartları</Label>
                  <div className="border rounded-md p-4 h-48 overflow-y-auto bg-muted/30 mt-2 mb-3">
                    <div className="space-y-4 text-sm">
                      <div>
                        <h4 className="font-semibold mb-2">OpenAI API Key Şartları</h4>
                        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                          <li>Ücretsiz API keyler kullanılmamalıdır.</li>
                          <li>
                            Tek tek makale yazdırmak istiyorsanız <strong>minimum tier 1</strong>, toplu makale yazdırmak istiyorsanız <strong>minimum tier 2</strong> API Key kullanılmalıdır.
                          </li>
                          <li>Şartları sağlamayan API key kullanmanız durumunda içerik oluşturma işlemlerinde hatalar meydana gelecektir.</li>
                          <li>Eğer kullandığınız pakete API hizmeti dahilse bu bölümde herhangi bir API key girmeniz gerekmemektedir.</li>
                        </ol>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Gemini API Key Şartları</h4>
                        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                          <li>Ücretsiz API keyler kullanılmamalıdır.</li>
                          <li>Ücretsiz API keylerin limitleri makale yazdırmak için yeterli değildir.</li>
                          <li>Şartları sağlamayan API key kullanmanız durumunda içerik oluşturma işlemlerinde hatalar meydana gelecektir.</li>
                          <li>Eğer kullandığınız pakete API hizmeti dahilse bu bölümde herhangi bir API key girmeniz gerekmemektedir.</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                    />
                    <Label htmlFor="terms">
                      API keyin belirtilen şartlara uyduğunu kabul ediyorum.
                    </Label>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={addApiKeyMutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    {addApiKeyMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Kaydediliyor...
                      </>
                    ) : (
                      'Kaydet'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section - Right Side */}
        <div className="lg:col-span-5">
          <Card>
            <Collapsible defaultOpen>
              <CollapsibleTrigger asChild>
                <CardHeader className="border-b cursor-pointer hover:bg-muted/30">
                  <div className="flex items-center justify-between">
                    <CardTitle>API Keyler Hakkında Merak Edilenler</CardTitle>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-6">
                  <div className="space-y-4 text-sm">
                    {[
                      {
                        q: "Eklediğim API keylerin güvenliğini nasıl sağlıyorsunuz?",
                        a: "Eklenen API keyler encrypt edilerek (şifrelenerek) saklanmaktadır. Yani key bilgileri asla görüntülenememektedir."
                      },
                      {
                        q: "OpenAI'da 5$ değerinde ücretsiz hesabım var. Bu hesaba ait API keyleri kullanabilir miyim?",
                        a: "Ücretsiz OpeanAI API keylerin limitleri olduğu için bu keyler ile yapılan işlemlerde hatalar ortaya çıkabilmektedir. Bu sebeple ücretsiz keyler contety'de kullanılamamaktadır."
                      },
                      {
                        q: "Makalelerimi teker teker yazdırmak istiyorum, bunun için OpenAI Tier 1 API key yeterli mi?",
                        a: "Evet, tek tek makale yazdırmak için OpenAI tier 1 API keyler kullanılabilir."
                      },
                      {
                        q: "Makalelerimi teker teker yazdırmak istiyorum, bunun için ücretsiz Gemini API key yeterli mi?",
                        a: "Ücretsiz Gemini API keylerin limitleri yeterli olmadığı için hatalar meydana gelmektedir. Bu nedenle makale yazdırmak için ücretli Gemini API keyler kullanılmalıdır."
                      },
                      {
                        q: "Toplu makale yazdırmak istiyorum, bunun için OpenAI Tier 1 API key yeterli mi?",
                        a: "OpenAI Tier 1 API keylerin limitleri toplu işlemlerde yeterli olmadığı için hatalar meydana gelebilmektedir. Bu nedenle toplu makale yazdırmak için minimum tier 2 API keyler kullanılmalıdır."
                      }
                    ].map((faq, index) => (
                      <div key={index}>
                        <h4 className="font-semibold mb-2">{faq.q}</h4>
                        <p className="text-muted-foreground mb-3">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* My API Keys List */}
          {apiKeys.length > 0 && (
            <Card className="mt-6">
              <CardHeader className="border-b">
                <CardTitle>Mevcut API Keyler</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {apiKeys.map((key) => (
                    <div key={key.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{key.title}</h4>
                          {key.isDefault && (
                            <Badge variant="default" className="text-xs">Varsayılan</Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(key.id)}
                          disabled={deleteApiKeyMutation.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div>
                          <Badge variant="outline" className="mr-2">
                            {key.service === 'openai' ? 'OpenAI' : 'Google Gemini'}
                          </Badge>
                          <span>{new Date(key.createdAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {showKey === key.id ? key.maskedKey : '••••••••••••'}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                          >
                            {showKey === key.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}