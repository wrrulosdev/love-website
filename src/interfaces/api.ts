export type Photo = {
  location: string;
  id: number;
  title: string;
  description: string;
  date: string;
  category: string;
  in_book: boolean;
  in_timeline: boolean;
  created_at: string;
  updated_at: string;
  image_url: string;
};

export type Card = {
  id: number;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  card_date: string;
  author: string;
};

export type ApiResponse<T> = {
  status: string;
  title: string;
  data?: T;
};
