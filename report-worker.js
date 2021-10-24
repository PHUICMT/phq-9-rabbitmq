const axios = require("axios").default;

async function processDataFromBackend(dataFromRabbitMQ) {
  var Emote = null;
  if (dataFromRabbitMQ != undefined) {
    await emoteTimeLength(
      dataFromRabbitMQ.total_emotion_time,
      dataFromRabbitMQ.all_json.clickTime,
      dataFromRabbitMQ.all_json.fontEndTimeStamp
    ).then((result) => (Emote = result));
    var stringClickTime = showClickTime(dataFromRabbitMQ.all_json.clickTime);
    var stringReactionTime = getReactionsTimes(
      dataFromRabbitMQ.all_json.reactionTime
    );
    var stringBehavior = getBehavior(dataFromRabbitMQ.all_json.behavior);
    var stringGroupsTest = getGroupType(dataFromRabbitMQ.all_json.checkBox);
    var stringEmote = "";
    if (Emote != null) {
      stringEmote = getEmotePerQuestion(Emote);
    }

    var json = JSON.stringify({
      to_email: dataFromRabbitMQ.all_json.to_email,
      uuid: dataFromRabbitMQ.all_json.uuid,
      stringEmote: stringEmote,
      stringClickTime: stringClickTime,
      stringReactionTime: stringReactionTime,
      stringBehavior: stringBehavior,
      stringGroupsTest: stringGroupsTest,
    });
    MailSender(json).then((result) => {
      console.log(result);
    });
  }
}

async function MailSender(json) {
  return axios
    .post("http://server:5000/send-mail", json, {
      headers: { "Content-Type": "application/json;charset=UTF-8" },
    })
    .then((response) => response.data)
    .catch((error) => console.log(error));
}

async function emoteTimeLength(
  total_emotion_time,
  clickTime,
  fontEndTimeStamp
) {
  var allEmote = [];
  var Angry = total_emotion_time.angry;
  var Happy = total_emotion_time.happy;
  var Neutral = total_emotion_time.neutral;
  var Sad = total_emotion_time.sad;

  await clickTime.forEach((dummy, i) => {
    var emotePerQuestion = [false, false, false, false]; //Angry, Happy, Neutral, Sad
    fontEndTimeStamp[i].map((timeLength) => {
      var start = timeLength[0];
      var end = timeLength[1];
      if (start > 10000000) {
        start = Math.abs(start - start_end_time[0]);
      }
      if (end > 10000000) {
        end = Math.abs(end - start_end_time[0]);
      }

      Angry.map((timeStamp) => {
        if (timeStamp > start && timeStamp < end) {
          emotePerQuestion[0] = true;
        }
      });
      Happy.map((timeStamp) => {
        if (timeStamp > start && timeStamp < end) {
          emotePerQuestion[1] = true;
        }
      });
      Neutral.map((timeStamp) => {
        if (timeStamp > start && timeStamp < end) {
          emotePerQuestion[2] = true;
        }
      });
      Sad.map((timeStamp) => {
        if (timeStamp > start && timeStamp < end) {
          emotePerQuestion[3] = true;
        }
      });
    });
    allEmote.push(emotePerQuestion);
    emotePerQuestion = [false, false, false, false];
  });
  return allEmote;
}

function getGroupType(checkBox) {
  result = "กลุ่มผู้เข้าทดสอบ : ";
  if (checkBox == 1) {
    result = "ปกติ";
  }
  if (checkBox == 2) {
    result = "มีภาวะซึมเศร้า";
  }
  if (checkBox == 3) {
    result = "กำลังรักษา";
  }
  return result;
}

function getReactionsTimes(reactionTime) {
  var result = "";
  reactionTime.map((timeLong, index) => {
    var t = timeLong / 1000;
    result += "ข้อ " + (index + 1) + " -> ใช้เวลา " + t + "\n";
  });
  return result;
}

function showClickTime(clickTime) {
  var timeClick = "";
  clickTime.map((click, index) => {
    var question = "ข้อ" + (index + 1) + " -> ";
    if (click === null) {
      question += "NOT CLICKED";
    } else {
      question += click + " น.";
    }
    timeClick += question + "\n";
  });
  return timeClick;
}

function getBehavior(behavior) {
  var result = "";
  if (typeof behavior !== "undefined") {
    behavior.map((item, index) => {
      result += "ข้อ " + (index + 1) + " -> " + item + "\n";
    });
  }
  return result;
}

function getEmotePerQuestion(emote) {
  var result = "";
  if (typeof emote !== "undefined") {
    emote.map((perQuestion, index) => {
      result += "ข้อ " + (index + 1);
      if (perQuestion[0]) {
        result += " |Angry| ";
      }
      if (perQuestion[1]) {
        result += " |Happy| ";
      }
      if (perQuestion[2]) {
        result += " |Neutral| ";
      }
      if (perQuestion[3]) {
        result += " |Sad| ";
      }
      result += "\n";
    });
  }
  return result;
}

module.exports = { processDataFromBackend };
