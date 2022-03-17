"use strict";

const faker = require("faker");
const { nanoid } = require("nanoid");
const {
  TABLE_NAMES,
  KYC_STATUSES,
  KYC_TYPES,
  SUPPORTED_TOKENS,
  SUPPORTED_FIAT,
  CURRENCY_TYPES,
} = require("../../constants");
const len = 1;

const UsersSeeder = {
  up: async (queryInterface, Sequelize) => {
    this.queryInterface = queryInterface;
    this.Sequelize = Sequelize;

    // await seedUsers.call(this);
    await seedAdminUsers.call(this);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete(TABLE_NAMES?.USER || "tbl_users", null, {});
    await queryInterface.bulkDelete(
      TABLE_NAMES?.PROFILE || "tbl_profiles",
      null,
      {}
    );
  },
};

/**
 * @function seedAdminUsers - Seeds adminsitrator users
 */
async function seedAdminUsers() {
  try {
    const userTableRecords = [];
    const profileTableRecords = [];
    const securityTableRecords = [];
    let currencyTableRecords;

    for (let i = 0; i < len; ++i) {
      let id = faker.datatype.uuid();
      let email = faker.internet.email();
      let profile_id = faker.datatype.uuid();

      // Add a general superadmin user as the first query
      if (i === 0) {
        email = "superadmin@mail.com";
        const superadmin = {
          id,
          email,
          //password - p@55w0rd
          password:
            "$2a$10$IvL78DSLxzFjDjtwba5hcuZog4kc5XsooEBtmt0gZaWTmvwc7gO4u",
          created_at: faker.date.recent(),
          updated_at: faker.date.recent(),
          access_level: 3,
          verified: true,
          // profile_id
        };
        currencyTableRecords = Object.entries({
          ...SUPPORTED_TOKENS,
          ...SUPPORTED_FIAT,
        }).map(([key, value]) => {
          return {
            id: faker.datatype.uuid(),
            user_id: id,
            name: value,
            iso_code: key,
            type:
              key in SUPPORTED_FIAT
                ? CURRENCY_TYPES.FIAT
                : CURRENCY_TYPES.CRYPTO,
          };
        });
        userTableRecords.push(superadmin);
      }

      profileTableRecords.push({
        profile_id,
        oname: faker.name.firstName(),
        lname: faker.name.lastName(),
        user_id: id,
        created_at: faker.date.recent(),
        updated_at: faker.date.recent(),
        email,
      });

      securityTableRecords.push({
        id: faker.datatype.uuid(),
        user_id: id,
        created_at: faker.date.recent(),
        updated_at: faker.date.recent(),
      });
      // kycTableRecords.push({
      //   id: faker.datatype.uuid(),
      //   user_id: id,
      //   status: 'ACCEPT',
      //   type: 'email',
      //   created_at: faker.date.recent(),
      //   updated_at: faker.date.recent(),
      // });

      if (i == 0) continue;

      userTableRecords.push({
        id,
        email,
        password: faker.internet.password(),
        // referral_code: 'seet7pcH'
        created_at: faker.date.recent(),
        updated_at: faker.date.recent(),
        access_level: 2,
        verified: faker.datatype.boolean(),
      });
    }
    await this.queryInterface.sequelize.transaction(
      async (t) =>
        await Promise.all([
          this.queryInterface.bulkInsert(
            TABLE_NAMES?.USER || "tbl_users",
            userTableRecords,
            {
              transaction: t,
            }
          ),
          this.queryInterface.bulkInsert(
            TABLE_NAMES?.PROFILE || "tbl_profiles",
            profileTableRecords,
            { transaction: t }
          ),
          this.queryInterface.bulkInsert(
            TABLE_NAMES?.CURRENCY || "tbl_currencies",
            currencyTableRecords,
            { transaction: t }
          ),
          this.queryInterface.bulkInsert(
            TABLE_NAMES?.SECURITY || "tbl_securities",
            securityTableRecords,
            { transaction: t }
          ),
          /* this.queryInterface.bulkInsert(
            TABLE_NAMES?.KYC| "tbl_kyc",
            kycTableRecords,
            { transaction: t }
          ), */
        ])
    );
  } catch (err) {
    console.error(err);
  }
}

/**
 * @function seedUser - seeds basic users
 */
async function seedUsers() {
  const userTableRecords = [];
  const profileTableRecords = [];
  const kycTableRecords = [];
  const securityTableRecords = [];
  const ID = [];
  const all_currencies_names = {
    ...SUPPORTED_TOKENS,
    ...SUPPORTED_FIAT,
  };
  let affiliateTableRecords = [],
    affiliates = {};
  let walletTableRecord = [];
  const all_currencies_codes = Object.keys(all_currencies_names);

  let randID = () =>
    ID?.length > 1 ? ID[Math.floor(Math.random() * (ID?.length + 1))] : ID[0];

  for (let i = 0; i < len; ++i) {
    const user_id = faker.datatype.uuid();
    let email = faker.internet.email();
    let profile_id = faker.datatype.uuid();
    ID.push(user_id);
    let picked = randID();

    if (i === 5) {
      email = "basic@mail.com";

      userTableRecords.push({
        id: user_id,
        email,
        //password - p@55w0rd
        password:
          "$2a$10$IvL78DSLxzFjDjtwba5hcuZog4kc5XsooEBtmt0gZaWTmvwc7gO4u",
        created_at: faker.date.recent(),
        updated_at: faker.date.recent(),
        access_level: 1,
        verified: true,
      });

      walletTableRecord = Object.keys(SUPPORTED_TOKENS).map((key) => {
        let amount = faker.finance.amount();
        let currencyCode = key;
        return {
          id: faker.datatype.uuid(),
          user_id,
          signature_id: faker.datatype.uuid(),
          tatum_account_id: faker.datatype.uuid(),
          derivation_key: faker.datatype.number(),
          address: faker.finance.bitcoinAddress(),
          frozen: faker.datatype.boolean(),
          currency: currencyCode,
          is_company_wallet: false,
          created_at: faker.datatype.datetime(),
          updated_at: faker.datatype.datetime(),
        };
      });

      kycTableRecords.push({
        id: faker.datatype.uuid(),
        user_id,
        status: KYC_STATUSES.ACCEPTED,
        type: KYC_TYPES.EMAIL,
        created_at: faker.date.recent(),
        updated_at: faker.date.recent(),
      });
      // kycTableRecords.push({
      //   id: faker.datatype.uuid(),
      //   user_id,
      //   status: KYC_STATUSES.ACCEPTED,
      //   type: KYC_TYPES.ID,
      //   created_at: faker.date.recent(),
      //   updated_at: faker.date.recent(),
      // });
    }
    if (ID.length && picked && picked != user_id) {
      affiliates[picked]
        ? affiliates[picked].push(user_id)
        : (affiliates[picked] = [user_id]);
    }

    profileTableRecords.push({
      profile_id,
      invite_code: nanoid(10),
      oname: faker.name.firstName(),
      lname: faker.name.lastName(),
      email,
      user_id: user_id,
      created_at: faker.date.recent(),
      updated_at: faker.date.recent(),
    });

    securityTableRecords.push({
      id: faker.datatype.uuid(),
      user_id: user_id,
      created_at: faker.date.recent(),
      updated_at: faker.date.recent(),
    });
    if (i == 5) continue;

    userTableRecords.push({
      id: user_id,
      email,
      password: faker.internet.password(),
      access_level: 1,
      created_at: faker.date.recent(),
      updated_at: faker.date.recent(),
      verified: faker.datatype.boolean(),
    });
  }

  affiliateTableRecords = Object.entries(affiliates).map(
    ([user_id, friends]) => {
      return {
        id: faker.datatype.uuid(),
        user_id,
        friends: JSON.stringify(friends),
        created_at: faker.date.recent(),
        updated_at: faker.date.recent(),
      };
    }
  );

  await this.queryInterface.sequelize.transaction(
    async (t) =>
      await Promise.all([
        this.queryInterface.bulkInsert(
          TABLE_NAMES?.USER || "tbl_users",
          userTableRecords,
          {
            transaction: t,
          }
        ),
        this.queryInterface.bulkInsert(
          TABLE_NAMES?.WALLET || "tbl_wallets",
          walletTableRecord,
          { transaction: t }
        ),
        this.queryInterface.bulkInsert(
          TABLE_NAMES?.PROFILE || "tbl_profiles",
          profileTableRecords,
          { transaction: t }
        ),
        this.queryInterface.bulkInsert(
          TABLE_NAMES?.KYC || "tbl_kyc",
          kycTableRecords,
          { transaction: t }
        ),
        this.queryInterface.bulkInsert(
          TABLE_NAMES?.SECURITY || "tbl_securities",
          securityTableRecords,
          { transaction: t }
        ),
        this.queryInterface.bulkInsert(
          TABLE_NAMES?.AFFILIATE || "tbl_affiliates",
          affiliateTableRecords,
          { transaction: t }
        ),
      ])
  );
}

module.exports = UsersSeeder;
