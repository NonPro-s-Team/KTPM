import { kpiCards } from '../../data/funnelsMockData'
import { KpiCard } from './KpiCard'

export function KpiCardRow() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
      {kpiCards.map((card) => (
        <KpiCard key={card.id} data={card} />
      ))}
    </div>
  )
}
