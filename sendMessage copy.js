const { Client } = require("azure-iot-device");
const Mqtt = require("azure-iot-device-mqtt").Mqtt;
const { Message } = require("azure-iot-device");
// Replace with your connection string and device ID
const connectionString =
    "HostName=dataplatform-ebs-iothub-poc-dev.azure-devices.net;DeviceId=866233059375345;SharedAccessKey=v0b9UVQUxlxH6zi602LYZIthpHHgRKNkcCNNOB9F/+k=";
const deviceId = "866233059373076";
// Create a new IoT Hub client
// const client = Client.fromConnectionString(connectionString, Mqtt);
// client.open((err) => {
//     if (err) {
//         console.error("Error opening IoT Hub connection:", err);
//     } else {
//         console.log("IoT Hub connection opened");
//         // Send a message to the IoT device
//         const message = new Message(
//             JSON.stringify({
//                 data: { imei: deviceId },
//             })
//         );
//         console.log("Sending message:", message.getData());
//         client.sendEvent(message, (err, res) => {
//             if (err) {
//                 console.error("Error sending message:", err);
//             } else {
//                 console.log(
//                     "Message sent to IoT device with status:",
//                     res.constructor.name
//                 );
//             }
//             client.close();
//         });
//     }
// });
