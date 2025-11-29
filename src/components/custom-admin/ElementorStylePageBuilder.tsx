import { useState, useEffect } from 'react';
import {
  Eye,
  Save,
  Undo,
  Redo,
  Monitor,
  Smartphone,
  Tablet,
  Plus,
  Settings,
  Trash2,
  Image as ImageIcon,
  Type,
  Square,
  Layout,
  Video,
  Link as LinkIcon,
  Code,
  Sparkles,
  X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Element {
  id: string;
  element_type: string;
  element_name: string;
  content: any;
  styles: any;
  properties: any;
  position_order: number;
  parent_id: string | null;
  is_visible: boolean;
}

export default function ElementorStylePageBuilder() {
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showProperties, setShowProperties] = useState(true);
  const [pages, setPages] = useState<any[]>([]);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadPages();
  }, []);

  useEffect(() => {
    if (selectedPage) {
      loadElements();
    }
  }, [selectedPage]);

  const loadPages = async () => {
    const { data } = await supabase
      .from('page_builder_pages')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      setPages(data);
      setSelectedPage(data[0]);
    }
  };

  const loadElements = async () => {
    const { data } = await supabase
      .from('page_builder_elements')
      .select('*')
      .eq('page_id', selectedPage.id)
      .order('position_order', { ascending: true });

    if (data) setElements(data);
  };

  const addElement = async (type: string) => {
    const newElement = {
      page_id: selectedPage.id,
      element_type: type,
      element_name: `New ${type}`,
      content: getDefaultContent(type),
      styles: getDefaultStyles(type),
      properties: {},
      position_order: elements.length,
      parent_id: null,
      is_visible: true
    };

    const { data } = await supabase
      .from('page_builder_elements')
      .insert([newElement])
      .select()
      .single();

    if (data) {
      setElements([...elements, data]);
      setSelectedElement(data);
    }
  };

  const updateElement = async (elementId: string, updates: any) => {
    await supabase
      .from('page_builder_elements')
      .update(updates)
      .eq('id', elementId);

    setElements(elements.map(el =>
      el.id === elementId ? { ...el, ...updates } : el
    ));

    if (selectedElement?.id === elementId) {
      setSelectedElement({ ...selectedElement, ...updates });
    }
  };

  const deleteElement = async (elementId: string) => {
    await supabase
      .from('page_builder_elements')
      .delete()
      .eq('id', elementId);

    setElements(elements.filter(el => el.id !== elementId));
    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
    }
  };

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'text':
        return { html: '<p>Click to edit text</p>' };
      case 'heading':
        return { html: '<h2>Heading Text</h2>', tag: 'h2' };
      case 'button':
        return { text: 'Click Me', url: '#' };
      case 'image':
        return { src: 'https://via.placeholder.com/400x300', alt: 'Image' };
      case 'video':
        return { url: '', type: 'youtube' };
      case 'container':
        return { layout: 'column' };
      default:
        return {};
    }
  };

  const getDefaultStyles = (_type: string) => {
    return {
      padding: '20px',
      margin: '0px',
      backgroundColor: 'transparent',
      borderRadius: '0px',
      textAlign: 'left',
      fontSize: '16px',
      color: '#000000'
    };
  };

  const elementTools = [
    { type: 'text', icon: Type, label: 'Text', color: 'blue' },
    { type: 'heading', icon: Type, label: 'Heading', color: 'purple' },
    { type: 'button', icon: Square, label: 'Button', color: 'green' },
    { type: 'image', icon: ImageIcon, label: 'Image', color: 'pink' },
    { type: 'video', icon: Video, label: 'Video', color: 'red' },
    { type: 'container', icon: Layout, label: 'Container', color: 'orange' },
    { type: 'link', icon: LinkIcon, label: 'Link', color: 'cyan' },
    { type: 'widget', icon: Code, label: 'Widget', color: 'indigo' }
  ];

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Left Sidebar - Elements & Tools */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Page Builder
            </h3>
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="p-2 hover:bg-gray-700 rounded-lg transition text-gray-300"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>

          <select
            value={selectedPage?.id || ''}
            onChange={(e) => {
              const page = pages.find(p => p.id === e.target.value);
              setSelectedPage(page);
            }}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
          >
            {pages.map(page => (
              <option key={page.id} value={page.id}>{page.page_name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <h4 className="text-gray-400 text-sm font-semibold mb-3">ADD ELEMENTS</h4>
          <div className="grid grid-cols-2 gap-2">
            {elementTools.map(tool => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.type}
                  onClick={() => addElement(tool.type)}
                  className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-white flex flex-col items-center gap-2"
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs">{tool.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            <h4 className="text-gray-400 text-sm font-semibold mb-3">PAGE ELEMENTS</h4>
            <div className="space-y-1">
              {elements.map((element, _index) => (
                <div
                  key={element.id}
                  onClick={() => setSelectedElement(element)}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    selectedElement?.id === element.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {element.element_name || element.element_type}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteElement(element.id);
                      }}
                      className="p-1 hover:bg-red-500 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-700 flex gap-2">
          <button className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      {/* Center - Preview Canvas */}
      <div className="flex-1 flex flex-col bg-gray-900">
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('desktop')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'desktop' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              <Monitor className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('tablet')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'tablet' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              <Tablet className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'mobile' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              <Smartphone className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2">
            <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-gray-300">
              <Undo className="w-5 h-5" />
            </button>
            <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-gray-300">
              <Redo className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8 bg-gray-900">
          <div
            className={`mx-auto bg-white shadow-2xl transition-all ${
              viewMode === 'desktop' ? 'w-full' :
              viewMode === 'tablet' ? 'w-[768px]' :
              'w-[375px]'
            }`}
            style={{ minHeight: '600px' }}
          >
            {elements.length === 0 ? (
              <div className="flex items-center justify-center h-96 text-gray-400">
                <div className="text-center">
                  <Plus className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Start building your page</p>
                  <p className="text-sm">Add elements from the left sidebar</p>
                </div>
              </div>
            ) : (
              <div className="p-4">
                {elements.map(element => (
                  <div
                    key={element.id}
                    onClick={() => setSelectedElement(element)}
                    className={`relative transition cursor-pointer group ${
                      selectedElement?.id === element.id ? 'ring-4 ring-orange-500' : ''
                    }`}
                    style={element.styles}
                  >
                    {renderElement(element)}

                    {selectedElement?.id === element.id && (
                      <div className="absolute -top-8 left-0 bg-orange-500 text-white px-3 py-1 rounded-t-lg text-xs font-semibold flex items-center gap-2">
                        {element.element_type.toUpperCase()}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowProperties(!showProperties);
                          }}
                          className="hover:bg-orange-600 p-1 rounded"
                        >
                          <Settings className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Properties Panel */}
      {showProperties && selectedElement && (
        <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Element Properties
            </h3>
            <button
              onClick={() => setShowProperties(false)}
              className="p-1 hover:bg-gray-700 rounded"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {renderPropertiesPanel(selectedElement)}
          </div>

          <div className="p-4 border-t border-gray-700">
            <button
              onClick={() => updateElement(selectedElement.id, selectedElement)}
              className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition"
            >
              Apply Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );

  function renderElement(element: Element) {
    switch (element.element_type) {
      case 'text':
      case 'heading':
        return (
          <div dangerouslySetInnerHTML={{ __html: element.content.html || 'Click to edit' }} />
        );
      case 'button':
        return (
          <button
            className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition"
            style={element.styles}
          >
            {element.content.text || 'Button'}
          </button>
        );
      case 'image':
        return (
          <img
            src={element.content.src || 'https://via.placeholder.com/400x300'}
            alt={element.content.alt || 'Image'}
            className="max-w-full h-auto"
          />
        );
      case 'container':
        return (
          <div className="border-2 border-dashed border-gray-300 p-4 min-h-[100px]">
            Container - Drop elements here
          </div>
        );
      default:
        return <div className="p-4 bg-gray-100">Element: {element.element_type}</div>;
    }
  }

  function renderPropertiesPanel(element: Element) {
    return (
      <>
        {/* Element Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Element Name
          </label>
          <input
            type="text"
            value={element.element_name}
            onChange={(e) => setSelectedElement({ ...element, element_name: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
          />
        </div>

        {/* Content Properties */}
        {(element.element_type === 'text' || element.element_type === 'heading') && (
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Content (HTML)
            </label>
            <textarea
              value={element.content.html || ''}
              onChange={(e) => setSelectedElement({
                ...element,
                content: { ...element.content, html: e.target.value }
              })}
              rows={4}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
            />
          </div>
        )}

        {element.element_type === 'button' && (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Button Text
              </label>
              <input
                type="text"
                value={element.content.text || ''}
                onChange={(e) => setSelectedElement({
                  ...element,
                  content: { ...element.content, text: e.target.value }
                })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Link URL
              </label>
              <input
                type="text"
                value={element.content.url || ''}
                onChange={(e) => setSelectedElement({
                  ...element,
                  content: { ...element.content, url: e.target.value }
                })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                placeholder="https://example.com"
              />
            </div>
          </>
        )}

        {element.element_type === 'image' && (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Image URL
              </label>
              <input
                type="text"
                value={element.content.src || ''}
                onChange={(e) => setSelectedElement({
                  ...element,
                  content: { ...element.content, src: e.target.value }
                })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Alt Text
              </label>
              <input
                type="text"
                value={element.content.alt || ''}
                onChange={(e) => setSelectedElement({
                  ...element,
                  content: { ...element.content, alt: e.target.value }
                })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
              />
            </div>
          </>
        )}

        {/* Style Properties */}
        <div className="border-t border-gray-700 pt-4">
          <h4 className="text-white font-semibold mb-3">Styles</h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Padding</label>
              <input
                type="text"
                value={element.styles.padding || '20px'}
                onChange={(e) => setSelectedElement({
                  ...element,
                  styles: { ...element.styles, padding: e.target.value }
                })}
                className="w-full px-2 py-1 bg-gray-700 text-white rounded text-sm border border-gray-600"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Margin</label>
              <input
                type="text"
                value={element.styles.margin || '0px'}
                onChange={(e) => setSelectedElement({
                  ...element,
                  styles: { ...element.styles, margin: e.target.value }
                })}
                className="w-full px-2 py-1 bg-gray-700 text-white rounded text-sm border border-gray-600"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Background</label>
              <input
                type="color"
                value={element.styles.backgroundColor || '#ffffff'}
                onChange={(e) => setSelectedElement({
                  ...element,
                  styles: { ...element.styles, backgroundColor: e.target.value }
                })}
                className="w-full h-8 bg-gray-700 rounded border border-gray-600"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Text Color</label>
              <input
                type="color"
                value={element.styles.color || '#000000'}
                onChange={(e) => setSelectedElement({
                  ...element,
                  styles: { ...element.styles, color: e.target.value }
                })}
                className="w-full h-8 bg-gray-700 rounded border border-gray-600"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Font Size</label>
              <input
                type="text"
                value={element.styles.fontSize || '16px'}
                onChange={(e) => setSelectedElement({
                  ...element,
                  styles: { ...element.styles, fontSize: e.target.value }
                })}
                className="w-full px-2 py-1 bg-gray-700 text-white rounded text-sm border border-gray-600"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Border Radius</label>
              <input
                type="text"
                value={element.styles.borderRadius || '0px'}
                onChange={(e) => setSelectedElement({
                  ...element,
                  styles: { ...element.styles, borderRadius: e.target.value }
                })}
                className="w-full px-2 py-1 bg-gray-700 text-white rounded text-sm border border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="border-t border-gray-700 pt-4">
          <h4 className="text-white font-semibold mb-3">Advanced</h4>

          <div>
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={element.is_visible}
                onChange={(e) => setSelectedElement({
                  ...element,
                  is_visible: e.target.checked
                })}
                className="w-4 h-4"
              />
              Visible
            </label>
          </div>
        </div>
      </>
    );
  }
}
