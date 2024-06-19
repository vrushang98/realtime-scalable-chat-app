import { Kafka, Producer, logLevel } from "kafkajs";
import fs from "fs";
import path from "path";
import prismaClient from "./prisma";

const kafkaConfig = {
  clientId: "my-app",
  brokers: ["192.168.1.7:9092"],
  logLevel: logLevel.INFO,
  // Uncomment the following lines if SSL and SASL are needed
  // ssl: {
  //   ca: [fs.readFileSync(path.resolve("./ca.pem"), "utf-8")],
  // },
  // sasl: {
  //   username: "your-username",
  //   password: "your-password",
  //   mechanism: "plain",
  // },
};

const kafka = new Kafka(kafkaConfig);

let kafkaInitialized: Promise<void> | null = null;

export async function initKafka() {
  if (kafkaInitialized) return kafkaInitialized;

  kafkaInitialized = (async () => {
    const admin = kafka.admin();
    try {
      console.log("Admin connecting...");
      await admin.connect();
      console.log("Admin connected successfully...");

      const topic = "messages";
      const topics = await admin.listTopics();

      if (!topics.includes(topic)) {
        console.log("Creating Topic...");
        await admin.createTopics({
          topics: [{ topic: topic, numPartitions: 2 }],
          waitForLeaders: true,
        });
        console.log("Topic Created successfully...");
      } else {
        console.log(`Topic "${topic}" already exists.`);
      }
    } catch (error) {
      console.error("Error in Kafka admin operations:", error);
    } finally {
      console.log("Disconnecting admin...");
      await admin.disconnect();
    }
  })();

  return kafkaInitialized;
}

let producer: Producer | null = null;

export async function createProducer() {
  if (producer) return producer;

  try {
    const _producer = kafka.producer();
    await _producer.connect();
    producer = _producer;
    console.log("Producer connected successfully...");
    return _producer;
  } catch (error) {
    console.error("Error connecting producer:", error);
    throw error;
  }
}

export async function produceMessage(message: string) {
  try {
    const producer = await createProducer();
    await producer.send({
      messages: [{ key: `message-${Date.now()}`, value: message }],
      topic: "messages",
    });
    console.log("Message produced successfully...");
    return true;
  } catch (error) {
    console.error("Error producing message:", error);
    return false;
  }
}

export async function startMessageConsumer() {
  const consumer = kafka.consumer({ groupId: "default" });

  await consumer.connect();
  await consumer.subscribe({ topic: "messages", fromBeginning: true });
  await consumer.run({
    autoCommit: true,
    eachMessage: async ({ message, pause }) => {
      console.log(`New msg received`);
      if (!message?.value) return;

      try {
        await prismaClient.message.create({
          data: {
            text: message.value?.toString(),
          },
        });
      } catch (err) {
        console.error(`Something is wrong`);
        pause();
        setTimeout(() => {
          consumer.resume([{ topic: "messages" }]);
        }, 60 * 1000);
      }
    },
  });
}

export default kafka;
