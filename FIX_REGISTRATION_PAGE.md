# 🚨 แก้ไขปัญหา: โหลดหน้าลงทะเบียนไม่ได้

## ❗ สาเหตุของปัญหา
หน้าลงทะเบียนและหน้าแอดมินไม่สามารถทำงานได้เมื่อเปิดไฟล์ HTML จากคอมพิวเตอร์โดยตรง เพราะ:
- ไฟล์ที่เปิดด้วย `file://` protocol ไม่สามารถเชื่อมต่อกับ Google Apps Script ได้
- ต้องเปิดผ่าน Web App URL ที่ Google สร้างให้เท่านั้น

## ✅ วิธีแก้ไข

### ขั้นตอนที่ 1: Deploy Google Apps Script เป็น Web App

1. เปิด Google Apps Script (script.google.com)
2. สร้างโปรเจกต์ใหม่หรือเปิดโปรเจกต์เก่า
3. คัดลอกโค้ดจากไฟล์ต่อไปนี้ไปใส่ใน Google Apps Script:
   - `AdminAPI.gs`
   - `Configuration.gs` 
   - `index.html`
   - `user.html`

4. คลิก **Deploy** → **New deployment**
5. เลือก Type: **Web app**
6. กำหนดค่า:
   - Description: `The House Solution Web App`
   - Execute as: **Me**
   - Who has access: **Anyone** (หรือ **Anyone with Google account**)
7. คลิก **Deploy**
8. **คัดลอก Web App URL ที่ได้**

### ขั้นตอนที่ 2: เปิดระบบผ่าน Web App URL

**สำหรับหน้าลงทะเบียน:**
```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?page=user
```

**สำหรับหน้าแอดมิน:**
```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?page=admin
```

### ขั้นตอนที่ 3: อัปเดตลิงค์ในหน้าแอดมิน

เปิดหน้าแอดมิน แล้วแก้ไขลิงค์ "เปิดหน้าลงทะเบียน" ให้เป็น Web App URL แทนการชื้อไฟล์ `user.html`

## 🔧 การทดสอบ

1. เปิด `test-connection.html` เพื่อตรวจสอบสภาพแวดล้อม
2. หากเปิดจาก `file://` จะแสดงข้อผิดพลาด ✅ (นี่เป็นสิ่งที่คาดหวัง)
3. เปิดผ่าน Web App URL แทน ควรทำงานได้ปกติ

## 📝 ตัวอย่าง URL ที่ถูกต้อง

```
✅ ถูกต้อง: https://script.google.com/macros/s/abc123.../exec?page=user
❌ ผิด: file:///C:/Users/.../user.html
❌ ผิด: user.html
```

## 🎯 สรุป

**ปัญหา:** เปิดไฟล์ HTML จากคอมพิวเตอร์โดยตรง
**วิธีแก้:** Deploy เป็น Web App และเปิดผ่าน URL ที่ Google สร้างให้

หลังจาก Deploy แล้ว ระบบจะทำงานได้ปกติทั้งหน้าลงทะเบียนและหน้าแอดมิน 🎉
