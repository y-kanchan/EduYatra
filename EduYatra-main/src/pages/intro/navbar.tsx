// frontend/src/pages/intro/navbar.tsx - Deskoros Branding
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown, Sparkles } from 'lucide-react';

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-blue-900 shadow-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-400/30 rounded-xl blur-md group-hover:blur-lg transition-all"></div>
              <img src="/logo.svg" alt="Deskoros" className="relative w-9 h-9 transform group-hover:scale-110 transition-transform drop-shadow-lg" />
            </div>
            <span className="text-xl font-bold text-white drop-shadow-md">
              Deskoros
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link 
              to="/features" 
              className="px-4 py-2 text-blue-100 hover:text-white hover:bg-blue-800/50 rounded-lg font-medium transition-all relative group"
            >
              Features
            </Link>

            <div className="relative group">
              <button 
                className="flex items-center px-4 py-2 text-blue-100 hover:text-white hover:bg-blue-800/50 rounded-lg font-medium transition-all"
                onMouseEnter={() => setShowDropdown(true)}
                onMouseLeave={() => setShowDropdown(false)}
              >
                Solutions
                <ChevronDown className="ml-1 w-4 h-4" />
              </button>
              {showDropdown && (
                <div 
                  className="absolute top-full mt-2 bg-blue-800 rounded-xl shadow-2xl py-2 w-48 border border-blue-700 overflow-hidden"
                  onMouseEnter={() => setShowDropdown(true)}
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  <Link 
                    to="/courses" 
                    className="block px-4 py-2.5 text-blue-100 hover:bg-blue-700 hover:text-white transition-all font-medium"
                  >
                    📚 Courses
                  </Link>
                  <Link 
                    to="/tutoring" 
                    className="block px-4 py-2.5 text-blue-100 hover:bg-blue-700 hover:text-white transition-all font-medium"
                  >
                    👨‍🏫 Tutoring
                  </Link>
                  <Link 
                    to="/schools" 
                    className="block px-4 py-2.5 text-blue-100 hover:bg-blue-700 hover:text-white transition-all font-medium"
                  >
                    🏫 Schools
                  </Link>
                </div>
              )}
            </div>

            <Link 
              to="/contact-us" 
              className="px-4 py-2 text-blue-100 hover:text-white hover:bg-blue-800/50 rounded-lg font-medium transition-all relative group"
            >
              Contact
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link to="/signin">
              <Button variant="ghost" className="text-blue-100 hover:text-white hover:bg-blue-800/50 border border-blue-700 hover:border-blue-600 backdrop-blur-sm">
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-cyan-500 hover:bg-cyan-400 text-blue-900 px-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all font-semibold">
                <Sparkles className="w-4 h-4 mr-1.5" />
                Sign Up
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 rounded-lg hover:bg-blue-800/50 transition-colors text-white"
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden bg-blue-800 border-t border-blue-700 shadow-xl">
          <div className="container mx-auto px-4 py-4 space-y-1">
            <Link 
              to="/features" 
              className="block px-4 py-3 text-blue-100 hover:bg-blue-700 hover:text-white rounded-lg transition-all font-medium"
              onClick={() => setShowMobileMenu(false)}
            >
              Features
            </Link>
            
            <div className="space-y-1">
              <div className="px-4 py-2 text-xs font-bold text-blue-300 uppercase tracking-wider">Solutions</div>
              <Link 
                to="/courses" 
                className="block px-4 py-3 text-blue-100 hover:bg-blue-700 hover:text-white rounded-lg transition-all ml-2 font-medium"
                onClick={() => setShowMobileMenu(false)}
              >
                📚 Courses
              </Link>
              <Link 
                to="/tutoring" 
                className="block px-4 py-3 text-blue-100 hover:bg-blue-700 hover:text-white rounded-lg transition-all ml-2 font-medium"
                onClick={() => setShowMobileMenu(false)}
              >
                👨‍🏫 Tutoring
              </Link>
              <Link 
                to="/schools" 
                className="block px-4 py-3 text-blue-100 hover:bg-blue-700 hover:text-white rounded-lg transition-all ml-2 font-medium"
                onClick={() => setShowMobileMenu(false)}
              >
                🏫 Schools
              </Link>
            </div>

            <Link 
              to="/contact-us" 
              className="block px-4 py-3 text-blue-100 hover:bg-blue-700 hover:text-white rounded-lg transition-all font-medium"
              onClick={() => setShowMobileMenu(false)}
            >
              Contact
            </Link>

            <div className="border-t border-blue-700 pt-4 mt-4 space-y-2">
              <Link to="/signin" onClick={() => setShowMobileMenu(false)}>
                <Button variant="outline" className="w-full border-2 border-blue-600 text-blue-100 hover:bg-blue-700 hover:text-white font-medium">Login</Button>
              </Link>
              <Link to="/signup" onClick={() => setShowMobileMenu(false)}>
                <Button className="w-full bg-cyan-500 hover:bg-cyan-400 text-blue-900 shadow-lg font-semibold">
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
