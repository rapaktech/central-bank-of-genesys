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
    mongoose.connection.close(() => done());
});


describe('Testing response to root route, invaild routes, bad requests and error handling', () => {
    test("GET /", async () => {
        await supertest(app)
            .get('/')
            .expect(200)
            .then((response) => {
                expect(response.body.message).toBe('Welcome To The Central Bank of Genesys!');
            })
        ;
    });

    test("GET /invalid", async () => {
        await supertest(app)
            .get('/invalid')
            .expect(404)
            .then((response) => {
                expect(response.body.message).toBe('Page Not Found!');
            })
        ;
    });

    test("POST /auth/admin", async () => {
        await supertest(app)
            .post('/auth/admin')
            .send()
            .expect(400)
            .then((response) => {
                expect(response.body.message).toBe("One Or More Input Fields Are Empty!");
            });
        ;
    });
});