"use strict";
const {
  mailer: { emailTemplateTransformer, setupMailer },
} = require("../../helpers");
// expect.extend({
//   hasController(...args) {
//     const [cnts, ...keys] = args;
//     keys.forEach((key) => {
//       if (!(key in cnts))
//         return {
//           pass: false,
//           message: () => `Expected: ${keys} in ${keys}`,
//         };
//     });
//     return {
//       pass: true,
//       message: () => `Expected: ${keys} in ${keys}`,
//     };
//   },
// });
module.exports = () =>
  describe("Mailer test", () => {
    jest.setTimeout(30000);

    const mailOptions = {
      to: "oebong1@gmail.com",
      subject: "Account confirmation",
      htmlTemplate: {
        name: "account_confirmation",
        transform: {
          recipientName: "Test User",
          recipientEmail: "testUser@email",
          companyName: "Cryptcon",
          confirmationLink: "https://host:port/confirm_email?email=&token",
        },
      },
    };

    async function setupMailConfig(mock, fn) {
      await mock(fn);
      // await secondFn(setup.sendMail, mailOptions);
    }

    const mockPromise = jest
      .fn()
      .mockImplementationOnce((value) => Promise.resolve(value));
    // const logMock = jest.fn();
    // console.log(logMock());

    const mockMailSetup = jest.fn(async (setup) => {
      try {
        return await setup();
      } catch (err) {
        console.error(err);
      }
    });

    // const mockSendMail = jest.fn(async (sendMail, options) => {
    //   try {
    //     return await sendMail(options);
    //   } catch (err) {
    //     console.error(err);
    //   }
    // });

    setupMailConfig(mockMailSetup, setupMailer);

    describe("Mailer checks", () => {
      test.only("expects mail template options to be transformed", () => {
        const mail = emailTemplateTransformer(mailOptions);
        expect(mail.to).toStrictEqual("oebong1@gmail.com");
      });

      test.only(`Mailer setup returns an object {sendMail: <any:Function>, account: <any:Object>, templates: <any:Object>}`, async () => {
        expect(mockMailSetup.mock.calls.length).toBe(1);

        expect(mockMailSetup.mock.results[0].value).resolves.toStrictEqual(
          expect.objectContaining({
            sendMail: expect.any(Function),
            account: expect.any(Object),
            templates: expect.any(Object),
          })
        );
        // expect(mockSendMail).toHaveBeenCalled();
      });

      it(`Send mail to <${mailOptions.to}>`, async () => {
        await setupMailer().then(async (setup) => {
          let sentMail = await setup.sendMail(mailOptions);
          expect(sentMail).toBeTruthy();
        });
      });
    });
  });
