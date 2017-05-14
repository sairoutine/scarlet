'use strict';

var EVENT_NAME_TO_FUNCION = {
	ping:          ping,
	subscribe:     subscribe,
	publish:       publish,
	create_room:   create_room,
	join:          join,
	get_room_list: get_room_list,
	send_data:     send_data,
};

var WebSocket = require('ws');

var wss = new WebSocket.Server({ port: 8080 });

// TODO: garbage collect the channel_list variables if the client disconnects.
// TODO: implement: unsubscribe
// TODO: ERROR event must be required
// TODO: implement: quit,get_room_member_list command
// TODO: split arguments BY argument_num defined in each function in parsed_command function
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

// TODO: check the client joins the room twice.
function join (ws, argument_list) {
	var room_name = argument_list[0];

	if(!room_name) return;

	var room_data = room_list[room_name];

	if(!room_data) return; // TODO: error

	if(room_data.clients_limit && room_data.clients_limit <= room_data.client_list.length) return; // TODO: error

	room_data.client_list.push(ws);

	if(room_data.clients_limit && room_data.clients_limit <= room_data.client_list.length) {
		room_data.client_list.forEach(function(client) {
			if (client.readyState === WebSocket.OPEN) {
				client.send(create_command("ROOM_CLIENTS_LIMIT", [room_name]));
			}
		});
	}
}

function get_room_list (ws, argument_list) {
	var room_name_list = Object.keys(room_list);

	ws.send(create_command("GOT_ROOM_LIST", [room_name_list.join(",")]));
}


function send_data (ws, argument_list) {
	var room_name = argument_list[0];
	var data      = argument_list[1];

	if(!room_name) return;
	if(!data)      return;

	var room_data = room_list[room_name];

	if(!room_data) return; // TODO: error

	// TODO: unable to send if the client does not belong to the room.

	room_data.client_list.forEach(function(client) {
		if (client !== ws && client.readyState === WebSocket.OPEN) {
			client.send(create_command("SENT", [data]));
		}
	});
}
