function About({ settings }) {
  const aboutText = settings?.about_text || 'Golden Star School is committed to providing world-class education for primary and secondary students. We nurture excellence, character, and lifelong learning in every child.';

  const cards = [
    { icon: '🎯', title: 'Our Mission', text: 'To provide quality education that empowers every student to reach their full potential.' },
    { icon: '🌟', title: 'Our Vision', text: 'To be the leading school producing future leaders, innovators, and responsible citizens.' },
    { icon: '💎', title: 'Our Values', text: 'Excellence, Integrity, Discipline, Innovation, and Community — the pillars of Golden Star School.' },
  ];

  return (
    <section id="about" className="py-20 px-6" style={{ background: '#FFF8E1' }}>
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-14">
          <span className="text-yellow-600 font-semibold uppercase tracking-widest text-sm">Who We Are</span>
          <h2 className="text-4xl font-bold text-blue-900 mt-2 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>About Us</h2>
          <div className="w-16 h-1 bg-yellow-400 mx-auto mb-6 rounded-full" />
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">{aboutText}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card) => (
            <div key={card.title}
              className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-yellow-100 text-center group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{card.icon}</div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">{card.title}</h3>
              <p className="text-gray-600 leading-relaxed">{card.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default About;
