import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ModernHtmlEditor from "./ModernHtmlEditor";


interface Article {
  id: number;
  title: string;
  content: string;
  htmlContent?: string;
  status: string;
  category?: string;
  focusKeyword?: string;
  metaDescription?: string;
  summary?: string;
}

interface ArticleEditModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ArticleEditModal({ article, isOpen, onClose }: ArticleEditModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    status: "draft",
    category: "",
    focusKeyword: "",
    metaDescription: "",
  });

  // Update form data when article changes
  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title || "",
        content: article.content || "",
        status: article.status || "draft",
        category: article.category || "",
        focusKeyword: article.focusKeyword || "",
        metaDescription: article.metaDescription || "",
      });
    }
  }, [article]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!article) return;
      await apiRequest('PUT', `/api/articles/${article.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      toast({
        title: "Makale Güncellendi",
        description: "Makale başarıyla güncellendi.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Makale güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Hata",
        description: "Makale başlığı gerekli.",
        variant: "destructive",
      });
      return;
    }

    const wordCount = formData.content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    updateMutation.mutate({
      ...formData,
      wordCount,
      readingTime,
      htmlContent: formData.content
    });
  };

  if (!article) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Makale Düzenle</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Başlık</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Makale başlığı"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Durum</label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Taslak</SelectItem>
                  <SelectItem value="published">Yayınlandı</SelectItem>
                  <SelectItem value="archived">Arşivlendi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Kategori</label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Kategori"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Odak Anahtar Kelime</label>
              <Input
                value={formData.focusKeyword}
                onChange={(e) => setFormData({ ...formData, focusKeyword: e.target.value })}
                placeholder="Odak anahtar kelime"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Meta Açıklama</label>
            <textarea
              value={formData.metaDescription}
              onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
              placeholder="Meta açıklama (150-160 karakter)"
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-xs text-slate-500">
              {formData.metaDescription.length}/160 karakter
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">İçerik</label>
            <ModernHtmlEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              placeholder="Makale içeriğinizi buraya yazın..."
              height="400px"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button 
              type="submit" 
              disabled={updateMutation.isPending}
              className="bg-primary-600 hover:bg-primary-700"
            >
              {updateMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Güncelleniyor...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  Güncelle
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}