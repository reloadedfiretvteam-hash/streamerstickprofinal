/**
 * Enhanced Product Image Upload Component
 * 
 * Features:
 * - Drag-and-drop support
 * - Multiple file upload (batch)
 * - Gallery preview with primary image selection
 * - Instant upload to Supabase Storage
 * - Visual feedback during upload
 * - Image management (delete, set primary)
 */

import { useState, useRef, DragEvent } from 'react';
import { Upload, X, Image as ImageIcon, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { uploadImagesBatch, deleteImageFromSupabase } from '../../utils/imageManager';

interface UploadedImage {
  id: string;
  url: string;
  isPrimary: boolean;
  file?: File;
}

interface EnhancedProductImageUploadProps {
  productId?: string;
  currentImageUrl?: string;
  onImageChange: (imageUrl: string) => void;
  allowMultiple?: boolean;
}

export default function EnhancedProductImageUpload({
  productId,
  currentImageUrl,
  onImageChange,
  allowMultiple = false,
}: EnhancedProductImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>(
    currentImageUrl ? [{ id: 'current', url: currentImageUrl, isPrimary: true }] : []
  );
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, fileName: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Validate file types
    const validFiles = fileArray.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: `${file.name} is not an image`,
          variant: 'destructive',
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);

    try {
      // Upload all files
      const results = await uploadImagesBatch(
        validFiles,
        productId,
        (current, total, fileName) => {
          setUploadProgress({ current, total, fileName });
        }
      );

      // Process results
      const successfulUploads = results.filter(r => r.success && r.supabaseUrl);
      
      if (successfulUploads.length === 0) {
        throw new Error('All uploads failed');
      }

      // Add to images array
      const newImages: UploadedImage[] = successfulUploads.map((result, index) => ({
        id: `${Date.now()}-${index}`,
        url: result.supabaseUrl!,
        isPrimary: images.length === 0 && index === 0,
        file: result.file,
      }));

      setImages(prev => [...prev, ...newImages]);

      // If this is the first/primary image, update the parent
      if (images.length === 0 && newImages.length > 0) {
        onImageChange(newImages[0].url);
      }

      toast({
        title: 'Upload successful',
        description: `${successfulUploads.length} image(s) uploaded successfully`,
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload images',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0, fileName: '' });
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleDeleteImage = async (imageId: string, imageUrl: string) => {
    if (!confirm('Delete this image?')) return;

    try {
      // Try to delete from Supabase if it's a Supabase URL
      if (imageUrl.includes('supabase')) {
        const deleteResult = await deleteImageFromSupabase(imageUrl);
        if (!deleteResult.success) {
          console.warn('Failed to delete from Supabase:', deleteResult.error);
        }
      }

      // Remove from local state
      const deletedImage = images.find(img => img.id === imageId);
      const remainingImages = images.filter(img => img.id !== imageId);
      
      // If deleted image was primary, create new array with first image as primary
      let updatedImages = remainingImages;
      if (deletedImage?.isPrimary && remainingImages.length > 0) {
        updatedImages = remainingImages.map((img, index) => ({
          ...img,
          isPrimary: index === 0,
        }));
        onImageChange(updatedImages[0].url);
      } else if (remainingImages.length === 0) {
        onImageChange('');
      }
      
      setImages(updatedImages);

      toast({
        title: 'Image deleted',
        description: 'Image removed successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Delete failed',
        description: error.message || 'Failed to delete image',
        variant: 'destructive',
      });
    }
  };

  const handleSetPrimary = (imageId: string) => {
    const updatedImages = images.map(img => ({
      ...img,
      isPrimary: img.id === imageId,
    }));
    setImages(updatedImages);
    
    const primaryImage = updatedImages.find(img => img.isPrimary);
    if (primaryImage) {
      onImageChange(primaryImage.url);
      toast({
        title: 'Primary image set',
        description: 'This image will be displayed first',
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-orange-500 bg-orange-500/10'
            : 'border-slate-600 hover:border-slate-500'
        } ${uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={allowMultiple}
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="space-y-3">
            <Loader2 className="w-12 h-12 mx-auto text-orange-400 animate-spin" />
            <p className="text-white font-medium">
              Uploading {uploadProgress.current} of {uploadProgress.total}
            </p>
            <p className="text-sm text-slate-400">{uploadProgress.fileName}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className="w-12 h-12 mx-auto text-slate-400" />
            <div>
              <p className="text-white font-medium">
                Drop images here or click to browse
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {allowMultiple ? 'Upload multiple images' : 'Upload single image'} (JPG, PNG, WEBP, GIF)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white">
            Uploaded Images ({images.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className={`relative group bg-slate-800 rounded-lg overflow-hidden border-2 transition ${
                  image.isPrimary
                    ? 'border-orange-500 ring-2 ring-orange-500/50'
                    : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className="aspect-square">
                  <img
                    src={image.url}
                    alt="Product"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  {!image.isPrimary && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleSetPrimary(image.id)}
                      className="gap-1"
                    >
                      <Star className="w-3 h-3" />
                      Primary
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteImage(image.id, image.url)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Primary badge */}
                {image.isPrimary && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-orange-500 rounded text-xs font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Primary
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && !uploading && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
          <ImageIcon className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">
            No images uploaded yet. Add some images above.
          </p>
        </div>
      )}
    </div>
  );
}
