import { Link } from 'react-router-dom';

function Admission({ settings }) {
  const admissionText = settings?.admission_text || 'Join Golden Star School and give your child the best foundation for a bright future. We welcome new students for both Primary and Secondary levels. Registration is simple and straightforward.';
  const admissionImage = settings?.admission_image || null;

  return (
    <section id="admission" className="py-20 px-6" style={{ background: '#001F54' }}>
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center gap-12">

          {/* Text */}
          <div className="flex-1 text-center lg:text-left">
            <span className="text-yellow-400 font-semibold uppercase tracking-widest text-sm">Enroll Today</span>
            <h2 className="text-4xl font-bold text-white mt-2 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Join Golden Star School
            </h2>
            <div className="w-16 h-1 bg-yellow-400 mb-6 rounded-full mx-auto lg:mx-0" />
            <p className="text-blue-200 text-lg leading-relaxed mb-8">{admissionText}</p>

            <div className="space-y-3 mb-8">
              {['Fill the online registration form', 'Submit required documents', 'Pay registration fee at the school', 'Receive your admission letter'].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-yellow-400 text-blue-900 font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-blue-100">{step}</span>
                </div>
              ))}
            </div>

            <Link to="/register"
              className="inline-block px-8 py-4 bg-yellow-400 text-blue-900 font-bold rounded-xl hover:bg-yellow-300 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/30 hover:-translate-y-0.5">
              Register as a Student →
            </Link>
          </div>

          {/* Image */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-sm">
              <div className="absolute inset-0 bg-yellow-400 opacity-20 rounded-3xl blur-2xl" />
              <div className="relative bg-white bg-opacity-10 border border-white border-opacity-20 rounded-3xl overflow-hidden aspect-square flex items-center justify-center">
                {admissionImage ? (
                  <img src={admissionImage} alt="Admission" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-8">
                    <div className="text-8xl mb-4">🎓</div>
                    <p className="text-yellow-400 font-semibold">Start Your Journey</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Admission;
