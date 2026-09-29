export const CATEGORY_TAGS_MAP: Record<string, string[]> = {
  'trending': [], // Trending doesn't use tags filter, it sorts by play_count
  'action': ['fighting', 'shoot-em-up', 'action', 'gun', 'survival', 'stickman', 'archery', 'fps', 'shooter'],
  'puzzle': ['logic', 'logical', 'sliding-puzzle', 'match3', 'matching', 'puzzle', 'sorting', 'thinking', 'brain', 'mahjong', 'sudoku'],
  'racing': ['car', 'track', 'driving', 'racing', 'bike', 'motorcycle', 'speed', 'truck', 'drift'],
  'sports': ['ball', 'sport', 'baseball', 'headsoccer', 'volleyball', 'football', 'soccer', 'basketball', 'tennis', 'golf'],
  'girls': ['girls', 'fashion', 'dressup', 'makeup', 'cooking', 'doll', 'princess'],
  'multiplayer': ['multiplayer', '2players', 'io', '2-players', 'coop', 'pvp']
};

export function applyCategoryFilter(query: any, category: string) {
  if (!category) return query;
  
  if (category === 'trending') {
    // Trending will be handled by sorting, so we just return the query
    return query;
  }

  const tags = CATEGORY_TAGS_MAP[category];
  if (tags && tags.length > 0) {
    return query.overlaps('tags', tags);
  } else {
    return query.contains('tags', [category]);
  }
}
