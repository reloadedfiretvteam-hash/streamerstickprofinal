import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, ArrowUp, ArrowDown, Video, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TutorialBox {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url: string;
  video_url: string;
  button_text: string;
  button_url: string;
  is_active: boolean;
  sort_order: number;
}

export default function TutorialBoxEditor() {
  const [tutorials, setTutorials] = useState<TutorialBox[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<TutorialBox>>({});

  useEffect(() => {
    loadTutorials();
  }, []);

  const loadTutorials = async () => {
    const { data } = await supabase
      .from('tutorial_boxes')
      .select('*')
      .order('sort_order');

    if (data) setTutorials(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.title) {
      alert('Title is required!');
      return;
    }

    if (editing === 'new') {
      const maxOrder = Math.max(...tutorials.map(t => t.sort_order), 0);
      const { error } = await supabase
        .from('tutorial_boxes')
        .insert([{ ...formData, sort_order: maxOrder + 1 }]);

      if (!error) {
        alert('Tutorial created!');
      }
    } else {
      const { error } = await supabase
        .from('tutorial_boxes')
        .update(formData)
        .eq('id', editing);

      if (!error) {
        alert('Tutorial updated!');
      }
    }

    setEditing(null);
    setFormData({});
    loadTutorials();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this tutorial box?')) return;

    await supabase.from('tutorial_boxes').delete().eq('id', id);
    loadTutorials();
  };

  const startEdit = (tutorial: TutorialBox) => {
    setEditing(tutorial.id);
    setFormData(tutorial);
  };

  const startNew = () => {
    setEditing('new');
    setFormData({
      title: '',
      description: '',
      content: '',
      image_url: '',
      video_url: '',
      button_text: 'Learn More',
      button_url: '',
      is_active: true,
      sort_order: 0
    });
  };

  const moveUp = async (tutorial: TutorialBox, index: number) => {
    if (index === 0) return;

    const prevTutorial = tutorials[index - 1];
    await supabase
      .from('tutorial_boxes')
      .update({ sort_order: prevTutorial.sort_order })
      .eq('id', tutorial.id);

    await supabase
      .from('tutorial_boxes')
      .update({ sort_order: tutorial.sort_order })
      .eq('id', prevTutorial.id);

    loadTutorials();
  };

  const moveDown = async (tutorial: TutorialBox, index: number) => {
    if (index === tutorials.length - 1) return;

    const nextTutorial = tutorials[index + 1];
    await supabase
      .from('tutorial_boxes')
      .update({ sort_order: nextTutorial.sort_order })
      .eq('id', tutorial.id);

    await supabase
      .from('tutorial_boxes')
      .update({ sort_order: tutorial.sort_order })
      .eq('id', nextTutorial.id);

    loadTutorials();
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    await supabase
      .from('tutorial_boxes')
      .update({ is_active: !currentState })
      .eq('id', id);

    loadTutorials();
  };

  if (loading) return <div className="p-8 text-white">Loading tutorials...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Tutorial Box Manager</h2>
          <p className="text-gray-400 mt-1">Add, edit, and manage tutorial boxes with images and videos</p>
        </div>
        <button
          onClick={startNew}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-bold hover:from-green-600 hover:to-emerald-600 transition"
        >
          <Plus className="w-5 h-5" />
          Add Tutorial Box
        </button>
      </div>

      {editing && (
        <div className="bg-gray-900 rounded-xl p-6 mb-6 border-2 border-orange-500">
          <h3 className="text-xl font-bold text-white mb-4">
            {editing === 'new' ? 'New Tutorial Box' : 'Edit Tutorial Box'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-white font-semibold mb-2">Title *</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg focus:border-orange-500 focus:outline-none"
                placeholder="Tutorial title..."
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Short Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                placeholder="Brief description..."
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Full Content</label>
              <textarea
                value={formData.content || ''}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                placeholder="Detailed tutorial content..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image_url || ''}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Video URL (YouTube/Vimeo)
                </label>
                <input
                  type="url"
                  value={formData.video_url || ''}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-semibold mb-2">Button Text</label>
                <input
                  type="text"
                  value={formData.button_text || ''}
                  onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                  placeholder="Learn More"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Button URL</label>
                <input
                  type="url"
                  value={formData.button_url || ''}
                  onChange={(e) => setFormData({ ...formData, button_url: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                  placeholder="#"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.is_active ?? true}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5"
              />
              <label htmlFor="active" className="text-white font-semibold cursor-pointer">
                Active (show on website)
              </label>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-bold hover:from-green-600 hover:to-emerald-600 transition"
              >
                <Save className="w-5 h-5" />
                Save Tutorial
              </button>
              <button
                onClick={() => {
                  setEditing(null);
                  setFormData({});
                }}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {tutorials.map((tutorial, index) => (
          <div
            key={tutorial.id}
            className="bg-gray-900 rounded-xl overflow-hidden hover:bg-gray-850 transition"
          >
            <div className="flex items-start">
              {tutorial.image_url && (
                <div className="w-48 h-32 flex-shrink-0">
                  <img
                    src={tutorial.image_url}
                    alt={tutorial.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{tutorial.title}</h3>
                      {!tutorial.is_active && (
                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                          HIDDEN
                        </span>
                      )}
                      {tutorial.video_url && (
                        <span className="px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          VIDEO
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{tutorial.description}</p>
                    {tutorial.button_text && (
                      <span className="text-blue-400 text-sm">
                        Button: "{tutorial.button_text}"
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => moveUp(tutorial, index)}
                      disabled={index === 0}
                      className={`p-2 rounded-lg transition ${
                        index === 0
                          ? 'bg-gray-700 opacity-50 cursor-not-allowed'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveDown(tutorial, index)}
                      disabled={index === tutorials.length - 1}
                      className={`p-2 rounded-lg transition ${
                        index === tutorials.length - 1
                          ? 'bg-gray-700 opacity-50 cursor-not-allowed'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleActive(tutorial.id, tutorial.is_active)}
                      className={`p-2 rounded-lg transition ${
                        tutorial.is_active
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-gray-600 hover:bg-gray-700'
                      }`}
                      title={tutorial.is_active ? 'Hide' : 'Show'}
                    >
                      {tutorial.is_active ? '👁️' : '👁️‍🗨️'}
                    </button>
                    <button
                      onClick={() => startEdit(tutorial)}
                      className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tutorial.id)}
                      className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {tutorials.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No tutorial boxes yet. Click "Add Tutorial Box" to get started!
          </div>
        )}
      </div>
    </div>
  );
}
