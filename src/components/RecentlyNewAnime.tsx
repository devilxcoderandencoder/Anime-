import React from 'react';
import { Sparkles, Play, Clock, Star, Film, Volume2 } from 'lucide-react';
import { Anime } from '../types';

interface RecentlyNewAnimeProps {
  animeList: Anime[];
  onSelectAnime: (anime: Anime) => void;
}

export const RecentlyNewAnime: React.FC<RecentlyNewAnimeProps> = ({
  animeList,
  onSelectAnime,
}) => {
  // Filter recently added or airing anime series
  const recentSeries = animeList.filter((a) => a.isRecentlyAdded || a.status === 'Airing');

  return (
    <section className="mb-14">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-orange-600/20 text-orange-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Recently New Anime Series</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">
                Fresh Drops
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Fresh episodes and newly released anime series with multi-audio master streams
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5 self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-orange-400" />
          <span>Daily Fresh Drops</span>
        </div>
      </div>

      {/* Grid of Recently New Anime Series (Thumbnails only, click to open episodes) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {recentSeries.map((anime) => {
          const latestEp = anime.episodes[anime.episodes.length - 1];

          return (
            <div
              key={anime.id}
              onClick={() => onSelectAnime(anime)}
              className="group relative bg-[#0c111d] border border-white/10 hover:border-orange-500/60 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 cursor-pointer flex flex-col justify-between"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-900">
                <img
                  src={anime.posterImage || anime.bannerImage}
                  alt={anime.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c111d] via-black/30 to-transparent" />

                {/* Status / Fresh Pill */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-orange-600 text-[9px] font-black tracking-wider uppercase text-white shadow-md">
                    NEW
                  </span>
                  {anime.seriesType && (
                    <span className="px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-bold text-slate-200 border border-white/10">
                      {anime.seriesType}
                    </span>
                  )}
                </div>

                {/* Rating Badge */}
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-bold text-amber-400 flex items-center gap-0.5 tabular-nums">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{anime.rating}</span>
                </div>

                {/* Drop Time / Latest Ep badge at bottom */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-orange-300 font-semibold truncate">
                    EP {latestEp ? latestEp.episodeNumber : anime.episodes.length}
                  </span>
                  <span className="text-slate-300 bg-black/70 px-1 rounded text-[9px]">
                    {anime.recentlyAddedDate || 'Today'}
                  </span>
                </div>

                {/* Hover Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <div className="w-9 h-9 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-white translate-x-0.5" />
                  </div>
                </div>
              </div>

              {/* Title and Unboxed Information */}
              <div className="p-2.5 flex flex-col justify-between flex-1">
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1 mb-1">
                    {anime.title}
                  </h4>
                  <div className="text-[10px] text-slate-400 line-clamp-1">
                    {anime.audioLangs ? anime.audioLangs[0] : 'Hindi Dubbed'}
                  </div>
                </div>

                <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{anime.episodes.length} Episodes</span>
                  <span className="text-sky-400 font-medium group-hover:underline">View List</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
