import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface Article {
  id: number;
  title: string;
  content: string;
  htmlContent?: string;
  status: string;
  category?: string;
  focusKeyword?: string;
  wordCount: number;
  readingTime: number;
  metaDescription?: string;
  summary?: string;
  createdAt: string;
}

interface ArticleViewModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (article: Article) => void;
}

export default function ArticleViewModal({ article, isOpen, onClose, onEdit }: ArticleViewModalProps) {
  if (!article) return null;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Taslak', variant: 'secondary' as const },
      published: { label: 'Yayınlandı', variant: 'default' as const },
      archived: { label: 'Arşivlendi', variant: 'outline' as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{article.title}</span>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEdit(article)}
              >
                <i className="fas fa-edit mr-2"></i>
                Düzenle
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onClose}
              >
                <i className="fas fa-times"></i>
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Article Metadata */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-slate-700">Durum:</span>
                <div className="mt-1">{getStatusBadge(article.status)}</div>
              </div>
              <div>
                <span className="font-medium text-slate-700">Kelime Sayısı:</span>
                <div className="mt-1 text-slate-600">{article.wordCount} kelime</div>
              </div>
              <div>
                <span className="font-medium text-slate-700">Okuma Süresi:</span>
                <div className="mt-1 text-slate-600">{article.readingTime} dakika</div>
              </div>
              <div>
                <span className="font-medium text-slate-700">Oluşturulma:</span>
                <div className="mt-1 text-slate-600">
                  {format(new Date(article.createdAt), 'dd MMMM yyyy', { locale: tr })}
                </div>
              </div>
            </div>

            {article.focusKeyword && (
              <div className="mt-4">
                <span className="font-medium text-slate-700">Odak Anahtar Kelime:</span>
                <div className="mt-1">
                  <Badge variant="outline">{article.focusKeyword}</Badge>
                </div>
              </div>
            )}

            {article.metaDescription && (
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700">Meta Açıklama:</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      article.metaDescription.length >= 140 && article.metaDescription.length <= 160
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {article.metaDescription.length} karakter
                    </span>
                    {article.metaDescription.length >= 140 && article.metaDescription.length <= 160 && (
                      <span className="text-xs text-green-600">✓ SEO Uyumlu</span>
                    )}
                  </div>
                </div>
                <div className="mt-1 text-slate-600 text-sm">{article.metaDescription}</div>
              </div>
            )}
          </div>

          {/* Article Summary */}
          {article.summary && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <div className="flex items-center mb-2">
                <i className="fas fa-info-circle text-blue-500 mr-2"></i>
                <h3 className="font-medium text-blue-900">Makale Özeti</h3>
              </div>
              <p className="text-blue-800 text-sm leading-relaxed">{article.summary}</p>
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-slate max-w-none">
            <div 
              className="article-content"
              dangerouslySetInnerHTML={{ 
                __html: article.htmlContent || article.content?.replace(/\n/g, '<br>') || '' 
              }} 
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}