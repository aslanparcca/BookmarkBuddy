import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

const websiteSchema = z.object({
  url: z.string().url("Geçerli bir URL giriniz"),
  wp_username: z.string().optional(),
  wp_app_password: z.string().optional(),
  seo_plugin: z.string(),
  woocommerce: z.string(),
  // Google Search Console fields
  gsc_service_account_key: z.string().optional(),
  gsc_property_url: z.string().optional(),
});

type WebsiteFormData = z.infer<typeof websiteSchema>;

interface EditWebsiteProps {
  websiteId: string;
  setCurrentPage?: (page: any) => void;
}

export default function EditWebsite({ websiteId, setCurrentPage }: EditWebsiteProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch website data
  const { data: website, isLoading } = useQuery({
    queryKey: [`/api/websites/${websiteId}`],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/websites/${websiteId}`);
      console.log('API Response:', response);
      return response as any;
    },
    retry: false,
    enabled: !!websiteId,
  });

  const form = useForm<WebsiteFormData>({
    resolver: zodResolver(websiteSchema),
    defaultValues: {
      url: "",
      wp_username: "",
      wp_app_password: "",
      seo_plugin: "yoast_seo",
      woocommerce: "0",
      gsc_service_account_key: "",
      gsc_property_url: "",
    },
  });

  // Update form when website data is loaded
  useEffect(() => {
    if (website) {
      console.log('Loading website data into form:', website);
      
      // Map backend response to form fields
      const formData = {
        url: website.url || "",
        wp_username: website.wpUsername || "",
        wp_app_password: website.wpAppPassword || "",
        seo_plugin: website.seoPlugin === "Yoast SEO" ? "yoast_seo" : 
                   website.seoPlugin === "Rank Math SEO" ? "rank_math_seo" : 
                   website.seoPlugin === "Yok" ? "yok" : "yok",
        woocommerce: "0",
        gsc_service_account_key: website.gscServiceAccountKey || "",
        gsc_property_url: website.gscPropertyUrl || "",
      };
      
      console.log('Form data being set:', formData);
      form.reset(formData);
    }
  }, [website, form]);

  const updateWebsiteMutation = useMutation({
    mutationFn: async (data: WebsiteFormData) => {
      return await apiRequest("PUT", `/api/websites/${websiteId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/websites"] });
      queryClient.invalidateQueries({ queryKey: [`/api/websites/${websiteId}`] });
      toast({
        title: "Başarılı",
        description: "Web sitesi başarıyla güncellendi",
      });
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
        description: error.message || "Web sitesi güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: WebsiteFormData) => {
    updateWebsiteMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="content-wrapper">
        <div className="container-xxl flex-grow-1 container-p-y">
          <div className="text-center">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <div className="container-xxl flex-grow-1 container-p-y">
        <div className="row">
          <div className="col-md-8 mx-auto">
            <div className="card h-100">
              <div className="card-header border-bottom d-flex flex-row align-items-center justify-content-between pt-3 pb-2">
                <h5 className="m-0 p-0 d-flex flex-row align-items-center">
                  Web Sitesi Düzenle
                  <i className="fas fa-play-circle text-xl text-gray-400 hover:text-red-600 ml-1 cursor-pointer" title="Yardım Videosu"></i>
                </h5>
                <div className="d-flex flex-row align-items-center">
                  <button 
                    className="btn btn-outline-primary btn-sm" 
                    title="Web Sitelerim"
                    onClick={() => setCurrentPage && setCurrentPage('websites')}
                  >
                    ← Web Sitelerim
                  </button>
                </div>
              </div>

              <div className="card-body">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Basic Information */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="url">
                      Web Site URL <span className="text-red-500">*</span>
                    </label>
                    <input 
                      {...form.register("url")}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      type="url"
                      placeholder="https://example.com"
                    />
                    {form.formState.errors.url && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.url.message}</p>
                    )}
                  </div>

                  {/* WordPress Credentials */}
                  <div className="mb-6 border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">WordPress Bilgileri</h3>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="wp_username">
                        WordPress Kullanıcı Adı
                      </label>
                      <input 
                        {...form.register("wp_username")}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        type="text"
                        placeholder="WordPress kullanıcı adınızı giriniz"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="wp_app_password">
                        WordPress Uygulama Şifresi
                      </label>
                      <input 
                        {...form.register("wp_app_password")}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        type="password"
                        placeholder="WordPress uygulama şifrenizi giriniz"
                      />
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="text-blue-600 font-bold">Not:</span> WordPress Admin → Kullanıcılar → Profil → Uygulama Şifreleri bölümünden oluşturabilirsini
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="seo_plugin">
                        SEO Eklentisi
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
                  </div>

                  {/* Google Search Console Integration */}
                  <div className="mt-6 border-t pt-6" id="gsc-cont">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <i className="fab fa-google text-blue-600 mr-2"></i>
                      Google Search Console Entegrasyonu
                    </h3>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="gsc_property_url">
                        Property URL (Doğrulanmış Site URL'si)
                      </label>
                      <input 
                        {...form.register("gsc_property_url")}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        type="url"
                        placeholder="https://example.com/"
                      />
                      <div className="text-sm text-gray-600 mt-1">
                        Google Search Console'da doğruladığınız site URL'sini giriniz
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="gsc_service_account_key">
                        Service Account Key (JSON)
                      </label>
                      <textarea 
                        {...form.register("gsc_service_account_key")}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                        placeholder='{"type": "service_account", "project_id": "...", "private_key_id": "...", ...}'
                      />
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="text-blue-600 font-bold">Not:</span> Google Cloud Console'dan oluşturduğunuz Service Account JSON key'ini buraya yapıştırın
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                      <h4 className="font-medium text-blue-800 mb-2">Google Search Console API Kurulumu:</h4>
                      <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                        <li>Google Cloud Console'a gidin ve yeni proje oluşturun</li>
                        <li>Search Console API'yi etkinleştirin</li>
                        <li>Service Account oluşturun ve JSON key indirin</li>
                        <li>Search Console'da bu Service Account'u Property'ye ekleyin</li>
                      </ol>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <button 
                      type="button"
                      onClick={() => setCurrentPage && setCurrentPage('websites')}
                      className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                    >
                      İptal
                    </button>
                    <button 
                      type="submit"
                      disabled={updateWebsiteMutation.isPending}
                      className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                      <span>Güncelle</span>
                      {updateWebsiteMutation.isPending && (
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