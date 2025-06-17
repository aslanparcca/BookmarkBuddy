import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Sparkles, Brain, Mic, Image, Globe, Zap } from "lucide-react";

interface EmptyStateProps {
  type: 'articles' | 'voice-files' | 'images' | 'websites' | 'api-keys' | 'seo-jobs' | 'bulk-articles';
  userName?: string;
  onAction?: () => void;
  actionLabel?: string;
}

const emptyStateConfigs = {
  articles: {
    icon: FileText,
    title: "Henüz makale oluşturmamışsınız",
    description: "AI destekli araçlarımızla ilk içeriğinizi oluşturun ve yaratıcılığınızı serbest bırakın",
    illustration: "📝",
    color: "from-blue-500 to-purple-600",
    actionLabel: "İlk Makalenizi Oluşturun",
    tips: ["WP Makalesi ile hızla başlayın", "Toplu makale oluşturarak zaman kazanın", "URL Rewrite ile mevcut içerikleri yenileyin"]
  },
  'voice-files': {
    icon: Mic,
    title: "Ses dosyalarınız burada görünecek",
    description: "Metinlerinizi profesyonel seslendirme ile hayata geçirin",
    illustration: "🎙️",
    color: "from-green-500 to-teal-600",
    actionLabel: "İlk Ses Dosyanızı Oluşturun",
    tips: ["6 farklı ses modelinden seçin", "Türkçe ve İngilizce destekli", "Yüksek kaliteli ses çıktısı"]
  },
  images: {
    icon: Image,
    title: "Resim galeriniz boş görünüyor",
    description: "AI ile benzersiz görseller oluşturun veya mevcut resimlerinizi yükleyin",
    illustration: "🎨",
    color: "from-pink-500 to-rose-600",
    actionLabel: "İlk Resminizi Oluşturun",
    tips: ["DALL-E ile özgün görseller", "Makale başlıkları için otomatik resim", "Toplu resim yükleme"]
  },
  websites: {
    icon: Globe,
    title: "Web sitelerinizi bağlayın",
    description: "WordPress ve diğer platformlarınızı entegre ederek içerik yönetimini kolaylaştırın",
    illustration: "🌐",
    color: "from-indigo-500 to-blue-600",
    actionLabel: "İlk Web Sitenizi Ekleyin",
    tips: ["WordPress REST API entegrasyonu", "Otomatik kategori senkronizasyonu", "SEO plugin desteği"]
  },
  'api-keys': {
    icon: Zap,
    title: "API anahtarlarınızı ekleyin",
    description: "Kendi Gemini API anahtarlarınızla sınırsız içerik üretimi yapın",
    illustration: "🔑",
    color: "from-yellow-500 to-orange-600",
    actionLabel: "İlk API Anahtarınızı Ekleyin",
    tips: ["Google AI Studio'dan ücretsiz alın", "Çoklu anahtar desteği", "Otomatik yük dağılımı"]
  },
  'seo-jobs': {
    icon: Sparkles,
    title: "SEO indeksleme işleriniz",
    description: "Google, Bing ve diğer arama motorlarında içeriklerinizi hızla indeksleyin",
    illustration: "🚀",
    color: "from-purple-500 to-indigo-600",
    actionLabel: "İlk İndeksleme İşinizi Başlatın",
    tips: ["5 arama motoru desteği", "Toplu URL gönderimi", "Gerçek zamanlı ilerleme takibi"]
  },
  'bulk-articles': {
    icon: Brain,
    title: "Toplu makaleleriniz burada",
    description: "Excel şablonları ve toplu işlemlerle yüzlerce makaleyi aynı anda oluşturun",
    illustration: "📊",
    color: "from-cyan-500 to-blue-600",
    actionLabel: "Toplu Makale Oluşturmaya Başlayın",
    tips: ["Excel şablonu ile kolay başlangıç", "20 alt başlık desteği", "Otomatik görsel ekleme"]
  }
};

export default function PersonalizedEmptyState({ type, userName, onAction, actionLabel }: EmptyStateProps) {
  const config = emptyStateConfigs[type];
  const Icon = config.icon;

  const getPersonalizedGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = "Günaydın";
    
    if (hour >= 12 && hour < 17) timeGreeting = "İyi öğleden sonra";
    else if (hour >= 17) timeGreeting = "İyi akşamlar";

    const name = userName?.split('@')[0] || 'Kullanıcı';
    return `${timeGreeting}, ${name}!`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[400px] text-center p-8"
    >
      {/* Character Illustration */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="relative mb-6"
      >
        <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center text-4xl shadow-lg`}>
          {config.illustration}
        </div>
        
        {/* Floating particles */}
        <motion.div
          animate={{ 
            y: [-10, 10, -10],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-2 -right-2 text-2xl"
        >
          ✨
        </motion.div>
      </motion.div>

      {/* Personalized Greeting */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-lg font-medium text-gray-600 mb-2"
      >
        {getPersonalizedGreeting()}
      </motion.p>

      {/* Main Title */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-2xl font-bold text-gray-900 mb-3"
      >
        {config.title}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-gray-600 mb-8 max-w-md leading-relaxed"
      >
        {config.description}
      </motion.p>

      {/* Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8"
      >
        <Button
          onClick={onAction}
          className={`bg-gradient-to-r ${config.color} text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}
        >
          <Icon className="w-5 h-5 mr-2" />
          {actionLabel || config.actionLabel}
        </Button>
      </motion.div>

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-lg"
      >
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-center">
          <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
          İpuçları
        </h4>
        <div className="grid gap-2">
          {config.tips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-md p-3"
            >
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${config.color} mr-3 flex-shrink-0`} />
              {tip}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Motivational Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100"
      >
        <p className="text-sm text-gray-600 italic">
          "Büyük işler, büyük planlardan değil, küçük adımlardan doğar. İlk adımınızı atın!"
        </p>
        <p className="text-xs text-gray-500 mt-1">— AI İçerik Asistanınız</p>
      </motion.div>
    </motion.div>
  );
}