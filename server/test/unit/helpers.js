const {
  generateReferralCode,
  generateOTP,
  encrypt,
  decrypt,
  jwt,
  generateKeyPair,
} = require("../../helpers");

module.exports = async () => {
  const test_password = "p@55w0rd";
  const test_email = "test@mail";
  const otp_length = 6;
  const otp_code = generateOTP(otp_length);

  describe("Helper functions test", () => {
    test.only(`Checks that generated referral code length is 8`, () => {
      const referral_code = generateReferralCode(test_email);
      expect(referral_code).toHaveLength(8);
    });

    describe(`Creates and verifies JWT Token`, () => {
      let validToken = jwt.create(
        {
          role: "xxxx",
          id: "xxxx-xxx-xxx-xxxx",
        },
        10
      );
      let invalidToken = jwt.create(
        {
          role: "xxxx",
          id: "xxxx-xxx-xxx-xxxx",
        },
        10,
        "invalid_shared_secret"
      );

      it.only("Expects a valid response", async () => {
        const goodResp = jwt.decodeAndVerifyToken(validToken);

        expect(goodResp).toStrictEqual(
          expect.objectContaining({
            isValid: true,
            credentials: expect.objectContaining({
              decoded: expect.objectContaining({
                payload: expect.objectContaining({
                  user: "xxxx-xxx-xxx-xxxx",
                }),
              }),
            }),
          })
        );
      });

      it.only("Expects an invalid response", async () => {
        const badResp = jwt.decodeAndVerifyToken(invalidToken, {});
        expect(badResp).toStrictEqual(
          expect.objectContaining({
            isValid: false,
            error: expect.any(String),
          })
        );
      });
    });

    describe("Cryptographic test", () => {
      test.only(`Generate key pairs from passphrase`, async () => {
        await generateKeyPair(test_password, (err, pubKey, prvKey) => {
          if (err) {
            expect(err).toThrow(Error);
          }
          expect(pubKey).toStrictEqual(expect.any(String));
          expect(prvKey).toStrictEqual(expect.any(String));
        });
      });

      test.only(`Check text encryption and decryption`, async () => {
        const encrypted = await encrypt(test_password);
        const decrypted = await decrypt(test_password, encrypted);

        expect(decrypted).toBe(true);
      });

      test.only(`Generates OTP with a max length of ${otp_length}`, () => {
        expect(otp_code).toHaveLength(otp_length);
      });
    });
  });
};
