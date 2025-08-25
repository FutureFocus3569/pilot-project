export type SiteCategory =
  | 'work'
  | 'hr'
  | 'childcare'
  | 'accounting'
  | 'supplies'
  | 'other';

export type NewSite = {
  name: string;
  url: string;
  username: string;
  password: string;
  category: SiteCategory;
  centre?: string; // optional so '' is fine
};
