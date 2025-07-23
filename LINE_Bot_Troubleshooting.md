# วิธีแก้ปัญหา LINE Bot Timeout

## ปัญหาที่พบ
```
"A timeout occurred when sending a webhook event object"
```

## ขั้นตอนการแก้ไข

### 1. ตรวจสอบการ Deploy Web App
1. เปิด Google Apps Script Editor
2. คลิก "Deploy" → "New deployment"
3. เลือก Type: "Web app"
4. ตั้งค่าดังนี้:
   - **Execute as**: Me (ชื่อของคุณ)
   - **Who has access**: Anyone
5. คลิก "Deploy"
6. **คัดลอก URL ที่ได้** (ต้องลงท้ายด้วย `/exec`)

### 2. ตั้งค่า LINE Bot Console
1. เข้า https://developers.line.biz/console/
2. เลือก Channel ของคุณ
3. ไปที่ "Messaging API settings"
4. ในส่วน "Webhook settings":
   - **Webhook URL**: ใส่ URL ที่ได้จากขั้นตอนที่ 1
   - **Use webhook**: เปิด (ON)
   - **Verify**: คลิกเพื่อทดสอบ

### 3. ตรวจสอบ Permissions
ใน Google Apps Script:
1. ไปที่ "Project Settings" (เฟืองตั้งค่า)
2. ในส่วน "General settings"
3. ตรวจสอบว่า **Show "appsscript.json" manifest file in editor** เปิดอยู่

### 4. ทดสอบการเชื่อมต่อ
1. เปิดไฟล์ `test-linebot.html` ในเบราว์เซอร์
2. ทดสอบตามลำดับ:
   - GET Request
   - POST Request  
   - LINE Bot API
   - Reset Webhook

### 5. ตรวจสอบ Code Timeout
ใน `LINEBot.gs` ได้ปรับปรุงแล้วเพื่อ:
- ตอบกลับ LINE ทันทีเพื่อป้องกัน timeout
- ประมวลผล events แบบ async
- จัดการ error ให้ถูกต้อง

### 6. Common Issues และวิธีแก้

#### Error: "Script function not found"
- ตรวจสอบว่า deploy ใหม่แล้ว
- ตรวจสอบชื่อ function ใน code

#### Error: "Permission denied"
- ตั้งค่า "Who has access" เป็น "Anyone"
- Run script หนึ่งครั้งเพื่อ authorize permissions

#### Error: "Invalid JSON"
- ตรวจสอบ LINE Bot Channel Secret และ Access Token
- ตรวจสอบ format ของ webhook payload

### 7. การ Debug
1. เปิด Google Apps Script Editor
2. คลิก "Executions" (ซ้ายมือ)
3. ดูข้อผิดพลาดที่เกิดขึ้น
4. ตรวจสอบ Console.log ใน "Logs"

### 8. Final Checklist
- [ ] Web App deployed ด้วย URL ที่ลงท้าย `/exec`
- [ ] LINE Bot Console มี Webhook URL ที่ถูกต้อง
- [ ] Webhook verification ผ่าน (สีเขียว)
- [ ] Execute as "Me" และ Who has access "Anyone"
- [ ] Channel Access Token และ Channel Secret ถูกต้อง
- [ ] Code ใน doPost() มีการ timeout handling

## ข้อมูลเพิ่มเติม

### URL Format
```
✅ ถูกต้อง: https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
❌ ผิด: https://script.google.com/macros/s/YOUR_SCRIPT_ID/dev
```

### Webhook Response Time
LINE Bot ต้องการ response ภายใน **5 วินาที** 
Code ได้ปรับให้ตอบกลับทันทีแล้ว

### Testing Commands
หลังจากแก้ไขแล้ว ทดสอบโดยส่งข้อความไปยัง LINE Bot:
- "สวัสดี" - ทดสอบ basic response
- "เมนู" - ทดสอบ rich menu
- "สถานะ" - ทดสอบ status functions
