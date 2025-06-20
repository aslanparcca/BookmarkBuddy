import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import SidebarFixed from "@/components/SidebarFixed";
import Header from "@/components/Header";
import HomePage from "@/components/pages/HomePage";
import ModulesPage from "@/components/pages/ModulesPage";
import AIEditor from "@/components/pages/AIEditor";
import WordPressEditor from "@/components/pages/WordPressEditor";
import WordPressEditorV2 from "@/components/pages/WordPressEditorV2";
import URLRewrite from "@/components/pages/URLRewrite";
import BulkEditor from "@/components/pages/BulkEditor";
import BulkArticles from "@/components/pages/BulkArticles";
import BulkTemplateV1 from "@/components/pages/BulkTemplateV1";
import BulkTemplateV2 from "@/components/pages/BulkTemplateV2";
import BulkRecipe from "@/components/pages/BulkRecipe";
import BulkDream from "@/components/pages/BulkDream";
import ExcelTemplate from "@/components/pages/ExcelTemplateNew";
import CustomArticles from "@/components/pages/CustomArticles";
import ArticleCustomizer from "@/components/pages/ArticleCustomizer";
import WebSites from "@/components/pages/WebSites";
import AddWebsite from "@/components/pages/AddWebsite";
import EditWebsite from "@/components/pages/EditWebsite";
import ApiKeys from "@/components/pages/ApiKeys";
import Articles from "@/components/pages/Articles";
import SEOIndexing from "@/components/pages/SEOIndexing";
import Analytics from "@/components/pages/Analytics";
import Settings from "@/components/pages/Settings";
import LoadingOverlay from "@/components/LoadingOverlay";
import PlaceholderPage from "@/components/pages/PlaceholderPage";
import KeywordGenerator from "@/components/pages/KeywordGenerator";
import WPCommentGenerator from "@/components/pages/WPCommentGenerator";
import TitleGenerator from "@/components/pages/TitleGenerator";
import AboutGenerator from "@/components/pages/AboutGenerator";
import CVWriter from "@/components/pages/CVWriter";
import ServiceDescriptionWriter from "@/components/pages/ServiceDescriptionWriter";
import ProductDescriptionGenerator from "@/components/pages/ProductDescriptionGenerator";
import FAQGenerator from "@/components/pages/FAQGenerator";
import GoogleAdsTitle from "@/components/modules/GoogleAdsTitle";
import GoogleAdsDescription from "@/components/modules/GoogleAdsDescription";
import FacebookAdsTitle from "@/components/modules/FacebookAdsTitle";
import FacebookAdsText from "@/components/modules/FacebookAdsText";
import HomepageContent from "@/components/modules/HomepageContent";
import ContactPage from "@/components/modules/ContactPage";
import CustomerReview from "@/components/modules/CustomerReview";
import AIContentPreview from "@/pages/AIContentPreview";
import VoiceToText from "@/pages/VoiceToText";
import CollaborativeEditor from "@/pages/CollaborativeEditor";
import AIQualityScorer from "@/pages/AIQualityScorer";
import ContentLocalization from "@/pages/ContentLocalization";
import VoiceFiles from "@/components/pages/VoiceFiles";
import VoiceReader from "@/components/pages/VoiceReader";
import { Toaster } from "@/components/ui/toaster";

export type PageType = 'editor' | 'wp-editor' | 'bulk-editor' | 'articles' | 'settings' | 
  'url-rewrite' | 'bulk-articles' | 'bulk-template-v1' | 'bulk-template-v2' | 'bulk-recipe' | 
  'bulk-dream' | 'excel-template' | 'custom-articles' | 'optimize-articles' | 'voice-files' | 'voice-reader' | 
  'my-images' | 'create-image' | 'help-sss' | 'websites' | 'add-website' | 'edit-website' | 'api-keys' | 'seo-indexing' |
  'keyword-generator' | 'wp-comment-generator' | 'title-generator' | 'about-generator' |
  'cv-writer' | 'service-description' | 'product-description' | 'faq-generator' | 'google-review' |
  'google-ads-title' | 'google-ads-description' | 'facebook-ads-title' | 'facebook-ads-text' |
  'homepage-content' | 'contact-page' | 'customer-review' | 'ai-content-preview' | 'voice-to-text' |
  'collaborative-editor' | 'ai-quality-scorer' | 'content-localization';

export default function Dashboard() {
  const [location] = useLocation();
  const [currentPage, setCurrentPage] = useState<PageType>('editor');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editWebsiteId, setEditWebsiteId] = useState<string>('');

  // Handle URL parameters for page navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page') as PageType;
    
    if (pageParam && pageParam !== currentPage) {
      setCurrentPage(pageParam);
    }
  }, [location]);

  const pageTitles: Record<PageType, string> = {
    'editor': 'Ana Sayfa',
    'wp-editor': 'WP Makalesi V1',
    'bulk-editor': 'Modüller',
    'articles': 'İçeriklerim',

    'settings': 'WP Makalesi V2',
    'url-rewrite': 'URL Rewrite',
    'bulk-articles': 'Toplu Oluşturulan Makaleler',
    'bulk-template-v1': 'Toplu Makale V1',
    'bulk-template-v2': 'Toplu Makale V2',
    'bulk-recipe': 'Toplu Yemek Tarifi',
    'bulk-dream': 'Toplu Rüya Tabiri',
    'excel-template': 'Excel Şablonu',
    'custom-articles': 'Özgünleştirilen Makaleler',
    'optimize-articles': 'Makale Özgünleştir',
    'voice-files': 'Ses Dosyalarım',
    'voice-reader': 'Metin Seslendir',
    'my-images': 'Resimlerim',
    'create-image': 'Yeni Resim Oluştur',
    'help-sss': 'Yardım & SSS',
    'websites': 'Web Sitelerim',
    'add-website': 'Yeni Web Sitesi Ekle',
    'edit-website': 'Web Sitesi Düzenle',
    'api-keys': 'Api Keylerim',
    'seo-indexing': 'SEO İndeksleme',
    'keyword-generator': 'Anahtar Kelime Üretici',
    'wp-comment-generator': 'WordPress Yorum Üretici',
    'title-generator': 'Makale Başlığı Üretici',
    'about-generator': 'Hakkımda Yazısı Üretici',
    'cv-writer': 'CV Yazarı',
    'service-description': 'Hizmet Açıklaması Yazarı',
    'product-description': 'Ürün Açıklaması Üretici',
    'faq-generator': 'Sıkça Sorulan Sorular',
    'google-review': 'Google Yorum Üretici',
    'google-ads-title': 'Google Ads Başlığı',
    'google-ads-description': 'Google Ads Açıklaması',
    'facebook-ads-title': 'Facebook Ads Başlığı',
    'facebook-ads-text': 'Facebook Ads Ana Metin',
    'homepage-content': 'Ana Sayfa Yazısı',
    'contact-page': 'İletişim Sayfası Yazısı',
    'customer-review': 'Müşteri Yorumu',
    'ai-content-preview': 'Etkileşimli İçerik Önizlemesi',
    'voice-to-text': 'Sesli İçerik Oluşturucu',
    'collaborative-editor': 'İşbirliği Editörü',
    'ai-quality-scorer': 'AI Kalite Puanlama',
    'content-localization': 'İçerik Yerelleştirme'
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'editor':
        return <HomePage />;
      case 'wp-editor':
        return <WordPressEditor setLoading={setLoading} />;
      case 'bulk-editor':
        return <ModulesPage setLoading={setLoading} />;
      case 'articles':
        return <Articles />;

      case 'settings':
        return <WordPressEditorV2 setLoading={setLoading} />;
      case 'url-rewrite':
        return <URLRewrite />;
      case 'bulk-articles':
        return <BulkArticles setCurrentPage={setCurrentPage} />;
      case 'bulk-template-v1':
        return <BulkTemplateV1 setLoading={setLoading} />;
      case 'bulk-template-v2':
        return <BulkTemplateV2 setLoading={setLoading} />;
      case 'bulk-recipe':
        return <BulkRecipe setLoading={setLoading} />;
      case 'bulk-dream':
        return <BulkDream setLoading={setLoading} />;
      case 'excel-template':
        return <ExcelTemplate setLoading={setLoading} />;
      case 'custom-articles':
        return <CustomArticles />;
      case 'optimize-articles':
        return <ArticleCustomizer />;
      case 'voice-files':
        return <VoiceFiles />;
      case 'voice-reader':
        return <VoiceReader />;
      case 'my-images':
        return <PlaceholderPage title="Resimlerim" description="Oluşturduğunuz resimleri görüntüleyin ve yönetin" icon="fas fa-image" iconColor="text-green-600" />;
      case 'create-image':
        return <PlaceholderPage title="Yeni Resim Oluştur" description="AI ile yeni resim oluşturma araçları" icon="fas fa-paint-brush" iconColor="text-pink-600" />;
      case 'help-sss':
        return <PlaceholderPage title="Yardım & SSS" description="Sıkça sorulan sorular ve yardım dokümantasyonu" icon="fas fa-question-circle" iconColor="text-blue-600" />;
      case 'websites':
        return <WebSites setCurrentPage={setCurrentPage} setEditWebsiteId={setEditWebsiteId} />;
      case 'add-website':
        return <AddWebsite setCurrentPage={setCurrentPage} />;
      case 'edit-website':
        return <EditWebsite websiteId={editWebsiteId} setCurrentPage={setCurrentPage} />;
      case 'api-keys':
        return <ApiKeys />;
      case 'seo-indexing':
        return <SEOIndexing />;
      
      // Module Pages
      case 'keyword-generator':
        return <KeywordGenerator setLoading={setLoading} />;
      case 'wp-comment-generator':
        return <WPCommentGenerator setLoading={setLoading} />;
      case 'title-generator':
        return <TitleGenerator setLoading={setLoading} />;
      case 'about-generator':
        return <AboutGenerator setLoading={setLoading} />;
      case 'cv-writer':
        return <CVWriter setLoading={setLoading} />;
      case 'service-description':
        return <ServiceDescriptionWriter setLoading={setLoading} />;
      case 'product-description':
        return <ProductDescriptionGenerator setLoading={setLoading} />;
      case 'faq-generator':
        return <FAQGenerator setLoading={setLoading} />;
      case 'google-review':
        return <PlaceholderPage title="Google Yorum Üretici" description="Google Maps için gerçek yorumlar üretin" icon="fab fa-google" iconColor="text-red-600" />;
      case 'google-ads-title':
        return <GoogleAdsTitle />;
      case 'google-ads-description':
        return <GoogleAdsDescription />;
      case 'facebook-ads-title':
        return <FacebookAdsTitle />;
      case 'facebook-ads-text':
        return <FacebookAdsText />;
      case 'homepage-content':
        return <HomepageContent />;
      case 'contact-page':
        return <ContactPage />;
      case 'customer-review':
        return <CustomerReview />;
      
      // Advanced AI Modules
      case 'ai-content-preview':
        return <AIContentPreview setLoading={setLoading} />;
      case 'voice-to-text':
        return <VoiceToText setLoading={setLoading} />;
      case 'collaborative-editor':
        return <CollaborativeEditor setLoading={setLoading} />;
      case 'ai-quality-scorer':
        return <AIQualityScorer setLoading={setLoading} />;
      case 'content-localization':
        return <ContentLocalization setLoading={setLoading} />;
      
      default:
        return <AIEditor setLoading={setLoading} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <SidebarFixed 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Header 
          title={pageTitles[currentPage]}
          setSidebarOpen={setSidebarOpen}
        />
        
        <main className="flex-1 overflow-auto p-6">
          {renderPage()}
        </main>
      </div>
      
      <LoadingOverlay loading={loading} />
      <Toaster />
    </div>
  );
}
