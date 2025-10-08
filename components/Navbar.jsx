'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { User, LogOut, Settings, ShoppingCart, Cloud, Newspaper, Menu,Book } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const session = await supabase.auth.getSession();
      const token = session?.data?.session?.access_token;
      const emailVerified = !!session?.data?.session?.user?.email_confirmed_at;
      if (!token || !emailVerified) {
        setUser(null);
        return;
      }
      const resp = await fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null);
      if (!resp.ok) return;
      const data = await resp.json();
      const p = data.profile;
      const u = data.user;
      setUser({
        name: p?.name || '',
        email: u?.email || '',
        profile_picture_url: p?.profile_picture_url || '',
        role: u?.role || 'farmer',
      });
    };

    // initial
    loadUser();

    // subscribe to auth state
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const token = session?.access_token;
      const emailVerified = !!session?.user?.email_confirmed_at;
      if (!token || !emailVerified) {
        setUser(null);
        return;
      }
      // fetch profile for the signed-in user
      fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (!data) return;
          const p = data.profile;
          const u = data.user;
          setUser({
            name: p?.name || '',
            email: u?.email || '',
            profile_picture_url: p?.profile_picture_url || '',
            role: u?.role || 'farmer',
          });
        });
    });

    return () => {
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigationItems = [
    { href: '/', label: 'Home' },
    { href: '/features', label: 'Features' },
    { href: '/marketplace', label: 'Marketplace', icon: ShoppingCart },
    {href: '/guide',label:'Guide',icon:Book},
    { href: '/weather', label: 'Weather', icon: Cloud },
    { href: '/news', label: 'News', icon: Newspaper },
    
  ];

  return (
    <nav className="bg-white shadow-lg border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-green-600 text-white p-2 rounded-lg">
                <span className="font-bold text-xl">🌱</span>
              </div>
              <span className="text-xl font-bold text-green-800">AgriConnect</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition-colors"
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profile_picture_url} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center space-x-2">
                    <div className="bg-green-600 text-white p-2 rounded-lg">
                      <span className="font-bold text-lg">🌱</span>
                    </div>
                    <span className="text-lg font-bold text-green-800">AgriConnect</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-8 space-y-4">
                  {/* Navigation Links */}
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {item.icon && <item.icon className="w-5 h-5 text-gray-600" />}
                      <span className="text-gray-700 font-medium">{item.label}</span>
                    </Link>
                  ))}

                  {/* Mock Auth Buttons */}
                  {!user && (
                    <div className="pt-6 border-t space-y-3">
                      <Button asChild className="w-full" onClick={closeMobileMenu}>
                        <Link href="/auth/signin">Sign In</Link>
                      </Button>
                      <Button variant="outline" asChild className="w-full" onClick={closeMobileMenu}>
                        <Link href="/auth/signup">Sign Up</Link>
                      </Button>
                    </div>
                  )}

                  {/* Mock User Info */}
                  {user && (
                    <div className="pt-6 border-t">
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg mb-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.profile_picture_url} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Link
                          href="/profile"
                          onClick={closeMobileMenu}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <User className="w-5 h-5 text-gray-600" />
                          <span className="text-gray-700">Profile</span>
                        </Link>

                        {user.role === 'admin' && (
                          <Link
                            href="/admin"
                            onClick={closeMobileMenu}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Settings className="w-5 h-5 text-gray-600" />
                            <span className="text-gray-700">Admin Dashboard</span>
                          </Link>
                        )}

                        <button
                          onClick={() => {
                            handleSignOut();
                            closeMobileMenu();
                          }}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors w-full text-left"
                        >
                          <LogOut className="w-5 h-5 text-gray-600" />
                          <span className="text-gray-700">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

