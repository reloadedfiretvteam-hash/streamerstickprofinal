import { useState, useEffect, useRef } from 'react';
import { Eye, Save, Edit, X, Maximize2, Minimize2, RefreshCw, Image as ImageIcon, Type, Palette, Layout } from 'lucide-react';
import { supabase, getStorageUrl } from '../../lib/supabase';
import App from '../../App';

interface EditableSection {
  id: string;
  section_type: 'hero' | 'about' | 'features' | 'shop' | 'footer' | 'text' | 'image' | 'button';
  content: string;
  styles: Record<string, string>;
  position: string;
}

export default function VisualWebsiteEditor() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [editingStyles, setEditingStyles] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [sections, setSections] = useState<EditableSection[]>([]);

  useEffect(() => {
    loadSections();
    // Enable click-to-edit mode
    setupClickToEdit();
  }, []);

  const loadSections = async () => {
    const { data } = await supabase
      .from('editable_sections')
      .select('*')
      .order('position', { ascending: true });

    if (data) {
      setSections(data);
    }
  };

  const setupClickToEdit = () => {
    // This will be called when iframe loads
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      iframe.onload = () => {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          // Add click handlers to all editable elements
          const editableSelectors = [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'span', 'button', 'a',
            '[data-editable]', '.editable'
          ];

          editableSelectors.forEach(selector => {
            const elements = iframeDoc.querySelectorAll(selector);
            elements.forEach((el: Element) => {
              const htmlEl = el as HTMLElement;
              htmlEl.style.cursor = 'pointer';
              htmlEl.style.outline = '2px dashed transparent';
              htmlEl.onmouseenter = () => {
                htmlEl.style.outline = '2px dashed #3b82f6';
                htmlEl.style.outlineOffset = '2px';
              };
              htmlEl.onmouseleave = () => {
                htmlEl.style.outline = '2px dashed transparent';
              };
              htmlEl.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleElementClick(htmlEl, iframeDoc);
              };
            });
          });
        }
      };
    }
  };

  const handleElementClick = (element: HTMLElement, doc: Document) => {
    setSelectedElement(element);
    setEditingContent(element.textContent || element.innerHTML || '');
    
    // Get computed styles
    const computed = window.getComputedStyle(element);
    setEditingStyles({
      color: computed.color,
      backgroundColor: computed.backgroundColor,
      fontSize: computed.fontSize,
      fontFamily: computed.fontFamily,
      padding: computed.padding,
      margin: computed.margin,
      textAlign: computed.textAlign,
    });
    
    setShowEditor(true);
  };

  const saveChanges = async () => {
    if (!selectedElement) return;

    setSaving(true);
    try {
      // Update element in iframe
      if (iframeRef.current?.contentDocument && selectedElement) {
        selectedElement.textContent = editingContent;
        
        // Apply styles
        Object.entries(editingStyles).forEach(([key, value]) => {
          const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
          (selectedElement.style as any)[camelKey] = value;
        });

        // Save to database
        const sectionData = {
          content: editingContent,
          styles: editingStyles,
          updated_at: new Date().toISOString()
        };

        const elementId = selectedElement.getAttribute('data-section-id') || selectedElement.id || 'new';
        
        await supabase
          .from('editable_sections')
          .upsert({
            id: elementId,
            section_type: selectedElement.tagName.toLowerCase(),
            content: editingContent,
            styles: editingStyles,
            position: 'auto'
          }, {
            onConflict: 'id'
          });

        alert('✅ Changes saved! Refresh to see on live site.');
        loadSections();
        setShowEditor(false);
      }
    } catch (error: any) {
      alert('Error saving: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Eye className="w-6 h-6 text-blue-400" />
            Visual Website Editor
          </h2>
          <span className="text-sm text-gray-400">Click any element to edit</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.location.reload();
              }
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Preview
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Website Preview (iframe) */}
        <div className={`${isFullscreen ? 'w-full' : 'flex-1'} relative bg-white`}>
          <iframe
            ref={iframeRef}
            src="/"
            className="w-full h-full border-0"
            title="Website Preview"
            onLoad={setupClickToEdit}
            style={{ pointerEvents: 'auto' }}
          />
          
          {/* Overlay Instructions */}
          <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
            <p className="text-sm">🖱️ Click any text, button, or element to edit</p>
          </div>
        </div>

        {/* Editor Panel */}
        {showEditor && !isFullscreen && (
          <div className="w-96 bg-gray-800 border-l border-gray-700 overflow-y-auto">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-400" />
                Edit Element
              </h3>
              <button
                onClick={() => setShowEditor(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Content Editor */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Content
                </label>
                <textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 min-h-[100px]"
                  placeholder="Enter text content..."
                />
              </div>

              {/* Style Editor */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Styles
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Text Color</label>
                    <input
                      type="color"
                      value={editingStyles.color || '#ffffff'}
                      onChange={(e) => setEditingStyles({ ...editingStyles, color: e.target.value })}
                      className="w-full h-10 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Background Color</label>
                    <input
                      type="color"
                      value={editingStyles.backgroundColor || '#000000'}
                      onChange={(e) => setEditingStyles({ ...editingStyles, backgroundColor: e.target.value })}
                      className="w-full h-10 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Font Size</label>
                    <input
                      type="text"
                      value={editingStyles.fontSize || '16px'}
                      onChange={(e) => setEditingStyles({ ...editingStyles, fontSize: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                      placeholder="16px, 1.5rem, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Text Align</label>
                    <select
                      value={editingStyles.textAlign || 'left'}
                      onChange={(e) => setEditingStyles({ ...editingStyles, textAlign: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                      <option value="justify">Justify</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={saveChanges}
                disabled={saving}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

