/* global before, after */

'use strict';
var chai = require('chai');
var should = chai.should();

var exec = require('child_process').exec;

var WebSocket = require('ws');

// start scarlet server

describe('Scarlet', function(){
	var ws1, ws2;
	/*
	before(function(done){
		exec("npm start", function() {
			done();
		});
	});
	*/
	beforeEach(function(done){
		ws1 = new WebSocket('ws://localhost:8080/');
		ws1.on('open', function () {
			done();
		});
	});

	afterEach(function(done) {
		ws1.close();
		done();
	});

	/*
	after(function(done){
		exec("killall scarlet", function() {
			done();
		});
	});
	*/

	it('should return pong', function(done){
		ws1.on('message', function (data) {
			if (data === 'S2C_PONG') {
				done();
			}
		});
		ws1.send("C2S_PING");
	});

});
