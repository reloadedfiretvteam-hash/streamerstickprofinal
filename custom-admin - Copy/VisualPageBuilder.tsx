import { useState, useEffect } from 'react';
import { Eye, Edit, Save, X, Type, Image, Settings, Code, Monitor, Smartphone, Tablet } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PageElement {
  id: string;
  element_type: string;
  element_id: string;
  element_class: string;
  content: string;
  page_section: string;
  order_index: number;
}

interface EditingElement {
  id: string;
  type: string;
  content: string;
  section: string;
}

export default function VisualPageBuilder() {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [editingElement, setEditingElement] = useState<EditingElement | null>(null);
  const [pageElements, setPageElements] = useState<PageElement[]>([]);
  const [selectedSection, setSelectedSection] = useState('hero');
  const [isSaving, setIsSaving] = useState(false);

  const sections = [
    { id: 'hero', label: 'Hero Section', icon: Type },
    { id: 'features', label: 'Features/Benefits', icon: Settings },
    { id: 'pricing', label: 'Pricing Section', icon: Type },
    { id: 'products', label: 'Products', icon: Image },
    { id: 'about', label: 'About/What is IPTV', icon: Type },
    { id: 'tutorials', label: 'Tutorials', icon: Code },
    { id: 'faq', label: 'FAQ Section', icon: Type },
    { id: 'footer', label: 'Footer', icon: Type }
  ];

  useEffect(() => {
    loadPageElements();
  }, [selectedSection]);

  const loadPageElements = async () => {
    try {
      const { data, error } = await supabase
        .from('page_elements')
        .select('*')
        .eq('page_section', selectedSection)
        .order('order_index');

      if (error) throw error;
      setPageElements(data || []);
    } catch (error) {
      console.error('Error loading page elements:', error);
    }
  };

  const saveElement = async () => {
    if (!editingElement) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('page_elements')
        .update({ content: editingElement.content })
        .eq('id', editingElement.id);

      if (error) throw error;

      await loadPageElements();
      setEditingElement(null);
      alert('Saved! Refresh your website to see changes.');
    } catch (error) {
      console.error('Error saving element:', error);
      alert('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const createNewElement = async (section: string, type: string) => {
    try {
      const maxOrder = pageElements.length > 0
        ? Math.max(...pageElements.map(e => e.order_index))
        : 0;

      const { error } = await supabase
        .from('page_elements')
        .insert([{
          element_type: type,
          element_id: `${type}-${Date.now()}`,
          element_class: `custom-${type}`,
          content: `New ${type} content`,
          page_section: section,
          order_index: maxOrder + 1
        }]);

      if (error) throw error;
      await loadPageElements();
      alert('Element added!');
    } catch (error) {
      console.error('Error creating element:', error);
      alert('Failed to create element');
    }
  };

  const deleteElement = async (id: string) => {
    if (!confirm('Delete this element?')) return;

    try {
      const { error } = await supabase
        .from('page_elements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadPageElements();
      alert('Element deleted!');
    } catch (error) {
      console.error('Error deleting element:', error);
    }
  };

  const previewWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px'
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Visual Page Builder</h1>
            <p className="text-sm text-gray-400">Click elements to edit your website live</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-2 bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-2 rounded transition ${
                  previewMode === 'desktop' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPreviewMode('tablet')}
                className={`p-2 rounded transition ${
                  previewMode === 'tablet' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title="Tablet View"
              >
                <Tablet className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-2 rounded transition ${
                  previewMode === 'mobile' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-5 h-5" />
              </button>
            </div>

            <a
              href="/"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              <Eye className="w-5 h-5" />
              Preview Live Site
            </a>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-white font-bold mb-3">Page Sections</h2>
            <div className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                      selectedSection === section.id
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{section.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="text-white font-bold mb-3 text-sm">Add Elements</h3>
              <div className="space-y-2">
                <button
                  onClick={() => createNewElement(selectedSection, 'heading')}
                  className="w-full px-3 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 transition"
                >
                  + Add Heading
                </button>
                <button
                  onClick={() => createNewElement(selectedSection, 'paragraph')}
                  className="w-full px-3 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 transition"
                >
                  + Add Paragraph
                </button>
                <button
                  onClick={() => createNewElement(selectedSection, 'button')}
                  className="w-full px-3 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 transition"
                >
                  + Add Button
                </button>
                <button
                  onClick={() => createNewElement(selectedSection, 'image')}
                  className="w-full px-3 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 transition"
                >
                  + Add Image
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-gray-900 overflow-auto p-8">
          <div
            className="bg-white mx-auto transition-all duration-300 shadow-2xl"
            style={{ width: previewWidths[previewMode], minHeight: '100%' }}
          >
            <div className="p-8">
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Editing: {sections.find(s => s.id === selectedSection)?.label}
                </h2>
                <p className="text-gray-600 text-sm">
                  Click any element below to edit it
                </p>
              </div>

              {pageElements.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Type className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4">No elements in this section yet</p>
                  <p className="text-sm text-gray-500">Use the sidebar to add elements</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pageElements.map((element) => (
                    <div
                      key={element.id}
                      className="group relative border-2 border-dashed border-gray-300 hover:border-orange-500 rounded-lg p-4 transition cursor-pointer"
                      onClick={() => setEditingElement({
                        id: element.id,
                        type: element.element_type,
                        content: element.content,
                        section: element.page_section
                      })}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-gray-500 mb-2 uppercase">
                            {element.element_type}
                          </div>
                          {element.element_type === 'heading' && (
                            <h3 className="text-2xl font-bold text-gray-800">{element.content}</h3>
                          )}
                          {element.element_type === 'paragraph' && (
                            <p className="text-gray-700">{element.content}</p>
                          )}
                          {element.element_type === 'button' && (
                            <button className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold">
                              {element.content}
                            </button>
                          )}
                          {element.element_type === 'image' && (
                            <div className="bg-gray-200 rounded-lg p-8 text-center">
                              <Image className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm text-gray-600">{element.content}</p>
                            </div>
                          )}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingElement({
                                id: element.id,
                                type: element.element_type,
                                content: element.content,
                                section: element.page_section
                              });
                            }}
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteElement(element.id);
                            }}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {editingElement && (
          <div className="w-96 bg-gray-800 border-l border-gray-700 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Element</h2>
              <button
                onClick={() => setEditingElement(null)}
                className="p-2 text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Element Type
                </label>
                <div className="bg-gray-700 px-4 py-2 rounded-lg text-gray-300 capitalize">
                  {editingElement.type}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Content
                </label>
                <textarea
                  value={editingElement.content}
                  onChange={(e) => setEditingElement({
                    ...editingElement,
                    content: e.target.value
                  })}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none h-32"
                  placeholder="Enter content..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={saveElement}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setEditingElement(null)}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4">
                  <p className="text-blue-300 text-sm">
                    💡 <strong>Tip:</strong> Changes save to database immediately. Refresh your live website to see updates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
