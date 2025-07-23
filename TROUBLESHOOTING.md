# คำแนะนำแก้ไขปัญหา LINE Bot ไม่ตอบกลับ

## สาเหตุที่อาจทำให้ LINE Bot ไม่ตอบกลับ

### 1. ตรวจสอบ Channel Access Token
- ไปที่ [LINE Developers Console](https://developers.line.biz/)
- เลือก Channel ของคุณ
- ไปที่ Channel settings > Messaging API
- คัดลอก Channel access token ใหม่
- แทนค่าใน CONFIG.CHANNEL_ACCESS_TOKEN ในไฟล์ LINEBot.gs

### 2. ตรวจสอบ Webhook URL
- ใน Google Apps Script:
  1. คลิก Deploy > New deployment
  2. เลือก Type: Web app
  3. Execute as: Me
  4. Who has access: Anyone
  5. คลิก Deploy และคัดลอก Web app URL
- ใน LINE Developers Console:
  1. ไปที่ Channel settings > Messaging API
  2. ใส่ Web app URL ใน Webhook URL
  3. เปิด Use webhook

### 3. ตรวจสอบสิทธิ์ Google Sheets
- ใน Google Apps Script:
  1. ไปที่ Services > Google Sheets API
  2. เพิ่มถ้ายังไม่มี
- ตรวจสอบว่า Spreadsheet ID ถูกต้อง

### 4. วิธีทดสอบระบบ
1. เปิด Google Apps Script Editor
2. เลือกฟังก์ชัน `testBotSystem`
3. คลิก Run
4. ดู Log ใน Execution transcript

### 5. วิธีดู Log เมื่อมีปัญหา
1. ใน Google Apps Script Editor
2. ไปที่ Executions
3. คลิกดู execution ล่าสุด
4. ตรวจสอบ console.log และ error

### 6. ตรวจสอบข้อความทดสอบ
ลองส่งข้อความต่อไปนี้ใน LINE:
- "เมนู" - ควรแสดงเมนูหลัก
- "ลงทะเบียน" - ควรเริ่มขั้นตอนลงทะเบียน
- "ติดต่อ" - ควรแสดงข้อมูลติดต่อ

### 7. ข้อผิดพลาดที่พบบ่อย
1. **Channel Access Token หมดอายุ** - สร้างใหม่
2. **Webhook URL ไม่ถูกต้อง** - Deploy ใหม่และอัปเดต
3. **ไม่ได้เปิด Webhook** - เปิดในหน้า LINE Developers
4. **Spreadsheet ไม่มีสิทธิ์เข้าถึง** - แชร์ให้กับ Apps Script

### 8. การตรวจสอบเพิ่มเติม
```javascript
// ใส่ฟังก์ชันนี้ใน Google Apps Script และรัน
function debugBot() {
  console.log('=== Debug Bot System ===');
  
  // ทดสอบ Channel Access Token
  testChannelAccessToken();
  
  // ทดสอบ Spreadsheet
  testSpreadsheetConnection();
  
  // ทดสอบฟังก์ชันต่างๆ
  testBotSystem();
}
```

### 9. ถ้ายังไม่ได้
1. ตรวจสอบว่ามี Execution ใหม่ในหน้า Apps Script หรือไม่
2. ลองส่งข้อความง่ายๆ เช่น "สวัสดี"
3. ตรวจสอบว่า Rich Menu มีปัญหาหรือไม่
4. ลอง Redeploy Apps Script ใหม่

### 10. การติดตั้งใหม่หากจำเป็น
1. สร้าง Google Apps Script Project ใหม่
2. คัดลอกโค้ดจาก LINEBot.gs
3. Deploy เป็น Web app ใหม่
4. อัปเดต Webhook URL ใน LINE Developers
5. ทดสอบอีกครั้ง
