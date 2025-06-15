import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Users, History, MessageSquare, Save, Share2, Clock, GitBranch, Eye, Edit3, Plus } from "lucide-react";

interface CollaborativeEditorProps {
  setLoading: (loading: boolean) => void;
}

interface Version {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
  changes: string;
  version: string;
}

interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: Date;
  position: number;
  resolved: boolean;
}

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  cursor?: number;
}

export default function CollaborativeEditor({ setLoading }: CollaborativeEditorProps) {
  const [documentContent, setDocumentContent] = useState("");
  const [documentTitle, setDocumentTitle] = useState("Yeni Döküman");
  const [selectedText, setSelectedText] = useState("");
  const [commentText, setCommentText] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentPosition, setCommentPosition] = useState(0);
  const [activeVersion, setActiveVersion] = useState("current");
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Mock data for demonstration
  const [versions] = useState<Version[]>([
    {
      id: "v1.0",
      content: "İlk taslak içerik oluşturuldu.",
      author: "Ahmet Yılmaz",
      timestamp: new Date(Date.now() - 3600000),
      changes: "İlk versiyon",
      version: "1.0"
    },
    {
      id: "v1.1",
      content: "Başlık ve giriş paragrafı eklendi.",
      author: "Ayşe Demir",
      timestamp: new Date(Date.now() - 1800000),
      changes: "Başlık ve giriş eklendi",
      version: "1.1"
    },
    {
      id: "current",
      content: documentContent,
      author: "Mehmet Kaya",
      timestamp: new Date(),
      changes: "Aktif düzenleme",
      version: "1.2"
    }
  ]);

  const [comments, setComments] = useState<Comment[]>([
    {
      id: "c1",
      author: "Fatma Öz",
      avatar: "/avatars/fatma.jpg",
      content: "Bu bölümü daha detaylı açıklayabiliriz",
      timestamp: new Date(Date.now() - 1200000),
      position: 150,
      resolved: false
    },
    {
      id: "c2",
      author: "Can Arslan",
      avatar: "/avatars/can.jpg",
      content: "Harika bir başlangıç! Devam edelim",
      timestamp: new Date(Date.now() - 600000),
      position: 50,
      resolved: true
    }
  ]);

  const [collaborators] = useState<Collaborator[]>([
    {
      id: "1",
      name: "Ahmet Yılmaz",
      avatar: "/avatars/ahmet.jpg",
      status: "online",
      cursor: 120
    },
    {
      id: "2",
      name: "Ayşe Demir", 
      avatar: "/avatars/ayse.jpg",
      status: "online",
      cursor: 340
    },
    {
      id: "3",
      name: "Mehmet Kaya",
      avatar: "/avatars/mehmet.jpg",
      status: "away"
    },
    {
      id: "4",
      name: "Fatma Öz",
      avatar: "/avatars/fatma.jpg",
      status: "offline"
    }
  ]);

  const saveDocumentMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/save-collaborative-document', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Kaydedildi",
        description: "Döküman başarıyla kaydedildi",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Döküman kaydedilemedi",
        variant: "destructive"
      });
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/add-comment', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      setCommentText("");
      setShowCommentBox(false);
      toast({
        title: "Yorum Eklendi",
        description: "Yorumunuz başarıyla kaydedildi",
      });
    }
  });

  const handleTextSelection = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      
      if (start !== end) {
        const selected = documentContent.substring(start, end);
        setSelectedText(selected);
        setCommentPosition(start);
        setShowCommentBox(true);
      }
    }
  };

  const addComment = () => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: `c${Date.now()}`,
      author: "Siz",
      avatar: "/avatars/default.jpg",
      content: commentText,
      timestamp: new Date(),
      position: commentPosition,
      resolved: false
    };

    setComments(prev => [...prev, newComment]);
    addCommentMutation.mutate(newComment);
  };

  const resolveComment = (commentId: string) => {
    setComments(prev => 
      prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, resolved: true }
          : comment
      )
    );
  };

  const saveDocument = () => {
    saveDocumentMutation.mutate({
      title: documentTitle,
      content: documentContent,
      version: "1.2"
    });
  };

  const shareDocument = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Kopyalandı",
      description: "Döküman paylaşım linki panoya kopyalandı",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short'
    }).format(date);
  };

  return (
    <div className="pb-20">
      <div className="p-2 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold">İşbirliği Editörü</h1>
              <p className="text-sm text-muted-foreground">Ekip çalışması ve sürüm kontrolü</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={saveDocument} disabled={saveDocumentMutation.isPending}>
              <Save className="w-4 h-4 mr-1" />
              Kaydet
            </Button>
            <Button variant="outline" onClick={shareDocument}>
              <Share2 className="w-4 h-4 mr-1" />
              Paylaş
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Input
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    className="text-xl font-semibold border-0 p-0 focus:ring-0"
                    placeholder="Döküman Başlığı"
                  />
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      <GitBranch className="w-3 h-3 mr-1" />
                      v1.2
                    </Badge>
                    <Badge variant="secondary">
                      <Eye className="w-3 h-3 mr-1" />
                      {collaborators.filter(c => c.status === 'online').length} online
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    value={documentContent}
                    onChange={(e) => setDocumentContent(e.target.value)}
                    onMouseUp={handleTextSelection}
                    placeholder="Dökümanınızı yazmaya başlayın..."
                    rows={20}
                    className="resize-none font-mono text-sm leading-relaxed"
                  />
                  
                  {/* Comment indicators */}
                  {comments.filter(c => !c.resolved).map(comment => (
                    <div
                      key={comment.id}
                      className="absolute right-2 w-4 h-4 bg-yellow-400 rounded-full cursor-pointer"
                      style={{ 
                        top: `${Math.min((comment.position / documentContent.length) * 100, 95)}%` 
                      }}
                      title={`${comment.author}: ${comment.content}`}
                    />
                  ))}
                </div>

                {/* Comment Box */}
                {showCommentBox && (
                  <div className="mt-4 p-4 border rounded-lg bg-yellow-50">
                    <div className="mb-2 text-sm text-muted-foreground">
                      Seçili metin: "{selectedText}"
                    </div>
                    <Textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Yorumunuzu yazın..."
                      rows={3}
                      className="mb-2"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={addComment}>
                        <Plus className="w-4 h-4 mr-1" />
                        Yorum Ekle
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowCommentBox(false)}>
                        İptal
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
                  <span>{documentContent.length} karakter</span>
                  <span>Son kaydedilme: {formatTime(new Date())}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Active Collaborators */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5" />
                  Ekip Üyeleri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {collaborators.map(collaborator => (
                    <div key={collaborator.id} className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={collaborator.avatar} />
                          <AvatarFallback>{collaborator.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(collaborator.status)}`} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{collaborator.name}</div>
                        <div className="text-xs text-muted-foreground capitalize">{collaborator.status}</div>
                      </div>
                      {collaborator.cursor !== undefined && (
                        <Edit3 className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Comments and Versions Tabs */}
            <Tabs defaultValue="comments" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="comments">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Yorumlar
                </TabsTrigger>
                <TabsTrigger value="versions">
                  <History className="w-4 h-4 mr-1" />
                  Sürümler
                </TabsTrigger>
              </TabsList>

              <TabsContent value="comments">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Yorumlar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-4">
                        {comments.map(comment => (
                          <div key={comment.id} className={`p-3 rounded-lg border ${comment.resolved ? 'bg-gray-50 opacity-60' : 'bg-white'}`}>
                            <div className="flex items-start gap-3">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={comment.avatar} />
                                <AvatarFallback>{comment.author[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium">{comment.author}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatTime(comment.timestamp)}
                                  </span>
                                  {comment.resolved && (
                                    <Badge variant="secondary" className="text-xs">Çözüldü</Badge>
                                  )}
                                </div>
                                <p className="text-sm">{comment.content}</p>
                                {!comment.resolved && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="mt-2 h-6 text-xs"
                                    onClick={() => resolveComment(comment.id)}
                                  >
                                    Çözüldü olarak işaretle
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="versions">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sürüm Geçmişi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-3">
                        {versions.map(version => (
                          <div
                            key={version.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              activeVersion === version.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                            }`}
                            onClick={() => setActiveVersion(version.id)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant={version.id === 'current' ? 'default' : 'outline'}>
                                {version.version}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(version.timestamp)}
                              </span>
                            </div>
                            <div className="text-sm font-medium mb-1">{version.changes}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {version.author}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}