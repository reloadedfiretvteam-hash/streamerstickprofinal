import { useState, useEffect } from 'react';
import { Upload, Trash2, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Product {
  id: string;
  name: string;
}

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
}

export default function SimpleImageManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      loadImages(selectedProduct);
    }
  }, [selectedProduct]);

  const loadProducts = async () => {
    const { data } = await supabase
      .from('products_full')
      .select('id, name')
      .eq('status', 'published')
      .order('name');
    if (data) setProducts(data);
  };

  const loadImages = async (productId: string) => {
    const { data } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order');
    if (data) setImages(data);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedProduct) {
      alert('Please select a product first!');
      return;
    }

    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedProduct}-${Date.now()}-${i}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        await supabase.from('product_images').insert({
          product_id: selectedProduct,
          image_url: publicUrl,
          alt_text: file.name,
          is_primary: images.length === 0 && i === 0
        });
      }
    }

    setUploading(false);
    loadImages(selectedProduct);
  };

  const handleDelete = async (imageId: string, imageUrl: string) => {
    if (!confirm('Delete this image?')) return;

    const fileName = imageUrl.split('/').pop();
    if (fileName) {
      await supabase.storage.from('product-images').remove([fileName]);
    }
    await supabase.from('product_images').delete().eq('id', imageId);
    loadImages(selectedProduct);
  };

  const setPrimary = async (imageId: string) => {
    await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', selectedProduct);

    await supabase
      .from('product_images')
      .update({ is_primary: true })
      .eq('id', imageId);

    loadImages(selectedProduct);
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-white mb-6">Image Manager</h2>

      <div className="bg-gray-900 rounded-xl p-6 mb-6">
        <label className="block text-white font-semibold mb-3 text-lg">Select Product</label>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg font-semibold focus:border-orange-500 focus:outline-none"
        >
          <option value="">Choose a product...</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>

      {selectedProduct && (
        <>
          <div className="bg-gray-900 rounded-xl p-6 mb-6">
            <label className="flex items-center justify-center gap-3 px-6 py-8 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-orange-500 hover:bg-gray-850 transition">
              <Upload className="w-8 h-8 text-orange-400" />
              <span className="text-xl font-bold text-white">
                {uploading ? 'Uploading...' : 'Click to Upload Images'}
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <p className="text-center text-gray-400 mt-3">
              Upload multiple images at once (JPG, PNG, WEBP, GIF)
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="relative group bg-gray-900 rounded-xl overflow-hidden border-2 border-gray-700 hover:border-orange-500 transition"
              >
                <img
                  src={image.image_url}
                  alt=""
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  {!image.is_primary && (
                    <button
                      onClick={() => setPrimary(image.id)}
                      className="p-3 bg-yellow-500 hover:bg-yellow-600 rounded-lg transition"
                      title="Set as primary"
                    >
                      <Star className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(image.id, image.image_url)}
                    className="p-3 bg-red-500 hover:bg-red-600 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                {image.is_primary && (
                  <div className="absolute top-2 left-2 px-3 py-1 bg-yellow-500 rounded-lg font-bold text-sm">
                    PRIMARY
                  </div>
                )}
              </div>
            ))}
            {images.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-400">
                No images for this product yet. Upload some above!
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
