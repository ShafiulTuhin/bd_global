export function camelCase(str) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
}

export function keysToLowerCase(obj = {}) {
  var key,
    keys = Object.keys(obj);
  var n = keys.length;
  var newObj = {};
  while (n--) {
    key = keys[n];
    newObj[key.toLowerCase()] = obj[key];
  }
  return newObj;
}

export function objectToQuery(obj) {
  if (!obj) {
    return "";
  }

  if (typeof obj == "string") return `?${obj.split("?")[1]}`;

  return `?${new URLSearchParams(obj).toString()}`;
}

export function financial(x, precision = 2) {
  return (Number.parseFloat(x) || 0).toFixed(precision);
}
