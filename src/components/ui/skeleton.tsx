import {cn} from "@/lib/utils"

function Skeleton({
                    className,
                    ...props
                  }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  )
}

function FormFieldSkeleton() {
  return <div className="space-y-2">
    <Skeleton className="w-40 h-5 "/>
    <Skeleton className="w-80 h-5 "/>
    <Skeleton className="w-60 h-5 "/>
  </div>
}

function FormButtonSkeleton() {
  return <div>
    <Skeleton className="w-40 h-5 "/>
  </div>
}

function FormSkeleton({length}: { length: number }) {
  return <div className="space-y-8">
    {Array(length).fill(0).map((_, i) => <FormFieldSkeleton key={i}/>)}
    <FormButtonSkeleton/>
  </div>
}

export {Skeleton, FormSkeleton, FormButtonSkeleton, FormFieldSkeleton}
