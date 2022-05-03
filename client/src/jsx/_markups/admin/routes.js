import Home from "./pages";
import Setting from "./pages/setting.page";
import UserPermission from "./pages/user_permission.page";
import UserMgmt from "./pages/user_management.page";
import AdminBankDetailsTable from "./pages/bankdetail.page";
import UserSecession from "./pages/user_secession.page";
import UserSessionHistory from "./pages/user_session_history.page";
import UserBalance from "./pages/user_balance.page";
import UserReferralMgmt from "./pages/user_affiliates.page";
import CustomerSupport from "./pages/support_board.page";
import CurrencyMgmt from "./pages/currency_management.page";
import UserKYCMgmt from "./pages/user_kyc_management.page";
import WalletWithdrawals from "./pages/wallet_withdrawals.page";
// import WalletWithdrawalRequests from "./pages/wallet_withdrawal_request_history.page";
import WalletWithdrawalFees from "./pages/wallet_withrawal_fees_mgmt.page";
// import AirdropTransactions from "./pages/airdrop_transaction_mgmt.page";

import WalletDeposits from "./pages/wallet_deposits.page";
import AdvertsMgmt from "./pages/advert_management.page";
import OrdersMgmt from "./pages/order_management.page";
import P2PTradeHistory from "./pages/p2p_trade_history.page";
import P2PDisputes from "./pages/p2p_disputes.page";
import ChatHistory from "./pages/chat_history.page";
import ChatMessenger from "./pages/chat_messenger.page";
import AuthSecurityMgmt from "./pages/auth_security.page";
// import AuthKYCCertification from "./pages/auth_kyc_certification.page";
import { toQueryString } from "../../_helpers/navigations.helper";
import { camelCase } from "../../_helpers/utils.helper";
import SupportRegister from "./pages/support_register.page";
import Airdropmanagement from "./pages/airdrop_management";
import Airdrophistory from "./pages/airdrop_history";
import Mainwallet from "./pages/main_wallet";
import Mainwallettransation from "./pages/main_wallet_transaction";

import SettingManagement from "./pages/setting_management";


const routes = [
  { url: "", create: (obj) => "" + toQueryString(obj), component: Home },
  {
    url: "me",
    create: (obj) => "" + toQueryString(obj),
    component: () => <>Admin profile page</>,
  },
  {
    url: "setting",
    create: (obj) => "setting" + toQueryString(obj),
    component: Setting,
  },
  {
    url: "admin-bank-details",
    create: (obj) => "/admin-bank-details/" + toQueryString(obj),
    component: AdminBankDetailsTable,
  },

  // User management
  {
    url: "user-balance",
    create: (obj) => "/user-balance/" + toQueryString(obj),
    component: UserBalance,
  },
  {
    url: "user-management",
    create: (obj) => "/user-management/" + toQueryString(obj),
    component: UserMgmt,
  },
  {
    url: "user-permission",
    create: (obj) => "/user-permission/" + toQueryString(obj),
    component: UserPermission,
  },
  {
    url: "user-secession",
    create: (obj) => "/user-secession/" + toQueryString(obj),
    component: UserSecession,
  },
  { url: "user-session-history", component: UserSessionHistory },
  { url: "user-kyc-management", component: UserKYCMgmt },
  { url: "user-affiliate-management", component: UserReferralMgmt },

  // Wallet Management
  { url: "transaction-withdrawals", component: WalletWithdrawals },
  { url: "transaction-deposits", component: WalletDeposits },
  // {
  //   url: "transaction-withdrawal-management",
  //   component: WalletWithdrawalRequests,
  // },
  { url: "transaction-fee-management", component: WalletWithdrawalFees },

  // { url: "transaction-airdrops", component: AirdropTransactions },

  // Adverts
  { url: "adverts", component: AdvertsMgmt },
  { url: "orders", component: OrdersMgmt },

  // P2P Trade
  { url: "p2p-trade-history", component: P2PTradeHistory },
  { url: "p2p-disputes", component: P2PDisputes },

  // Chat management
  { url: "chat-history", component: ChatHistory },
  { url: "chat-messenger", component: ChatMessenger },

  // Support
  { url: "auth-security-management", component: AuthSecurityMgmt },
  // { url: "auth-kyc-certification", component: AuthKYCCertification },

  // Support
  { url: "support", component: CustomerSupport },
  { url: "support-disputes", component: null },
  { url: "support-board", component: CustomerSupport },
  { url: "support-register", component: SupportRegister },

  // Currency Management
  { url: "currency-management", component: CurrencyMgmt },

  // Airdrop Management
  { url: "airdrop-management", component: Airdropmanagement },
  { url: "airdrop-history", component: Airdrophistory },

  { url: "main-wallet", component: Mainwallet },

  { url: "main-wallet-transaction", component: Mainwallettransation },

  { url: "settings", component: SettingManagement }

];

export const genAdminRoute = () => {
  const linkCreator = {};
  const exclude = ["*"];
  routes.forEach((route) => {
    if (exclude.includes(route.url)) return;
    let key = camelCase(route?.url?.replaceAll("-", " "));
    if (!key) {
      key = "home";
    }
    if (route.create) {
      linkCreator[key] = route?.create;
    } else {
      linkCreator[key] = (obj) => route.url + toQueryString(obj);
    }
  });

  return linkCreator;
};

export default routes;
