export interface ContentItem {
  id: string;
  title: string;
  author: string;
  url: string;
  content: string;
  category: string;
  date: string;
  image: string;
  imageSource?: 'sheet' | 'webpage' | 'fallback';
}

export interface SheetApiResponse {
  success: boolean;
  sourceType: 'google_sheets_api' | 'gviz_public' | 'csv_public' | 'sample_fallback';
  sheetId: string;
  notice?: string;
  count: number;
  items: ContentItem[];
  categories: string[];
  authors: string[];
  fetchedAt: string;
  error?: string;
}

export interface ExtractedImageItem {
  src: string;
  alt?: string;
  caption?: string;
}

export interface ExtractedContentResponse {
  success: boolean;
  title?: string;
  author?: string;
  date?: string;
  excerpt?: string;
  contentHtml?: string;
  leadImage?: string;
  allImages?: ExtractedImageItem[];
  domain?: string;
  url: string;
  readingTime?: string;
  wordCount?: number;
  error?: string;
}

export type SortOption = 'newest' | 'oldest' | 'a-z' | 'z-a' | 'author';
export type ActiveTab = 'home' | 'explore' | 'about';
