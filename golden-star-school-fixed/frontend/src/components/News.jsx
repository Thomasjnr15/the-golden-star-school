function News({ news = [] }) {
  const sampleNews = [
    { id: 1, title: 'New Academic Session Begins', description: 'We are excited to welcome all students back for the new academic session. Registration is now open.', date: '2026-05-01', image_url: null },
    { id: 2, title: 'First Term Examination Timetable', description: 'The first term CBT examination timetable has been released. Students should check their dashboards.', date: '2026-04-20', image_url: null },
    { id: 3, title: 'Parents Meeting Notice', description: 'All parents are invited to the end-of-term parents meeting scheduled for next Friday at 10am.', date: '2026-04-10', image_url: null },
  ];

  const displayNews = news.length > 0 ? news : sampleNews;

  return (
    <section id="news" className="py-20 px-6 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-14">
          <span className="text-yellow-600 font-semibold uppercase tracking-widest text-sm">Latest Updates</span>
          <h2 className="text-4xl font-bold text-blue-900 mt-2 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>News & Announcements</h2>
          <div className="w-16 h-1 bg-yellow-400 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {displayNews.slice(0, 3).map((item) => (
            <div key={item.id}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="h-40 bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center overflow-hidden">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl">📢</span>
                )}
              </div>
              <div className="p-6">
                <span className="text-xs text-yellow-600 font-semibold uppercase tracking-wider">
                  {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <h3 className="text-lg font-bold text-blue-900 mt-2 mb-3 group-hover:text-yellow-600 transition-colors">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button className="px-8 py-3 border-2 border-blue-900 text-blue-900 font-semibold rounded-xl hover:bg-blue-900 hover:text-white transition-all duration-300">
            See All News →
          </button>
        </div>
      </div>
    </section>
  );
}

export default News;
