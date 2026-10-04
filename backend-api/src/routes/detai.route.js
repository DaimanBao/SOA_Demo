const express = require("express");
const detaiController = require("../controllers/detai.controller");

const router = express.Router();

router.get("/", detaiController.getAllDeTai);
router.get("/:id", detaiController.getDeTaiById);
router.post("/", detaiController.createDeTai);
router.put("/:id", detaiController.updateDeTai);
router.delete("/:id", detaiController.deleteDeTai);

module.exports = router;