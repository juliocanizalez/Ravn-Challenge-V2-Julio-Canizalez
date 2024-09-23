import express from 'express';

// main setup
const PORT = process.env.PORT ?? 3000;
const API_URL = process.env.API_URL ?? `http://localhost:${PORT}`;

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(PORT, () => {
  console.log(`Server started on ${API_URL}`);
});

export default app;
