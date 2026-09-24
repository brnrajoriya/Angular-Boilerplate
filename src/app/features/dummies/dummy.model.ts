export const DUMMY_CATEGORIES = ['general', 'news', 'tech', 'finance'] as const;
export type DummyCategory = (typeof DUMMY_CATEGORIES)[number];

export interface Dummy {
  id: number;
  title: string;
  category: DummyCategory;
  description: string;
  created_at: string;
}

/** What the create / edit form sends. */
export type DummyPayload = Pick<Dummy, 'title' | 'category' | 'description'>;
