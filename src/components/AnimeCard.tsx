import React from 'react';
import { Star, ListVideo, Sparkles } from 'lucide-react';
import { Anime } from '../types';

interface AnimeCardProps {
  anime: Anime;
  onSelect: (anime: Anime) => void;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({
  anime,
  onSelect,
}) => {
  return (
    <div
      onClick={() => onSelect(anime)}
      className="group bg-[#0d131f] rounded-xl overflow-hidden border border-white/10 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-black/60 cursor-pointer flex flex-col justify-between"
    >
      {/* Poster Image with measured Scrim */}
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-800">
        <img
          src={anime.posterImage || anime.bannerImage}
          alt={anime.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs font-semibold">
          <span className="px-2 py-0.5 rounded bg-orange-600/90 text-white text-[10px] font-bold backdrop-blur-sm">
            {anime.audioLangs ? anime.audioLangs[0] : 'Hindi Dub'}
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/80 text-amber-400 text-[11px] backdrop-blur-sm tabular-nums">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {anime.rating}
          </span>
        </div>

        {/* Hover View Episodes Indicator */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          <div className="px-4 py-2 rounded-lg bg-orange-600 text-white text-xs font-semibold flex items-center gap-2 shadow-lg transform group-hover:scale-105 transition-transform">
            <ListVideo className="w-4 h-4" />
            <span>View Episodes ({anime.episodes.length})</span>
          </div>
        </div>

        {/* Bottom Title on Image */}
        <div className="absolute bottom-2.5 left-3 right-3">
          <h4 className="text-sm font-bold text-white tracking-tight line-clamp-1 group-hover:text-orange-400 transition-colors">
            {anime.title}
          </h4>
          <p className="text-[10px] text-slate-300 line-clamp-1">
            {anime.japaneseTitle}
          </p>
        </div>
      </div>

      {/* Content Metadata */}
      <div className="p-3.5 flex flex-col justify-between flex-1">
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
          {anime.synopsis}
        </p>

        {/* Unboxed Metadata Discipline */}
        <div className="pt-2 border-t border-white/5 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{anime.studio}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums font-semibold text-orange-400">
              {anime.episodes.length} Episodes
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <Sparkles className="w-3 h-3" />
              <span>Full HD 1080p</span>
            </span>
            <span className="text-slate-400 font-mono">{anime.year}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
