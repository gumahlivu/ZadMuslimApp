import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Headphones } from 'lucide-react';
import { Surah } from '../types';

export default function AudioPlayerView() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/surah')
      .then((res) => res.json())
      .then((data) => {
        setSurahs(data.data);
        if (data.data.length > 0) {
          setCurrentSurah(data.data[0]);
        }
      });
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Playback failed", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setProgress(value);
    }
  };

  const playSurah = (surah: Surah) => {
    if (currentSurah?.number === surah.number) {
      togglePlay();
      return;
    }
    setCurrentSurah(surah);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (audioRef.current && currentSurah) {
      if (isPlaying) {
        // Small delay to ensure src is updated by React before playing
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Auto-play was prevented or failed:", error);
            setIsPlaying(false);
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentSurah, isPlaying]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const playNext = () => {
    if (currentSurah && currentSurah.number < 114) {
      const next = surahs.find(s => s.number === currentSurah.number + 1);
      if (next) playSurah(next);
    }
  };

  const playPrev = () => {
    if (currentSurah && currentSurah.number > 1) {
      const prev = surahs.find(s => s.number === currentSurah.number - 1);
      if (prev) playSurah(prev);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center">
          <Headphones className="w-6 h-6 ml-2 text-emerald-600" />
          الصوتيات
        </h1>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player Section */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-3xl p-8 text-white shadow-xl sticky top-6">
            <div className="w-full aspect-square bg-emerald-700/30 rounded-2xl mb-8 flex items-center justify-center border border-emerald-600/30 backdrop-blur-sm">
              <Headphones className="w-24 h-24 text-emerald-300 opacity-50" />
            </div>
            
            <div className="text-center mb-8">
              <h2 className="text-3xl font-amiri font-bold mb-2">
                {currentSurah ? currentSurah.name : 'اختر سورة'}
              </h2>
              <p className="text-emerald-300/80">القارئ مشاري العفاسي</p>
            </div>

            <div className="mb-6">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={progress}
                onChange={handleProgressChange}
                className="w-full h-1.5 bg-emerald-900 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                style={{ direction: 'ltr' }}
              />
              <div className="flex justify-between text-xs text-emerald-400/70 mt-2 font-mono" style={{ direction: 'ltr' }}>
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6" style={{ direction: 'ltr' }}>
              <button onClick={playPrev} className="text-emerald-300 hover:text-white transition-colors">
                <SkipBack className="w-8 h-8" />
              </button>
              <button
                onClick={togglePlay}
                className="w-16 h-16 bg-emerald-400 text-emerald-950 rounded-full flex items-center justify-center hover:bg-emerald-300 transition-colors shadow-lg shadow-emerald-400/20"
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </button>
              <button onClick={playNext} className="text-emerald-300 hover:text-white transition-colors">
                <SkipForward className="w-8 h-8" />
              </button>
            </div>

            <audio
              ref={audioRef}
              onTimeUpdate={handleTimeUpdate}
              onEnded={playNext}
              src={currentSurah ? `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${currentSurah.number}.mp3` : ''}
            />
          </div>
        </div>

        {/* Playlist Section */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-4 overflow-hidden flex flex-col h-[600px]">
          <h3 className="text-lg font-bold text-slate-800 mb-4 px-2">قائمة السور</h3>
          <div className="overflow-y-auto flex-1 pr-2 space-y-2 custom-scrollbar">
            {surahs.map((surah) => (
              <button
                key={surah.number}
                onClick={() => playSurah(surah)}
                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                  currentSurah?.number === surah.number
                    ? 'bg-emerald-50 border-emerald-200 border'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ml-4 ${
                    currentSurah?.number === surah.number
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isPlaying && currentSurah?.number === surah.number ? (
                      <div className="flex gap-0.5 items-end h-4">
                        <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-white rounded-t-sm"></motion.div>
                        <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-1 bg-white rounded-t-sm"></motion.div>
                        <motion.div animate={{ height: [6, 10, 6] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-1 bg-white rounded-t-sm"></motion.div>
                      </div>
                    ) : (
                      surah.number
                    )}
                  </div>
                  <div className="text-right">
                    <h4 className="font-bold text-slate-800 font-amiri text-lg">{surah.name}</h4>
                    <p className="text-xs text-slate-500">مشاري العفاسي</p>
                  </div>
                </div>
                <div className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-5 h-5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
