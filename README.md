# Scarlet

## Introduction
Scarlet is a game networking server and multiplayer platform by websocket and node.js.

**WIP**

## How to use
```
git clone git@github.com:sairoutine/scarlet.git
cd scarlet
npm install
npm start
```
## How to build
**WIP**

# APIs
```
SUBSCRIBE [channel name]
```

subscribe channel.
NOTE: you can subscribe same channel you subscribed before.

```
PUBLISH [channel name] [message]
```

publish message to channel someone subscribes.
the clients which subscribes the channel get `PUBLISHED [message]` event.
NOTE: you can publish a channel you don't subscribe.


```
CREATE_ROOM [room name] [clients limit]
```

Create a room which names [room name].
If you specify [clients limit] and the number of room clients equals limit,
Scarlet server notifies `ROOM_CLIENTS_LIMIT [room name]` event to room clients.

NOTE: If you create a room, Scarlet let you join the room you created.

```
JOIN [room name]
```
Join the room someone created.

```
SEND_DATA [room name] [data]
```
Send your data to room clients.

## EVENT
events the clients are notified.

```
PUBLISHED [message]
```

```
ROOM_CLIENTS_LIMIT [room name]`
```



## Roadmap

### ver 0.1
Goal: Implement proto for linux operating system
- publish/subscribe

### ver 0.2
Goal: Implement room
- create/delete room
- join/leave room

### ver 0.3
Goal: Implement object
- CRUD object in room

### ver 0.4
Goal: Implement notification event
- publish/subscribe event
- group chat

**WIP**

## License
This content is released under the (http://opensource.org/licenses/MIT) MIT License.
