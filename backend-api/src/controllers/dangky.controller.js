const dangkyService = require("../services/dangky.service");

async function getAllDangKy(req, res) {
    try {
        const dangky = await dangkyService.getAllDangKy();

        res.json(dangky);
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi lấy danh sách đăng ký",
            error: error.message
        });
    }
}

async function getDangKyById(req, res) {
    try {
        const dangky = await dangkyService.getDangKyById(
            req.params.id
        );

        if (!dangky) {
            return res.status(404).json({
                message: "Không tìm thấy đăng ký"
            });
        }

        res.json(dangky);
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi lấy đăng ký",
            error: error.message
        });
    }
}

async function createDangKy(req, res) {
    try {
        const dangky = await dangkyService.createDangKy(
            req.body
        );

        res.status(201).json(dangky);
    } catch (error) {
        res.status(400).json({
            message: "Không thể thêm đăng ký",
            error: error.message
        });
    }
}

async function updateDangKy(req, res) {
    try {
        const dangky = await dangkyService.updateDangKy(
            req.params.id,
            req.body
        );

        if (!dangky) {
            return res.status(404).json({
                message: "Không tìm thấy đăng ký"
            });
        }

        res.json(dangky);
    } catch (error) {
        res.status(400).json({
            message: "Không thể cập nhật đăng ký",
            error: error.message
        });
    }
}

async function deleteDangKy(req, res) {
    try {
        const dangky = await dangkyService.deleteDangKy(
            req.params.id
        );

        if (!dangky) {
            return res.status(404).json({
                message: "Không tìm thấy đăng ký"
            });
        }

        res.json({
            message: "Xóa đăng ký thành công",
            dangky
        });
    } catch (error) {
        res.status(400).json({
            message: "Không thể xóa đăng ký",
            error: error.message
        });
    }
}

module.exports = {
    getAllDangKy,
    getDangKyById,
    createDangKy,
    updateDangKy,
    deleteDangKy
};