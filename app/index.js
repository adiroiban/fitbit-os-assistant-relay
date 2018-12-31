import document from "document";
import * as messaging from "messaging";

// Store an in memory cache of the configuration.
let settings = {
  'things_on_off': [],
  'things_dimmable': []
}

// Message is received from the companion
messaging.peerSocket.onmessage = event => {
  //console.log(`App received: ${JSON.stringify(event)}`);
  handleConfiguration(event.data)
};

// Message socket opens
messaging.peerSocket.onopen = () => {
  //console.log("App Socket Open");
};

// Message socket closes
messaging.peerSocket.onclose = () => {
  //console.log("App Socket Closed");
};

// Send data to device using Messaging API
function send(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  }
}


// ------------- Configuration handling -----------------


// A new change was made to the configuration.
function handleConfiguration(data) {

  if (data.type != 'configuration') {
    // Not a configuration event.
    return
  }

  if (data.value) {
    // Start by setting the raw value.
    settings[data.key] = data.value;
  }

  if (data.key === 'things_on_off') {
    updateThingsOnOff()
  }

  if (data.key === 'things_dimmable') {
    updateThingsDimmable()
  }
}

// ---------- UI handling --------------



let virtualOnOffList = document.getElementById("things-on-off-list")

virtualOnOffList.delegate = {
  getTileInfo: function(index) {
    return {
      type: "my-pool",
      value: "Menu item",
      index: index
    };
  },
  configureTile: function(tile, info) {
    if (info.type == "my-pool") {
      let data
      let on_off = true
      if (info.index < settings['things_on_off'].length) {
        data = settings['things_on_off'][info.index]
      } else {
        data = settings['things_dimmable'][info.index - settings['things_on_off'].length]
        on_off = false
      }

      // Only let the marquee run for a few seconds.
      // And try to only
      let marquee = tile.getElementById("marquee");
      let thing_name = data.name;
      marquee.text = thing_name;
      setTimeout(() => marquee.state = "enabled", 1000);
      setTimeout(() => marquee.state = "disabled", (330 * thing_name.length) + 1000);

      if (on_off) {
        tile.getElementById('buttons-dim').style.display = 'none'
        tile.getElementById('buttons-on-off').style.display = 'inline'
        let on_button = tile.getElementById("button-on");
        on_button.onclick = evt => {
          console.log(`ON: ${thing_name}`);
          send({'type': 'switch', 'key': thing_name, 'value': 'on'})
        };
        let off_button = tile.getElementById("button-off");
        off_button.onclick = evt => {
          console.log(`OFF: ${thing_name}`);
          send({'type': 'switch', 'key': thing_name, 'value': 'off'})
        };
      } else {
        tile.getElementById('buttons-dim').style.display = 'inline'
        tile.getElementById('buttons-on-off').style.display = 'none'
        //set [light name] to 50%
        let dim_0 = tile.getElementById("dim-0");
        dim_0.onclick = evt => {
          console.log(`Dim 0%: ${thing_name}`);
          send({'type': 'switch', 'key': thing_name, 'value': 'off'})
        };

        let dim_1 = tile.getElementById("dim-1");
        dim_1.onclick = evt => {
          console.log(`Dim 25%: ${thing_name}`);
          send({'type': 'set_brightness', 'key': thing_name, 'value': '25'})
        };

        let dim_2 = tile.getElementById("dim-2");
        dim_2.onclick = evt => {
          console.log(`Dim 50%: ${thing_name}`);
          send({'type': 'set_brightness', 'key': thing_name, 'value': '50'})
        };

        let dim_3 = tile.getElementById("dim-3");
        dim_3.onclick = evt => {
          console.log(`Dim 75%: ${thing_name}`);
          send({'type': 'set_brightness', 'key': thing_name, 'value': '75'})
        };

        let dim_4 = tile.getElementById("dim-4");
        dim_4.onclick = evt => {
          console.log(`ON: ${thing_name}`);
          send({'type': 'set_brightness', 'key': thing_name, 'value': '100'})
        };
      }
    }
  }
};

// --------- App actions -------------------

// Update the list of things that can be only be turned on/off
function updateThingsOnOff() {
  let raw_data = settings['things_on_off']
  console.log('Got on/off things:' + raw_data);
  settings['things_on_off'] = JSON.parse(raw_data);
  // `length` must be set AFTER `delegate`.
  virtualOnOffList.length = settings['things_on_off'].length + settings['things_dimmable'].length

}

// Update the list of things that can be only be turned on/off
function updateThingsDimmable() {
  let raw_data = settings['things_dimmable']
  console.log('Got dimmable things:' + raw_data);
  settings['things_dimmable'] = JSON.parse(raw_data);
  // `length` must be set AFTER `delegate`.
  virtualOnOffList.length = settings['things_on_off'].length + settings['things_dimmable'].length
}