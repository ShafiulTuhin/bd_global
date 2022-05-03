module.exports = {
  /**
   * function filter out unwanted fields
   * @param {Object} args
   * @param {Object} args.object
   * @param {String[]} args.include
   * @param {String[]} args.exclude
   * @param {Boolean} args.allowNull
   * @returns {Promise<Object>}
   */
  filterFields: async ({
    object = {},
    include = [],
    exclude = [],
    allowNull = false,
  }) => {
    let result = {};

    if (include.length && exclude.length)
      throw new Error("you must provide one of include or exclude");

    if (include.length) {
      Object.entries(object).forEach((data) => {
        if (include.includes(data[0])) {
          if (data[1] || allowNull) {
            result[data[0]] = data[1];
          }
        }
      });
    } else if (exclude.length) {
      Object.entries(object).forEach((data) => {
        if (!exclude.includes(data[0])) {
          if (data[1] || allowNull) {
            result[data[0]] = data[1];
          }
        }
      });
    } else {
      Object.entries(object).forEach((data) => {
        if (data[1] || allowNull) {
          result[data[0]] = data[1];
        }
      });
    }

    return result;
  },
};
