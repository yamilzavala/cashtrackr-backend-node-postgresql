import type { Request, Response, NextFunction } from "express";
import { param, body, validationResult} from "express-validator";
import Budget from '../models/Budget'

declare global {
    namespace Express {
        interface Request {
            budget?: Budget;
        }
    }
}

export const validateBudgetId = async (req: Request, res: Response, next: NextFunction) => {
    await param('budgetId')
        .isInt().withMessage('Id must. be a number')
        .custom(value => value > 0).withMessage('Id must be grater than zero')
        .run(req)
        
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    next()
}

export const validateBudgetExist = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { budgetId } = req.params;
        const budget = await Budget.findByPk(budgetId)

        if (!budget) {
            const error = new Error('Budget not found')
            return res.status(404).json({ error: error.message })
        }
        req.budget = budget;

        next()
    } catch (error) {
        // console.log(error)
        res.status(500).json({ error: 'There was an error' })
    }
}

export const validateBudgetInput = async (req: Request, res: Response, next: NextFunction) => {
    await body('name').notEmpty().withMessage('Name is required').run(req)
    await body('amount')
            .notEmpty().withMessage('Amount is required')
            .isNumeric().withMessage('Amount must be numeric')
            .custom(value => value > 0).withMessage('Amount must be greater than zero')
            .run(req)

    next()
}

export function hasAccess(req: Request, res: Response, next: NextFunction) {
    if(req.user.id !== req.budget.userId) {
        const error = new Error('Not valid action')
        return res.status(401).json({error: error.message})
    }
    next()
}
