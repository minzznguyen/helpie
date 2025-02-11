import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import nodemailer from 'nodemailer';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const port = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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

app.post('/send-email', async (req, res) => {
  try {
    const { githubLink } = req.body;
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Helpie Advanced Assistance Request',
      html: `
<h2>Helpie Advanced Assistance Request</h2>
<p><strong>GitHub Branch:</strong> ${githubLink}</p>
<p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `
    });

    res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 