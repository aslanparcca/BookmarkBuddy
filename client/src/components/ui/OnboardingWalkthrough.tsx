import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'AI İçerik Paneline Hoş Geldiniz!',
    description: 'Gemini API ile güçlendirilmiş bu platform, yüksek kaliteli içerik üretmenize yardımcı olacak.',
    target: '.sidebar-wrapper',
    position: 'right'
  },
  {
    id: 'sidebar',
    title: 'Navigasyon Menüsü',
    description: 'Sol menüden tüm özelliklerimize erişebilirsiniz. Ana sayfa, içerikleriniz ve toplu işlemler burada.',
    target: '.sidebar-wrapper',
    position: 'right'
  },
  {
    id: 'api-keys',
    title: 'API Anahtarlarınız',
    description: 'Kendi Gemini API anahtarlarınızı ekleyerek sınırsız içerik üretebilirsiniz.',
    target: '[data-page="api-keys"]',
    position: 'right'
  },
  {
    id: 'content-creation',
    title: 'İçerik Üretimi',
    description: 'WP Makalesi, URL Rewrite ve toplu makale oluşturma araçlarımızla hızlıca içerik üretin.',
    target: '[data-page="wp-editor"]',
    position: 'right'
  },
  {
    id: 'voice-features',
    title: 'Ses Özellikleri',
    description: 'Metinlerinizi seslendirin veya ses dosyalarınızı yönetin.',
    target: '[data-page="voice-reader"]',
    position: 'right'
  }
];

interface OnboardingWalkthroughProps {
  onComplete: () => void;
}

export default function OnboardingWalkthrough({ onComplete }: OnboardingWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const step = onboardingSteps[currentStep];
    if (step) {
      const element = document.querySelector(step.target) as HTMLElement;
      setTargetElement(element);
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.style.position = 'relative';
        element.style.zIndex = '1001';
        element.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.5)';
        element.style.borderRadius = '8px';
      }
    }

    return () => {
      if (targetElement) {
        targetElement.style.position = '';
        targetElement.style.zIndex = '';
        targetElement.style.boxShadow = '';
        targetElement.style.borderRadius = '';
      }
    };
  }, [currentStep, targetElement]);

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = () => {
    setIsVisible(false);
    localStorage.setItem('onboardingCompleted', 'true');
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  if (!isVisible) return null;

  const step = onboardingSteps[currentStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50"
        />

        {/* Walkthrough Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                     bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">{currentStep + 1}</span>
              </div>
              <span className="text-sm text-gray-500">
                {currentStep + 1} / {onboardingSteps.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={skipOnboarding}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
              className="bg-gradient-to-r from-purple-500 to-purple-700 h-2 rounded-full"
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Content */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {step.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Önceki
            </Button>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={skipOnboarding}
                className="text-gray-600"
              >
                Atla
              </Button>
              <Button
                onClick={nextStep}
                className="bg-gradient-to-r from-purple-500 to-purple-700 text-white"
              >
                {currentStep === onboardingSteps.length - 1 ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Tamamla
                  </>
                ) : (
                  <>
                    Sonraki
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Character Illustration */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-center"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full">
              <span className="text-2xl">🤖</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">AI Asistanınız size rehberlik ediyor</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}