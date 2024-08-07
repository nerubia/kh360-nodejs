import express from "express"
import * as TestItemController from "../../controllers/test-suite/test-item-controller"

const router = express.Router()

router.get("/", TestItemController.index)
router.post("/", TestItemController.store)
router.get("/:id", TestItemController.show)
router.put("/:id", TestItemController.update)
router.delete("/:id", TestItemController.destroy)

export default router
