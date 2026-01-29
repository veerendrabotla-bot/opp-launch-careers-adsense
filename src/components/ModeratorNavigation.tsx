import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  Users, 
  CheckCircle, 
  Clock, 
  Home
} from 'lucide-react';

const ModeratorNavigation = () => {
  const location = useLocation();

  const navItems = [
    { href: '/moderator', label: 'Dashboard', icon: Home },
    { href: '/moderator/pending', label: 'Pending Review', icon: Clock },
    { href: '/moderator/approved', label: 'Approved Content', icon: CheckCircle },
    { href: '/moderator/users', label: 'User Management', icon: Users },
  ];

  return (
    <nav className="bg-card border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 whitespace-nowrap',
                location.pathname === item.href
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default ModeratorNavigation;
