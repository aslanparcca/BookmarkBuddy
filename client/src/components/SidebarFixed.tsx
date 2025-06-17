import { useAuth } from "@/hooks/useAuth";
import type { PageType } from "@/pages/Dashboard";

interface SidebarProps {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function SidebarFixed({ currentPage, setCurrentPage, sidebarOpen, setSidebarOpen }: SidebarProps) {
  const { user } = useAuth();

  const mainNavItems = [
    { id: 'editor' as PageType, icon: 'fas fa-home', label: 'Ana Sayfa', color: 'text-purple-500' },
    { id: 'articles' as PageType, icon: 'fas fa-file-alt', label: 'İçeriklerim', color: 'text-blue-500' },
    { id: 'wp-editor' as PageType, icon: 'fab fa-wordpress', label: 'WP Makalesi V1', color: 'text-slate-500' },
    { id: 'settings' as PageType, icon: 'fab fa-wordpress', label: 'WP Makalesi V2', color: 'text-slate-500' },
    { id: 'url-rewrite' as PageType, icon: 'fas fa-link', label: 'URL Rewrite', color: 'text-slate-500' },
    { id: 'websites' as PageType, icon: 'fas fa-globe', label: 'Web Sitelerim', color: 'text-green-500' },
    { id: 'api-keys' as PageType, icon: 'fas fa-key', label: 'Api Keylerim', color: 'text-orange-500' },
    { id: 'seo-indexing' as PageType, icon: 'fas fa-search', label: 'SEO İndeksleme', color: 'text-red-500' },
  ];

  const bulkOperations = [
    { id: 'bulk-articles' as PageType, icon: 'fas fa-file-alt', label: 'Toplu Oluşturulan Makaleler', color: 'text-slate-500' },
    { id: 'bulk-template-v1' as PageType, icon: 'fas fa-layer-group', label: 'Toplu Makale V1', color: 'text-slate-500' },
    { id: 'bulk-template-v2' as PageType, icon: 'fas fa-layer-group', label: 'Toplu Makale V2', color: 'text-slate-500' },
    { id: 'bulk-recipe' as PageType, icon: 'fas fa-utensils', label: 'Toplu Yemek Tarifi', color: 'text-slate-500' },
    { id: 'bulk-dream' as PageType, icon: 'fas fa-moon', label: 'Toplu Rüya Tabiri', color: 'text-slate-500' },
    { id: 'custom-articles' as PageType, icon: 'fas fa-clock', label: 'Özgünleştirilen Makaleler', color: 'text-slate-500' },
    { id: 'optimize-articles' as PageType, icon: 'fas fa-cog', label: 'Makale Özgünleştir', color: 'text-slate-500' },
  ];

  const voiceAndMedia = [
    { id: 'voice-files' as PageType, icon: 'fas fa-volume-up', label: 'Ses Dosyalarım', color: 'text-slate-600' },
    { id: 'voice-reader' as PageType, icon: 'fas fa-microphone', label: 'Metin Seslendir', color: 'text-blue-600' },
    { id: 'my-images' as PageType, icon: 'fas fa-image', label: 'Resimlerim', color: 'text-slate-600' },
    { id: 'create-image' as PageType, icon: 'fas fa-paint-brush', label: 'Yeni Resim Oluştur', color: 'text-slate-600' },
  ];

  const helpSection = [
    { id: 'help-sss' as PageType, icon: 'fas fa-question-circle', label: 'Yardım & SSS', color: 'text-slate-500' },
  ];

  return (
    <div className="sidebar-wrapper">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <aside 
        className={`
          w-64 h-screen bg-white border-r border-slate-200 flex-shrink-0
          ${sidebarOpen ? 'fixed inset-y-0 left-0 z-50' : 'hidden'}
          lg:block lg:static
          flex flex-col
        `}
      >
        <div className="p-6 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
              <i className="fas fa-brain text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-slate-900 font-bold text-lg">AI İçerik Paneli</h1>
              <p className="text-slate-500 text-sm">Gemini API Destekli</p>
            </div>
          </div>
        </div>

        <div className="flex-1 sidebar-scrollable">
          {/* Ana Menü */}
          <div className="p-4 space-y-1">
            {mainNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors text-sm
                  ${currentPage === item.id 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <i className={`${item.icon} w-4 ${item.color}`}></i>
                  <span>{item.label}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Toplu İşlemler */}
          <div className="px-4 pb-4">
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 px-3">
              TOPLU İŞLEMLER
            </div>
            <div className="space-y-1">
              {bulkOperations.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors text-sm
                    ${currentPage === item.id 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                >
                  <i className={`${item.icon} w-4 ${item.color}`}></i>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Seslendirme & Resim */}
          <div className="px-4 pb-4">
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 px-3">
              SESLENDIRME & RESIM
            </div>
            <div className="space-y-1">
              {voiceAndMedia.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors text-sm
                    ${currentPage === item.id 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                >
                  <i className={`${item.icon} w-4 ${item.color}`}></i>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Yardım */}
          <div className="px-4 pb-4">
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 px-3">
              YARDIM
            </div>
            <div className="space-y-1">
              {helpSection.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors text-sm
                    ${currentPage === item.id 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                >
                  <i className={`${item.icon} w-4 ${item.color}`}></i>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-t border-slate-200 flex-shrink-0">
          <div className="flex items-center space-x-3 px-3 py-2 bg-slate-50 rounded-lg">
            <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user?.email?.split('@')[0]}
              </p>
              <p className="text-xs text-slate-500 truncate">
                Premium
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}