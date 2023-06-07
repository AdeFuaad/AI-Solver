import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express();
app.use(cors());
app.use(express.json());

// Allow CORS for all routes
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/", async (req, res) => {
  res.status(200).send({
    message: "Hello ME!",
  });
});

app.post("/", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 0.68,
      max_tokens: 64,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop: ['"""'],
    });

    const remainingRequests = response.headers["x-remaining-day"];
    const limitPerMinute = response.headers["x-minute-limit"];
    const limitPerDay = response.headers["x-day-limit"];

    // Display the rate limit information
    console.log("Remaining Requests:", remainingRequests);
    console.log("Limit Per Minute:", limitPerMinute);
    console.log("Limit Per Day:", limitPerDay);
    
    res.status(200).send({
      bot: response.data.choices[0].text,
    });
  } catch (error) {
    console.log(error); // Log the error for debugging purposes
    res.status(500).send({ error: "Internal Server Error" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port http://localhost:3000");
});
