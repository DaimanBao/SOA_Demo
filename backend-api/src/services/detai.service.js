const pool = require("../config/database");

async function getAllDeTai() {
    const result = await pool.query(`
        SELECT *
        FROM detai
        ORDER BY ma_dt
    `);

    return result.rows;
}

async function getDeTaiById(ma_dt) {
    const result = await pool.query(
        `SELECT *
        FROM detai
        WHERE ma_dt = $1`,
        [ma_dt]
    );

    return result.rows[0];
}

async function createDeTai(detai) {
    const {
        ma_dt,
        ten_dt,
        giang_vien,
        so_luong_sv,
        trang_thai
    } = detai;

    const result = await pool.query(
        `INSERT INTO detai
        (ma_dt, ten_dt, giang_vien, so_luong_sv, trang_thai)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [
            ma_dt,
            ten_dt,
            giang_vien,
            so_luong_sv,
            trang_thai
        ]
    );

    return result.rows[0];
}

async function updateDeTai(ma_dt, detai) {
    const {
        ten_dt,
        giang_vien,
        so_luong_sv,
        trang_thai
    } = detai;

    const result = await pool.query(
        `UPDATE detai
        SET ten_dt = $1,
            giang_vien = $2,
            so_luong_sv = $3,
            trang_thai = $4
        WHERE ma_dt = $5
        RETURNING *`,
        [
            ten_dt,
            giang_vien,
            so_luong_sv,
            trang_thai,
            ma_dt
        ]
    );

    return result.rows[0];
}

async function deleteDeTai(ma_dt) {
    const result = await pool.query(
        `DELETE FROM detai
         WHERE ma_dt = $1
         RETURNING *`,
        [ma_dt]
    );

    return result.rows[0];
}

module.exports = {
    getAllDeTai,
    getDeTaiById,
    createDeTai,
    updateDeTai,
    deleteDeTai
};