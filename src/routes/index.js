import express from 'express';
const router = express.Router();
import account from '../services/account.js';
import user from '../services/user.js';
import products from '../services/product.js';
import image from '../services/image.js'
import order from '../services/order.js';
import partner from '../services/partner.js'
import dashboard from '../services/dashboard.js'

router.use('/dashboard', dashboard)
router.use('/account', account);
router.use('/users', user);
router.use('/products', products);
router.use('/orders', order)
router.use("/partners", partner)
router.use("/image", image)

export default router