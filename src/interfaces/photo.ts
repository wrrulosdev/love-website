export type FilterOption = 'Todas' | 'Citas' | 'Viajes' | 'Casual';

export type Photo = {
  id: number;
  hash: string;
  category: FilterOption;
  thumb: string;
  full: string;
  title: string;
  description: string;
  date: string;
  location: string;
  in_book: boolean;
  in_timeline: boolean;
  created_at: string;
  updated_at: string;
};
