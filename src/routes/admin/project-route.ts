import express from "express"
import * as ProjectController from "../../controllers/admin/project-controller"

const router = express.Router()

router.get("/", ProjectController.index)

export default router
