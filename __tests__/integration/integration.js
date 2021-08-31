// use supertest
const supertest = require('supertest');
const session = require('supertest-session')

// require app
const app = require('../../app')

// if the server takes a long time to process
// DB reuests that we could wait for longer
// than the default timeout value of 5 seconds
jest.setTimeout(10000);

var testSession = null;
 
beforeEach(function () {
  testSession = session(app);
});

describe('integration - vendor set van status', function() {
    var authenticatedSession;
 
    beforeEach(function (done) {
      testSession.post('/vendor/login')
        .send({ name: 'Test Van 0', password: 'abc' })
        .expect(302)
        .end(function (err) {
          if (err) return done(err);
          authenticatedSession = testSession;
          return done();
        });
    });

    describe('upload location and start business', function() {
        test('test setVanLocation', async function() {
            var res = authenticatedSession
                .get('/vendor')
        })
    })
})