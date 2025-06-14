import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Analytics() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/stats'],
    enabled: true,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-8 bg-slate-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Toplam Makale",
      value: stats?.totalArticles || 0,
      icon: "fas fa-file-alt",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Toplam Kelime",
      value: `${Math.round((stats?.totalWords || 0) / 1000)}K`,
      icon: "fas fa-font",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      title: "Aylık Makale",
      value: stats?.monthlyArticles || 0,
      icon: "fas fa-calendar",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "API Kullanımı",
      value: stats?.apiUsage || 0,
      icon: "fas fa-plug",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className={`h-12 w-12 ${stat.bgColor} ${stat.color} rounded-lg flex items-center justify-center`}>
                  <i className={stat.icon}></i>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Chart Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>API Kullanım Trendi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
              <div className="text-center">
                <i className="fas fa-chart-line text-slate-300 text-4xl mb-4"></i>
                <p className="text-slate-500">Grafik verileri yükleniyor...</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kategori Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
              <div className="text-center">
                <i className="fas fa-pie-chart text-slate-300 text-4xl mb-4"></i>
                <p className="text-slate-500">Kategori analizi yükleniyor...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Son Aktiviteler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: "Yeni makale oluşturuldu", title: "AI ve Makine Öğrenmesi", time: "2 saat önce" },
              { action: "Toplu işlem tamamlandı", title: "5 makale oluşturuldu", time: "4 saat önce" },
              { action: "Makale güncellendi", title: "SEO Rehberi", time: "1 gün önce" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <div className="h-8 w-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-bell text-sm"></i>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{activity.action}</p>
                  <p className="text-slate-600 text-sm">{activity.title}</p>
                </div>
                <span className="text-slate-500 text-sm">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
