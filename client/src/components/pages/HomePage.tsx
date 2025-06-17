import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { TrendingUp, FileText, Globe, Target, Users, Clock, Award, Zap, Brain, BarChart3, Eye } from "lucide-react";
import { useLocation } from "wouter";

interface SEOTip {
  id: number;
  title: string;
  description: string;
  category: 'İçerik' | 'Teknik' | 'Link' | 'Sosyal';
  priority: 'Yüksek' | 'Orta' | 'Düşük';
  estimatedImpact: string;
}

interface DashboardStats {
  totalArticles: number;
  totalWords: number;
  monthlyArticles: number;
  totalWebsites: number;
  apiCallsThisMonth: number;
  avgReadingTime: number;
}

const seoTips: SEOTip[] = [
  {
    id: 1,
    title: "Uzun Kuyruk Anahtar Kelimeler",
    description: "3-4 kelimelik spesifik anahtar kelimeler kullanarak daha kolay sıralama elde edin.",
    category: "İçerik",
    priority: "Yüksek",
    estimatedImpact: "+25% trafik"
  },
  {
    id: 2,
    title: "İç Link Stratejisi",
    description: "Benzer konulardaki makalelerinizi birbirine bağlayarak site otoritesini artırın.",
    category: "Link",
    priority: "Yüksek",
    estimatedImpact: "+40% sayfa görüntüleme"
  },
  {
    id: 3,
    title: "Meta Açıklama Optimizasyonu",
    description: "145-160 karakter arası meta açıklamalar yazarak tıklama oranını artırın.",
    category: "Teknik",
    priority: "Orta",
    estimatedImpact: "+15% CTR"
  },
  {
    id: 4,
    title: "Görsel Alt Metinleri",
    description: "Tüm görsellere açıklayıcı alt metinler ekleyerek erişilebilirliği artırın.",
    category: "Teknik",
    priority: "Orta",
    estimatedImpact: "+10% organik trafik"
  },
  {
    id: 5,
    title: "Sosyal Medya Paylaşımları",
    description: "Makalelerinizi sosyal medyada düzenli paylaşarak erişimi artırın.",
    category: "Sosyal",
    priority: "Düşük",
    estimatedImpact: "+20% sosyal trafik"
  }
];

// Real data calculations will be done in component using actual articles

export default function HomePage() {
  const [timeOfDay, setTimeOfDay] = useState('');
  const [, navigate] = useLocation();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('Günaydın');
    else if (hour < 18) setTimeOfDay('İyi günler');
    else setTimeOfDay('İyi akşamlar');
  }, []);

  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard-stats'],
    refetchInterval: 30000 // 30 saniyede bir güncelle
  });

  const { data: articles } = useQuery({
    queryKey: ['/api/articles'],
    refetchInterval: 60000 // 1 dakikada bir güncelle
  });

  const { data: websites } = useQuery({
    queryKey: ['/api/websites'],
    refetchInterval: 60000
  });

  const dashboardStats: DashboardStats = (stats as DashboardStats) ?? {
    totalArticles: 0,
    totalWords: 0,
    monthlyArticles: 0,
    totalWebsites: 0,
    apiCallsThisMonth: 0,
    avgReadingTime: 0
  };

  // Calculate real chart data from articles
  const calculateChartData = () => {
    if (!articles || !Array.isArray(articles)) {
      return {
        weeklyData: [],
        contentTypeData: [],
        monthlyTrendData: []
      };
    }

    // Calculate weekly data (last 7 days)
    const today = new Date();
    const weekDays = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    const weeklyData: Array<{day: string; articles: number; words: number}> = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = weekDays[date.getDay()];
      
      const dayArticles = articles.filter(article => {
        const articleDate = new Date(article.createdAt);
        return articleDate.toDateString() === date.toDateString();
      });
      
      const dayWords = dayArticles.reduce((sum, article) => sum + (article.wordCount || 0), 0);
      
      weeklyData.push({
        day: dayName,
        articles: dayArticles.length,
        words: dayWords
      });
    }

    // Calculate content type distribution
    const categories = ['Blog', 'SEO', 'Haber', 'Ürün', 'Diğer'];
    const categoryMap = new Map();
    
    articles.forEach(article => {
      const category = article.category || 'Diğer';
      const normalizedCategory = categories.find(cat => 
        category.toLowerCase().includes(cat.toLowerCase())
      ) || 'Diğer';
      
      categoryMap.set(normalizedCategory, (categoryMap.get(normalizedCategory) || 0) + 1);
    });
    
    const totalArticles = articles.length || 1;
    const contentTypeData = Array.from(categoryMap.entries()).map(([name, count], index) => ({
      name: name === 'Blog' ? 'Blog Yazıları' : 
            name === 'SEO' ? 'SEO Makaleleri' : 
            name === 'Ürün' ? 'Ürün İncelemeleri' : 
            name === 'Haber' ? 'Haberler' : 'Diğer İçerikler',
      value: Math.round((count / totalArticles) * 100),
      color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index] || '#64748b'
    }));

    // Calculate monthly trend (last 6 months)
    const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const monthlyTrendData = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      const monthName = monthNames[date.getMonth()];
      
      const monthArticles = articles.filter(article => {
        const articleDate = new Date(article.createdAt);
        return articleDate.getMonth() === date.getMonth() && 
               articleDate.getFullYear() === date.getFullYear();
      });
      
      const monthWords = monthArticles.reduce((sum, article) => sum + (article.wordCount || 0), 0);
      const estimatedTraffic = monthWords * 2.5; // Rough estimate: 2.5 views per word
      
      monthlyTrendData.push({
        month: monthName,
        articles: monthArticles.length,
        traffic: Math.round(estimatedTraffic)
      });
    }

    return { weeklyData, contentTypeData, monthlyTrendData };
  };

  const chartData = calculateChartData();
  const { weeklyData, contentTypeData, monthlyTrendData } = chartData;

  // Quick Actions handlers
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-article':
        navigate('/?page=settings'); // WP Makalesi V2
        break;
      case 'bulk-create':
        navigate('/?page=bulk-template-v2'); // Toplu Makale V2
        break;
      case 'add-website':
        navigate('/?page=add-website'); // Website Ekle
        break;
      case 'seo-analyze':
        navigate('/?page=seo-indexing'); // SEO İndeksleme
        break;
      default:
        break;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'İçerik': return 'bg-blue-100 text-blue-800';
      case 'Teknik': return 'bg-green-100 text-green-800';
      case 'Link': return 'bg-purple-100 text-purple-800';
      case 'Sosyal': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Yüksek': return 'bg-red-100 text-red-800';
      case 'Orta': return 'bg-yellow-100 text-yellow-800';
      case 'Düşük': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Hoş Geldin Bölümü */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">{timeOfDay}! 👋</h1>
            <p className="text-blue-100">AI içerik platformunuza hoş geldiniz. Bugün nasıl bir içerik oluşturalım?</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 rounded-lg p-4">
              <Brain className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Ana İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Makale</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalArticles.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Bu ay +{dashboardStats.monthlyArticles} yeni makale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kelime</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(dashboardStats.totalWords / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">
              Ortalama {dashboardStats.avgReadingTime} dk okuma süresi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Website</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalWebsites}</div>
            <p className="text-xs text-muted-foreground">
              Entegre ve yönetiliyor
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Kullanımı</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.apiCallsThisMonth.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Bu ay API çağrısı
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Haftalık Aktivite */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Haftalık Makale Üretimi
            </CardTitle>
            <CardDescription>Son 7 günün makale ve kelime sayısı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="articles" fill="#3b82f6" name="Makale Sayısı" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* İçerik Türü Dağılımı */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              İçerik Türü Dağılımı
            </CardTitle>
            <CardDescription>Oluşturulan içerik türlerinin yüzdesi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={contentTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name} (${value}%)`}
                  >
                    {contentTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aylık Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            6 Aylık İçerik ve Trafik Trendi
          </CardTitle>
          <CardDescription>Makale üretimi ve tahmini trafik artışı</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="articles" 
                  stackId="1"
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.6}
                  name="Makale Sayısı"
                />
                <Area 
                  type="monotone" 
                  dataKey="traffic" 
                  stackId="2"
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.6}
                  name="Tahmini Trafik"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* SEO Önerileri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Günlük SEO Önerileri
          </CardTitle>
          <CardDescription>İçeriklerinizi geliştirmek için kişiselleştirilmiş öneriler</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {seoTips.map((tip) => (
              <div key={tip.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{tip.title}</h4>
                    <Badge className={getCategoryColor(tip.category)} variant="secondary">
                      {tip.category}
                    </Badge>
                    <Badge className={getPriorityColor(tip.priority)} variant="secondary">
                      {tip.priority}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-2">{tip.description}</p>
                  <p className="text-sm font-medium text-green-600">{tip.estimatedImpact}</p>
                </div>
                <Button variant="outline" size="sm">
                  Uygula
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hızlı Erişim */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Hızlı İşlemler
          </CardTitle>
          <CardDescription>En sık kullanılan özellikler</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              className="h-20 flex flex-col gap-2" 
              variant="outline"
              onClick={() => handleQuickAction('new-article')}
            >
              <FileText className="h-6 w-6" />
              <span className="text-sm">Yeni Makale</span>
            </Button>
            <Button 
              className="h-20 flex flex-col gap-2" 
              variant="outline"
              onClick={() => handleQuickAction('bulk-create')}
            >
              <Users className="h-6 w-6" />
              <span className="text-sm">Toplu Üretim</span>
            </Button>
            <Button 
              className="h-20 flex flex-col gap-2" 
              variant="outline"
              onClick={() => handleQuickAction('add-website')}
            >
              <Globe className="h-6 w-6" />
              <span className="text-sm">Website Ekle</span>
            </Button>
            <Button 
              className="h-20 flex flex-col gap-2" 
              variant="outline"
              onClick={() => handleQuickAction('seo-analyze')}
            >
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">SEO Analiz</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}