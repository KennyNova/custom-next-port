import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function FeatureCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <Skeleton className="h-8 w-8 mb-2" />
        <Skeleton className="h-6 w-24" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}

export function FeaturedProjectSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function HomepageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 relative z-10">
      {/* Hero Section */}
      <section className="text-center py-20">
        <div className="pb-4">
          <Skeleton className="h-16 w-3/4 mx-auto mb-6" />
        </div>
        <div className="space-y-4 mb-8 max-w-3xl mx-auto">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-4/5 mx-auto" />
        </div>
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Skeleton className="h-14 w-48" />
          <Skeleton className="h-14 w-44" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <Skeleton className="h-9 w-64 mx-auto mb-12" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }, (_, i) => (
            <FeatureCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* Featured Projects Section (if implemented) */}
      <section className="py-12">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }, (_, i) => (
            <FeaturedProjectSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  )
}
