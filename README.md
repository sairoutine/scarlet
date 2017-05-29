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
C2S_SUBSCRIBE [channel name]
```

subscribe channel.
NOTE: you can subscribe same channel you subscribed before.

```
C2S_PUBLISH [channel name] [message]
```

publish message to channel someone subscribes.
the clients which subscribes the channel get `S2C_PUBLISHED [message]` event.
NOTE: you can publish a channel you don't subscribe.


```
C2S_CREATE_ROOM [clients limit]
```

Create a room.
If Scarlet succeed to create a room, she notifies `S2C_SUCCEEDED_CREATE_ROOM [room name]` event to you.
If you specify [clients limit] and the number of room clients equals limit,
Scarlet server notifies `S2C_ROOM_CLIENTS_LIMIT [room name]` event to room clients.

NOTE: If you create a room, Scarlet let you join the room you created.

```
C2S_JOIN [room name]
```
Join the room someone created.

```
C2S_GET_ROOM_LIST
```
get room list someone has already created.
Scarlet server notifies `S2C_GOT_ROOM_LIST [room list]` event to you.

```
C2S_SEND_DATA [room name] [data]
```
Send your data to room clients.
the clients which belongs to the room get `S2C_SENT [message]` event.

## EVENT
events the clients are notified.

```
S2C_PUBLISHED [message]
```
**WIP**

```
S2C_SUCCEEDED_CREATE_ROOM [room name]
```
**WIP**

```
S2C_ROOM_CLIENTS_LIMIT [room name]`
```
**WIP**

```
S2C_GOT_ROOM_LIST [room list]`
```
room list data is splited by , (comma).

```
S2C_SENT [message]
```
**WIP**




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
