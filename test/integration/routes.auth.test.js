process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const { response } = require('express');
chai.use(chaiHttp);

const server = require('../../src/server/app');
const knex = require('../../src/server/db/connection');

describe('routes : auth', () => {

    beforeEach(() => {
        return knex.migrate.rollback()
            .then(() => { return knex.migrate.latest(); })
            .then(() => { return knex.seed.run(); });
    });

    afterEach(() => {
        return knex.migrate.rollback();
    });

    describe('POST /auth/register', () => {
        it('should register a new user', (done) => {
            chai.request(server)
                .post('/auth/register')
                .send({
                    username: 'michael',
                    password: 'herman'
                })
                .end((err, res) => {
                    should.not.exist(err);
                    res.redirects.length.should.eql(0);
                    res.status.should.eql(200);
                    res.type.should.eql('application/json');
                    res.body.should.include.keys('status', 'token');
                    res.body.status.should.eql('success');
                    done();
                });
        });
    });

    describe('POST /auth/login', () => {
        it('should login a user', (done) => {
            chai.request(server)
                .post('/auth/login')
                .send({
                    username: 'jeremy',
                    password: 'johnson123'
                })
                .end((err, res) => {
                    should.not.exist(err);
                    res.redirects.length.should.eql(0);
                    res.status.should.eql(200);
                    res.type.should.eql('application/json');
                    res.body.should.include.keys('status', 'token');
                    res.body.status.should.eql('success');
                    should.exist(res.body.token);
                    done();
                });
        });
        it('should not login a user if the password is false', (done) => {
            chai.request(server)
                .post('/auth/login')
                .send({
                    username: 'jeremy',
                    password: 'test'
                })
                .end((err, res) => {
                    should.exist(err);
                    res.redirects.length.should.eql(0);
                    res.status.should.eql(500);
                    res.type.should.eql('application/json');
                    res.body.should.include.keys('status');
                    res.body.status.should.eql('error');
                    should.not.exist(res.body.token);
                    done();
                });
        });
        it('should not login a unregistered user', (done) => {
            chai.request(server)
                .post('/auth/login')
                .send({
                    username: 'michael',
                    password: 'johnson123'
                })
                .end((err, res) => {
                    should.exist(err);
                    res.redirects.length.should.eql(0);
                    res.status.should.eql(500);
                    res.type.should.eql('application/json');
                    res.body.should.include.keys('status');
                    res.body.status.should.eql('error');
                    should.not.exist(res.body.token);
                    done();
                });
        });
    });

    describe('GET /auth/user', () => {
        it('should return a success', done => {
            chai.request(server)
                .post('/auth/login')
                .send({
                    username: 'jeremy',
                    password: 'johnson123'
                })
                .end((error, response) => {
                    should.not.exist(error);
                    chai.request(server)
                        .get('/auth/user')
                        .set('authorization', 'Bearer ' + response.body.token)
                        .end((err, res) => {
                            should.not.exist(err);
                            res.status.should.eql(200);
                            res.type.should.eql('application/json');
                            res.body.status.should.eql('success');
                            done();
                        });
                });
        });
        it('should throw an error if a user is not logged in', done => {
            chai.request(server)
                .get('/auth/user')
                .end((err, res) => {
                    should.exist(err);
                    res.redirects.length.should.eql(0);
                    res.status.should.eql(400);
                    res.type.should.eql('application/json');
                    res.body.should.include.keys('status');
                    done();
                });
        });
    });
});
