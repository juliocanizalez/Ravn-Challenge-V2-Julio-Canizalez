import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import bodyParser from 'body-parser';
import authRoutes from '@routes/authRoutes';
import viewRoutes from '@routes/viewRoutes';
import productRouter from '@routes/productRoutes';

// load env
dotenv.config();

// main setup
const PORT = process.env.PORT || 3000;
const API_URL = process.env.API_URL ?? `http://localhost:${PORT}`;

const app = express();
const apiVersionURL = '/api/v1';

// middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(
  session({
    secret: process.env.JWT_SECRET!,
    resave: false,
    saveUninitialized: true,
  })
);
app.use('/uploads', express.static('uploads'));

// ejs
app.set('views', 'src/views');
app.set('view engine', 'ejs');

// routes
app.use('/auth', authRoutes);
app.use(apiVersionURL, productRouter);

// view routes
app.use('/', viewRoutes);

app.get('/', (req, res) => {
  res.render('index', { session: req.session });
});

app.listen(PORT, () => {
  console.log(`Server started on ${API_URL}`);
});

export default app;
