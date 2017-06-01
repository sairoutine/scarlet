/* global before, after */

'use strict';
var chai = require('chai');
var should = chai.should();

var exec = require('child_process').exec;

var WebSocket = require('ws');

// start scarlet server

describe('Scarlet', function(){
	var ws;
	before(function(done){
		exec("npm start", function() {
			done();
		});
	});

	beforeEach(function(done){
		ws = new WebSocket('ws://localhost:8080/');
		ws.on('open', function () {
			done();
		});
	});

	afterEach(function(done) {
		ws.close();
		done();
	});

	it('should return pong', function(done){
		ws.on('message', function (data) {
			if (data === 'S2C_PONG') {
				done();
			}
		});
		ws.send("C2S_PING");
	});

});
