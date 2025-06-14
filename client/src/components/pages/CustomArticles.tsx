import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Youtube, Clock } from "lucide-react";

export default function CustomArticles() {
  return (
    <div className="w-full">
      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col items-center mt-4">
            <div className="w-30 mb-4 mt-4">
              <Clock className="w-30 h-30 text-gray-400" />
            </div>
            <div className="text-base mb-2 text-center font-medium">
              Özgünleştirdiğiniz bir makaleniz bulunmuyor.
            </div>
            <div className="text-base mb-4 text-center font-medium">
              Aşağıdaki butona tıklayarak yeni bir makale özgünleştirebilirsiniz.
            </div>
            <div className="text-lg mb-5 text-center">
              <Button 
                className="font-medium mb-4"
                onClick={() => window.location.href = '/content-rewrite/create'}
              >
                Makale Özgünleştir
              </Button>
              <br />
              <Button 
                variant="destructive" 
                className="font-medium"
              >
                <Youtube className="w-5 h-5 mr-2" />
                Makale Özgünleştirme Yardım Videosu
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}