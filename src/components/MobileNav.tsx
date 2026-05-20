import { Link, useLocation } from 'react-router-dom';
import { Map, LayoutGrid, Sparkles, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: Map, label: 'Map' },
  { href: '/fields', icon: LayoutGrid, label: 'Fields' },
  { href: '/ai-insights', icon: Sparkles, label: 'AI' },
  { href: '/reports', icon: FileText, label: 'Reports' },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t md:hidden z-50 safe-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 w-16 h-14 rounded-xl transition-all tap-target',
                isActive 
                  ? 'text-green-600 bg-green-50' 
                  : 'text-muted-foreground hover:text-green-600 hover:bg-green-50/50'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'stroke-[2.5px]')} />
              <span className={cn('text-xs font-medium', isActive && 'font-semibold')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}