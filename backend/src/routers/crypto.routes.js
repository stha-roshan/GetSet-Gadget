import {Router} from 'express';
import { createCryptoHash } from '../controllers/crypto.controller.js';

const router = Router();

router.post('/generate-hash', createCryptoHash);

export default router;