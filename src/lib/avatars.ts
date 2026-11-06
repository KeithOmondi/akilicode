const FALLBACK_AVATARS = ["🦊", "🐼", "🦁", "🐸", "🐙", "🦄", "🐯", "🐨"];
const WORD_AVATARS: Record<string, string> = {
  fox: "🦊", panda: "🐼", lion: "🦁", frog: "🐸", octopus: "🐙", unicorn: "🦄", tiger: "🐯", koala: "🐨",
};

/** A child's `avatar` may be an emoji or a word like "lion"; always show an emoji. */
export const avatarOf = (kid: { avatar?: string | null }, i = 0): string =>
  (kid.avatar && (WORD_AVATARS[kid.avatar.toLowerCase()] ?? (kid.avatar.length <= 4 ? kid.avatar : null))) ||
  FALLBACK_AVATARS[i % FALLBACK_AVATARS.length];
