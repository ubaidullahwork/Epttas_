const { EventHubProducerClient } = require("@azure/event-hubs");

const connectionString =
    "Endpoint=sb://delijntest.servicebus.windows.net/;SharedAccessKeyName=sender;SharedAccessKey=MCK2jfm/w4ryZ8otJylMW4noX4NYKX1y1+AEhMXuA30=;EntityPath=Endpoint=sb://delijntest.servicebus.windows.net/;SharedAccessKeyName=sender;SharedAccessKey=MCK2jfm/w4ryZ8otJylMW4noX4NYKX1y1+AEhMXuA30=;EntityPath=telemetry";
const eventHubName = "telemetry";

async function main() {
    console.log("main calll");
    // Create a producer client to send messages to the event hub.
    const producer = new EventHubProducerClient(connectionString, eventHubName);

    // Prepare a batch of three events.
    const batch = await producer.createBatch();
    console.log("batch created ");
    batch.tryAdd({ body: "First event" });
    batch.tryAdd({ body: "Second event" });
    batch.tryAdd({ body: "Third event" });

    // Send the batch to the event hub.
    await producer.sendBatch(batch);
    console.log("batch producer ");

    // Close the producer client.
    await producer.close();
    console.log("producer.close ");

    console.log("A batch of three events have been sent to the event hub");
}

main().catch((err) => {
    console.log("Error occurred: ", err);
});
