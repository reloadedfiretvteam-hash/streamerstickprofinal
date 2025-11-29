import { useState } from 'react';
import {
  FileText,
  Plus,
  Type,
  Mail,
  Phone,
  List,
  CheckSquare,
  Circle,
  Calendar,
  Upload,
  Hash,
  MapPin,
  Globe,
  Lock,
  Eye,
  Save,
  Settings,
  Trash2,
  Copy,
  Move
} from 'lucide-react';

export default function AdvancedFormBuilder() {
  const [forms] = useState([
    { id: '1', name: 'Contact Form', fields: 5, submissions: 143, conversion: 68 },
    { id: '2', name: 'Order Form', fields: 12, submissions: 89, conversion: 54 },
    { id: '3', name: 'Newsletter Signup', fields: 2, submissions: 847, conversion: 82 }
  ]);

  const [showBuilder, setShowBuilder] = useState(false);
  const [formFields, setFormFields] = useState<any[]>([]);

  const fieldTypes = [
    { type: 'text', label: 'Text Input', icon: Type, color: 'blue' },
    { type: 'email', label: 'Email', icon: Mail, color: 'green' },
    { type: 'phone', label: 'Phone', icon: Phone, color: 'purple' },
    { type: 'number', label: 'Number', icon: Hash, color: 'cyan' },
    { type: 'textarea', label: 'Text Area', icon: FileText, color: 'indigo' },
    { type: 'select', label: 'Dropdown', icon: List, color: 'pink' },
    { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, color: 'orange' },
    { type: 'radio', label: 'Radio Buttons', icon: Circle, color: 'red' },
    { type: 'date', label: 'Date Picker', icon: Calendar, color: 'yellow' },
    { type: 'file', label: 'File Upload', icon: Upload, color: 'teal' },
    { type: 'address', label: 'Address', icon: MapPin, color: 'emerald' },
    { type: 'url', label: 'Website URL', icon: Globe, color: 'violet' },
    { type: 'password', label: 'Password', icon: Lock, color: 'slate' }
  ];

  const addField = (type: string) => {
    const newField = {
      id: Date.now().toString(),
      type,
      label: `New ${type} field`,
      placeholder: '',
      required: false,
      options: type === 'select' || type === 'radio' || type === 'checkbox' ? ['Option 1', 'Option 2'] : [],
      conditionalLogic: {
        enabled: false,
        rules: []
      },
      validation: {
        minLength: 0,
        maxLength: 0,
        pattern: ''
      }
    };
    setFormFields([...formFields, newField]);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-400" />
            Advanced Form Builder
          </h2>
          <p className="text-gray-400 mt-1">Build forms with conditional logic, validations, and integrations</p>
        </div>
        <button
          onClick={() => setShowBuilder(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Form
        </button>
      </div>

      {/* Forms List */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {forms.map(form => (
          <div key={form.id} className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition cursor-pointer border border-gray-700 hover:border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">{form.name}</h3>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-600 rounded-lg transition">
                  <Eye className="w-4 h-4 text-gray-300" />
                </button>
                <button
                  onClick={() => setShowBuilder(true)}
                  className="p-2 hover:bg-gray-600 rounded-lg transition"
                >
                  <Settings className="w-4 h-4 text-gray-300" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Fields</span>
                <span className="text-white font-semibold">{form.fields}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Submissions</span>
                <span className="text-white font-semibold">{form.submissions}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Conversion Rate</span>
                <span className="text-green-400 font-semibold">{form.conversion}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Builder Modal */}
      {showBuilder && (
        <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
          <div className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto bg-gray-800 rounded-2xl">
              {/* Builder Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-t-2xl flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Form Builder</h3>
                <button
                  onClick={() => setShowBuilder(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition"
                >
                  <Eye className="w-6 h-6" />
                </button>
              </div>

              <div className="flex">
                {/* Field Types Sidebar */}
                <div className="w-80 bg-gray-750 p-6 border-r border-gray-700">
                  <h4 className="text-white font-bold mb-4">Field Types</h4>
                  <div className="space-y-2">
                    {fieldTypes.map(field => {
                      const Icon = field.icon;
                      return (
                        <button
                          key={field.type}
                          onClick={() => addField(field.type)}
                          className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-left flex items-center gap-3"
                        >
                          <Icon className="w-5 h-5 text-gray-300" />
                          <span className="text-white font-medium">{field.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Form Canvas */}
                <div className="flex-1 p-6">
                  <div className="bg-white rounded-lg p-8 min-h-[600px]">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Form Preview</h3>

                    {formFields.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Start building your form</p>
                        <p className="text-sm">Click field types on the left to add them</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formFields.map((field, index) => (
                          <div key={field.id} className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition group">
                            <div className="flex items-start justify-between mb-2">
                              <label className="text-gray-900 font-semibold">
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                              </label>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                <button className="p-1 hover:bg-gray-200 rounded">
                                  <Move className="w-4 h-4 text-gray-600" />
                                </button>
                                <button className="p-1 hover:bg-gray-200 rounded">
                                  <Copy className="w-4 h-4 text-gray-600" />
                                </button>
                                <button className="p-1 hover:bg-gray-200 rounded">
                                  <Settings className="w-4 h-4 text-gray-600" />
                                </button>
                                <button
                                  onClick={() => setFormFields(formFields.filter((_, i) => i !== index))}
                                  className="p-1 hover:bg-red-100 rounded"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                              </div>
                            </div>

                            {field.type === 'textarea' ? (
                              <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder={field.placeholder}
                                rows={4}
                              />
                            ) : field.type === 'select' ? (
                              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                <option>Select an option</option>
                                {field.options.map((opt: string, i: number) => (
                                  <option key={i}>{opt}</option>
                                ))}
                              </select>
                            ) : field.type === 'checkbox' || field.type === 'radio' ? (
                              <div className="space-y-2">
                                {field.options.map((opt: string, i: number) => (
                                  <label key={i} className="flex items-center gap-2">
                                    <input type={field.type} name={field.id} />
                                    <span>{opt}</span>
                                  </label>
                                ))}
                              </div>
                            ) : (
                              <input
                                type={field.type}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder={field.placeholder}
                              />
                            )}

                            {field.conditionalLogic.enabled && (
                              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                                Conditional logic enabled
                              </div>
                            )}
                          </div>
                        ))}

                        <button className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition">
                          Submit
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Field Settings Sidebar */}
                {formFields.length > 0 && (
                  <div className="w-80 bg-gray-750 p-6 border-l border-gray-700">
                    <h4 className="text-white font-bold mb-4">Field Settings</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Field Label
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                          placeholder="Enter label"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Placeholder
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
                          placeholder="Enter placeholder"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-gray-300">
                          <input type="checkbox" className="w-4 h-4" />
                          <span>Required field</span>
                        </label>
                      </div>

                      <div className="border-t border-gray-700 pt-4">
                        <h5 className="text-white font-semibold mb-2">Conditional Logic</h5>
                        <label className="flex items-center gap-2 text-gray-300">
                          <input type="checkbox" className="w-4 h-4" />
                          <span>Enable conditional logic</span>
                        </label>
                      </div>

                      <div className="border-t border-gray-700 pt-4">
                        <h5 className="text-white font-semibold mb-2">Validation</h5>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Min Length</label>
                            <input
                              type="number"
                              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Max Length</label>
                            <input
                              type="number"
                              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-700 p-6 flex items-center justify-between">
                <button
                  onClick={() => setShowBuilder(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <div className="flex gap-3">
                  <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition">
                    Save as Draft
                  </button>
                  <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    Publish Form
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Features */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Form Features</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { title: 'Conditional Logic', desc: 'Show/hide fields based on user input', icon: Settings },
            { title: 'Multi-step Forms', desc: 'Break long forms into multiple steps', icon: List },
            { title: 'File Uploads', desc: 'Accept file uploads from users', icon: Upload },
            { title: 'Email Notifications', desc: 'Send notifications on form submission', icon: Mail },
            { title: 'Integrations', desc: 'Connect with CRM, email marketing tools', icon: Globe },
            { title: 'Spam Protection', desc: 'Built-in reCAPTCHA and honeypot', icon: Lock }
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <Icon className="w-8 h-8 text-blue-400 mb-2" />
                <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
