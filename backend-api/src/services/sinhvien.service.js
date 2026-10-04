const pool = require("../config/database");

async function getAllStudents() {
    const result = await pool.query(`
        SELECT *
        FROM sinhvien
        ORDER BY ma_sv
    `);

    return result.rows;
}

async function getStudentById(ma_sv) {
    const result = await pool.query(
        `SELECT * FROM sinhvien WHERE ma_sv = $1`,
        [ma_sv]
    );

    return result.rows[0];
}

async function createStudent(student) {
    const {
        ma_sv,
        ho_ten,
        ngay_sinh,
        gioi_tinh,
        email,
        so_dien_thoai,
        lop
    } = student;

    const result = await pool.query(
        `INSERT INTO sinhvien
        (ma_sv, ho_ten, ngay_sinh, gioi_tinh, email, so_dien_thoai, lop)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
            ma_sv,
            ho_ten,
            ngay_sinh,
            gioi_tinh,
            email,
            so_dien_thoai,
            lop
        ]
    );

    return result.rows[0];
}

async function updateStudent(ma_sv, student) {
    const {
        ho_ten,
        ngay_sinh,
        gioi_tinh,
        email,
        so_dien_thoai,
        lop
    } = student;

    const result = await pool.query(
        `UPDATE sinhvien
        SET ho_ten = $1,
            ngay_sinh = $2,
            gioi_tinh = $3,
            email = $4,
            so_dien_thoai = $5,
            lop = $6
        WHERE ma_sv = $7
        RETURNING *`,
        [
            ho_ten,
            ngay_sinh,
            gioi_tinh,
            email,
            so_dien_thoai,
            lop,
            ma_sv
        ]
    );

    return result.rows[0];
}

async function deleteStudent(ma_sv) {
    const result = await pool.query(
        `DELETE FROM sinhvien
            WHERE ma_sv = $1
            RETURNING *`,
        [ma_sv]
    );

    return result.rows[0];
}

module.exports = {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent
};