import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileStack, Play } from "lucide-react";
import { PageType } from "@/pages/Dashboard";

interface BulkArticlesProps {
  setCurrentPage: (page: PageType) => void;
}

export default function BulkArticles({ setCurrentPage }: BulkArticlesProps) {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <h1 className="text-2xl font-semibold text-gray-800 mb-8">
        Toplu Oluşturulan Makalelerim
      </h1>

      {/* Main Content Card */}
      <Card className="border-0 shadow-none">
        <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center">
          {/* Stacked Files Icon */}
          <div className="relative mb-8">
            <div className="w-20 h-16 bg-purple-200 rounded-lg absolute -top-2 -left-2 opacity-60"></div>
            <div className="w-20 h-16 bg-purple-300 rounded-lg absolute -top-1 -left-1 opacity-80"></div>
            <div className="w-20 h-16 bg-purple-500 rounded-lg relative flex items-center justify-center">
              <FileStack className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Empty State Message */}
          <h2 className="text-lg font-medium text-gray-700 mb-2">
            Toplu oluşturulan bir makaleniz bulunmuyor.
          </h2>
          
          <p className="text-gray-500 mb-8 max-w-md">
            Aşağıdaki butonlara tıklayarak toplu makale oluşturabilirsiniz.
          </p>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <Button
              onClick={() => setCurrentPage('bulk-template-v1')}
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 border-0 px-6 py-3"
              variant="outline"
            >
              Toplu Makale Oluştur V1
            </Button>
            
            <Button
              onClick={() => setCurrentPage('bulk-template-v2')}
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 border-0 px-6 py-3"
              variant="outline"
            >
              Toplu Makale Oluştur V2
            </Button>
          </div>

          {/* YouTube Video Link */}
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-3 text-red-600">
            <Play className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">
              Toplu Makale Oluşturma Yardım Videosu
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}