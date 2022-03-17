const { spawn } = require("child_process");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

/**
 *
 * @param {String} command
 */
module.exports = async (command) => {
  try {
    const bash = await exec(command);
    const { stdout, stderr } = bash;
    if (!stdout) throw new Error(stderr);
    return JSON.parse(stdout);
  } catch (error) {
    console.error(error);
  }
  /* , (error, stdout, stderr) => {
    console.log({ error, stdout, stderr });
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      //   if (stderr) {
      //     console.log(`stderr: ${stderr}`);
      //     return;
      //   }
      // console.log(`stdout: ${stdout}`);
      if (stdout) return JSON.parse(stdout);
  }); */
};
