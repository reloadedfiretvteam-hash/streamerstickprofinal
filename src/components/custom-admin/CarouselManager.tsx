import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Eye, EyeOff, MoveUp, MoveDown, Save, X } from 'lucide-react';

interface CarouselSlide {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link_url: string;
  button_text: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function CarouselManager() {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    button_text: 'Learn More',
    is_active: true
  });

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('carousel_slides')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setSlides(data || []);
    } catch (error) {
      console.error('Error loading slides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingSlide) {
        const { error } = await supabase
          .from('carousel_slides')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingSlide.id);

        if (error) throw error;
      } else {
        const maxOrder = Math.max(...slides.map(s => s.sort_order), 0);
        const { error } = await supabase
          .from('carousel_slides')
          .insert({
            ...formData,
            sort_order: maxOrder + 1
          });

        if (error) throw error;
      }

      await loadSlides();
      resetForm();
    } catch (error) {
      console.error('Error saving slide:', error);
      alert('Failed to save slide');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slide?')) return;

    try {
      const { error } = await supabase
        .from('carousel_slides')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadSlides();
    } catch (error) {
      console.error('Error deleting slide:', error);
      alert('Failed to delete slide');
    }
  };

  const toggleActive = async (slide: CarouselSlide) => {
    try {
      const { error } = await supabase
        .from('carousel_slides')
        .update({ is_active: !slide.is_active, updated_at: new Date().toISOString() })
        .eq('id', slide.id);

      if (error) throw error;
      await loadSlides();
    } catch (error) {
      console.error('Error toggling slide:', error);
    }
  };

  const moveSlide = async (slide: CarouselSlide, direction: 'up' | 'down') => {
    const currentIndex = slides.findIndex(s => s.id === slide.id);
    if (currentIndex === -1) return;

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= slides.length) return;

    try {
      const updates = [
        supabase.from('carousel_slides').update({ sort_order: slides[swapIndex].sort_order }).eq('id', slide.id),
        supabase.from('carousel_slides').update({ sort_order: slide.sort_order }).eq('id', slides[swapIndex].id)
      ];

      await Promise.all(updates);
      await loadSlides();
    } catch (error) {
      console.error('Error moving slide:', error);
    }
  };

  const startEdit = (slide: CarouselSlide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      description: slide.description,
      image_url: slide.image_url,
      link_url: slide.link_url,
      button_text: slide.button_text,
      is_active: slide.is_active
    });
    setIsCreating(false);
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingSlide(null);
    setFormData({
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      button_text: 'Learn More',
      is_active: true
    });
  };

  const resetForm = () => {
    setEditingSlide(null);
    setIsCreating(false);
    setFormData({
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      button_text: 'Learn More',
      is_active: true
    });
  };

  if (loading) {
    return <div className="p-8 text-center">Loading carousel...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Carousel Manager</h2>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add New Slide
        </button>
      </div>

      {(isCreating || editingSlide) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">
              {editingSlide ? 'Edit Slide' : 'Create New Slide'}
            </h3>
            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Slide title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input
                type="text"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="/image.jpg"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={2}
                placeholder="Slide description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Link URL (optional)</label>
              <input
                type="text"
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Button Text</label>
              <input
                type="text"
                value={formData.button_text}
                onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Learn More"
              />
            </div>

            <div className="col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="is_active" className="text-sm font-medium">
                Active (show on website)
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save className="w-4 h-4" />
              Save Slide
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`bg-white border rounded-lg p-4 flex items-center gap-4 ${
              !slide.is_active ? 'opacity-60' : ''
            }`}
          >
            <img
              src={slide.image_url}
              alt={slide.title}
              className="w-32 h-20 object-cover rounded"
            />

            <div className="flex-1">
              <h4 className="font-semibold">{slide.title}</h4>
              <p className="text-sm text-gray-600">{slide.description}</p>
              <p className="text-xs text-gray-400 mt-1">Order: {slide.sort_order}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => moveSlide(slide, 'up')}
                disabled={index === 0}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
              >
                <MoveUp className="w-4 h-4" />
              </button>

              <button
                onClick={() => moveSlide(slide, 'down')}
                disabled={index === slides.length - 1}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
              >
                <MoveDown className="w-4 h-4" />
              </button>

              <button
                onClick={() => toggleActive(slide)}
                className={`p-2 rounded ${
                  slide.is_active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
                }`}
              >
                {slide.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>

              <button
                onClick={() => startEdit(slide)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleDelete(slide.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {slides.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No carousel slides yet. Click "Add New Slide" to create one.
        </div>
      )}
    </div>
  );
}
