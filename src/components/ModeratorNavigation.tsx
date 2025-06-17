
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home,
  FileText, 
  Users, 
  Bell, 
  CheckCircle
} from 'lucide-react';

const ModeratorNavigation = () => {
  const location = useLocation();

  const navItems = [
    { href: '/moderator', label: 'Dashboard', icon: Home },
    { href: '/moderator/opportunities', label: 'Review Opportunities', icon: FileText },
    { href: '/moderator/approved', label: 'Approved', icon: CheckCircle },
    { href: '/moderator/users', label: 'Users', icon: Users },
    { href: '/moderator/notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 whitespace-nowrap',
                location.pathname === item.href
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
