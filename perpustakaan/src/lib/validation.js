export const CAMPUS_EMAIL_DOMAIN = "@student.unhas.ac.id";

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isCampusEmail(email) {
  return /^[^\s@]+@([a-z0-9-]+\.)+ac\.id$/i.test(email);
}
