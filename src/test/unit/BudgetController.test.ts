import { BudgetController } from "../../controllers/BudgetController";
import { budgets } from "../mocks/budgets";
import { createRequest, createResponse } from 'node-mocks-http'
import Budget from "../../models/Budget";
import Expense from "../../models/Expense";

jest.mock('../../models/Budget', () => ({
    findAll: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn()
}))

describe('BudgetController.getAll', () => {
    beforeEach(() => {
        (Budget.findAll as jest.Mock).mockReset();
        (Budget.findAll as jest.Mock).mockImplementation((options) => {
            const updatedBudgets = budgets.filter(item => item.userId === options.where.userId);
            return Promise.resolve(updatedBudgets)
        })
    })

    it('should retrieve 2 budgets for user with ID 1', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets',
            user: { id: 1 }
        })

        const res = createResponse();
        await BudgetController.getAll(req, res)
        const data = res._getJSONData();
        expect(data.budgets).toHaveLength(2);
        expect(res.statusCode).toBe(200)
        expect(res.status).not.toBe(404)
    })

    it('should retrieve 1 budget for the user with ID 2', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets',
            user: {id: 2}
        })

        const res = createResponse();
        await BudgetController.getAll(req, res)
        const data = res._getJSONData();
        expect(data.budgets).toHaveLength(1);
        expect(res.statusCode).toBe(200);
        expect(res.status).not.toBe(404);
    })

    it('should retrieve 0 budget for the user with ID 10', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets',
            user: {id: 10}
        })

        const res = createResponse();
        await BudgetController.getAll(req, res)
        const data = res._getJSONData();
        expect(data.budgets).toHaveLength(0);
        expect(res.statusCode).toBe(200);
        expect(res.status).not.toBe(404);
    })

    it('should handle errors when fetching budgets', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets',
            user: {id: 10}
        })

        const res = createResponse();

        (Budget.findAll as jest.Mock).mockRejectedValue(new Error);
        await BudgetController.getAll(req, res);

        expect(res.statusCode).toBe(500)
        expect(res._getJSONData()).toEqual({error: 'There was an error'})
    })
})

describe('BudgetController.create', () => {
    it('Should creante a new budget and response with status 201', async () => {
        const mockBudget = {
            save: jest.fn().mockResolvedValue(true)
        };
        (Budget.create as jest.Mock).mockResolvedValue(mockBudget)
        const req = createRequest({
            method: 'POST',
            url: '/api/budgets',
            user: {id: 1},
            body: {
                name: 'Budget test',
                amount: 1000
            }
        });
        const res = createResponse();
        await BudgetController.create(req, res)

        const data = res._getJSONData();

        expect(res.statusCode).toBe(201);
        expect(data).toBe('Budget created successfully')
        expect(mockBudget.save).toHaveBeenCalled()
        expect(mockBudget.save).toHaveBeenCalledTimes(1)
        expect(Budget.create).toHaveBeenCalledWith(req.body)
    })

    it('Should handle errors when creating a new budget', async () => {
        const mockBudget = {
            save: jest.fn()
        };
        (Budget.create as jest.Mock).mockRejectedValue(new Error)
        const req = createRequest({
            method: 'POST',
            url: '/api/budgets',
            user: {id: 1},
            body: {
                name: 'Budget test',
                amount: 1000
            }
        });
        const res = createResponse();
        await BudgetController.create(req, res)

        expect(res.statusCode).toBe(500)
        expect(res._getJSONData()).toEqual({error: 'There was an error'})
        expect(mockBudget.save).not.toHaveBeenCalled()
        expect(Budget.create).toHaveBeenCalledWith(req.body)
    })
})

describe('BudgetController.getById', () => {
    beforeEach(() => {
        (Budget.findByPk as jest.Mock).mockReset();
        (Budget.findByPk as jest.Mock).mockImplementation((id) => {
            const budget = budgets.filter(item => item.id === id)[0];
            return Promise.resolve(budget)
        })
    })

    it('should retrieve budget for user with ID 1 and 3 expenses', async() => {
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets/:id',
            budget: {id: 1}
        })
        const res = createResponse();

        await BudgetController.getById(req, res)

        const data = res._getJSONData();
        expect(res.statusCode).toBe(200);
        expect(data.expenses).toHaveLength(3);
        expect(Budget.findByPk).toHaveBeenCalled()
        expect(Budget.findByPk).toHaveBeenCalledTimes(1)
        expect(Budget.findByPk).toHaveBeenCalledWith(req.budget.id,  {
            include: [Expense],
        })
    })

    it('should retrieve budget for user with ID 2 and 2 expenses', async() => {
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets/:id',
            budget: {id: 2}
        })
        const res = createResponse();

        await BudgetController.getById(req, res)

        const data = res._getJSONData();
        expect(res.statusCode).toBe(200);
        expect(data.expenses).toHaveLength(2);
    })

    it('should retrieve budget for user with ID 3 and 0 expenses', async() => {
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets/:id',
            budget: {id: 3}
        })
        const res = createResponse();

        await BudgetController.getById(req, res)

        const data = res._getJSONData();
        expect(res.statusCode).toBe(200);
        expect(data.expenses).toHaveLength(0);
    })
})

describe('BudgetController.updateById', () => {
    it('should update a budget and return a success message', async () => {
        const budgetMock = {
            update: jest.fn().mockResolvedValue(true)
        }
        const req = createRequest({
            method: 'PUT',
            url: 'api/budgets/:budgetId',
            budget: budgetMock,
            body: {name: 'Budget test', amount: 1000}
        })
        const res = createResponse();
        await BudgetController.updateById(req, res)

        const data = res._getJSONData();
        expect(res.statusCode).toBe(200);
        expect(data.message).toBe('Budget updated successfully')
        expect(budgetMock.update).toHaveBeenCalled()
        expect(budgetMock.update).toHaveBeenCalledTimes(1)
        expect(Budget.create).toHaveBeenCalledWith(req.body)
    }) 
})