import { toQueryString } from "../../_helpers/navigations.helper";
import { camelCase } from "../../_helpers/utils.helper";
// import { RouteObject } from "react-router-dom";

// HOME
import Home from "./pages/home";

// ORDER
import Orders from "./pages/order";
import OrderByID from "./pages/order/id.page";
import OrderByUserID from "./pages/order/user.page";

// ORDER
import Adverts from "./pages/advert";
import AdvertByID from "./pages/advert/id.page";
import CreateAdvert from "./pages/advert/create.page";
import AdvertByUserID from "./pages/advert/user.id.page";

// WALLET
import Wallets from "./pages/wallet";
import WalletByID from "./pages/wallet/id.page";

// AFFILIATE
import Affiliates from "./pages/affiliate";

// ME
import Me from "./pages/me";

// AUTH
import Register from "./pages/auth/register.page";
import Login from "./pages/auth/login.page";
import ChangePassword from "./pages/auth/change.password.page";
import ForgotPassword from "./pages/auth/forgot.page";
import VerifyEmail from "./pages/auth/verify.email.page";
import VerifyOTP from "./pages/auth/verify.otp";

import TwoFactor from "./pages/auth/twofactor.auth.page";
// SUPPORT
import Supports from "./pages/support";
import SupportByID from "./pages/support/id.page";

// PAYMENT METHODS
// import PaymentMethods from "./pages/payment";
import AddPaymentMethod from "./pages/payment/add.page";
import Media from "./pages/media";

// NO MATCH
import NoMatch from "../_shared/components/Error404.component";

import TwoFactorTransaction from "./pages/auth/twofactortransaction.auth.page";

export const routeMap = {
  home: "/",

  // AUTH
  login: "/auth/login",
  register: "/auth/register",
  changePassword: "/auth/changePassword",
  forgot: "/auth/forgot",
  verifyEmail: "/auth/verify/email",
  verifyOTP: "/auth/verify/otp",
  twoFactor: "/auth/two-factor",
  twoFactorTransaction: "/auth/twoFactor-transaction",

  // ORDER
  order: "/order",
  orderByID: "/order/:id",
  orderByUserID: "/order/user/:id",

  // OFFER
  advert: "/advert",
  advertByID: "/advert/:id",
  advertByUserID: "/advert/user/:id",
  createAdvert: "/advert/create",

  // WALLET
  wallet: "/wallet",
  walletByID: "/wallet/:id",

  // AFFILIATE
  affiliate: "/affiliate",

  // SUPPORT
  support: "/support",
  supportByID: "/support/:id",

  // ME
  me: "/me",

  // STATIC
  media: "/media/", 
  mediaByID: "/media/:id",
  upload: "/media/",

  // PAYMENT
  addPayment: "/payment/add/:type",
};
const routes = [
  { path: routeMap?.home, element: Home, title: "Home" },
  { path: routeMap?.media, element: Media, title: "Media uploads" },
  { path: routeMap?.mediaByID, element: Media, title: "Single Media uploads" },

  { path: routeMap?.order, element: Orders, title: "Orders", auth: true },
  { path: routeMap?.orderByID, element: OrderByID, title: "Order", auth: true },
  {
    path: routeMap?.orderByUserID,
    element: OrderByUserID,
    title: "User Orders",
    auth: true,
  },

  { path: routeMap?.advert, element: Adverts, title: "Trades" },
  {
    path: routeMap?.createAdvert,
    auth: true,
    element: CreateAdvert,
    title: "Create trade",
  },
  {
    path: routeMap?.advertByID,
    auth: true,
    element: AdvertByID,
    title: "Trade offer",
  },
  {
    path: routeMap?.advertByUserID,
    element: AdvertByUserID,
    title: "Trade offer",
    auth: true,
  },

  { path: routeMap?.wallet, element: Wallets, auth: true, title: "Wallet" },
  {
    path: routeMap?.walletByID,
    auth: true,
    element: WalletByID,
    title: "Wallet",
  },

  {
    path: routeMap?.affiliate,
    auth: true,
    element: Affiliates,
    title: "Affiliate",
  },

  { path: routeMap?.me, auth: true, element: Me, title: "User profile" },

  { path: routeMap?.support, element: Supports, title: "Support" },
  { path: routeMap?.supportByID, element: SupportByID, title: "Support" },

  { path: routeMap?.login, element: Login, title: "Login" },
  { path: routeMap?.register, element: Register, title: "Register" },
  {
    path: routeMap?.changePassword,
    element: ChangePassword,
    title: "Reset Password",
  },
  { path: routeMap?.forgot, element: ForgotPassword, title: "Forgot Password" },
  { path: routeMap?.verifyEmail, element: VerifyEmail, title: "Verify Email" },
  { path: routeMap?.verifyOTP, element: VerifyOTP, title: "Verify OTP" },
  {
    path: routeMap?.twoFactor,
    element: TwoFactor,
    title: "Two Factor Authentication",
  },
  {
    path:routeMap?.twoFactorTransaction,
    element:TwoFactorTransaction,
    title:"Two Factor Transaction"
  },

  {
    path: routeMap?.addPayment,
    element: AddPaymentMethod,
    title: "Add Payment method",
    auth: true,
  },
  { path: "*", element: NoMatch, title: "Error" },
];

export const genRoute = () => {
  const linkCreator = {};
  const exclude = ["*"];
  routes.forEach((route) => {
    let key = camelCase(route.path.replace("-", " "));
    if (exclude.includes(route.path)) return;
    if (route.create) {
      linkCreator[key] = route?.create;
    } else {
      linkCreator[key] = (obj) => route.path + toQueryString(obj);
    }
  });

  return linkCreator;
};

export default routes;
