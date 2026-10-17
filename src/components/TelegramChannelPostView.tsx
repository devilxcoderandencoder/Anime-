import React, { useState } from 'react';
import {
  Send,
  Eye,
  Share2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  FileVideo,
  FileText,
} from 'lucide-react';
import { Episode } from '../types';

interface TelegramChannelPostViewProps {
  episode: Episode;
  channelTitle?: string;
}

export const TelegramChannelPostView: React.FC<TelegramChannelPostViewProps> = ({
  episode,
  channelTitle = 'Anime Toon India Official Vault',
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');

  const channelPostLink = `https://t.me/c/${episode.telegramChatId.replace('-100', '')}/${episode.telegramMessageId || 1042}`;

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(episode.channelDescription || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Convert simple markdown-like telegram formatting to styled lines
  const renderFormattedDescription = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Separator line
      if (line.includes('━━━━━━')) {
        return <div key={idx} className="my-2 border-b border-white/10" />;
      }
      // Bold title
      if (line.startsWith('🎬') || line.startsWith('✨') || line.startsWith('⚔️') || line.startsWith('🔮') || line.startsWith('🔥')) {
        return (
          <div key={idx} className="font-bold text-white text-sm my-1 tracking-tight">
            {line.replace(/\*\*/g, '')}
          </div>
        );
      }
      // Section headers
      if (line.startsWith('📖 Episode Synopsis:') || line.startsWith('📖 Synopsis:')) {
        return (
          <div key={idx} className="font-semibold text-orange-400 text-xs mt-3 mb-1">
            {line}
          </div>
        );
      }
      // Hashtags line
      if (line.startsWith('🏷')) {
        const tags = line.replace('🏷', '').trim().split(' ');
        return (
          <div key={idx} className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-white/5">
            {tags.map((tag, tIdx) => (
              <span key={tIdx} className="text-[11px] text-sky-400 hover:text-sky-300 font-mono">
                {tag}
              </span>
            ))}
          </div>
        );
      }
      // Link line
      if (line.startsWith('🔗 Post Link:')) {
        return (
          <div key={idx} className="text-[11px] text-slate-400 my-1 font-mono flex items-center gap-1">
            <span>{line.split('http')[0]}</span>
            <a
              href={channelPostLink}
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 hover:underline flex items-center gap-0.5"
            >
              <span>{channelPostLink}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        );
      }
      // Regular line
      return (
        <div key={idx} className="text-xs text-slate-300 my-0.5 leading-relaxed">
          {line.replace(/\*\*/g, '')}
        </div>
      );
    });
  };

  return (
    <div className="bg-[#0f172a]/90 border border-sky-500/20 rounded-2xl p-5 shadow-xl">
      {/* Telegram Message Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          {/* Channel Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
            ATI
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-white tracking-tight">
                {channelTitle}
              </h4>
              <span title="Verified Release Channel">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Official Release · {episode.telegramPostDate}
            </p>
          </div>
        </div>

        {/* View mode toggle & Copy */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-white/10 text-[11px]">
            <button
              onClick={() => setViewMode('formatted')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'formatted' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileVideo className="w-3 h-3" />
              <span>Formatted</span>
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'raw' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>Full Text</span>
            </button>
          </div>

          <button
            onClick={handleCopyCaption}
            className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-white/10 transition-colors flex items-center gap-1 cursor-pointer"
            title="Copy Description"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Message Bubble */}
      <div className="bg-[#182338] border border-white/10 rounded-xl p-4 font-sans text-xs shadow-inner">
        {viewMode === 'formatted' ? (
          <div>{renderFormattedDescription(episode.channelDescription || '')}</div>
        ) : (
          <pre className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap overflow-x-auto leading-relaxed">
            {episode.channelDescription}
          </pre>
        )}
      </div>

      {/* Release Footer Stats - Cleaned of raw backend details */}
      <div className="mt-3 pt-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 border-t border-white/5">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 tabular-nums">
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>{episode.telegramViews.toLocaleString()} views</span>
          </span>
          <span className="flex items-center gap-1.5 tabular-nums">
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{episode.telegramForwards} shares</span>
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <Check className="w-3 h-3" />
            <span>Verified Official Release</span>
          </span>
        </div>

        <span className="text-xs text-orange-400 font-medium">
          Anime Toon India Community
        </span>
      </div>
    </div>
  );
};
