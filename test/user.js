var chai = require('chai'),
    chaiHttp = require('chai-http'),
    server = require('../server'),
    should = chai.should(),
    mongoose = require("mongoose"),
    User = require('../db/models/User');

chai.use(chaiHttp);

describe('Users', function(){
  
  User.collection.drop();
  
  beforeEach(function(done){
    var newUser = new User({
      firstName: "giant",
      lastName: "douche",
      email: "giant-douche@example.com",
      phone: "1234567890"
    });
    newUser.save(function(err){
      done();
    });
  });
  
  afterEach(function(done){
    User.collection.drop();
    done();
  });
  
  it('GET should list All users at /api/users', function(done){
    chai.request(server)
    .get('/api/users')
    .end(function(err, res){
      res.should.have.status(200);
      res.should.be.json;
      res.body.should.be.a('array');
      res.body[0].should.have.property('_id');
      res.body[0].should.have.property('firstName');
      res.body[0].should.have.property('lastName');
      res.body[0].should.have.property('phone');
      res.body[0].should.have.property('email');
      res.body[0].firstName.should.equal('giant');
      res.body[0].lastName.should.equal('douche');
      res.body[0].phone.should.equal('1234567890');
      res.body[0].email.should.equal('giant-douche@example.com');
      done();
    });
  });
  
  it('GET should list a SINGLE user at /api/user/:id ', function(done) {
    var newUser = new User({
      firstName: "giant",
      lastName: "douche",
      email: "giant-douche@example.com",
      phone: "1234567890"
    });
    newUser.save(function(err, data){
      chai.request(server)
      .get('/api/users/' + data.id)
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.a.property('_id');
        res.body.should.have.a.property('firstName');
        res.body.should.have.a.property('lastName');
        res.body.should.have.a.property('phone');
        res.body.should.have.a.property('email');
        res.body.firstName.should.equal('giant');
        res.body.lastName.should.equal('douche');
        res.body.phone.should.equal('1234567890');
        res.body.email.should.equal('giant-douche@example.com');
        res.body._id.should.equal(data.id);
        done();
      });
    });
  });
  
  it("POST should add a single user", function(done) {
    chai.request(server)
    .post('/api/users')
    .send({"firstName": "giant", "lastName": "douche", "phone": "1234567890", "email": "giant-douche@hotmail.com"})
    .end(function(err, res){
      res.should.have.status(200);
      res.should.be.json;
      res.body.should.be.a('object');
      res.body.should.have.property("success");
      res.body.success.should.be.a('object');
      res.body.success.should.have.property('firstName');
      res.body.success.should.have.property('lastName');
      res.body.success.should.have.property('phone');
      res.body.success.should.have.property('email');
      res.body.success.firstName.should.equal("giant");
      res.body.success.lastName.should.equal("douche");
      res.body.success.email.should.equal("giant-douche@hotmail.com");
      res.body.success.phone.should.equal("1234567890");
      done();
    });
  });
  
  it('PUT should update a single user at /api/users/:id', function(done) {
    chai.request(server)
    .get('/api/users')
    .end(function(err, res){
      chai.request(server)
      .put('/api/users/' + res.body[0]._id)
      .send({"firstName": "turd", "lastName": "sandwich", "phone": "9876543210", "email": "turd-sandwich@example.com"})
      .end(function(error, response){
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.a('object');
        response.body.should.have.property('updated');
        response.body.updated.should.be.a('object');
        response.body.updated.should.have.property('firstName');
        response.body.updated.should.have.property('lastName');
        response.body.updated.should.have.property('phone');
        response.body.updated.should.have.property('email');
        response.body.updated.should.have.property('_id');
        response.body.updated.firstName.should.equal('turd');
        response.body.updated.lastName.should.equal('sandwich');
        response.body.updated.phone.should.equal('9876543210');
        response.body.updated.email.should.equal('turd-sandwich@example.com');
        done();
      });
    });
  });
  
  it('DELETE should delete a single user at /api/users/:id', function(done) {
    chai.request(server)
    .get("/api/users")
    .end(function(err, res){
      chai.request(server)
      .delete("/api/users/" + res.body[0]._id)
      .end(function(error, response){
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.a('object');
        response.body.should.have.property('removed');
        response.body.removed.should.be.a('object');
        done();
      });
    });
  });
});