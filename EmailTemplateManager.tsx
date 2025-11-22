import { useState, useEffect } from 'react';
import { Mail, Edit, Save, X, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface EmailTemplate {
  id: string;
  template_key: string;
  template_name: string;
  subject: string;
  body: string;
  is_active: boolean;
  variables: string[];
}

export default function EmailTemplateManager() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<EmailTemplate>>({});
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const { data } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at');

    if (data) setTemplates(data);
    setLoading(false);
  };

  const startEdit = (template: EmailTemplate) => {
    setEditing(template.id);
    setFormData(template);
  };

  const handleSave = async () => {
    if (!formData.subject || !formData.body) {
      alert('Subject and body are required!');
      return;
    }

    const { error } = await supabase
      .from('email_templates')
      .update({
        subject: formData.subject,
        body: formData.body,
        is_active: formData.is_active ?? true,
        updated_at: new Date().toISOString()
      })
      .eq('id', editing);

    if (!error) {
      setEditing(null);
      setFormData({});
      loadTemplates();
      alert('Email template updated successfully!');
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    await supabase
      .from('email_templates')
      .update({ is_active: !currentState })
      .eq('id', id);

    loadTemplates();
  };

  const showPreview = (template: EmailTemplate) => {
    let previewBody = template.body;
    template.variables.forEach(variable => {
      const placeholder = `{{${variable}}}`;
      previewBody = previewBody.replace(
        new RegExp(placeholder, 'g'),
        `[${variable.toUpperCase()}]`
      );
    });
    setPreview(previewBody);
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('email-body') as HTMLTextAreaElement;
    if (textarea) {
      const cursorPos = textarea.selectionStart;
      const textBefore = formData.body?.substring(0, cursorPos) || '';
      const textAfter = formData.body?.substring(cursorPos) || '';
      const newBody = textBefore + `{{${variable}}}` + textAfter;
      setFormData({ ...formData, body: newBody });
    }
  };

  if (loading) return <div className="p-8 text-white">Loading email templates...</div>;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Email Template Manager</h2>
        <p className="text-gray-400">Customize emails sent to customers after purchase</p>
      </div>

      <div className="grid gap-6">
        {templates.map((template) => {
          const isEditing = editing === template.id;

          return (
            <div
              key={template.id}
              className={`bg-gray-900 rounded-xl overflow-hidden border-2 ${
                isEditing ? 'border-orange-500' : template.is_active ? 'border-green-500' : 'border-gray-700'
              }`}
            >
              <div className={`p-6 ${
                template.is_active ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20' : 'bg-gray-850'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500 rounded-lg">
                      <Mail className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{template.template_name}</h3>
                      <p className="text-gray-400 text-sm mt-1">{template.template_key}</p>
                      {!template.is_active && (
                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full mt-2 inline-block">
                          DISABLED
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => showPreview(template)}
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-semibold transition flex items-center gap-2"
                      title="Preview"
                    >
                      <Eye className="w-5 h-5" />
                      Preview
                    </button>
                    <button
                      onClick={() => toggleActive(template.id, template.is_active)}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${
                        template.is_active
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      {template.is_active ? 'Disable' : 'Enable'}
                    </button>
                    {!isEditing ? (
                      <button
                        onClick={() => startEdit(template)}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold transition flex items-center gap-2"
                      >
                        <Edit className="w-5 h-5" />
                        Edit
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditing(null)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="p-6 border-t-2 border-gray-700">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white font-semibold mb-2">Email Subject *</label>
                      <input
                        type="text"
                        value={formData.subject || ''}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg focus:border-orange-500 focus:outline-none"
                        placeholder="Email subject line..."
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-white font-semibold">Email Body *</label>
                        <div className="flex gap-2">
                          <span className="text-sm text-gray-400">Available variables:</span>
                          <div className="flex gap-1 flex-wrap">
                            {template.variables.map((variable) => (
                              <button
                                key={variable}
                                onClick={() => insertVariable(variable)}
                                className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition"
                                title={`Insert {{${variable}}}`}
                              >
                                {variable}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <textarea
                        id="email-body"
                        value={formData.body || ''}
                        onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                        rows={15}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none font-mono text-sm"
                        placeholder="Email body content..."
                      />
                      <p className="text-sm text-gray-400 mt-2">
                        Use variables like {'{{order_number}}'}, {'{{customer_name}}'}, etc. Click variable buttons to insert.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`active-${template.id}`}
                        checked={formData.is_active ?? true}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-5 h-5"
                      />
                      <label htmlFor={`active-${template.id}`} className="text-white font-semibold cursor-pointer">
                        Active (send this email)
                      </label>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={handleSave}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition"
                      >
                        <Save className="w-6 h-6" />
                        Save Template
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!isEditing && (
                <div className="p-6 border-t-2 border-gray-700">
                  <div className="bg-gray-850 rounded-lg p-4">
                    <p className="text-gray-400 text-sm font-semibold mb-2">Current Subject:</p>
                    <p className="text-white">{template.subject}</p>
                    <p className="text-gray-400 text-sm font-semibold mb-2 mt-4">Variables Used:</p>
                    <div className="flex gap-2 flex-wrap">
                      {template.variables.map((variable) => (
                        <span key={variable} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                          {'{{' + variable + '}}'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {preview && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">Email Preview</h3>
              <button
                onClick={() => setPreview(null)}
                className="p-2 hover:bg-gray-800 rounded-lg transition"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-white rounded-lg p-6 text-gray-900">
                <pre className="whitespace-pre-wrap font-sans">{preview}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 bg-green-500/20 border border-green-400/30 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-3">✉️ How It Works</h3>
        <div className="text-sm text-green-100 space-y-2">
          <p>• <strong>Automatic:</strong> Emails are sent automatically after successful purchases</p>
          <p>• <strong>Personalized:</strong> Variables are replaced with actual order data</p>
          <p>• <strong>Professional:</strong> Customers receive professional order confirmations</p>
          <p>• <strong>Tracked:</strong> All sent emails are logged in the system</p>
        </div>
      </div>
    </div>
  );
}
