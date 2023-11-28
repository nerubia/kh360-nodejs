import express from "express"
import { index, getAllUsers } from "../../controllers/admin/users-controller"

const router = express.Router()

router.get("/", index)
router.get("/all", getAllUsers)

export default router
