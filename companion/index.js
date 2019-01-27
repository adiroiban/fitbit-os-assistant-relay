import * as messaging from "messaging";
import { settingsStorage } from "settings";

// ---------- Device - Companion communication ----------

// Message socket opens
messaging.peerSocket.onopen = () => {
  console.log(`Companion Socket Open`);
  restoreSettings();
};

// Message socket closes
messaging.peerSocket.onclose = () => {
  console.log("Companion Socket Closed");
};

messaging.peerSocket.onmessage = event => {
  //console.log(`Companion received: ${JSON.stringify(event)}`);
  handleAction(event.data)
};

// Send data to device using Messaging API
function send(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  }
}

// -------- Settings handling -------------------

// A user changes settings
settingsStorage.onchange = event => {
  console.log(`New settings ${event.key}:${event.newValue}:${event.oldValue}`)

  if (event.key == 'test') {
    // We have a request to test the configuration.
    if (!event.newValue) {
      // Not a real test... just deleting the test.
      // To trigger the test we set and then delete.
      return
    }
    send_command({
      'command': 'Testing FitBit',
      'broadcast': true
    })
    return
  }

  // Inform the App about the configuration changes.
  // We migth want to only notify about the things changes,
  // and not all settings.
  let data = {
    'type': 'configuration',
    'key': event.key,
    'value': event.newValue
  };
  send(data)
};


// Restore any previously saved settings and send to the device.
function restoreSettings() {
  console.log("Restoring settings...");
  for (let index = 0; index < settingsStorage.length; index++) {
    let key = settingsStorage.key(index);
    if (key) {
      let data = {
        'type': 'configuration',
        'key': key,
        'value': settingsStorage.getItem(key)
      };
      send(data);
    }
  }
}

// -------------- Application logic -------------


function handleAction(data) {
  if (data.type === 'switch') {
    send_command({
      'command': `turn ${data.key} ${data.value}`
    })
  }

  if (data.type === 'set_brightness') {
    send_command({
      'command': `set ${data.key} to ${data.value}%`
    })
  }
  
}



function send_command(command) {
  const address = settingsStorage.getItem('address')
  const url = 'http://' + address + '/assistant'
  console.log(`Sending to ${url} ${JSON.stringify(command)}`)
  
  const request = {
    'method': 'POST',
    'headers': {
      'content-type': 'application/json'
    },
    'body': JSON.stringify(command)
  }

  fetch(url, request)
    .then(response => response.text())
    .then(text => console.log("Server: " + text))
}