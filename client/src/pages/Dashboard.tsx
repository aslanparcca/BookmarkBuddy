import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Sidebar from "@/components/Sidebar";
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
import { Toaster } from "@/components/ui/toaster";

export type PageType = 'editor' | 'wp-editor' | 'bulk-editor' | 'articles' | 'settings' | 
  'url-rewrite' | 'bulk-articles' | 'bulk-template-v1' | 'bulk-template-v2' | 'bulk-recipe' | 
  'bulk-dream' | 'excel-template' | 'custom-articles' | 'optimize-articles' | 'voice-files' | 'voice-reader' | 
  'my-images' | 'create-image' | 'help-sss' | 'websites' | 'add-website' | 'edit-website' | 'api-keys' | 'seo-indexing' |
  'keyword-generator' | 'wp-comment-generator' | 'title-generator' | 'about-generator' |
  'cv-writer' | 'service-description' | 'product-description' | 'faq-generator' | 'google-review';

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
    'google-review': 'Google Yorum Üretici'
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
        return <PlaceholderPage title="Ses Dosyalarım" description="Oluşturduğunuz ses dosyalarını görüntüleyin ve yönetin" icon="fas fa-volume-up" iconColor="text-blue-600" />;
      case 'voice-reader':
        return <PlaceholderPage title="Metin Seslendir" description="Metinlerinizi sese dönüştürme araçları" icon="fas fa-microphone" iconColor="text-red-600" />;
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
        return <PlaceholderPage title="Ürün Açıklaması Üretici" description="E-ticaret için SEO uyumlu ürün açıklamaları" icon="fas fa-tag" iconColor="text-red-600" />;
      case 'faq-generator':
        return <PlaceholderPage title="Sıkça Sorulan Sorular" description="İstediğin konuda SSS ve cevapları üret" icon="fas fa-question-circle" iconColor="text-blue-600" />;
      case 'google-review':
        return <PlaceholderPage title="Google Yorum Üretici" description="Google Maps için gerçek yorumlar üretin" icon="fab fa-google" iconColor="text-red-600" />;
      
      default:
        return <AIEditor setLoading={setLoading} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
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
