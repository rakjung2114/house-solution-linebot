# 🚀 LINE Bot System - คำแนะนำการใช้งาน

## ✨ ฟีเจอร์ที่เพิ่มเข้ามา

### 1. **Flex Menu ที่สมบูรณ์**
- เมนูแสดงผลสวยงาม
- รองรับการคลิกแต่ละปุ่ม
- แสดงไอคอนและข้อความ

### 2. **ระบบแจ้งซ่อมแบบครบถ้วน**
- เลือกหมวดหมู่การแจ้งซ่อม (ไฟฟ้า, ประปา, โครงสร้าง, อื่นๆ)
- กรอกรายละเอียดปัญหา
- บันทึกลงฐานข้อมูล
- ได้รับเลขที่การแจ้งซ่อม

### 3. **ระบบตรวจสอบบิล**
- ดึงใบแจ้งหนี้ล่าสุด
- แสดงรายละเอียดแบบ Flex Message
- แสดงสถานะการชำระ

### 4. **ระบบลงทะเบียนที่ปรับปรุงแล้ว**
- ขั้นตอนการลงทะเบียนที่ชัดเจน
- Validation ข้อมูล
- บันทึกลงฐานข้อมูลอัตโนมัติ

---

## 📋 การทดสอบระบบ

### ขั้นตอนที่ 1: ทดสอบการเชื่อมต่อ
```javascript
// รันฟังก์ชันนี้ใน Google Apps Script
testBotSystem();
```

### ขั้นตอนที่ 2: Deploy และตั้งค่า Webhook
1. Deploy Apps Script เป็น Web app
2. ตั้งค่า Webhook URL ใน LINE Developers
3. เปิด "Use webhook"

### ขั้นตอนที่ 3: ทดสอบการทำงาน
ส่งข้อความเหล่านี้ใน LINE:

#### 🏠 เริ่มต้นใช้งาน
- **"ลงทะเบียน"** - เริ่มขั้นตอนการลงทะเบียน
- **"เมนู"** - แสดงเมนูหลัก

#### 📱 ฟีเจอร์หลัก
- **"ตรวจสอบบิล"** - ดูใบแจ้งหนี้ล่าสุด
- **"แจ้งซ่อม"** - เริ่มกระบวนการแจ้งซ่อม
- **"โปรไฟล์"** - ดูข้อมูลส่วนตัว
- **"ติดต่อ"** - ข้อมูลติดต่อสำนักงาน

---

## 🔧 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย:

#### 1. **Bot ไม่ตอบกลับ**
```javascript
// ตรวจสอบ Channel Access Token
testChannelAccessToken();

// ตรวจสอบการเชื่อมต่อ Spreadsheet
testSpreadsheetConnection();
```

#### 2. **ข้อผิดพลาดในการลงทะเบียน**
- ตรวจสอบว่า Google Sheets มี Sheet ชื่อ "Members"
- ตรวจสอบ Headers ใน Sheet ว่าถูกต้องหรือไม่

#### 3. **Flex Message ไม่แสดง**
- ตรวจสอบ JSON syntax ใน createFlexMenu()
- ลองใช้ข้อความธรรมดาแทน

---

## 📊 โครงสร้างฐานข้อมูล

### Sheet: Members
```
member_id | line_id | first_name | last_name | unit_number | phone_number | email | register_date | status | profile_picture | notes
```

### Sheet: Invoices  
```
invoice_id | member_id | unit_number | description | total_amount | due_date | issue_date | status
```

### Sheet: Maintenance
```
maintenance_id | member_id | category | description | photo_url | created_date | status | assigned_to | notes
```

---

## 🎯 ขั้นตอนการใช้งาน

### สำหรับผู้ดูแลระบบ:

1. **ตั้งค่าเริ่มต้น**
   - สร้าง Google Sheets ตามโครงสร้างที่กำหนด
   - ตั้งค่า Channel Access Token
   - Deploy Google Apps Script

2. **ทดสอบระบบ**
   - รันฟังก์ชัน `testBotSystem()`
   - ทดสอบส่งข้อความใน LINE
   - ตรวจสอบ Log ใน Apps Script

3. **การบำรุงรักษา**
   - ตรวจสอบ Log ใน Executions
   - อัปเดตข้อมูลใน Google Sheets
   - ตอบกลับการแจ้งซ่อมผ่านระบบ Admin

### สำหรับผู้ใช้งาน:

1. **เริ่มต้นใช้งาน**
   - Add LINE Bot เป็นเพื่อน
   - ลงทะเบียนผ่านระบบ
   - ใช้งานผ่านเมนูหรือพิมพ์คำสั่ง

2. **การใช้งานประจำ**
   - ตรวจสอบบิลรายเดือน
   - แจ้งซ่อมเมื่อมีปัญหา
   - ติดตามสถานะต่างๆ

---

## 🛠️ การขยายระบบ

### เพิ่มฟีเจอร์ใหม่:

#### 1. **ระบบยืมครุภัณฑ์**
```javascript
function handleEquipmentBooking(replyToken, userId) {
  // แสดงรายการครุภัณฑ์ที่ให้ยืม
  // จัดการการจอง
  // บันทึกลงฐานข้อมูล
}
```

#### 2. **ระบบกิจกรรม**
```javascript
function handleEvents(replyToken, userId) {
  // แสดงกิจกรรมที่กำลังจะมา
  // ลงทะเบียนเข้าร่วมกิจกรรม
}
```

#### 3. **ระบบแจ้งเตือน**
```javascript
function sendNotifications() {
  // แจ้งเตือนบิลใกล้ครบกำหนด
  // แจ้งข่าวสารจากนิติบุคคล
}
```

---

## 📞 การสนับสนุน

หากมีปัญหาการใช้งาน:
1. ตรวจสอบ Console Log ใน Google Apps Script
2. ดู Execution History เพื่อหาข้อผิดพลาด
3. ทดสอบด้วยฟังก์ชัน `testBotSystem()`

**ระบบพร้อมใช้งานแล้ว! 🎉**
