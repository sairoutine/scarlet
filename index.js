'use strict';
var WebSocket = require('ws');

var wss = new WebSocket.Server({ port: 8080 });

// a event which one of the client connects me
wss.on('connection', function connection(ws) {
	// a event which the client sends me
	ws.on('message', function (data) {
		var parsed_data = parse_data(data);

		if (!parsed_data.event) return;

		// TODO: create event name to function
		//var func = EVENT_NAME_TO_FUNCION[ parsed_data.event ];

		//func(ws, parsed_data.arguments);

		/*
		// Broadcast to everyone else.
		wss.clients.forEach(function each(client) {
			if (client !== ws && client.readyState === WebSocket.OPEN) {
				client.send(data);
			}
		});
		*/
	});
});

/*
 * data format is "COMMAND ARGUMENTS".
 * ARGUMENTS are splited by space.
 */
function parse_data (data) {
	var parsed_data = {
		event: null,
		arguments: [],
	};

	if(!data) return parsed_data;

	var splited_data = data.split(" ");

	parsed_data.event     = splited_data.shift();
	parsed_data.arguments = splited_data;

	return parsed_data;
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
// Broadcast to all.
wss.broadcast = function broadcast(data) {
	wss.clients.forEach(function each(client) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(data);
		}
	});
};
*/

