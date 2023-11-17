const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});
const users = new Map(); // Map of socket.id to name
const points = new Map(); // Map of name to point

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('join', (name) => {
    if (Array.from(users.values()).includes(name)) {
      socket.emit('usernameError', 'This username is already taken');
      return;
    }
    console.log(name + ' joined');
    users.set(socket.id, name);
    io.emit('userJoined', name); // Send the user's name to the front end

    // Send the list of all users to the client
    socket.emit('users', Array.from(users.values()).map(name => [name, points.get(name)]));
  });

  socket.on('select', (data) => {
    console.log(data.name + ' selected ' + data.point);
    points.set(data.name, data.point);
    io.emit('userSelected', data.name); // Send the user's name to the front end

    if (Array.from(users.values()).every((user) => points.has(user))) {
      // All users have selected a point, calculate and send results
      const pointValues = Array.from(points.values()).filter((point) => point !== '?');
      const min = Math.min(...pointValues);
      const max = Math.max(...pointValues);
      const avg = pointValues.reduce((a, b) => a + b, 0) / pointValues.length;

      io.emit('update', {min, max, avg, points: Array.from(points.entries())});
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    const name = users.get(socket.id);
    users.delete(socket.id);
    points.delete(name);
    io.emit('userDisconnected', name); // Send the user's name to the front end
  });

  socket.on('reset', () => {
    points.clear();
    io.emit('reset');
  });
});

server.listen(3001, () => {
  console.log('listening on *:3001');
});
