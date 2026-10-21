
import { Router } from "express";
import { sinhvienController } from "../controllers/sinhvien.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.get("/:ma_sv", sinhvienController.findById);

router.use(authenticate);

router.get("/", sinhvienController.findAll);
router.get("/:ma_sv", sinhvienController.findById);
router.post("/",requireAdmin, sinhvienController.create);
router.put("/:ma_sv",requireAdmin, sinhvienController.update);
router.delete("/:ma_sv",requireAdmin, sinhvienController.delete);

export default router;
