// Emoji shown next to each News category pill/badge — matches
// server/models/News.js's NEWS_CATEGORIES exactly. Kept out of
// translations.js since an emoji doesn't need localizing, just the label
// text next to it (news.category<Key> in translations.js).
export const NEWS_CATEGORY_EMOJI = {
  Health: "🩺",
  Education: "🎓",
  Sports: "⚽",
  SelfEmployment: "💼",
  DisasterRelief: "🚑",
  CommunityDevelopment: "🤝",
  General: "📢",
};

export const NEWS_CATEGORIES = ["Health", "Education", "Sports", "SelfEmployment", "DisasterRelief", "CommunityDevelopment", "General"];
