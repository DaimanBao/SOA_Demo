const pool = require("../config/database");

async function getAllDangKy() {
    const result = await pool.query(`
        SELECT *
        FROM dangky
        ORDER BY ma_dk
    `);

    return result.rows;
}

async function getDangKyById(ma_dk) {
    // 1. Lấy thông tin đăng ký
    const result = await pool.query(
        `SELECT *
         FROM dangky
         WHERE ma_dk = $1`,
        [ma_dk]
    );

    const dangky = result.rows[0];

    if (!dangky) {
        return null;
    }

    // 2. Gọi Student Service
    const studentResponse = await fetch(
        `http://localhost:3000/api/sinhvien/${dangky.ma_sv}`
    );

    if (!studentResponse.ok) {
        throw new Error(
            "Không thể lấy thông tin sinh viên từ Student Service"
        );
    }

    const student = await studentResponse.json();

    // 3. Gọi Thesis Service
    const thesisResponse = await fetch(
        `http://localhost:3000/api/detai/${dangky.ma_dt}`
    );

    if (!thesisResponse.ok) {
        throw new Error(
            "Không thể lấy thông tin đề tài từ Thesis Service"
        );
    }

    const thesis = await thesisResponse.json();

    // 4. Ghép dữ liệu từ các Service
    return {
        ma_dk: dangky.ma_dk,
        ngay_dang_ky: dangky.ngay_dang_ky,
        trang_thai: dangky.trang_thai,
        diem: dangky.diem,

        sinh_vien: {
            ma_sv: student.ma_sv,
            ho_ten: student.ho_ten,
            ngay_sinh: student.ngay_sinh,
            gioi_tinh: student.gioi_tinh,
            email: student.email,
            so_dien_thoai: student.so_dien_thoai,
            lop: student.lop
        },

        de_tai: {
            ma_dt: thesis.ma_dt,
            ten_dt: thesis.ten_dt,
            giang_vien: thesis.giang_vien,
            so_luong_sv: thesis.so_luong_sv,
            trang_thai: thesis.trang_thai
        }
    };
}

async function createDangKy(dangky) {
    const {
        ma_sv,
        ma_dt,
        ngay_dang_ky,
        trang_thai,
        diem
    } = dangky;

    // 1. Gọi Student Service
    const studentResponse = await fetch(
        `http://localhost:3000/api/sinhvien/${ma_sv}`
    );

    if (!studentResponse.ok) {
        if (studentResponse.status === 404) {
            throw new Error(
                `Sinh viên ${ma_sv} không tồn tại`
            );
        }

        throw new Error(
            "Không thể kết nối đến Student Service"
        );
    }

    const student = await studentResponse.json();


    // 2. Gọi Thesis Service
    const thesisResponse = await fetch(
        `http://localhost:3000/api/detai/${ma_dt}`
    );

    if (!thesisResponse.ok) {
        if (thesisResponse.status === 404) {
            throw new Error(
                `Đề tài ${ma_dt} không tồn tại`
            );
        }

        throw new Error(
            "Không thể kết nối đến Thesis Service"
        );
    }

    const thesis = await thesisResponse.json();


    // 3. Kiểm tra sinh viên đã đăng ký đề tài chưa
    const duplicateResult = await pool.query(
        `SELECT *
         FROM dangky
         WHERE ma_sv = $1
         AND ma_dt = $2`,
        [ma_sv, ma_dt]
    );

    if (duplicateResult.rows.length > 0) {
        throw new Error(
            `Sinh viên ${ma_sv} đã đăng ký đề tài ${ma_dt}`
        );
    }


    // 4. Kiểm tra số lượng sinh viên của đề tài
    const countResult = await pool.query(
        `SELECT COUNT(*) AS count
         FROM dangky
         WHERE ma_dt = $1
         AND trang_thai = 'DA_DANG_KY'`,
        [ma_dt]
    );

    const currentStudentCount = Number(
        countResult.rows[0].count
    );

    if (currentStudentCount >= thesis.so_luong_sv) {
        throw new Error(
            `Đề tài ${ma_dt} đã đủ số lượng sinh viên`
        );
    }


    // 5. Tạo đăng ký
    const result = await pool.query(
        `INSERT INTO dangky
        (
            ma_sv,
            ma_dt,
            ngay_dang_ky,
            trang_thai,
            diem
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [
            ma_sv,
            ma_dt,
            ngay_dang_ky,
            trang_thai,
            diem
        ]
    );

    return result.rows[0];
}

async function updateDangKy(ma_dk, dangky) {
    const {
        ma_sv,
        ma_dt,
        ngay_dang_ky,
        trang_thai,
        diem
    } = dangky;


    // 1. Gọi Student Service
    const studentResponse = await fetch(
        `http://localhost:3000/api/sinhvien/${ma_sv}`
    );

    if (!studentResponse.ok) {
        if (studentResponse.status === 404) {
            throw new Error(
                `Sinh viên ${ma_sv} không tồn tại`
            );
        }

        throw new Error(
            "Không thể kết nối đến Student Service"
        );
    }

    const student = await studentResponse.json();


    // 2. Gọi Thesis Service
    const thesisResponse = await fetch(
        `http://localhost:3000/api/detai/${ma_dt}`
    );

    if (!thesisResponse.ok) {
        if (thesisResponse.status === 404) {
            throw new Error(
                `Đề tài ${ma_dt} không tồn tại`
            );
        }

        throw new Error(
            "Không thể kết nối đến Thesis Service"
        );
    }

    const thesis = await thesisResponse.json();


    // 3. Kiểm tra đăng ký hiện tại
    const currentResult = await pool.query(
        `SELECT *
         FROM dangky
         WHERE ma_dk = $1`,
        [ma_dk]
    );

    if (currentResult.rows.length === 0) {
        return null;
    }


    // 4. Kiểm tra trùng đăng ký
    const duplicateResult = await pool.query(
        `SELECT *
         FROM dangky
         WHERE ma_sv = $1
         AND ma_dt = $2
         AND ma_dk != $3`,
        [ma_sv, ma_dt, ma_dk]
    );

    if (duplicateResult.rows.length > 0) {
        throw new Error(
            `Sinh viên ${ma_sv} đã đăng ký đề tài ${ma_dt}`
        );
    }


    // 5. Kiểm tra số lượng sinh viên
    const countResult = await pool.query(
        `SELECT COUNT(*) AS count
         FROM dangky
         WHERE ma_dt = $1
         AND trang_thai = 'DA_DANG_KY'
         AND ma_dk != $2`,
        [ma_dt, ma_dk]
    );

    const currentStudentCount = Number(
        countResult.rows[0].count
    );

    // Chỉ kiểm tra capacity nếu đăng ký đang ở trạng thái
    // DA_DANG_KY
    if (
        trang_thai === "DA_DANG_KY" &&
        currentStudentCount >= thesis.so_luong_sv
    ) {
        throw new Error(
            `Đề tài ${ma_dt} đã đủ số lượng sinh viên`
        );
    }


    // 6. Cập nhật đăng ký
    const result = await pool.query(
        `UPDATE dangky
         SET ma_sv = $1,
             ma_dt = $2,
             ngay_dang_ky = $3,
             trang_thai = $4,
             diem = $5
         WHERE ma_dk = $6
         RETURNING *`,
        [
            ma_sv,
            ma_dt,
            ngay_dang_ky,
            trang_thai,
            diem,
            ma_dk
        ]
    );

    return result.rows[0];
}

async function deleteDangKy(ma_dk) {
    const result = await pool.query(
        `DELETE FROM dangky
         WHERE ma_dk = $1
         RETURNING *`,
        [ma_dk]
    );

    return result.rows[0];
}

module.exports = {
    getAllDangKy,
    getDangKyById,
    createDangKy,
    updateDangKy,
    deleteDangKy
};