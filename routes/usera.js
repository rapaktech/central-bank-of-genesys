const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const seedAdmin = require('../seeders/admin');
const connectToDB = require('../db/setup');

beforeAll(async () => {
    await connectToDB();
    await seedAdmin();
});

afterAll((done) => {
    mongoose.connection.close(() => done());
});

describe('User Login', () => {
    test("POST /auth/users", async () => {
        await supertest(app)
            .post('/auth/users')
            .send({ email: "jim@jimezesinachi.com", password: "foobar123" })
            .expect(201)
            .then((response) => {
                expect(response.body.message).toBe('User Logged In Successfully!');
                expect(response.body.token).toBeTruthy();
                expect(response.body.user._id).toBeTruthy();
                expect(response.body.user.email).toBe("jim@jimezesinachi.com");
                expect(response.body.user.accountNumber).toBeTruthy();
                expect(response.body.user.password).toBeFalsy();
                expect(response.body.user.isActive).toBeTruthy();
                expect(Array.isArray(response.body.user.transactions)).toBeTruthy();
            });
        ;
    });
});