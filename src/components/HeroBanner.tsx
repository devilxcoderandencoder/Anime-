import React from 'react';
import { Play, List, Settings, Star, Sparkles } from 'lucide-react';
import { Anime, Episode } from '../types';

interface HeroBannerProps {
  anime: Anime;
  onPlayEpisode: (episode: Episode) => void;
  onSelectAnime: (anime: Anime) => void;
  onOpenTelegramModal?: () => void;
  onOpenSettingsModal?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  anime,
  onPlayEpisode,
  onSelectAnime,
  onOpenSettingsModal,
}) => {
  const firstEpisode = anime.episodes[0];

  return (
    <section className="relative w-full h-[460px] md:h-[540px] rounded-2xl overflow-hidden mb-12 border border-white/10 group">
      {/* Background Image with Fallback */}
      <img
        src={anime.bannerImage}
        alt={anime.title}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
      />

      {/* Measured Scrim for WCAG AA readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-[#090d16]/80 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#090d16]/90 via-[#090d16]/50 to-transparent pointer-events-none" />

      {/* Content Container */}
      <div className="absolute inset-0 p-6 md:p-12 flex flex-col justify-end max-w-3xl">
        {/* Unboxed Metadata Discipline */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-300 mb-2">
          <span className="text-orange-400 font-semibold">{anime.studio}</span>
          <span aria-hidden="true">·</span>
          <span>{anime.year}</span>
          <span aria-hidden="true">·</span>
          <span>{anime.season}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{anime.totalEpisodes} Episodes</span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1 text-amber-400 tabular-nums">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {anime.rating}
          </span>
          <span aria-hidden="true">·</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Hindi Dubbed & Multi-Audio
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-2 text-balance leading-tight">
          {anime.title}
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mb-3 tracking-wide font-normal">
          {anime.japaneseTitle}
        </p>

        {/* Synopsis */}
        <p className="text-sm md:text-base text-slate-300 line-clamp-2 md:line-clamp-3 mb-6 max-w-2xl leading-relaxed">
          {anime.synopsis}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4">
          {firstEpisode && (
            <button
              onClick={() => onPlayEpisode(firstEpisode)}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold rounded-lg flex items-center gap-2.5 transition-all shadow-md hover:shadow-orange-600/30 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Stream Episode 1</span>
            </button>
          )}

          <button
            onClick={() => onSelectAnime(anime)}
            className="px-5 py-3 bg-slate-900/80 hover:bg-slate-800 text-white text-sm font-medium rounded-lg border border-white/10 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <List className="w-4 h-4 text-slate-400" />
            <span>Episode List</span>
          </button>

          {onOpenSettingsModal && (
            <button
              onClick={onOpenSettingsModal}
              className="px-4 py-3 text-xs text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 rounded-lg border border-white/10 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Streaming Settings"
            >
              <Settings className="w-3.5 h-3.5 text-orange-400" />
              <span>Stream Settings</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
