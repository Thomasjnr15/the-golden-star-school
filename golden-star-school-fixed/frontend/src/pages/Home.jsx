import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import About from '../components/About';
import News from '../components/News';
import Fees from '../components/Fees';
import Admission from '../components/Admission';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import axios from 'axios';

function Navbar({ settings }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-blue-900 shadow-lg' : 'bg-transparent'}`}>
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          {settings?.logo ? (
            <img src={settings.logo} alt="Logo" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-blue-900 font-bold">G</div>
          )}
          <span className="text-white font-bold text-lg hidden sm:block" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {settings?.school_name || 'Golden Star School'}
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {[['Home', '/'], ['About', '#about'], ['Fees', '#fees'], ['Admission', '#admission'], ['Contact', '#contact']].map(([label, href]) => (
            href.startsWith('/') ? (
              <Link key={label} to={href} className="text-white hover:text-yellow-400 transition-colors font-medium text-sm">{label}</Link>
            ) : (
              <a key={label} href={href} className="text-white hover:text-yellow-400 transition-colors font-medium text-sm">{label}</a>
            )
          ))}
          <Link to="/student-login" className="px-5 py-2 bg-yellow-400 text-blue-900 font-bold rounded-lg hover:bg-yellow-300 transition-colors text-sm">
            Student Login
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white text-2xl">
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-blue-900 border-t border-white border-opacity-10 px-6 py-4 space-y-3">
          {[['Home', '/'], ['About', '#about'], ['Fees', '#fees'], ['Admission', '#admission'], ['Contact', '#contact']].map(([label, href]) => (
            href.startsWith('/') ? (
              <Link key={label} to={href} onClick={() => setMenuOpen(false)} className="block text-white hover:text-yellow-400 py-2 font-medium">{label}</Link>
            ) : (
              <a key={label} href={href} onClick={() => setMenuOpen(false)} className="block text-white hover:text-yellow-400 py-2 font-medium">{label}</a>
            )
          ))}
          <Link to="/student-login" onClick={() => setMenuOpen(false)}
            className="block text-center bg-yellow-400 text-blue-900 font-bold py-3 rounded-lg mt-2">
            Student Login
          </Link>
        </div>
      )}
    </nav>
  );
}

function Home() {
  const [settings, setSettings] = useState(null);
  const [news, setNews] = useState([]);

  useEffect(() => {
    axios.get('/api/settings/public').then(r => setSettings(r.data)).catch(() => {});
    axios.get('/api/news').then(r => setNews(r.data)).catch(() => {});
  }, []);

  return (
    <div className="font-sans" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <Navbar settings={settings} />
      <Hero settings={settings} />
      <About settings={settings} />
      <News news={news} />
      <Fees settings={settings} />
      <Admission settings={settings} />
      <Contact settings={settings} />
      <Footer settings={settings} />
    </div>
  );
}

export default Home;
