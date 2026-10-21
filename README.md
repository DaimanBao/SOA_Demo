# SOA Demo

## Chạy backend bằng Docker Compose trên Windows

Docker Compose chạy bốn backend và API Gateway trong container. PostgreSQL vẫn chạy trên máy host và tiếp tục dùng bốn database hiện tại (`auth_db`, `sinhvien_db`, `detai_db`, `dangky_db`); Compose không tạo, migrate hay xóa database.

Yêu cầu:

- Docker Desktop đang chạy.
- PostgreSQL trên host đang lắng nghe ở port `5433`.
- Mỗi service có file `.env` hiện tại với `DATABASE_URL` trỏ tới PostgreSQL trên host.

Từ thư mục gốc repo, chạy trong PowerShell:

```powershell
.\scripts\dev.ps1 up
```

Script đọc `DATABASE_URL` từ các file `.env` đã có, chỉ đổi hostname `localhost`/`127.0.0.1` thành `host.docker.internal` cho kết nối từ container. URL chỉ được đặt tạm trong môi trường của tiến trình Compose, không ghi mật khẩu vào file mới hoặc image.

Các lệnh quản lý toàn bộ backend và gateway:

```powershell
.\scripts\dev.ps1 check    # Kiểm tra cấu hình Compose, không khởi động container
.\scripts\dev.ps1 up       # Build nếu cần và bật toàn bộ service ở chế độ nền
.\scripts\dev.ps1 status   # Xem trạng thái các container
.\scripts\dev.ps1 logs     # Theo dõi log của toàn bộ service
.\scripts\dev.ps1 restart  # Build lại nếu cần và khởi động lại toàn bộ service
.\scripts\dev.ps1 down     # Dừng và gỡ container/network của stack; không xóa database host
```

Điều khiển riêng một service:

```powershell
.\scripts\dev.ps1 start auth-service    # Build nếu cần, bật service và các dependency của nó
.\scripts\dev.ps1 stop auth-service     # Dừng service, giữ container để có thể bật lại
.\scripts\dev.ps1 restart auth-service  # Tạo lại và bật riêng service
.\scripts\dev.ps1 logs auth-service     # Theo dõi log riêng service
.\scripts\dev.ps1 status auth-service   # Xem trạng thái riêng service
```

Tên service hợp lệ: `auth-service`, `sinhvien-service`, `detai-service`, `dangky-service`, `api-gateway`. Thay `auth-service` trong ví dụ bằng tên service muốn thao tác. Dừng một service có thể khiến service phụ thuộc vào nó tạm thời không hoạt động.

Gateway chạy tại `http://localhost:3000`; các backend cũng được publish trên loopback tại port `3001`–`3004`. Compose đợi health check của các service phụ thuộc trước khi khởi động gateway.

## Chạy frontend

Frontend tiếp tục chạy trực tiếp trên host:

```powershell
Set-Location .\frontend-app
npm install
npm start
```

Mở `http://localhost:4200`. Frontend gọi API Gateway tại `http://localhost:3000`.

## Kết nối PostgreSQL trên host

Không chạy PostgreSQL trong Compose. Các container dùng hostname `host.docker.internal` để truy cập máy host và giữ nguyên tên database cùng thông tin kết nối trong `.env` của từng service. Nếu kết nối bị từ chối, kiểm tra PostgreSQL có nhận kết nối từ Docker Desktop và firewall host cho phép kết nối đến port `5433`.

Các `.env` chứa thông tin bí mật không được đưa vào build context Docker hoặc image.
