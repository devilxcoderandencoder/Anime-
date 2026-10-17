import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Settings,
  Tv,
  ListVideo,
  Activity,
  ChevronRight,
  Database,
  ExternalLink,
  Sliders,
  Send,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { Anime, Episode, QualityVariant } from '../types';
import { TelegramChannelPostView } from './TelegramChannelPostView';

interface VideoPlayerProps {
  anime: Anime;
  currentEpisode: Episode;
  onSelectEpisode: (episode: Episode) => void;
  onOpenTelegramModal?: () => void;
  onOpenDiagnosticsModal?: () => void;
  onOpenSettingsModal?: () => void;
  onClose?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  anime,
  currentEpisode,
  onSelectEpisode,
  onOpenTelegramModal,
  onOpenDiagnosticsModal,
  onOpenSettingsModal,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(currentEpisode.durationSeconds || 1440);
  const [bufferedPercent, setBufferedPercent] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isTheater, setIsTheater] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [audioTrack, setAudioTrack] = useState<'hindi' | 'sub' | 'dub'>('hindi');
  const [subtitlesEnabled, setSubtitlesEnabled] = useState<boolean>(true);
  const [showInspector, setShowInspector] = useState<boolean>(false);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState<boolean>(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);
  const [showResolutionMenu, setShowResolutionMenu] = useState<boolean>(false);
  const [showChannelDescription, setShowChannelDescription] = useState<boolean>(true);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [streamBytesRange, setStreamBytesRange] = useState<string>('bytes 0-1048576/48921040');
  const [streamLatency, setStreamLatency] = useState<number>(18);
  const [qualityToast, setQualityToast] = useState<string | null>(null);

  // Active resolution quality (1080p, 720p, 480p, 360p)
  const [selectedQuality, setSelectedQuality] = useState<'1080p' | '720p' | '480p' | '360p'>('1080p');

  // Video stream source URL with selected quality parameter
  const streamSrc = `/api/stream/${currentEpisode.id}?quality=${selectedQuality}`;

  // Time format helper
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Seamless resolution change handler
  const handleQualityChange = (newQuality: '1080p' | '720p' | '480p' | '360p') => {
    if (newQuality === selectedQuality) {
      setShowResolutionMenu(false);
      return;
    }

    const savedTime = videoRef.current ? videoRef.current.currentTime : currentTime;
    const wasPlaying = videoRef.current ? !videoRef.current.paused : false;

    setSelectedQuality(newQuality);
    setShowResolutionMenu(false);

    // Toast feedback
    setQualityToast(`Video resolution changed to ${newQuality}`);
    setTimeout(() => setQualityToast(null), 3000);

    // Restore playback position on video load
    const restorePlayback = () => {
      if (videoRef.current) {
        videoRef.current.currentTime = savedTime;
        if (wasPlaying) {
          videoRef.current.play().catch(() => {});
        }
        videoRef.current.removeEventListener('loadedmetadata', restorePlayback);
      }
    };

    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.addEventListener('loadedmetadata', restorePlayback);
      }
    }, 50);
  };

  // Video controls
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      const approxByte = Math.floor((newTime / (duration || 1)) * currentEpisode.fileSize);
      setStreamBytesRange(`bytes ${approxByte}-${approxByte + 2097152}/${currentEpisode.fileSize}`);
      setStreamLatency(Math.floor(12 + Math.random() * 20));
    }
  };

  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(Math.max(videoRef.current.currentTime + seconds, 0), duration);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSettingsMenu(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Next Episode logic
  const currentIndex = anime.episodes.findIndex((e) => e.id === currentEpisode.id);
  const nextEpisode = currentIndex !== -1 && currentIndex < anime.episodes.length - 1 ? anime.episodes[currentIndex + 1] : null;

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowleft':
        case 'j':
          e.preventDefault();
          handleSkip(-10);
          break;
        case 'arrowright':
        case 'l':
          e.preventDefault();
          handleSkip(10);
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume((v) => {
            const next = Math.min(v + 0.1, 1);
            if (videoRef.current) videoRef.current.volume = next;
            return next;
          });
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume((v) => {
            const next = Math.max(v - 0.1, 0);
            if (videoRef.current) videoRef.current.volume = next;
            return next;
          });
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 't':
          e.preventDefault();
          setIsTheater((th) => !th);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, duration]);

  // Buffer calculation listener
  const handleProgress = () => {
    if (!videoRef.current) return;
    const buf = videoRef.current.buffered;
    if (buf.length > 0 && duration > 0) {
      const end = buf.end(buf.length - 1);
      setBufferedPercent((end / duration) * 100);
    }
  };

  const qualitiesAvailable: QualityVariant[] = currentEpisode.qualities || [
    { quality: '1080p', label: '1080p (Full HD 60fps)', resolution: '1920x1080', fileSize: currentEpisode.fileSize, bitrate: '4,500 kbps', telegramFileId: currentEpisode.telegramFileId, streamUrl: '' },
    { quality: '720p', label: '720p (HD 60fps)', resolution: '1280x720', fileSize: Math.round(currentEpisode.fileSize * 0.62), bitrate: '2,600 kbps', telegramFileId: currentEpisode.telegramFileId, streamUrl: '' },
    { quality: '480p', label: '480p (SD Standard)', resolution: '854x480', fileSize: Math.round(currentEpisode.fileSize * 0.36), bitrate: '1,200 kbps', telegramFileId: currentEpisode.telegramFileId, streamUrl: '' },
    { quality: '360p', label: '360p (Data Saver)', resolution: '640x360', fileSize: Math.round(currentEpisode.fileSize * 0.22), bitrate: '650 kbps', telegramFileId: currentEpisode.telegramFileId, streamUrl: '' },
  ];

  return (
    <div className={`w-full mb-10 transition-all ${isTheater ? 'max-w-none' : 'max-w-7xl mx-auto'}`}>
      {/* Player Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span className="text-orange-400 font-semibold">{anime.title}</span>
            <span aria-hidden="true">·</span>
            <span>Season 1</span>
            <span aria-hidden="true">·</span>
            <span>Episode {currentEpisode.episodeNumber}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3" />
              HD Multi-Audio
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <span>Ep {currentEpisode.episodeNumber}: {currentEpisode.title}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-orange-600/30 text-orange-400 border border-orange-500/30 font-mono">
              {selectedQuality}
            </span>
          </h2>
        </div>

        {/* Action Controls next to header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowChannelDescription(!showChannelDescription)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer ${
              showChannelDescription
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                : 'bg-slate-900/80 text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Episode Synopsis & Notes</span>
          </button>

          {onOpenSettingsModal && (
            <button
              onClick={onOpenSettingsModal}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border bg-slate-900/80 text-slate-400 border-white/10 hover:text-white hover:border-orange-500/40 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Stream & Video Settings"
            >
              <Settings className="w-3.5 h-3.5 text-orange-400" />
              <span>Settings</span>
            </button>
          )}

          <button
            onClick={() => setShowEpisodeDrawer(!showEpisodeDrawer)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer ${
              showEpisodeDrawer
                ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                : 'bg-slate-900/80 text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            <ListVideo className="w-3.5 h-3.5" />
            <span>Episodes ({anime.episodes.length})</span>
          </button>
        </div>
      </div>

      {/* Main Video Box */}
      <div
        ref={containerRef}
        className="relative bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 aspect-video group"
      >
        <video
          ref={videoRef}
          src={streamSrc}
          className="w-full h-full object-contain"
          onTimeUpdate={() => {
            if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
          }}
          onDurationChange={() => {
            if (videoRef.current) setDuration(videoRef.current.duration);
          }}
          onProgress={handleProgress}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => {
            setIsBuffering(false);
            setIsPlaying(true);
          }}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            if (nextEpisode) onSelectEpisode(nextEpisode);
          }}
          playsInline
        />

        {/* Quality Switch Toast Banner */}
        {qualityToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-orange-600/90 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{qualityToast}</span>
          </div>
        )}

        {/* Buffering Indicator */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
            <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Big Center Play/Pause click zone */}
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
        >
          {!isPlaying && !isBuffering && (
            <div className="w-20 h-20 rounded-full bg-orange-600/90 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <Play className="w-8 h-8 fill-white translate-x-0.5" />
            </div>
          )}
        </div>

        {/* Telemetry Overlay */}
        {showInspector && (
          <div className="absolute top-4 left-4 z-30 bg-[#090d16]/95 border border-sky-500/40 rounded-xl p-4 text-xs font-mono max-w-sm backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
              <span className="font-semibold text-sky-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                Streaming Telemetry
              </span>
              <span className="text-[10px] text-slate-500 tabular-nums">HTTP 206</span>
            </div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Active Quality:</span>
                <span className="text-orange-400 font-bold">{selectedQuality}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Storage Backend:</span>
                <span className="text-emerald-400">Telegram Private Channel</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Channel ID:</span>
                <span className="text-slate-200 tabular-nums">{currentEpisode.telegramChatId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">TG File ID:</span>
                <span className="text-slate-300 truncate max-w-[170px]" title={currentEpisode.telegramFileId}>
                  {currentEpisode.telegramFileId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Protocol:</span>
                <span className="text-sky-300">206 Partial Content (Range)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Buffer Loaded:</span>
                <span className="text-orange-400 tabular-nums">{bufferedPercent.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Seeking Latency:</span>
                <span className="text-emerald-400 tabular-nums">{streamLatency} ms</span>
              </div>
            </div>
          </div>
        )}

        {/* Video Controls Bar - Bottom */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 transition-opacity duration-300 group-hover:opacity-100 opacity-95">
          {/* Progress / Scrub Bar */}
          <div className="relative mb-3 flex items-center group/scrubber cursor-pointer">
            <div className="w-full h-1.5 bg-slate-700/60 rounded-full overflow-hidden relative">
              <div
                className="absolute left-0 top-0 bottom-0 bg-slate-500/50 transition-all duration-200"
                style={{ width: `${bufferedPercent}%` }}
              />
              <div
                className="absolute left-0 top-0 bottom-0 bg-orange-500"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between gap-4">
            {/* Left Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="text-white hover:text-orange-400 transition-colors cursor-pointer"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
              </button>

              <button
                onClick={() => handleSkip(-10)}
                className="text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Rewind 10s"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleSkip(10)}
                className="text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Forward 10s"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Mute / Unmute"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-slate-600 rounded-lg accent-orange-500 cursor-pointer hidden sm:block"
                />
              </div>

              {/* Time display */}
              <div className="text-xs font-mono text-slate-300 tabular-nums ml-2">
                <span>{formatTime(currentTime)}</span>
                <span className="text-slate-500 mx-1">/</span>
                <span className="text-slate-400">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3 text-xs">
              {/* VIDEO RESOLUTION SELECTOR (USER REQUIREMENT) */}
              <div className="relative">
                <button
                  onClick={() => setShowResolutionMenu(!showResolutionMenu)}
                  className="px-2.5 py-1 rounded bg-slate-800/90 hover:bg-slate-700 text-white font-mono text-[11px] font-bold border border-white/15 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Change Video Resolution"
                >
                  <Sliders className="w-3 h-3 text-orange-400" />
                  <span>{selectedQuality}</span>
                </button>

                {showResolutionMenu && (
                  <div className="absolute right-0 bottom-9 bg-[#0b0f17] border border-white/20 rounded-xl p-2 w-56 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-white/10 mb-1">
                      Video Resolution
                    </div>
                    <div className="space-y-1">
                      {qualitiesAvailable.map((q) => {
                        const isCurrent = selectedQuality === q.quality;
                        return (
                          <button
                            key={q.quality}
                            onClick={() => handleQualityChange(q.quality)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                              isCurrent
                                ? 'bg-orange-600 text-white font-semibold'
                                : 'text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <div>
                              <div className="font-mono font-medium">{q.label}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {q.resolution} · {q.bitrate}
                              </div>
                            </div>
                            {isCurrent && <span className="text-[10px] font-bold">ACTIVE</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Sub / Dub Selector with Hindi Dub */}
              <div className="hidden sm:flex items-center bg-slate-800/80 rounded-md p-0.5 border border-white/10">
                <button
                  onClick={() => setAudioTrack('hindi')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    audioTrack === 'hindi' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Hindi Dubbed Audio"
                >
                  HI Dub
                </button>
                <button
                  onClick={() => setAudioTrack('sub')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    audioTrack === 'sub' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Japanese with English Subtitles"
                >
                  JP Sub
                </button>
                <button
                  onClick={() => setAudioTrack('dub')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    audioTrack === 'dub' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="English Dubbed Audio"
                >
                  EN Dub
                </button>
              </div>

              {/* Subtitles Toggle */}
              <button
                onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
                className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                  subtitlesEnabled
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
                title="Toggle Subtitles"
              >
                CC
              </button>

              {/* Playback Speed */}
              <div className="relative">
                <button
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer p-1"
                  title="Playback Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {showSettingsMenu && (
                  <div className="absolute right-0 bottom-8 bg-[#090d16] border border-white/15 rounded-lg p-2 w-44 shadow-2xl z-40">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 px-2">
                      Playback Speed
                    </p>
                    <div className="grid grid-cols-3 gap-1 mb-2">
                      {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => handleSpeedChange(spd)}
                          className={`text-center py-1 rounded text-xs tabular-nums cursor-pointer ${
                            playbackRate === spd
                              ? 'bg-orange-600 text-white font-semibold'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Next Episode Button */}
              {nextEpisode && (
                <button
                  onClick={() => onSelectEpisode(nextEpisode)}
                  className="hidden md:flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs transition-colors cursor-pointer"
                  title={`Next: Ep ${nextEpisode.episodeNumber}`}
                >
                  <span>Next Ep</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Theater Mode */}
              <button
                onClick={() => setIsTheater(!isTheater)}
                className="text-slate-300 hover:text-white transition-colors cursor-pointer hidden md:block"
                title="Theater Mode (T)"
              >
                <Tv className="w-4 h-4" />
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Fullscreen (F)"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Under-player Stream Status Bar */}
      <div className="mt-3 bg-slate-900/60 border border-white/10 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs mb-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-orange-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Full HD Master</span>
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-300 font-mono font-medium">
            Resolution: <span className="text-orange-400 font-bold">{selectedQuality}</span>
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">
            Audio: <span className="text-emerald-400 font-medium">{audioTrack === 'hindi' ? 'Hindi Dubbed' : audioTrack === 'sub' ? 'Japanese Sub' : 'English Dub'}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Fast Streaming Active
          </span>
          {onOpenSettingsModal && (
            <button
              onClick={onOpenSettingsModal}
              className="text-orange-400 hover:text-orange-300 font-medium cursor-pointer flex items-center gap-1"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Streaming Settings</span>
            </button>
          )}
        </div>
      </div>

      {/* EPISODE SYNOPSIS & RELEASE NOTES DISPLAY */}
      {showChannelDescription && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Official Episode Synopsis & Notes
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              Anime Toon India Official Vault
            </span>
          </div>
          <TelegramChannelPostView
            episode={currentEpisode}
            channelTitle="Anime Toon India Official"
          />
        </div>
      )}
    </div>
  );
};
