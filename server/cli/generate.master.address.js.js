const tatum = require("@tatumio/tatum");
const fs = require("fs");
const $PATH = require("path");
const config = require("dotenv").config({
  path: $PATH.join(__dirname, "..", "..", ".env"),
});
if (config.error) {
  throw config.error;
}
const $BACKUP_DIR = process.env.BACKUP_DIR; //General backup directory
const $KEYS_DIR = process.env.KEYS_DIR; //Where the keys will be stored (Not as backup)
const $KEYS_BACKUP_DIRNAME = ".cointc_keys"; //Keys directory name

const commandLineArgs = require("command-line-args");
const testnet = process.env.NODE_ENV == "development" ? true : false;
const optionDefinitions = [
  {
    name: "dir",
    alias: "d",
    type: String,
    defaultValue: $PATH.join(
      $BACKUP_DIR || $PATH.join(__dirname, "..", "..", "..", ".cointc_backup"),
      $KEYS_BACKUP_DIRNAME
    ),
  },
  { name: "name", alias: "n", type: String, defaultValue: "keys.json" },
];
const options = commandLineArgs(optionDefinitions);
const keyDir = $KEYS_DIR || options.dir;
// Backup in the $BACKUP_DIR/.cointc_keys or options.dir
const keyBackupDir = $PATH.join(
  options.dir,
  `backup-${new Date()?.toISOString().replace(/[-:./]/gi, "")}-${options.name}`
);
let keys;

try {
  keys = require($PATH.join(keyDir, options.name));
  console.info(`Found key: `, $PATH.join(keyDir, options.name));
} catch (error) {
  keys = {};
  console.warn(`Could not find module: ${keyDir}! Creating new keys\n`);
}
main();

async function main() {
  try {
    console.log("Starting: Master wallet generator...\n", {
      "Backup directory": keyBackupDir,
      "Keys directory": keyDir,
    });

    if (!fs.existsSync(options.dir)) {
      console.log(`Creating keys backup directory: ${options.dir}\n`);
      fs.mkdirSync(options.dir, { recursive: true });
      console.log(`Finished creating keys backup directory: ${options.dir}\n`);
    }
    if (!fs.existsSync(keyDir)) {
      console.log(`Creating a new keys directory: ${keyDir}`);
      fs.mkdirSync(keyDir, { recursive: true });
      console.log(`Finished creating keys directory: ${keyDir}\n`);
    }

    // Backups exsiting keys
    if (Object.keys(keys).length) {
      fs.writeFileSync(keyBackupDir, JSON.stringify(keys));
    }
    console.log(
      `Finished backup of ${$PATH.join(
        keyDir,
        options.name
      )} to ${keyBackupDir}\n`
    );

    await Promise.all([
      generateBTCWallet(),
      generateETHWallet(),
      generateBNBWallet(),
      generateXRPWallet(),
      generateTRONWallet(),
    ]).then((data) => {
      let generatedKeys = {};
      data.forEach((key) => {
        Object.assign(generatedKeys, key);
      });

      fs.writeFile(
        $PATH.join(keyDir, options.name),
        JSON.stringify(generatedKeys),
        function(err) {
          if (err) {
            console.error(err);
            return;
          }
          console.log(
            `Finished creating new master keys!\nCheck directory:`,
            keyDir
          );
        }
      );
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

async function generateBTCWallet() {
  let wallet = await tatum.generateWallet(tatum.Currency.BTC, testnet);

  let masterAddress = await tatum.generateAddressFromXPub(
    tatum.Currency.BTC,
    testnet,
    wallet.xpub,
    0
  );
  return { BTC: { ...wallet, testnet, masterAddress } };
  //   keys["BTC"] = { ...(keys?.BTC || {}), ...wallet, testnet, masterAddress };
}

async function generateETHWallet() {
  let wallet = await tatum.generateWallet(tatum.Currency.ETH, testnet);

  let masterAddress = await tatum.generateAddressFromXPub(
    tatum.Currency.ETH,
    testnet,
    wallet.xpub,
    0
  );

  return {
    ETH: { ...wallet, testnet, masterAddress },
    //USDT: { ...wallet, testnet, masterAddress },
  };
}
async function generateTRONWallet() {
  let wallet = await tatum.generateWallet(tatum.Currency.TRON, testnet);

  let masterAddress = await tatum.generateAddressFromXPub(
    tatum.Currency.TRON,
    testnet,
    wallet.xpub,
    0
  );

  return {
    TRON: { ...wallet, testnet, masterAddress },
    USDT: { ...wallet, testnet, masterAddress },
  };
}

async function generateBNBWallet() {
  let wallet = await tatum.generateWallet(tatum.Currency.BSC, testnet);

  let masterAddress = await tatum.generateAddressFromXPub(
    tatum.Currency.BSC,
    testnet,
    wallet.xpub,
    0
  );

  return {
    BSC: { ...wallet, testnet, masterAddress },
    BNB: { ...wallet, testnet, masterAddress },
  };
}

async function generateXRPWallet() {
  let wallet = await tatum.generateWallet(tatum.Currency.XRP, testnet);
  let address = keys?.XRP?.address||wallet.address;
  let secret = keys?.XRP?.secret||wallet.secret

  return {
    XRP: {
      ...wallet,
      testnet,
      address,
      masterAddress: address,
      secret
    },
  };
}
