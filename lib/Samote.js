'use strict';

const WebSocket = require('ws');
const wol = require('wake_on_lan');

module.exports = class Samote {
  constructor(config) {
    this.config = config;

    if (!config.ip) {
      throw new Error('config value for \'ip\' is required');
    }

    this.appNameBase64 = (new Buffer(config['appName'] || 'samote')).toString('base64');
  }

  wake() {
    return new Promise((resolve, reject) => {
      wol.wake(this.config.mac, (error) => {
        error ? reject() : resolve();
      })
    })
  }

  connect() {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`http://${this.config.ip}:8001/api/v2/channels/samsung.remote.control?name=${this.appNameBase64}`);
      this.ws = ws;

      ws.addEventListener('message', (data, flags) => {
        console.log(`ws:message: type: ${data.type}`);
        data = JSON.parse(data.data);

        if (data.event === 'ms.channel.connect') {
          console.log(`ws:message: ms.channel.connect`);
          setTimeout(() => { resolve(); }, 1000);
        }
      });
    });

    ws.addEventListener('close', (code, reason) => {
      console.log(`ws:close: ${code}: ${reason}`);
    });

    ws.addEventListener('error', (error) => {
      console.log(`ws:error: ${error}`);
    });

    ws.addEventListener('open', () => {
      console.log(`ws:open`);
    });

    ws.addEventListener('ping', (data, flags) => {
      console.log(`ws:ping`);
    });

    ws.addEventListener('pong', (data, flags) => {
      console.log(`ws:pong`);
    });

    ws.addEventListener('unexpected-response', (request, response) => {
      console.log(`ws:unexpected-response: ${response}`);
    });
  }

  send(key) {
    return new Promise((resolve, reject) => {
      const cmd = {
        method: 'ms.remote.control',
        params: {
          Cmd: "Click", DataOfCmd: key, Option: "false", TypeOfRemote: "SendRemoteKey"
        }
      };

      console.log(`ws.send(${key})`);
      this.ws.send(JSON.stringify(cmd), {}, resolve);
    });
  }

  close() {
    console.log('ws.close()');
    this.ws.close();
    this.ws = null;
  }
};
