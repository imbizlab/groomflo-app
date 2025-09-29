import { Dashboard } from "@/components/dashboard"

export default function Home() {
  const handleGenerateNewWeek = () => {
    console.log("Generating new week of content...")
  }

  return (
    <Dashboard 
      businessName="Pawsome Pet Grooming"
      onGenerateNewWeek={handleGenerateNewWeek}
    />
  )
}