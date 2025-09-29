import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, Clock, Facebook, Instagram } from "lucide-react"

export default function Calendar() {
  // todo: remove mock functionality
  const scheduledPosts = [
    { 
      id: "1", 
      date: "2024-12-29", 
      time: "07:45", 
      type: "promotional", 
      content: "Beat the Monday Blues! Special grooming package...",
      status: "pending"
    },
    { 
      id: "2", 
      date: "2024-12-30", 
      time: "08:30", 
      type: "informative", 
      content: "Did you know regular grooming isn't just about looking good?...",
      status: "pending" 
    },
    { 
      id: "3", 
      date: "2024-12-31", 
      time: "09:15", 
      type: "fun_fact", 
      content: "Fun Fact Friday! A dog's sense of smell is 10,000 times stronger...",
      status: "approved"
    },
    { 
      id: "4", 
      date: "2025-01-01", 
      time: "08:00", 
      type: "promotional", 
      content: "New Year, New Look! Start 2025 with a fresh grooming...",
      status: "approved"
    },
    { 
      id: "5", 
      date: "2025-01-02", 
      time: "09:00", 
      type: "informative", 
      content: "Winter grooming tips for your furry friends...",
      status: "approved"
    }
  ]

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case "informative": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "fun_fact": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "promotional": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "posted": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <CalendarIcon className="h-6 w-6" />
            Content Calendar
          </h1>
          <p className="text-muted-foreground">View and manage your scheduled social media posts</p>
        </div>
        <Button data-testid="button-generate-calendar">
          Generate New Week
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Posts</CardTitle>
            <CardDescription>
              All posts are scheduled to publish between 7:00 AM - 9:30 AM local time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scheduledPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg hover-elevate">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-16">
                      <div className="text-sm font-medium">
                        {new Date(post.date).toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                      <div className="text-2xl font-bold">
                        {new Date(post.date).getDate()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(post.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getPostTypeColor(post.type)}>
                          {post.type.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(post.status)}>
                          {post.status}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {post.time}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.content}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Facebook className="h-3 w-3" />
                      <Instagram className="h-3 w-3" />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      data-testid={`button-edit-post-${post.id}`}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Posting Pattern</CardTitle>
            <CardDescription>
              Your weekly content schedule follows this automated pattern
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">3</div>
                <div className="text-sm font-medium">Informative Posts</div>
                <div className="text-xs text-muted-foreground">Pet grooming benefits & tips</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">2</div>
                <div className="text-sm font-medium">Fun Facts</div>
                <div className="text-xs text-muted-foreground">Pet ownership & grooming facts</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">2</div>
                <div className="text-sm font-medium">Promotional</div>
                <div className="text-xs text-muted-foreground">4 & 2 days before slowest day</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}