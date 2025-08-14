'use client'

import * as React from 'react'
import { Button } from './button'
import { 
  Download, 
  Heart, 
  Star, 
  Send, 
  Plus,
  Check,
  X,
  AlertTriangle,
  Info,
  Sparkles,
  Zap
} from 'lucide-react'

export function ButtonShowcase() {
  const [liked, setLiked] = React.useState(false)
  const [starred, setStarred] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const handleAsyncAction = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <div className="space-y-8 p-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
          Enhanced Button Library
        </h2>
        <p className="text-muted-foreground">
          A collection of beautiful, animated buttons with enhanced colors and interactions.
        </p>
      </div>

      {/* Standard Variants */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Standard Variants</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="default">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>

      {/* New Color Variants */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Enhanced Color Variants</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="success" icon={<Check className="h-4 w-4" />}>
            Success
          </Button>
          <Button variant="warning" icon={<AlertTriangle className="h-4 w-4" />}>
            Warning
          </Button>
          <Button variant="info" icon={<Info className="h-4 w-4" />}>
            Information
          </Button>
        </div>
      </div>

      {/* Gradient Variants */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Gradient Variants</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="gradient" icon={<Sparkles className="h-4 w-4" />}>
            Gradient Primary
          </Button>
          <Button variant="gradient-secondary" icon={<Zap className="h-4 w-4" />}>
            Gradient Secondary
          </Button>
        </div>
      </div>

      {/* Special Effect Variants */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Special Effects</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="gradient" animation="float">
            Shimmer Effect
          </Button>
          <Button variant="gradient-secondary" animation="glow">
            Glow Effect
          </Button>
        </div>
      </div>

      {/* Loading States */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Loading States</h3>
        <div className="flex flex-wrap gap-3">
          <Button 
            loading={loading} 
            loadingText="Processing..."
            onClick={handleAsyncAction}
          >
            Click to Load
          </Button>
          <Button variant="success" loading>
            Loading...
          </Button>
          <Button variant="outline" loading loadingText="Uploading file...">
            Upload
          </Button>
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Sizes</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm" variant="gradient">Small</Button>
          <Button size="default" variant="gradient">Default</Button>
          <Button size="lg" variant="gradient">Large</Button>
          <Button size="xl" variant="gradient">Extra Large</Button>
        </div>
      </div>

      {/* Icon Buttons */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Icon Buttons</h3>
        <div className="flex flex-wrap gap-3">
          <Button size="icon" variant="outline">
            <Download className="h-4 w-4" />
          </Button>
          <Button size="icon-sm" variant="success">
            <Check className="h-3 w-3" />
          </Button>
          <Button size="icon-lg" variant="destructive">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Buttons with Icons */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Buttons with Icons</h3>
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="default" 
            icon={<Download className="h-4 w-4" />}
            iconPosition="left"
          >
            Download
          </Button>
          <Button 
            variant="outline" 
            icon={<Send className="h-4 w-4" />}
            iconPosition="right"
          >
            Send Message
          </Button>
          <Button 
            variant={liked ? "destructive" : "outline"}
            icon={<Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />}
            onClick={() => setLiked(!liked)}
          >
            {liked ? 'Liked' : 'Like'}
          </Button>
          <Button 
            variant={starred ? "warning" : "outline"}
            icon={<Star className={`h-4 w-4 ${starred ? 'fill-current' : ''}`} />}
            onClick={() => setStarred(!starred)}
          >
            {starred ? 'Starred' : 'Star'}
          </Button>
        </div>
      </div>

      {/* Animation Variants */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Animation Variants</h3>
        <div className="flex flex-wrap gap-3">
          <Button animation="bounce" variant="gradient">
            Bounce In
          </Button>
          <Button animation="slide" variant="success">
            Slide In
          </Button>
          <Button animation="scale" variant="info">
            Scale In
          </Button>
          <Button animation="float" variant="outline">
            Floating
          </Button>
          <Button animation="glow" variant="gradient">
            Glowing
          </Button>
        </div>
      </div>

      {/* Interactive Examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Interactive Examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg space-y-3">
            <h4 className="font-medium">Call to Action</h4>
            <Button 
              size="lg" 
              variant="gradient" 
              className="w-full"
              icon={<Plus className="h-4 w-4" />}
            >
              Get Started
            </Button>
          </div>
          
          <div className="p-4 border rounded-lg space-y-3">
            <h4 className="font-medium">Form Actions</h4>
            <div className="space-y-2">
              <Button variant="success" size="sm" className="w-full">
                Save Changes
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Cancel
              </Button>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg space-y-3">
            <h4 className="font-medium">Social Actions</h4>
            <div className="flex gap-2">
              <Button size="icon" variant="info">
                <Heart className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="warning">
                <Star className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="success">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}