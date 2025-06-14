interface LoadingOverlayProps {
  loading: boolean;
  message?: string;
}

export default function LoadingOverlay({ loading, message }: LoadingOverlayProps) {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-slate-700 font-medium">{message || 'AI İçerik Oluşturuluyor...'}</p>
        <p className="text-slate-500 text-sm mt-2">Bu işlem birkaç dakika sürebilir</p>
      </div>
    </div>
  );
}
