interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'shimmer' | 'none';
}

/**
 * Skeleton loading component for creating loading placeholders
 */
export default function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'shimmer',
}: SkeletonProps) {
  const baseClasses = 'bg-gray-700 rounded';

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    shimmer: 'skeleton',
    none: '',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

/**
 * Product card skeleton for loading states in shop pages
 */
export function ProductCardSkeleton() {
  return (
    <div className="bg-gray-800/50 rounded-2xl overflow-hidden">
      {/* Image skeleton */}
      <Skeleton className="w-full h-56" />
      
      <div className="p-6 space-y-4">
        {/* Badge skeleton */}
        <Skeleton width={80} height={24} className="rounded-full" />
        
        {/* Title skeleton */}
        <Skeleton width="80%" height={28} />
        
        {/* Price skeleton */}
        <Skeleton width={100} height={40} />
        
        {/* Button skeleton */}
        <Skeleton width="100%" height={48} className="mt-4" />
        
        {/* Features skeleton */}
        <div className="space-y-2 mt-4">
          <Skeleton width="90%" height={16} />
          <Skeleton width="85%" height={16} />
          <Skeleton width="75%" height={16} />
        </div>
      </div>
    </div>
  );
}

/**
 * Blog post card skeleton
 */
export function BlogCardSkeleton() {
  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden">
      {/* Image skeleton */}
      <Skeleton className="w-full h-48" />
      
      <div className="p-6 space-y-4">
        {/* Date and read time */}
        <div className="flex gap-4">
          <Skeleton width={100} height={16} />
          <Skeleton width={80} height={16} />
        </div>
        
        {/* Title */}
        <Skeleton width="90%" height={24} />
        <Skeleton width="60%" height={24} />
        
        {/* Excerpt */}
        <div className="space-y-2">
          <Skeleton width="100%" height={16} />
          <Skeleton width="95%" height={16} />
          <Skeleton width="70%" height={16} />
        </div>
        
        {/* Read more link */}
        <Skeleton width={100} height={20} />
      </div>
    </div>
  );
}

/**
 * Cart item skeleton
 */
export function CartItemSkeleton() {
  return (
    <div className="bg-gray-800 rounded-lg p-4 flex gap-4">
      <Skeleton width={80} height={80} />
      <div className="flex-1 space-y-2">
        <Skeleton width="80%" height={20} />
        <Skeleton width={60} height={24} />
        <div className="flex items-center gap-2">
          <Skeleton width={80} height={32} />
        </div>
      </div>
    </div>
  );
}

/**
 * Page section loading skeleton
 */
export function SectionSkeleton({ title }: { title?: string }) {
  return (
    <section className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          {title ? (
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
              {title}
            </h2>
          ) : (
            <Skeleton width={300} height={48} className="mx-auto mb-6" />
          )}
          <Skeleton width={400} height={24} className="mx-auto" />
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </div>
      </div>
    </section>
  );
}
