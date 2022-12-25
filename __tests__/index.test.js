const request = require("supertest");
const app = require("../src/index");

beforeAll((done) => {
  done();
});

// Test the welcome message
test("should return a welcome message", async () => {
  const response = await request(app).post("/bot").send({ Body: "Hello" });
  expect(response.statusCode).toBe(200);
  expect(response.text).toContain(
    "Hello! I'm an AI chat bot. I'm here to answer any questions you might have or just talk. I'm a pretty chill dude. Please be patient with my responses...I am easily distracted."
  );
});

afterAll((done) => {
  app.close();
  done();
});
