module.exports = {
  verifyEmail: {
    aud: "aud:new:current",
    iss: "iss:verifyEmail",
    sub: "verify-email",
    // nbf: true,
    // exp: true,
    maxAgeSec: 900,
    // timeSkewSec: 0,
  },

  verifyOTP: {
    aud: "aud:current",
    iss: "iss:verifyOTP",
    sub: "verify-otp",
    // nbf: true,
    // exp: true,
    maxAgeSec: 900,
    // timeSkewSec: 0,
  },

  authUser: {
    aud: "aud:current",
    iss: "iss:authUser",
    sub: "user-authentication",
    nbf: true,
    exp: true,
    maxAgeSec: 172800,
    // timeSkewSec: 0,
  },

  changePassword: {
    aud: "aud:current",
    iss: "iss:changePassword",
    sub: "change-password",
    // nbf: true,
    // exp: true,
    maxAgeSec: 900,
    // timeSkewSec: 0,
  },
};
