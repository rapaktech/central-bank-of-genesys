const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('./index');
const seedAdmin = require('./seeders/admin');
const connectToDB = require('./db/setup');

beforeAll(async () => {
    await connectToDB();
    await seedAdmin();
});

afterAll((done) => {
    mongoose.connection.db.dropDatabase(async () => {
        mongoose.connection.close(() => done());
    });
});


test("GET /", async () => {
    await supertest(app)
        .get('/')
        .expect(200)
        .then((response) => {
            expect(response.body.message).toBe('Welcome To The Central Bank of Genesys!');
        })
    ;
});



// Admin routes tests

test("POST /auth/admin", async () => {
    await supertest(app)
        .post('/auth/admin')
        .send()
        .expect(201)
        .then((response) => {
            expect(String.isString(response.body.token)).toBeTruthy();
        })
    ;
});