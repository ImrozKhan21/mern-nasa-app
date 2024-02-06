const request = require('supertest');
const app = require('../../app')
const {connectMongoose, disconnectMongoose} = require("../../services/mongo");

connectMongoose();

describe('launches API', () => {
    beforeAll(async () => {
        await connectMongoose();
    });

    afterAll(async () => {
        await disconnectMongoose()
    });

    describe('get', () => {

        test('launches', async () => {
            const response = await request(app).get('/v1/launches');
            expect(response.statusCode).toBe(200);
        })

    })

    describe('post', () => {

        test('launches fail', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send({
                    mission: '',
                    rocket: '',
                    target: '',
                    launchDate: ''
                })
                .expect('Content-Type', /json/)
                .expect(400)
        });

        test('launches success', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send({
                    "mission": "123",
                    "rocket": "b31",
                    "target": "Kepler-442 b",
                    launchDate: '2024-01-24T15:41:08.0Z'
                })
                .expect('Content-Type', /json/)
                .expect(201)
        });

        test('launches InValid Date', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send({
                    mission: 'a',
                    rocket: 'a',
                    target: 'a',
                    launchDate: 'asZ'
                })
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.error).toBe('Invalid date');
        });

    })
})