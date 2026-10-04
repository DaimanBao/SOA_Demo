const studentService = require("../services/sinhvien.service");

async function getAllStudents(req, res) {
    try {
        const students = await studentService.getAllStudents();

        res.json(students);
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi lấy danh sách sinh viên",
            error: error.message
        });
    }
}

async function getStudentById(req, res) {
    try {
        const student = await studentService.getStudentById(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: "Không tìm thấy sinh viên"
            });
        }

        res.json(student);
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi lấy sinh viên",
            error: error.message
        });
    }
}

async function createStudent(req, res) {
    try {
        const student = await studentService.createStudent(req.body);

        res.status(201).json(student);
    } catch (error) {
        res.status(400).json({
            message: "Không thể thêm sinh viên",
            error: error.message
        });
    }
}

async function updateStudent(req, res) {
    try {
        const student = await studentService.updateStudent(
            req.params.id,
            req.body
        );

        if (!student) {
            return res.status(404).json({
                message: "Không tìm thấy sinh viên"
            });
        }

        res.json(student);
    } catch (error) {
        res.status(400).json({
            message: "Không thể cập nhật sinh viên",
            error: error.message
        });
    }
}

async function deleteStudent(req, res) {
    try {
        const student = await studentService.deleteStudent(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: "Không tìm thấy sinh viên"
            }); 
        }

        res.json({
            message: "Xóa sinh viên thành công",
            student
        });
    } catch (error) {
        res.status(400).json({
            message: "Không thể xóa sinh viên",
            error: error.message
        });
    }
}

module.exports = {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent
};