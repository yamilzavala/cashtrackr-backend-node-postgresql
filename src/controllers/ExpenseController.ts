import type { Request, Response } from "express";
import Expense from "../models/Expense";

export class ExpensesController {
    static getById = async (req: Request, res: Response) => {
        return res.status(200).json(req.expense)
    }

    static updateById = async (req: Request, res: Response) => {
        const {expense} = req;
        await expense.update(req.body)
        return res.status(201).json({msg: 'Expense updated successfully'})
    }

    static deleteById = async (req: Request, res: Response) => {
        const {expense} = req;
        await expense.destroy()
        return res.status(201).json({msg: 'Expense removed successfully'})
    }

    static create = async (req: Request, res: Response) => {
        try {
            const expense = new Expense(req.body)
            expense.budgetId = req.budget.id;
            await expense.save()
            res.status(201).json({msg: 'Expense created successfully'}) 
        } catch (error) {
            // console.log(error)
            res.status(500).json({ error: 'There was an error' })
        }
    }

}