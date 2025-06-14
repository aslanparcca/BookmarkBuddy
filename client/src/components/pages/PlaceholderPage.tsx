interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: string;
  iconColor?: string;
  isComingSoon?: boolean;
}

export default function PlaceholderPage({ 
  title, 
  description, 
  icon, 
  iconColor = "text-blue-600",
  isComingSoon = false 
}: PlaceholderPageProps) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-slate-600 mt-2">{description}</p>
      </div>
      
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="text-center py-12">
          <div className={`h-16 w-16 bg-blue-100 ${iconColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <i className={`${icon} text-2xl`}></i>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {isComingSoon ? `${title} - Yakında!` : `${title} Alanı`}
          </h3>
          <p className="text-slate-600 mb-4">
            {isComingSoon 
              ? "Bu özellik yakında kullanıma sunulacak." 
              : "Bu alan geliştirilmekte. Yakında daha fazla özellik eklenecek."
            }
          </p>
          {isComingSoon && (
            <div className="bg-green-500 text-white text-sm px-4 py-2 rounded-full inline-block">
              Çok Yakında
            </div>
          )}
        </div>
      </div>
    </div>
  );
}