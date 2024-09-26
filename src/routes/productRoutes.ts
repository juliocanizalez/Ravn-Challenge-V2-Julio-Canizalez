import { Request, Response, Router } from 'express';
import multer from 'multer';
import { verifyToken } from '@middlewares/auth';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  disableProduct,
  likeProduct,
} from '@controllers/productController';

const router = Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Customize file naming
  },
});
const upload = multer({ storage });

/* eslint-disable-next-line @typescript-eslint/no-unsafe-function-type */
const isManager = (req: Request, res: Response, next: Function) => {
  const user = req.user;
  if (user.role !== 'MANAGER') {
    return res
      .status(403)
      .json({ message: 'Access denied. User is not a manager.' });
  }
  next();
};

// create a product
router.post('/products', verifyToken, isManager, createProduct);

// update a product
router.put(
  '/products/:id',
  verifyToken,
  upload.single('image'),
  isManager,
  updateProduct
);

// delete a product
router.delete('/products/:id', verifyToken, isManager, deleteProduct);

// disable a product
router.patch('/products/:id', verifyToken, isManager, disableProduct);

// like product
router.post('/product/:id/like', verifyToken, likeProduct);

export default router;
