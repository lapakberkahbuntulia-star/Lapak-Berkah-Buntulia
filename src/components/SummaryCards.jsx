const summaryCards = [
  {
    title: 'Omset Kotor',
    value: 'Rp 12.500.000',
    icon: 'account_balance_wallet',
    trend: '+15% dari kemarin',
    trendUp: true,
  },
  {
    title: 'Modal Mitra',
    value: 'Rp 8.200.000',
    icon: 'store',
    trend: '65% dari Omset',
    trendUp: false,
  },
  {
    title: 'Net Profit (Owner)',
    value: 'Rp 4.300.000',
    icon: 'trending_up',
    trend: '+22% dari kemarin',
    trendUp: true,
    hero: true,
  },
];

function SummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {summaryCards.map((card) => (
        <div
          key={card.title}
          className={`rounded-xl p-6 shadow-sm flex flex-col justify-between min-h-[140px] relative overflow-hidden ${
            card.hero
              ? 'bg-primary text-on-primary shadow-md'
              : 'bg-surface-container-lowest border border-outline-variant'
          }`}
        >
          {card.hero && (
            <>
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary-fixed-dim/20 rounded-full blur-xl" />
              <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-secondary/20 rounded-full blur-lg" />
            </>
          )}
          <div
            className={`flex items-center justify-between ${
              card.hero ? 'text-on-primary/80' : 'text-on-surface-variant'
            }`}
          >
            <span className="font-label-md text-label-md">{card.title}</span>
            <span
              className={`material-symbols-outlined ${
                card.hero ? 'text-secondary-fixed' : 'text-primary'
              }`}
              data-icon={card.icon}
            >
              {card.icon}
            </span>
          </div>
          <div className="mt-4">
            <span
              className={`font-display-lg text-display-lg font-numeric-data text-numeric-data text-[32px] font-bold tracking-tight ${
                card.hero ? 'text-secondary-fixed' : 'text-on-surface'
              }`}
            >
              {card.value}
            </span>
            <div
              className={`flex items-center gap-1 mt-1 ${
                card.trendUp ? 'text-tertiary-container' : card.hero ? 'text-tertiary-fixed' : 'text-on-surface-variant'
              }`}
            >
              {card.trendUp && (
                <span className="material-symbols-outlined text-[16px]" data-icon="arrow_upward">
                  arrow_upward
                </span>
              )}
              <span className="font-label-sm text-label-sm">{card.trend}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;
