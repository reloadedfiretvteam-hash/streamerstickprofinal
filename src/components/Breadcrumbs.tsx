import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  items: { label: string; href?: string }[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm mb-6">
      <a href="/" className="flex items-center gap-1 text-orange-500 hover:text-orange-400 transition">
        <Home className="w-4 h-4" />
        <span>Home</span>
      </a>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-gray-600" />
          {item.href ? (
            <a href={item.href} className="text-orange-500 hover:text-orange-400 transition">
              {item.label}
            </a>
          ) : (
            <span className="text-gray-400">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
