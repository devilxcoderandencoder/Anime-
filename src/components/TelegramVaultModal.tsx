import React, { useState } from 'react';
import {
  X,
  Database,
  Key,
  Radio,
  Upload,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Film,
  HardDrive,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { TelegramConfig, Anime } from '../types';

interface TelegramVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TelegramConfig | null;
  onConfigUpdated: () => void;
  animeList: Anime[];
  onEpisodeAdded: () => void;
}

export const TelegramVaultModal: React.FC<TelegramVaultModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigUpdated,
  animeList,
  onEpisodeAdded,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'config' | 'upload' | 'guide'>('config');

  // Config form state
  const [botToken, setBotToken] = useState<string>('');
  const [channelId, setChannelId] = useState<string>(config?.channelId || '-1002847591024');
  const [channelTitle, setChannelTitle] = useState<string>(config?.channelTitle || 'AniStream Private Vault');
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
    details?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Upload form state
  const [selectedAnimeId, setSelectedAnimeId] = useState<string>(animeList[0]?.id || '');
  const [uploadEpTitle, setUploadEpTitle] = useState<string>('');
  const [uploadEpNumber, setUploadEpNumber] = useState<string>('');
  const [uploadResolution, setUploadResolution] = useState<string>('1080p 60fps');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/telegram/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken, channelId }),
      });
      const data = await res.json();
      if (res.ok && data.connected) {
        setTestResult({
          success: true,
          message: data.message,
          details: `Bot Username: @${data.bot?.username || 'Verified'} | Channel: ${data.channelTitle}`,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || data.message || 'Connection failed',
          details: 'Verify that your Bot Token is valid and the bot is an admin in the channel.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Connection error: ${err.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/telegram/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken, channelId, channelTitle }),
      });
      const data = await res.json();
      if (res.ok) {
        setTestResult({
          success: true,
          message: data.message || 'Telegram configuration saved successfully!',
        });
        onConfigUpdated();
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Failed to save configuration',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimeId || !uploadEpTitle) {
      setUploadStatus('Please specify the anime and episode title.');
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);
    try {
      const formData = new FormData();
      formData.append('animeId', selectedAnimeId);
      formData.append('title', uploadEpTitle);
      formData.append('episodeNumber', uploadEpNumber);
      formData.append('resolution', uploadResolution);
      if (selectedFile) {
        formData.append('videoFile', selectedFile);
      }

      const res = await fetch('/api/telegram/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setUploadStatus(`Success! Episode stored in Telegram channel. File ID: ${data.episode?.telegramFileId}`);
        setUploadEpTitle('');
        setUploadEpNumber('');
        setSelectedFile(null);
        onEpisodeAdded();
        onConfigUpdated();
      } else {
        setUploadStatus(`Upload failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setUploadStatus(`Error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0d131f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#090d16]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Telegram Channel Episode Storage
              </h3>
              <p className="text-xs text-slate-400">
                Manage backend storage vault & stream bridge
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
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-white/10 bg-slate-900/50">
          <button
            onClick={() => setActiveSubTab('config')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 ${
              activeSubTab === 'config'
                ? 'border-orange-500 text-white bg-white/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Bot & Channel Credentials
          </button>
          <button
            onClick={() => setActiveSubTab('upload')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 ${
              activeSubTab === 'upload'
                ? 'border-orange-500 text-white bg-white/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Upload / Dispatch Media
          </button>
          <button
            onClick={() => setActiveSubTab('guide')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 ${
              activeSubTab === 'guide'
                ? 'border-orange-500 text-white bg-white/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Architecture Guide
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeSubTab === 'config' && (
            <form onSubmit={handleSaveConfig} className="space-y-4">
              {/* Channel ID */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Telegram Private Channel ID or @Username
                </label>
                <div className="relative">
                  <Radio className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={channelId}
                    onChange={(e) => setChannelId(e.target.value)}
                    placeholder="-1002847591024 or @MyPrivateAnimeVault"
                    className="w-full bg-slate-900/90 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Private channel IDs start with <span className="font-mono text-slate-400">-100</span>.
                </p>
              </div>

              {/* Bot Token */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Telegram Bot API Token (from @BotFather)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ (Optional for demo vault)"
                    className="w-full bg-slate-900/90 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Leave empty to operate in seamless demo vault mode with pre-indexed files.
                </p>
              </div>

              {/* Vault Label */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Channel Vault Label
                </label>
                <input
                  type="text"
                  value={channelTitle}
                  onChange={(e) => setChannelTitle(e.target.value)}
                  placeholder="e.g. AniStream Primary Vault"
                  className="w-full bg-slate-900/90 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Feedback Alert */}
              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                    testResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  )}
                  <div>
                    <p className="font-semibold">{testResult.message}</p>
                    {testResult.details && (
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        {testResult.details}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isLoading}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Test Connection</span>
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          )}

          {activeSubTab === 'upload' && (
            <form onSubmit={handleUploadEpisode} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Select Anime Series
                </label>
                <select
                  value={selectedAnimeId}
                  onChange={(e) => setSelectedAnimeId(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  {animeList.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title} ({a.episodes.length} eps)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Episode Number
                  </label>
                  <input
                    type="number"
                    value={uploadEpNumber}
                    onChange={(e) => setUploadEpNumber(e.target.value)}
                    placeholder="e.g. 4"
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Resolution Quality
                  </label>
                  <select
                    value={uploadResolution}
                    onChange={(e) => setUploadResolution(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="1080p 60fps">1080p 60fps (Full HD)</option>
                    <option value="720p 60fps">720p 60fps (HD)</option>
                    <option value="4K UHD">4K UHD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Episode Title
                </label>
                <input
                  type="text"
                  value={uploadEpTitle}
                  onChange={(e) => setUploadEpTitle(e.target.value)}
                  placeholder="e.g. The Final Stand"
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              {/* File input */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Episode Video File (MP4, WebM, MKV)
                </label>
                <div className="border-2 border-dashed border-white/15 rounded-xl p-4 text-center hover:border-orange-500/50 transition-colors">
                  <Upload className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    className="text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-orange-600 file:text-white hover:file:bg-orange-500 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500 mt-2">
                    Videos uploaded will be dispatched to Telegram Channel ID <span className="font-mono text-slate-400">{channelId}</span> and minted into the catalog.
                  </p>
                </div>
              </div>

              {/* Telegram Channel Post Description / Caption */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Telegram Channel Post Caption / Description (Optional)
                </label>
                <textarea
                  rows={3}
                  value={uploadEpTitle ? `🎬 **Episode ${uploadEpNumber || 'New'}: ${uploadEpTitle}** [${uploadResolution}]\n📌 Format: Master Web-DL\n💬 Subtitles: English [Soft-Subs]\n⚡️ Stored in: ${channelTitle}` : ''}
                  onChange={() => {}}
                  placeholder="Leave empty to auto-generate formatted channel post with emojis, audio specs, hashtags, and message link..."
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-xs text-slate-300 placeholder-slate-500 font-mono focus:outline-none focus:border-orange-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  This exact formatted description will be displayed on the episode stream page just like it appears in Telegram.
                </p>
              </div>

              {uploadStatus && (
                <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-lg text-xs text-sky-300">
                  {uploadStatus}
                </div>
              )}

              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Uploading to Telegram Channel...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload & Link to Telegram Vault</span>
                  </>
                )}
              </button>
            </form>
          )}

          {activeSubTab === 'guide' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-white/10 space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Film className="w-4 h-4 text-orange-400" />
                  How Telegram Storage & Media Streaming Works
                </h4>
                <p className="text-slate-400">
                  Telegram provides unlimited cloud file storage (up to 2GB per file) on private channels. This architecture turns Telegram into a zero-cost, high-speed anime media server.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="font-semibold text-white mb-1">1. Media Storage in Private Channel</p>
                  <p className="text-slate-400">
                    Each episode is uploaded to your Telegram private channel. Telegram assigns a permanent <code className="text-orange-400 font-mono">file_id</code> and message ID.
                  </p>
                </div>

                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="font-semibold text-white mb-1">2. HTTP 206 Partial Content Range Proxy</p>
                  <p className="text-slate-400">
                    When a user clicks Play or seeks the video, the browser sends an HTTP Range header (e.g. <code className="text-sky-300 font-mono">Range: bytes=1048576-</code>). AniStream’s backend proxies byte requests to Telegram’s CDN, piping chunks directly back with status <code className="text-emerald-400 font-mono">206 Partial Content</code>.
                  </p>
                </div>

                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="font-semibold text-white mb-1">3. Instant Seeking & Zero Buffering</p>
                  <p className="text-slate-400">
                    Because the backend supports standard byte-range requests, video players scrub backwards and forwards instantly without redownloading the full 500MB episode file.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="https://core.telegram.org/bots/api#getfile"
                  target="_blank"
                  rel="noreferrer"
                  className="text-orange-400 hover:text-orange-300 flex items-center gap-1.5 font-medium"
                >
                  <span>Telegram Bot API File Documentation</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
