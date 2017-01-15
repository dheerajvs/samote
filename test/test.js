'use strict';

const Samote = require('..');

const samote = new Samote({
  ip: '192.168.0.102',
  mac: 'AA-AA-AA-AA-AA-AA'
});

// samote.wake().then(() =>
  samote.connect()
// )
  // .then(() => samote.send('KEY_VOLDOWN'))
  .then(() => samote.send('KEY_MUTE'))
  .then(() => samote.close(),
    (reason) => {
      console.log(`rejected: ${reason}`);
    }
  );
