
import { NAVIGATION_ITEMS } from "@/constants/route.constant"
import { DashboardShell } from "@/components/dashboard/shell"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardShell navigationItems={NAVIGATION_ITEMS}>
        {children}
      </DashboardShell>
    </div>
  )
}
