import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function StudentRegister() {
  const [step, setStep] = useState(1); // Step 1: form, Step 2: success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    // Student Info
    full_name: '',
    date_of_birth: '',
    gender: '',
    class_applying: '',
    previous_school: '',
    // Parent Info
    parent_name: '',
    parent_phone: '',
    parent_email: '',
    home_address: '',
    // Extra
    additional_info: '',
  });

  const CLASSES = [
    'Primary 1', 'Primary 2', 'Primary 3',
    'Primary 4', 'Primary 5', 'Primary 6',
    'JSS 1', 'JSS 2', 'JSS 3',
    'SSS 1', 'SSS 2', 'SSS 3'
  ];

  const update = (field, value) => setForm({ ...form, [field]: value });

  const handleSubmit = async () => {
    // Validate required fields
    const required = ['full_name', 'date_of_birth', 'gender', 'class_applying', 'parent_name', 'parent_phone', 'home_address'];
    for (const field of required) {
      if (!form[field]) {
        setError('Please fill in all required fields marked with *');
        return;
      }
    }
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/registrations', form);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'linear-gradient(135deg, #001F54 0%, #003080 100%)', fontFamily: 'Poppins, sans-serif' }}>
        <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-blue-900 mb-3">Registration Submitted!</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Thank you! Your registration request has been submitted successfully.
            The school admin will review your application and contact you with your
            <span className="font-semibold text-blue-900"> login details</span> once approved.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-yellow-800 text-sm font-semibold mb-2">📋 What happens next?</p>
            <ol className="text-yellow-700 text-sm space-y-1 list-decimal list-inside">
              <li>Admin reviews your application</li>
              <li>Admin approves and assigns your reg. number</li>
              <li>You receive your login details</li>
              <li>You can then login to your dashboard</li>
            </ol>
          </div>
          <Link to="/" className="block w-full py-3 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 transition-colors">
            ← Back to Website
          </Link>
          <Link to="/student-login" className="block w-full py-3 mt-3 border-2 border-blue-900 text-blue-900 font-bold rounded-xl hover:bg-blue-50 transition-colors">
            Already have login? Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #001F54 0%, #003080 100%)', fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="text-center pt-10 pb-6 px-4">
        <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-blue-900 font-bold text-2xl mx-auto mb-4">G</div>
        <h1 className="text-2xl font-bold text-white">Golden Star School</h1>
        <p className="text-blue-300 mt-1">New Student Registration</p>
      </div>

      <div className="container mx-auto max-w-2xl px-4 pb-12">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Progress Bar */}
          <div className="bg-blue-900 px-6 py-4">
            <div className="flex items-center justify-between text-white text-sm mb-2">
              <span className="font-semibold">Registration Form</span>
              <span className="text-blue-300">All fields marked * are required</span>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
              <div className="bg-yellow-400 h-2 rounded-full w-full" />
            </div>
          </div>

          <div className="p-6 md:p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                ❌ {error}
              </div>
            )}

            {/* SECTION 1: Student Information */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center text-yellow-400 font-bold text-sm">1</div>
                <h3 className="text-lg font-bold text-blue-900">Student Information</h3>
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" placeholder="e.g. Amara Johnson"
                    value={form.full_name} onChange={e => update('full_name', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent" />
                </div>

                {/* Date of Birth and Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input type="date"
                      value={form.date_of_birth} onChange={e => update('date_of_birth', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select value={form.gender} onChange={e => update('gender', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent">
                      <option value="">Select gender...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                {/* Class Applying For */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Class Applying For <span className="text-red-500">*</span>
                  </label>
                  <select value={form.class_applying} onChange={e => update('class_applying', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent">
                    <option value="">Select class...</option>
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Previous School */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Previous School <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input type="text" placeholder="e.g. ABC Primary School"
                    value={form.previous_school} onChange={e => update('previous_school', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent" />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 mb-8" />

            {/* SECTION 2: Parent/Guardian Information */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center text-yellow-400 font-bold text-sm">2</div>
                <h3 className="text-lg font-bold text-blue-900">Parent / Guardian Information</h3>
              </div>

              <div className="space-y-4">
                {/* Parent Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Parent / Guardian Full Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" placeholder="e.g. Mr. Emmanuel Johnson"
                    value={form.parent_name} onChange={e => update('parent_name', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent" />
                </div>

                {/* Phone and Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input type="tel" placeholder="e.g. 08012345678"
                      value={form.parent_phone} onChange={e => update('parent_phone', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Email Address <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input type="email" placeholder="parent@email.com"
                      value={form.parent_email} onChange={e => update('parent_email', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent" />
                  </div>
                </div>

                {/* Home Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Home Address <span className="text-red-500">*</span>
                  </label>
                  <textarea rows={3} placeholder="e.g. 5 School Lane, Lagos"
                    value={form.home_address} onChange={e => update('home_address', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none" />
                </div>

                {/* Additional Info */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Additional Information <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea rows={3} placeholder="Any extra information you'd like the school to know..."
                    value={form.additional_info} onChange={e => update('additional_info', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none" />
                </div>
              </div>
            </div>

            {/* Notice Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-blue-800 text-sm leading-relaxed">
                <span className="font-bold">📌 Please Note:</span> Submitting this form does not guarantee admission.
                The school admin will review your application and contact you with your login details if approved.
              </p>
            </div>

            {/* Submit Button */}
            <button onClick={handleSubmit} disabled={loading}
              className="w-full py-4 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 transition-all duration-300 disabled:opacity-60 text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              {loading ? '⏳ Submitting...' : 'Submit Registration →'}
            </button>

            <div className="text-center mt-4">
              <p className="text-gray-500 text-sm">
                Already have an account?{' '}
                <Link to="/student-login" className="text-blue-600 font-semibold hover:underline">Login here</Link>
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-blue-300 hover:text-white transition-colors text-sm">← Back to Website</Link>
        </div>
      </div>
    </div>
  );
}

export default StudentRegister;
