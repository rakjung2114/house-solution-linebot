# ขั้นตอนการแก้ไขปัญหา LINE Bot ไม่ตอบกลับ

## ขั้นตอนที่ 1: ตรวจสอบพื้นฐาน

### 1.1 ตรวจสอบ Channel Access Token
```
1. ไปที่ https://developers.line.biz/
2. เลือก Channel ของคุณ
3. ไปที่ Messaging API tab
4. คัดลอก Channel access token ใหม่
5. แทนที่ใน LINEBot.gs ที่บรรทัดที่ 7
```

### 1.2 ตรวจสอบ Webhook URL
```
1. ใน Google Apps Script:
   - คลิก Deploy > Manage deployments
   - คลิก Edit (รูปดินสอ)
   - คลิก Deploy
   - คัดลอก URL ใหม่

2. ใน LINE Developers:
   - ใส่ URL ใน Webhook URL
   - เปิด "Use webhook"
   - เปิด "Allow bot to join group chats"
```

## ขั้นตอนที่ 2: ทดสอบระบบ

### 2.1 เปิด Google Apps Script Editor
```
1. ไปที่ script.google.com
2. เปิดโปรเจกต์ของคุณ
```

### 2.2 รันฟังก์ชันทดสอบ
```
1. เลือกฟังก์ชัน "fullSystemTest" จาก dropdown
2. คลิก Run
3. อนุญาตสิทธิ์ถ้าขอ
4. ดูผลลัพธ์ใน Execution transcript
```

### 2.3 ดู Execution Log
```
1. ไปที่ Executions (ด้านซ้าย)
2. คลิกดู execution ล่าสุด
3. ตรวจสอบ error หรือ log
```

## ขั้นตอนที่ 3: แก้ไขปัญหาเฉพาะ

### 3.1 ถ้า Channel Access Token ผิด
```
Error: "401 Unauthorized"
แก้ไข: สร้าง Channel access token ใหม่
```

### 3.2 ถ้า Webhook URL ผิด
```
ไม่มี execution ใหม่เมื่อส่งข้อความ
แก้ไข: Deploy Apps Script ใหม่และอัปเดต URL
```

### 3.3 ถ้า Spreadsheet ไม่เข้าถึงได้
```
Error: "Permission denied"
แก้ไข: แชร์ Spreadsheet ให้กับ Apps Script
```

## ขั้นตอนที่ 4: ทดสอบการทำงาน

### 4.1 ส่งข้อความทดสอบ
```
ลองส่งข้อความเหล่านี้ใน LINE:
- "เมนู"
- "ลงทะเบียน"
- "ติดต่อ"
```

### 4.2 ตรวจสอบการตอบกลับ
```
ถ้าไม่มีการตอบกลับ:
1. ตรวจสอบ Execution log
2. ดู Console.log
3. หา Error message
```

## ขั้นตอนที่ 5: การแก้ไขขั้นสูง

### 5.1 เคลียร์ Cache
```javascript
// รันฟังก์ชันนี้ใน Apps Script
function clearCache() {
  const cache = CacheService.getScriptCache();
  cache.removeAll();
  console.log('Cache cleared');
}
```

### 5.2 ตรวจสอบ Rich Menu
```javascript
// ปิด Rich Menu ชั่วคราว
// ใน LINEBot.gs แก้ไข:
// CONFIG.RICH_MENU_ID = '';
```

### 5.3 ใช้ Simple Message แทน Flex Message
```javascript
// ใน handleShowMenu แทนที่ด้วย:
function handleShowMenu(replyToken) {
  replyMessage(replyToken, [{
    type: 'text',
    text: 'เมนูหลัก:\n1. ตรวจสอบบิล\n2. แจ้งซ่อม\n3. ยืมครุภัณฑ์\n4. กิจกรรม\n5. ติดต่อ\n6. โปรไฟล์'
  }]);
}
```

## ขั้นตอนที่ 6: ถ้ายังไม่ได้ผล

### 6.1 สร้างโปรเจกต์ใหม่
```
1. สร้าง Google Apps Script ใหม่
2. คัดลอกโค้ดทั้งหมด
3. Deploy เป็น Web app
4. อัปเดต Webhook URL
```

### 6.2 ตรวจสอบ LINE Channel Settings
```
1. ตรวจสอบว่า Channel type เป็น Messaging API
2. ตรวจสอบว่าไม่ได้ใช้ LINE@ Manager
3. ตรวจสอบ Auto-reply messages (ปิด)
4. ตรวจสอบ Greeting messages (ตั้งค่าตามต้องการ)
```

## คำแนะนำเพิ่มเติม

### ดูสถานะ Real-time
```
1. เปิด Google Apps Script Editor
2. ไปที่ Executions
3. ส่งข้อความใน LINE
4. ดูว่ามี execution ใหม่หรือไม่
```

### ตรวจสอบข้อผิดพลาดทั่วไป
```
- Channel Access Token หมดอายุ
- Webhook URL ไม่ถูกต้อง
- ไม่ได้เปิด Webhook
- Permission ไม่พอ
- Internet connection ปัญหา
```

### การติดต่อขอความช่วยเหลือ
```
หากยังแก้ไขไม่ได้ กรุณาส่งข้อมูลต่อไปนี้:
1. Screenshot ของ Error message
2. Execution transcript
3. Console.log output
4. LINE Channel settings screenshot
```
