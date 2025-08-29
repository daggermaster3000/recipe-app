import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthForm } from './components/AuthForm';
import { Layout } from './components/Layout';
import { RecipesDashboard } from './components/RecipesDashboard';
import { ExploreFeed } from './components/ExploreFeed';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl font-bold tracking-wide text-black uppercase">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const [view, setView] = useState<'my' | 'explore'>('my');
  return (
    <Layout>
      <div className="mb-8 flex items-center gap-2">
        <button
          onClick={() => setView('my')}
          className={`px-3 py-2 text-xs font-bold tracking-wide uppercase border ${view === 'my' ? 'bg-black text-white border-black' : 'border-black text-black hover:bg-black hover:text-white transition-colors'}`}
        >
          My Recipes
        </button>
        <button
          onClick={() => setView('explore')}
          className={`px-3 py-2 text-xs font-bold tracking-wide uppercase border ${view === 'explore' ? 'bg-black text-white border-black' : 'border-black text-black hover:bg-black hover:text-white transition-colors'}`}
        >
          Explore
        </button>
      </div>
      {view === 'my' ? <RecipesDashboard /> : <ExploreFeed />}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;