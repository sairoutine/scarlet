'use strict';
var WebSocket = require('ws');

var wss = new WebSocket.Server({ port: 8080 });

// TODO: garbage collect the channel_list variables if the client disconnects.
// TODO: implement: unsubscribe
// TODO: ERROR event must be required
/*
 * channel list
 * channel name -> WebSocket object list which subscribes channel
 */
var channel_list = {

};

/*
 * room list
 * room name -> {
 *     clients_limit: number,
 *     client_list: [], // WebSocket object list
 * }
 */
var room_list = {

};





// a event which one of the client connects me
wss.on('connection', function connection(ws) {
	// a event which the client sends me
	ws.on('message', function (data) {
		var parsed_data = parse_command(data);

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
function parse_command (data) {
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

/*
 * data format is "COMMAND ARGUMENTS".
 * ARGUMENTS are splited by space.
 */
function create_command (event, argument_list) {
	var data = "";
	if(!event) return data;

	var data_list = [].concat([event], argument_list);

	return data_list.join(" ");
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
	ws.send(create_command("PONG", argument_list));
}

function subscribe (ws, argument_list) {
	var channel_name = argument_list[0];

	if(!channel_name) return;

	if(!channel_list[channel_name]) {
		channel_list[channel_name] = [];
	}

	channel_list[channel_name].push(ws);
}

function publish (ws, argument_list) {
	var channel_name = argument_list[0];
	var message      = argument_list[1];

	if(!channel_list[channel_name]) return;
	if(!message) return;

	channel_list[channel_name].forEach(function(client) {
		if (client !== ws && client.readyState === WebSocket.OPEN) {
			client.send(create_command("PUBLISHED", [message]));
		}
	});

}

function create_room (ws, argument_list) {
	var room_name        = argument_list[0];
	var client_limit_num = argument_list[1];

	if(!room_name) return;

	if(room_list[room_name]) return; // TODO: error

	room_list[room_name] = {
		clients_limit: null,
		client_list: [],
	};

	if(client_limit_num) {
		room_list[room_name].clients_limit = client_limit_num;
	}

	room_list[room_name].client_list.push(ws);
}

function join (ws, argument_list) {
//-> ROOM_CLIENTS_LIMIT

}

function send_data (ws, argument_list) {

}
