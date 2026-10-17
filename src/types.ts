export interface QualityVariant {
  quality: '1080p' | '720p' | '480p' | '360p';
  label: string;
  resolution: string;
  fileSize: number;
  bitrate: string;
  telegramFileId: string;
  streamUrl: string;
}

export interface Episode {
  id: string;
  animeId: string;
  episodeNumber: number;
  title: string;
  duration: string;
  durationSeconds: number;
  thumbnail: string;
  telegramFileId: string;
  telegramMessageId?: number;
  telegramChatId: string;
  fileSize: number;
  mimeType: string;
  resolution: string;
  streamUrlFallback: string;
  uploadDate: string;
  subtitles: { lang: string; label: string; src: string }[];
  // Channel post caption & details
  channelDescription: string;
  telegramPostDate: string;
  telegramViews: number;
  telegramForwards: number;
  qualities: QualityVariant[];
}

export interface Anime {
  id: string;
  title: string;
  japaneseTitle: string;
  synopsis: string;
  bannerImage: string;
  posterImage: string;
  rating: number;
  year: number;
  season: string;
  status: 'Airing' | 'Completed' | 'Upcoming';
  studio: string;
  genres: string[];
  totalEpisodes: number;
  seriesType?: 'TV' | 'Movie' | 'OVA';
  isRecentlyAdded?: boolean;
  recentlyAddedDate?: string;
  episodes: Episode[];
  telegramChannel: string;
  rankToday: number;
  rankWeek: number;
  rankMonth: number;
  rankAll: number;
  viewsToday: string;
  viewsWeek: string;
  viewsMonth: string;
  viewsAll: string;
  audioLangs: string[];
}

export interface TelegramConfig {
  hasToken: boolean;
  channelId: string;
  channelTitle: string;
  botUsername: string;
  isConnected: boolean;
  lastChecked: string | null;
  storedEpisodesCount: number;
}

export interface StreamDiagnostics {
  success: boolean;
  episodeId: string;
  title: string;
  telegramChatId: string;
  telegramFileId: string;
  status: number;
  is206PartialContent: boolean;
  latencyMs: number;
  rangeTested: string;
  headers: {
    'content-range'?: string;
    'content-length'?: string;
    'accept-ranges'?: string;
    'content-type'?: string;
  };
  seamlessStreamingCheck: {
    supportsByteSeeking: boolean;
    partialContentVerified: boolean;
    telegramStorageLinked: boolean;
    performanceRating: string;
  };
}

export interface NotificationSettings {
  browserPushEnabled: boolean;
  telegramAlertsEnabled: boolean;
  soundEnabled: boolean;
  notifyOnAllReleases: boolean;
  subscribedAnimeIds: string[];
  telegramUserChatId: string;
}

export interface ReleaseNotification {
  id: string;
  animeId: string;
  animeTitle: string;
  episodeId: string;
  episodeNumber: number;
  episodeTitle: string;
  quality: string;
  channelName: string;
  timestamp: string;
  read: boolean;
  channelCaptionSnippet: string;
}

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  channelLinked: string;
  lastLogin: string;
}
