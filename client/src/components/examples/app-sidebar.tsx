import { AppSidebar } from "../app-sidebar"
import { ThemeProvider } from "../theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function AppSidebarExample() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  }

  return (
    <ThemeProvider>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex-1 p-8 bg-background">
            <div className="max-w-md mx-auto text-center">
              <h2 className="text-xl font-semibold mb-4">Sidebar Navigation</h2>
              <p className="text-muted-foreground">
                This sidebar provides navigation for the social media automation platform
              </p>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  )
}