import React from 'react';
import { Search, X, Sparkles, Filter, Check, TrendingUp } from 'lucide-react';
import { Anime } from '../types';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  resultCount: number;
  totalCount: number;
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
  genres: string[];
  onSelectAnime?: (anime: Anime) => void;
}

const POPULAR_SEARCH_TAGS = [
  'Solo Leveling',
  'Demon Slayer',
  'Jujutsu Kaisen',
  'Hindi Dub',
  'Action',
  'Fantasy',
  'Chainsaw Man',
  'Attack on Titan',
];

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  resultCount,
  totalCount,
  selectedGenre,
  setSelectedGenre,
  genres,
}) => {
  const isFiltering = searchQuery.trim().length > 0 || selectedGenre !== 'All';

  const handleClear = () => {
    setSearchQuery('');
    setSelectedGenre('All');
  };

  return (
    <div className="w-full bg-[#0d131f]/90 border border-white/10 rounded-2xl p-4 sm:p-6 mb-8 backdrop-blur-md shadow-xl shadow-black/40">
      {/* Search Input Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Main Search Input */}
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
            <Search className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search anime title, Hindi dub, Japanese name, or genre..."
            className="w-full bg-slate-900/90 border border-white/15 focus:border-orange-500 rounded-xl pl-11 pr-10 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all shadow-inner"
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Clear search query"
              aria-label="Clear search query"
            >
              <div className="w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center">
                <X className="w-3.5 h-3.5" />
              </div>
            </button>
          )}
        </div>

        {/* Reset / Clear All Filters */}
        {isFiltering && (
          <button
            onClick={handleClear}
            className="px-4 py-3 text-xs font-semibold text-orange-400 hover:text-white bg-orange-500/10 hover:bg-orange-600 rounded-xl border border-orange-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            <X className="w-4 h-4" />
            <span>Reset Search</span>
          </button>
        )}
      </div>

      {/* Popular Quick Search Chips */}
      <div className="mt-3.5 flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 shrink-0">
          <TrendingUp className="w-3 h-3 text-orange-400" />
          <span>Popular:</span>
        </span>
        {POPULAR_SEARCH_TAGS.map((tag) => {
          const isActive = searchQuery.toLowerCase() === tag.toLowerCase();
          return (
            <button
              key={tag}
              onClick={() => {
                if (isActive) {
                  setSearchQuery('');
                } else {
                  setSearchQuery(tag);
                }
              }}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                isActive
                  ? 'bg-orange-500 text-white border-orange-500 font-medium shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border-white/5 hover:border-white/20'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* Genre Filter Bar & Live Results Counter */}
      <div className="mt-4 pt-4 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Genre buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-[11px] font-medium text-slate-400 mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3 text-slate-500" />
            <span>Genre:</span>
          </span>
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

        {/* Results summary pill */}
        <div className="text-xs text-slate-400 shrink-0 flex items-center gap-2">
          {isFiltering ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 font-medium">
              <Sparkles className="w-3 h-3" />
              Found {resultCount} of {totalCount} anime
            </span>
          ) : (
            <span className="text-slate-500">
              Showing all {totalCount} anime series
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
