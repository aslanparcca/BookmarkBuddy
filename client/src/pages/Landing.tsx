import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardContent className="pt-8 pb-8 px-8">
          <div className="text-center">
            <div className="h-16 w-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-brain text-white text-2xl"></i>
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              AI İçerik Paneli
            </h1>
            
            <p className="text-slate-600 text-lg mb-2">
              Gemini API Destekli
            </p>
            
            <p className="text-slate-500 mb-8">
              Yapay zeka ile profesyonel içerik oluşturun, 
              toplu makale üretin ve WordPress entegrasyonu yapın.
            </p>
            
            <div className="space-y-4">
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 text-lg"
                size="lg"
              >
                <i className="fas fa-sign-in-alt mr-2"></i>
                Giriş Yap
              </Button>
              
              <div className="flex items-center justify-center space-x-6 text-sm text-slate-500">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-check text-emerald-500"></i>
                  <span>AI İçerik Üretimi</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-check text-emerald-500"></i>
                  <span>Toplu Makale</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-check text-emerald-500"></i>
                  <span>WordPress Entegrasyonu</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
