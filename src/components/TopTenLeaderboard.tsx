import React, { useState } from 'react';
import { Trophy, TrendingUp, Eye, Star, Flame, Sparkles } from 'lucide-react';
import { Anime } from '../types';

interface TopTenLeaderboardProps {
  animeList: Anime[];
  onSelectAnime: (anime: Anime) => void;
}

export const TopTenLeaderboard: React.FC<TopTenLeaderboardProps> = ({
  animeList,
  onSelectAnime,
}) => {
  const [timeframe, setTimeframe] = useState<'today' | 'month' | 'week' | 'all'>('today');
  const [typeFilter, setTypeFilter] = useState<'all' | 'tv' | 'movie' | 'dub'>('all');

  // Filter by type
  const typeFilteredAnime = animeList.filter((anime) => {
    if (typeFilter === 'tv') return anime.seriesType === 'TV' || !anime.seriesType;
    if (typeFilter === 'movie') return anime.seriesType === 'Movie';
    if (typeFilter === 'dub') return anime.audioLangs?.some((l) => l.toLowerCase().includes('hindi'));
    return true;
  });

  // Sort by selected timeframe
  const sortedAnime = [...typeFilteredAnime].sort((a, b) => {
    if (timeframe === 'today') return a.rankToday - b.rankToday;
    if (timeframe === 'month') return a.rankMonth - b.rankMonth;
    if (timeframe === 'week') return a.rankWeek - b.rankWeek;
    return a.rankAll - b.rankAll;
  }).slice(0, 10);

  const getTimeframeLabel = () => {
    switch (timeframe) {
      case 'today':
        return 'Today';
      case 'month':
        return 'This Month';
      case 'week':
        return 'This Week';
      case 'all':
        return 'All Time';
    }
  };

  const getTypeLabel = () => {
    switch (typeFilter) {
      case 'tv':
        return 'TV Series';
      case 'movie':
        return 'Movies';
      case 'dub':
        return 'Hindi Dubbed';
      default:
        return 'All Types';
    }
  };

  const getViews = (anime: Anime) => {
    switch (timeframe) {
      case 'today':
        return anime.viewsToday;
      case 'month':
        return anime.viewsMonth;
      case 'week':
        return anime.viewsWeek;
      case 'all':
        return anime.viewsAll;
    }
  };

  return (
    <section className="mb-14">
      {/* Header with Title and Timeframe & Type Selectors */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Top 10 in India</span>
              <span className="text-xs text-orange-400 font-mono font-medium">({getTimeframeLabel()} · {getTypeLabel()})</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Top ranked anime in India with authentic Telegram private channel episode vault
          </p>
        </div>

        {/* Dual Filter Controls: Timeframe + Type */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                typeFilter === 'all'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('tv')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                typeFilter === 'tv'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              TV
            </button>
            <button
              onClick={() => setTypeFilter('movie')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                typeFilter === 'movie'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setTypeFilter('dub')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                typeFilter === 'dub'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hindi Dub
            </button>
          </div>

          {/* Timeframe Filter Tabs (Today, Month, Week, All) */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setTimeframe('today')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                timeframe === 'today'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                timeframe === 'month'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeframe('week')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                timeframe === 'week'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                timeframe === 'all'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Top 10 Horizontal Grid / Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
        {sortedAnime.map((anime, index) => {
          const rank = index + 1;
          const isTopThree = rank <= 3;

          return (
            <div
              key={anime.id}
              onClick={() => onSelectAnime(anime)}
              className="group relative bg-[#0d131f] border border-white/10 hover:border-orange-500/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 cursor-pointer flex flex-col justify-between"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-800">
                <img
                  src={anime.posterImage || anime.bannerImage}
                  alt={anime.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Scrim Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Prominent Rank Badge */}
                <div
                  className={`absolute top-2 left-2 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black font-mono shadow-lg tabular-nums ${
                    rank === 1
                      ? 'bg-amber-500 text-black ring-2 ring-amber-300'
                      : rank === 2
                      ? 'bg-slate-200 text-black'
                      : rank === 3
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-900/90 text-slate-300 border border-white/10'
                  }`}
                >
                  {rank.toString().padStart(2, '0')}
                </div>

                {/* Rating Badge */}
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-bold text-amber-400 flex items-center gap-0.5 tabular-nums">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{anime.rating}</span>
                </div>

                {/* Views Pill on Image */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-slate-300 font-mono">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Eye className="w-3 h-3 text-slate-400" />
                    <span>{getViews(anime)}</span>
                  </span>
                  <span className="text-orange-400 font-semibold">
                    {anime.episodes.length} Eps
                  </span>
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="p-2.5 flex flex-col justify-between flex-1">
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1 mb-1">
                    {anime.title}
                  </h4>
                  {/* Unboxed Metadata */}
                  <div className="text-[10px] text-slate-400 line-clamp-1">
                    {anime.audioLangs ? anime.audioLangs[0] : 'Hindi Dubbed'}
                  </div>
                </div>

                <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{anime.year}</span>
                  <span className="text-sky-400 font-medium">Click for Episodes</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
