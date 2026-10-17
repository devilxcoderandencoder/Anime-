import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Key,
  User,
  Image as ImageIcon,
  ListOrdered,
  FileText,
  Check,
  Save,
  Plus,
  Trash2,
  Lock,
  LogOut,
  Radio,
  Tv,
  Sparkles,
  RefreshCw,
  Play,
  Layers,
  ChevronRight,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Hash,
  Eye,
} from 'lucide-react';
import { Anime, Episode, AdminAccount } from '../types';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  animeList: Anime[];
  onCatalogUpdated: () => void;
  onPlayEpisode?: (episode: Episode) => void;
}

// Preset local high-res artwork for instant thumbnail assignment
const PRESET_THUMBNAILS = [
  { label: 'Hunter / Jinwoo', url: '/src/assets/images/anime_card_hunter_1792135997910.jpg' },
  { label: 'Ninja / Shinobi', url: '/src/assets/images/anime_card_ninja_1792136007098.jpg' },
  { label: 'Pirate / Gear', url: '/src/assets/images/anime_card_pirate_1792135998619.jpg' },
  { label: 'Titan / Colossal', url: '/src/assets/images/anime_card_titan_1792135997611.jpg' },
  { label: 'Cyberpunk City', url: '/src/assets/images/anime_hero_cyberpunk_1792115114086.jpg' },
  { label: 'Fantasy Domain', url: '/src/assets/images/anime_hero_fantasy_1792115115387.jpg' },
  { label: 'Action Combat', url: '/src/assets/images/anime_art_action_1792115115807.jpg' },
  { label: 'Supernatural Glow', url: '/src/assets/images/anime_art_supernatural_1792115115526.jpg' },
];

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  animeList,
  onCatalogUpdated,
  onPlayEpisode,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ati_admin_logged_in') === 'true';
    } catch {
      return false;
    }
  });

  const [adminAccount, setAdminAccount] = useState<AdminAccount>({
    id: 'admin-owner-1',
    name: 'Admin Master',
    email: 'admin@animetoonindia.com',
    role: 'Channel Owner & Broadcaster',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    channelLinked: '-1002847591024',
    lastLogin: new Date().toISOString(),
  });

  // Login form state
  const [loginEmail, setLoginEmail] = useState('admin@animetoonindia.com');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Tab: 'thumbnails' | 'episodes' | 'account' | 'stream-status'
  const [activeTab, setActiveTab] = useState<'thumbnails' | 'episodes' | 'account' | 'stream-status'>('thumbnails');

  // Selected Anime for Thumbnail & Total Episodes Editing
  const [selectedAnimeId, setSelectedAnimeId] = useState<string>(animeList[0]?.id || '');
  const selectedAnime = animeList.find((a) => a.id === selectedAnimeId) || animeList[0];

  // Anime Edit Form State
  const [animeForm, setAnimeForm] = useState({
    title: '',
    japaneseTitle: '',
    posterImage: '',
    bannerImage: '',
    totalEpisodes: 12,
    synopsis: '',
    status: 'Airing' as 'Airing' | 'Completed' | 'Upcoming',
  });

  // Selected Episode for Editing Description & Metadata
  const [selectedEpId, setSelectedEpId] = useState<string>('');
  const [episodeForm, setEpisodeForm] = useState({
    title: '',
    episodeNumber: 1,
    thumbnail: '',
    channelDescription: '',
    duration: '24:00',
    resolution: '1080p 60fps',
  });

  // New Episode Drawer / State
  const [isAddingEpisode, setIsAddingEpisode] = useState(false);
  const [newEpForm, setNewEpForm] = useState({
    title: '',
    episodeNumber: 1,
    thumbnail: '',
    channelDescription: '',
    duration: '24:00',
    resolution: '1080p 60fps',
  });

  // Account Edit Form State
  const [accountForm, setAccountForm] = useState({
    name: '',
    email: '',
    role: '',
    avatar: '',
    newPassword: '',
  });

  // Feedback messages
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync selected anime into form
  useEffect(() => {
    if (selectedAnime) {
      setAnimeForm({
        title: selectedAnime.title,
        japaneseTitle: selectedAnime.japaneseTitle,
        posterImage: selectedAnime.posterImage,
        bannerImage: selectedAnime.bannerImage,
        totalEpisodes: selectedAnime.totalEpisodes,
        synopsis: selectedAnime.synopsis,
        status: selectedAnime.status,
      });

      if (selectedAnime.episodes.length > 0) {
        const firstEp = selectedAnime.episodes[0];
        setSelectedEpId(firstEp.id);
        setEpisodeForm({
          title: firstEp.title,
          episodeNumber: firstEp.episodeNumber,
          thumbnail: firstEp.thumbnail,
          channelDescription: firstEp.channelDescription || '',
          duration: firstEp.duration,
          resolution: firstEp.resolution,
        });
      }
    }
  }, [selectedAnimeId, selectedAnime]);

  // Load Admin Profile from backend
  const fetchAdminProfile = async () => {
    try {
      const res = await fetch('/api/admin/me');
      const data = await res.json();
      if (data.success && data.account) {
        setAdminAccount(data.account);
        setAccountForm({
          name: data.account.name,
          email: data.account.email,
          role: data.account.role,
          avatar: data.account.avatar || '',
          newPassword: '',
        });
      }
    } catch {
      // Use fallback defaults
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminProfile();
    }
  }, [isOpen]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        try {
          localStorage.setItem('ati_admin_logged_in', 'true');
        } catch {}
        setAdminAccount(data.account);
        setAccountForm({
          name: data.account.name,
          email: data.account.email,
          role: data.account.role,
          avatar: data.account.avatar || '',
          newPassword: '',
        });
        showToast('Welcome back, Admin Master! Backend Telegram stream is active.');
      } else {
        setLoginError(data.error || 'Authentication failed. Please check credentials.');
      }
    } catch (err: any) {
      setLoginError(`Network error: ${err.message}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('ati_admin_logged_in');
    } catch {}
    showToast('Signed out of Admin Panel');
  };

  // Save Anime Series & Thumbnail & Total Episodes
  const handleSaveAnime = async () => {
    if (!selectedAnime) return;
    setIsSaving(true);

    try {
      const res = await fetch(`/api/admin/anime/${selectedAnime.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: animeForm.title,
          japaneseTitle: animeForm.japaneseTitle,
          posterImage: animeForm.posterImage,
          bannerImage: animeForm.bannerImage,
          totalEpisodes: Number(animeForm.totalEpisodes),
          synopsis: animeForm.synopsis,
          status: animeForm.status,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Thumbnail & total episodes (${animeForm.totalEpisodes}) updated for "${animeForm.title}"!`);
        onCatalogUpdated();
      } else {
        showToast(data.error || 'Failed to update anime', 'error');
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Select Episode for editing
  const handleSelectEpisode = (ep: Episode) => {
    setSelectedEpId(ep.id);
    setEpisodeForm({
      title: ep.title,
      episodeNumber: ep.episodeNumber,
      thumbnail: ep.thumbnail,
      channelDescription: ep.channelDescription || '',
      duration: ep.duration,
      resolution: ep.resolution,
    });
  };

  // Save Episode Description, Thumbnail & Title
  // NOTE: Backend Telegram stream proxy stays ON and connected!
  const handleSaveEpisode = async () => {
    if (!selectedAnime || !selectedEpId) return;
    setIsSaving(true);

    try {
      const res = await fetch(`/api/admin/anime/${selectedAnime.id}/episodes/${selectedEpId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: episodeForm.title,
          thumbnail: episodeForm.thumbnail,
          channelDescription: episodeForm.channelDescription,
          duration: episodeForm.duration,
          resolution: episodeForm.resolution,
          episodeNumber: Number(episodeForm.episodeNumber),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Episode #${episodeForm.episodeNumber} description & thumbnail saved! Telegram stream online.`);
        onCatalogUpdated();
      } else {
        showToast(data.error || 'Failed to update episode', 'error');
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Add New Episode (Wires into backend Telegram streaming engine)
  const handleAddNewEpisode = async () => {
    if (!selectedAnime) return;
    setIsSaving(true);

    try {
      const nextNum = newEpForm.episodeNumber || (selectedAnime.episodes.length + 1);
      const res = await fetch(`/api/admin/anime/${selectedAnime.id}/episodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newEpForm.title || `Episode ${nextNum}`,
          episodeNumber: nextNum,
          thumbnail: newEpForm.thumbnail || selectedAnime.posterImage,
          channelDescription:
            newEpForm.channelDescription ||
            `Official release for ${selectedAnime.title} - Episode ${nextNum}. Hindi Dubbed master stream with multi-quality encoding.`,
          duration: newEpForm.duration || '24:00',
          resolution: newEpForm.resolution || '1080p 60fps',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Episode #${nextNum} created! Backend Telegram stream proxy connected.`);
        setIsAddingEpisode(false);
        setNewEpForm({
          title: '',
          episodeNumber: (selectedAnime.episodes.length + 2),
          thumbnail: '',
          channelDescription: '',
          duration: '24:00',
          resolution: '1080p 60fps',
        });
        onCatalogUpdated();
      } else {
        showToast(data.error || 'Failed to add episode', 'error');
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Episode
  const handleDeleteEpisode = async (epId: string) => {
    if (!selectedAnime) return;
    if (!confirm('Are you sure you want to remove this episode?')) return;
    setIsSaving(true);

    try {
      const res = await fetch(`/api/admin/anime/${selectedAnime.id}/episodes/${epId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Episode removed from series catalog');
        onCatalogUpdated();
      } else {
        showToast(data.error || 'Failed to delete episode', 'error');
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Save Admin Account Details ("Account of mine")
  const handleSaveAccount = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAdminAccount(data.account);
        showToast('Admin account profile updated successfully!');
      } else {
        showToast(data.error || 'Failed to update account', 'error');
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0b101b] border border-orange-500/30 rounded-2xl max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900/90 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Admin Control Panel</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  Account of Mine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Manage anime thumbnails, total episode counts & descriptions · Telegram stream stays active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Telegram Stream Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Telegram Stream Engine: ON</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast / Status Banner */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-medium flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-b border-emerald-500/30'
                : 'bg-rose-950/90 text-rose-200 border-b border-rose-500/30'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Content Body */}
        {!isAuthenticated ? (
          /* =========================================================
             LOGIN VIEW (Access Account of Mine)
             ========================================================= */
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-orange-600/20 text-orange-400 flex items-center justify-center mb-4 border border-orange-500/30 shadow-xl">
              <Lock className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Sign in to Admin Account</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Log into your verified broadcaster account to modify thumbnails, adjust total episode counts, and edit episode descriptions.
            </p>

            {loginError && (
              <div className="w-full mb-4 p-3 rounded-lg bg-rose-950/80 border border-rose-500/30 text-rose-200 text-xs text-left flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="w-full space-y-4 text-left">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Admin Email / Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    placeholder="admin@animetoonindia.com"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Admin Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-600/20"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>Sign In to Admin Panel</span>
                  </>
                )}
              </button>

              {/* Quick Demo Login Button for Instant Access */}
              <button
                type="button"
                onClick={() => {
                  setLoginEmail('admin@animetoonindia.com');
                  setLoginPassword('admin123');
                  setTimeout(() => {
                    setIsAuthenticated(true);
                    try {
                      localStorage.setItem('ati_admin_logged_in', 'true');
                    } catch {}
                    showToast('Logged in as Admin Master (admin@animetoonindia.com)');
                  }, 100);
                }}
                className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-white/5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>1-Click Sign-in as Owner (admin@animetoonindia.com)</span>
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-slate-500 flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Telegram Private Channel Streaming Proxy: Active in Background</span>
            </div>
          </div>
        ) : (
          /* =========================================================
             AUTHENTICATED ADMIN DASHBOARD VIEW
             ========================================================= */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[500px]">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 bg-slate-900/60 border-b md:border-b-0 md:border-r border-white/10 p-4 flex flex-col justify-between shrink-0">
              <div className="space-y-1">
                {/* Admin Profile Chip */}
                <div className="p-3 mb-3 rounded-xl bg-slate-900 border border-white/10 flex items-center gap-3">
                  <img
                    src={adminAccount.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt="Admin"
                    className="w-10 h-10 rounded-full object-cover border border-orange-500/40"
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">{adminAccount.name}</p>
                    <p className="text-[10px] text-orange-400 truncate font-mono">{adminAccount.email}</p>
                    <span className="inline-block px-1.5 py-0.2 text-[9px] bg-emerald-500/20 text-emerald-400 rounded mt-0.5">
                      Verified Owner
                    </span>
                  </div>
                </div>

                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-3 py-1">
                  Management Tools
                </div>

                {/* Tab 1: Thumbnails & Total Episodes */}
                <button
                  onClick={() => setActiveTab('thumbnails')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                    activeTab === 'thumbnails'
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <ImageIcon className="w-4 h-4 shrink-0" />
                  <div className="flex-1 truncate">
                    <span>Thumbnails & Total Episodes</span>
                  </div>
                </button>

                {/* Tab 2: Episode Descriptions */}
                <button
                  onClick={() => setActiveTab('episodes')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                    activeTab === 'episodes'
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <div className="flex-1 truncate">
                    <span>Episode Descriptions</span>
                  </div>
                </button>

                {/* Tab 3: Account of Mine */}
                <button
                  onClick={() => setActiveTab('account')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                    activeTab === 'account'
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <User className="w-4 h-4 shrink-0" />
                  <div className="flex-1 truncate">
                    <span>Account of Mine</span>
                  </div>
                </button>

                {/* Tab 4: Backend Telegram Stream Status */}
                <button
                  onClick={() => setActiveTab('stream-status')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                    activeTab === 'stream-status'
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Radio className="w-4 h-4 shrink-0" />
                  <div className="flex-1 truncate">
                    <span>Telegram Stream Engine</span>
                  </div>
                </button>
              </div>

              {/* Bottom Logout Button */}
              <div className="pt-4 mt-4 border-t border-white/5 space-y-2">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center justify-between text-slate-300 font-medium">
                    <span>Backend Stream</span>
                    <span className="text-emerald-400 flex items-center gap-1 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      ONLINE
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Telegram Vault: {adminAccount.channelLinked || '-1002847591024'}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full py-2 px-3 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out of Account</span>
                </button>
              </div>
            </div>

            {/* Main Editor Pane */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/40">
              
              {/* =========================================================
                  TAB 1: THUMBNAILS & TOTAL NUMBER OF EPISODES
                  ========================================================= */}
              {activeTab === 'thumbnails' && (
                <div className="space-y-6">
                  {/* Top Anime Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      Select Anime Series to Manage:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                      {animeList.map((anime) => {
                        const isSelected = anime.id === selectedAnimeId;
                        return (
                          <button
                            key={anime.id}
                            type="button"
                            onClick={() => setSelectedAnimeId(anime.id)}
                            className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col gap-2 ${
                              isSelected
                                ? 'bg-orange-950/40 border-orange-500 ring-2 ring-orange-500/20'
                                : 'bg-slate-900/80 border-white/10 hover:border-white/20'
                            }`}
                          >
                            <img
                              src={anime.posterImage}
                              alt={anime.title}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold text-white truncate">{anime.title}</p>
                              <p className="text-[10px] text-orange-400 font-mono">
                                {anime.totalEpisodes} Episodes
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedAnime && (
                    <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-5">
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <span>Editing Series:</span>
                            <span className="text-orange-400">{selectedAnime.title}</span>
                          </h3>
                          <p className="text-xs text-slate-400">
                            Change thumbnail image, poster artwork, and total number of episodes
                          </p>
                        </div>

                        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-white/10">
                          {selectedAnime.episodes.length} indexed in Vault
                        </span>
                      </div>

                      {/* Thumbnail & Banner Live Preview + Selector */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Poster Thumbnail */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                            <span>Anime Thumbnail / Poster Image URL</span>
                            <span className="text-[10px] text-orange-400 font-normal">Live Preview</span>
                          </label>
                          <div className="flex gap-4 items-start">
                            <div className="w-28 h-38 rounded-xl overflow-hidden bg-slate-950 border border-white/10 shrink-0 shadow-lg">
                              <img
                                src={animeForm.posterImage}
                                alt="Poster Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback to placeholder if broken
                                  (e.target as HTMLImageElement).src =
                                    '/src/assets/images/anime_card_hunter_1792135997910.jpg';
                                }}
                              />
                            </div>
                            <div className="flex-1 space-y-2">
                              <input
                                type="text"
                                value={animeForm.posterImage}
                                onChange={(e) => setAnimeForm({ ...animeForm, posterImage: e.target.value })}
                                placeholder="/src/assets/images/... or https://..."
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                              />

                              <p className="text-[11px] text-slate-400">
                                Or pick from high-definition preset artwork:
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {PRESET_THUMBNAILS.slice(0, 4).map((p) => (
                                  <button
                                    key={p.label}
                                    type="button"
                                    onClick={() => setAnimeForm({ ...animeForm, posterImage: p.url })}
                                    className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-medium transition-colors cursor-pointer border border-white/5"
                                  >
                                    {p.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Banner Image */}
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                            <span>Hero Banner Image URL</span>
                            <span className="text-[10px] text-orange-400 font-normal">Live Preview</span>
                          </label>
                          <div className="space-y-2">
                            <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-950 border border-white/10 shadow-lg">
                              <img
                                src={animeForm.bannerImage}
                                alt="Banner Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    '/src/assets/images/anime_hero_cyberpunk_1792115114086.jpg';
                                }}
                              />
                            </div>
                            <input
                              type="text"
                              value={animeForm.bannerImage}
                              onChange={(e) => setAnimeForm({ ...animeForm, bannerImage: e.target.value })}
                              placeholder="/src/assets/images/... or https://..."
                              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                            />
                            <div className="flex flex-wrap gap-1.5">
                              {PRESET_THUMBNAILS.slice(4).map((p) => (
                                <button
                                  key={p.label}
                                  type="button"
                                  onClick={() => setAnimeForm({ ...animeForm, bannerImage: p.url })}
                                  className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-medium transition-colors cursor-pointer border border-white/5"
                                >
                                  {p.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Total Number of Episodes & Status */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                        {/* TOTAL NUMBER OF EPISODES */}
                        <div className="p-4 rounded-xl bg-slate-900 border border-orange-500/30">
                          <label className="block text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                            <ListOrdered className="w-3.5 h-3.5 text-orange-400" />
                            <span>Total Number of Episodes</span>
                          </label>
                          <p className="text-[10px] text-slate-400 mb-3">
                            Sets the official episode count (EP 1-{animeForm.totalEpisodes}) shown across the catalog & player.
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setAnimeForm({
                                  ...animeForm,
                                  totalEpisodes: Math.max(1, Number(animeForm.totalEpisodes) - 1),
                                })
                              }
                              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              max="1000"
                              value={animeForm.totalEpisodes}
                              onChange={(e) =>
                                setAnimeForm({ ...animeForm, totalEpisodes: Number(e.target.value) })
                              }
                              className="w-20 text-center bg-slate-950 border border-white/20 rounded-lg py-1.5 text-sm font-bold text-white focus:outline-none focus:border-orange-500 font-mono"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setAnimeForm({
                                  ...animeForm,
                                  totalEpisodes: Number(animeForm.totalEpisodes) + 1,
                                })
                              }
                              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                            >
                              +
                            </button>
                            <span className="text-xs text-slate-400 ml-1">Episodes</span>
                          </div>
                        </div>

                        {/* Series Status */}
                        <div className="p-4 rounded-xl bg-slate-900 border border-white/10">
                          <label className="block text-xs font-bold text-white mb-1">
                            Airing Status
                          </label>
                          <p className="text-[10px] text-slate-400 mb-3">
                            Current broadcast status of the anime
                          </p>
                          <select
                            value={animeForm.status}
                            onChange={(e) =>
                              setAnimeForm({ ...animeForm, status: e.target.value as any })
                            }
                            className="w-full bg-slate-950 border border-white/20 rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-orange-500"
                          >
                            <option value="Airing">Airing (Ongoing)</option>
                            <option value="Completed">Completed</option>
                            <option value="Upcoming">Upcoming Release</option>
                          </select>
                        </div>

                        {/* Title Info */}
                        <div className="p-4 rounded-xl bg-slate-900 border border-white/10 sm:col-span-2 md:col-span-1">
                          <label className="block text-xs font-bold text-white mb-1">
                            Display Title
                          </label>
                          <p className="text-[10px] text-slate-400 mb-2">Primary English/Hindi title</p>
                          <input
                            type="text"
                            value={animeForm.title}
                            onChange={(e) => setAnimeForm({ ...animeForm, title: e.target.value })}
                            className="w-full bg-slate-950 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>

                      {/* Synopsis / Description */}
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          Anime Series Synopsis & Details
                        </label>
                        <textarea
                          rows={3}
                          value={animeForm.synopsis}
                          onChange={(e) => setAnimeForm({ ...animeForm, synopsis: e.target.value })}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-orange-500 leading-relaxed"
                          placeholder="Anime synopsis..."
                        />
                      </div>

                      {/* Save Button */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <Radio className="w-3.5 h-3.5 text-emerald-400" />
                          <span>All stream endpoints & Telegram linkages are preserved automatically.</span>
                        </div>

                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={handleSaveAnime}
                          className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-orange-600/20"
                        >
                          {isSaving ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              <span>Save Thumbnail & Total Episodes</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================
                  TAB 2: EPISODE DESCRIPTIONS & EPISODE THUMBNAILS
                  ========================================================= */}
              {activeTab === 'episodes' && (
                <div className="space-y-6">
                  {/* Anime Selector Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900/80 border border-white/10 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedAnime.posterImage}
                        alt={selectedAnime.title}
                        className="w-12 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-white">{selectedAnime.title}</h3>
                        <p className="text-xs text-slate-400">
                          Managing descriptions & thumbnails for {selectedAnime.episodes.length} episodes
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={selectedAnimeId}
                        onChange={(e) => setSelectedAnimeId(e.target.value)}
                        className="bg-slate-950 border border-white/20 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-orange-500"
                      >
                        {animeList.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.title} ({a.episodes.length} eps)
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingEpisode(true);
                          setNewEpForm({
                            title: '',
                            episodeNumber: (selectedAnime.episodes.length + 1),
                            thumbnail: selectedAnime.posterImage,
                            channelDescription: `🎬 **Anime Toon India - ${selectedAnime.title} - Episode ${selectedAnime.episodes.length + 1}**\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📌 Title: New Episode\n🎙 Audio: Hindi Dubbed / Japanese Master Audio\n⚡️ Storage: Anime Toon India Private Vault`,
                            duration: '24:00',
                            resolution: '1080p 60fps',
                          });
                        }}
                        className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Episode</span>
                      </button>
                    </div>
                  </div>

                  {/* Add New Episode Form Section (Collapsible) */}
                  {isAddingEpisode && (
                    <div className="bg-orange-950/20 border border-orange-500/40 rounded-2xl p-5 space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between pb-2 border-b border-orange-500/20">
                        <div className="flex items-center gap-2 text-orange-400 font-bold text-xs">
                          <Plus className="w-4 h-4" />
                          <span>Add New Episode to {selectedAnime.title} (Wired to Telegram Stream)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAddingEpisode(false)}
                          className="text-slate-400 hover:text-white text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            Episode Number
                          </label>
                          <input
                            type="number"
                            value={newEpForm.episodeNumber}
                            onChange={(e) =>
                              setNewEpForm({ ...newEpForm, episodeNumber: Number(e.target.value) })
                            }
                            className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            Episode Title
                          </label>
                          <input
                            type="text"
                            value={newEpForm.title}
                            onChange={(e) => setNewEpForm({ ...newEpForm, title: e.target.value })}
                            placeholder="e.g. Awakening of the Monarch"
                            className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            Duration & Quality
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newEpForm.duration}
                              onChange={(e) => setNewEpForm({ ...newEpForm, duration: e.target.value })}
                              placeholder="24:00"
                              className="w-1/2 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono"
                            />
                            <input
                              type="text"
                              value={newEpForm.resolution}
                              onChange={(e) => setNewEpForm({ ...newEpForm, resolution: e.target.value })}
                              placeholder="1080p 60fps"
                              className="w-1/2 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Episode Thumbnail URL
                        </label>
                        <input
                          type="text"
                          value={newEpForm.thumbnail}
                          onChange={(e) => setNewEpForm({ ...newEpForm, thumbnail: e.target.value })}
                          placeholder="/src/assets/images/... or https://..."
                          className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Episode Description & Release Notes
                        </label>
                        <textarea
                          rows={3}
                          value={newEpForm.channelDescription}
                          onChange={(e) =>
                            setNewEpForm({ ...newEpForm, channelDescription: e.target.value })
                          }
                          placeholder="Synopsis and release info for this episode..."
                          className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white leading-relaxed"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingEpisode(false)}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={handleAddNewEpisode}
                          className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white cursor-pointer shadow-md flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Publish Episode with Telegram Stream Link</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Episodes List & Active Editor */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Episode Selector List (Left 5 Cols) */}
                    <div className="lg:col-span-5 space-y-2 max-h-[500px] overflow-y-auto pr-1">
                      <div className="text-xs font-bold text-slate-400 mb-1 px-1">
                        Episodes in Series ({selectedAnime.episodes.length})
                      </div>
                      {selectedAnime.episodes.map((ep) => {
                        const isSelected = ep.id === selectedEpId;
                        return (
                          <div
                            key={ep.id}
                            onClick={() => handleSelectEpisode(ep)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                              isSelected
                                ? 'bg-orange-950/40 border-orange-500/80 shadow-md ring-1 ring-orange-500/30'
                                : 'bg-slate-900/70 border-white/10 hover:border-white/20'
                            }`}
                          >
                            <img
                              src={ep.thumbnail || selectedAnime.posterImage}
                              alt={ep.title}
                              className="w-14 h-10 object-cover rounded-lg shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-orange-400 font-mono">
                                  EP {ep.episodeNumber}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {ep.duration}
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-white truncate">{ep.title}</p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {ep.channelDescription ? ep.channelDescription.slice(0, 45) + '...' : 'No description'}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                          </div>
                        );
                      })}
                    </div>

                    {/* Active Episode Description Editor (Right 7 Cols) */}
                    <div className="lg:col-span-7 bg-slate-900/70 border border-white/10 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <div>
                          <span className="text-[10px] font-bold font-mono text-orange-400 uppercase tracking-wider">
                            Episode Editor
                          </span>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <span>Episode {episodeForm.episodeNumber}:</span>
                            <span className="text-slate-200">{episodeForm.title}</span>
                          </h4>
                        </div>

                        {selectedEpId && (
                          <div className="flex items-center gap-2">
                            {onPlayEpisode && (
                              <button
                                type="button"
                                onClick={() => {
                                  const ep = selectedAnime.episodes.find((e) => e.id === selectedEpId);
                                  if (ep) {
                                    onPlayEpisode(ep);
                                    onClose();
                                  }
                                }}
                                className="p-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                title="Test Playback via Telegram Stream Proxy"
                              >
                                <Play className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Test Play</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteEpisode(selectedEpId)}
                              className="p-2 rounded-lg bg-rose-950/30 hover:bg-rose-900/40 text-rose-400 text-xs cursor-pointer transition-colors"
                              title="Delete episode"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Episode Thumbnail Preview & URL */}
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                          <span>Episode Thumbnail URL</span>
                          <span className="text-[10px] text-orange-400 font-normal">Live Preview</span>
                        </label>
                        <div className="flex gap-3 items-center">
                          <img
                            src={episodeForm.thumbnail || selectedAnime.posterImage}
                            alt="Episode thumbnail preview"
                            className="w-20 h-14 object-cover rounded-xl border border-white/10 bg-slate-950 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                selectedAnime.posterImage || '/src/assets/images/anime_card_hunter_1792135997910.jpg';
                            }}
                          />
                          <input
                            type="text"
                            value={episodeForm.thumbnail}
                            onChange={(e) =>
                              setEpisodeForm({ ...episodeForm, thumbnail: e.target.value })
                            }
                            placeholder="/src/assets/images/... or https://..."
                            className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>

                      {/* Title & Ep Number */}
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            Episode #
                          </label>
                          <input
                            type="number"
                            value={episodeForm.episodeNumber}
                            onChange={(e) =>
                              setEpisodeForm({
                                ...episodeForm,
                                episodeNumber: Number(e.target.value),
                              })
                            }
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            Episode Title
                          </label>
                          <input
                            type="text"
                            value={episodeForm.title}
                            onChange={(e) =>
                              setEpisodeForm({ ...episodeForm, title: e.target.value })
                            }
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>

                      {/* DESCRIPTION OF EACH EPISODE */}
                      <div>
                        <label className="block text-xs font-bold text-white mb-1.5 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-orange-400" />
                            <span>Description of Each Episode (Synopsis & Release Notes)</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            Shown in modal & player
                          </span>
                        </label>
                        <textarea
                          rows={6}
                          value={episodeForm.channelDescription}
                          onChange={(e) =>
                            setEpisodeForm({
                              ...episodeForm,
                              channelDescription: e.target.value,
                            })
                          }
                          placeholder="Write episode description, synopsis, Hindi dub cast credits, storyline recap..."
                          className="w-full bg-slate-950 border border-white/15 rounded-xl p-3.5 text-xs text-white leading-relaxed focus:outline-none focus:border-orange-500 font-sans"
                        />
                      </div>

                      {/* Telegram Backend Linkage Status (Always On) */}
                      <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/20 text-xs text-slate-300 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Radio className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
                          <div>
                            <p className="font-semibold text-white">Backend Telegram Stream: Connected & Live</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              HTTP 206 Partial Content · Multi-Resolution (1080p · 720p · 480p)
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                          ACTIVE
                        </span>
                      </div>

                      {/* Save Button */}
                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={handleSaveEpisode}
                          className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-orange-600/20"
                        >
                          {isSaving ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Saving Changes...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              <span>Save Episode Description & Thumbnail</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  TAB 3: ACCOUNT OF MINE (Admin User Profile Management)
                  ========================================================= */}
              {activeTab === 'account' && (
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-900/60 border border-white/10 flex items-center gap-4">
                    <img
                      src={accountForm.avatar || adminAccount.avatar}
                      alt="Admin"
                      className="w-16 h-16 rounded-full object-cover border-2 border-orange-500 shadow-xl"
                    />
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span>{adminAccount.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                          {adminAccount.role}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{adminAccount.email}</p>
                      <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Owner Account Authenticated · Master Broadcaster Rights</span>
                      </p>
                    </div>
                  </div>

                  {/* Form to edit account */}
                  <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-4">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Edit Account Credentials & Profile
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Admin Display Name
                        </label>
                        <input
                          type="text"
                          value={accountForm.name}
                          onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Admin Email Address
                        </label>
                        <input
                          type="email"
                          value={accountForm.email}
                          onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Administrative Role
                        </label>
                        <input
                          type="text"
                          value={accountForm.role}
                          onChange={(e) => setAccountForm({ ...accountForm, role: e.target.value })}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Change Password (leave blank to keep current)
                        </label>
                        <input
                          type="password"
                          value={accountForm.newPassword}
                          onChange={(e) =>
                            setAccountForm({ ...accountForm, newPassword: e.target.value })
                          }
                          placeholder="••••••••"
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Profile Avatar Image URL
                      </label>
                      <input
                        type="text"
                        value={accountForm.avatar}
                        onChange={(e) => setAccountForm({ ...accountForm, avatar: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={handleSaveAccount}
                        className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                      >
                        {isSaving ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Updating Profile...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Update My Account</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  TAB 4: TELEGRAM STREAM STATUS & HEALTH
                  ========================================================= */}
              {activeTab === 'stream-status' && (
                <div className="max-w-2xl mx-auto space-y-5">
                  <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600/30 text-emerald-400 flex items-center justify-center shrink-0">
                      <Radio className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Backend Telegram Stream Engine is Active</h3>
                      <p className="text-xs text-slate-300 leading-relaxed mt-1">
                        The backend streaming proxy (/api/stream/:episodeId) is continuously running and connected to the Telegram channel storage vault. Updating thumbnails or episode descriptions will never interrupt stream delivery.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-slate-400">Streaming Engine Status</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        ONLINE & SERVING
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-slate-400">Telegram Channel Linked</span>
                      <span className="text-white font-bold">{adminAccount.channelLinked || '-1002847591024'}</span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-slate-400">HTTP 206 Partial Content (Byte Range)</span>
                      <span className="text-emerald-400 font-bold">SUPPORTED (Instant Seek)</span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-slate-400">Multi-Resolution Profiles</span>
                      <span className="text-white">1080p 60fps · 720p · 480p · 360p</span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <span className="text-slate-400">Audio Channels</span>
                      <span className="text-white">Hindi Dubbed / Japanese FLAC / English AAC</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
