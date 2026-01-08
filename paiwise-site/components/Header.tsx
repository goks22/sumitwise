import React, { useState } from 'react';
import { Tab } from '../types';
import { Menu, X, Calculator } from 'lucide-react';

interface HeaderProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', value: Tab.HOME },
    { label: 'About Us', value: Tab.ABOUT },
    { label: 'Tax Estimator', value: Tab.CALCULATOR },
    { label: 'Contact Us', value: Tab.CONTACT },
  ];

  return (
    <header className="bg-brand-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer shrink-0" 
            onClick={() => onTabChange(Tab.HOME)}
          >
            <div className="bg-accent-500 p-2 rounded-lg shrink-0">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-xl font-bold leading-tight">PaiWise Accounting & Tax LLC</h1>
              <span className="text-[10px] md:text-xs text-brand-200 mt-0.5 leading-tight">CPA firm registered with Virginia Board of Accountancy</span>
            </div>
          </div>

          {/* Desktop/Tablet Navigation - visible from small screens up to ensure it doesn't disappear */}
          <nav className="hidden sm:flex space-x-3 md:space-x-6 lg:space-x-8">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => onTabChange(item.value)}
                className={`text-sm font-semibold transition-colors duration-200 whitespace-nowrap py-2 border-b-2 ${
                  activeTab === item.value
                    ? 'text-accent-500 border-accent-500'
                    : 'text-gray-100 border-transparent hover:text-white hover:border-gray-400'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Button - Only show on very small screens */}
          <div className="sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-200 hover:text-white focus:outline-none p-2"
              aria-label="Toggle navigation"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-brand-800 border-t border-brand-700 shadow-xl">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  onTabChange(item.value);
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-md text-base font-medium ${
                  activeTab === item.value
                    ? 'bg-brand-900 text-accent-500'
                    : 'text-gray-100 hover:bg-brand-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;