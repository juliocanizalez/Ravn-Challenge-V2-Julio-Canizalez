import express from 'express';
import prisma from '@config/prisma';

const router = express.Router();

// AUTH
router.get('/signup', (req, res) => {
  if (req.session.role === 'MANAGER') {
    res.redirect('/admin');
  } else if (req.session.role === 'CLIENT') {
    res.redirect('/');
  } else {
    res.render('signup');
  }
});

router.get('/signin', (req, res) => {
  if (req.session.role === 'MANAGER') {
    res.redirect('/admin');
  } else if (req.session.role === 'CLIENT') {
    res.redirect('/');
  } else {
    res.render('signin');
  }
});

// MANAGER
router.get('/admin', async (req, res) => {
  if (req.session.token) {
    const products = await prisma.product.findMany({
      where: { managerId: req.session.userId },
      include: {
        images: {
          select: { url: true },
        },
      },
    });

    res.render('admin', { session: req.session, products });
  } else {
    res.redirect('/signin');
  }
});

// CLIENT (PRODUCT LIST)
router.get('/', async (req, res) => {
  if (!req.user) {
    const products = await prisma.product.findMany({
      include: { images: { select: { url: true } } },
    });

    console.log('no client', products);

    res.render('index', { session: req.session, products });
  } else {
    const products = await prisma.product.findMany({
      where: { managerId: req.user.managerId! },
      include: {
        images: { select: { url: true } },
        likes: {
          where: { clientId: req.user.clientId },
        },
      },
    });
    console.log('client', products);
    res.render('index', { session: req.session, products });
  }
});

export default router;
