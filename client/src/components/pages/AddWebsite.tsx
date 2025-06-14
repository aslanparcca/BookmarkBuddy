import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

const websiteSchema = z.object({
  type: z.string(),
  url: z.string().url("Geçerli bir URL giriniz"),
  wp_username: z.string().min(1, "WordPress kullanıcı adı gereklidir"),
  wp_app_password: z.string().min(1, "WordPress uygulama şifresi gereklidir"),
  seo_plugin: z.string(),
  woocommerce: z.string(),
  xenforo_api_key: z.string().optional(),
  xenforo_api_key_type: z.string().optional(),
  xenforo_api_user_ids: z.array(z.string()).optional(),
  xenforo_api_user_usernames: z.array(z.string()).optional(),
});

type WebsiteFormData = z.infer<typeof websiteSchema>;

interface AddWebsiteProps {
  setCurrentPage?: (page: any) => void;
}

export default function AddWebsite({ setCurrentPage }: AddWebsiteProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState("1");
  const [selectedApiKeyType, setSelectedApiKeyType] = useState("1");
  const [xfUsers, setXfUsers] = useState([{ id: "", username: "" }, { id: "", username: "" }]);

  const form = useForm<WebsiteFormData>({
    resolver: zodResolver(websiteSchema),
    defaultValues: {
      type: "1",
      url: "https://bestwebstudio.com.tr",
      wp_username: "bestwebstudio",
      wp_app_password: "poZg 5PfB gcEe rwuS 5OY6 lPba",
      seo_plugin: "yoast_seo",
      woocommerce: "0",
      xenforo_api_key: "",
      xenforo_api_key_type: "1",
      xenforo_api_user_ids: ["", ""],
      xenforo_api_user_usernames: ["", ""],
    },
  });

  const addWebsiteMutation = useMutation({
    mutationFn: async (data: WebsiteFormData) => {
      return await apiRequest("POST", "/api/websites", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      toast({
        title: "Başarılı",
        description: "Web sitesi başarıyla eklendi",
      });
      form.reset();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Hata",
        description: error.message || "Web sitesi eklenirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const addXfUser = () => {
    setXfUsers([...xfUsers, { id: "", username: "" }]);
  };

  const removeXfUser = (index: number) => {
    if (xfUsers.length > 1) {
      setXfUsers(xfUsers.filter((_, i) => i !== index));
    }
  };

  const updateXfUser = (index: number, field: "id" | "username", value: string) => {
    const updated = [...xfUsers];
    updated[index][field] = value;
    setXfUsers(updated);
  };

  const onSubmit = (data: WebsiteFormData) => {
    const submitData = {
      ...data,
      xenforo_api_user_ids: xfUsers.map(u => u.id),
      xenforo_api_user_usernames: xfUsers.map(u => u.username),
    };
    addWebsiteMutation.mutate(submitData);
  };

  return (
    <div className="content-wrapper">
      <div className="container-xxl flex-grow-1 container-p-y">
        <div className="row">
          <div className="col-md-6 col-lg-7 mb-4 mb-md-0">
            <div className="card h-100">
              <div className="card-header border-bottom d-flex flex-row align-items-center justify-content-between pt-3 pb-2">
                <h5 className="m-0 p-0 d-flex flex-row align-items-center">
                  Yeni Web Sitesi Ekle 
                  <i className="fas fa-play-circle text-xl text-gray-400 hover:text-red-600 ml-1 cursor-pointer" title="Yardım Videosu"></i>
                  <i className="fas fa-play-circle text-xl text-gray-400 hover:text-red-600 ml-1 cursor-pointer" title="Yardım Videosu"></i>
                </h5>
                <div className="d-flex flex-row align-items-center">
                  <button 
                    className="btn btn-outline-primary btn-sm" 
                    title="Web Sitelerim"
                    onClick={() => setCurrentPage && setCurrentPage('websites')}
                  >
                    Web Sitelerim
                  </button>
                </div>
              </div>

              <div className="card-body pt-4">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="type">
                      Site Türü <span className="text-red-500">*</span>
                    </label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      {...form.register("type")}
                      value={selectedType}
                      onChange={(e) => {
                        setSelectedType(e.target.value);
                        form.setValue("type", e.target.value);
                      }}
                    >
                      <option value="1">WordPress</option>
                      <option value="3">XenForo</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="url">
                      Web Sitesi URL Adresi <span className="text-red-500">*</span>
                    </label>
                    <input 
                      {...form.register("url")}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      type="text" 
                      placeholder="Lütfen web sitenizin URL adresini giriniz"
                      maxLength={255}
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      Web sitenizin adresini başında <strong>https://</strong> olacak şekilde giriniz
                    </div>
                    {form.formState.errors.url && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.url.message}</p>
                    )}
                  </div>

                  {selectedType === "1" && (
                    <div className="website-type-cont">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="wp_username">
                          <span className="mr-1">WordPress Kullanıcı Adı</span>
                          <i className="fas fa-question-circle cursor-pointer text-gray-400 text-sm ml-1"></i>
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input 
                          {...form.register("wp_username")}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          type="text"
                          placeholder="WordPress kullanıcı adınızı giriniz"
                          maxLength={255}
                        />
                        <div className="text-sm text-gray-500 mt-1">
                          WordPress yönetici panelindeki kullanıcı adınızı giriniz. Kullanıcının <strong>"Yönetici"</strong> yetkisi olması gerekmektedir.
                        </div>
                        {form.formState.errors.wp_username && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.wp_username.message}</p>
                        )}
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="wp_app_password">
                          <span className="mr-1">WordPress Uygulama Şifresi</span>
                          <i className="fas fa-question-circle cursor-pointer text-gray-400 text-sm ml-1"></i>
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input 
                          {...form.register("wp_app_password")}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          type="password"
                          placeholder="WordPress uygulama şifrenizi giriniz"
                          maxLength={255}
                        />
                        {form.formState.errors.wp_app_password && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.wp_app_password.message}</p>
                        )}
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="text-blue-600 font-bold">Not:</span> WordPress Admin → Kullanıcılar → Profil → Uygulama Şifreleri bölümünden oluşturabilirsini
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="seo_plugin">
                          SEO Eklentisi <span className="text-red-500">*</span>
                        </label>
                        <select 
                          {...form.register("seo_plugin")}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="yok">Yok</option>
                          <option value="rank_math_seo">Rank Math SEO</option>
                          <option value="yoast_seo">Yoast SEO</option>
                        </select>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="woocommerce">
                          WooCommerce <span className="text-red-500">*</span>
                        </label>
                        <select 
                          {...form.register("woocommerce")}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="1">Kullanıyorum</option>
                          <option value="0">Kullanmıyorum</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* SEO Plugin Codes Section */}
                  {selectedType === "1" && (form.watch("seo_plugin") === "rank_math_seo" || form.watch("seo_plugin") === "yoast_seo") && (
                    <div className="mt-4">
                      <div className="nav-align-top">
                        <ul className="nav nav-pills mb-3 flex space-x-2" role="tablist">
                          <li className="nav-item" role="presentation">
                            <button 
                              type="button" 
                              className={`px-3 py-1 text-sm rounded ${form.watch("seo_plugin") === "rank_math_seo" ? "bg-purple-100 text-purple-700 border border-purple-300" : "bg-gray-100 text-gray-600"}`}
                              onClick={() => {/* Rank Math tab logic */}}
                            >
                              Rank Math SEO
                            </button>
                          </li>
                          <li className="nav-item" role="presentation">
                            <button 
                              type="button" 
                              className={`px-3 py-1 text-sm rounded ${form.watch("seo_plugin") === "yoast_seo" ? "bg-pink-100 text-pink-700 border border-pink-300" : "bg-gray-100 text-gray-600"}`}
                              onClick={() => {/* Yoast tab logic */}}
                            >
                              Yoast SEO
                            </button>
                          </li>
                        </ul>

                        <div className="tab-content">
                          {form.watch("seo_plugin") === "rank_math_seo" && (
                            <div className="tab-pane">
                              <div className="mb-3">
                                <strong className="text-purple-700">Rank Math SEO</strong> eklentisi için odak anahtar kelime ve meta açıklama alanlarının doldurulabilmesi için aşağıdaki kodu web sitenizde kullandığınız temanızın <code className="bg-gray-100 px-1 rounded"><strong>functions.php</strong></code> dosyasının en sonuna ekleyin:
                              </div>
                              <div className="cursor-pointer border p-3 rounded bg-gray-50">
                                <pre className="text-sm overflow-x-auto text-gray-800">
{`add_action('rest_api_init', function() {
    register_meta('post', 'rank_math_focus_keyword', array(
        'show_in_rest'  => true,
        'single'        => true,
        'type'          => 'string',
        'auth_callback' => function(){return true;}
    ));
    register_meta('post', 'rank_math_description', array(
        'show_in_rest'  => true,
        'single'        => true,
        'type'          => 'string',
        'auth_callback' => function(){return true;}
    ));
});`}
                                </pre>
                              </div>
                            </div>
                          )}

                          {form.watch("seo_plugin") === "yoast_seo" && (
                            <div className="tab-pane">
                              <div className="mb-3">
                                <strong className="text-pink-700">Yoast SEO</strong> eklentisi için odak anahtar kelime ve meta açıklama alanlarının doldurulabilmesi için aşağıdaki kodu web sitenizde kullandığınız temanızın <code className="bg-gray-100 px-1 rounded"><strong>functions.php</strong></code> dosyasının en sonuna ekleyin:
                              </div>
                              <div className="cursor-pointer border p-3 rounded bg-gray-50">
                                <pre className="text-sm overflow-x-auto text-gray-800">
{`add_action('rest_api_init', function() {
    register_meta('post', '_yoast_wpseo_focuskw', array(
        'show_in_rest'  => true,
        'single'        => true,
        'type'          => 'string',
        'auth_callback' => function(){return true;}
    ));
    register_meta('post', '_yoast_wpseo_metadesc', array(
        'show_in_rest'  => true,
        'single'        => true,
        'type'          => 'string',
        'auth_callback' => function(){return true;}
    ));
});`}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedType === "3" && (
                    <div className="website-type-cont">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="xenforo_api_key">
                          API Key <span className="text-red-500">*</span>
                        </label>
                        <input 
                          {...form.register("xenforo_api_key")}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          type="text"
                          placeholder="Lütfen API key bilginizi giriniz"
                          maxLength={255}
                        />
                        <div className="text-sm text-gray-500 mt-1">
                          * Eklediğiniz API keyin sadece <strong>attachment:write</strong>, <strong>node:read</strong> ve <strong>thread:write</strong> kapsamlarına erişim yetkisi olmalıdır.
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          * Lütfen tüm kapsamlara erişim yetkisi olan bir API key kullanmayınız.
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="xenforo_api_key_type">
                          API Key Türü <span className="text-red-500">*</span>
                        </label>
                        <select 
                          {...form.register("xenforo_api_key_type")}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={selectedApiKeyType}
                          onChange={(e) => {
                            setSelectedApiKeyType(e.target.value);
                            form.setValue("xenforo_api_key_type", e.target.value);
                          }}
                        >
                          <option value="1">Kullanıcı Anahtarı</option>
                          <option value="2">Süper Kullanıcı Anahtarı</option>
                        </select>
                      </div>

                      {selectedApiKeyType === "2" && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700">Eklemek İstediğiniz Kullanıcılar</label>
                            <button 
                              type="button" 
                              onClick={addXfUser}
                              className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-200"
                            >
                              Yeni kullanıcı ekle
                            </button>
                          </div>

                          {xfUsers.map((user, index) => (
                            <div key={index} className="flex items-center space-x-2 mt-3">
                              <span className="w-10 bg-gray-100 text-center py-2 rounded text-sm">{index + 1}</span>
                              <input 
                                className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                type="text"
                                placeholder="Kullanıcı ID"
                                value={user.id}
                                onChange={(e) => updateXfUser(index, "id", e.target.value)}
                                maxLength={255}
                              />
                              <input 
                                className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                type="text"
                                placeholder="Kullanıcı Adı"
                                value={user.username}
                                onChange={(e) => updateXfUser(index, "username", e.target.value)}
                                maxLength={255}
                              />
                              <button 
                                type="button"
                                onClick={() => removeXfUser(index)}
                                className="p-2 text-red-500 hover:text-red-700"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <button 
                      type="submit"
                      disabled={addWebsiteMutation.isPending}
                      className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                      <span>Kaydet</span>
                      {addWebsiteMutation.isPending && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}