import { useState, useEffect } from 'react';
import { AdminLayout } from './AdminDashboard';
import axios from 'axios';

function Settings() {
  const [settings, setSettings] = useState({});
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const token = localStorage.getItem('gss_token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get('/api/settings', { headers }).then(r => setSettings(r.data)).catch(() => {});
  }, []);

  const save = async () => {
    setLoading(true);
    try {
      await axios.put('/api/settings', settings, { headers });
      setMsg('✅ Settings saved! Changes are now live on the website.');
    } catch {
      setMsg('❌ Error saving settings. Please try again.');
    }
    setLoading(false);
    setTimeout(() => setMsg(''), 4000);
  };

  const Field = ({ label, field, type = 'text', placeholder = '' }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {type === 'textarea' ? (
        <textarea rows={4} placeholder={placeholder} value={settings[field] || ''}
          onChange={e => setSettings({ ...settings, [field]: e.target.value })}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none" />
      ) : (
        <input type={type} placeholder={placeholder} value={settings[field] || ''}
          onChange={e => setSettings({ ...settings, [field]: e.target.value })}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
      )}
    </div>
  );

  const tabs = [
    { id: 'general', label: '🏫 General', icon: '🏫' },
    { id: 'homepage', label: '🏠 Homepage', icon: '🏠' },
    { id: 'contact', label: '📞 Contact', icon: '📞' },
    { id: 'fees', label: '💰 Fees', icon: '💰' },
    { id: 'theme', label: '🎨 Theme', icon: '🎨' },
    { id: 'social', label: '📱 Social', icon: '📱' },
  ];

  return (
    <AdminLayout title="School Settings">
      {msg && (
        <div className={`mb-4 p-4 rounded-xl text-sm font-semibold ${msg.includes('❌') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {msg}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-100 p-2 gap-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all
                ${activeTab === tab.id ? 'bg-blue-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              {tab.icon} <span className="hidden sm:inline">{tab.label.split(' ')[1]}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* General */}
          {activeTab === 'general' && (
            <div className="space-y-4 max-w-2xl">
              <h3 className="font-bold text-blue-900 text-lg mb-4">General School Information</h3>
              <Field label="School Name" field="school_name" placeholder="Golden Star School" />
              <Field label="School Tagline" field="tagline" placeholder="Excellence in Primary and Secondary Education" />
              <Field label="Logo URL" field="logo" placeholder="https://your-logo-url.com/logo.png" />
              <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
                💡 Upload your logo to Supabase Storage and paste the URL here. Recommended: 200x200px, PNG format.
              </div>
            </div>
          )}

          {/* Homepage */}
          {activeTab === 'homepage' && (
            <div className="space-y-4 max-w-2xl">
              <h3 className="font-bold text-blue-900 text-lg mb-4">Homepage Content</h3>
              <Field label="Hero Heading" field="hero_heading" placeholder="Welcome to Golden Star School" />
              <Field label="Hero Subheading" field="hero_subheading" placeholder="Excellence in Primary and Secondary Education" />
              <Field label="Hero Image URL" field="hero_image" placeholder="https://your-image-url.com/hero.jpg" />
              <Field label="About Us Text" field="about_text" type="textarea" placeholder="Write your school's about section here..." />
              <Field label="Admission Text" field="admission_text" type="textarea" placeholder="Registration instructions..." />
              <Field label="Admission Image URL" field="admission_image" placeholder="https://your-image-url.com/admission.jpg" />
            </div>
          )}

          {/* Contact */}
          {activeTab === 'contact' && (
            <div className="space-y-4 max-w-2xl">
              <h3 className="font-bold text-blue-900 text-lg mb-4">Contact Information</h3>
              <Field label="Email Address" field="contact_email" type="email" placeholder="info@goldenstarschool.edu.ng" />
              <Field label="Phone Number" field="contact_phone" placeholder="+234 800 000 0000" />
              <Field label="School Address" field="contact_address" placeholder="12 School Road, Lagos, Nigeria" />
              <Field label="Google Maps Embed URL" field="map_embed" placeholder="Paste Google Maps embed URL here..." />
              <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
                💡 To get Google Maps embed URL: Go to Google Maps → Search your school → Share → Embed a map → Copy HTML → Paste only the src URL here.
              </div>
            </div>
          )}

          {/* Fees */}
          {activeTab === 'fees' && (
            <div className="space-y-4 max-w-2xl">
              <h3 className="font-bold text-blue-900 text-lg mb-4">School Fees & Bank Details</h3>
              <Field label="Bank Name" field="bank_name" placeholder="First Bank of Nigeria" />
              <Field label="Account Number" field="account_number" placeholder="1234567890" />
              <Field label="Account Name" field="account_name" placeholder="Golden Star School" />
              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-semibold text-gray-700 mb-3">Fees Table (JSON format)</h4>
                <textarea rows={8} placeholder={`[\n  {"class": "Primary 1-3", "amount": "₦25,000"},\n  {"class": "Primary 4-6", "amount": "₦30,000"}\n]`}
                  value={typeof settings.fees_table === 'string' ? settings.fees_table : JSON.stringify(settings.fees_table || [], null, 2)}
                  onChange={e => setSettings({ ...settings, fees_table: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none" />
                <p className="text-xs text-gray-400 mt-1">Edit the fees table above. Follow the JSON format shown.</p>
              </div>
            </div>
          )}

          {/* Theme */}
          {activeTab === 'theme' && (
            <div className="space-y-6 max-w-2xl">
              <h3 className="font-bold text-blue-900 text-lg mb-4">Theme & Colors</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Primary Color (Gold)', 'primary_color', '#FFD700'],
                  ['Secondary Color (Navy)', 'secondary_color', '#001F54'],
                  ['Background Light', 'bg_light', '#FFF8E1'],
                  ['Background Dark', 'bg_dark', '#F1F5F9'],
                ].map(([label, field, def]) => (
                  <div key={field}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={settings[field] || def}
                        onChange={e => setSettings({ ...settings, [field]: e.target.value })}
                        className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                      <input type="text" value={settings[field] || def}
                        onChange={e => setSettings({ ...settings, [field]: e.target.value })}
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-yellow-50 rounded-xl p-4 text-sm text-yellow-700 border border-yellow-200">
                🎨 Colors update live on the website after saving. Default: Gold (#FFD700) + Navy (#001F54)
              </div>
            </div>
          )}

          {/* Social */}
          {activeTab === 'social' && (
            <div className="space-y-4 max-w-2xl">
              <h3 className="font-bold text-blue-900 text-lg mb-4">Social Media Links</h3>
              {[
                ['Facebook', 'facebook', 'https://facebook.com/goldenstarschool'],
                ['Twitter / X', 'twitter', 'https://twitter.com/goldenstarschool'],
                ['Instagram', 'instagram', 'https://instagram.com/goldenstarschool'],
                ['WhatsApp Number', 'whatsapp', '+2348000000000'],
                ['YouTube', 'youtube', 'https://youtube.com/@goldenstarschool'],
              ].map(([label, field, ph]) => (
                <Field key={field} label={label} field={field} placeholder={ph} />
              ))}
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 flex gap-3">
            <button onClick={save} disabled={loading}
              className="px-8 py-3 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-60 text-sm">
              {loading ? '⏳ Saving...' : '💾 Save All Changes'}
            </button>
            <p className="text-gray-400 text-sm self-center">Changes go live on the website immediately after saving.</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Settings;
