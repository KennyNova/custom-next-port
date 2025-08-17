import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SignatureCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  )
}

export function SignaturesGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <SignatureCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function SignaturesPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <Skeleton className="h-10 w-64 mx-auto mb-4" />
        <div className="max-w-2xl mx-auto space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5 mx-auto" />
        </div>
      </div>

      {/* Sign Wall Button */}
      <div className="text-center mb-12">
        <Skeleton className="h-12 w-40 mx-auto" />
      </div>

      {/* Signatures Grid */}
      <SignaturesGridSkeleton count={9} />

      {/* Load More */}
      <div className="text-center mt-12">
        <Skeleton className="h-10 w-48 mx-auto" />
      </div>
    </div>
  )
}
