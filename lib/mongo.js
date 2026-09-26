const mongoose = require('mongoose');

let connected = false;

async function connectMongo() {
  if (!connected) {
    await mongoose.connect(process.env.MONGODB_URI);
    connected = true;
  }
}

module.exports = { connectMongo };