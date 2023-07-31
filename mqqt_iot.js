const mqtt = require("mqtt");

const protocol = "mqtt";
const host = "hairdresser.cloudmqtt.com";
const port = "18729";
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
const mqtt1 = require("mqtt-packet");
const connectUrl = `${protocol}://${host}:${port}`;

const opts = { protocolVersion: 4 }; // default is 4. Usually, opts is a connect packet
const parser = mqtt1.parser(opts);

// Username: processor;
// Password: nzBaLZm1AcctEPvR;

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

    // const object = {
    //     cmd: "publish",
    //     retain: false,
    //     qos: 0,
    //     dup: false,
    //     length: 10,
    //     topic: topic,
    //     payload: payload, // Can also be a Buffer
    // };
    // const opts = { protocolVersion: 4 }; // default is 4. Usually, opts is a connect packet
    // console.log("============ before ================");
    // console.log(mqtt1.generate(object));
    // let json = JSON.stringify();
    // console.log(payload.toString("hex"));

    // console.log("============ after ================");
    // console.log(payload[0]);
    // console.log(payload[1]);
    // console.log(payload[2]);
    // for (let i = 0; i < 10; i++) {
    // console.log(payload[13]);z
    // }

    var structure_version = payload[0];
    var record_type = payload[1];
    var record_type_imei_case = "02";
    var mimi_record_length = payload[2];
    var mimi_record_data = "";
    var mimi_record_data_start_point = 4;
    var mimi_record_data_last_point = 0;
    var telemetry_record_data = "";
    var telemetry_record_length = 0;
    var telemetry_record_start_point = 0;
    var telemetry_record_end_point = 0;

    if (structure_version == "02") {
        // if payload[0] is 02 than Structure version is 2
        if (record_type == record_type_imei_case) {
            // if payload[1] is 02 than 02 Record type (IMEI in this case)

            if (payload[3] != "00") {
                mimi_record_length = " " + payload[3];
            }

            mimi_record_data_last_point =
                mimi_record_data_start_point + mimi_record_length;

            console.log("mimi_record_length = " + mimi_record_length);

            console.log(
                "mimi_record_data_last_point = " + mimi_record_data_last_point
            );

            for (let i = mimi_record_data_last_point - 1; i > 3; i--) {
                mimi_record_data =
                    mimi_record_data + " " + payload[i].toString(16);
            }

            console.log("mimi_record_data ", mimi_record_data);

            console.log(
                "mimi_record_data without spacing ",
                mimi_record_data.replace(/\s/g, "")
            );
            console.log(
                "mimi_record_data in decical   ",
                parseInt(mimi_record_data.replace(/\s/g, ""), 16)
            );
            console.log(
                "mimi_record_data_last_point   ",

                payload[mimi_record_data_last_point]
            );

            if (payload[mimi_record_data_last_point] == "01") {
                // 01 Record type (Telemetry data)

                console.log(
                    "payload[mimi_record_data_last_point + 1] " +
                        payload[mimi_record_data_last_point + 1]
                );

                console.log(
                    "payload[mimi_record_data_last_point + 2] " +
                        payload[mimi_record_data_last_point + 2]
                );

                if (payload[mimi_record_data_last_point + 1] != "00") {
                    telemetry_record_length =
                        payload[mimi_record_data_last_point + 1];
                }
                if (payload[mimi_record_data_last_point + 2] != "00") {
                    telemetry_record_length =
                        telemetry_record_length +
                        " " +
                        payload[mimi_record_data_last_point + 2];
                }

                console.log(
                    "telemetry_record_length ",
                    telemetry_record_length
                );

                telemetry_record_start_point = mimi_record_data_last_point + 3;

                telemetry_record_end_point =
                    telemetry_record_start_point + telemetry_record_length;

                console.log(
                    "telemetry_record_start_point ",
                    telemetry_record_start_point
                );

                console.log(
                    "telemetry_record_end_point ",
                    telemetry_record_end_point
                );

                for (
                    let i = telemetry_record_end_point - 1;
                    i >= telemetry_record_start_point;
                    i--
                ) {
                    telemetry_record_data =
                        telemetry_record_data + " " + payload[i].toString(16);
                }

                console.log("telemetry_record_data ", telemetry_record_data);
                console.log(
                    "telemetry_record_data with out space  ",

                    telemetry_record_data.replace(/\s/g, "")
                );
                console.log(
                    "telemetry_record_data   ",

                    parseInt(telemetry_record_data.replace(/\s/g, ""), 16)
                );

                var data_date =
                    payload[telemetry_record_end_point] +
                    " " +
                    payload[telemetry_record_end_point + 1] +
                    " " +
                    payload[telemetry_record_end_point + 2] +
                    " " +
                    payload[telemetry_record_end_point + 3] +
                    " ";

                console.log("data_date ", data_date);
            }
        }
    }
});
function reverseString(str) {
    return str.split("").reduce((reversed, char) => char + reversed, "");
}
