import { Link } from 'react-router-dom';

function Footer({ settings }) {
  const schoolName = settings?.school_name || 'Golden Star School';
  const logo = settings?.logo || null;

  return (
    <footer style={{ background: '#001F54' }} className="py-12 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

          {/* Logo & Name */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              {logo ? (
                <img src={logo} alt="Logo" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-blue-900 font-bold text-xl">G</div>
              )}
              <span className="text-white font-bold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>{schoolName}</span>
            </div>
            <p className="text-blue-300 text-sm leading-relaxed">Excellence in Primary and Secondary Education. Nurturing tomorrow's leaders today.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-yellow-400 font-bold mb-4 uppercase tracking-wider text-sm">Quick Links</h4>
            <div className="space-y-2">
              {[['Home', '/'], ['About', '#about'], ['Admission', '#admission'], ['Fees', '#fees'], ['Contact', '#contact'], ['Student Login', '/student-login']].map(([label, href]) => (
                <div key={label}>
                  {href.startsWith('/') ? (
                    <Link to={href} className="text-blue-300 hover:text-yellow-400 transition-colors text-sm block">{label}</Link>
                  ) : (
                    <a href={href} className="text-blue-300 hover:text-yellow-400 transition-colors text-sm block">{label}</a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-yellow-400 font-bold mb-4 uppercase tracking-wider text-sm">Contact</h4>
            <div className="space-y-2 text-blue-300 text-sm">
              <p>📧 {settings?.contact_email || 'info@goldenstarschool.edu.ng'}</p>
              <p>📞 {settings?.contact_phone || '+234 800 000 0000'}</p>
              <p>📍 {settings?.contact_address || '12 School Road, Lagos, Nigeria'}</p>
            </div>
            {/* Social Links */}
            <div className="flex gap-3 mt-4">
              {settings?.facebook && <a href={settings.facebook} className="text-blue-300 hover:text-yellow-400 transition-colors">Facebook</a>}
              {settings?.twitter && <a href={settings.twitter} className="text-blue-300 hover:text-yellow-400 transition-colors">Twitter</a>}
            </div>
          </div>
        </div>

        <div className="border-t border-white border-opacity-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-blue-300 text-sm">© 2026 Golden Star School. All rights reserved.</p>
          <p className="text-blue-400 text-xs">Designed to scale for web and mobile apps</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
