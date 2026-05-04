# 🎨 Portfolio 3D - Nhóm 6 : Web Portfolio 3D - Phòng Làm Việc 3D

## 📌 Giới thiệu

Dự án xây dựng một không gian trưng bày tranh 3D sử dụng **Three.js**, cho phép người dùng di chuyển, quan sát và tương tác với các tác phẩm trong môi trường ảo.

---

## 🚀 Công nghệ sử dụng

* Three.js – dựng không gian 3D
* Vite – công cụ build & chạy dự án
* GSAP – tạo animation
* lil-gui – hỗ trợ debug

---

## 📂 Cấu trúc dự án

```
nhom6_portfolio-main/
│── public/
│   ├── assets/images/    # Ảnh texture
│   ├── sounds/           # Âm thanh
│   ├── modeldone1.glb    # Model 3D
│
│── index.html            # File HTML chính
│── main.js               # Xử lý logic 3D
│── styles.css            # Giao diện
│── package.json          # Cấu hình project
```

---

## ⚙️ Cài đặt và chạy

### 1. Cài Node.js
Tải tại: https://nodejs.org (bản LTS)
Kiểm tra:
```
node -v
npm -v
```
### 2. Cài thư viện
Mở terminal tại thư mục project:
```
npm install
```
### 3. Chạy project
```
npm run dev
```
Mở trình duyệt:
```
http://localhost:5173/
```
### 4. Build (tuỳ chọn)
```
npm run build
```
## 🎮 Cách sử dụng

* Chuột trái: xoay góc nhìn
* Chuột phải: di chuyển
* Con lăn: zoom
---
## ✨ Tính năng

* Không gian trưng bày 3D
* Load model `.glb`
* Hiển thị tranh trong môi trường
* Animation với GSAP
* Âm thanh nền

---

## 🔧 Hướng phát triển

* Click vào tranh để zoom
* Hiển thị thông tin tranh
* Tối ưu hiệu năng
* Thêm UI tương tác

---

## 📌 Ghi chú

* Nếu không chạy → kiểm tra đã `npm install`
* Nếu lỗi port → Vite sẽ tự đổi

---

## 👥 Thành viên và Phân công nhiệm vụ

| Họ tên              | MSV      | Phân công                                                                                                                                                                    | Tỉ lệ đóng góp (%) |
| ------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| NGUYỄN VĂN MẠNH     | 24023031 | Lead nhóm; Thiết lập môi trường 3D, ánh sáng, đổ bóng; Khóa camera trong phòng; Lập trình hiệu ứng viền sáng (OutlinePass); Merge code, quản lý Git; Hỗ trợ model và báo cáo | 100%               |
| NGUYỄN PHÚC PHƯƠNG  | 24023055 | Xử lý logic tương tác (click phóng to tranh); Hiệu ứng hover phát sáng viền; Hỗ trợ model và báo cáo                                                                         | 100%               |
| TRẦN ĐỨC DUY        | 24022979 | Xây dựng hệ thống UI Portfolio (màn hình máy tính, folder); Tối ưu cơ chế thoát UI bằng click; Hỗ trợ model và báo cáo                                                       | 100%               |
| NGUYỄN THỊ XUÂN MAI | 24023028 | Thiết lập hệ thống âm thanh (Audio/SFX khi click & hover); Quản lý tài liệu; Thiết kế slide; Viết báo cáo; Hỗ trợ model                                                      | 100%               |
| TRẦN HẢI ĐĂNG       | 24022957 | Hỗ trợ xây dựng model 3D; Hỗ trợ báo cáo                                                                                                                                     | 100%               |

---

## 📌 Ghi chú

* Tất cả thành viên đều tham gia đóng góp vào quá trình xây dựng model và hoàn thiện báo cáo.
* Tỉ lệ đóng góp được thống nhất trong nhóm.

