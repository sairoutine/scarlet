'use strict';
var WebSocket = require('ws');

var wss = new WebSocket.Server({ port: 8080 });

/*
 * channel list
 * channel name -> subscribe clients list
 */
var channel_list = {

};




// a event which one of the client connects me
wss.on('connection', function connection(ws) {
	// a event which the client sends me
	ws.on('message', function (data) {
		var parsed_data = parse_data(data);

		if (!parsed_data.event) return;

		// event name to function
		var func = EVENT_NAME_TO_FUNCION[ parsed_data.event.toLowerCase() ];

		if (!func) return;

		func(ws, parsed_data.argument_list);
	});
});

/*
 * data format is "COMMAND ARGUMENTS".
 * ARGUMENTS are splited by space.
 */
function parse_data (data) {
	var parsed_data = {
		event: null,
		argument_list: [],
	};

	if(!data) return parsed_data;

	var splited_data = data.split(" ");

	parsed_data.event         = splited_data.shift();
	parsed_data.argument_list = splited_data;

	return parsed_data;
}


var EVENT_NAME_TO_FUNCION = {
	ping:        ping,
	subscribe:   subscribe,
	publish:     publish,
	create_room: create_room,
	join:        join,
	send_data:   send_data,
};

function ping (ws, argument_list) {
	ws.send("PONG");
}

function subscribe () {

}

function publish () {

}

function create_room () {

}

function join () {
//-> ROOM_CLIENTS_LIMIT

}

function send_data () {

}

/*
// Broadcast to everyone else.
wss.clients.forEach(function each(client) {
	if (client !== ws && client.readyState === WebSocket.OPEN) {
		client.send(data);
	}
});
*/

