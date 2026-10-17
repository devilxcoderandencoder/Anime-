import React from 'react';
import { Play, Database, CheckCircle2 } from 'lucide-react';
import { Anime, Episode } from '../types';

interface EpisodeGridProps {
  anime: Anime;
  currentEpisodeId?: string;
  onPlayEpisode: (episode: Episode) => void;
  onOpenUploadModal?: () => void;
}

export const EpisodeGrid: React.FC<EpisodeGridProps> = ({
  anime,
  currentEpisodeId,
  onPlayEpisode,
  onOpenUploadModal,
}) => {
  return (
    <section className="mb-14">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-white">
            Available Episodes ({anime.episodes.length})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Stored in Telegram Private Channel: <span className="font-mono text-slate-300">{anime.telegramChannel}</span>
          </p>
        </div>

        {onOpenUploadModal && (
          <button
            onClick={onOpenUploadModal}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-white/10 transition-colors cursor-pointer flex items-center gap-2"
          >
            <Database className="w-3.5 h-3.5 text-orange-400" />
            <span>Upload Episode to Channel</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {anime.episodes.map((ep) => {
          const isCurrent = ep.id === currentEpisodeId;

          return (
            <div
              key={ep.id}
              onClick={() => onPlayEpisode(ep)}
              className={`group bg-slate-900/60 rounded-xl overflow-hidden border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isCurrent
                  ? 'border-orange-500 shadow-lg shadow-orange-500/10 ring-1 ring-orange-500'
                  : 'border-white/10 hover:border-white/25 hover:bg-slate-900'
              }`}
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-800">
                <img
                  src={ep.thumbnail || anime.bannerImage}
                  alt={ep.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Scrim Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Duration indicator */}
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[11px] font-mono tabular-nums text-slate-300">
                  {ep.duration}
                </div>

                {/* Episode Number */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-xs font-bold text-white tabular-nums">
                  EP {ep.episodeNumber}
                </div>

                {/* Hover Play Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                  <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-white translate-x-0.5" />
                  </div>
                </div>

                {isCurrent && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>PLAYING</span>
                  </div>
                )}
              </div>

              {/* Episode Metadata */}
              <div className="p-3.5 flex flex-col justify-between flex-1">
                <div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors line-clamp-1 mb-1">
                    {ep.title}
                  </h4>
                  {/* Unboxed Metadata */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-2">
                    <span>{ep.resolution}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{(ep.fileSize / (1024 * 1024)).toFixed(1)} MB</span>
                    <span aria-hidden="true">·</span>
                    <span>{ep.uploadDate}</span>
                  </div>
                </div>

                {/* Telegram File Reference Bar */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1 text-sky-400">
                    <Database className="w-3 h-3" />
                    <span>TG Vault</span>
                  </span>
                  <span className="truncate max-w-[130px] tabular-nums" title={ep.telegramFileId}>
                    {ep.telegramFileId.slice(0, 14)}...
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
