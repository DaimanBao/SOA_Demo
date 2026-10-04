const express = require("express");
const dangkyController = require("../controllers/dangky.controller");

const router = express.Router();

router.get("/", dangkyController.getAllDangKy);

router.get("/:id", dangkyController.getDangKyById);

router.post("/", dangkyController.createDangKy);

router.put("/:id", dangkyController.updateDangKy);

router.delete("/:id", dangkyController.deleteDangKy);

module.exports = router;