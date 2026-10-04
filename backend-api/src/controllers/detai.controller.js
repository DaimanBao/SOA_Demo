const detaiService = require("../services/detai.service");

async function getAllDeTai(req, res) {
    try {
        const detai = await detaiService.getAllDeTai();

        res.json(detai);
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi lấy danh sách đề tài",
            error: error.message
        });
    }
}

async function getDeTaiById(req, res) {
    try {
        const detai = await detaiService.getDeTaiById(req.params.id);

        if (!detai) {
            return res.status(404).json({
                message: "Không tìm thấy đề tài"
            });
        }

        res.json(detai);
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi lấy đề tài",
            error: error.message
        });
    }
}

async function createDeTai(req, res) {
    try {
        const detai = await detaiService.createDeTai(req.body);

        res.status(201).json(detai);
    } catch (error) {
        res.status(400).json({
            message: "Không thể thêm đề tài",
            error: error.message
        });
    }
}

async function updateDeTai(req, res) {
    try {
        const detai = await detaiService.updateDeTai(
            req.params.id,
            req.body
        );

        if (!detai) {
            return res.status(404).json({
                message: "Không tìm thấy đề tài"
            });
        }

        res.json(detai);
    } catch (error) {
        res.status(400).json({
            message: "Không thể cập nhật đề tài",
            error: error.message
        });
    }
}

async function deleteDeTai(req, res) {
    try {
        const detai = await detaiService.deleteDeTai(req.params.id);

        if (!detai) {
            return res.status(404).json({
                message: "Không tìm thấy đề tài"
            });
        }

        res.json({
            message: "Xóa đề tài thành công",
            detai
        });
    } catch (error) {
        res.status(400).json({
            message: "Không thể xóa đề tài",
            error: error.message
        });
    }
}

module.exports = {
    getAllDeTai,
    getDeTaiById,
    createDeTai,
    updateDeTai,
    deleteDeTai
};