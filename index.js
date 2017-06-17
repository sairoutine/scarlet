'use strict';

var DEBUG = true;


var EVENT_NAME_TO_FUNCION = {
	c2s_ping:          ping,
	c2s_subscribe:     subscribe,
	c2s_publish:       publish,
	c2s_create_room:   create_room,
	c2s_join:          join,
	c2s_get_room_list: get_room_list,
	c2s_send_data:     send_data,
	c2s_join_random:   join_random,
};

if (DEBUG) {
	EVENT_NAME_TO_FUNCION["c2s_dump"] = dump;
}

var moment = require("moment");
var WebSocket = require('ws');

var wss = new WebSocket.Server({ port: 8080 });

// TODO: garbage collect the channel_list variables if the client disconnects.
// TODO: implement: unsubscribe
// TODO: ERROR event must be required
// TODO: implement: quit,get_room_member_list command
// TODO: split arguments BY argument_num defined in each function in parsed_command function
// TODO: server should return json data.


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

/*
 * room ID to create room name.
*/

var room_id = 0;

// a event which one of the client connects me
wss.on('connection', function connection(ws) {
	if(DEBUG) {
		log("ws: open");
	}

	// a event which the client sends me
	ws.on('message', function (data) {

		if(DEBUG) {
			log(data);
		}

		var parsed_data = parse_command(data);

		if (!parsed_data.event) return;

		// event name to function
		var func = EVENT_NAME_TO_FUNCION[ parsed_data.event.toLowerCase() ];

		if (!func) return;

		func(ws, parsed_data.argument_list);
	});

	ws.on('close', function() {
		if(DEBUG) {
			log("ws: close");
		}

		// exit room the client joined
		for (var room_name in room_list) {
			var room = room_list[room_name];

			for (var i = 0, len = room.client_list.length; i < len; i++) {
				var room_ws = room.client_list[i];

				if (room_ws === ws) {
					// exit room
					room.client_list.splice(i, 1);

					if (room.client_list.length === 0) {
						// delete the room no one joins.
						delete room_list[room_name];
					}
				}
			}
		}
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
	ws.send(create_command("S2C_PONG", argument_list));
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
			client.send(create_command("S2C_PUBLISHED", [message]));
		}
	});

}

function create_room (ws, argument_list) {
	var client_limit_num = argument_list[0];

	if (!client_limit_num) return; // TODO: error

	var room_name = ++room_id; // create room name

	if(room_list[room_name]) return; // TODO: error

	room_list[room_name] = {
		clients_limit: null,
		client_list: [],
	};

	room_list[room_name].clients_limit = client_limit_num;

	room_list[room_name].client_list.push(ws);

	ws.send(create_command("S2C_SUCCEEDED_CREATE_ROOM", [room_name]));
}

// TODO: check the client joins the room twice.
function join (ws, argument_list) {
	var room_name = argument_list[0];

	if(!room_name) return;

	var room_data = room_list[room_name];

	if(!room_data) return; // TODO: error

	if(room_data.clients_limit <= room_data.client_list.length) return; // TODO: error

	room_data.client_list.push(ws);

	if(room_data.clients_limit <= room_data.client_list.length) {
		room_data.client_list.forEach(function(client) {
			if (client.readyState === WebSocket.OPEN) {
				client.send(create_command("S2C_ROOM_CLIENTS_LIMIT", [room_name]));
			}
		});
	}
}

function get_room_list (ws, argument_list) {
	var room_name_list = Object.keys(room_list);

	ws.send(create_command("S2C_GOT_ROOM_LIST", [room_name_list.join(",")]));
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
			client.send(create_command("S2C_SENT", [data]));
		}
	});
}

function join_random(ws, argument_list) {
	// TODO: choose room randomly
	for (var room_name in room_list) {
		var room_data = room_list[room_name];

		// If there is a joinable room
		if(room_data.client_list.length > 0) {
			if (room_data.clients_limit > room_data.client_list.length) {
				join(ws, [room_name]);

				ws.send(create_command("S2C_SUCCEEDED_JOIN_ROOM", [room_name]));

				return;
			}
		}
	}

	// there is no room client can join.
	ws.send(create_command("S2C_NO_JOINABLE_ROOM"));
}

function dump (ws, argument_list) {

	var room_data = [];

	for (var room_id in room_list) {
		var room = room_list[room_id];
		room_data.push({
			id: room_id,
			clients_limit: room.clients_limit,
			clients_num: room.client_list.length,
		});
	}
	ws.send(create_command("S2C_DUMP", [JSON.stringify(room_data)]));
}

function log(data) {
	var m = moment();
	var time = m.format('YYYY/MM/DD HH:mm:ss');

	console.log(time + " " + data);
}



