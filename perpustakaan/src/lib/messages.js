// Safely looks up a flash message code coming from the URL (?msg=...).
// Object.hasOwn prevents keys like "constructor" from matching.
export function pickMessage(messages, key) {
  return typeof key === "string" && Object.hasOwn(messages, key)
    ? messages[key]
    : null;
}
