import { AppShell } from '../components/layout/AppShell'
import { TopBar } from '../components/layout/TopBar'
import { PageHeader } from '../components/funnels/PageHeader'
import { KpiCardRow } from '../components/funnels/KpiCardRow'
import { FilterToolbar } from '../components/funnels/FilterToolbar'
import { MainFunnelCard } from '../components/funnels/MainFunnelCard'
import { FunnelPerformanceCard } from '../components/funnels/FunnelPerformanceCard'
import { FunnelTrendChart } from '../components/funnels/FunnelTrendChart'
import { FunnelInsightsCard } from '../components/funnels/FunnelInsightsCard'
import { TopDropoffReasonsCard } from '../components/funnels/TopDropoffReasonsCard'

export function FunnelsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <TopBar />
        <PageHeader />
        <KpiCardRow />
        <FilterToolbar />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MainFunnelCard />
          </div>
          <FunnelPerformanceCard />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <FunnelTrendChart />
          </div>
          <div className="lg:col-span-3">
            <FunnelInsightsCard />
          </div>
          <div className="lg:col-span-4">
            <TopDropoffReasonsCard />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
