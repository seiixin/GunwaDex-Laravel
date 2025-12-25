
export const mockStories = [
  { id: 1, slug: "gayuma", title: "GAYUMA", rating_avg: 5.0, type: "Fantasy", author: { username: "laura", display_name: "Laura Sakuraki" } },
  { id: 2, slug: "prince-of-underworld", title: "Prince of Underworld", rating_avg: 4.6, type: "Fantasy", author: { username: "seixin", display_name: "Sei Xin" } },
  { id: 3, slug: "curtain-call", title: "Curtain Call", rating_avg: 4.6, type: "Romance", author: { username: "seixin", display_name: "Sei Xin" } },
  { id: 4, slug: "aster", title: "Aster", rating_avg: 4.6, type: "Slice of Life", author: { username: "vynscarley", display_name: "Vynscarley" } },
];

export const mockEpisodes = [
  { id: 101, episode_no: 1, views_count: 13041, published_at: "10/31/25", story: mockStories[0] },
  { id: 102, episode_no: 2, views_count: 7607, published_at: "11/01/25", story: mockStories[0] },
  { id: 103, episode_no: 3, views_count: 9607, published_at: "11/02/25", story: mockStories[0] },
];
