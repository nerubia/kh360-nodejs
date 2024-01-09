import express from "express"
import * as ProjectController from "../../controllers/admin/project-controller"

const router = express.Router()

router.get("/all", ProjectController.all)
router.get("/status", ProjectController.getAllStatus)

router.get("/", ProjectController.index)
router.post("/", ProjectController.store)
router.get("/:id", ProjectController.show)
router.put("/:id", ProjectController.update)
router.delete("/:id", ProjectController.destroy)

export default router