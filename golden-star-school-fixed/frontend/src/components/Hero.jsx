import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Hero({ settings }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
  }, []);

  const heroImage = settings?.hero_image || null;
  const heading = settings?.hero_heading || 'Welcome to Golden Star School';
  const subheading = settings?.hero_subheading || 'Excellence in Primary and Secondary Education';

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #001F54 0%, #003080 50%, #001F54 100%)' }}>

      {/* Gold accent lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-60" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-60" />
        <div className="absolute top-20 -left-20 w-96 h-96 rounded-full bg-yellow-400 opacity-5 blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 rounded-full bg-yellow-400 opacity-5 blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="flex flex-col lg:flex-row items-center gap-12">

          {/* Text Left */}
          <div className={`flex-1 text-center lg:text-left transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-yellow-400 bg-opacity-20 border border-yellow-400 border-opacity-40 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-yellow-400 text-sm font-semibold tracking-wider uppercase">Primary & Secondary School</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
              style={{ fontFamily: "'Poppins', sans-serif" }}>
              {heading.split(' ').map((word, i) =>
                word === 'Golden' || word === 'Star' ?
                  <span key={i} className="text-yellow-400">{word} </span> :
                  <span key={i}>{word} </span>
              )}
            </h1>

            <p className="text-lg md:text-xl text-blue-200 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {subheading}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/register"
                className="group px-8 py-4 bg-yellow-400 text-blue-900 font-bold rounded-xl hover:bg-yellow-300 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/30 hover:-translate-y-0.5 text-center">
                Register Now
                <span className="ml-2 group-hover:translate-x-1 inline-block transition-transform">→</span>
              </Link>
              <a href="#about"
                className="px-8 py-4 border-2 border-white border-opacity-30 text-white font-semibold rounded-xl hover:bg-white hover:bg-opacity-10 transition-all duration-300 text-center">
                Learn More
              </a>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-12 justify-center lg:justify-start">
              {[['500+', 'Students'], ['20+', 'Teachers'], ['10+', 'Years']].map(([num, label]) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{num}</div>
                  <div className="text-blue-300 text-sm">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Image Right */}
          <div className={`flex-1 flex justify-center transition-all duration-1000 delay-300 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 bg-yellow-400 rounded-3xl opacity-20 blur-2xl transform rotate-6" />
              <div className="relative bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-3xl overflow-hidden aspect-square flex items-center justify-center">
                {heroImage ? (
                  <img src={heroImage} alt="Golden Star School" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-8">
                    <div className="text-8xl mb-4">🏫</div>
                    <p className="text-yellow-400 font-semibold">Golden Star School</p>
                    <p className="text-blue-200 text-sm mt-1">Add hero image from admin panel</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white border-opacity-40 rounded-full flex items-start justify-center p-1">
          <div className="w-1 h-3 bg-white bg-opacity-60 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}

export default Hero;
