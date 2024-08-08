import express from "express"
import * as TestBatchController from "../../controllers/test-suite/test-batch-controller"

const router = express.Router()

router.get("/", TestBatchController.index)
router.post("/", TestBatchController.store)
router.get("/:id", TestBatchController.show)
router.put("/:id", TestBatchController.update)
router.delete("/:id", TestBatchController.destroy)

export default router
