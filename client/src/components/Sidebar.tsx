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

  const navItems = [
    { id: 'editor' as PageType, icon: 'fas fa-edit', label: 'AI İçerik Editörü' },
    { id: 'wp-editor' as PageType, icon: 'fab fa-wordpress', label: 'WordPress Editörü' },
    { id: 'bulk-editor' as PageType, icon: 'fas fa-layer-group', label: 'Toplu Makale Oluştur' },
    { id: 'articles' as PageType, icon: 'fas fa-file-alt', label: 'İçeriklerim' },
    { id: 'analytics' as PageType, icon: 'fas fa-chart-line', label: 'İstatistikler' },
    { id: 'settings' as PageType, icon: 'fas fa-cog', label: 'Entegrasyonlar' },
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
        bg-slate-900 text-slate-300 w-72 flex-shrink-0 
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 absolute lg:relative inset-y-0 left-0 z-30
      `}>
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <i className="fas fa-brain text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">AI İçerik Paneli</h1>
              <p className="text-slate-400 text-sm">Gemini API Destekli</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id);
                setSidebarOpen(false);
              }}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                font-medium transition-all duration-200
                ${currentPage === item.id 
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              <i className={`${item.icon} w-5`}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="flex items-center space-x-3 px-4 py-3 bg-slate-800 rounded-lg">
            <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center">
              <i className="fas fa-user text-white text-sm"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email || 'Kullanıcı'}
              </p>
              <button 
                onClick={() => window.location.href = '/api/logout'}
                className="text-slate-400 text-xs hover:text-white"
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
