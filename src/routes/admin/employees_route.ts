import express from "express"
import {
  getEmployees,
  getAllEmployees,
} from "../../controllers/admin/employees_controller"

const router = express.Router()

router.get("/", getEmployees)
router.get("/all", getAllEmployees)

export default router
