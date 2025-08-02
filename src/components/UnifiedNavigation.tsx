
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Search, Bookmark, User, Settings, Bell, Plus, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import NotificationSystem from './NotificationSystem';

const UnifiedNavigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, userRole, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const publicNavigationItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/opportunities', label: 'Opportunities', icon: Search },
    { path: '/scholarships', label: 'Scholarships', icon: Search },
  ];

  const userNavigationItems = user ? [
    { path: '/dashboard', label: 'Dashboard', icon: User },
    { path: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { path: '/applications', label: 'Applications', icon: User },
    { path: '/submit', label: 'Submit', icon: Plus },
  ] : [];

  const adminNavigationItems = [];
  if (userRole === 'admin') {
    adminNavigationItems.push(
      { path: '/admin', label: 'Admin Panel', icon: Shield },
      { path: '/admin/users', label: 'User Management', icon: Settings },
      { path: '/admin/notifications', label: 'Send Notifications', icon: Bell },
      { path: '/admin/bulk-email', label: 'Bulk Email', icon: Settings }
    );
  }
  if (userRole === 'moderator' || userRole === 'admin') {
    adminNavigationItems.push(
      { path: '/moderator/dashboard', label: 'Moderate', icon: Settings },
      { path: '/moderator/pending', label: 'Pending Review', icon: Settings }
    );
  }

  const allNavigationItems = [...publicNavigationItems, ...userNavigationItems, ...adminNavigationItems];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-sm">OH</span>
              </div>
              <span className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
                OpportunityHub
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {publicNavigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    isActive(item.path)
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  {item.label}
                  {isActive(item.path) && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                  )}
                </Link>
              ))}
              
              {user && userNavigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    isActive(item.path)
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  {item.label}
                  {isActive(item.path) && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                  )}
                </Link>
              ))}

              {adminNavigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    isActive(item.path)
                      ? 'text-red-600'
                      : 'text-gray-700 hover:text-red-600'
                  }`}
                >
                  {item.label}
                  {isActive(item.path) && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></div>
                  )}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <NotificationSystem />
                  <div className="relative group">
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline text-sm">
                        {user.email?.split('@')[0]}
                      </span>
                    </Button>
                    
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 transform scale-95 group-hover:scale-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
                      <div className="py-2">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </Link>
                        <hr className="my-1" />
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <Link to="/auth">
                  <Button className="hover:scale-105 transition-transform">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 ${
          isMobileMenuOpen 
            ? 'max-h-screen opacity-100' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="px-4 py-6 bg-white border-t space-y-4">
            {allNavigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            
            <div className="pt-4 border-t">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Notifications</span>
                    <NotificationSystem />
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    <User className="h-5 w-5" />
                    <span className="font-medium">Profile</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link to="/auth" className="block">
                  <Button className="w-full">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="h-16"></div>
    </>
  );
};

export default UnifiedNavigation;
