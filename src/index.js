const express = require("express");
const session = require("express-session");
require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");
const { MessagingResponse } = require("twilio").twiml;
const { logErrors, errorHandler } = require("./utils");

const app = express();
const port = "3000";

// Middleware
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "supercalifragilisticexpialidocious",
    resave: false,
    saveUninitialized: true,
    cookie: {},
  })
);

// Error handling
app.use(logErrors);
app.use(errorHandler);

// OpenAI API
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
// Initialize the OpenAI API
const openai = new OpenAIApi(configuration);

// Twilio SMS webhook
app.post("/bot", async (req, res) => {
  const twiml = new MessagingResponse();
  console.log("Received a message from Twilio");
  // if the session is not initialized, send a welcome message
  if (!req.session.init) {
    twiml.message(
      "Hello! I'm an AI chat bot. I'm here to answer any questions you might have or just talk. I'm a pretty chill dude. Please be patient with my responses...I am easily distracted."
    );
    req.session.init = true;
    console.log("Sesson initialized");
    res.type("text/xml").send(twiml.toString());
    return;
  }

  // if the session is initialized, but the user has not yet provided a prompt, create a prompt
  if (!req.session.prompt) {
    const initialQuestion = req.body.Body.trim();
    req.session.prompt = `The following is a conversation between a human and their new AI friend named who is funny, chill, and very intelligent and uses the word dude in conversation but not too much: Human: ${initialQuestion} AI:`;
  } else {
    const reply = req.body.Body.trim();
    console.log(`Human: ${reply}`);
    req.session.prompt += `Human: ${reply}. AI:`;
  }

  try {
    // Feed the prompt to the GPT-3 API and reply to user
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: req.session.prompt,
      temperature: 0.7,
      max_tokens: 4000,
    });

    const bot = await response.data.choices[0].text.trim();
    console.log(`AI: ${bot}`);
    req.session.prompt += `${bot}`;
    twiml.message(bot);

    res.type("text/xml").send(twiml.toString());
  } catch (error) {
    console.error(error.toString());
    res.status(200);
    twiml.message(
      "OOPS! Something went wrong. Please be patient as I am still learning."
    );
    res.type("text/xml").send(twiml.toString());
  }
});

const server = app.listen(port, () => {
  console.log(`AI friend app listening on port ${port}`);
});

module.exports = server;
