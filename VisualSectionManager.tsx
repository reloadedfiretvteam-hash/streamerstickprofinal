import { useState, useEffect } from 'react';
import { Edit, Eye, EyeOff, Save, X, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface WebsiteSection {
  id: string;
  section_key: string;
  section_name: string;
  content: any;
  is_active: boolean;
  sort_order: number;
}

export default function VisualSectionManager() {
  const [sections, setSections] = useState<WebsiteSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<any>({});

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    const { data } = await supabase
      .from('website_sections')
      .select('*')
      .order('sort_order');

    if (data) setSections(data);
    setLoading(false);
  };

  const handleEdit = (section: WebsiteSection) => {
    setEditing(section.id);
    setEditContent(section.content);
  };

  const handleSave = async (sectionId: string) => {
    const { error } = await supabase
      .from('website_sections')
      .update({
        content: editContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', sectionId);

    if (!error) {
      setEditing(null);
      loadSections();
      alert('Section updated successfully!');
    }
  };

  const toggleActive = async (sectionId: string, currentState: boolean) => {
    await supabase
      .from('website_sections')
      .update({ is_active: !currentState })
      .eq('id', sectionId);

    loadSections();
  };

  const updateContentField = (field: string, value: any) => {
    setEditContent({ ...editContent, [field]: value });
  };

  const exportSection = (section: WebsiteSection) => {
    const dataStr = JSON.stringify(section, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${section.section_key}_backup.json`;
    link.click();
  };

  const exportAllSections = () => {
    const dataStr = JSON.stringify(sections, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `website_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const renderEditor = (section: WebsiteSection) => {
    const content = editContent;

    switch (section.section_key) {
      case 'hero':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-white font-semibold mb-2">Hero Title</label>
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => updateContentField('title', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-2">Subtitle</label>
              <textarea
                value={content.subtitle || ''}
                onChange={(e) => updateContentField('subtitle', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-semibold mb-2">Button Text</label>
                <input
                  type="text"
                  value={content.buttonText || ''}
                  onChange={(e) => updateContentField('buttonText', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Button URL</label>
                <input
                  type="text"
                  value={content.buttonUrl || ''}
                  onChange={(e) => updateContentField('buttonUrl', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-white font-semibold mb-2">Background Image URL</label>
              <input
                type="url"
                value={content.backgroundImage || ''}
                onChange={(e) => updateContentField('backgroundImage', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                placeholder="https://..."
              />
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-white font-semibold mb-2">Section Title</label>
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => updateContentField('title', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-2">Content</label>
              <textarea
                value={content.content || ''}
                onChange={(e) => updateContentField('content', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-2">Image URL</label>
              <input
                type="url"
                value={content.image || ''}
                onChange={(e) => updateContentField('image', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                placeholder="https://..."
              />
            </div>
          </div>
        );

      case 'footer':
        return (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-semibold mb-2">Company Name</label>
                <input
                  type="text"
                  value={content.companyName || ''}
                  onChange={(e) => updateContentField('companyName', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Tagline</label>
                <input
                  type="text"
                  value={content.tagline || ''}
                  onChange={(e) => updateContentField('tagline', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={content.email || ''}
                  onChange={(e) => updateContentField('email', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Phone</label>
                <input
                  type="tel"
                  value={content.phone || ''}
                  onChange={(e) => updateContentField('phone', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-white font-semibold mb-2">Legal Text</label>
              <textarea
                value={content.legal || ''}
                onChange={(e) => updateContentField('legal', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>
        );

      default:
        return (
          <div>
            <label className="block text-white font-semibold mb-2">Raw JSON Content</label>
            <textarea
              value={JSON.stringify(content, null, 2)}
              onChange={(e) => {
                try {
                  setEditContent(JSON.parse(e.target.value));
                } catch (err) {
                  // Invalid JSON, ignore
                }
              }}
              rows={10}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm focus:border-orange-500 focus:outline-none"
            />
          </div>
        );
    }
  };

  if (loading) return <div className="p-8 text-white">Loading sections...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Website Section Manager</h2>
          <p className="text-gray-400 mt-1">Edit every part of your website</p>
        </div>
        <button
          onClick={exportAllSections}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-bold hover:from-blue-600 hover:to-cyan-600 transition"
        >
          <Download className="w-5 h-5" />
          Export All Sections
        </button>
      </div>

      <div className="grid gap-6">
        {sections.map((section) => (
          <div
            key={section.id}
            className={`bg-gray-900 rounded-xl overflow-hidden border-2 ${
              editing === section.id ? 'border-orange-500' : 'border-transparent'
            }`}
          >
            <div className="bg-gradient-to-r from-gray-800 to-gray-850 p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-white">{section.section_name}</h3>
                <span className="text-sm text-gray-400 font-mono">{section.section_key}</span>
                {!section.is_active && (
                  <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                    HIDDEN
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleActive(section.id, section.is_active)}
                  className={`p-2 rounded-lg transition ${
                    section.is_active
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                  title={section.is_active ? 'Hide Section' : 'Show Section'}
                >
                  {section.is_active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => exportSection(section)}
                  className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition"
                  title="Download Section"
                >
                  <Download className="w-5 h-5" />
                </button>
                {editing === section.id ? (
                  <>
                    <button
                      onClick={() => handleSave(section.id)}
                      className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition"
                      title="Save Changes"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
                      title="Cancel"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleEdit(section)}
                    className="p-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition"
                    title="Edit Section"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {editing === section.id ? (
              <div className="p-6">
                {renderEditor(section)}
              </div>
            ) : (
              <div className="p-6">
                <pre className="text-gray-400 text-sm overflow-x-auto">
                  {JSON.stringify(section.content, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
