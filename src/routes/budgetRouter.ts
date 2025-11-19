import { Router } from "express";
import { BudgetController } from "../controllers/BudgetController";
import { handleInputErrors } from "../middleware/validation";
import { validateBudgetId, validateBudgetExist, validateBudgetInput, hasAccess } from "../middleware/budget";
import { validateExpenseExist, validateExpenseId } from "../middleware/expense";
import { ExpensesController } from "../controllers/ExpenseController";
import { validateExpenseInput } from "../middleware/expense";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate) // generate req.user

router.param('budgetId', validateBudgetId)
router.param('budgetId', validateBudgetExist) // generate req.budget
router.param('budgetId', hasAccess)

router.param('expenseId', validateExpenseId)
router.param('expenseId', validateExpenseExist)

// Routes for budgets
router.get('/', BudgetController.getAll)

router.post('/',
    validateBudgetInput,
    handleInputErrors,
    BudgetController.create)

router.get('/:budgetId', BudgetController.getById)

router.put('/:budgetId',
    validateBudgetInput,
    handleInputErrors,
    BudgetController.updateById)

router.delete('/:budgetId', BudgetController.deleteById)


// Routes for expenses
router.post('/:budgetId/expenses', 
    validateExpenseInput,
    handleInputErrors,
    ExpensesController.create)

router.get('/:budgetId/expenses/:expenseId', ExpensesController.getById)

router.put('/:budgetId/expenses/:expenseId', ExpensesController.updateById)

router.delete('/:budgetId/expenses/:expenseId', ExpensesController.deleteById)

export default router;