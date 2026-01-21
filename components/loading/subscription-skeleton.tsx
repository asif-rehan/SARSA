import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export function SubscriptionSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="text-center space-y-4 mb-12">
        <Skeleton className="h-10 w-64 mx-auto" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </div>
      
      {/* Subscription plans skeleton */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="relative">
            {/* Popular badge skeleton */}
            {i === 1 && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            )}
            
            <CardHeader>
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-32" />
                <div className="flex items-baseline space-x-1">
                  <Skeleton className="h-10 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
            
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}