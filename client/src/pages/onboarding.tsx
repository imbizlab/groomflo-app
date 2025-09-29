import { OnboardingForm } from "@/components/onboarding-form"
import { useLocation } from "wouter"

export default function Onboarding() {
  const [, setLocation] = useLocation()

  const handleComplete = (data: any) => {
    console.log("Onboarding completed with data:", data)
    // Redirect to dashboard after onboarding
    setLocation("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <OnboardingForm onComplete={handleComplete} />
    </div>
  )
}