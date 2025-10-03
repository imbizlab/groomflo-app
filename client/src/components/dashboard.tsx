import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { PostCard } from "./post-card"
import { 
  CalendarDays, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus,
  BarChart3,
  Users,
  Heart,
  MessageSquare
} from "lucide-react"
import { Post } from "@shared/schema"

interface DashboardProps {
  businessName?: string
  onGenerateNewWeek?: () => void
  posts?: Post[]
  isGenerating?: boolean
  isLoading?: boolean
}

export function Dashboard({ 
  businessName = "Pawsome Pet Grooming",
  onGenerateNewWeek,
  posts = [],
  isGenerating = false,
  isLoading = false
}: DashboardProps) {

  const weekStats = {
    totalPosts: 7,
    pending: posts.filter(p => p.status === 'pending').length,
    approved: posts.filter(p => p.status === 'approved').length,
    posted: posts.filter(p => p.status === 'posted').length,
    rejected: posts.filter(p => p.status === 'rejected').length
  }

  const completionPercentage = Math.round((weekStats.approved + weekStats.posted) / weekStats.totalPosts * 100)

  const handleApprovePost = (postId: string) => {
    console.log("Approving post:", postId)
  }

  const handleRejectPost = (postId: string) => {
    console.log("Rejecting post:", postId)
  }

  const handleRegenerateText = (postId: string) => {
    console.log("Regenerating text for post:", postId)
  }

  const handleRegenerateImage = (postId: string) => {
    console.log("Regenerating image for post:", postId)
  }

  const handleEditPost = (postId: string, content: string) => {
    console.log("Editing post:", postId, content)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back, {businessName}</h1>
          <p className="text-muted-foreground">Manage your social media content for this week</p>
        </div>
        <Button onClick={onGenerateNewWeek} data-testid="button-generate-new-week">
          <Plus className="h-4 w-4 mr-2" />
          Generate New Week
        </Button>
      </div>

      {/* Weekly Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Week Progress</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionPercentage}%</div>
            <Progress value={completionPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {weekStats.approved + weekStats.posted} of {weekStats.totalPosts} posts ready
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekStats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Posts awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekStats.approved}</div>
            <p className="text-xs text-muted-foreground">
              Ready to post
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posted</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekStats.posted}</div>
            <p className="text-xs text-muted-foreground">
              Successfully published
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">This Week's Content</h2>
            <div className="flex gap-2">
              <Badge variant="outline">{posts.filter(p => p.postType === 'informative').length} Informative</Badge>
              <Badge variant="outline">{posts.filter(p => p.postType === 'fun_fact').length} Fun Facts</Badge>
              <Badge variant="outline">{posts.filter(p => p.postType === 'promotional').length} Promotional</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                businessName={businessName}
                onApprove={handleApprovePost}
                onReject={handleRejectPost}
                onRegenerateText={handleRegenerateText}
                onRegenerateImage={handleRegenerateImage}
                onEdit={handleEditPost}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Posting Schedule</CardTitle>
                <CardDescription>
                  All posts are scheduled between 7:00 AM - 9:30 AM local time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={
                          post.postType === 'informative' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          post.postType === 'fun_fact' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        }>
                          {post.postType.replace('_', ' ')}
                        </Badge>
                        <div>
                          <p className="font-medium text-sm">{post.content.slice(0, 50)}...</p>
                          <p className="text-xs text-muted-foreground">
                            {post.scheduledFor ? new Date(post.scheduledFor).toLocaleDateString() : 'Not scheduled'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {post.scheduledFor ? new Date(post.scheduledFor).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                        </p>
                        <Badge variant="outline" className={
                          post.status === 'approved' ? 'text-green-600' :
                          post.status === 'pending' ? 'text-yellow-600' :
                          post.status === 'posted' ? 'text-blue-600' : 'text-red-600'
                        }>
                          {post.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,847</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">421</div>
                <p className="text-xs text-muted-foreground">
                  Likes, comments, shares
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Comments</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89</div>
                <p className="text-xs text-muted-foreground">
                  +23% engagement rate
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>
                Track how your automated posts are performing across platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                <BarChart3 className="h-8 w-8 mr-2" />
                <span>Analytics chart will be implemented with real data</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}