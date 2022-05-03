let { init } = require("../../server");

const test_token =
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiOWZiMDFkZTAtMWQ2My00ZDA5LTk0MTUtOTBlMGI0ZTkzYjlhIiwiYXVkIjoidXJuOmF1ZGllbmNlOnN0YW5kYXJkIiwiaXNzIjoidXJuOmlzc3VlcjpzdGFuZGFyZCIsImdyb3VwIjoic3RhbmRhcmQiLCJpYXQiOjE2MzE3MTI2ODYsImV4cCI6MTYzMTcyNzA4Nn0.5NCoPKzetH4dqT5nbjDERyCwWCAzqYnj8TfFYjl0nyE",
  url_prefix = "/wallet";

module.exports = async () => {
  let server;
  beforeEach(async () => {
    server = await init();
  });

  afterEach(async () => {
    await server.stop();
  });

  describe(`Wallet API - ${url_prefix}`, () => {
    test("GET / - Returns account list from user wallet", async () => {
      await server
        .inject({
          method: "get",
          url: `${url_prefix}`,
          headers: {
            Authorization: test_token,
          },
        })
        .then(({ result }) => {
          expect(result).toStrictEqual(
            expect.arrayContaining([
              expect.objectContaining({
                address: expect.any(Object),
              }),
            ])
          );
        })
        .catch(({ message, statusCode }) => {
          expect(message).toBe("Wallet not found");
          expect(statusCode).toBe(404);
        });
    });

    test("post / - Creates new wallet", async () => {
      await server
        .inject({
          method: "get",
          url: `${url_prefix}`,
          headers: {
            Authorization: test_token,
          },
        })
        .then((result) => {
          expect(result).toStrictEqual(
            expect.objectContaining({
              address: expect.any(String),
            })
          );
        })
        .catch((err) => {
          expect(err).toThrowError("Cannot create wallet");
        });
    });

    test("post / - Checks wallet balance", async () => {
      await server.inject({
        method: "get",
        url: `${url_prefix}`,
        headers: {
          Authorization: auth_token,
        },
      });
    });
  });
};
