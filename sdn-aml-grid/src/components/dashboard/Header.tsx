import React, { useState } from 'react';
import { Bell, Settings, User, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New entity flagged as high risk', isRead: false },
    { id: 2, text: 'Sanctions list updated', isRead: false },
    { id: 3, text: 'Weekly compliance report ready', isRead: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo and mobile menu */}
          <div className="flex items-center">
            <button 
              className="mr-2 lg:hidden" 
              onClick={toggleMenu}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/" className="text-2xl font-bold text-emerald-500">
              SDN AML GRID
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link to="/dashboard" className="text-slate-700 hover:text-emerald-500 transition-colors">
              Dashboard
            </Link>
            <Link to="/dashboard/screening" className="text-slate-700 hover:text-emerald-500 transition-colors">
              Screening
            </Link>
            <Link to="/dashboard/reports" className="text-slate-700 hover:text-emerald-500 transition-colors">
              Reports
            </Link>
            <Link to="/dashboard/analytics" className="text-slate-700 hover:text-emerald-500 transition-colors">
              Analytics
            </Link>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={toggleNotifications}
                className="text-slate-700 hover:text-emerald-500 transition-colors relative"
                aria-label="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20">
                  <div className="p-3 border-b flex justify-between items-center">
                    <h3 className="font-medium">Notifications</h3>
                    <button 
                      onClick={markAllAsRead}
                      className="text-sm text-emerald-500 hover:text-emerald-600"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-slate-500">No notifications</p>
                    ) : (
                      notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`p-3 border-b hover:bg-slate-50 ${!notification.isRead ? 'bg-emerald-50' : ''}`}
                        >
                          <p className="text-sm">{notification.text}</p>
                          <span className="text-xs text-slate-500">1 hour ago</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <Link to="/dashboard/settings" className="text-slate-700 hover:text-emerald-500 transition-colors">
              <Settings size={20} />
            </Link>

            {/* User Profile */}
            <Link to="/dashboard/profile" className="text-slate-700 hover:text-emerald-500 transition-colors">
              <User size={20} />
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-4 pt-4 border-t">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/dashboard" 
                className="text-slate-700 hover:text-emerald-500 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/dashboard/screening" 
                className="text-slate-700 hover:text-emerald-500 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Screening
              </Link>
              <Link 
                to="/dashboard/reports" 
                className="text-slate-700 hover:text-emerald-500 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Reports
              </Link>
              <Link 
                to="/dashboard/analytics" 
                className="text-slate-700 hover:text-emerald-500 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Analytics
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
