const tools = require("./report-worker");

const amqp = require("amqplib");
const queue = "dataFromBackend";
var open = amqp.connect("amqp://admin:admin@rabbitmq:5672");

open
  .then(function (conn) {
    return conn.createChannel();
  })
  .then(function (ch) {
    return ch.assertQueue(queue).then(function (ok) {
      return ch.consume(queue, function (msg) {
        if (msg !== null) {
          var dataFromRabbitMQ = JSON.parse(msg.content.toString());
          console.log(dataFromRabbitMQ);
          tools.processDataFromBackend(dataFromRabbitMQ);
          ch.ack(msg);
        }
      });
    });
  })
  .catch(console.warn);
