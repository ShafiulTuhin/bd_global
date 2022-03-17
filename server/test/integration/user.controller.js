let { init } = require("../../server");

module.exports = (server) => {
  const test_pass = "p@55w0rd",
    test_token =
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiOWZiMDFkZTAtMWQ2My00ZDA5LTk0MTUtOTBlMGI0ZTkzYjlhIiwiYXVkIjoidXJuOmF1ZGllbmNlOnN0YW5kYXJkIiwiaXNzIjoidXJuOmlzc3VlcjpzdGFuZGFyZCIsImdyb3VwIjoic3RhbmRhcmQiLCJpYXQiOjE2MzE3MTI2ODYsImV4cCI6MTYzMTcyNzA4Nn0.5NCoPKzetH4dqT5nbjDERyCwWCAzqYnj8TfFYjl0nyE",
    url_prefix = "/user",
    test_email = "test@mail";

  return describe("User API", () => {
    let server;
    beforeEach(async () => {
      server = await init();
    });

    afterEach(async () => {
      await server.stop();
    });

    test.only("GET /user returns a single user", async () => {
      await server
        .inject({
          method: "get",
          url: `${url_prefix}/profile`,
          headers: {
            Authorization: test_token,
          },
        })
        .then((res) => {
          expect(res.result).toStrictEqual(
            expect.objectContaining({
              role: expect.any(String),
            })
          );
        })
        .catch((err) => {
          expect(err).toThrow("User not found");
        });
    });

    test("POST /authenticate - Authenticates user and returns JWT token", async () => {
      await server
        .inject({
          method: "post",
          url: `${url_prefix}/authenticate`,
          payload: {
            email: test_email,
            password: test_pass,
          },
          headers: {
            Authorization: test_token,
          },
        })
        .then((resp) => {
          expect(resp).toStrictEqual(
            expect.objectContaining({
              access_token: expect.any(String),
            })
          );
        })
        .catch((err) => {
          expect(err).toThrowError("unauthorized");
        });
    });
  });
};
