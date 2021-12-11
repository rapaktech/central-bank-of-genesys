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


describe('User Routes', () => {
    let token;
    test("POST /auth/users", async () => {
        await supertest(app)
            .post('/auth/users')
            .send({ email: "user@example.com", password: "foobar123" })
            .expect(201)
            .then((response) => {
                token = response.body.token;
                expect(response.body.message).toBe('User Logged In Successfully!');
                expect(response.body.token).toBeTruthy();
                expect(response.body.user._id).toBeTruthy();
                expect(response.body.user.email).toBe("user@example.com");
                expect(response.body.user.accountNumber).toBeTruthy();
                expect(response.body.user.password).toBeFalsy();
                expect(response.body.user.isActive).toBeTruthy();
                expect(Array.isArray(response.body.user.transactions)).toBeTruthy();
            });
        ;
    });

    test("POST /dashboard/deposit", async () => {
        await supertest(app)
            .post('/dashboard/deposit')
            .send({ amount: 20000, description: "My First Deposit!" })
            .set('Authorization', token)
            .expect(200)
            .then((response) => {
                expect(response.body.message).toBeTruthy();
            });
        ;
    });

    test("POST /dashboard/withdraw", async () => {
        await supertest(app)
            .post('/dashboard/withdraw')
            .send({ amount: 2000, description: "My First Withdrawal!" })
            .set('Authorization', token)
            .expect(200)
            .then((response) => {
                expect(response.body.message).toBeTruthy();
            });
        ;
    });

    test("POST /dashboard/transfer", async () => {
        await supertest(app)
            .post('/dashboard/transfer')
            .send({ amount: 5000, description: "My First Transfer!", recipientAccountNumber: "5uokx23x7ed" })
            .set('Authorization', token)
            .expect(200)
            .then((response) => {
                expect(response.body.message).toBeTruthy();
            });
        ;
    });

    test("GET /dashboard", async () => {
        await supertest(app)
            .get('/dashboard')
            .set('Authorization', token)
            .expect(201)
            .then((response) => {
                expect(response.body.message).toBeTruthy();
            });
        ;
    });

});


