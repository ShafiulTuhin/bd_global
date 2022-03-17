"use strict";
const commandLineArgs = require("command-line-args");
const fs = require("fs");
const $PATH = require("path");
const config = require("dotenv").config({
  path: $PATH.join(__dirname, "..", "..", ".env"),
});

if (config.error) {
  throw config.error;
}
const $BACKUP_DIR = process.env.BACKUP_DIR; //General backup dir
const $DB_BACKUP_DIRNAME = ".cointc_db"; //DB backup directory name

const optionDefinitions = [
  {
    name: "model",
    alias: "m",
    type: String,
    multiple: true,
    defaultValue: ["Wallet"],
  },
  {
    name: "backup",
    alias: "b",
    type: String,
    defaultValue: $PATH.join(
      $BACKUP_DIR || $PATH.join(__dirname, "..", "..", "..", ".cointc_backup"),
      $DB_BACKUP_DIRNAME
    ),
  },
  { name: "overwrite", alias: "o", type: Boolean, defaultValue: false },
];

const options = commandLineArgs(optionDefinitions);

console.log(options);

if (!fs.existsSync(options.backup)) {
  console.log(`Creating a new backup directory: ${options.backup}`);
  fs.mkdirSync(options.backup, { recursive: true });
  console.log(`Finished creating directory: ${options.backup}\n`);
}
main();

async function main() {
  console.log("Connecting to database");
  const db = require("../database/models/index");
  console.log("Connected to database successfully!\n");

  options.model.forEach(async (modelName) => {
    await db[modelName]
      ?.findAndCountAll()
      .then(async ({ count, rows }) => {
        let oldRows = [];
        let dir = $PATH.join(
          options.backup,
          `backup-${new Date()
            ?.toISOString()
            .replace(/[-:./]/gi, "")}-${modelName}.json`
        );
        if (!options.overwrite) {
          try {
            oldRows = require(dir);
          } catch (error) {
            oldRows = [];
            console.warn(`Cannot find module: ${dir}. Creating new!\n`);
          }
        }

        let data = [...oldRows, ...rows];

        fs.writeFile(dir, JSON.stringify(data), function(err) {
          if (err) {
            return console.error(err);
          }
          console.log(
            `Backup for ${modelName} completed.\n- Record count: ${data.length} records]\n`
          );
        });
      })
      .catch(console.error);
  });
}
