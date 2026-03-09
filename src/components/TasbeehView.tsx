import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Settings2, ChevronRight, ChevronLeft } from 'lucide-react';

const ATHKAR = [
  "سبحان الله",
  "الحمد لله",
  "لا إله إلا الله",
  "الله أكبر",
  "لا حول ولا قوة إلا بالله",
  "أستغفر الله",
  "سبحان الله وبحمده",
  "سبحان الله العظيم",
  "اللهم صل وسلم على نبينا محمد",
  "لا إله إلا أنت سبحانك إني كنت من الظالمين",
  "حسبي الله ونعم الوكيل",
  "يا حي يا قيوم برحمتك أستغيث",
  "سبحان الله وبحمده عدد خلقه ورضا نفسه وزنة عرشه ومداد كلماته",
  "أستغفر الله الذي لا إله إلا هو الحي القيوم وأتوب إليه",
  "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير",
  "اللهم إنك عفو تحب العفو فاعف عني",
  "الحمد لله حمداً كثيراً طيباً مباركاً فيه",
  "بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم",
  "اللهم آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار",
  "سبوح قدوس رب الملائكة والروح",
  "اللهم اغفر لي وارحمني واهدني وعافني وارزقني"
];

export default function TasbeehView() {
  const [count, setCount] = useState(() => {
    const saved = localStorage.getItem('tasbeeh_count');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [totalCount, setTotalCount] = useState(() => {
    const saved = localStorage.getItem('tasbeeh_total');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [goal, setGoal] = useState(() => {
    const saved = localStorage.getItem('tasbeeh_goal');
    return saved ? parseInt(saved, 10) : 33;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [currentThikrIndex, setCurrentThikrIndex] = useState(() => {
    const saved = localStorage.getItem('tasbeeh_thikr_index');
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem('tasbeeh_count', count.toString());
  }, [count]);

  useEffect(() => {
    localStorage.setItem('tasbeeh_total', totalCount.toString());
  }, [totalCount]);

  useEffect(() => {
    localStorage.setItem('tasbeeh_goal', goal.toString());
  }, [goal]);

  useEffect(() => {
    localStorage.setItem('tasbeeh_thikr_index', currentThikrIndex.toString());
  }, [currentThikrIndex]);

  const handleTap = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50); // Short vibration
    }
    
    setCount(prev => {
      const newCount = prev + 1;
      if (newCount >= goal) {
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]); // Longer vibration on reaching goal
        }
        
        // Move to next thikr and reset count after a tiny delay
        setTimeout(() => {
          setCurrentThikrIndex(curr => (curr + 1) % ATHKAR.length);
          setCount(0);
        }, 400);
      }
      return newCount;
    });
    
    setTotalCount(prev => prev + 1);
  };

  const resetCount = () => {
    setCount(0);
  };

  const resetTotal = () => {
    if (confirm('هل أنت متأكد من تصفير العداد الكلي؟')) {
      setTotalCount(0);
    }
  };

  const nextThikr = () => {
    setCurrentThikrIndex(curr => (curr + 1) % ATHKAR.length);
    setCount(0);
  };

  const prevThikr = () => {
    setCurrentThikrIndex(curr => (curr === 0 ? ATHKAR.length - 1 : curr - 1));
    setCount(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col items-center justify-center max-w-md mx-auto"
    >
      <div className="w-full flex justify-between items-center mb-4 px-4">
        <div>
          <h2 className="text-sm text-slate-500 font-semibold">المجموع الكلي</h2>
          <p className="text-2xl font-bold text-emerald-700 font-mono">{totalCount}</p>
        </div>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-slate-400 hover:text-emerald-600 transition-colors rounded-full hover:bg-emerald-50"
        >
          <Settings2 className="w-6 h-6" />
        </button>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full px-4 mb-4 overflow-hidden"
          >
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-700 mb-3">إعدادات المسبحة</h3>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-slate-600">الهدف</span>
                <div className="flex gap-2">
                  {[33, 100, 1000].map(g => (
                    <button
                      key={g}
                      onClick={() => setGoal(g)}
                      className={`px-3 py-1 rounded-full text-sm font-mono ${
                        goal === g 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={resetTotal}
                className="w-full py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                تصفير المجموع الكلي
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thikr Display */}
      <div className="w-full px-4 mb-8 flex items-center justify-between">
        <button onClick={prevThikr} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors">
          <ChevronRight className="w-6 h-6" />
        </button>
        
        <div className="flex-1 text-center px-2 min-h-[80px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.h2
              key={currentThikrIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xl md:text-2xl font-amiri font-bold text-emerald-800 leading-relaxed"
            >
              {ATHKAR[currentThikrIndex]}
            </motion.h2>
          </AnimatePresence>
        </div>

        <button onClick={nextThikr} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="relative w-full max-w-[280px] aspect-square mb-12 flex items-center justify-center mx-auto">
        {/* Outer Glow / Background */}
        <div className="absolute inset-0 bg-emerald-50 rounded-full blur-3xl opacity-50"></div>
        
        {/* Progress Ring */}
        <svg className="w-full h-full transform -rotate-90 absolute inset-0 drop-shadow-md" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="2"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="url(#emerald-gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ strokeDasharray: "289", strokeDashoffset: "289" }}
            animate={{ 
              strokeDashoffset: 289 - (289 * (count % goal)) / goal 
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="emerald-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>
        </svg>

        {/* Tap Button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleTap}
          className="absolute inset-6 bg-white rounded-full shadow-[0_10px_40px_-10px_rgba(16,185,129,0.3)] flex flex-col items-center justify-center text-emerald-800 border border-emerald-50 select-none touch-manipulation z-10 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 to-transparent opacity-0 group-active:opacity-100 transition-opacity"></div>
          <span className="text-7xl font-bold font-mono tracking-tighter mb-1 text-emerald-600">{count}</span>
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium tracking-widest">
            <span>الهدف</span>
            <span className="px-2 py-0.5 bg-slate-100 rounded-full text-slate-600">{goal}</span>
          </div>
        </motion.button>
      </div>

      <div className="flex gap-4">
        <button
          onClick={resetCount}
          className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 rounded-full shadow-sm border border-slate-200 hover:bg-slate-50 hover:text-emerald-600 transition-all font-semibold"
        >
          <RotateCcw className="w-5 h-5" />
          تصفير العداد
        </button>
      </div>
    </motion.div>
  );
}
