export function pickMessage(messages, key) {
  return typeof key === "string" && Object.hasOwn(messages, key)
    ? messages[key]
    : null;
}