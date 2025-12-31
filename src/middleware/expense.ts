import type { Request, Response, NextFunction } from "express";
import { param, body, validationResult} from "express-validator";
import Expense from "../models/Expense";
import Budget from "../models/Budget";

declare global {
    namespace Express {
        interface Request {
            expense?: Expense;
        }
    }
}


export const validateExpenseInput = async (req: Request, res: Response, next: NextFunction) => {
    await body('name').notEmpty().withMessage('Name is required').run(req)
    await body('amount')
            .notEmpty().withMessage('Amount is required')
            .isNumeric().withMessage('Amount must be numeric')
            .custom(value => value > 0).withMessage('Amount must be greater than zero')
            .run(req)

    next()
}

// Expense middlewares
export const validateExpenseId = async (req: Request, res: Response, next: NextFunction) => {
    await param('expenseId')
        .isInt().withMessage('Id must. be a number')
        .custom(value => value > 0).withMessage('Id must be grater than zero')
        .run(req)
        
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    next()
}

export const validateExpenseExist = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { expenseId } = req.params;
        const expense = await Expense.findByPk(expenseId)

        if (!expense) {
            const error = new Error('Expense not found')
            return res.status(404).json({ error: error.message })
        }
        req.expense = expense;

        next()
    } catch (error) {
        // console.log(error)
        res.status(500).json({ error: 'There was an error in validateExpenseExist' })
    }
}

export const belogsToBudget = async (req: Request, res: Response, next: NextFunction) => {
        if(req.budget.id !== req.expense.budgetId) {
            const error = new Error('Not valid action')
            return res.status(403).json({error: error.message})
        }
        next()
}