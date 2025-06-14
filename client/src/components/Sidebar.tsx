import { useAuth } from "@/hooks/useAuth";
import type { PageType } from "@/pages/Dashboard";

interface SidebarProps {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ currentPage, setCurrentPage, sidebarOpen, setSidebarOpen }: SidebarProps) {
  const { user } = useAuth();

  const mainNavItems = [
    { id: 'editor' as PageType, icon: 'fas fa-home', label: 'Ana Sayfa', color: 'text-purple-500' },
    { id: 'articles' as PageType, icon: 'fas fa-file-alt', label: 'İçeriklerim', color: 'text-slate-500' },
    { id: 'bulk-editor' as PageType, icon: 'fas fa-layer-group', label: 'Tüm Şablonlar', color: 'text-slate-500' },
    { id: 'wp-editor' as PageType, icon: 'fas fa-star', label: 'WP Makalesi V1', color: 'text-orange-500' },
    { id: 'settings' as PageType, icon: 'fas fa-star', label: 'WP Makalesi V2', color: 'text-green-500' },
    { id: 'analytics' as PageType, icon: 'fas fa-lightbulb', label: 'Yeni Özellik Önerin', color: 'text-slate-500' },
    { id: 'url-rewrite' as PageType, icon: 'fas fa-link', label: 'URL Rewrite', color: 'text-slate-500', badge: 'yeni' },
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
    { id: 'voice-files' as PageType, icon: 'fas fa-volume-up', label: 'Ses Dosyalarım', color: 'text-slate-500' },
    { id: 'voice-reader' as PageType, icon: 'fas fa-microphone', label: 'Metin Seslendir', color: 'text-slate-500' },
    { id: 'my-images' as PageType, icon: 'fas fa-image', label: 'Resimlerim', color: 'text-slate-500' },
    { id: 'create-image' as PageType, icon: 'fas fa-paint-brush', label: 'Yeni Resim Oluştur', color: 'text-slate-500' },
  ];

  const helpSection = [
    { id: 'help-sss' as PageType, icon: 'fas fa-question-circle', label: 'Yardım & SSS', color: 'text-slate-500' },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <aside className={`
        bg-white border-r border-slate-200 w-64 flex-shrink-0 
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 absolute lg:relative inset-y-0 left-0 z-30
      `}>
        <div className="p-6 border-b border-slate-200">
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

        <nav className="flex-1 overflow-y-auto">
          {/* Main Navigation */}
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
                {item.badge && (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Bulk Operations Section */}
          <div className="px-4 py-2">
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                TOPLU İŞLEMLER
              </h3>
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

          {/* Voice & Media Section */}
          <div className="px-4 py-2">
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                SESLENDİRME & RESİM
              </h3>
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

          {/* Help Section */}
          <div className="px-4 py-2">
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                YARDIM
              </h3>
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
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center space-x-3 px-3 py-2 bg-slate-50 rounded-lg">
            <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center">
              <i className="fas fa-user text-white text-sm"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 text-sm font-medium truncate">
                {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email || 'Kullanıcı'}
              </p>
              <button 
                onClick={() => window.location.href = '/api/logout'}
                className="text-slate-500 text-xs hover:text-slate-700"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
