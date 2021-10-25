const tools = require("./report-worker");

const amqp = require("amqplib");
const queue = "dataFromBackend";
var open = amqp.connect("amqp://admin:admin@rabbitmq:5672");

open
  .then(function (conn) {
    return conn.createChannel();
  })
  .then(async function (ch) {
    return ch.assertQueue(queue).then(function () {
      return ch.consume(queue, function (msg) {
        if (msg !== null) {
          var dataFromRabbitMQ = JSON.parse(msg.content.toString());
          console.log(dataFromRabbitMQ);
          await tools.processDataFromBackend(dataFromRabbitMQ)
          .then(() => {
            ch.ack(msg);
          });
        }
      });
    });
  })
  .catch(console.warn);
