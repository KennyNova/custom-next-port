'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { ButtonShowcase } from '@/components/ui/button-showcase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTheme } from '@/components/providers/theme-provider'
import { 
  Palette, 
  Sun, 
  Moon, 
  Sparkles, 
  Eye,
  Heart,
  Star,
  CheckCircle,
  AlertTriangle,
  Info,
  Zap
} from 'lucide-react'

export default function DesignSystemPage() {
  const { theme, setTheme } = useTheme()

  const colorPalette = [
    { name: 'Primary', class: 'bg-primary text-primary-foreground', desc: 'Main brand color' },
    { name: 'Secondary', class: 'bg-secondary text-secondary-foreground', desc: 'Supporting color' },
    { name: 'Success', class: 'bg-success text-success-foreground', desc: 'Success states' },
    { name: 'Warning', class: 'bg-warning text-warning-foreground', desc: 'Warning states' },
    { name: 'Info', class: 'bg-info text-info-foreground', desc: 'Information' },
    { name: 'Destructive', class: 'bg-destructive text-destructive-foreground', desc: 'Error states' },
    { name: 'Highlight', class: 'bg-highlight text-highlight-foreground', desc: 'Special highlights' },
    { name: 'Surface', class: 'bg-surface text-surface-foreground', desc: 'Elevated surfaces' },
  ]

  const animations = [
    { name: 'Float', class: 'animate-float', desc: 'Gentle floating motion' },
    { name: 'Glow', class: 'animate-glow', desc: 'Pulsing glow effect' },
    { name: 'Shimmer', class: 'animate-shimmer', desc: 'Shimmer sweep effect' },
    { name: 'Pulse Glow', class: 'animate-pulse-glow', desc: 'Expanding glow pulse' },
    { name: 'Slide In', class: 'animate-slide-in', desc: 'Slide from left' },
    { name: 'Scale In', class: 'animate-scale-in', desc: 'Scale up entrance' },
    { name: 'Bounce In', class: 'animate-bounce-in', desc: 'Bouncy entrance' },
    { name: 'Spin Slow', class: 'animate-spin-slow', desc: 'Slow rotation' },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="pb-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-blue-600 to-green-600 bg-clip-text text-transparent animate-float leading-tight py-2">
            Enhanced Design System
          </h1>
        </div>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          A comprehensive showcase of our enhanced color system, button library, and animations across all themes.
        </p>
        
        {/* Theme Switcher */}
        <div className="flex justify-center gap-2 mb-8">
          <Button 
            variant={theme === 'light' ? 'default' : 'outline'}
            icon={<Sun className="h-4 w-4" />}
            onClick={() => setTheme('light')}
          >
            Light
          </Button>
          <Button 
            variant={theme === 'dark' ? 'default' : 'outline'}
            icon={<Moon className="h-4 w-4" />}
            onClick={() => setTheme('dark')}
          >
            Dark
          </Button>
          <Button 
            variant={theme === 'pastel' ? 'default' : 'outline'}
            icon={<Palette className="h-4 w-4" />}
            onClick={() => setTheme('pastel')}
          >
            Pastel
          </Button>
        </div>
      </div>

      {/* Color Palette Section */}
      <section className="mb-16">
        <Card variant="elevated" className="p-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <Palette className="h-8 w-8 text-primary" />
              Enhanced Color Palette
            </CardTitle>
            <CardDescription className="text-lg">
              New vibrant colors designed for better contrast and visual hierarchy across all themes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {colorPalette.map((color) => (
                <div key={color.name} className="space-y-3">
                  <div className={`${color.class} p-6 rounded-lg text-center transition-transform hover:scale-105`}>
                    <div className="text-lg font-semibold">{color.name}</div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">{color.desc}</p>
                </div>
              ))}
            </div>
            
            {/* Gradient Showcase */}
            <div className="mt-8 space-y-4">
              <h3 className="text-xl font-semibold">Gradient Effects</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="gradient-primary p-6 rounded-lg text-center text-primary-foreground">
                  <div className="text-lg font-semibold">Primary Gradient</div>
                </div>
                <div className="gradient-secondary p-6 rounded-lg text-center text-primary-foreground">
                  <div className="text-lg font-semibold">Secondary Gradient</div>
                </div>
                <div className="gradient-accent p-6 rounded-lg text-center text-primary-foreground">
                  <div className="text-lg font-semibold">Accent Gradient</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Animations Section */}
      <section className="mb-16">
        <Card variant="elevated" className="p-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <Sparkles className="h-8 w-8 text-success" />
              Animation Library
            </CardTitle>
            <CardDescription className="text-lg">
              Smooth, performant animations that enhance user experience without being distracting.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {animations.map((animation) => (
                <div key={animation.name} className="text-center space-y-3">
                  <div className={`w-16 h-16 mx-auto bg-gradient-to-r from-primary to-info rounded-lg ${animation.class} flex items-center justify-center`}>
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{animation.name}</h4>
                    <p className="text-sm text-muted-foreground">{animation.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Interactive Components Section */}
      <section className="mb-16">
        <Card variant="elevated" className="p-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <Zap className="h-8 w-8 text-warning" />
              Interactive Showcase
            </CardTitle>
            <CardDescription className="text-lg">
              Real-world examples of how the enhanced design system works in practice.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Success Card */}
              <Card variant="interactive" className="border-2 border-success/20 hover:border-success/40">
                <CardHeader>
                  <CheckCircle className="h-8 w-8 text-success animate-glow" />
                  <CardTitle className="text-success">Success State</CardTitle>
                  <CardDescription>
                    Perfect for completed actions and positive feedback
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="success" className="w-full" icon={<CheckCircle className="h-4 w-4" />}>
                    Complete Action
                  </Button>
                </CardContent>
              </Card>

              {/* Warning Card */}
              <Card variant="interactive" className="border-2 border-warning/20 hover:border-warning/40">
                <CardHeader>
                  <AlertTriangle className="h-8 w-8 text-warning animate-pulse" />
                  <CardTitle className="text-warning">Warning State</CardTitle>
                  <CardDescription>
                    Great for cautionary messages and important notices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="warning" className="w-full" icon={<AlertTriangle className="h-4 w-4" />}>
                    Proceed with Caution
                  </Button>
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card variant="interactive" className="border-2 border-info/20 hover:border-info/40">
                <CardHeader>
                  <Info className="h-8 w-8 text-info animate-bounce" />
                  <CardTitle className="text-info">Info State</CardTitle>
                  <CardDescription>
                    Perfect for helpful information and neutral updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="info" className="w-full" icon={<Info className="h-4 w-4" />}>
                    Learn More
                  </Button>
                </CardContent>
              </Card>

              {/* Gradient Card */}
              <Card variant="gradient" className="md:col-span-2 lg:col-span-3">
                <CardHeader>
                  <Sparkles className="h-8 w-8 text-primary-foreground animate-glow" />
                  <CardTitle className="text-primary-foreground">Premium Feature</CardTitle>
                  <CardDescription className="text-primary-foreground/80">
                    Gradient cards perfect for highlighting premium content and special offers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="secondary" icon={<Heart className="h-4 w-4" />}>
                      Love It
                    </Button>
                    <Button variant="outline" className="border-white/20 text-primary-foreground hover:bg-white/10" icon={<Star className="h-4 w-4" />}>
                      Rate Us
                    </Button>
                    <Button variant="ghost" className="text-primary-foreground hover:bg-white/10" icon={<Sparkles className="h-4 w-4" />}>
                      Upgrade
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Complete Button Library */}
      <section>
        <Card variant="elevated" className="p-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <Heart className="h-8 w-8 text-destructive animate-pulse" />
              Complete Button Library
            </CardTitle>
            <CardDescription className="text-lg">
              Every button variant, size, and animation combination showcased in detail.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ButtonShowcase />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}