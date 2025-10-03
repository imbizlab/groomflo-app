import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Globe, Building, Phone, Mail, Clock, Calendar, Facebook, Instagram } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { apiRequest } from "@/lib/queryClient"
import { useToast } from "@/hooks/use-toast"

interface OnboardingFormProps {
  onComplete?: (data: any) => void
}

export function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [websiteUrl, setWebsiteUrl] = useState("")
  const { toast } = useToast()
  const [businessData, setBusinessData] = useState({
    businessName: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    hours: "",
    slowestDay: "",
    facebookPageId: "",
    instagramAccountId: ""
  })

  const createBusinessMutation = useMutation({
    mutationFn: async (data: typeof businessData) => {
      return apiRequest("/api/businesses", "POST", data)
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Business profile created successfully!",
      })
      onComplete?.(data)
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create business profile",
      })
    },
  })

  const handleWebsiteScrape = async () => {
    if (!websiteUrl) return
    
    setLoading(true)
    console.log("Scraping website:", websiteUrl)
    
    setTimeout(() => {
      setBusinessData({
        businessName: "Pawsome Pet Grooming",
        address: "123 Main Street, Anytown, ST 12345",
        phone: "(555) 123-4567",
        email: "info@pawsomepetgrooming.com",
        website: websiteUrl,
        hours: "Mon-Fri: 8AM-6PM, Sat: 9AM-4PM, Sun: Closed",
        slowestDay: "Monday",
        facebookPageId: "",
        instagramAccountId: ""
      })
      setLoading(false)
      setStep(2)
    }, 2000)
  }

  const handleSubmit = () => {
    console.log("Onboarding complete:", businessData)
    createBusinessMutation.mutate(businessData)
  }

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {i}
              </div>
              {i < 2 && <div className={`w-12 h-0.5 ${step > i ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>
        <h1 className="text-2xl font-semibold">Welcome to PetGroomer Social</h1>
        <p className="text-muted-foreground">Let's get your business set up for automated social media success</p>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Business Website
            </CardTitle>
            <CardDescription>
              Enter your pet grooming business website URL and we'll automatically extract your business information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="website-url">Website URL</Label>
              <Input
                id="website-url"
                data-testid="input-website-url"
                placeholder="https://yourpetgroomingbusiness.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleWebsiteScrape}
              disabled={!websiteUrl || loading}
              data-testid="button-scrape-website"
              className="w-full"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? "Analyzing Website..." : "Extract Business Information"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Business Information
            </CardTitle>
            <CardDescription>
              Review and complete your business details. Some information has been pre-filled from your website.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business-name">Business Name</Label>
                <Input
                  id="business-name"
                  data-testid="input-business-name"
                  value={businessData.businessName}
                  onChange={(e) => setBusinessData({...businessData, businessName: e.target.value})}
                />
                {businessData.businessName && <Badge variant="secondary" className="text-xs">Pre-filled</Badge>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  data-testid="input-phone"
                  value={businessData.phone}
                  onChange={(e) => setBusinessData({...businessData, phone: e.target.value})}
                />
                {businessData.phone && <Badge variant="secondary" className="text-xs">Pre-filled</Badge>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                data-testid="input-address"
                value={businessData.address}
                onChange={(e) => setBusinessData({...businessData, address: e.target.value})}
              />
              {businessData.address && <Badge variant="secondary" className="text-xs">Pre-filled</Badge>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                data-testid="input-email"
                type="email"
                value={businessData.email}
                onChange={(e) => setBusinessData({...businessData, email: e.target.value})}
              />
              {businessData.email && <Badge variant="secondary" className="text-xs">Pre-filled</Badge>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hours">Business Hours</Label>
              <Textarea
                id="hours"
                data-testid="input-hours"
                placeholder="Mon-Fri: 8AM-6PM, Sat: 9AM-4PM, Sun: Closed"
                value={businessData.hours}
                onChange={(e) => setBusinessData({...businessData, hours: e.target.value})}
              />
              {businessData.hours && <Badge variant="secondary" className="text-xs">Pre-filled</Badge>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slowest-day">Slowest Day of the Week</Label>
              <Select 
                value={businessData.slowestDay} 
                onValueChange={(value) => setBusinessData({...businessData, slowestDay: value})}
              >
                <SelectTrigger data-testid="select-slowest-day">
                  <SelectValue placeholder="Select your slowest day" />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
                    <SelectItem key={day} value={day}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facebook-page" className="flex items-center gap-2">
                  <Facebook className="h-4 w-4" />
                  Facebook Page URL
                </Label>
                <Input
                  id="facebook-page"
                  data-testid="input-facebook-page"
                  placeholder="https://facebook.com/yourpage"
                  value={businessData.facebookPageId}
                  onChange={(e) => setBusinessData({...businessData, facebookPageId: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram-page" className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  Instagram Page URL
                </Label>
                <Input
                  id="instagram-page"
                  data-testid="input-instagram-page"
                  placeholder="https://instagram.com/yourpage"
                  value={businessData.instagramAccountId}
                  onChange={(e) => setBusinessData({...businessData, instagramAccountId: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)} data-testid="button-back">
              Back
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!businessData.businessName || !businessData.slowestDay}
              data-testid="button-complete-onboarding"
              className="flex-1"
            >
              Complete Setup
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}