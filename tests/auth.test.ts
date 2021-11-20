import * as request from "supertest";
import mongoose = require("mongoose");
import { app, server } from "../src/app";
//import User from "../src/models/userModel";
//const api = supertest(app);

const initialUsers = [
  {
    email: "oscaremiliolugo@gmail.com",
    firstName: "Oscar",
    lastName: "Lugo",
    password: "26092002Aa*",
  },
];

jest.useFakeTimers();

//beforeEach(async () => {
//await User.deleteMany({});
//await User.create(initialUsers[0]);
//});
//describe("POST/ - signup", () => {
it("signup api", () => {
  const newUser = initialUsers[0];
  request(app)
    .post("/api/users/signup")
    .send({ ...newUser })
    .expect(201)
    .end(function (err, res) {
      if (err) throw err;
      console.log(res);
    });
  //expect(1).toBe(1);
  //console.log(res);
  //expect("Content-Type", /json/);
});
//});

afterAll(() => {
  mongoose.connection.close();
  server.close();
});
