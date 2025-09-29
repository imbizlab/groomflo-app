import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Check, 
  X, 
  RefreshCw, 
  Calendar, 
  Eye, 
  Edit3, 
  Image as ImageIcon,
  Facebook,
  Instagram,
  Clock
} from "lucide-react"
import { Post } from "@shared/schema"

interface PostCardProps {
  post: Post
  businessName?: string
  onApprove?: (postId: string) => void
  onReject?: (postId: string) => void
  onRegenerateText?: (postId: string) => void
  onRegenerateImage?: (postId: string) => void
  onEdit?: (postId: string, content: string) => void
}

export function PostCard({ 
  post, 
  businessName = "Pawsome Pet Grooming",
  onApprove,
  onReject,
  onRegenerateText,
  onRegenerateImage,
  onEdit
}: PostCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(post.content)
  const [isPreview, setIsPreview] = useState(false)

  const handleSaveEdit = () => {
    onEdit?.(post.id, editedContent)
    setIsEditing(false)
  }

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
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "posted": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const formatPostType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <Card className={`hover-elevate ${post.status === 'approved' ? 'ring-2 ring-green-200 dark:ring-green-800' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge className={getPostTypeColor(post.postType)}>
              {formatPostType(post.postType)}
            </Badge>
            <Badge variant="outline" className={getStatusColor(post.status)}>
              {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPreview(!isPreview)}
            data-testid={`button-preview-${post.id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {isPreview ? (
          // Social Media Preview
          <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback className="text-xs">
                  {businessName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{businessName}</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            {post.imageUrl && (
              <div className="mb-3">
                <img 
                  src={post.imageUrl} 
                  alt="Generated post image"
                  className="w-full h-48 object-cover rounded-md"
                />
              </div>
            )}
            <p className="text-sm whitespace-pre-wrap">{post.content}</p>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Facebook className="h-3 w-3" />
                <span>Facebook</span>
              </div>
              <div className="flex items-center gap-1">
                <Instagram className="h-3 w-3" />
                <span>Instagram</span>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-4">
            {post.imageUrl && (
              <div className="relative">
                <img 
                  src={post.imageUrl} 
                  alt="Generated post image"
                  className="w-full h-48 object-cover rounded-md"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => onRegenerateImage?.(post.id)}
                  data-testid={`button-regenerate-image-${post.id}`}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  New Image
                </Button>
              </div>
            )}

            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="min-h-24"
                  data-testid={`textarea-edit-${post.id}`}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveEdit} data-testid={`button-save-edit-${post.id}`}>
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false)
                      setEditedContent(post.content)
                    }}
                    data-testid={`button-cancel-edit-${post.id}`}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{post.content}</p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    data-testid={`button-edit-${post.id}`}
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRegenerateText?.(post.id)}
                    data-testid={`button-regenerate-text-${post.id}`}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Regenerate
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {post.scheduledFor && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Scheduled for {new Date(post.scheduledFor).toLocaleDateString()} at {new Date(post.scheduledFor).toLocaleTimeString()}</span>
            </div>
          </div>
        )}
      </CardContent>

      {post.status === 'pending' && (
        <CardFooter className="px-6 pb-6 pt-0">
          <div className="flex gap-2 w-full">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onReject?.(post.id)}
              data-testid={`button-reject-${post.id}`}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button
              size="sm"
              onClick={() => onApprove?.(post.id)}
              data-testid={`button-approve-${post.id}`}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}