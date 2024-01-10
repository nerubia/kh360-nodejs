import express from "express"
import * as ProjectController from "../../controllers/admin/project-controller"

const router = express.Router()

router.get("/all", ProjectController.all)
router.get("/status", ProjectController.getAllStatus)

router.get("/", ProjectController.index)
router.delete("/:id", ProjectController.destroy)

export default router
