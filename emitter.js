const { Manager } = require("socket.io-client");
const crypto = require('crypto');
const data = require('./data.json'); // Load the constant data

const manager = new Manager("localhost:3001");

const client = manager.socket("/"); // main namespace

const passphrase = 'my-secret-passphrase';

client.on("connect", () => {
  console.log('Emitter connected');

  // Function to generate a random item from an array
  const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

  // Function to generate a SHA-256 hash
  const computeHash = (data) => crypto.createHash('sha256').update(data).digest('hex');

  // Emitter interval
  const emitterInterval = setInterval(() => {
    const messageCount = Math.floor(Math.random() * 451) + 49; // Random message count between 49 and 499
    const encryptedMessages = [];
    for (let i = 0; i < 1; i++) {
      const name = getRandomItem(data.names);
      const origin = getRandomItem(data.origins);
      const destination = getRandomItem(data.destinations);
      const originalMessage = { name, origin, destination };
      const secretKey = computeHash(JSON.stringify(originalMessage));
      
      const message = {
        ...originalMessage,
        secret_key: secretKey
      };
      const encryptedMessage = encryptMessage(JSON.stringify(message), passphrase);
      encryptedMessages.push(encryptedMessage);
    }

    const dataStream = encryptedMessages.join('|');
    client.emit('emitter', dataStream, (response) => {
      console.log(response);
    });
    console.log('Emitted data stream:', encryptedMessages.length);
  }, 10000); // Emit every 10 seconds

  client.on('disconnect', () => {
    clearInterval(emitterInterval);
    console.log('Emitter disconnected');
  });
});

// Placeholder for encryption function
function encryptMessage(message, passphrase) {
    const key = crypto.createHash('sha256').update(passphrase).digest();
    const iv = crypto.randomBytes(16); // Generate a random initialization vector
    const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);
  
    const encryptedData = Buffer.concat([
      cipher.update(message, 'utf8'),
      cipher.final()
    ]);
  
    return iv.toString('hex') + encryptedData.toString('hex');
}
