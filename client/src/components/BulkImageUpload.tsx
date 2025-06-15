import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface BulkImageUploadProps {
  onImagesUploaded?: (images: any[]) => void;
  maxImages?: number;
}

export default function BulkImageUpload({ onImagesUploaded, maxImages = 20 }: BulkImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing images
  const { data: existingImages = [] } = useQuery<any[]>({
    queryKey: ['/api/images'],
    retry: false,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      
      const response = await fetch('/api/images/bulk-upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Başarılı!",
        description: `${data.images.length} resim başarıyla yüklendi`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/images'] });
      setSelectedFiles([]);
      
      if (onImagesUploaded) {
        onImagesUploaded(data.images);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Resim yükleme başarısız",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      toast({
        title: "Uyarı",
        description: "Sadece resim dosyaları kabul edilir",
        variant: "destructive",
      });
    }
    
    const totalFiles = selectedFiles.length + imageFiles.length;
    if (totalFiles > maxImages) {
      toast({
        title: "Uyarı",
        description: `En fazla ${maxImages} resim yükleyebilirsiniz`,
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFiles(prev => [...prev, ...imageFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Uyarı",
        description: "Lütfen yüklenecek resimleri seçin",
        variant: "destructive",
      });
      return;
    }
    
    uploadMutation.mutate(selectedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      const totalFiles = selectedFiles.length + imageFiles.length;
      if (totalFiles > maxImages) {
        toast({
          title: "Uyarı",
          description: `En fazla ${maxImages} resim yükleyebilirsiniz`,
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFiles(prev => [...prev, ...imageFiles]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Alt Başlık Resimleri Yükle
            </h3>
            <p className="text-gray-600 mb-4">
              Toplu resim yükleyerek sistem otomatik olarak ilgili alt başlıklara yerleştirecek
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="mb-2"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Resim Seç (Maksimum {maxImages})
            </Button>
            <p className="text-sm text-gray-500">
              Veya resimleri buraya sürükleyip bırakın
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h4 className="font-medium mb-4">Seçilen Resimler ({selectedFiles.length})</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative">
                  <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                </div>
              ))}
            </div>
            <Button
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
              className="w-full"
            >
              {uploadMutation.isPending ? "Yükleniyor..." : `${selectedFiles.length} Resmi Yükle`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h4 className="font-medium mb-4">Yüklenen Resimler ({existingImages.length})</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {existingImages.slice(0, 8).map((image: any) => (
                <div key={image.id} className="relative">
                  <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={image.url}
                      alt={image.altText}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1 truncate">{image.originalName}</p>
                </div>
              ))}
            </div>
            {existingImages.length > 8 && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                +{existingImages.length - 8} resim daha
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}