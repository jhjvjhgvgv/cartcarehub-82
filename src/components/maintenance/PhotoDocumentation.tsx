import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Camera, 
  Upload, 
  X,
  Image as ImageIcon,
  Calendar
} from "lucide-react";
import { format } from "date-fns";

interface Photo {
  id: string;
  url: string;
  caption: string;
  timestamp: string;
  type: 'before' | 'during' | 'after';
}

interface PhotoDocumentationProps {
  workOrderId: string;
  cartQrCode: string;
}

export function PhotoDocumentation({ workOrderId, cartQrCode }: PhotoDocumentationProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [photoType, setPhotoType] = useState<Photo['type']>('during');
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      // In a real app, you would upload to Supabase Storage
      // For now, we'll create a local preview
      const file = files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const newPhoto: Photo = {
          id: `photo-${Date.now()}`,
          url: reader.result as string,
          caption: caption || `${photoType} repair photo`,
          timestamp: new Date().toISOString(),
          type: photoType,
        };

        setPhotos(prev => [...prev, newPhoto]);
        setCaption('');
        
        toast({
          title: "Photo Added",
          description: "Photo has been documented for this work order",
        });
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: "Failed to upload photo",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
    toast({
      title: "Photo Removed",
      description: "Photo has been removed from documentation",
    });
  };

  const getTypeBadge = (type: Photo['type']) => {
    const variants: Record<Photo['type'], string> = {
      before: 'bg-blue-100 text-blue-800',
      during: 'bg-yellow-100 text-yellow-800',
      after: 'bg-green-100 text-green-800',
    };
    return <Badge className={variants[type]}>{type}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Photo Documentation
        </CardTitle>
        <CardDescription>
          Document the repair process with before, during, and after photos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Section */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Photo Type</Label>
              <div className="flex gap-2">
                {(['before', 'during', 'after'] as const).map((type) => (
                  <Button
                    key={type}
                    variant={photoType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPhotoType(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="caption">Caption (Optional)</Label>
              <Input
                id="caption"
                placeholder="Add a description..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>
          </div>

          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
              id="photo-upload"
            />
            <label htmlFor="photo-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG up to 10MB
              </p>
            </label>
          </div>
        </div>

        {/* Photo Gallery */}
        {photos.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Uploaded Photos ({photos.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <Card key={photo.id}>
                  <CardContent className="p-3">
                    <div className="relative aspect-video bg-muted rounded-md overflow-hidden mb-3">
                      <img 
                        src={photo.url} 
                        alt={photo.caption}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() => removePhoto(photo.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        {getTypeBadge(photo.type)}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(photo.timestamp), 'MMM dd, HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{photo.caption}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Before</p>
              <p className="text-2xl font-bold">
                {photos.filter(p => p.type === 'before').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">During</p>
              <p className="text-2xl font-bold">
                {photos.filter(p => p.type === 'during').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">After</p>
              <p className="text-2xl font-bold">
                {photos.filter(p => p.type === 'after').length}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
