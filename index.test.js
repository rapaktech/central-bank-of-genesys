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


describe('Admin Login', () => {
    test("POST /auth/admin", async () => {
        await supertest(app)
            .post('/auth/admin')
            .send({ email: "admin@example.com", password: "foobar123" })
            .expect(201)
            .then((response) => {
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
});



describe('Add New User', () => {
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
                email: "user@example.com",
                password: "foobar123",
                firstName: "The",
                lastName: "User",
                startDeposit: 5000
            }).set('Authorization', token)
            .expect(200)
            .then((response) => {
                token = response.body.token;
                expect(response.body.message).toBe("User Created Successfully!");
                expect(response.body.plainPassword).toBe("foobar123");
                expect(response.body.newUser._id).toBeTruthy();
                expect(response.body.newUser.email).toBe("user@example.com");
                expect(response.body.newUser.accountNumber).toBeTruthy();
                expect(response.body.newUser.password).toBeFalsy();
                expect(response.body.newUser.firstName).toBe('The');
                expect(response.body.newUser.lastName).toBe('User');
                expect(response.body.newUser.balance).toBe(5000);
            });
        ;
    });
});