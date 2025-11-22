import { useState, useEffect } from 'react';
import { Layout, Plus, Save, Trash2, Eye, Edit, Upload, Download, Image, Monitor, Smartphone, Tablet, Copy, MoveUp, MoveDown, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Section {
  id: string;
  name: string;
  title: string;
  content: string;
  image_url?: string;
  background_color?: string;
  text_color?: string;
  display_order: number;
  visible: boolean;
  created_at?: string;
}

export default function EnhancedVisualPageBuilder() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [formData, setFormData] = useState<Partial<Section>>({
    visible: true,
    background_color: '#1f2937',
    text_color: '#ffffff'
  });

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    const { data } = await supabase
      .from('page_sections')
      .select('*')
      .order('display_order');

    if (data) setSections(data);
    setLoading(false);
  };

  const startEdit = (section: Section) => {
    setEditing(section.id);
    setFormData(section);
    setShowForm(true);
  };

  const startNew = () => {
    setEditing(null);
    setFormData({
      visible: true,
      background_color: '#1f2937',
      text_color: '#ffffff',
      display_order: sections.length
    });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditing(null);
    setShowForm(false);
    setFormData({});
  };

  const handleSave = async () => {
    if (!formData.name || !formData.title) {
      alert('Section name and title are required!');
      return;
    }

    try {
      const dataToSave = {
        ...formData,
        display_order: formData.display_order || sections.length
      };

      if (editing) {
        const { error } = await supabase
          .from('page_sections')
          .update(dataToSave)
          .eq('id', editing);

        if (error) throw error;
        alert('Section updated!');
      } else {
        const { error } = await supabase
          .from('page_sections')
          .insert([dataToSave]);

        if (error) throw error;
        alert('Section created!');
      }

      cancelEdit();
      loadSections();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this section?')) return;

    try {
      await supabase.from('page_sections').delete().eq('id', id);
      alert('Section deleted!');
      loadSections();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const moveSection = async (section: Section, direction: 'up' | 'down') => {
    const currentIndex = sections.findIndex(s => s.id === section.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= sections.length) return;

    try {
      const updates = [
        { id: section.id, display_order: newIndex },
        { id: sections[newIndex].id, display_order: currentIndex }
      ];

      for (const update of updates) {
        await supabase
          .from('page_sections')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }
      loadSections();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const duplicateSection = async (section: Section) => {
    const newSection = {
      ...section,
      name: `${section.name}-copy`,
      title: `${section.title} (Copy)`,
      display_order: sections.length
    };
    delete (newSection as any).id;
    delete (newSection as any).created_at;

    try {
      const { error } = await supabase
        .from('page_sections')
        .insert([newSection]);

      if (error) throw error;
      alert('Section duplicated!');
      loadSections();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const toggleVisibility = async (section: Section) => {
    try {
      await supabase
        .from('page_sections')
        .update({ visible: !section.visible })
        .eq('id', section.id);
      loadSections();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const exportSections = () => {
    const dataStr = JSON.stringify(sections, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `page-sections-${Date.now()}.json`;
    link.click();
  };

  const importSections = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (confirm(`Import ${data.length} sections?`)) {
            for (const section of data) {
              delete section.id;
              delete section.created_at;
              await supabase.from('page_sections').insert([section]);
            }
            alert('Sections imported!');
            loadSections();
          }
        } catch (error: any) {
          alert('Error importing: ' + error.message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const getPreviewWidth = () => {
    if (previewMode === 'mobile') return 'max-w-sm';
    if (previewMode === 'tablet') return 'max-w-2xl';
    return 'max-w-7xl';
  };

  if (loading) {
    return <div className="p-8 text-white">Loading page builder...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Layout className="w-8 h-8 text-purple-400" />
              Visual Page Builder
            </h1>
            <p className="text-gray-400">Build and customize your website sections visually</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={importSections}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button
              onClick={exportSections}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={startNew}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Section
            </button>
          </div>
        </div>

        {/* Preview Mode Selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setPreviewMode('desktop')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              previewMode === 'desktop'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Monitor className="w-4 h-4" />
            Desktop
          </button>
          <button
            onClick={() => setPreviewMode('tablet')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              previewMode === 'tablet'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Tablet className="w-4 h-4" />
            Tablet
          </button>
          <button
            onClick={() => setPreviewMode('mobile')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              previewMode === 'mobile'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Mobile
          </button>
        </div>

        <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-white mb-2">✨ Page Builder Features:</h3>
          <ul className="text-purple-100 text-sm space-y-1">
            <li>• Drag and drop section ordering</li>
            <li>• Image upload for each section</li>
            <li>• Custom colors and styling</li>
            <li>• Show/hide sections</li>
            <li>• Export/import configurations</li>
            <li>• Responsive preview modes</li>
          </ul>
        </div>
      </div>

      {/* Edit/New Form */}
      {(editing || showForm) && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border-2 border-purple-500">
          <h2 className="text-2xl font-bold text-white mb-4">
            {editing ? 'Edit Section' : 'New Section'}
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Section Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                placeholder="hero-section"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Display Order</label>
              <input
                type="number"
                value={formData.display_order || 0}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2 text-white">Section Title *</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                placeholder="Welcome to Our Website"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2 text-white">Content</label>
              <textarea
                value={formData.content || ''}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                placeholder="Section content..."
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2 text-white flex items-center gap-2">
                <Image className="w-4 h-4" />
                Image URL
              </label>
              <input
                type="text"
                value={formData.image_url || ''}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                placeholder="https://example.com/image.jpg"
              />
              {formData.image_url && (
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="mt-2 w-full h-48 object-cover rounded-lg"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Background Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.background_color || '#1f2937'}
                  onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                  className="w-16 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.background_color || '#1f2937'}
                  onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                  className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Text Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.text_color || '#ffffff'}
                  onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                  className="w-16 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.text_color || '#ffffff'}
                  onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                  className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                />
              </div>
            </div>

            <div className="col-span-2 flex items-center">
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.visible !== false}
                  onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                  className="w-5 h-5"
                />
                <span>Visible on website</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 font-semibold text-white"
            >
              <Save className="w-5 h-5" />
              {editing ? 'Update Section' : 'Create Section'}
            </button>
            <button
              onClick={cancelEdit}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2 text-white"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sections List */}
      <div className="bg-gray-800 rounded-lg overflow-hidden mb-6">
        <div className="p-4 bg-gray-900 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Page Sections ({sections.length})</h3>
        </div>
        <div className="divide-y divide-gray-700">
          {sections.map((section, index) => (
            <div key={section.id} className="p-4 hover:bg-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-white">{section.title}</h4>
                    <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                      {section.name}
                    </span>
                    {!section.visible && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2">{section.content}</p>
                  {section.image_url && (
                    <img
                      src={section.image_url}
                      alt={section.title}
                      className="mt-2 w-32 h-20 object-cover rounded"
                    />
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => moveSection(section, 'up')}
                    disabled={index === 0}
                    className={`p-2 rounded ${
                      index === 0
                        ? 'opacity-30 cursor-not-allowed'
                        : 'hover:bg-gray-600'
                    }`}
                    title="Move up"
                  >
                    <MoveUp className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => moveSection(section, 'down')}
                    disabled={index === sections.length - 1}
                    className={`p-2 rounded ${
                      index === sections.length - 1
                        ? 'opacity-30 cursor-not-allowed'
                        : 'hover:bg-gray-600'
                    }`}
                    title="Move down"
                  >
                    <MoveDown className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => toggleVisibility(section)}
                    className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded"
                    title="Toggle visibility"
                  >
                    <Eye className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => startEdit(section)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => duplicateSection(section)}
                    className="p-2 bg-purple-600 hover:bg-purple-700 rounded"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => handleDelete(section.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {sections.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            <Layout className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl mb-2">No sections yet</p>
            <p className="text-sm">Click "Add Section" to create your first section</p>
          </div>
        )}
      </div>

      {/* Live Preview */}
      {sections.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Live Preview ({previewMode})
          </h3>
          <div className={`mx-auto ${getPreviewWidth()} transition-all duration-300`}>
            <div className="border-4 border-gray-700 rounded-lg overflow-hidden bg-white">
              {sections
                .filter(s => s.visible)
                .map((section) => (
                  <div
                    key={section.id}
                    style={{
                      backgroundColor: section.background_color,
                      color: section.text_color
                    }}
                    className="p-8"
                  >
                    <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                    {section.image_url && (
                      <img
                        src={section.image_url}
                        alt={section.title}
                        className="w-full h-64 object-cover rounded-lg mb-4"
                      />
                    )}
                    <p className="whitespace-pre-wrap">{section.content}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
