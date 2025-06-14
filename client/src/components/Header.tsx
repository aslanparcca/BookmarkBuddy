import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ title, setSidebarOpen }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden text-slate-500 hover:text-slate-700 p-2"
        >
          <i className="fas fa-bars text-lg"></i>
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
          <p className="text-slate-500 text-sm">Yapay zeka ile profesyonel içerik oluşturun</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-2 rounded-lg">
          <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
          <span className="text-emerald-700 text-sm font-medium">API Bağlı</span>
        </div>
        <Button className="bg-primary-600 text-white hover:bg-primary-700">
          <i className="fas fa-save mr-2"></i>
          Kaydet
        </Button>
      </div>
    </header>
  );
}
