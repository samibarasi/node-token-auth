process.env.NODE_ENV = 'test'

const bcrypt = require('bcryptjs');
const chai = require('chai');
const should = chai.should();

const helpersAuth = require('../../src/server/auth/_helpers');

describe('auth: helpers', () => {
    describe('comparePass()', () => {
        it('should return true if the password is correct', (done) => {
            const salt = bcrypt.genSaltSync();
            const hash = bcrypt.hashSync('test', salt);
            const results = helpersAuth.comparePass('test', hash);
            should.exist(results);
            results.should.eql(true);
            done();
        });
        it('should throw an error if the password is incorrect', (done) => {
            const salt = bcrypt.genSaltSync();
            const hash = bcrypt.hashSync('test', salt);
            should.throw(() => helpersAuth.comparePass('testing', hash), Error, /bad pass silly money/);
            done();
        });
    });

});
