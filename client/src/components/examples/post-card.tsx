import { PostCard } from "../post-card"
import { ThemeProvider } from "../theme-provider"
import { Post } from "@shared/schema"

export default function PostCardExample() {
  // todo: remove mock functionality
  const mockPost: Post = {
    id: "1",
    businessId: "business-1",
    postType: "informative",
    content: "🐕 Did you know regular grooming isn't just about looking good? It's essential for your pet's health! Regular baths and brushing help prevent skin issues, matting, and even detect early signs of health problems. Book your furry friend's next grooming session today! 🛁✨",
    imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop",
    status: "pending",
    scheduledFor: new Date("2024-12-30T08:30:00"),
    postedAt: null,
    facebookPostId: null,
    instagramPostId: null,
    createdAt: new Date()
  }

  const handleApprove = (postId: string) => {
    console.log("Approved post:", postId)
  }

  const handleReject = (postId: string) => {
    console.log("Rejected post:", postId)
  }

  const handleRegenerateText = (postId: string) => {
    console.log("Regenerating text for post:", postId)
  }

  const handleRegenerateImage = (postId: string) => {
    console.log("Regenerating image for post:", postId)
  }

  const handleEdit = (postId: string, content: string) => {
    console.log("Editing post:", postId, "New content:", content)
  }

  return (
    <ThemeProvider>
      <div className="p-8 bg-background">
        <div className="max-w-md mx-auto">
          <PostCard
            post={mockPost}
            businessName="Pawsome Pet Grooming"
            onApprove={handleApprove}
            onReject={handleReject}
            onRegenerateText={handleRegenerateText}
            onRegenerateImage={handleRegenerateImage}
            onEdit={handleEdit}
          />
        </div>
      </div>
    </ThemeProvider>
  )
}