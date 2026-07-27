export type Child = {
  id: string;
  user_id: string;
  name: string;
  mother_name?: string | null;
  father_name?: string | null;
  photo_url: string | null;
  is_born: boolean;
  birth_date: string | null;
  due_date: string | null;
  last_period_date: string | null;
  birth_weight_grams: number | null;
  birth_height_cm: number | null;
  eye_color: string | null;
  hair_color: string | null;
  gender: string | null;
  created_at: string;
  updated_at: string;
};

export type CoverSettings = {
  child_id: string;
  font: string;
  background_color: string;
  background_image_path: string | null;
};

export type MomentMedia = {
  id: string;
  moment_id: string;
  url: string;
  media_type: "photo" | "video" | string;
  position: number;
};

export type Moment = {
  id: string;
  user_id: string;
  child_id: string | null;
  chapter_slug: string;
  title: string;
  raw_text: string | null;
  story_text: string | null;
  category: string;
  feeling: string | null;
  happened_on: string;
  place: string | null;
  tags: string[];
  cover_url: string | null;
  created_at: string;
  updated_at: string;
  moment_media?: MomentMedia[];
};

export type MomentInput = {
  title: string;
  raw_text: string;
  story_text: string | null;
  category: string;
  feeling: string | null;
  happened_on: string;
  place: string | null;
  tags: string[];
  chapter_slug: string;
  cover_url: string | null;
  media: { url: string; media_type: "photo" | "video" }[];
};
