import React, { useState } from 'react';
import {
  X,
  Settings,
  Sliders,
  Volume2,
  Tv,
  Bell,
  Check,
  Shield,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export interface UserSettings {
  defaultQuality: '1080p' | '720p' | '480p' | '360p' | 'auto';
  preferredAudio: 'hindi' | 'sub' | 'dub';
  autoplayNext: boolean;
  theaterModeDefault: boolean;
  subtitlesDefault: boolean;
  subtitleSize: 'small' | 'medium' | 'large';
  notifyHindiDrops: boolean;
  notifyAllEpisodes: boolean;
  notificationSound: boolean;
  fastSeekSeconds: number;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  defaultQuality: '1080p',
  preferredAudio: 'hindi',
  autoplayNext: true,
  theaterModeDefault: false,
  subtitlesDefault: true,
  subtitleSize: 'medium',
  notifyHindiDrops: true,
  notifyAllEpisodes: true,
  notificationSound: true,
  fastSeekSeconds: 10,
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
  onOpenAdvancedBackendModal?: () => void;
  onOpenAdminPanel?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onOpenAdvancedBackendModal,
  onOpenAdminPanel,
}) => {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [activeTab, setActiveTab] = useState<'playback' | 'audio' | 'notifications' | 'display'>('playback');
  const [showAdvancedVaultToggle, setShowAdvancedVaultToggle] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Sync when modal opens
  React.useEffect(() => {
    setLocalSettings(settings);
    setIsSaved(false);
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(localSettings);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_USER_SETTINGS);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0b101b] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600/20 text-orange-400 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Streaming & App Settings
              </h3>
              <p className="text-xs text-slate-400">
                Personalize resolution, Hindi audio, playback and alert preferences
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-white/10 bg-slate-950/40 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('playback')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'playback'
                ? 'border-orange-500 text-orange-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Resolution & Playback</span>
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'audio'
                ? 'border-orange-500 text-orange-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Audio & Dubbing</span>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'notifications'
                ? 'border-orange-500 text-orange-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Notifications</span>
          </button>
          <button
            onClick={() => setActiveTab('display')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'display'
                ? 'border-orange-500 text-orange-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Player Display</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-200">
          {/* TAB 1: PLAYBACK & RESOLUTION */}
          {activeTab === 'playback' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Default Streaming Resolution
                </label>
                <p className="text-[11px] text-slate-400 mb-2.5">
                  Choose your preferred video quality. High-efficiency streaming adapts automatically.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: '1080p', label: '1080p FHD', desc: 'Crisp Full HD' },
                    { id: '720p', label: '720p HD', desc: 'Balanced HD' },
                    { id: '480p', label: '480p SD', desc: 'Standard' },
                    { id: '360p', label: '360p Saver', desc: 'Data Saver' },
                    { id: 'auto', label: 'Auto (Adaptive)', desc: 'Network smart' },
                  ].map((res) => (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() =>
                        setLocalSettings({ ...localSettings, defaultQuality: res.id as any })
                      }
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        localSettings.defaultQuality === res.id
                          ? 'border-orange-500 bg-orange-950/30 text-white ring-1 ring-orange-500'
                          : 'border-white/10 bg-slate-900/60 hover:bg-slate-900 text-slate-300'
                      }`}
                    >
                      <p className="font-bold text-xs">{res.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{res.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Autoplay Next Episode */}
              <div className="flex items-center justify-between p-3.5 bg-slate-900/60 rounded-xl border border-white/10">
                <div>
                  <h4 className="font-semibold text-white">Autoplay Next Episode</h4>
                  <p className="text-[11px] text-slate-400">
                    Automatically loads the next episode when current episode finishes
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.autoplayNext}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, autoplayNext: e.target.checked })
                  }
                  className="w-4 h-4 accent-orange-600 rounded cursor-pointer"
                />
              </div>

              {/* Fast Seek Interval */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Skip / Seek Duration
                </label>
                <div className="flex items-center gap-2">
                  {[5, 10, 15, 30].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setLocalSettings({ ...localSettings, fastSeekSeconds: sec })}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium cursor-pointer transition-colors ${
                        localSettings.fastSeekSeconds === sec
                          ? 'border-orange-500 bg-orange-600 text-white'
                          : 'border-white/10 bg-slate-900/80 text-slate-300 hover:text-white'
                      }`}
                    >
                      {sec} seconds
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUDIO & DUBBING */}
          {activeTab === 'audio' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Preferred Audio Track
                </label>
                <p className="text-[11px] text-slate-400 mb-2.5">
                  Automatically selected when streaming multi-audio master files.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: 'hindi',
                      label: 'Hindi Dubbed (Recommended)',
                      sub: 'Official Hindi voice-over tracks',
                    },
                    {
                      id: 'sub',
                      label: 'Japanese with English Sub',
                      sub: 'Original studio audio + subtitles',
                    },
                    {
                      id: 'dub',
                      label: 'English Dubbed',
                      sub: 'International English audio',
                    },
                  ].map((track) => (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() =>
                        setLocalSettings({ ...localSettings, preferredAudio: track.id as any })
                      }
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        localSettings.preferredAudio === track.id
                          ? 'border-orange-500 bg-orange-950/30 text-white ring-1 ring-orange-500'
                          : 'border-white/10 bg-slate-900/60 hover:bg-slate-900 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{track.label}</span>
                        {localSettings.preferredAudio === track.id && (
                          <Check className="w-3.5 h-3.5 text-orange-400" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">{track.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subtitles toggle */}
              <div className="flex items-center justify-between p-3.5 bg-slate-900/60 rounded-xl border border-white/10">
                <div>
                  <h4 className="font-semibold text-white">Default Subtitles</h4>
                  <p className="text-[11px] text-slate-400">
                    Display synchronized closed captions on supported episodes
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.subtitlesDefault}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, subtitlesDefault: e.target.checked })
                  }
                  className="w-4 h-4 accent-orange-600 rounded cursor-pointer"
                />
              </div>

              {/* Subtitle Font Size */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Subtitle Size
                </label>
                <div className="flex items-center gap-2">
                  {(['small', 'medium', 'large'] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setLocalSettings({ ...localSettings, subtitleSize: sz })}
                      className={`px-3.5 py-1.5 rounded-lg border text-xs capitalize cursor-pointer transition-colors ${
                        localSettings.subtitleSize === sz
                          ? 'border-orange-500 bg-orange-600 text-white'
                          : 'border-white/10 bg-slate-900/80 text-slate-300 hover:text-white'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-slate-900/60 rounded-xl border border-white/10">
                <div>
                  <h4 className="font-semibold text-white">Hindi Dubbed Release Alerts</h4>
                  <p className="text-[11px] text-slate-400">
                    Get notified immediately when new Hindi dubbed episodes become available
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.notifyHindiDrops}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, notifyHindiDrops: e.target.checked })
                  }
                  className="w-4 h-4 accent-orange-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-900/60 rounded-xl border border-white/10">
                <div>
                  <h4 className="font-semibold text-white">All New Episodes Notifications</h4>
                  <p className="text-[11px] text-slate-400">
                    Receive announcements whenever weekly episodes are added
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.notifyAllEpisodes}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, notifyAllEpisodes: e.target.checked })
                  }
                  className="w-4 h-4 accent-orange-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-900/60 rounded-xl border border-white/10">
                <div>
                  <h4 className="font-semibold text-white">Notification Sound</h4>
                  <p className="text-[11px] text-slate-400">
                    Play a gentle chime when new releases arrive
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.notificationSound}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, notificationSound: e.target.checked })
                  }
                  className="w-4 h-4 accent-orange-600 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 4: PLAYER DISPLAY */}
          {activeTab === 'display' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-slate-900/60 rounded-xl border border-white/10">
                <div>
                  <h4 className="font-semibold text-white">Theater Mode by Default</h4>
                  <p className="text-[11px] text-slate-400">
                    Expand video player to full container width automatically
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.theaterModeDefault}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, theaterModeDefault: e.target.checked })
                  }
                  className="w-4 h-4 accent-orange-600 rounded cursor-pointer"
                />
              </div>

              <div className="p-4 bg-orange-950/20 border border-orange-500/20 rounded-xl flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-white">Stream Optimization Active</p>
                  <p className="text-slate-400 mt-0.5 leading-relaxed text-[11px]">
                    Anime Toon India delivers instant seek times with HTTP byte-range caching.
                    Playback automatically resumes right where you left off when changing resolutions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Collapsible Backend Server Bridge (Hidden by default to fulfill user request) */}
          <div className="pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => setShowAdvancedVaultToggle(!showAdvancedVaultToggle)}
              className="w-full flex items-center justify-between text-[11px] text-slate-500 hover:text-slate-400 py-1 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                <span>Advanced Storage Connection</span>
              </span>
              {showAdvancedVaultToggle ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {showAdvancedVaultToggle && (
              <div className="mt-2 p-3 bg-slate-950 rounded-xl border border-white/10 text-[11px] space-y-2 animate-in fade-in">
                <p className="text-slate-400 leading-relaxed">
                  Backend cloud vault syncs securely in background.
                  Raw storage channel information is hidden for regular viewers.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  {onOpenAdminPanel && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAdminPanel();
                      }}
                      className="text-xs text-orange-400 hover:text-orange-300 font-semibold underline cursor-pointer text-left"
                    >
                      🛡 Open Admin Panel (Thumbnails, Episode Counts & Descriptions) &rarr;
                    </button>
                  )}
                  {onOpenAdvancedBackendModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAdvancedBackendModal();
                      }}
                      className="text-xs text-slate-400 hover:text-slate-300 underline cursor-pointer text-left"
                    >
                      Telegram Vault Settings &rarr;
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-slate-900/60">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className={`px-5 py-2 text-xs font-semibold text-white rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                isSaved ? 'bg-emerald-600' : 'bg-orange-600 hover:bg-orange-500'
              }`}
            >
              {isSaved ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{isSaved ? 'Preferences Saved!' : 'Save Preferences'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
