import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Heart, 
  MessageSquare, 
  Share2,
  Calendar,
  Clock
} from "lucide-react"

export default function Analytics() {
  // todo: remove mock functionality
  const analyticsData = {
    totalReach: 2847,
    reachGrowth: 12,
    totalEngagement: 421,
    engagementRate: 23,
    totalComments: 89,
    totalShares: 34,
    weeklyPosts: 7,
    approvalRate: 85
  }

  const topPosts = [
    {
      id: "1",
      content: "Fun Fact Friday! A dog's sense of smell is 10,000 times stronger...",
      type: "fun_fact",
      reach: 1245,
      engagement: 156,
      posted: "2024-12-27"
    },
    {
      id: "2", 
      content: "Beat the Monday Blues! Special grooming package...",
      type: "promotional",
      reach: 987,
      engagement: 134,
      posted: "2024-12-25"
    },
    {
      id: "3",
      content: "Winter grooming tips for your furry friends...",
      type: "informative", 
      reach: 856,
      engagement: 98,
      posted: "2024-12-26"
    }
  ]

  const weeklyStats = [
    { week: "Dec 16-22", posts: 7, reach: 2456, engagement: 387 },
    { week: "Dec 9-15", posts: 7, reach: 2234, engagement: 298 },
    { week: "Dec 2-8", posts: 7, reach: 2098, engagement: 276 },
    { week: "Nov 25-Dec 1", posts: 7, reach: 1876, engagement: 245 }
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Analytics
        </h1>
        <p className="text-muted-foreground">Track your social media performance and engagement</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalReach.toLocaleString()}</div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +{analyticsData.reachGrowth}% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalEngagement}</div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +{analyticsData.engagementRate}% engagement rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalComments}</div>
            <p className="text-xs text-muted-foreground">
              Customer interactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shares</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalShares}</div>
            <p className="text-xs text-muted-foreground">
              Content shared by followers
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Content Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Posts</CardTitle>
            <CardDescription>
              Your best content from the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPosts.map((post, index) => (
                <div key={post.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={
                        post.type === 'fun_fact' ? 'text-green-600' :
                        post.type === 'promotional' ? 'text-purple-600' : 'text-blue-600'
                      }>
                        {post.type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{post.posted}</span>
                    </div>
                    <p className="text-sm line-clamp-1">{post.content}</p>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Reach: {post.reach}</span>
                      <span>Engagement: {post.engagement}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Automation Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Automation Performance</CardTitle>
            <CardDescription>
              How well your automated posting is working
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Post Approval Rate</span>
                <span>{analyticsData.approvalRate}%</span>
              </div>
              <Progress value={analyticsData.approvalRate} />
              <p className="text-xs text-muted-foreground mt-1">
                {analyticsData.approvalRate}% of generated posts approved without changes
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{analyticsData.weeklyPosts}</div>
                <div className="text-sm text-muted-foreground">Posts/Week</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">100%</div>
                <div className="text-sm text-muted-foreground">On Schedule</div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Content Mix</p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Informative (43%)</span>
                  <Progress value={43} className="w-20" />
                </div>
                <div className="flex justify-between text-sm">
                  <span>Fun Facts (28%)</span>
                  <Progress value={28} className="w-20" />
                </div>
                <div className="flex justify-between text-sm">
                  <span>Promotional (29%)</span>
                  <Progress value={29} className="w-20" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Performance Trends</CardTitle>
          <CardDescription>
            Track your growth over the past month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyStats.map((week, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{week.week}</span>
                  </div>
                  <Badge variant="outline">{week.posts} posts</Badge>
                </div>
                <div className="flex gap-6 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium text-foreground">{week.reach.toLocaleString()}</span>
                    <span className="ml-1">reach</span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">{week.engagement}</span>
                    <span className="ml-1">engagement</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}