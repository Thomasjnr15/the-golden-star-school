import { useState } from 'react';
import axios from 'axios';

function Contact({ settings }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const email = settings?.contact_email || 'info@goldenstarschool.edu.ng';
  const phone = settings?.contact_phone || '+234 800 000 0000';
  const address = settings?.contact_address || '12 School Road, Lagos, Nigeria';
  const mapUrl = settings?.map_embed || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/contact', form);
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="py-20 px-6 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-14">
          <span className="text-yellow-600 font-semibold uppercase tracking-widest text-sm">Get In Touch</span>
          <h2 className="text-4xl font-bold text-blue-900 mt-2 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Contact Us</h2>
          <div className="w-16 h-1 bg-yellow-400 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <div className="bg-white rounded-2xl p-8 shadow-md">
            <h3 className="text-xl font-bold text-blue-900 mb-6">Send Us a Message</h3>
            {status === 'success' && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
                ✅ Message sent! We'll get back to you shortly.
              </div>
            )}
            {status === 'error' && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                ❌ Something went wrong. Please try again.
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input type="text" placeholder="Your name"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input type="email" placeholder="your@email.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea rows={5} placeholder="Write your message..."
                  value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all resize-none" />
              </div>
              <button onClick={handleSubmit}
                className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl hover:bg-blue-800 hover:shadow-lg transition-all duration-300">
                Send Message →
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            {[
              { icon: '📧', label: 'Email', value: email },
              { icon: '📞', label: 'Phone', value: phone },
              { icon: '📍', label: 'Address', value: address },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-start gap-4 bg-white rounded-2xl p-6 shadow-md">
                <div className="w-12 h-12 bg-yellow-400 bg-opacity-20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">{icon}</div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">{label}</p>
                  <p className="text-blue-900 font-bold mt-1">{value}</p>
                </div>
              </div>
            ))}

            {/* Map */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-md h-48">
              {mapUrl ? (
                <iframe src={mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title="School Location" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🗺️</div>
                    <p className="text-blue-900 font-semibold text-sm">Add Google Maps link from admin panel</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
