// import Header from './components/Header';
import Sidebar from './components/Sidebar';
import VisualizationCanvas from './components/VisualizationCanvas';
import AIInsightsPanel from './components/AIInsightsPanel';
import Login from './pages/Login';
import { useState } from 'react';

export default function App() {

  const [isGuest, setIsGuest] = useState(false);

  if (!isGuest) {
    return <Login onGuestLogin={() => setIsGuest(true)} />;
  }

  return (
    <div className="flex h-screen w-full bg-pin-gray overflow-hidden">
      <Sidebar onLogout={() => setIsGuest(false)} />
      {/* Reduced padding on mobile (p-2), full padding on desktop (md:p-8) */}
      <main className="flex-1 flex flex-col p-2 md:p-8 relative">
        {/* <Header /> */}
        <div className="flex-1 rounded-3xl md:rounded-[2.5rem] overflow-hidden bg-white shadow-2xl shadow-black/5 relative">
          <VisualizationCanvas />
        </div>
        <AIInsightsPanel />
      </main>
    </div>
  );
}