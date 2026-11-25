// Reference only. The register form now accepts any Indonesian academic
// domain (see isCampusEmail), for example student.unhas.ac.id or unhas.ac.id.
export const CAMPUS_EMAIL_DOMAIN = "@student.unhas.ac.id";

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// University email check: the domain must end in .ac.id
export function isCampusEmail(email) {
  return /^[^\s@]+@([a-z0-9-]+\.)+ac\.id$/i.test(email);
}
