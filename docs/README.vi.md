<div align="center">
  <img src="../public/logo.png" width="112" height="112" alt="Logo Phrase Manager">
  <p><a href="../README.md">简体中文</a> · <a href="./README.zh-HK.md">繁體中文（香港）</a> · <a href="./README.zh-TW.md">繁體中文（台灣）</a> · <a href="./README.en.md">English</a> · <a href="./README.ja.md">日本語</a> · <strong>Tiếng Việt</strong> · <a href="./README.ko.md">한국어</a> · <a href="./README.es.md">Español</a> · <a href="./README.fr.md">Français</a> · <a href="./README.pt-BR.md">Português (Brasil)</a> · <a href="./README.pt-PT.md">Português (Portugal)</a> · <a href="./README.ru.md">Русский</a> · <a href="./README.de.md">Deutsch</a> · <a href="./README.it.md">Italiano</a></p>
  <h1>Quản lý mẫu câu - Phrase Manager</h1>
  <p><strong>Quản lý mẫu câu, đoạn văn bản và mục kiến thức cục bộ trong uTools</strong></p>
</div>

Phrase Manager là plugin uTools để sắp xếp nội dung có thể tái sử dụng theo cấu trúc Danh mục → Nhóm → Mẫu câu. Dữ liệu được lưu trong cơ sở dữ liệu cục bộ của uTools và có thể sao lưu bằng JSON.

## Tính năng

- Tạo, đổi tên, xóa, sắp xếp, di chuyển và sao chép nhóm, danh mục, mẫu câu
- Tìm kiếm, xem trước, phím tắt, thao tác hàng loạt, hoàn tác và làm lại
- Nhập xuất JSON, CSV mẫu câu iFlytek và nhập dữ liệu bằng AI
- AI tạo nội dung, tiêu đề, phân loại và tối ưu nội dung
- Chế độ tối, chọn phông chữ cục bộ và trình chỉnh sửa đáp ứng

## Bắt đầu nhanh

1. Tải và giải nén [bản phát hành mới nhất](https://github.com/realSilasYang/phrase-manager/releases/latest).
2. Mở công cụ dành cho nhà phát triển của uTools và nạp `plugin.json`.
3. Tìm “常用语”, `Phrase Manager` hoặc `Phrases` trong uTools.
4. Chọn “Tạo danh mục” hoặc “Tạo danh mục…” trong danh sách. Danh mục là cấp cao nhất và chứa các nhóm; bạn có thể đặt tên tùy chỉnh cho cả hai trước khi tạo.

## Phím tắt

| Phím | Tác vụ |
| --- | --- |
| `Ctrl+N` | Tạo mẫu câu |
| `Ctrl+Shift+N` | Tạo danh mục |
| `Ctrl+F` | Tập trung vào tìm kiếm |
| `Ctrl+S` | Lưu mẫu câu hiện tại |
| `Ctrl+Z` / `Ctrl+Y` | Hoàn tác / làm lại |
| `F2` | Đổi tên nhóm hoặc danh mục đang trỏ tới |
| `Delete` | Xóa mục đang trỏ tới |
| `Space` | Bật tắt chế độ xem trước |

## Ngôn ngữ hỗ trợ

Giao diện có tiếng Trung giản thể, Trung phồn thể Hồng Kông, Trung phồn thể Đài Loan, Anh, Nhật, Việt, Hàn, Tây Ban Nha, Pháp, Bồ Đào Nha Brazil, Bồ Đào Nha châu Âu, Nga, Đức và Ý. Chế độ tự động theo ngôn ngữ hệ thống và dùng tiếng Trung giản thể khi không tìm thấy kết quả.

## Phát triển

```bash
npm ci
npm run dev
npm run release:build
```

Xem [README tiếng Trung giản thể](../README.md) để đọc hướng dẫn đầy đủ. Dự án được phát hành theo [MIT License](../LICENSE).
