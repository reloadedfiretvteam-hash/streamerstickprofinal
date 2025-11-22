import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ImageUploadProps {
  productId: string;
  existingImages: Array<{
    id: string;
    image_url: string;
    alt_text: string;
    is_primary: boolean;
    sort_order: number;
  }>;
  onImagesChange: () => void;
}

export default function ImageUpload({ productId, existingImages, onImagesChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress('Uploading images...');

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${productId}-${Date.now()}-${i}.${fileExt}`;
        const filePath = `${fileName}`;

        setUploadProgress(`Uploading ${i + 1} of ${files.length}...`);

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        const { error: dbError } = await supabase
          .from('product_images')
          .insert({
            product_id: productId,
            image_url: publicUrl,
            alt_text: file.name,
            sort_order: existingImages.length + i,
            is_primary: existingImages.length === 0 && i === 0
          });

        if (dbError) throw dbError;
      }

      setUploadProgress('Upload complete!');
      setTimeout(() => {
        setUploadProgress('');
        onImagesChange();
      }, 1000);
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
      setUploadProgress('');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string, imageUrl: string) => {
    if (!confirm('Delete this image?')) return;

    try {
      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('product-images')
          .remove([fileName]);
      }

      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      onImagesChange();
    } catch (error: any) {
      alert(`Delete failed: ${error.message}`);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', productId);

      const { error } = await supabase
        .from('product_images')
        .update({ is_primary: true })
        .eq('id', imageId);

      if (error) throw error;

      onImagesChange();
    } catch (error: any) {
      alert(`Update failed: ${error.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Product Images</h3>
        <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg cursor-pointer transition">
          <Upload className="w-4 h-4" />
          <span className="text-sm font-semibold">Upload Images</span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {uploadProgress && (
        <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4 text-center">
          <p className="text-blue-400">{uploadProgress}</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {existingImages.map((image) => (
          <div
            key={image.id}
            className="relative group bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-700 hover:border-orange-500 transition"
          >
            <img
              src={image.image_url}
              alt={image.alt_text}
              className="w-full h-32 object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
              {!image.is_primary && (
                <button
                  onClick={() => handleSetPrimary(image.id)}
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded text-xs font-semibold"
                >
                  Set Primary
                </button>
              )}
              <button
                onClick={() => handleDeleteImage(image.id, image.image_url)}
                className="p-2 bg-red-500 hover:bg-red-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {image.is_primary && (
              <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 rounded text-xs font-semibold">
                Primary
              </div>
            )}
          </div>
        ))}
        {existingImages.length === 0 && (
          <div className="col-span-2 md:col-span-4 bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
            <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No images yet. Upload some images above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
