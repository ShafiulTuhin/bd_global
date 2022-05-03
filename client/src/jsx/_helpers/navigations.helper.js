export function toQueryString(obj) {
  if (!obj) {
  }

  if (typeof obj == "string") return `?${obj.split("?")[1]}`;

  return `?${new URLSearchParams(obj).toString()}`;
}
