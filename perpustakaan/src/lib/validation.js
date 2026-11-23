export const CAMPUS_EMAIL_DOMAIN = "@student.unhas.ac.id";

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}