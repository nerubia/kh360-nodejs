import express from "express"
import { getEmployees } from "../../controllers/admin/employees_controller"

const router = express.Router()

router.get("/", getEmployees)

export default router
