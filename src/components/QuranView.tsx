import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, BookOpen } from 'lucide-react';
import { Surah, SurahDetails } from '../types';

export default function QuranView() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<SurahDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [surahLoading, setSurahLoading] = useState(false);

  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/surah')
      .then((res) => res.json())
      .then((data) => {
        setSurahs(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const loadSurah = (number: number) => {
    setSurahLoading(true);
    fetch(`https://api.alquran.cloud/v1/surah/${number}/quran-uthmani`)
      .then((res) => res.json())
      .then((data) => {
        setSelectedSurah(data.data);
        setSurahLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch((err) => {
        console.error(err);
        setSurahLoading(false);
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (selectedSurah) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className=""
      >
        <button
          onClick={() => setSelectedSurah(null)}
          className="flex items-center text-emerald-700 font-semibold mb-6 hover:text-emerald-800 transition-colors"
        >
          <ChevronRight className="w-5 h-5 ml-1" />
          العودة للقائمة
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 md:p-10 text-center">
          <div className="mb-8 border-b border-emerald-100 pb-6">
            <h2 className="text-3xl md:text-4xl font-amiri text-emerald-800 mb-2">
              {selectedSurah.name}
            </h2>
            <p className="text-slate-500">
              آياتها {selectedSurah.numberOfAyahs} • {selectedSurah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
            </p>
          </div>

          {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
            <div className="text-2xl md:text-3xl font-amiri text-emerald-700 mb-8 text-center">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
          )}

          <div className="text-justify" dir="rtl">
            {selectedSurah.ayahs.map((ayah) => {
              // Remove Bismillah from the first ayah if it's not Surah Al-Fatihah
              let text = ayah.text;
              if (selectedSurah.number !== 1 && ayah.numberInSurah === 1 && text.startsWith('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ')) {
                text = text.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ', '');
              }

              return (
                <span key={ayah.number} className="text-xl md:text-2xl font-amiri leading-loose inline">
                  {text}
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-emerald-300 text-emerald-600 text-sm mx-2 font-cairo">
                    {ayah.numberInSurah}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className=""
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center">
          <BookOpen className="w-6 h-6 ml-2 text-emerald-600" />
          القرآن الكريم
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {surahs.map((surah) => (
          <button
            key={surah.number}
            onClick={() => loadSurah(surah.number)}
            className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-emerald-300 hover:shadow-md transition-all text-right group"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm ml-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                {surah.number}
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800 font-amiri">{surah.name}</h3>
                <p className="text-xs text-slate-500">{surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • {surah.numberOfAyahs} آية</p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-emerald-600">{surah.englishName}</p>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
