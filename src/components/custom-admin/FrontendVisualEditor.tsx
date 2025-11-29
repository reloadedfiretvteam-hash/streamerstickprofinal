import { useState, useEffect } from 'react';
import {
  Eye,
  Save,
  Settings,
  Palette,
  Image as ImageIcon,
  Layout,
  ChevronDown,
  Plus,
  Trash2,
  Copy,
  MoveUp,
  MoveDown,
  Sparkles
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Container {
  id: string;
  container_name: string;
  container_type: string;
  position_order: number;
  is_visible: boolean;
  background_color: string;
  background_image: string | null;
  padding: string;
  margin: string;
  custom_css: string | null;
  custom_classes: string | null;
}

export default function FrontendVisualEditor() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
  const [showProperties, setShowProperties] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContainers();
  }, []);

  const loadContainers = async () => {
    const { data } = await supabase
      .from('frontend_containers')
      .select('*')
      .order('position_order', { ascending: true });

    if (data) {
      setContainers(data);
    }
  };

  const saveContainer = async () => {
    if (!selectedContainer) return;

    setSaving(true);
    const { error } = await supabase
      .from('frontend_containers')
      .update({
        container_name: selectedContainer.container_name,
        background_color: selectedContainer.background_color,
        background_image: selectedContainer.background_image,
        padding: selectedContainer.padding,
        margin: selectedContainer.margin,
        is_visible: selectedContainer.is_visible,
        custom_css: selectedContainer.custom_css,
        custom_classes: selectedContainer.custom_classes,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedContainer.id);

    if (!error) {
      alert('Container updated successfully! Refresh your homepage to see changes.');
      loadContainers();
      setShowProperties(false);
      setSelectedContainer(null);
    } else {
      alert('Error saving: ' + error.message);
    }
    setSaving(false);
  };

  const addNewContainer = async () => {
    const newContainer = {
      container_name: 'New Section',
      container_type: 'custom',
      position_order: containers.length + 1,
      is_visible: true,
      background_color: '#ffffff',
      padding: '80px 20px',
      margin: '0px'
    };

    const { data } = await supabase
      .from('frontend_containers')
      .insert([newContainer])
      .select()
      .single();

    if (data) {
      loadContainers();
      setSelectedContainer(data);
      setShowProperties(true);
    }
  };

  const deleteContainer = async (id: string) => {
    if (!confirm('Delete this section from your homepage?')) return;

    await supabase
      .from('frontend_containers')
      .delete()
      .eq('id', id);

    loadContainers();
    if (selectedContainer?.id === id) {
      setSelectedContainer(null);
      setShowProperties(false);
    }
  };

  const duplicateContainer = async (container: Container) => {
    const duplicate = {
      ...container,
      id: undefined,
      container_name: container.container_name + ' (Copy)',
      position_order: containers.length + 1
    };

    const { data } = await supabase
      .from('frontend_containers')
      .insert([duplicate])
      .select()
      .single();

    if (data) {
      loadContainers();
    }
  };

  const moveContainer = async (container: Container, direction: 'up' | 'down') => {
    const currentIndex = containers.findIndex(c => c.id === container.id);
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === containers.length - 1) return;

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const swapContainer = containers[swapIndex];

    await supabase
      .from('frontend_containers')
      .update({ position_order: swapContainer.position_order })
      .eq('id', container.id);

    await supabase
      .from('frontend_containers')
      .update({ position_order: container.position_order })
      .eq('id', swapContainer.id);

    loadContainers();
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Left Sidebar - Section List */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Layout className="w-5 h-5 text-purple-400" />
            Homepage Sections
          </h3>
          <button
            onClick={addNewContainer}
            className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Section
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {containers.map((container, index) => (
              <div
                key={container.id}
                onClick={() => {
                  setSelectedContainer(container);
                  setShowProperties(true);
                }}
                className={`p-4 rounded-lg cursor-pointer transition border-2 ${
                  selectedContainer?.id === container.id
                    ? 'bg-purple-500/20 border-purple-500'
                    : 'bg-gray-700 border-gray-600 hover:border-purple-400'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="text-white font-semibold text-sm">{container.container_name}</h4>
                    <p className="text-gray-400 text-xs capitalize">{container.container_type}</p>
                  </div>
                  {!container.is_visible && (
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">Hidden</span>
                  )}
                </div>

                <div className="flex items-center gap-1 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveContainer(container, 'up');
                    }}
                    className="p-1 hover:bg-gray-600 rounded transition"
                    disabled={index === 0}
                  >
                    <MoveUp className="w-3 h-3 text-gray-300" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveContainer(container, 'down');
                    }}
                    className="p-1 hover:bg-gray-600 rounded transition"
                    disabled={index === containers.length - 1}
                  >
                    <MoveDown className="w-3 h-3 text-gray-300" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateContainer(container);
                    }}
                    className="p-1 hover:bg-gray-600 rounded transition ml-auto"
                  >
                    <Copy className="w-3 h-3 text-gray-300" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteContainer(container.id);
                    }}
                    className="p-1 hover:bg-red-600 rounded transition"
                  >
                    <Trash2 className="w-3 h-3 text-gray-300" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Center - Visual Preview */}
      <div className="flex-1 flex flex-col">
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Your Homepage - Visual Editor</h2>
            <p className="text-gray-400 text-sm">Click any section to edit its properties</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                previewMode ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              <Eye className="w-4 h-4" />
              {previewMode ? 'Editing' : 'Preview'}
            </button>
            <a
              href="/"
              target="_blank"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
              View Live Site
            </a>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-900 p-8">
          <div className="max-w-7xl mx-auto">
            {containers.map((container) => (
              <div
                key={container.id}
                onClick={() => {
                  if (!previewMode) {
                    setSelectedContainer(container);
                    setShowProperties(true);
                  }
                }}
                className={`relative transition-all mb-4 ${
                  !previewMode ? 'cursor-pointer' : ''
                } ${
                  selectedContainer?.id === container.id && !previewMode
                    ? 'ring-4 ring-purple-500'
                    : 'hover:ring-2 hover:ring-purple-400'
                } ${!container.is_visible ? 'opacity-50' : ''}`}
                style={{
                  backgroundColor: container.background_color,
                  backgroundImage: container.background_image ? `url(${container.background_image})` : 'none',
                  padding: container.padding,
                  margin: container.margin,
                  minHeight: '150px',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {!previewMode && (
                  <div className="absolute top-2 left-2 bg-purple-500 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2">
                    <Settings className="w-3 h-3" />
                    {container.container_name}
                  </div>
                )}

                <div className="relative z-10">
                  <div className="text-center py-12">
                    <h3 className="text-2xl font-bold mb-2">{container.container_name}</h3>
                    <p className="text-gray-600">Click to edit this section's properties</p>
                  </div>
                </div>

                {!container.is_visible && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold">
                    HIDDEN ON SITE
                  </div>
                )}
              </div>
            ))}

            {containers.length === 0 && (
              <div className="text-center py-24 text-gray-400">
                <Layout className="w-24 h-24 mx-auto mb-4 opacity-50" />
                <p className="text-xl mb-2">No sections yet</p>
                <p>Click "Add New Section" to start building your homepage</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Properties Panel */}
      {showProperties && selectedContainer && (
        <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" />
              Section Properties
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Section Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Section Name
              </label>
              <input
                type="text"
                value={selectedContainer.container_name}
                onChange={(e) => setSelectedContainer({ ...selectedContainer, container_name: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
              />
            </div>

            {/* Section Type Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                <ChevronDown className="w-4 h-4 inline mr-1" />
                Section Type
              </label>
              <select
                value={selectedContainer.container_type}
                onChange={(e) => setSelectedContainer({ ...selectedContainer, container_type: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
              >
                <option value="hero">Hero / Banner</option>
                <option value="features">Features</option>
                <option value="pricing">Pricing</option>
                <option value="testimonials">Testimonials</option>
                <option value="cta">Call to Action</option>
                <option value="content">Content Block</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {/* Visibility Toggle */}
            <div className="bg-gray-900 rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedContainer.is_visible}
                  onChange={(e) => setSelectedContainer({ ...selectedContainer, is_visible: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <span className="text-white font-semibold block">Show on Website</span>
                  <span className="text-gray-400 text-xs">Toggle visibility of this section</span>
                </div>
              </label>
            </div>

            {/* Background Color Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                <Palette className="w-4 h-4 inline mr-1" />
                Background Color
              </label>
              <div className="space-y-2">
                <input
                  type="color"
                  value={selectedContainer.background_color}
                  onChange={(e) => setSelectedContainer({ ...selectedContainer, background_color: e.target.value })}
                  className="w-full h-12 rounded-lg border border-gray-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedContainer.background_color}
                  onChange={(e) => setSelectedContainer({ ...selectedContainer, background_color: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                  placeholder="#ffffff"
                />
                {/* Quick Color Presets */}
                <div className="grid grid-cols-6 gap-2">
                  {['#ffffff', '#000000', '#ff6600', '#3b82f6', '#10b981', '#8b5cf6'].map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedContainer({ ...selectedContainer, background_color: color })}
                      className="w-full h-8 rounded border-2 border-gray-600 hover:border-purple-400 transition"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Background Image */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                <ImageIcon className="w-4 h-4 inline mr-1" />
                Background Image URL
              </label>
              <input
                type="text"
                value={selectedContainer.background_image || ''}
                onChange={(e) => setSelectedContainer({ ...selectedContainer, background_image: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Spacing Dropdowns */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                <Layout className="w-4 h-4 inline mr-1" />
                Padding (Inside spacing)
              </label>
              <select
                value={selectedContainer.padding}
                onChange={(e) => setSelectedContainer({ ...selectedContainer, padding: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 mb-2"
              >
                <option value="0px">No Padding</option>
                <option value="20px">Small (20px)</option>
                <option value="40px">Medium (40px)</option>
                <option value="60px">Large (60px)</option>
                <option value="80px 20px">Large Top/Bottom, Small Sides</option>
                <option value="100px 40px">Extra Large</option>
              </select>
              <input
                type="text"
                value={selectedContainer.padding}
                onChange={(e) => setSelectedContainer({ ...selectedContainer, padding: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                placeholder="Custom: 40px 20px"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Margin (Outside spacing)
              </label>
              <select
                value={selectedContainer.margin}
                onChange={(e) => setSelectedContainer({ ...selectedContainer, margin: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 mb-2"
              >
                <option value="0px">No Margin</option>
                <option value="20px 0">Small</option>
                <option value="40px 0">Medium</option>
                <option value="60px 0">Large</option>
              </select>
              <input
                type="text"
                value={selectedContainer.margin}
                onChange={(e) => setSelectedContainer({ ...selectedContainer, margin: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                placeholder="Custom: 20px 0"
              />
            </div>

            {/* AI Suggestions */}
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                AI Suggestions
              </h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Use dark background for hero sections</li>
                <li>• Add padding for better readability</li>
                <li>• Consider adding background image</li>
              </ul>
            </div>

            {/* Custom CSS */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Advanced: Custom CSS
              </label>
              <textarea
                value={selectedContainer.custom_css || ''}
                onChange={(e) => setSelectedContainer({ ...selectedContainer, custom_css: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 font-mono text-xs"
                placeholder="border-radius: 10px;&#10;box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={saveContainer}
              disabled={saving}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold hover:from-green-600 hover:to-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
