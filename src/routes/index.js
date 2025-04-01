import express from 'express';
const router = express.Router();
import account from '../services/account.js';
import user from '../services/user.js';
import products from '../services/product.js';
import image from '../services/image.js'
import order from '../services/order.js';

router.use('/account', account);
router.use('/users', user);
router.use('/products', products);
router.use('/orders', order)
router.use("/image", image)

export default router