import history from "./history.helper";
import store from "./store.helper";
import headers from "./headers.helper";
import { notify } from "./notify";
const helpers = {
  history,
  store,
  headers,
  notify,
};

/**
 * @function isBetween
 * @description Checks if a number is within a numerica constraint
 * @param {Number} number
 * @param {Number} min
 * @param {Number} max
 * @returns
 */
export function isBetween(number, min, max) {
  return number >= min && number <= max;
}

export function deepObjectStringify(obj) {
  return (
    obj &&
    Object.values(obj)
      .map(
        (val) => (typeof val === "object" && deepObjectStringify(val)) || val
      )
      .join("")
  );
}

export function queryToObject(searchQuery) {
  return (
    searchQuery?.length &&
    JSON.parse(
      '{"' +
        decodeURI(searchQuery)
          .replace(/"/g, `"`)
          .replace(/&/g, `","`)
          .replace(/=/g, `":"`) +
        '"}'
    )
  );
}
export default helpers;
