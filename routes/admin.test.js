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


describe('Admin Routes', () => {
    let token;
    test("POST /auth/admin", async () => {
        await supertest(app)
            .post('/auth/admin')
            .send({ email: "admin@example.com", password: "foobar123" })
            .expect(201)
            .then((response) => {
                token = response.body.token;
                expect(response.body.message).toBe('Admin Logged In Successfully!');
                expect(response.body.token).toBeTruthy();
                expect(response.body.admin._id).toBeTruthy();
                expect(response.body.admin.email).toBe("admin@example.com");
                expect(response.body.admin.username).toBeTruthy();
                expect(response.body.admin.password).toBeFalsy();
                expect(response.body.admin.firstName).toBeTruthy();
                expect(response.body.admin.lastName).toBeTruthy();
            });
        ;
    });

    test("POST /users", async () => {
        await supertest(app)
            .post('/users')
            .send({
                email: "user10@example.com",
                password: "foobar123",
                firstName: "Tenth",
                lastName: "User",
                startDeposit: 5000
            }).set('Authorization', token)
            .expect(200)
            .then((response) => {
                expect(response.body.message).toBe("User Created Successfully!");
                expect(response.body.plainPassword).toBe("foobar123");
                expect(response.body.newUser._id).toBeTruthy();
                expect(response.body.newUser.email).toBe("user10@example.com");
                expect(response.body.newUser.accountNumber).toBeTruthy();
                expect(response.body.newUser.password).toBeFalsy();
                expect(response.body.newUser.firstName).toBe('Tenth');
                expect(response.body.newUser.lastName).toBe('User');
                expect(response.body.newUser.balance).toBe(5000);
            });
        ;
    });

    test("PATCH /users/deactivate", async () => {
        await supertest(app)
            .patch('/users/deactivate')
            .send({ userId: '61b4f6ecb3621e86887d5214' })
            .set('Authorization', token)
            .expect(200)
            .then((response) => {
                expect(response.body.message).toBe("User Deactivated Successfully!");
            });
        ;
    });

    test("PATCH /users/reactivate", async () => {
        await supertest(app)
            .patch('/users/reactivate')
            .send({ userId: '61b4f6ecb3621e86887d5214' })
            .set('Authorization', token)
            .expect(200)
            .then((response) => {
                expect(response.body.message).toBe("User Reactivated Successfully!");
            });
        ;
    });

    test("DELETE /users/delete", async () => {
        await supertest(app)
            .delete('/users/delete')
            .send({ userId: '61b4f6ecb3621e86887d5214' })
            .set('Authorization', token)
            .expect(200)
            .then((response) => {
                expect(response.body.message).toBe("User Deleted Successfully!");
            });
        ;
    });

    test("POST /users/reverse", async () => {
        await supertest(app)
            .post('/users/reverse')
            .send({ transactionId: '61b4f4afa27ef0712058ecc7' })
            .set('Authorization', token)
            .expect(200)
            .then((response) => {
                expect(response.body.message).toBe('Reversal Successful!');
            });
        ;
    });
});