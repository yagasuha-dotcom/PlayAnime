export type UserRole = "admin" | "donatur" | "rakyat_konoha";

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  role: UserRole;
  keys: number;
  exp: number;
  level: number;
  donatur_until: string | null;
  created_at: string;
}

export const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Admin",
  donatur: "Donatur",
  rakyat_konoha: "Rakyat Konoha",
};

export const ROLE_COLOR: Record<UserRole, string> = {
  admin: "text-red-400 border-red-400/40 bg-red-400/10",
  donatur: "text-amber-300 border-amber-300/40 bg-amber-300/10",
  rakyat_konoha: "text-mute border-line bg-panel2",
};

export function isDonaturActive(p: Pick<Profile, "donatur_until">): boolean {
  return !!p.donatur_until && new Date(p.donatur_until) > new Date();
}

// exp kumulatif dibutuhkan buat naik ke level tertentu, mengikuti
// rumus di recalc_level() SQL: level = floor(sqrt(exp/50)) + 1
export function expForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 50;
}
