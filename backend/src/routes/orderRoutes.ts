import { Router } from 'express';
import {
    createOrder,
    getOrders,
    updateOrder,
    deleteOrder,
    finishOrder // <-- importado aqui
} from '../controllers/orderController';

const router = Router();

router.get('/orders', getOrders);
router.post('/orders', createOrder);
router.put('/orders/:id', updateOrder);
router.delete('/orders/:id', deleteOrder);
router.post('/orders/:id/finish', finishOrder); // <-- rota adicionada

export default router;
