import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Trash2, Edit, Key, ChevronDown, ExternalLink, Eye, EyeOff } from "lucide-react";

interface ApiKey {
  id: string;
  service: 'openai' | 'gemini';
  title: string;
  apiKey: string;
  organization?: string;
  isDefault: boolean;
  createdAt: string;
}

export default function Settings() {
  const [selectedService, setSelectedService] = useState<'openai' | 'gemini'>('gemini');
  const [showApiKey, setShowApiKey] = useState(false);
  const [faqExpanded, setFaqExpanded] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: apiKeys = [], isLoading: keysLoading } = useQuery({
    queryKey: ['/api/api-keys'],
    enabled: true,
  });

  const [formData, setFormData] = useState({
    service: 'gemini' as 'openai' | 'gemini',
    title: '',
    apiKey: '',
    organization: '',
    isDefault: true,
    apiKeyConfirm: false,
  });

  const addApiKeyMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/api-keys', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/api-keys'] });
      setFormData({
        service: 'gemini',
        title: '',
        apiKey: '',
        organization: '',
        isDefault: true,
        apiKeyConfirm: false,
      });
      toast({
        title: "API Key Eklendi",
        description: "API anahtarınız başarıyla kaydedildi.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "API anahtarı eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const response = await apiRequest('DELETE', `/api/api-keys/${keyId}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/api-keys'] });
      toast({
        title: "API Key Silindi",
        description: "API anahtarınız başarıyla silindi.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "API anahtarı silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.apiKey || !formData.apiKeyConfirm) {
      toast({
        title: "Eksik Bilgiler",
        description: "Lütfen tüm gerekli alanları doldurun ve şartları kabul edin.",
        variant: "destructive",
      });
      return;
    }

    addApiKeyMutation.mutate(formData);
  };

  if (keysLoading) {
    return (
      <div className="content-wrapper">
        <div className="container-xxl flex-grow-1 container-p-y">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7">
                <div className="h-64 bg-slate-200 rounded"></div>
              </div>
              <div className="lg:col-span-5">
                <div className="h-64 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <div className="container-xxl flex-grow-1 container-p-y">
        
        {/* Existing API Keys List */}
        {apiKeys.length > 0 && (
          <div className="mb-6">
            <div className="card">
              <div className="card-header border-bottom d-flex flex-row align-items-center justify-content-between pt-3 pb-2">
                <h5 className="m-0 p-0">Mevcut API Keyler</h5>
              </div>
              <div className="card-body pt-4">
                <div className="table-responsive">
                  <table className="table table-borderless">
                    <thead>
                      <tr>
                        <th>Servis</th>
                        <th>İsim</th>
                        <th>API Key</th>
                        <th>Varsayılan</th>
                        <th>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiKeys.map((key: ApiKey) => (
                        <tr key={key.id}>
                          <td>
                            <span className={`badge ${key.service === 'openai' ? 'bg-primary' : 'bg-success'}`}>
                              {key.service === 'openai' ? 'OpenAI' : 'Gemini'}
                            </span>
                          </td>
                          <td>{key.title}</td>
                          <td>
                            <code className="text-muted">{key.apiKey.substring(0, 8)}...{key.apiKey.substring(key.apiKey.length - 8)}</code>
                          </td>
                          <td>
                            {key.isDefault && <span className="badge bg-warning">Varsayılan</span>}
                          </td>
                          <td>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteApiKeyMutation.mutate(key.id)}
                              className="text-danger"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="row">
          <div className="col-md-6 col-lg-7 mb-4">
            <div className="card">
              <div className="card-header border-bottom d-flex flex-row align-items-center justify-content-between pt-3 pb-2">
                <h5 className="m-0 p-0">Yeni API Key Ekle</h5>
                <a className="btn btn-label-primary btn-sm m-0" href="#" title="Kendi API Keylerim">Kendi API Keylerim</a>
              </div>

              <div className="card-body pt-4">
                <form onSubmit={handleSubmit} spellCheck="false">
                  <div className="mb-4">
                    <Label className="form-label" htmlFor="third-party-service">
                      Yapay Zeka Servisi <span className="text-danger">*</span>
                    </Label>
                    <Select 
                      value={formData.service} 
                      onValueChange={(value: 'openai' | 'gemini') => {
                        setFormData({...formData, service: value});
                        setSelectedService(value);
                      }}
                    >
                      <SelectTrigger className="form-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="gemini">Google Gemini</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="mb-4">
                    <Label className="form-label" htmlFor="title">
                      API Key ismi <span className="text-danger">*</span>
                    </Label>
                    <Input
                      name="title"
                      className="form-control"
                      type="text"
                      id="title"
                      placeholder="Lütfen API keyinizi tanımlamak için bir isim giriniz"
                      maxLength={255}
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                    <div className="form-text mt-1">Bu isim içerik oluşturma sırasında kullanmak istediğiniz API keyi seçmeniz için kullanılacaktır.</div>
                  </div>

                  <div className="mb-4">
                    <Label className="form-label" htmlFor="api_key">
                      API Key <span className="text-danger">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        name="api_key"
                        className="form-control pr-10"
                        type={showApiKey ? "text" : "password"}
                        id="api_key"
                        placeholder="Lütfen API keyinizi giriniz"
                        maxLength={255}
                        required
                        value={formData.apiKey}
                        onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {selectedService === 'openai' && (
                      <div className="form-text mt-1 service-specs">
                        Bu bilgiye <a href="https://platform.openai.com/api-keys" className="text-muted fw-medium" target="_blank" title="OpenAI API Keys">
                          OpenAI API Keys <ExternalLink className="inline h-3 w-3" />
                        </a> sayfasından ulaşabilirsiniz. Daha sonra değiştirilemez.
                      </div>
                    )}
                    {selectedService === 'gemini' && (
                      <div className="form-text mt-1 service-specs">
                        Bu bilgiye <a href="https://aistudio.google.com/apikey" className="text-muted fw-medium" target="_blank" title="Gemini API Keys">
                          Gemini API Keys <ExternalLink className="inline h-3 w-3" />
                        </a> sayfasından ulaşabilirsiniz. Daha sonra değiştirilemez.
                      </div>
                    )}
                  </div>

                  {selectedService === 'openai' && (
                    <div className="third-party-service-cont mb-4">
                      <Label className="form-label" htmlFor="organization">
                        Organization
                      </Label>
                      <Input
                        name="organization"
                        className="form-control"
                        type="text"
                        id="organization"
                        placeholder="Lütfen organization bilginizi giriniz (Mecburi değildir)"
                        maxLength={255}
                        value={formData.organization}
                        onChange={(e) => setFormData({...formData, organization: e.target.value})}
                      />
                      <div className="form-text mt-1">
                        Bu bilgiye <a href="https://platform.openai.com/account/organization" target="_blank" className="text-muted fw-medium" title="OpenAI Organization">
                          OpenAI Organization <ExternalLink className="inline h-3 w-3" />
                        </a> sayfasından ulaşabilirsiniz. Daha sonra değiştirilemez.
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <div className="form-label">Varsayılan API Key</div>
                    <div className="form-text mb-3 mt-n2">İçerik oluşturma formunda seçili olarak gelsin mi?</div>

                    <div className="form-check form-check-inline">
                      <input 
                        className="form-check-input" 
                        type="radio" 
                        name="is_default" 
                        id="is_default1" 
                        value="1" 
                        checked={formData.isDefault}
                        onChange={() => setFormData({...formData, isDefault: true})}
                      />
                      <label className="form-check-label" htmlFor="is_default1">Evet</label>
                    </div>

                    <div className="form-check form-check-inline">
                      <input 
                        className="form-check-input" 
                        type="radio" 
                        name="is_default" 
                        id="is_default0" 
                        value="0"
                        checked={!formData.isDefault}
                        onChange={() => setFormData({...formData, isDefault: false})}
                      />
                      <label className="form-check-label" htmlFor="is_default0">Hayır</label>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="form-label">API Key Şartları</div>

                    <div className="border h-px-200 overflow-auto p-2 rounded mb-3 text-muted" style={{height: "200px"}}>
                      <div className="fw-bold mb-2">OpenAI API Key Şartları</div>
                      <ol className="ps-4">
                        <li>Ücretsiz API keyler kullanılmamalıdır.</li>
                        <li>Tek tek makale yazdırmak istiyorsanız <strong>minimum tier 1</strong>, toplu makale yazdırmak istiyorsanız <strong>minimum tier 2</strong> API Key kullanılmalıdır.</li>
                        <li>Şartları sağlamayan API key kullanmanız durumunda içerik oluşturma işlemlerinde hatalar meydana gelecektir.</li>
                        <li>Eğer kullandığınız pakete API hizmeti dahilse bu bölümde herhangi bir API key girmeniz gerekmemektedir.</li>
                      </ol>

                      <div className="fw-bold mb-2">Gemini API Key Şartları</div>
                      <ol className="ps-4">
                        <li>Ücretsiz API keyler kullanılmamalıdır.</li>
                        <li>Ücretsiz API keylerin limitleri makale yazdırmak için yeterli değildir.</li>
                        <li>Şartları sağlamayan API key kullanmanız durumunda içerik oluşturma işlemlerinde hatalar meydana gelecektir.</li>
                        <li>Eğer kullandığınız pakete API hizmeti dahilse bu bölümde herhangi bir API key girmeniz gerekmemektedir.</li>
                      </ol>
                    </div>

                    <div className="form-check">
                      <Checkbox
                        id="api_key_confirm"
                        checked={formData.apiKeyConfirm}
                        onCheckedChange={(checked) => setFormData({...formData, apiKeyConfirm: !!checked})}
                      />
                      <label className="form-check-label ms-2" htmlFor="api_key_confirm">
                        API keyin belirtilen şartlara uyduğunu kabul ediyorum.
                      </label>
                    </div>
                  </div>

                  <div className="mb-4">
                    <Button 
                      className="btn btn-primary ib-spn-btn mt-3" 
                      type="submit"
                      disabled={addApiKeyMutation.isPending}
                    >
                      <span className="btn-label">Kaydet</span>
                      {addApiKeyMutation.isPending && (
                        <span className="spinner-border ms-1" role="status" aria-hidden="true"></span>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-5">
            <div className="card mb-4">
              <div 
                className="card-header border-bottom py-3 d-flex flex-row align-items-center justify-content-between cursor-pointer" 
                onClick={() => setFaqExpanded(!faqExpanded)}
                role="button" 
                aria-expanded={faqExpanded}
              >
                <h5 className="m-0 p-0">API Keyler Hakkında Merak Edilenler</h5>
                <ChevronDown className={`h-5 w-5 transition-transform ${faqExpanded ? 'rotate-180' : ''}`} />
              </div>

              {faqExpanded && (
                <div className="card-body">
                  <ol className="ps-4">
                    <li>
                      <div className="fw-bold mb-2">Eklediğim API keylerin güvenliğini nasıl sağlıyorsunuz?</div>
                      <div className="mb-3">Eklenen API keyler encrypt edilerek (şifrelenerek) saklanmaktadır. Yani key bilgileri asla görüntülenememektedir.</div>
                    </li>

                    <li>
                      <div className="fw-bold mb-2">OpenAI'da 5$ değerinde ücretsiz hesabım var. Bu hesaba ait API keyleri kullanabilir miyim?</div>
                      <div className="mb-3">Ücretsiz OpeanAI API keylerin limitleri olduğu için bu keyler ile yapılan işlemlerde hatalar ortaya çıkabilmektedir. Bu sebeple ücretsiz keyler contety'de kullanılamamaktadır.</div>
                    </li>

                    <li>
                      <div className="fw-bold mb-2">Makalelerimi teker teker yazdırmak istiyorum, bunun için <u>OpenAI Tier 1 API key</u> yeterli mi?</div>
                      <div className="mb-3">Evet, tek tek makale yazdırmak için OpenAI tier 1 API keyler kullanılabilir.</div>
                    </li>

                    <li>
                      <div className="fw-bold mb-2">Makalelerimi teker teker yazdırmak istiyorum, bunun için <u>ücretsiz Gemini API key</u> yeterli mi?</div>
                      <div className="mb-3">Ücretsiz Gemini API keylerin limitleri yeterli olmadığı için hatalar meydana gelmektedir. Bu nedenle makale yazdırmak için <strong>ücretli Gemini API keyler</strong> kullanılmalıdır.</div>
                    </li>

                    <li>
                      <div className="fw-bold mb-2">Toplu makale yazdırmak istiyorum, bunun için <u>OpenAI Tier 1 API key</u> yeterli mi?</div>
                      <div className="mb-3">OpenAI Tier 1 API keylerin limitleri toplu işlemlerde yeterli olmadığı için hatalar meydana gelebilmektedir. Bu nedenle toplu makale yazdırmak için <strong>minimum tier 2</strong> API keyler kullanılmalıdır.</div>
                    </li>

                    <li>
                      <div className="fw-bold mb-2">Toplu makale yazdırmak istiyorum, bunun için <u>ücretsiz Gemini API key</u> yeterli mi?</div>
                      <div className="mb-3">Ücretsiz Gemini API keylerin limitleri toplu işlemlerde yeterli olmadığı için hatalar meydana gelmektedir. Bu nedenle toplu makale yazdırmak için <strong>ücretli Gemini API keyler</strong> kullanılmalıdır.</div>
                    </li>

                    <li>
                      <div className="fw-bold mb-2">Farklı müşterilerimize ait birden fazla API keyim var. Bunların hepsini ekleyip içerik oluşturma işlemi sırasında istediğimi seçebilir miyim?</div>
                      <div className="mb-3">Evet, farklı OpenAI veya Gemini hesaplarına ait birden fazla API keyi ekleyebilir ve hangisiyle içerik oluşturulacağını belirleyebilirsiniz.</div>
                    </li>

                    <li>
                      <div className="fw-bold mb-2">Eklediğim API keyleri silebilir miyim?</div>
                      <div className="mb-3">Evet, istediğiniz zaman silebilirsiniz. Ayrıca OpenAI ve Gemini hesabınızdan da silme işlemini gerçekleştirebilirsiniz.</div>
                    </li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="content-footer footer bg-footer-theme">
        <div className="d-flex flex-wrap justify-content-between py-2 flex-md-row flex-column container-fluid">
          <div className="mb-2 mb-md-0">
            © 2025 <a href="#" target="_blank">AI İçerik Paneli</a> v2.0
          </div>
        </div>
      </footer>
    </div>
  );
}