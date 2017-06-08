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

			ws2 = new WebSocket('ws://localhost:8080/');
			ws2.on('open', function () {
				done();
			});

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

	it('should be enable to subscribe/publish', function(done){
		var channel_name = "test";
		var message      = "test";
		ws1.on('message', function (data) {
			if (data.match(/^S2C_PUBLISHED/)) {
				done();
			}
		});

		ws1.send("C2S_SUBSCRIBE " + channel_name);

		ws2.send("C2S_PUBLISH " + channel_name + " " + message);
	});

	/* TODO:
	c2s_create_room:   create_room,
	c2s_join:          join,
	c2s_get_room_list: get_room_list,
	c2s_send_data:     send_data,
	c2s_join_random:   join_random,
	*/

});
