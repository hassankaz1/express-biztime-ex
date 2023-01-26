/** Tests for companies. */
process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");

// before each test, clean out data
beforeEach(async () => {
  await db.query("DELETE FROM invoices");
  await db.query("DELETE FROM companies");

  await db.query(`INSERT INTO companies (code, name, description)
                      VALUES ('one', 'TEST', 'This should work'),
                             ('two', 'TSLA', '420')`);

  const inv = await db.query(
    `INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date)
             VALUES ('one', 100, false, '2022-01-01', null),
                    ('one', 200, true, '2023-01-01', '2023-01-12')`);

});

afterAll(async () => {
  await db.end()
})

describe("GET /", function () {

  test("It should return all companies", async function () {
    const response = await request(app).get("/companies");
    expect(response.body).toEqual({
      "companies": [
        { code: "one", name: "TEST" },
        { code: "two", name: "TSLA" },
      ]
    });
  })

});


describe("GET /one", function () {

  test("It return company info", async function () {
    const response = await request(app).get("/companies/one");
    expect(response.body).toEqual(
      {
        "company": {
          code: "one",
          name: "TEST",
          description: "This should work",
          invoices: [1, 2],
        }
      }
    );
  });

  test("It should return 404", async function () {
    const response = await request(app).get("/companies/dne");
    expect(response.status).toEqual(404);
  })
});


describe("POST /", function () {

  test("It should create new company", async function () {
    const response = await request(app)
      .post("/companies")
      .send({ name: "APPLE", description: "Iphone 14" });

    expect(response.body).toEqual(
      {
        "company": {
          code: "APPLE",
          name: "APPLE",
          description: "Iphone 14",
        }
      }
    );
  });

});


describe("PUT /", function () {

  test("It should update company", async function () {
    const response = await request(app)
      .put("/companies/one")
      .send({ name: "New", description: "New Test" });

    expect(response.body).toEqual(
      {
        "company": {
          code: "one",
          name: "New",
          description: "New Test",
        }
      }
    );
  });

  test("It should return 404 for no-such-comp", async function () {
    const response = await request(app)
      .put("/companies/dne")
      .send({ name: "should not work" });

    expect(response.status).toEqual(404);
  });

});


describe("DELETE /", function () {

  test("It should delete company", async function () {
    const response = await request(app)
      .delete("/companies/one");

    expect(response.body).toEqual({ "status": "deleted" });
  });

});

