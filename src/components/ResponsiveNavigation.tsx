
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Search, Bookmark, User, Settings, Bell, Plus, Zap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import NotificationSystem from './NotificationSystem';

const ResponsiveNavigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, userRole } = useAuth();

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

  const navigationItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/opportunities', label: 'Opportunities', icon: Search },
    { path: '/scholarships', label: 'Scholarships', icon: Search },
    ...(user ? [
      { path: '/dashboard', label: 'Dashboard', icon: User },
      { path: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
      { path: '/applications', label: 'Applications', icon: User },
      { path: '/submit', label: 'Submit', icon: Plus },
    ] : []),
    ...(userRole === 'admin' || userRole === 'moderator' ? [
      { path: '/moderator/dashboard', label: 'Moderate', icon: Settings },
    ] : []),
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white/90 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                OpportunityHub
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg hover:scale-105 ${
                    isActive(item.path)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-2 inline" />
                  {item.label}
                  {isActive(item.path) && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-600 rounded-full animate-scale-in"></div>
                  )}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <NotificationSystem />
                  <Link to="/profile">
                    <Button variant="ghost" size="sm" className="hover:scale-105 transition-all duration-300">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                </>
              ) : (
                <Link to="/auth">
                  <Button className="hover:scale-105 transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
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
                className="p-2 transition-transform duration-300 hover:scale-110"
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
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen 
            ? 'max-h-screen opacity-100 animate-slide-in-right' 
            : 'max-h-0 opacity-0'
        }`}>
          <div className="px-4 py-6 bg-white/95 backdrop-blur-sm border-t space-y-4">
            {navigationItems.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 animate-fade-in ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 transform scale-105'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:scale-105'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            
            <div className="pt-4 border-t animate-fade-in" style={{ animationDelay: `${navigationItems.length * 50}ms` }}>
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-4">
                    <span className="text-sm text-gray-600">Notifications</span>
                    <NotificationSystem />
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-300 hover:scale-105"
                  >
                    <User className="h-5 w-5" />
                    <span className="font-medium">Profile</span>
                  </Link>
                </div>
              ) : (
                <Link to="/auth" className="block">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer */}
      <div className="h-16"></div>
    </>
  );
};

export default ResponsiveNavigation;
