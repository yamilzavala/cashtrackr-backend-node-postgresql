import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { body, param } from 'express-validator'
import { handleInputErrors } from '../middleware/validation';
import { limiter } from '../config/limiter';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(limiter)

router.post('/create-account', 
    body('name').notEmpty().withMessage('Name is required'),
    body('password').isLength({min: 8}).withMessage('Password must be at least eight characters'),
    body('email').isEmail().withMessage('Invalid e-mail'),
    handleInputErrors,
    AuthController.createAccount);

router.post('/confirm-account',
    body('token').notEmpty().isLength({max: 6, min: 6}).withMessage('Token is required'),
    handleInputErrors,
    AuthController.confirmAccount)

router.post('/login',
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Invalid password'),
    handleInputErrors,
    AuthController.login
)

router.post('/forgot-password',
    body('email').isEmail().withMessage('Invalid email'),
    handleInputErrors,
    AuthController.forgotPassword
)

router.post('/validate-token',
    body('token').notEmpty().isLength({min: 6, max: 6}).withMessage('Invalid token'),
    handleInputErrors,
    AuthController.validateToken
)

router.post('/reset-password/:token',
    param('token').notEmpty().isLength({min: 6, max: 6}).withMessage('Invalid token'),
    body('password').notEmpty().isLength({min: 8}).withMessage('Invalid password'),
    handleInputErrors,
    AuthController.resetPasswordWithToken
)

router.get('/user',
    authenticate,
    AuthController.user
)

router.put('/user',
    authenticate,
    body('email').isEmail().withMessage('Invalid email'),
    body('name').notEmpty().withMessage('Name required'),
    handleInputErrors,
    AuthController.updateUser
)

router.post('/update-password',
    authenticate,
    body('current_password').notEmpty().withMessage('current_password required'),
    body('new_password').isLength({min: 8}).withMessage('At least 8 characters in new password'),
    handleInputErrors,
    AuthController.updateCurrentUserPassword
)

router.post('/check-password',
    authenticate,
    body('password').notEmpty().withMessage('password required'),
    handleInputErrors,
    AuthController.checkPassword
)

export default router;
