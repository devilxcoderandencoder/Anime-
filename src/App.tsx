import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { VideoPlayer } from './components/VideoPlayer';
import { RecentlyNewAnime } from './components/RecentlyNewAnime';
import { TopTenLeaderboard } from './components/TopTenLeaderboard';
import { EpisodeListModal } from './components/EpisodeListModal';
import { AnimeCard } from './components/AnimeCard';
import { TelegramVaultModal } from './components/TelegramVaultModal';
import { StreamDiagnosticsModal } from './components/StreamDiagnosticsModal';
import { NotificationModal } from './components/NotificationModal';
import { SettingsModal, UserSettings, DEFAULT_USER_SETTINGS } from './components/SettingsModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { Anime, Episode, TelegramConfig } from './types';
import { Database, Film, HardDrive, RefreshCw, Bell, Sparkles, Trophy, ArrowLeft, Settings, Shield } from 'lucide-react';

export default function App() {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [activeTab, setActiveTab] = useState<string>('catalog');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  // Settings State
  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('anime_toon_settings');
      return saved ? { ...DEFAULT_USER_SETTINGS, ...JSON.parse(saved) } : DEFAULT_USER_SETTINGS;
    } catch {
      return DEFAULT_USER_SETTINGS;
    }
  });
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // Episode List Modal (Only show episodes when user clicks an anime thumbnail)
  const [modalAnime, setModalAnime] = useState<Anime | null>(null);
  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState<boolean>(false);

  // Notifications
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(1);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals (Advanced backend modals hidden from standard user UI)
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState<boolean>(false);
  const [isDiagnosticsModalOpen, setIsDiagnosticsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch anime catalog
  const loadAnimeData = async () => {
    try {
      const res = await fetch('/api/anime');
      const data: Anime[] = await res.json();
      setAnimeList(data);
      if (data.length > 0 && !selectedAnime) {
        setSelectedAnime(data[0]);
      }
    } catch (err) {
      console.error('Failed to load anime catalog:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Telegram configuration
  const loadTelegramStatus = async () => {
    try {
      const res = await fetch('/api/telegram/status');
      const data: TelegramConfig = await res.json();
      setTelegramConfig(data);
    } catch (err) {
      console.error('Failed to load Telegram status:', err);
    }
  };

  // Fetch notifications count
  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setUnreadNotificationCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    loadAnimeData();
    loadTelegramStatus();
    loadNotifications();
  }, []);

  // Handler: When user clicks ANY anime thumbnail, show its episode list
  const handleOpenAnimeEpisodes = (anime: Anime) => {
    setModalAnime(anime);
    setIsEpisodeModalOpen(true);
  };

  // Filtered anime list for catalog
  const filteredAnime = animeList.filter((anime) => {
    const matchesGenre = selectedGenre === 'All' || anime.genres.includes(selectedGenre);
    const matchesSearch =
      searchQuery.trim() === '' ||
      anime.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      anime.japaneseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      anime.audioLangs.some((l) => l.toLowerCase().includes(searchQuery.toLowerCase())) ||
      anime.genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesGenre && matchesSearch;
  });

  const allEpisodes = animeList.flatMap((a) => a.episodes);
  const genres = ['All', 'Action', 'Fantasy', 'Supernatural', 'Cyberpunk', 'Adventure', 'Military'];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Top Bar Navigation with Anime Toon India Branding */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        telegramConfig={telegramConfig}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenNotificationModal={() => {
          setIsNotificationModalOpen(true);
          setUnreadNotificationCount(0);
        }}
        onOpenAdminPanel={() => setIsAdminModalOpen(true)}
        unreadNotificationCount={unreadNotificationCount}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900/95 border border-orange-500/50 rounded-xl p-3.5 text-xs text-white shadow-2xl flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-top-4">
          <div className="w-8 h-8 rounded-lg bg-orange-600/20 text-orange-400 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold">{toastMessage}</p>
            <p className="text-[11px] text-slate-400">Anime Toon India Official Vault</p>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
            <p className="text-xs text-slate-400 font-mono">Loading Anime Toon India Catalog...</p>
          </div>
        ) : (
          <>
            {/* Active Video Player Section (When an episode is chosen) */}
            {currentEpisode && selectedAnime ? (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setCurrentEpisode(null)}
                    className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer bg-slate-900 px-3 py-1.5 rounded-lg border border-white/10"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Anime Thumbnails</span>
                  </button>

                  <button
                    onClick={() => handleOpenAnimeEpisodes(selectedAnime)}
                    className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Change Episode ({selectedAnime.episodes.length} Available)</span>
                  </button>
                </div>

                <VideoPlayer
                  anime={selectedAnime}
                  currentEpisode={currentEpisode}
                  onSelectEpisode={(ep) => setCurrentEpisode(ep)}
                  onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
                  onOpenTelegramModal={() => setIsTelegramModalOpen(true)}
                  onOpenDiagnosticsModal={() => setIsDiagnosticsModalOpen(true)}
                />
              </div>
            ) : (
              /* Hero Showcase for Featured Anime */
              selectedAnime && (
                <HeroBanner
                  anime={selectedAnime}
                  onPlayEpisode={() => handleOpenAnimeEpisodes(selectedAnime)}
                  onSelectAnime={() => handleOpenAnimeEpisodes(selectedAnime)}
                  onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
                />
              )
            )}

            {/* RECENTLY NEW ANIME SERIES SECTION (Thumbnails only, click to view episode list) */}
            <RecentlyNewAnime
              animeList={animeList}
              onSelectAnime={(anime) => handleOpenAnimeEpisodes(anime)}
            />

            {/* TOP 10 IN INDIA LEADERBOARD SECTION (TODAY / MONTH / WEEK / ALL-TIME & ALL TYPES) */}
            <TopTenLeaderboard
              animeList={animeList}
              onSelectAnime={(anime) => handleOpenAnimeEpisodes(anime)}
            />

            {/* Platform Feature Bar */}
            <section className="mb-14 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/90 border border-white/10 rounded-2xl p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-3">
                    <Database className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">Telegram Private Cloud Storage</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Full episodes stored directly in Telegram private channels with authentic channel post descriptions, message links, and multi-audio master files.
                  </p>
                </div>

                <div>
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-3">
                    <Film className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">Hindi Dubbed & Multi-Resolution</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Watch in Hindi Dub, English Sub, or Japanese. Switch resolutions seamlessly between 1080p, 720p, 480p, and 360p without losing your playback time.
                  </p>
                </div>

                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">Release Drop Notifications</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Get instant push notifications and Telegram bot DM alerts for each new episode dropped into the Anime Toon India channel.
                  </p>
                </div>
              </div>
            </section>

            {/* ANIME CATALOG SECTION: CLEAN THUMBNAILS ONLY (Clicking opens Episode List) */}
            <section className="mb-14">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    <span>Anime Catalog</span>
                    <span className="text-xs text-slate-400 font-normal">
                      (Click any anime thumbnail to view episode list)
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Showing {filteredAnime.length} series · High-speed Telegram HTTP 206 streaming
                  </p>
                </div>

                {/* Genre Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                  {genres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => setSelectedGenre(genre)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        selectedGenre === genre
                          ? 'bg-orange-600 text-white shadow-sm'
                          : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thumbnails-Only Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {filteredAnime.map((anime) => (
                  <AnimeCard
                    key={anime.id}
                    anime={anime}
                    onSelect={(a) => handleOpenAnimeEpisodes(a)}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* EPISODE LIST MODAL (Opens ONLY when user clicks on an anime thumbnail) */}
      <EpisodeListModal
        anime={modalAnime}
        isOpen={isEpisodeModalOpen}
        onClose={() => setIsEpisodeModalOpen(false)}
        onPlayEpisode={(ep) => {
          if (modalAnime) setSelectedAnime(modalAnime);
          setCurrentEpisode(ep);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentPlayingEpId={currentEpisode?.id}
      />

      {/* Clean Consumer Footer */}
      <footer className="border-t border-white/10 bg-[#060910] py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white">
              <span className="text-orange-500">AnimeToon</span>
              <span className="text-emerald-400">India</span>
            </span>
            <span className="text-slate-600">·</span>
            <span>Premium Anime Streaming in Hindi Dubbed & Subtitled</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="hover:text-orange-400 transition-colors cursor-pointer flex items-center gap-1 text-slate-300 font-semibold"
            >
              <Shield className="w-3.5 h-3.5 text-orange-500" />
              <span>Admin Panel</span>
            </button>
            <span className="text-slate-700">·</span>
            <button
              onClick={() => setIsNotificationModalOpen(true)}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Notifications</span>
            </button>
            <span className="text-slate-700">·</span>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <Settings className="w-3.5 h-3.5 text-orange-400" />
              <span>Settings</span>
            </button>
            <span className="text-slate-700">·</span>
            <button
              onClick={() => {
                setActiveTab('catalog');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              All Anime
            </button>
            <span className="text-slate-700">·</span>
            <span className="text-emerald-400 font-medium">Full HD 1080p</span>
          </div>
        </div>
      </footer>

      {/* User Preferences & Streaming Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={userSettings}
        onSaveSettings={(newSettings) => {
          setUserSettings(newSettings);
          try {
            localStorage.setItem('anime_toon_settings', JSON.stringify(newSettings));
          } catch {}
          setToastMessage('Streaming & Player Preferences Saved!');
          setTimeout(() => setToastMessage(null), 3000);
        }}
        onOpenAdvancedBackendModal={() => setIsTelegramModalOpen(true)}
        onOpenAdminPanel={() => setIsAdminModalOpen(true)}
      />

      {/* Admin Panel Modal (Account of mine, Thumbnails, Total Episodes, Episode Descriptions) */}
      <AdminPanelModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        animeList={animeList}
        onCatalogUpdated={() => {
          loadAnimeData();
          setToastMessage('Anime Catalog & Episode details updated!');
          setTimeout(() => setToastMessage(null), 3500);
        }}
        onPlayEpisode={(ep) => {
          const target = animeList.find((a) => a.id === ep.animeId);
          if (target) setSelectedAnime(target);
          setCurrentEpisode(ep);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Advanced Telegram Channel Storage Modal (Accessible only via advanced developer toggle in Settings) */}
      <TelegramVaultModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        config={telegramConfig}
        onConfigUpdated={loadTelegramStatus}
        animeList={animeList}
        onEpisodeAdded={loadAnimeData}
      />

      {/* Stream Diagnostics Modal */}
      <StreamDiagnosticsModal
        isOpen={isDiagnosticsModalOpen}
        onClose={() => setIsDiagnosticsModalOpen(false)}
        activeEpisode={currentEpisode}
        onSelectEpisodeForTest={(id) => {
          const ep = allEpisodes.find((e) => e.id === id);
          if (ep) setCurrentEpisode(ep);
        }}
        allEpisodes={allEpisodes}
      />

      {/* Release Notifications & Settings Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        animeList={animeList}
        onPlayEpisode={(ep) => {
          const target = animeList.find((a) => a.id === ep.animeId);
          if (target) setSelectedAnime(target);
          setCurrentEpisode(ep);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNewNotificationSimulated={() => {
          setToastMessage('🔥 New Episode Dropped in Anime Toon India Official Vault!');
          setTimeout(() => setToastMessage(null), 4000);
          loadAnimeData();
          loadNotifications();
        }}
      />
    </div>
  );
}
