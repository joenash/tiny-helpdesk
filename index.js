const express = require("express");
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: false }));

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
const MessagingResponse = require("twilio").twiml.MessagingResponse;

let hackers = [];

app.get("/", (req, res) => {
  res.render("index.html", { username: "joenash" });
});

app.post("/receive", (req, res) => {
  //console.log(req.body);
  console.log(`New message: ${req.body.MessageSid}`);
  console.log(`Body: ${req.body.Body}`);
  console.log(`From: ${req.body.ProfileName}`);

  const twiml = new MessagingResponse();

  const sender = req.body.ProfileName;
  const hackerIndex = findHacker(sender);

  if (hackerIndex === -1) {
    createHacker(sender);
    twiml.message(`Hi! How can we help you today?`);
  } else if (!hackers[hackerIndex].hasOwnProperty("problem")) {
    hackers[hackerIndex].problem = [req.body.Body];
    twiml.message(`Got it! And what is your Discord username?`);
  } else if (!hackers[hackerIndex].hasOwnProperty("discord")) {
    hackers[hackerIndex].discord = req.body.Body;
    twiml.message(
      `Got it! We'll be in touch soon :). Is there anything else we can help with?`
    );
  } else {
    hackers[hackerIndex].problem.push(req.body.Body);
    twiml.message(`Got it! We'll be in touch soon :)`);
  }
  console.log(hackers);
  res.writeHead(200, { "Content-type": "text/xml" });
  res.end(twiml.toString());
});

function findHacker(sender) {
  return hackers.findIndex((hacker) => hacker.sender === sender);
}

function createHacker(sender) {
  return (
    hackers.push({
      sender,
    }) - 1
  );
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
