import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AIEditor from "@/components/pages/AIEditor";
import WordPressEditor from "@/components/pages/WordPressEditor";
import BulkEditor from "@/components/pages/BulkEditor";
import Articles from "@/components/pages/Articles";
import Analytics from "@/components/pages/Analytics";
import Settings from "@/components/pages/Settings";
import LoadingOverlay from "@/components/LoadingOverlay";
import { Toaster } from "@/components/ui/toaster";

export type PageType = 'editor' | 'wp-editor' | 'bulk-editor' | 'articles' | 'analytics' | 'settings';

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState<PageType>('editor');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const pageTitles: Record<PageType, string> = {
    'editor': 'AI İçerik Editörü',
    'wp-editor': 'WordPress Editörü',
    'bulk-editor': 'Toplu Makale Oluştur',
    'articles': 'İçeriklerim',
    'analytics': 'İstatistikler',
    'settings': 'Entegrasyonlar'
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
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
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
