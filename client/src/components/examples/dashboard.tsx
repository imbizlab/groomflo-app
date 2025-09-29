import { Dashboard } from "../dashboard"
import { ThemeProvider } from "../theme-provider"

export default function DashboardExample() {
  const handleGenerateNewWeek = () => {
    console.log("Generating new week of content...")
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <Dashboard 
          businessName="Pawsome Pet Grooming"
          onGenerateNewWeek={handleGenerateNewWeek}
        />
      </div>
    </ThemeProvider>
  )
}