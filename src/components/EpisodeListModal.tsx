import React, { useState } from 'react';
import {
  X,
  Play,
  Star,
  Database,
  Calendar,
  Layers,
  Sparkles,
  Volume2,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Anime, Episode } from '../types';
import { TelegramChannelPostView } from './TelegramChannelPostView';

interface EpisodeListModalProps {
  anime: Anime | null;
  isOpen: boolean;
  onClose: () => void;
  onPlayEpisode: (episode: Episode) => void;
  currentPlayingEpId?: string;
}

export const EpisodeListModal: React.FC<EpisodeListModalProps> = ({
  anime,
  isOpen,
  onClose,
  onPlayEpisode,
  currentPlayingEpId,
}) => {
  const [expandedEpDescriptionId, setExpandedEpDescriptionId] = useState<string | null>(null);

  if (!isOpen || !anime) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0b101b] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Banner Header */}
        <div className="relative h-48 sm:h-64 w-full overflow-hidden shrink-0">
          <img
            src={anime.bannerImage || anime.posterImage}
            alt={anime.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b101b] via-[#0b101b]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b101b]/90 via-[#0b101b]/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-slate-300 hover:text-white flex items-center justify-center border border-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Anime Title & Quick Info on Header */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mb-1">
              <span className="text-orange-400 font-semibold">{anime.studio}</span>
              <span aria-hidden="true">·</span>
              <span>{anime.year}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {anime.rating}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-sky-400">Telegram Cloud Vault</span>
            </div>

            <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {anime.title}
            </h2>
            <p className="text-xs text-slate-400">{anime.japaneseTitle}</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Audio Languages and Synopsis */}
          <div className="flex flex-col md:flex-row gap-4 items-start justify-between pb-4 border-b border-white/10">
            <div className="max-w-2xl">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Synopsis
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {anime.synopsis}
              </p>
            </div>

            {/* Audio & Dubbing Options */}
            <div className="bg-slate-900/80 border border-white/10 p-3 rounded-xl shrink-0 w-full md:w-64">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-400 mb-2">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Available Audio Tracks</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(anime.audioLangs || ['Hindi Dubbed', 'Japanese Sub', 'English Dub']).map((lang, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-200 font-medium"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Episode List Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Select Episode to Stream</span>
                <span className="text-xs font-mono text-orange-400">
                  ({anime.episodes.length} Episodes Available)
                </span>
              </h3>
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Full HD & Hindi Dubbed</span>
              </span>
            </div>

            {/* Episodes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {anime.episodes.map((ep) => {
                const isPlaying = ep.id === currentPlayingEpId;

                return (
                  <div
                    key={ep.id}
                    onClick={() => {
                      onPlayEpisode(ep);
                      onClose();
                    }}
                    className={`group bg-slate-900/80 rounded-xl overflow-hidden border transition-all cursor-pointer flex flex-col justify-between ${
                      isPlaying
                        ? 'border-orange-500 ring-1 ring-orange-500 bg-orange-950/20 shadow-lg'
                        : 'border-white/10 hover:border-orange-500/50 hover:bg-slate-900'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-800">
                      <img
                        src={ep.thumbnail || anime.bannerImage}
                        alt={ep.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                      {/* Episode Badge */}
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-xs font-bold text-white tabular-nums">
                        EP {ep.episodeNumber}
                      </div>

                      {/* Duration */}
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono tabular-nums text-slate-300">
                        {ep.duration}
                      </div>

                      {/* Hover Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                        <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-white translate-x-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="p-3 flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <h5 className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                            {ep.title}
                          </h5>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <span className="text-orange-400 font-semibold">{ep.resolution}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{(ep.fileSize / (1024 * 1024)).toFixed(1)} MB</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-400 font-medium">{ep.qualities?.length || 4} Resolutions</span>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                          <Sparkles className="w-3 h-3" />
                          <span>Fast Stream</span>
                        </span>

                        {/* View Description / Notes Toggle */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedEpDescriptionId(
                              expandedEpDescriptionId === ep.id ? null : ep.id
                            );
                          }}
                          className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-500/20 cursor-pointer"
                        >
                          <FileText className="w-3 h-3" />
                          <span>{expandedEpDescriptionId === ep.id ? 'Hide Notes' : 'Episode Notes'}</span>
                          {expandedEpDescriptionId === ep.id ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      {/* Expandable Authentic Release Description */}
                      {expandedEpDescriptionId === ep.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="mt-3 pt-3 border-t border-white/10 animate-in fade-in duration-200"
                        >
                          <TelegramChannelPostView
                            episode={ep}
                            channelTitle="Anime Toon India Official"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
