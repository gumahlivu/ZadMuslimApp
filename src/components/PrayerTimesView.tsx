import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { MapPin, Bell, BellOff, Clock, Sunrise, Sun, SunMedium, SunDim, Sunset, MoonStar } from 'lucide-react';

interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

const PRAYER_ICONS: Record<keyof PrayerTimes, { icon: any, bg: string, color: string }> = {
  Fajr: { icon: Sunrise, bg: 'bg-indigo-50', color: 'text-indigo-600' },
  Sunrise: { icon: Sun, bg: 'bg-amber-50', color: 'text-amber-500' },
  Dhuhr: { icon: SunMedium, bg: 'bg-sky-50', color: 'text-sky-500' },
  Asr: { icon: SunDim, bg: 'bg-orange-50', color: 'text-orange-500' },
  Maghrib: { icon: Sunset, bg: 'bg-rose-50', color: 'text-rose-500' },
  Isha: { icon: MoonStar, bg: 'bg-slate-800', color: 'text-indigo-200' },
};

const PRAYER_NAMES_AR: Record<keyof PrayerTimes, string> = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

export default function PrayerTimesView() {
  const [timings, setTimings] = useState<PrayerTimes | null>(null);
  const [hijriDate, setHijriDate] = useState<{ day: string; month: string; monthNumber: number; year: string } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [locationName, setLocationName] = useState('جاري تحديد الموقع...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; diff: string } | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const savedNotifs = localStorage.getItem('prayer_notifications');
    if (savedNotifs === 'true') {
      setNotificationsEnabled(true);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchPrayerTimes(latitude, longitude);
        },
        (err) => {
          console.error(err);
          setError('لم نتمكن من الوصول لموقعك. تم عرض مواقيت مكة المكرمة افتراضياً.');
          fetchPrayerTimes(21.4225, 39.8262); // Makkah fallback
        }
      );
    } else {
      setError('متصفحك لا يدعم تحديد الموقع. تم عرض مواقيت مكة المكرمة افتراضياً.');
      fetchPrayerTimes(21.4225, 39.8262);
    }
  }, []);

  const fetchPrayerTimes = async (lat: number, lng: number) => {
    try {
      const date = new Date();
      const timestamp = Math.floor(date.getTime() / 1000);
      const res = await fetch(`https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=4`);
      const data = await res.json();
      
      if (data.code === 200) {
        const t = data.data.timings;
        const h = data.data.date.hijri;
        setTimings({
          Fajr: t.Fajr,
          Sunrise: t.Sunrise,
          Dhuhr: t.Dhuhr,
          Asr: t.Asr,
          Maghrib: t.Maghrib,
          Isha: t.Isha,
        });
        setHijriDate({
          day: h.day,
          month: h.month.ar,
          monthNumber: h.month.number,
          year: h.year
        });
        
        try {
          const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=ar`);
          const geoData = await geoRes.json();
          setLocationName(geoData.city || geoData.locality || 'موقعك الحالي');
        } catch (e) {
          setLocationName('موقعك الحالي');
        }
      }
    } catch (err) {
      setError('حدث خطأ أثناء جلب المواقيت.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!timings) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      let nextP: keyof PrayerTimes | null = null;
      let minDiff = Infinity;

      Object.entries(timings).forEach(([key, timeStr]) => {
        if (key === 'Sunrise') return; 
        const [hours, minutes] = timeStr.split(':').map(Number);
        const prayerTime = hours * 60 + minutes;
        
        let diff = prayerTime - currentTime;
        if (diff < 0) diff += 24 * 60; 

        if (diff < minDiff && diff > 0) {
          minDiff = diff;
          nextP = key as keyof PrayerTimes;
        }
      });

      if (nextP) {
        const hours = Math.floor(minDiff / 60);
        const mins = minDiff % 60;
        setNextPrayer({
          name: PRAYER_NAMES_AR[nextP],
          time: timings[nextP],
          diff: `${hours > 0 ? `${hours} ساعة و ` : ''}${mins} دقيقة`
        });

        const currentFormatted = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        if (timings[nextP] === currentFormatted && now.getSeconds() === 0) {
          playAdhan();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timings, notificationsEnabled]);

  const toggleNotifications = async () => {
    const newVal = !notificationsEnabled;
    setNotificationsEnabled(newVal);
    localStorage.setItem('prayer_notifications', newVal.toString());

    if (newVal) {
      // Unlock audio context by playing and immediately pausing
      if (audioRef.current) {
        audioRef.current.volume = 0; // Mute for the unlock play
        audioRef.current.play().then(() => {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.volume = 1; // Restore volume
          }
        }).catch(console.error);
      }
      
      // Request permission for visual notifications if not already granted/denied
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    } else {
      // Trying to disable
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  };

  const playAdhan = () => {
    if (notificationsEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 1;
      audioRef.current.play().catch(e => console.error("Audio play failed", e));
      
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('حان الآن موعد الصلاة', {
          body: 'تذكير بدخول وقت الصلاة',
          icon: '/vite.svg'
        });
      }
    }
  };

  const formatTime12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'م' : 'ص';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col"
    >
      <audio 
        ref={audioRef} 
        src="https://server8.mp3quran.net/adhan/Alafasi.mp3" 
        preload="auto"
      />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center">
          <Clock className="w-6 h-6 ml-2 text-emerald-600" />
          مواقيت الصلاة
        </h1>
        <button
          onClick={toggleNotifications}
          className={`p-2 rounded-full transition-colors ${
            notificationsEnabled 
              ? 'bg-emerald-100 text-emerald-600' 
              : 'bg-slate-100 text-slate-400'
          }`}
          title={notificationsEnabled ? 'إيقاف التنبيهات' : 'تفعيل التنبيهات'}
        >
          {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
        </button>
      </div>

      {error && (
        <div className="bg-amber-50 text-amber-700 p-3 rounded-lg text-sm mb-3 border border-amber-200">
          {error}
        </div>
      )}

      <div className="flex items-center text-slate-500 mb-3 text-sm bg-slate-100 w-fit px-3 py-1.5 rounded-full">
        <MapPin className="w-4 h-4 ml-1 text-emerald-600" />
        {locationName}
      </div>

      {/* Date, Time, and Ramadan Info Card */}
      <div className="relative rounded-[2rem] overflow-hidden shadow-md mb-3 min-h-[180px] flex items-center justify-center p-5 border border-slate-100">
        {/* Background Image */}
        <img 
          src="https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=800&auto=format&fit=crop" 
          alt="Islamic Background" 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-transparent"></div>
        
        {/* Content */}
        <div className="relative z-10 w-full text-right flex flex-col items-end">
          <div className="flex items-center justify-end gap-2 mb-2">
            <span className="text-2xl font-bold text-emerald-100 font-amiri">
              {currentTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }).split(' ')[1]}
            </span>
            <h2 className="text-5xl font-bold font-mono text-white tracking-tight" dir="ltr">
              {currentTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }).split(' ')[0]}
            </h2>
          </div>
          
          {hijriDate && (
            <div className="text-sm font-medium space-y-3 mt-1 text-right">
              <p className="text-xl text-white font-amiri">{hijriDate.day} {hijriDate.month} {hijriDate.year} هـ</p>
              
              {hijriDate.monthNumber === 9 ? (
                <div className="text-white bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl inline-block border border-white/30 shadow-sm">
                  <span className="font-bold text-base">اليوم {hijriDate.day} من رمضان</span>
                  <span className="mx-3 text-white/50">|</span>
                  <span className="text-base">متبقي {30 - parseInt(hijriDate.day)} يوم للعيد</span>
                </div>
              ) : hijriDate.monthNumber === 8 ? (
                <div className="text-white bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl inline-block border border-white/30 shadow-sm">
                  <span className="font-bold text-base">شهر شعبان</span>
                  <span className="mx-3 text-white/50">|</span>
                  <span className="text-base">متبقي {30 - parseInt(hijriDate.day)} يوم لرمضان</span>
                </div>
              ) : (
                <p className="text-sm text-white/80">
                  {new Intl.DateTimeFormat('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(currentTime)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {nextPrayer && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 mb-3 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-emerald-600 text-sm font-semibold mb-1">الصلاة القادمة</p>
            <h2 className="text-2xl font-amiri font-bold text-emerald-800">{nextPrayer.name}</h2>
          </div>
          <div className="text-left">
            <p className="text-xl font-mono font-bold text-emerald-700" dir="ltr">{formatTime12Hour(nextPrayer.time)}</p>
            <p className="text-sm text-emerald-600 mt-1">متبقي: {nextPrayer.diff}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {timings && (Object.keys(PRAYER_NAMES_AR) as Array<keyof PrayerTimes>).map((prayer) => {
          const isNext = nextPrayer?.name === PRAYER_NAMES_AR[prayer];
          const IconComponent = PRAYER_ICONS[prayer].icon;
          
          return (
            <div 
              key={prayer}
              className={`relative overflow-hidden rounded-3xl bg-white shadow-sm border transition-all flex flex-col items-center justify-center p-5 ${
                isNext ? 'border-emerald-400 shadow-emerald-100 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200 hover:shadow-md'
              }`}
            >
              <div className={`relative w-16 h-16 mb-3 rounded-2xl flex items-center justify-center ${PRAYER_ICONS[prayer].bg} ${PRAYER_ICONS[prayer].color}`}>
                <IconComponent className="w-8 h-8" strokeWidth={1.5} />
                {isNext && (
                  <div className="absolute -inset-1 border-2 border-emerald-400 rounded-2xl animate-pulse"></div>
                )}
              </div>
              
              <h3 className={`text-lg font-bold font-amiri mb-1 ${isNext ? 'text-emerald-700' : 'text-slate-700'}`}>
                {PRAYER_NAMES_AR[prayer]}
              </h3>
              
              <p className={`text-xl font-bold font-mono ${isNext ? 'text-emerald-700' : 'text-slate-500'}`} dir="ltr">
                {formatTime12Hour(timings[prayer])}
              </p>

              {isNext && (
                <span className="absolute top-3 right-3 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
