
import { Router } from "express";
import { detaiController } from "../controllers/detai.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticate);

router.get("/", detaiController.findAll);
router.get("/:ma_dt", detaiController.findById);
router.post("/",requireAdmin, detaiController.create);
router.put("/:ma_dt",requireAdmin, detaiController.update);
router.delete("/:ma_dt",requireAdmin, detaiController.delete);

export default router;
