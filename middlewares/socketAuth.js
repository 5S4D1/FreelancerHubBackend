const jwt = require('jsonwebtoken');

function socketAuth(socket, next) {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error("No token provided"));
  }

  jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error("Unauthorized"));
    }
    socket.user = decoded; // attach user info
    next();
  });
}

module.exports = socketAuth;
