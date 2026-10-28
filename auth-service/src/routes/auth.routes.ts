
import { Router } from "express";
import { authController } from "../controllers/auth.controller";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/admin/provision-student", authController.provisionStudent);
router.post("/admin/reset-student-password", authController.resetStudentPassword);
router.post("/change-password", authController.changePassword);
router.get("/me", authController.me);

export default router;
