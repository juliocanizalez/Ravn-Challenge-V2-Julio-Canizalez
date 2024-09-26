import { Request, Response, Router } from 'express';
import prisma from '@config/prisma';

const router = Router();

// Create a product
export const createProduct = async (req: Request, res: Response) => {
  const { name, description, price, category, isActive } = req.body;
  const isProductActive = isActive === 'true';
  const productPrice = parseFloat(price);

  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: productPrice,
        category,
        isActive: isProductActive,
        managerId: req.user.managerId!,
      },
    });

    const imageUrl = req.file?.path
      ? req.file?.path
      : 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png?v=1530129081';

    await prisma.image.create({
      data: {
        url: imageUrl,
        productId: product.id,
      },
    });

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product', details: error });
  }
};

// Update a product
export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, price, category, isActive } = req.body;

  const isProductActive = isActive === 'true';
  const productPrice = parseFloat(price);

  try {
    await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
        price: productPrice,
        category,
        isActive: isProductActive,
      },
    });
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product', details: error });
  }
};

// Delete a product
export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.image.deleteMany({
      where: { productId: Number(id) },
    });
    await prisma.product.delete({ where: { id: Number(id) } });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product', details: error });
  }
};

// Disable a product
export const disableProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.product.update({
      where: { id: Number(id) },
      data: { isActive: false },
    });
    res.sendStatus(200);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to disable product', details: error });
  }
};

// Show client orders
export const getClientOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { product: { managerId: req.user.managerId! } },
    });
    res.status(200).json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to retrieve orders', details: error });
  }
};

// client

export const likeProduct = async (req: Request, res: Response) => {
  try {
    const existingLike = await prisma.like.findUnique({
      where: {
        clientId: req.user.clientId!,
        productId: Number(req.params.id),
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
    } else {
      await prisma.like.create({
        data: {
          productId: Number(req.params.id),
          clientId: req.user.clientId!,
        },
      });
    }
    res.sendStatus(201);
  } catch (error) {
    res.status(500).json({ error: 'Failed to like product', details: error });
  }
};

export const addToCart = async (req: Request, res: Response) => {
  try {
    await prisma.cart.create({
      data: {
        clientId: req.user.clientId!,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to cart', details: error });
  }
};

export default router;
