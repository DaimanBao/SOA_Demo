
import { Router } from "express";
import { dangkyController } from "../controllers/dangky.controller";
import { allowOwnRegistration, authenticate, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticate);

router.get("/", dangkyController.findAll);
router.get("/:ma_dk", dangkyController.findById);
router.post("/", allowOwnRegistration, dangkyController.create);
router.put("/:ma_dk",requireAdmin, dangkyController.update);
router.delete("/:ma_dk",requireAdmin, dangkyController.delete);

export default router;
