const { spawn } = require("child_process");
const exec = util.promisify(require("child_process").spawn);

module.exports = async function generateWallet(type) {
  try {
    const command = `tatum-kms generatemanagedwallet ${String(
      type
    )?.toUpperCase()}`;
    const bash = spawn(command);

    bash.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
      return 'Done'
    });

    bash.on("error", (data) => {
      console.error(`stderr: ${data}`);
      return 'Error'
    });

    bash.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
      return 'Closed'
    });

    console.log('called afterwards')
  } catch (err) {
    console.error(err);
  }
};

process.on("unhandledRejection", (err) => {
  console.error(err);
  process.exit(1);
});
