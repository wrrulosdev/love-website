export type ApiPhoto = {
  location: undefined;
  id: number;
  title: string | null;
  description: string | null;
  date: string | null;
  category: string;
  in_book: boolean;
  in_timeline: boolean;
  created_at: string | null;
  updated_at: string | null;
  image_url: string;
};

export type ApiResponse = {
  status: string;
  title?: string;
  data?: {
    photos?: ApiPhoto[];
  };
};
