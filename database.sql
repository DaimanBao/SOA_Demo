-- =========================================================
-- DATABASE: DO_AN_TOT_NGHIEP
-- Project: SOA - Quản lý đồ án tốt nghiệp
-- =========================================================

-- =========================================================
-- 1. CREATE DATABASE
-- =========================================================

CREATE DATABASE do_an_tot_nghiep;

-- Sau khi tạo database, kết nối vào database:
-- do_an_tot_nghiep
-- rồi thực hiện phần bên dưới.

-- =========================================================
-- 2. TABLE: SINHVIEN
-- =========================================================

CREATE TABLE SINHVIEN (
    ma_sv VARCHAR(20) PRIMARY KEY,
    ```
ho_ten VARCHAR(100) NOT NULL,

ngay_sinh DATE,

gioi_tinh VARCHAR(10),

email VARCHAR(100) UNIQUE,

so_dien_thoai VARCHAR(15) UNIQUE,

lop VARCHAR(50) NOT NULL
```
);

-- =========================================================
-- 3. TABLE: DETAI
-- =========================================================

CREATE TABLE DETAI (
    ma_dt VARCHAR(20) PRIMARY KEY,
    ```
ten_dt VARCHAR(200) NOT NULL,

giang_vien VARCHAR(100) NOT NULL,

so_luong_sv INT NOT NULL DEFAULT 1,

trang_thai VARCHAR(30) NOT NULL DEFAULT 'DANG_MO',

CONSTRAINT chk_detai_so_luong_sv
    CHECK (so_luong_sv > 0),

CONSTRAINT chk_detai_trang_thai
    CHECK (
        trang_thai IN (
            'DANG_MO',
            'DA_DU',
            'DA_DONG'
        )
    )
```
);

-- =========================================================
-- 4. TABLE: DANGKY
-- =========================================================

CREATE TABLE DANGKY (
    ma_dk SERIAL PRIMARY KEY,
    ```
ma_sv VARCHAR(20) NOT NULL,

ma_dt VARCHAR(20) NOT NULL,

ngay_dang_ky DATE NOT NULL DEFAULT CURRENT_DATE,

trang_thai VARCHAR(30) NOT NULL DEFAULT 'DA_DANG_KY',

diem NUMERIC(4,2),

CONSTRAINT fk_dangky_sinhvien
    FOREIGN KEY (ma_sv)
    REFERENCES SINHVIEN(ma_sv)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

CONSTRAINT fk_dangky_detai
    FOREIGN KEY (ma_dt)
    REFERENCES DETAI(ma_dt)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

CONSTRAINT uq_dangky_sinhvien_detai
    UNIQUE (ma_sv, ma_dt),

CONSTRAINT chk_dangky_diem
    CHECK (
        diem IS NULL
        OR (
            diem >= 0
            AND diem <= 10
        )
    ),

CONSTRAINT chk_dangky_trang_thai
    CHECK (
        trang_thai IN (
            'DA_DANG_KY',
            'DA_HUY',
            'HOAN_THANH'
        )
    )
```
);

-- =========================================================
-- 5. SAMPLE DATA: SINHVIEN
-- =========================================================

INSERT INTO
    SINHVIEN (
        ma_sv,
        ho_ten,
        ngay_sinh,
        gioi_tinh,
        email,
        so_dien_thoai,
        lop
    )
VALUES (
        'SV001',
        'Phạm D',
        '2003-05-24',
        'Nam',
        '[duns@gmail.com](mailto:duns@gmail.com)',
        '09123245678',
        'SE04'
    ),
    (
        'SV002',
        'Nguyễn Văn A',
        '2003-08-15',
        'Nam',
        '[nguyenvana@gmail.com](mailto:nguyenvana@gmail.com)',
        '09123456789',
        'SE04'
    ),
    (
        'SV003',
        'Trần Thị B',
        '2003-11-20',
        'Nữ',
        '[tranthib@gmail.com](mailto:tranthib@gmail.com)',
        '09876543210',
        'SE04'
    ),
    (
        'SV004',
        'Lê Văn C',
        '2003-03-12',
        'Nam',
        '[levanc@gmail.com](mailto:levanc@gmail.com)',
        '09012345678',
        'SE04'
    );

-- =========================================================
-- 6. SAMPLE DATA: DETAI
-- =========================================================

INSERT INTO
    DETAI (
        ma_dt,
        ten_dt,
        giang_vien,
        so_luong_sv,
        trang_thai
    )
VALUES (
        'DT001',
        'Xay dung he thong quan ly sinh vien',
        'Nguyen Van Minh',
        3,
        'DANG_MO'
    ),
    (
        'DT002',
        'Xay dung website ban hang',
        'Tran Thi Hoa',
        3,
        'DANG_MO'
    ),
    (
        'DT003',
        'Xay dung ung dung quan ly thu vien',
        'Le Van Nam',
        2,
        'DANG_MO'
    );

-- =========================================================
-- 7. SAMPLE DATA: DANGKY
-- =========================================================

INSERT INTO
    DANGKY (
        ma_sv,
        ma_dt,
        ngay_dang_ky,
        trang_thai,
        diem
    )
VALUES (
        'SV001',
        'DT002',
        CURRENT_DATE,
        'DA_DANG_KY',
        NULL
    ),
    (
        'SV002',
        'DT001',
        CURRENT_DATE,
        'DA_DANG_KY',
        NULL
    ),
    (
        'SV004',
        'DT001',
        CURRENT_DATE,
        'DA_DANG_KY',
        NULL
    );

-- =========================================================
-- 8. CHECK DATA
-- =========================================================

SELECT * FROM SINHVIEN;

SELECT * FROM DETAI;

SELECT * FROM DANGKY;