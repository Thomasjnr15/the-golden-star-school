function Fees({ settings }) {
  const bankName = settings?.bank_name || 'First Bank of Nigeria';
  const accountNumber = settings?.account_number || '1234567890';
  const accountName = settings?.account_name || 'Golden Star School';

  const feesTable = settings?.fees_table || [
    { class: 'Primary 1 - 3', amount: '₦25,000' },
    { class: 'Primary 4 - 6', amount: '₦30,000' },
    { class: 'JSS 1 - 3', amount: '₦40,000' },
    { class: 'SSS 1 - 3', amount: '₦50,000' },
  ];

  return (
    <section id="fees" className="py-20 px-6 bg-white">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-14">
          <span className="text-yellow-600 font-semibold uppercase tracking-widest text-sm">Tuition</span>
          <h2 className="text-4xl font-bold text-blue-900 mt-2 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>School Fees</h2>
          <div className="w-16 h-1 bg-yellow-400 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* Payment Info */}
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-8 text-white">
            <h3 className="text-xl font-bold text-yellow-400 mb-6 flex items-center gap-2">
              🏦 Payment Details
            </h3>
            <div className="space-y-4">
              {[['Bank Name', bankName], ['Account Number', accountNumber], ['Account Name', accountName]].map(([label, value]) => (
                <div key={label} className="bg-white bg-opacity-10 rounded-xl p-4">
                  <p className="text-blue-300 text-xs uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-white font-bold text-lg">{value}</p>
                </div>
              ))}
            </div>
            <p className="text-blue-300 text-sm mt-6">💡 Cash payment only. After payment, notify the admin with your receipt.</p>
            <a href="#contact"
              className="mt-6 block text-center bg-yellow-400 text-blue-900 font-bold py-3 px-6 rounded-xl hover:bg-yellow-300 transition-colors">
              Contact Admin for Payment
            </a>
          </div>

          {/* Fees Table */}
          <div>
            <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-2">
              📋 Fees by Class
            </h3>
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-md">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-900 text-white">
                    <th className="py-4 px-6 text-left font-semibold">Class</th>
                    <th className="py-4 px-6 text-right font-semibold">Amount/Term</th>
                  </tr>
                </thead>
                <tbody>
                  {feesTable.map((row, i) => (
                    <tr key={i} className={`${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-yellow-50 transition-colors`}>
                      <td className="py-4 px-6 text-gray-700 font-medium">{row.class}</td>
                      <td className="py-4 px-6 text-right text-blue-900 font-bold">{row.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-gray-500 text-sm mt-4">* Fees are per term. Contact admin for other charges.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Fees;
