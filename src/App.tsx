import { useState } from 'react';
import { BookOpen, Headphones, CircleDot, Clock } from 'lucide-react';
import QuranView from './components/QuranView';
import AudioPlayerView from './components/AudioPlayerView';
import TasbeehView from './components/TasbeehView';
import PrayerTimesView from './components/PrayerTimesView';

type ViewType = 'quran' | 'audio' | 'tasbeeh' | 'prayer';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('quran');

  return (
    <div className="min-h-screen bg-slate-50 font-cairo" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-center">
          <h1 className="text-xl font-bold text-emerald-800 font-amiri tracking-wide">
            زاد المسلم
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 pt-4 pb-24 h-[calc(100vh-4rem)] overflow-y-auto">
        {currentView === 'quran' && <QuranView />}
        {currentView === 'audio' && <AudioPlayerView />}
        {currentView === 'tasbeeh' && <TasbeehView />}
        {currentView === 'prayer' && <PrayerTimesView />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-2 left-0 right-0 z-20 px-4 pointer-events-none">
        <div className="max-w-md mx-auto bg-white/90 backdrop-blur-md border border-emerald-100/50 shadow-lg shadow-emerald-900/5 rounded-full flex justify-around p-1.5 pointer-events-auto overflow-x-auto hide-scrollbar">
          <NavItem
            icon={<BookOpen className="w-5 h-5" />}
            label="القرآن"
            isActive={currentView === 'quran'}
            onClick={() => setCurrentView('quran')}
          />
          <NavItem
            icon={<Headphones className="w-5 h-5" />}
            label="الصوتيات"
            isActive={currentView === 'audio'}
            onClick={() => setCurrentView('audio')}
          />
          <NavItem
            icon={<CircleDot className="w-5 h-5" />}
            label="المسبحة"
            isActive={currentView === 'tasbeeh'}
            onClick={() => setCurrentView('tasbeeh')}
          />
          <NavItem
            icon={<Clock className="w-5 h-5" />}
            label="المواقيت"
            isActive={currentView === 'prayer'}
            onClick={() => setCurrentView('prayer')}
          />
        </div>
      </nav>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center justify-center gap-2 px-4 py-3 rounded-full transition-all duration-300 whitespace-nowrap ${
        isActive 
          ? 'text-emerald-700 bg-emerald-100/80 shadow-sm' 
          : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50/50'
      }`}
    >
      <div className="relative z-10">{icon}</div>
      {isActive && (
        <span className="text-sm font-bold tracking-wide relative z-10">{label}</span>
      )}
    </button>
  );
}
