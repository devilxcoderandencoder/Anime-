import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Settings, Shield, X, Star, Film, Sparkles } from 'lucide-react';
import { Anime, TelegramConfig } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  telegramConfig?: TelegramConfig | null;
  onOpenSettingsModal: () => void;
  onOpenNotificationModal: () => void;
  onOpenAdminPanel: () => void;
  unreadNotificationCount: number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  animeList?: Anime[];
  onSelectAnime?: (anime: Anime) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettingsModal,
  onOpenNotificationModal,
  onOpenAdminPanel,
  unreadNotificationCount,
  searchQuery,
  setSearchQuery,
  animeList = [],
  onSelectAnime,
}) => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Filter matching anime for instant live preview dropdown
  const matchingAnime = searchQuery.trim()
    ? animeList
        .filter((a) => {
          const q = searchQuery.toLowerCase();
          return (
            a.title.toLowerCase().includes(q) ||
            a.japaneseTitle.toLowerCase().includes(q) ||
            a.genres.some((g) => g.toLowerCase().includes(q)) ||
            (a.audioLangs && a.audioLangs.some((l) => l.toLowerCase().includes(q)))
          );
        })
        .slice(0, 5)
    : [];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus mobile input when opened
  useEffect(() => {
    if (isMobileSearchOpen && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  const handleSelectResult = (anime: Anime) => {
    setIsDropdownOpen(false);
    setIsMobileSearchOpen(false);
    if (onSelectAnime) {
      onSelectAnime(anime);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('catalog');
            setSearchQuery('');
          }}
          className="text-lg sm:text-xl font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-1.5"
        >
          <span className="text-orange-500">AnimeToon</span>
          <span className="text-emerald-400 font-bold">India</span>
        </a>

        {/* Zone 2: Clean consumer navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => {
              setActiveTab('catalog');
              setSearchQuery('');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'catalog' && !searchQuery
                ? 'text-white border-b-2 border-orange-500 pb-0.5'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Anime
          </button>
          <button
            onClick={() => setActiveTab('top10')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'top10'
                ? 'text-white border-b-2 border-orange-500 pb-0.5'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Top 10 India
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'recent'
                ? 'text-white border-b-2 border-orange-500 pb-0.5'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Hindi Dub Drops
          </button>
          <button
            onClick={() => setActiveTab('genres')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'genres'
                ? 'text-white border-b-2 border-orange-500 pb-0.5'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Genres & Movies
          </button>
        </nav>

        {/* Zone 3: Search Bar, Notifications, Admin & Settings */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Desktop & Tablet Search Bar */}
          <div ref={searchContainerRef} className="relative hidden md:block w-52 sm:w-64 lg:w-72 xl:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="Search anime, Hindi dub, genres..."
              className="w-full bg-slate-900/90 border border-white/10 hover:border-white/20 focus:border-orange-500 rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Live Autocomplete Dropdown */}
            {isDropdownOpen && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0c121e] border border-white/15 rounded-xl shadow-2xl shadow-black/80 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2 border-b border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Live Search Results</span>
                  <span>{matchingAnime.length} found</span>
                </div>

                {matchingAnime.length > 0 ? (
                  <div className="py-1 divide-y divide-white/5">
                    {matchingAnime.map((anime) => (
                      <div
                        key={anime.id}
                        onClick={() => handleSelectResult(anime)}
                        className="px-3 py-2 flex items-center gap-3 hover:bg-orange-500/10 cursor-pointer transition-colors group"
                      >
                        <img
                          src={anime.posterImage || anime.bannerImage}
                          alt={anime.title}
                          className="w-9 h-12 object-cover rounded bg-slate-800 shrink-0 border border-white/10"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-white group-hover:text-orange-400 truncate transition-colors">
                            {anime.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 truncate">
                            {anime.japaneseTitle}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                            <span className="text-orange-400 font-medium">
                              {anime.audioLangs ? anime.audioLangs[0] : 'Hindi Dub'}
                            </span>
                            <span>•</span>
                            <span>{anime.episodes.length} Episodes</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-amber-400">
                              <Star className="w-2.5 h-2.5 fill-amber-400" />
                              {anime.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No anime found matching "{searchQuery}"
                  </div>
                )}

                <div className="p-2 bg-slate-900/60 border-t border-white/10 text-center">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setActiveTab('catalog');
                    }}
                    className="text-[11px] font-semibold text-orange-400 hover:text-orange-300 cursor-pointer"
                  >
                    View all results in catalog →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Search Toggle Button */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className={`md:hidden p-2 rounded-lg border transition-colors cursor-pointer ${
              isMobileSearchOpen
                ? 'bg-orange-600 text-white border-orange-500'
                : 'text-slate-300 hover:text-white bg-slate-900/80 border-white/10'
            }`}
            title="Search"
            aria-label="Toggle search bar"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Release Notifications Bell */}
          <button
            onClick={onOpenNotificationModal}
            className="relative p-2 text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 rounded-lg border border-white/10 transition-colors cursor-pointer"
            title="Release Notifications"
            aria-label="Release Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Admin Panel Access Button (Shield icon with badge) */}
          <button
            onClick={onOpenAdminPanel}
            className="p-2 text-slate-300 hover:text-orange-400 bg-slate-900/80 hover:bg-slate-800 rounded-lg border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Admin Panel (Thumbnails, Episode Counts, Descriptions)"
            aria-label="Admin Panel"
          >
            <Shield className="w-4 h-4 text-orange-500" />
            <span className="hidden xl:inline text-xs font-semibold text-slate-200">Admin</span>
          </button>

          {/* User Settings Icon Button */}
          <button
            onClick={onOpenSettingsModal}
            className="p-2 text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 rounded-lg border border-white/10 transition-colors cursor-pointer"
            title="Streaming & Playback Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Primary Action Button: Settings / Preferences */}
          <button
            onClick={onOpenSettingsModal}
            className="hidden sm:flex px-3.5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors whitespace-nowrap shrink-0 items-center gap-2 cursor-pointer shadow-sm"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Mobile Expandable Search Bar */}
      {isMobileSearchOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-white/10 animate-in slide-in-from-top-2 duration-150">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={mobileInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anime title, Hindi dub, genres..."
              className="w-full bg-slate-900 border border-white/15 focus:border-orange-500 rounded-lg pl-9 pr-9 py-2 text-xs text-white placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile Matching preview */}
          {searchQuery.trim().length > 0 && matchingAnime.length > 0 && (
            <div className="mt-2 bg-slate-900/95 border border-white/10 rounded-lg overflow-hidden divide-y divide-white/5">
              {matchingAnime.map((anime) => (
                <div
                  key={anime.id}
                  onClick={() => handleSelectResult(anime)}
                  className="px-3 py-2 flex items-center gap-2.5 hover:bg-orange-500/10 cursor-pointer"
                >
                  <img
                    src={anime.posterImage || anime.bannerImage}
                    alt={anime.title}
                    className="w-8 h-10 object-cover rounded bg-slate-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{anime.title}</p>
                    <p className="text-[10px] text-orange-400">{anime.audioLangs ? anime.audioLangs[0] : 'Hindi Dub'} • {anime.episodes.length} Eps</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
};
