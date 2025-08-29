import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, ChefHat } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-black">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ChefHat className="w-8 h-8 text-black" />
              <h1 className="text-2xl font-bold tracking-tight text-black font-mono">Flavorfolio</h1>
            </div>
            {user && (
              <div className="flex items-center space-x-6">
                <span className="text-sm font-medium tracking-wide text-black uppercase font-mono">
                  {user.email}
                </span>
                <button
                  onClick={signOut}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-black border border-black hover:bg-black hover:text-white transition-colors duration-200 font-mono"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="tracking-wide">SIGN OUT</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-8 py-12">
        {children}
      </main>
    </div>
  );
}