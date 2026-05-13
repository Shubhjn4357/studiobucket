
import { NAVIGATION_ITEMS } from "@/constants/route.constant"
import { DashboardShell } from "@/components/dashboard/shell"
import { UploadProvider } from "@/providers/upload-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <UploadProvider>
        <DashboardShell navigationItems={NAVIGATION_ITEMS}>
          {children}
        </DashboardShell>
      </UploadProvider>
    </div>
  )
}
