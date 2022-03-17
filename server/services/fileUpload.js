const uuid = require("uuid");
const boom = require("@hapi/boom");
const fs = require("fs");
const { MIME_TYPES } = require("../constants");

module.exports = {
  /**
   *
   * @param {File} file
   * @param {Object} options
   * @returns
   */
  uploader(file, options = {}) {
    if (!file) throw new Error("no file(s)");

    return Array.isArray(file)
      ? _filesHandler(file, options)
      : _fileHandler(file, options);
  },

  /**
   *
   * @param {String} fileName
   * @returns
   */
  imageFilter(fileName) {
    // accept image only
    if (!fileName.match(/\.(jpg|jpeg|png|gif)$/)) {
      return false;
    }
    return true;
  },
};

/**
 * function return file extension base on the mimetype of the file
 * @param {String} mimetype
 * @returns {String}
 */
function getExtFromMimeType(mimetype) {
  let result = Object.entries(MIME_TYPES).find((value) => {
    return mimetype.toLowerCase() === value[1].toLowerCase();
  });

  return result ? result[0] : null;
}
/**
 *
 * @param {Object} file
 * @param {Object} options
 * @returns
 */
function _fileHandler(file, options) {
  if (!file) throw boom.badRequest("no file");

  const orignalname = file.hapi.filename;
  let ext = getExtFromMimeType(file.hapi.headers["content-type"]);

  if (!ext) {
    let ext = orignalname.split(".");
    ext = ext.length ? ext[ext.length - 1] : "jpg";
  }

  const filename = `${uuid.v1()}.${ext}`;
  const path = `${options.dest}${filename}`;
  const fileStream = fs.createWriteStream(path);

  return new Promise((resolve, reject) => {
    file.on("error", function(err) {
      reject(err);
    });

    file.pipe(fileStream);

    file.on("end", function(err) {
      const fileDetails = {
        fieldname: file.hapi.name,
        originalname: file.hapi.filename,
        filename,
        mimetype: file.hapi.headers["content-type"],
        destination: `${options.dest}`,
        path,
        size: fs.statSync(path).size,
      };

      resolve(fileDetails);
    });
  });
}

/**
 *
 * @param {File[]} files
 * @param {Object} options
 * @returns
 */
function _filesHandler(files, options) {
  if (!files || !Array.isArray(files)) throw boom.badRequest("no files");

  const promises = files.map((x) => _fileHandler(x, options));
  return Promise.all(promises);
}
