import Services from "./Services";

export class AuthService extends Services {
  constructor(init) {
    super(init);
    this._name = "AUTH";
    return this;
  }

  //LOGIN ----------------------------------------------------------------------
  /**
   * @function login - log user to platform
   * @param {Object} data
   * @param {String} data.email
   * @param {String} data.password
   * @param {Number | 1} data.access_level
   * @returns
   */
  login = async (data) => {
    return await this.decorate(
      async () =>
        await this.axios("/auth/login", {
          method: "POST",
          data,
        })
    );
  };
  /**
   * @function login - log user to platform
   * @param {Object} data
   * @param {String} data.email
   * @param {String} data.password
   * @param {Number | 1} data.access_level
   * @returns
   */
  logout = async () => {
    return await this.decorate(
      async () =>
        await this.axios("/auth/logout", {
          method: "POST",
        })
    );
  };

  //REGISTER ----------------------------------------------------------------------
  /**
   * @function register - Register user into platform
   * @param {Object} data
   * @param {String} data.email
   * @param {String} data.invite_code
   * @param {String} data.password
   * @param {String} data.repeat_password
   * @returns
   */
  register = async (data) => {
    return await this.decorate(
      async () =>
        await this.axios(`/auth/register`, {
          method: "POST",
          data,
        })
    );
  };


  /**
   * @function resendConfirmationMail - Confirm user in to the  platform
   * @param {Object} data
   * @param {String} data.email - user email
   * @returns
   */
  resendConfirmationMail = async (data) => {
    return await this.decorate(
      async () =>
        await this.axios(`/auth/confirm/resend`, {
          method: "POST",
          data,
        })
    );
  };

  //RESET USER ----------------------------------------------------------------------
  /**
   * @function reset
   * @description reset password
   * @param {Object} data
   * @param {Object} data.token
   * @param {Object} data.password
   * @returns
   */
  changePassword = async (data) => {
    return await this.decorate(
      async () =>
        await this.axios(`/auth/change/password`, {
          method: "POST",
          data,
        })
    );
  };

  //PASSWORD RESET REQUEST ----------------------------------------------------------------------
  /**
   * @function requestPasswordChange
   * @description request password reset
   * @param {Object} data
   * @param {String} data.email
   * @returns
   */
  requestPasswordChange = async (data) => {
    return await this.decorate(async () => {
      return await this.axios(`/auth/request/change/password`, {
        method: "POST",
        data,
      });
    });
  };

  //SEND OTP ----------------------------------------------------------------------
  /**
   * @function sendOTP - Send otp to verify user
   * @param {Object} data
   * @param {String} data.id - user ID
   * @param {String} data.email - user email
   * @returns
   */

  sendOTP = async (data) => {
    return await this.decorate(
      async () =>
        await this.axios(`/auth/send/otp`, {
          method: "POST",
          data,
        })
    );
  };

  //VERIFY EMAIL OTP ----------------------------------------------------------------------
  /**
   * @function verify_otp
   * @description verify OTP
   * @param {Object} data
   * @param {String} data.id
   * @param {String} data.code
   * @returns
   */
  verifyEmailOTP = async (data) => {
    return await this.decorate(
      async () =>
        await this.axios(`/auth/verify/email/otp`, {
          method: "POST",
          data,
        })
    );
  };

  //VERIFY EMAIL ----------------------------------------------------------------------
  /**
   * @function verify_email
   * @description verify Email
   * @param {Object} data
   * @param {String} data.email
   * @returns
   */
  verifyEmailByLink = async (data) => {
    return await this.decorate(
      async () =>
        await this.axios(`auth/verify/email`, {
          method: "POST",
          data,
        })
    );
  };
  //VERIFY PHONE ----------------------------------------------------------------------
  /**
   * @function verifyOTP
   * @description verify SMS
   * @param {Object} data
   * @param {String} data.email
   * @returns
   */
  verifySMSOTP = async (data) => {
    return await this.decorate(
      async () =>
        await this.axios(`auth/verify/phone`, {
          method: "PUT",
          data,
        })
    );
  };
  loginWithGoogle = async (data) => {
    return await this.decorate(
      async () =>
        await this.axios(`auth/login/google`, {
          method: "POST",
          data,
        })
    );
  };
  registerWithGoogle = async (data) => {
    return await this.decorate(
      async () =>
        await this.axios(`auth/register/google`, {
          method: "POST",
          data,
        })
    );
  };



  // registerGoogleauth = async (data) => {
  //   return await this.decorate(
  //     async () => {
  //       await this.axios(`/auth/register/google-authenticator`, {
  //         method: "POST",
  //         data
  //       })
  //     }
  //   )
  // }
  
  registerGoogleAuth=async(data)=>{
    return await this.decorate(
      async()=>
      await this.axios(`/auth/register/google-authenticator`,{
        method:"POST",
        data
      })
    )
  }

  verifyGoogleAuth = async (data) => {
    console.log(data)
    return await this.decorate(
      async () =>
        await this.axios(`/auth/verify/google-authenticator`, {
          method: "POST",
          data
        })
    )
  }
  verifyGoogleAuthSecret = async (data) => {
    return await this.decorate(
      async () =>
        await this.axios(`/auth/verify/google-authenticator-secret`, {
          method: "POST",
          data
        })
    )
  }


}
export default AuthService;
