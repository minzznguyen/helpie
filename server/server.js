import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const port = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a professional software engineer. You are given a prompt and you need to generate a response. Just give the code only, no explanation or anything else. You don't need to put it in the ''' part too, this is because the code will be generated right to the editor." },
        { role: "user", content: prompt }
      ],
      max_tokens: 500
    });

    res.status(200).send({
      bot: response.choices[0].message.content
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: 'An error occurred while processing your request.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 