import express from 'express';

const router = express.Router();

// AUTH
router.get('/signup', (req, res) => {
  res.render('signup', { session: req.session });
});

router.get('/signin', (req, res) => {
  res.render('signin', { session: req.session });
});

// MANAGER
router.get('/admin', (req, res) => {
  res.render('admin', { session: req.session });
});

// CLIENT (PRODUCT LIST)
router.get('/', (req, res) => {
  res.render('index', { session: req.session });
});

export default router;
