const mqtt = require("mqtt");
const protocol = "mqtt";
const host = "hairdresser.cloudmqtt.com";
const port = "18729";
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
const mqtt1 = require("mqtt-packet");
const connectUrl = `${protocol}://${host}:${port}`;

const opts = { protocolVersion: 4 };

const client = mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: 4000,
    username: "processor",
    password: "nzBaLZm1AcctEPvR",
    reconnectPeriod: 1000,
});
client.on("connect", () => {
    console.log("Connected");
    client.subscribe("device/#");
});

client.on("message", (topic, payload) => {
    console.log("Received Message:", topic, payload);
    const telemetryData = decodeTelemetryData(payload);
    console.log('telemetryData',JSON.stringify(telemetryData));

});

function decodeTelemetryData(payload) {
  const payloadData = payload.slice(1); // Remove the structure version (first byte)

  let index = 0;
  const telemetryData = [];

  while (index < payloadData.length) {
    const recordType = payloadData[index];
    index += 1;

    if (recordType === 0x02) {
      // IMEI Record
      const recordLength = (payloadData[index + 1] << 8) | payloadData[index];
      index += 2;

      const IMEI = payloadData.slice(index, index + recordLength);
      index += recordLength;

      telemetryData.push({ IMEI: IMEI.toString("hex") });
    } else if (recordType === 0x01) {
      // Sensors Array Record
      const recordLength = (payloadData[index + 1] << 8) | payloadData[index];
      index += 2;

      const timestamp = new Date(
        (payloadData[index + 3] << 24) |
          (payloadData[index + 2] << 16) |
          (payloadData[index + 1] << 8) |
          payloadData[index]
      );
      index += 4;

      const sensors = [];
      while (index < payloadData.length && index < recordLength + 2) {
        const sensorType = payloadData[index];
        index += 1;

        const sensorIdentifier = payloadData.slice(index, index + 2).toString("hex");
        index += 2;

        let sensorValue = null;

        switch (sensorType) {
          case 0x04: // Type_U8
          case 0x05: // Type_U16
          case 0x06: // Type_U32
          case 0x07: // Type_U64
          case 0x08: // Type_S8
          case 0x09: // Type_S16
          case 0x0A: // Type_S32
          case 0x0B: // Type_S64
          case 0x0C: // Type_Float
          case 0x0D: // Type_Double
            sensorValue = payloadData.slice(index, index + 4).readFloatLE(0);
            index += 4;
            break;

          case 0x0E: // Type_GPS (16 bytes)
            const latitude = payloadData.readFloatLE(index);
            const longitude = payloadData.readFloatLE(index + 4);
            const speed = payloadData.readUInt16LE(index + 8);
            const HDOP = payloadData.readUInt8(index + 10);
            const satellites = payloadData.readUInt8(index + 11);
            const course = payloadData.readUInt16LE(index + 12);
            const altitude = payloadData.readInt16LE(index + 14);

            sensorValue = {
              latitude: latitude,
              longitude: longitude,
              speed: speed,
              HDOP: HDOP,
              satellites: satellites,
              course: course,
              altitude: altitude,
            };
            index += 16;
            break;

          case 0x20: // Type_StringL1
          case 0x21: // Type_BinaryL1
            const length = payloadData[index];
            index += 1;
            sensorValue = payloadData.slice(index, index + length);
            index += length;
            break;

          case 0x40: // Type_StringL2
          case 0x41: // Type_BinaryL2
            const lengthL2 = (payloadData[index + 1] << 8) | payloadData[index];
            index += 2;
            sensorValue = payloadData.slice(index, index + lengthL2);
            index += lengthL2;
            break;

          default:
            // Unknown sensor type
            break;
        }

        // Push sensor entry only if sensorValue is not null
        if (sensorValue !== null) {
          sensors.push({ sensorIdentifier: sensorIdentifier, sensorValue: sensorValue });
        }
      }

      telemetryData.push({ timestamp: timestamp, sensors: sensors });
    } else {
      // Unknown record type, skip to the next record
      const remainingLength = (payloadData[index + 1] << 8) | payloadData[index];
      index += remainingLength + 2;
    }
  }
  return telemetryData;
}