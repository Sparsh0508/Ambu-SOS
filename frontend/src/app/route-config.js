export const roleHomePaths = {
  USER: "/patient/home",
  DRIVER: "/driver/dashboard",
  HOSPITAL_ADMIN: "/hospital/dashboard",
  CFR: "/cfr/dashboard",
};

export function getRoleHomePath(role) {
  return roleHomePaths[role] ?? "/";
}
