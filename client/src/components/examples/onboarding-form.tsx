import { OnboardingForm } from "../onboarding-form"
import { ThemeProvider } from "../theme-provider"

export default function OnboardingFormExample() {
  const handleComplete = (data: any) => {
    console.log("Onboarding completed with data:", data)
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <OnboardingForm onComplete={handleComplete} />
      </div>
    </ThemeProvider>
  )
}