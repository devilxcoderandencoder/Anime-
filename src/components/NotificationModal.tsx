import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  Send,
  Volume2,
  VolumeX,
  Play,
  Sparkles,
  Check,
  Radio,
  Sliders,
  RefreshCw,
} from 'lucide-react';
import { Anime, Episode, NotificationSettings, ReleaseNotification } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  animeList: Anime[];
  onPlayEpisode: (episode: Episode) => void;
  onNewNotificationSimulated: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  animeList,
  onPlayEpisode,
  onNewNotificationSimulated,
}) => {
  const [activeTab, setActiveTab] = useState<'releases' | 'settings'>('releases');
  const [notifications, setNotifications] = useState<ReleaseNotification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    browserPushEnabled: true,
    telegramAlertsEnabled: true,
    soundEnabled: true,
    notifyOnAllReleases: true,
    subscribedAnimeIds: ['cyber-pulse', 'chronicles-of-astralia'],
    telegramUserChatId: '@user_anime_alerts',
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Fetch notifications and settings
  const fetchData = async () => {
    try {
      const [notifsRes, settingsRes] = await Promise.all([
        fetch('/api/notifications'),
        fetch('/api/notifications/settings'),
      ]);
      const notifsData = await notifsRes.json();
      const settingsData = await settingsRes.json();
      setNotifications(notifsData.notifications || []);
      if (settingsData) setSettings(settingsData);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'all' }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/notifications/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSimulateNewDrop = async () => {
    setIsSimulating(true);
    try {
      const targetAnime = animeList[0]?.id || 'cyber-pulse';
      const res = await fetch('/api/notifications/simulate-release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeId: targetAnime }),
      });
      const data = await res.json();
      if (data.success && data.notification) {
        setNotifications((prev) => [data.notification, ...prev]);
        onNewNotificationSimulated();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const toggleSubscription = (animeId: string) => {
    setSettings((prev) => {
      const exists = prev.subscribedAnimeIds.includes(animeId);
      return {
        ...prev,
        subscribedAnimeIds: exists
          ? prev.subscribedAnimeIds.filter((id) => id !== animeId)
          : [...prev.subscribedAnimeIds, animeId],
      };
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0d131f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#090d16]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Release Notifications & Settings</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-orange-600 text-white px-2 py-0.5 rounded-full font-bold">
                    {unreadCount} New
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Alerts when new Hindi dubbed and subbed episodes drop
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center justify-between px-6 pt-3 border-b border-white/10 bg-slate-900/50">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('releases')}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 ${
                activeTab === 'releases'
                  ? 'border-orange-500 text-white bg-white/5'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              New Release Drops ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 ${
                activeTab === 'settings'
                  ? 'border-orange-500 text-white bg-white/5'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Notification Settings
            </button>
          </div>

          {activeTab === 'releases' && (
            <div className="flex items-center gap-2 pb-2">
              <button
                onClick={handleSimulateNewDrop}
                disabled={isSimulating}
                className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-md border border-white/10 flex items-center gap-1 cursor-pointer transition-colors"
                title="Test simulated new episode release drop"
              >
                <Sparkles className="w-3 h-3" />
                <span>{isSimulating ? 'Simulating...' : 'Simulate New Drop'}</span>
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
                >
                  Mark all read
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'releases' && (
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <p>No recent release drops yet.</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const targetAnime = animeList.find((a) => a.id === notif.animeId);
                  const targetEpisode = targetAnime?.episodes.find((e) => e.id === notif.episodeId);

                  return (
                    <div
                      key={notif.id}
                      className={`p-4 rounded-xl border transition-all ${
                        notif.read
                          ? 'bg-slate-900/40 border-white/5 text-slate-300'
                          : 'bg-slate-900/90 border-orange-500/30 text-white shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                            )}
                            <span className="text-xs font-bold text-white">
                              {notif.animeTitle}
                            </span>
                            <span className="text-[11px] text-orange-400 font-mono">
                              Ep {notif.episodeNumber}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                              {notif.quality}
                            </span>
                          </div>
                          <h4 className="text-sm font-semibold text-white">
                            {notif.episodeTitle}
                          </h4>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono whitespace-nowrap">
                          {notif.timestamp}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 mb-3 bg-black/30 p-2.5 rounded-lg border border-white/5 font-mono">
                        {notif.channelCaptionSnippet}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                          <Sparkles className="w-3 h-3" />
                          <span>Anime Toon India Official Release</span>
                        </span>

                        {targetEpisode && (
                          <button
                            onClick={() => {
                              onPlayEpisode(targetEpisode);
                              onClose();
                            }}
                            className="px-3 py-1 bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-white" />
                            <span>Watch Now</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
              {/* Delivery Channels */}
              <div className="space-y-3">
                <h4 className="font-bold text-white text-sm uppercase tracking-wider text-slate-400">
                  Notification Delivery Methods
                </h4>

                {/* Browser Push */}
                <div className="flex items-center justify-between p-3.5 bg-slate-900/60 rounded-xl border border-white/10">
                  <div>
                    <p className="font-semibold text-white text-xs">Browser Push Notifications</p>
                    <p className="text-slate-400 text-[11px]">
                      Show desktop/mobile alerts as soon as a new episode is released
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.browserPushEnabled}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, browserPushEnabled: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600" />
                  </label>
                </div>

                {/* Telegram Bot Direct Alerts */}
                <div className="flex items-center justify-between p-3.5 bg-slate-900/60 rounded-xl border border-white/10">
                  <div>
                    <p className="font-semibold text-white text-xs">Personal Alert Bot</p>
                    <p className="text-slate-400 text-[11px]">
                      Receive instant release notifications directly to your Telegram handle
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.telegramAlertsEnabled}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, telegramAlertsEnabled: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600" />
                  </label>
                </div>

                {/* Telegram User Chat ID */}
                {settings.telegramAlertsEnabled && (
                  <div className="p-3 bg-slate-900/40 rounded-xl border border-white/5">
                    <label className="block text-slate-300 font-medium mb-1">
                      Your Telegram Username or Chat ID for Alerts
                    </label>
                    <input
                      type="text"
                      value={settings.telegramUserChatId}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, telegramUserChatId: e.target.value }))
                      }
                      placeholder="@your_telegram_username"
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>
                )}

                {/* Audio Sound */}
                <div className="flex items-center justify-between p-3.5 bg-slate-900/60 rounded-xl border border-white/10">
                  <div>
                    <p className="font-semibold text-white text-xs">Release Chime Sound</p>
                    <p className="text-slate-400 text-[11px]">Play audio sound when a release arrives</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.soundEnabled}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, soundEnabled: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600" />
                  </label>
                </div>
              </div>

              {/* Anime Subscriptions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm uppercase tracking-wider text-slate-400">
                    Anime Subscriptions & Scope
                  </h4>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({ ...prev, notifyOnAllReleases: !prev.notifyOnAllReleases }))
                    }
                    className="text-[11px] text-orange-400 hover:text-orange-300 cursor-pointer"
                  >
                    {settings.notifyOnAllReleases ? 'Switch to Selected Series' : 'Notify for All Series'}
                  </button>
                </div>

                {!settings.notifyOnAllReleases && (
                  <div className="space-y-2 bg-slate-900/40 p-3 rounded-xl border border-white/10">
                    <p className="text-slate-400 text-[11px] mb-2">
                      Select which anime series to receive notifications for:
                    </p>
                    {animeList.map((anime) => {
                      const isSubscribed = settings.subscribedAnimeIds.includes(anime.id);
                      return (
                        <div
                          key={anime.id}
                          onClick={() => toggleSubscription(anime.id)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors border ${
                            isSubscribed
                              ? 'bg-orange-600/10 border-orange-500/40 text-white'
                              : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className="font-medium">{anime.title}</span>
                          <span className="text-[11px] font-mono">
                            {isSubscribed ? 'Subscribed' : 'Off'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Save Feedback */}
              {saveSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Notification settings saved successfully!</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
