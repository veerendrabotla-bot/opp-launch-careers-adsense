
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Search, Bookmark, User, Settings, Bell, Plus, Shield, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import NotificationSystem from './NotificationSystem';

const UnifiedNavigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
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
    setShowAdminDropdown(false);
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
    { path: '/search/advanced', label: 'Advanced Search', icon: Search },
  ] : [];

  const adminNavigationItems = [];
  if (userRole === 'admin') {
    adminNavigationItems.push(
      { path: '/admin', label: 'Admin Panel', icon: Shield },
      { path: '/admin/users', label: 'User Management', icon: Settings },
      { path: '/admin/notifications', label: 'Send Notifications', icon: Bell },
      { path: '/admin/email-campaigns', label: 'Email Campaigns', icon: Settings },
      { path: '/admin/analytics', label: 'Analytics', icon: Settings }
    );
  }
  if (userRole === 'moderator' || userRole === 'admin') {
    adminNavigationItems.push(
      { path: '/moderator/dashboard', label: 'Moderate', icon: Settings },
      { path: '/moderator/pending', label: 'Pending Review', icon: Settings }
    );
  }

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
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xs">OH</span>
              </div>
              <span className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors hidden sm:block">
                OpportunityHub
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {publicNavigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-2 py-1.5 text-sm font-medium transition-all duration-200 hover:scale-105 rounded-md ${
                    isActive(item.path)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {user && userNavigationItems.slice(0, 3).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-2 py-1.5 text-sm font-medium transition-all duration-200 hover:scale-105 rounded-md ${
                    isActive(item.path)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* Admin/Moderator Dropdown */}
              {adminNavigationItems.length > 0 && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-1"
                    onClick={() => setShowAdminDropdown(!showAdminDropdown)}
                  >
                    <Shield className="h-4 w-4" />
                    <span className="text-sm">Admin</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  
                  {showAdminDropdown && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border z-50">
                      <div className="py-2">
                        {adminNavigationItems.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setShowAdminDropdown(false)}
                          >
                            <item.icon className="h-4 w-4 mr-2" />
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="hidden lg:flex items-center space-x-3">
              {user ? (
                <>
                  <NotificationSystem />
                  <div className="relative group">
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span className="hidden xl:inline text-sm">
                        {user.email?.split('@')[0]}
                      </span>
                    </Button>
                    
                    <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 transform scale-95 group-hover:scale-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
                      <div className="py-2">
                        <Link
                          to="/profile"
                          className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </Link>
                        <Link
                          to="/search/advanced"
                          className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <Search className="h-4 w-4 mr-2" />
                          Advanced Search
                        </Link>
                        <hr className="my-1" />
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
                  <Button size="sm" className="hover:scale-105 transition-transform">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-2">
              {user && <NotificationSystem />}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-300 ${
          isMobileMenuOpen 
            ? 'max-h-screen opacity-100 bg-white border-t' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="px-4 py-4 space-y-2">
            {[...publicNavigationItems, ...userNavigationItems, ...adminNavigationItems].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            ))}
            
            <div className="pt-3 border-t">
              {user ? (
                <div className="space-y-2">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    <User className="h-4 w-4" />
                    <span className="font-medium text-sm">Profile</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="font-medium text-sm">Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link to="/auth" className="block">
                  <Button className="w-full" size="sm">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="h-14"></div>
    </>
  );
};

export default UnifiedNavigation;
