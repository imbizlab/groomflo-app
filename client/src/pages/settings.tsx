import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Settings as SettingsIcon, Facebook, Instagram, Key, Bell, Clock } from "lucide-react"

export default function Settings() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" />
          Settings
        </h1>
        <p className="text-muted-foreground">Manage your account and automation preferences</p>
      </div>

      <div className="grid gap-6">
        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              Update your business details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business-name">Business Name</Label>
                <Input 
                  id="business-name" 
                  defaultValue="Pawsome Pet Grooming"
                  data-testid="input-settings-business-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  defaultValue="(555) 123-4567"
                  data-testid="input-settings-phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  defaultValue="info@pawsomepetgrooming.com"
                  data-testid="input-settings-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input 
                  id="website" 
                  defaultValue="https://pawsomepetgrooming.com"
                  data-testid="input-settings-website"
                />
              </div>
            </div>
            <Button data-testid="button-save-business-info">Save Changes</Button>
          </CardContent>
        </Card>

        {/* Social Media Connections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Social Media Connections
            </CardTitle>
            <CardDescription>
              Manage your Facebook and Instagram connections for automated posting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Facebook className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Facebook Page</p>
                  <p className="text-sm text-muted-foreground">Pawsome Pet Grooming</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Connected
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Instagram className="h-5 w-5 text-pink-600" />
                <div>
                  <p className="font-medium">Instagram Business</p>
                  <p className="text-sm text-muted-foreground">@pawsomepetgrooming</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Connected
              </Badge>
            </div>

            <Button variant="outline" data-testid="button-reconnect-social">
              Reconnect Accounts
            </Button>
          </CardContent>
        </Card>

        {/* Posting Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Posting Schedule
            </CardTitle>
            <CardDescription>
              Configure when your posts are automatically published
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="post-start-time">Start Time</Label>
                <Input 
                  id="post-start-time" 
                  type="time"
                  defaultValue="07:00"
                  data-testid="input-post-start-time"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="post-end-time">End Time</Label>
                <Input 
                  id="post-end-time" 
                  type="time"
                  defaultValue="09:30"
                  data-testid="input-post-end-time"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slowest-day">Slowest Day (for promotional posts)</Label>
              <Input 
                id="slowest-day" 
                defaultValue="Monday"
                data-testid="input-slowest-day"
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Change this in your business profile settings
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Control how you receive updates about your automated posts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Daily Post Confirmations</p>
                <p className="text-sm text-muted-foreground">
                  Get email notifications when posts are successfully published
                </p>
              </div>
              <Switch defaultChecked data-testid="switch-daily-confirmations" />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Content Generation Alerts</p>
                <p className="text-sm text-muted-foreground">
                  Notify when new weekly content is ready for review
                </p>
              </div>
              <Switch defaultChecked data-testid="switch-generation-alerts" />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Posting Failures</p>
                <p className="text-sm text-muted-foreground">
                  Alert when automated posts fail to publish
                </p>
              </div>
              <Switch defaultChecked data-testid="switch-failure-alerts" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}