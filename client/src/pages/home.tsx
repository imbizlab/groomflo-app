import { Dashboard } from "@/components/dashboard"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { queryClient, apiRequest } from "@/lib/queryClient"
import type { Business, Post } from "@shared/schema"

export default function Home() {
  const { toast } = useToast()

  const { data: business, isLoading: businessLoading } = useQuery<Business>({
    queryKey: ["/api/businesses/current"],
  })

  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    enabled: !!business,
  })

  const generateWeekMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/posts/generate-weekly", "POST", {})
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] })
      toast({
        title: "Success",
        description: "Weekly content generated successfully!",
      })
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate weekly content",
      })
    },
  })

  const handleGenerateNewWeek = () => {
    generateWeekMutation.mutate()
  }

  if (businessLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-1/3"></div>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Welcome!</h1>
        <p className="text-muted-foreground">
          Please complete your business onboarding to get started.
        </p>
      </div>
    )
  }

  return (
    <Dashboard 
      businessName={business.businessName}
      onGenerateNewWeek={handleGenerateNewWeek}
      posts={posts}
      isGenerating={generateWeekMutation.isPending}
      isLoading={postsLoading}
    />
  )
}
