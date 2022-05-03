"use strict";
let dateFn = require("date-fns");
const {Op} = require("sequelize")

module.exports = function StatsController(server) {
  const {
    db,
    db: {
      // Sequelize: { Op },
      Security,
      User,
      Kyc,
    },
    consts: { KYC_STATUSES },
    helpers: { filters },
    boom,
  } = server.app;
  return {
    /**
     * @function userAnalytics
     * @param {Object} req
     * @returns
     */
    async userAnalytics(req) {
      const { query } = req;
      const queryFilters = await filters({ query });

      try {
        let user_analytics = {
          total: await User.count({
            where: { ...queryFilters?.where },
          }),
          suspended: await User.count({
            where: { ...queryFilters?.where, archived_at: { [Op.ne]: null } },
          }),

          recently_added: await User.count({
            where: {
              ...queryFilters?.where,
              created_at: {
                // last 30 days
                [Op.gte]: Date.now() - 30 * 24 * 60 * 60 * 1000,
              },
            },
          }),
        };
        return user_analytics;
      } catch (err) {
        console.error(err);
        return boom.internal(err.message, err);
      }
    },

    /**
     * @function withdrawalAnalytics
     * @param {Object} req
     * @returns
     */
    async withdrawalAnalytics(req) {
      const { query } = req;
      const queryFilters = await filters({ query });

      try {
        let withdrawal_analytics = {
          total: await User.count({
            where: { ...queryFilters?.where },
          }),
          suspended: await User.count({
            where: { ...queryFilters?.where, archived_at: { [Op.ne]: null } },
          }),
          recent: await User.count({
            where: {
              ...queryFilters?.where,
              created_at: {
                [Op.lte]: dateFn.subDays(new Date(), 30),
              },
            },
          }),
        };
        return withdrawal_analytics;
      } catch (err) {
        console.error(err);
        return boom.internal(err.message, err);
      }
    },

    /**
     * @function depositAnalytics
     * @param {Object} req
     * @returns
     */
    async depositAnalytics(req) {
      const { query } = req;
      const queryFilters = await filters({ query });

      try {
        let deposit_analytics = {
          total: await User.count({
            where: { ...queryFilters?.where },
          }),
          suspended: await User.count({
            where: { ...queryFilters?.where, archived_at: { [Op.ne]: null } },
          }),
          recent: await User.count({
            where: {
              ...queryFilters?.where,
              created_at: {
                [Op.lte]: dateFn.subDays(new Date(), 30),
              },
            },
          }),
        };
        return deposit_analytics;
      } catch (err) {
        console.error(err);
        return boom.internal(err.message, err);
      }
    },

    /**
     * @function transactionAnalytics
     * @param {Object} req
     * @returns
     */
    async transactionAnalytics(req) {
      const { query } = req;
      const queryFilters = await filters({ query });

      try {
        let transaction_analytics = {
          total: await User.count({
            where: { ...queryFilters?.where },
          }),
          suspended: await User.count({
            where: { ...queryFilters?.where, archived_at: { [Op.ne]: null } },
          }),
          recent: await User.count({
            where: {
              ...queryFilters?.where,
              created_at: {
                [Op.lte]: dateFn.subDays(new Date(), 30),
              },
            },
          }),
        };
        return transaction_analytics;
      } catch (err) {
        console.error(err);
        return boom.internal(err.message, err);
      }
    },

    /**
     * @function supportTicketAnalytics
     * @param {Object} req
     * @returns
     */
    async supportTicketAnalytics(req) {
      const { query } = req;
      const queryFilters = await filters({ query });

      try {
        let support_analytics = {
          total: await User.count({
            where: { ...queryFilters?.where },
          }),
          suspended: await User.count({
            where: { ...queryFilters?.where, archived_at: { [Op.ne]: null } },
          }),
          recent: await User.count({
            where: {
              ...queryFilters?.where,
              created_at: {
                [Op.lte]: dateFn.subDays(new Date(), 30),
              },
            },
          }),
        };
        return support_analytics;
      } catch (err) {
        console.error(err);
        return boom.internal(err.message, err);
      }
    },

    /**
     * @function kycAnalytics - Compute Kyc analytics
     * @param {Object} req
     * @returns
     */
    async kycAnalytics(req) {
      const { query } = req;
      const queryFilters = await filters({ query });

      try {
        let kyc_analytics = {
          total: await Kyc.count({
            where: { ...queryFilters?.where },
          }),
          accepted: await Kyc.count({
            where: { ...queryFilters?.where, status: KYC_STATUSES?.ACCEPTED },
          }),
          denied: await Kyc.count({
            where: { ...queryFilters?.where, status: KYC_STATUSES?.DENIED },
          }),
          pending: await Kyc.count({
            where: { ...queryFilters?.where, status: KYC_STATUSES?.PENDING },
          }),
          recently_added: await Kyc.count({
            where: {
              ...queryFilters?.where,
              created_at: {
                [Op.lte]: dateFn.subDays(new Date(), 30),
              },
            },
          }),
        };
        return kyc_analytics;
      } catch (err) {
        console.error(err);
        return boom.internal(err.message, err);
      }
    },

    /**
     * @function securityAnalytics
     * @param {Object} req
     * @returns
     */
    async securityAnalytics(req) {
      const { query } = req;
      const queryFilters = await filters({ query });

      try {
        let security_analytics = {
          total: await Security.count({
            where: { ...queryFilters?.where },
          }),
          enabled_2fa: await Security.count({
            where: { ...queryFilters?.where, two_factor: true },
          }),
          recently_added: await Security.count({
            where: {
              ...queryFilters?.where,
              created_at: {
                [Op.lte]: dateFn.subDays(new Date(), 30),
              },
            },
          }),
        };
        return security_analytics;
      } catch (err) {
        console.error(err);
        return boom.internal(err.message, err);
      }
    },
  };
};
