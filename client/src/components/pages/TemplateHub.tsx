import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Users, 
  Coffee, 
  Brain, 
  Star, 
  Zap, 
  Trophy,
  Moon,
  Sun,
  Sparkles,
  Target,
  Clock,
  Award,
  Crown,
  Gem,
  Gift,
  Medal,
  Flame
} from "lucide-react";

interface Template {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: 'AI' | 'Toplu' | 'Özel' | 'WordPress';
  difficulty: 'Kolay' | 'Orta' | 'İleri';
  estimatedTime: string;
  usageCount: number;
  isPopular: boolean;
  isNew: boolean;
  route: string;
  color: string;
  features: string[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  color: string;
}

const templates: Template[] = [
  {
    id: 'ai-editor',
    title: 'AI İçerik Editörü',
    description: 'Yapay zeka ile profesyonel içerik oluşturun. Odak kelimeler, ton ayarları ve SEO optimizasyonu.',
    icon: Brain,
    category: 'AI',
    difficulty: 'Kolay',
    estimatedTime: '5-10 dk',
    usageCount: 1247,
    isPopular: true,
    isNew: false,
    route: 'editor',
    color: 'from-blue-500 to-purple-600',
    features: ['SEO Optimizasyonu', 'Çoklu Ton Seçeneği', 'Otomatik Başlık']
  },
  {
    id: 'wp-v1',
    title: 'WordPress Makalesi V1',
    description: '4 adımda WordPress için optimized makale oluşturun. Başlık seçimi, taslak ve son makale.',
    icon: FileText,
    category: 'WordPress',
    difficulty: 'Kolay',
    estimatedTime: '8-12 dk',
    usageCount: 892,
    isPopular: true,
    isNew: false,
    route: 'wp-editor',
    color: 'from-green-500 to-teal-600',
    features: ['4 Adım Süreç', 'WordPress Entegrasyonu', 'Meta Açıklama']
  },
  {
    id: 'wp-v2',
    title: 'WordPress Makalesi V2',
    description: 'Gelişmiş WordPress editörü. Kapsamlı ayarlar, görsel yönetimi ve gelişmiş SEO özellikleri.',
    icon: Zap,
    category: 'WordPress',
    difficulty: 'İleri',
    estimatedTime: '15-20 dk',
    usageCount: 634,
    isPopular: false,
    isNew: true,
    route: 'settings',
    color: 'from-purple-500 to-pink-600',
    features: ['Gelişmiş SEO', 'Görsel Yönetimi', 'Link Stratejisi']
  },
  {
    id: 'bulk-v1',
    title: 'Toplu Makale V1',
    description: 'Anahtar kelime listesiyle toplu makale üretimi. Hızlı ve etkili çözüm.',
    icon: Users,
    category: 'Toplu',
    difficulty: 'Orta',
    estimatedTime: '20-30 dk',
    usageCount: 456,
    isPopular: false,
    isNew: false,
    route: 'bulk-template-v1',
    color: 'from-orange-500 to-red-600',
    features: ['Toplu Üretim', 'Anahtar Kelime Odaklı', 'Hızlı İşlem']
  },
  {
    id: 'bulk-v2',
    title: 'Toplu Makale V2',
    description: 'Gelişmiş toplu üretim sistemi. Excel desteği, görsel yönetimi ve detaylı ayarlar.',
    icon: Sparkles,
    category: 'Toplu',
    difficulty: 'İleri',
    estimatedTime: '25-40 dk',
    usageCount: 789,
    isPopular: true,
    isNew: false,
    route: 'bulk-template-v2',
    color: 'from-indigo-500 to-blue-600',
    features: ['Excel Desteği', 'Görsel Yönetimi', 'Gelişmiş Ayarlar']
  },
  {
    id: 'excel-template',
    title: 'Excel Şablonu',
    description: 'Excel dosyanızı yükleyip otomatik makale oluşturun. 20 alt başlık desteği.',
    icon: Target,
    category: 'Özel',
    difficulty: 'Orta',
    estimatedTime: '15-25 dk',
    usageCount: 321,
    isPopular: false,
    isNew: true,
    route: 'excel-template',
    color: 'from-teal-500 to-green-600',
    features: ['Excel İmport', '20 Alt Başlık', 'Otomatik Mapping']
  },
  {
    id: 'url-rewrite',
    title: 'URL Yeniden Yazma',
    description: 'Mevcut içerikleri AI ile yeniden yazın. Özgün ve SEO dostu içerikler oluşturun.',
    icon: Coffee,
    category: 'AI',
    difficulty: 'Orta',
    estimatedTime: '10-15 dk',
    usageCount: 567,
    isPopular: false,
    isNew: false,
    route: 'url-rewrite',
    color: 'from-yellow-500 to-orange-600',
    features: ['URL Analizi', 'İçerik Yeniden Yazma', 'Özgünlük Kontrolü']
  },
  {
    id: 'bulk-recipe',
    title: 'Toplu Yemek Tarifi',
    description: 'Yemek tarifleri için özelleştirilmiş toplu makale üretimi. Malzeme ve talimat odaklı.',
    icon: Gift,
    category: 'Özel',
    difficulty: 'Orta',
    estimatedTime: '20-30 dk',
    usageCount: 234,
    isPopular: false,
    isNew: true,
    route: 'bulk-recipe',
    color: 'from-pink-500 to-rose-600',
    features: ['Tarif Yapısı', 'Malzeme Listesi', 'Pişirme Talimatları']
  }
];

const achievements: Achievement[] = [
  {
    id: 'first-article',
    title: 'İlk Adım',
    description: 'İlk makalenizi oluşturdunuz!',
    icon: Star,
    unlocked: true,
    progress: 1,
    maxProgress: 1,
    color: 'text-yellow-500'
  },
  {
    id: 'bulk-master',
    title: 'Toplu Üretim Ustası',
    description: '50+ makale toplu ürettiniz',
    icon: Crown,
    unlocked: false,
    progress: 23,
    maxProgress: 50,
    color: 'text-purple-500'
  },
  {
    id: 'seo-expert',
    title: 'SEO Uzmanı',
    description: '100+ SEO optimized makale',
    icon: Trophy,
    unlocked: false,
    progress: 67,
    maxProgress: 100,
    color: 'text-blue-500'
  },
  {
    id: 'speed-demon',
    title: 'Hız Şeytanı',
    description: '24 saatte 20+ makale ürettiniz',
    icon: Flame,
    unlocked: true,
    progress: 24,
    maxProgress: 20,
    color: 'text-red-500'
  }
];

interface TemplateHubProps {
  setLoading: (loading: boolean) => void;
}

export default function TemplateHub({ setLoading }: TemplateHubProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [timeOfDay, setTimeOfDay] = useState('');
  const [userName] = useState('Kullanıcı'); // Gerçek kullanıcı adı backend'den gelecek
  const [loadingTemplate, setLoadingTemplate] = useState<string | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('Günaydın');
    else if (hour < 18) setTimeOfDay('İyi günler');
    else setTimeOfDay('İyi akşamlar');
  }, []);

  const categories = ['Tümü', 'AI', 'Toplu', 'WordPress', 'Özel'];

  const filteredTemplates = selectedCategory === 'Tümü' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory);

  const handleTemplateClick = (template: Template) => {
    setLoadingTemplate(template.id);
    setLoading(true);
    
    // Simulated loading delay for smooth UX
    setTimeout(() => {
      window.location.href = `?page=${template.route}`;
    }, 800);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Kolay': return 'bg-green-100 text-green-800';
      case 'Orta': return 'bg-yellow-100 text-yellow-800';
      case 'İleri': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'AI': return Brain;
      case 'Toplu': return Users;
      case 'WordPress': return FileText;
      case 'Özel': return Sparkles;
      default: return FileText;
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <TooltipProvider>
        {/* Header Section */}
        <div className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg mb-6`}>
          <div className="flex items-center justify-between">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold mb-2"
              >
                {timeOfDay}, {userName}! ✨
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-blue-100"
              >
                Hangi şablonla bugün yaratıcılığınızı ortaya çıkaracaksınız?
              </motion.p>
            </div>
            
            {/* Theme Toggle */}
            <div className="flex items-center space-x-3">
              <Sun className={`h-5 w-5 ${!isDarkMode ? 'text-yellow-300' : 'text-gray-400'}`} />
              <Switch
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
                className="data-[state=checked]:bg-purple-600"
              />
              <Moon className={`h-5 w-5 ${isDarkMode ? 'text-purple-300' : 'text-gray-400'}`} />
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Başarılarınız
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                    achievement.unlocked 
                      ? 'border-yellow-200 bg-yellow-50 shadow-lg' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <achievement.icon 
                      className={`h-6 w-6 ${achievement.unlocked ? achievement.color : 'text-gray-400'}`} 
                    />
                    <div>
                      <h4 className={`font-semibold ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                        {achievement.title}
                      </h4>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{achievement.progress}</span>
                      <span>{achievement.maxProgress}</span>
                    </div>
                    <Progress 
                      value={(achievement.progress / achievement.maxProgress) * 100} 
                      className="h-2"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {category !== 'Tümü' && (
                  <div className="h-4 w-4">
                    {React.createElement(getCategoryIcon(category))}
                  </div>
                )}
                <span className="font-medium">{category}</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                onHoverStart={() => setHoveredTemplate(template.id)}
                onHoverEnd={() => setHoveredTemplate(null)}
              >
                <Card className="h-full cursor-pointer transition-all duration-300 hover:shadow-xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${template.color}`}>
                        <template.icon className="h-6 w-6 text-white" />
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        {template.isPopular && (
                          <Badge variant="destructive" className="text-xs">
                            Popüler
                          </Badge>
                        )}
                        {template.isNew && (
                          <Badge className="text-xs bg-green-500">
                            Yeni
                          </Badge>
                        )}
                      </div>
                    </div>

                    <CardTitle className="text-lg mt-3">{template.title}</CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {template.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Features */}
                      <div className="flex flex-wrap gap-1">
                        {template.features.slice(0, 2).map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {template.features.length > 2 && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="outline" className="text-xs">
                                +{template.features.length - 2}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                {template.features.slice(2).map((feature, idx) => (
                                  <div key={idx} className="text-xs">{feature}</div>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{template.estimatedTime}</span>
                        </div>
                        <Badge className={getDifficultyColor(template.difficulty)} variant="secondary">
                          {template.difficulty}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{template.usageCount.toLocaleString()} kullanım</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        onClick={() => handleTemplateClick(template)}
                        disabled={loadingTemplate === template.id}
                        className={`w-full mt-4 bg-gradient-to-r ${template.color} hover:opacity-90 transition-all duration-300`}
                      >
                        {loadingTemplate === template.id ? (
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            />
                            Yükleniyor...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            Şablonu Kullan
                          </div>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Fun Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              Toplam {templates.reduce((acc, t) => acc + t.usageCount, 0).toLocaleString()} şablon kullanımı ile güçlü bir topluluk!
            </span>
          </div>
        </motion.div>
      </TooltipProvider>
    </div>
  );
}