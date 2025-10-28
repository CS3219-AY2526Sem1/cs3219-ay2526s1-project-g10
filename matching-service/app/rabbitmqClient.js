import amqp from 'amqplib';

let channel;

export async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
        channel = await connection.createChannel();

        await channel.assertQueue("match_queue", { durable: false });
        console.log("Connected to RabbitMQ");

    } catch (error) {
        console.error("Failed to connect to RabbitMQ", error);
    }
}

connectRabbitMQ(); 

export const addToQueue = async (queue, message) => {
    if (!channel) {
        console.warn("RabbitMQ channel not ready yet — skipping message:", message);
        return;
    }
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    console.log(`Message sent to ${queue}:`, message);
}