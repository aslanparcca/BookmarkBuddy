import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AIEditor from "@/components/pages/AIEditor";
import WordPressEditor from "@/components/pages/WordPressEditor";
import WordPressEditorV2 from "@/components/pages/WordPressEditorV2";
import BulkEditor from "@/components/pages/BulkEditor";
import Articles from "@/components/pages/Articles";
import Analytics from "@/components/pages/Analytics";
import Settings from "@/components/pages/Settings";
import LoadingOverlay from "@/components/LoadingOverlay";
import PlaceholderPage from "@/components/pages/PlaceholderPage";
import { Toaster } from "@/components/ui/toaster";

export type PageType = 'editor' | 'wp-editor' | 'bulk-editor' | 'articles' | 'settings' | 
  'url-rewrite' | 'bulk-articles' | 'bulk-template-v1' | 'bulk-template-v2' | 'bulk-recipe' | 
  'bulk-dream' | 'custom-articles' | 'optimize-articles' | 'voice-files' | 'voice-reader' | 
  'my-images' | 'create-image' | 'help-sss';

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState<PageType>('editor');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const pageTitles: Record<PageType, string> = {
    'editor': 'Ana Sayfa',
    'wp-editor': 'WP Makalesi V1',
    'bulk-editor': 'Tüm Şablonlar',
    'articles': 'İçeriklerim',

    'settings': 'WP Makalesi V2',
    'url-rewrite': 'URL Rewrite',
    'bulk-articles': 'Toplu Oluşturulan Makaleler',
    'bulk-template-v1': 'Toplu Makale V1',
    'bulk-template-v2': 'Toplu Makale V2',
    'bulk-recipe': 'Toplu Yemek Tarifi',
    'bulk-dream': 'Toplu Rüya Tabiri',
    'custom-articles': 'Özgünleştirilen Makaleler',
    'optimize-articles': 'Makale Özgünleştir',
    'voice-files': 'Ses Dosyalarım',
    'voice-reader': 'Metin Seslendir',
    'my-images': 'Resimlerim',
    'create-image': 'Yeni Resim Oluştur',
    'help-sss': 'Yardım & SSS'
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'editor':
        return <AIEditor setLoading={setLoading} />;
      case 'wp-editor':
        return <WordPressEditor setLoading={setLoading} />;
      case 'bulk-editor':
        return <BulkEditor setLoading={setLoading} />;
      case 'articles':
        return <Articles />;

      case 'settings':
        return <WordPressEditorV2 setLoading={setLoading} />;
      case 'url-rewrite':
        return <PlaceholderPage title="URL Rewrite" description="URL yeniden yazma ve SEO optimizasyonu araçları" icon="fas fa-link" iconColor="text-green-600" isComingSoon={true} />;
      case 'bulk-articles':
        return <PlaceholderPage title="Toplu Oluşturulan Makaleler" description="Toplu olarak oluşturduğunuz makaleleri görüntüleyin ve yönetin" icon="fas fa-file-alt" iconColor="text-blue-600" />;
      case 'bulk-template-v1':
        return <PlaceholderPage title="Toplu Makale V1" description="Toplu makale oluşturma şablonu versiyon 1" icon="fas fa-layer-group" iconColor="text-purple-600" />;
      case 'bulk-template-v2':
        return <PlaceholderPage title="Toplu Makale V2" description="Toplu makale oluşturma şablonu versiyon 2" icon="fas fa-layer-group" iconColor="text-purple-600" />;
      case 'bulk-recipe':
        return <PlaceholderPage title="Toplu Yemek Tarifi" description="Toplu yemek tarifi oluşturma araçları" icon="fas fa-utensils" iconColor="text-orange-600" />;
      case 'bulk-dream':
        return <PlaceholderPage title="Toplu Rüya Tabiri" description="Toplu rüya tabiri içerik oluşturma araçları" icon="fas fa-moon" iconColor="text-indigo-600" />;
      case 'custom-articles':
        return <PlaceholderPage title="Özgünleştirilen Makaleler" description="Özelleştirilmiş ve özgünleştirilmiş makaleleriniz" icon="fas fa-clock" iconColor="text-teal-600" />;
      case 'optimize-articles':
        return <PlaceholderPage title="Makale Özgünleştir" description="Mevcut makalelerinizi özgünleştirme araçları" icon="fas fa-cog" iconColor="text-gray-600" />;
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
