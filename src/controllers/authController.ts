import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@config/prisma';
import { JwtPayload } from 'jwt';

export const signUp = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
    });

    // CREATE CLIENT OR MANAGER PROFILE
    if (role === 'CLIENT') {
      await prisma.client.create({
        data: {
          userId: user.id,
        },
      });
    } else if (role === 'MANAGER') {
      await prisma.manager.create({
        data: {
          managerId: user.id,
        },
      });
    }
    res.status(201).redirect('/signin');
  } catch (error) {
    res.status(500).json({ error: 'User already exists.', details: error });
  }
};

export const signIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const userId = user.id;

  if (user.role === 'MANAGER') {
    const manager = await prisma.manager.findUnique({
      where: { managerId: userId },
    });

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      managerId: manager?.id,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });
    req.session.userId = manager?.id;
    req.session.token = token;
    req.session.role = user.role;

    res.redirect('/admin');
  } else {
    const client = await prisma.client.findUnique({ where: { userId } });
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      clientId: client?.id,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });

    req.session.userId = client?.id;
    req.session.token = token;
    req.session.role = user.role;
    res.redirect('/');
  }
};

export const signOut = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error signing out' });
    }
    res.redirect('/');
  });
};
