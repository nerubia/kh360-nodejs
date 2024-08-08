import express from "express"
import * as TestApiController from "../../controllers/test-suite/test-api-controller"

const router = express.Router()

router.get("/", TestApiController.index)
router.post("/", TestApiController.store)
router.get("/:id", TestApiController.show)
router.put("/:id", TestApiController.update)
router.delete("/:id", TestApiController.destroy)

export default router
