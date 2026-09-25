export const DUMMY_CATEGORIES = ['general', 'news', 'tech', 'finance'] as const;
export type DummyCategory = (typeof DUMMY_CATEGORIES)[number];

/** A dummy record as returned by the API (Laravel: `DummyResource`). */
export interface Dummy {
  id: number;
  title: string;
  category: DummyCategory;
  description: string | null;
  created_at: string;
  updated_at: string;
}

/** What the create / edit form sends. */
export interface DummyPayload {
  title: string;
  category: DummyCategory;
  description: string;
}
