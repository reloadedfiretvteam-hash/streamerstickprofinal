import { useState, useEffect } from 'react';
import { Save, Eye, Edit3, RefreshCw, Palette, Image as ImageIcon, Upload } from 'lucide-react';
import { supabase, getStorageUrl } from '../../lib/supabase';

interface HomepageSection {
  id: string;
  section_name: string;
  component_name: string;
  background_color: string;
  text_color: string;
  padding_top: string;
  padding_bottom: string;
  display_order: number;
  is_visible: boolean;
  content_preview: string;
  has_images: boolean;
  image_locations: string[];
}

export default function HomepageSectionEditor() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<HomepageSection | null>(null);
  const [editedSection, setEditedSection] = useState<HomepageSection | null>(null);
  const [saving, setSaving] = useState(false);
  const [heroImageUrl, setHeroImageUrl] = useState<string>('');
  const [heroImageLoading, setHeroImageLoading] = useState(false);

  useEffect(() => {
    loadSections();
    loadHeroImage();
  }, []);

  const loadHeroImage = async () => {
    try {
      const { data } = await supabase
        .from('section_images')
        .select('image_url')
        .eq('section_name', 'hero')
        .single();
      
      if (data && data.image_url) {
        setHeroImageUrl(data.image_url);
      }
    } catch (error) {
      console.error('Error loading hero image:', error);
    }
  };

  const updateHeroImage = async (imageFilename: string) => {
    setHeroImageLoading(true);
    try {
      const { error } = await supabase
        .from('section_images')
        .upsert({
          section_name: 'hero',
          image_url: imageFilename, // Just the filename, getStorageUrl will handle the URL
          alt_text: 'Hero background image'
        }, {
          onConflict: 'section_name'
        });

      if (error) throw error;

      setHeroImageUrl(imageFilename);
      alert('✅ Hero image updated successfully! Refresh your website to see the change.');
    } catch (error) {
      console.error('Error updating hero image:', error);
      alert('Error updating hero image. Please try again.');
    } finally {
      setHeroImageLoading(false);
    }
  };

  const loadSections = async () => {
    setLoading(true);

    const homepageSections: HomepageSection[] = [
      {
        id: 'hero',
        section_name: 'Hero Banner',
        component_name: 'Hero.tsx',
        background_color: '#1e3a8a',
        text_color: '#ffffff',
        padding_top: '5rem',
        padding_bottom: '5rem',
        display_order: 1,
        is_visible: true,
        content_preview: 'Inferno TV - Premium IPTV Subscriptions & Jailbroken Fire Stick Shop',
        has_images: false,
        image_locations: []
      },
      {
        id: 'trust-badges',
        section_name: 'Trust Badges',
        component_name: 'TrustBadges.tsx',
        background_color: '#374151',
        text_color: '#ffffff',
        padding_top: '3rem',
        padding_bottom: '3rem',
        display_order: 2,
        is_visible: true,
        content_preview: 'Secure Payment, Fast Shipping, 24/7 Support, Money Back',
        has_images: false,
        image_locations: []
      },
      {
        id: 'about',
        section_name: 'About Section',
        component_name: 'About.tsx',
        background_color: '#ffffff',
        text_color: '#111827',
        padding_top: '5rem',
        padding_bottom: '5rem',
        display_order: 3,
        is_visible: true,
        content_preview: 'What is Inferno TV? Stream unlimited content...',
        has_images: false,
        image_locations: []
      },
      {
        id: 'why-choose',
        section_name: 'Why Choose Us',
        component_name: 'WhyChooseUs.tsx',
        background_color: '#1f2937',
        text_color: '#ffffff',
        padding_top: '5rem',
        padding_bottom: '5rem',
        display_order: 4,
        is_visible: true,
        content_preview: 'Comparison: Other Websites vs Inferno TV',
        has_images: false,
        image_locations: []
      },
      {
        id: 'carousel',
        section_name: 'Media Carousel',
        component_name: 'MediaCarousel.tsx',
        background_color: '#111827',
        text_color: '#ffffff',
        padding_top: '4rem',
        padding_bottom: '4rem',
        display_order: 5,
        is_visible: true,
        content_preview: 'Image slider showing product photos',
        has_images: true,
        image_locations: ['/OIF.jpg', '/5-1.webp', '/9-1.webp', '/OIF copy.jpg', '/OIP (11)99.jpg']
      },
      {
        id: 'shop',
        section_name: 'Shop Products',
        component_name: 'Shop.tsx',
        background_color: '#f9fafb',
        text_color: '#111827',
        padding_top: '5rem',
        padding_bottom: '5rem',
        display_order: 6,
        is_visible: true,
        content_preview: 'Product grid - loads from real_products table',
        has_images: true,
        image_locations: ['Product images from database']
      },
      {
        id: 'reviews',
        section_name: 'Customer Reviews',
        component_name: 'ReviewsCarousel.tsx',
        background_color: '#1e40af',
        text_color: '#ffffff',
        padding_top: '4rem',
        padding_bottom: '4rem',
        display_order: 7,
        is_visible: true,
        content_preview: 'Customer testimonials with star ratings',
        has_images: false,
        image_locations: []
      },
      {
        id: 'comparison',
        section_name: 'Comparison Table',
        component_name: 'ComparisonTable.tsx',
        background_color: '#ffffff',
        text_color: '#111827',
        padding_top: '5rem',
        padding_bottom: '5rem',
        display_order: 8,
        is_visible: true,
        content_preview: 'Cable vs Streaming vs Inferno TV',
        has_images: false,
        image_locations: []
      },
      {
        id: 'demo-video',
        section_name: 'Demo Video',
        component_name: 'DemoVideo.tsx',
        background_color: '#374151',
        text_color: '#ffffff',
        padding_top: '5rem',
        padding_bottom: '5rem',
        display_order: 9,
        is_visible: true,
        content_preview: 'YouTube video embed',
        has_images: true,
        image_locations: ['YouTube video thumbnail']
      },
      {
        id: 'what-is-iptv',
        section_name: 'What Is IPTV',
        component_name: 'WhatIsIPTV.tsx',
        background_color: '#ffffff',
        text_color: '#111827',
        padding_top: '5rem',
        padding_bottom: '5rem',
        display_order: 10,
        is_visible: true,
        content_preview: 'IPTV explanation and benefits',
        has_images: false,
        image_locations: []
      },
      {
        id: 'devices',
        section_name: 'Compatible Devices',
        component_name: 'Devices.tsx',
        background_color: '#1e3a8a',
        text_color: '#ffffff',
        padding_top: '4rem',
        padding_bottom: '4rem',
        display_order: 11,
        is_visible: true,
        content_preview: 'Works on Fire Stick, Smart TV, Android, iOS...',
        has_images: false,
        image_locations: []
      },
      {
        id: 'tutorials',
        section_name: 'YouTube Tutorials',
        component_name: 'YouTubeTutorials.tsx',
        background_color: '#ffffff',
        text_color: '#111827',
        padding_top: '5rem',
        padding_bottom: '5rem',
        display_order: 12,
        is_visible: true,
        content_preview: 'Setup tutorial videos',
        has_images: true,
        image_locations: ['YouTube video thumbnails']
      },
      {
        id: 'blog',
        section_name: 'Blog Posts',
        component_name: 'BlogDisplay.tsx',
        background_color: '#f3f4f6',
        text_color: '#111827',
        padding_top: '5rem',
        padding_bottom: '5rem',
        display_order: 13,
        is_visible: true,
        content_preview: 'Latest blog articles - loads from real_blog_posts table',
        has_images: true,
        image_locations: ['Blog featured images from database']
      },
      {
        id: 'guarantee',
        section_name: 'Money Back Guarantee',
        component_name: 'MoneyBackGuarantee.tsx',
        background_color: '#10b981',
        text_color: '#ffffff',
        padding_top: '4rem',
        padding_bottom: '4rem',
        display_order: 14,
        is_visible: true,
        content_preview: '7-Day Money Back Guarantee badge',
        has_images: false,
        image_locations: []
      },
      {
        id: 'faq',
        section_name: 'FAQ Section',
        component_name: 'FAQ.tsx',
        background_color: '#ffffff',
        text_color: '#111827',
        padding_top: '5rem',
        padding_bottom: '5rem',
        display_order: 15,
        is_visible: true,
        content_preview: 'Frequently Asked Questions accordion',
        has_images: false,
        image_locations: []
      },
      {
        id: 'email-capture',
        section_name: 'Email Capture',
        component_name: 'EmailCaptureBottom.tsx',
        background_color: '#ea580c',
        text_color: '#ffffff',
        padding_top: '4rem',
        padding_bottom: '4rem',
        display_order: 16,
        is_visible: true,
        content_preview: 'Get exclusive offers - email signup',
        has_images: false,
        image_locations: []
      },
      {
        id: 'legal',
        section_name: 'Legal Disclaimer',
        component_name: 'LegalDisclaimer.tsx',
        background_color: '#374151',
        text_color: '#9ca3af',
        padding_top: '2rem',
        padding_bottom: '2rem',
        display_order: 17,
        is_visible: true,
        content_preview: 'Legal disclaimer text',
        has_images: false,
        image_locations: []
      },
      {
        id: 'footer',
        section_name: 'Footer',
        component_name: 'Footer.tsx',
        background_color: '#000000',
        text_color: '#ffffff',
        padding_top: '4rem',
        padding_bottom: '4rem',
        display_order: 18,
        is_visible: true,
        content_preview: 'Footer with links, contact info, social media',
        has_images: false,
        image_locations: []
      }
    ];

    setSections(homepageSections);
    setLoading(false);
  };

  const handleEdit = (section: HomepageSection) => {
    setSelectedSection(section);
    setEditedSection({ ...section });
  };

  const handleSave = async () => {
    if (!editedSection) return;

    setSaving(true);

    try {
      // Save section styles to site_settings table
      await supabase
        .from('site_settings')
        .upsert({
          setting_key: `section_${editedSection.id}_bg_color`,
          setting_value: editedSection.background_color,
          category: 'homepage_sections'
        });

      await supabase
        .from('site_settings')
        .upsert({
          setting_key: `section_${editedSection.id}_text_color`,
          setting_value: editedSection.text_color,
          category: 'homepage_sections'
        });

      await supabase
        .from('site_settings')
        .upsert({
          setting_key: `section_${editedSection.id}_padding_top`,
          setting_value: editedSection.padding_top,
          category: 'homepage_sections'
        });

      await supabase
        .from('site_settings')
        .upsert({
          setting_key: `section_${editedSection.id}_padding_bottom`,
          setting_value: editedSection.padding_bottom,
          category: 'homepage_sections'
        });

      // Update local state
      setSections(prev =>
        prev.map(s => s.id === editedSection.id ? editedSection : s)
      );

      alert(`✅ Section "${editedSection.section_name}" updated successfully! Changes will appear on your website.`);
    } catch (error) {
      console.error('Error saving section:', error);
      alert('Error saving changes. Please try again.');
    }

    setSaving(false);
    setSelectedSection(null);
    setEditedSection(null);
  };

  const handleCancel = () => {
    setSelectedSection(null);
    setEditedSection(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Eye className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Homepage Visual Editor</h2>
            <p className="text-sm opacity-90">See every section of your homepage and edit styles</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Your Homepage Layout (Top to Bottom)</h3>
          <p className="text-gray-600">
            Click any section to edit colors, spacing, and see where images are located
          </p>
        </div>

        <div className="space-y-3">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className="border-2 border-gray-200 rounded-lg p-4 hover:border-orange-500 transition cursor-pointer"
              onClick={() => handleEdit(section)}
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: section.background_color }}>
                  {index + 1}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-bold text-gray-900">{section.section_name}</h4>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{section.component_name}</span>
                    {section.has_images && (
                      <span className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        <ImageIcon className="w-3 h-3" />
                        Has Images
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{section.content_preview}</p>
                  {section.has_images && section.image_locations.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {section.image_locations.map((loc, i) => (
                        <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          📷 {loc}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <Edit3 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedSection && editedSection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-xl">
              <h3 className="text-2xl font-bold mb-2">Edit {selectedSection.section_name}</h3>
              <p className="text-sm opacity-90">Component: {selectedSection.component_name}</p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-orange-500" />
                  Colors
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={editedSection.background_color}
                        onChange={(e) => setEditedSection({ ...editedSection, background_color: e.target.value })}
                        className="w-16 h-10 rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        value={editedSection.background_color}
                        onChange={(e) => setEditedSection({ ...editedSection, background_color: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={editedSection.text_color}
                        onChange={(e) => setEditedSection({ ...editedSection, text_color: e.target.value })}
                        className="w-16 h-10 rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        value={editedSection.text_color}
                        onChange={(e) => setEditedSection({ ...editedSection, text_color: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">Spacing</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Padding Top
                    </label>
                    <input
                      type="text"
                      value={editedSection.padding_top}
                      onChange={(e) => setEditedSection({ ...editedSection, padding_top: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="e.g., 5rem"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Padding Bottom
                    </label>
                    <input
                      type="text"
                      value={editedSection.padding_bottom}
                      onChange={(e) => setEditedSection({ ...editedSection, padding_bottom: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="e.g., 5rem"
                    />
                  </div>
                </div>
              </div>

              {selectedSection.id === 'hero' && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-purple-500" />
                    Hero Background Image
                  </h4>
                  <div className="bg-purple-50 rounded-lg p-4 space-y-4">
                    {heroImageUrl && (
                      <div>
                        <p className="text-sm text-gray-700 mb-2">Current Image:</p>
                        <img 
                          src={getStorageUrl('images', heroImageUrl)} 
                          alt="Current hero" 
                          className="w-full h-48 object-cover rounded-lg border-2 border-purple-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = getStorageUrl('images', 'hero-firestick-breakout.jpg');
                          }}
                        />
                        <p className="text-xs text-gray-600 mt-2 font-mono bg-white px-2 py-1 rounded inline-block">
                          {heroImageUrl}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Change Hero Image (Enter filename from Supabase Storage)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g., hero-firestick-breakout.jpg"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const value = (e.target as HTMLInputElement).value.trim();
                              if (value) {
                                updateHeroImage(value);
                                (e.target as HTMLInputElement).value = '';
                              }
                            }
                          }}
                        />
                        <button
                          onClick={(e) => {
                            const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                            if (input && input.value.trim()) {
                              updateHeroImage(input.value.trim());
                              input.value = '';
                            }
                          }}
                          disabled={heroImageLoading}
                          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded font-semibold transition disabled:opacity-50 flex items-center gap-2"
                        >
                          {heroImageLoading ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          Update
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        💡 Enter the exact filename from your Supabase Storage bucket "images". Make sure the image is uploaded to Supabase first!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedSection.has_images && selectedSection.id !== 'hero' && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-purple-500" />
                    Images in This Section
                  </h4>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <ul className="space-y-2">
                      {selectedSection.image_locations.map((location, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="font-mono bg-white px-2 py-1 rounded">{location}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-gray-600 mt-3">
                      💡 To change images, use the "Homepage Carousel" tool for carousel images, or "Product Manager" for product images.
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">Preview</h4>
                <div
                  className="rounded-lg p-6 border-2 border-gray-300"
                  style={{
                    backgroundColor: editedSection.background_color,
                    color: editedSection.text_color,
                    paddingTop: editedSection.padding_top,
                    paddingBottom: editedSection.padding_bottom
                  }}
                >
                  <p className="font-bold">{selectedSection.section_name}</p>
                  <p className="text-sm opacity-75">{selectedSection.content_preview}</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> This editor changes visual styles only. To edit text content, buttons, or functionality,
                  you need to edit the component file: <code className="bg-white px-2 py-1 rounded">{selectedSection.component_name}</code>
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-lg transition flex items-center gap-2"
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
        </div>
      )}
    </div>
  );
}
