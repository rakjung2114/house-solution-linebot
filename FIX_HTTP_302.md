# วิธีแก้ไขข้อผิดพลาด HTTP 302 Found

## ปัญหา: Webhook returned HTTP 302 Found

ข้อผิดพลาดนี้เกิดจาก Webhook URL ที่ไม่ถูกต้องหรือมีการ redirect

## วิธีแก้ไข:

### ขั้นตอนที่ 1: Deploy Apps Script ใหม่แบบถูกต้อง

1. เปิด Google Apps Script (script.google.com)
2. เปิดโปรเจกต์ LINEBot ของคุณ
3. คลิก **Deploy** (มุมขวาบน) > **Manage deployments**
4. คลิก **Delete** deployment เก่า (ถ้ามี)
5. คลิก **Create deployment**
6. ตั้งค่าดังนี้:
   - **Type**: Web app
   - **Description**: LINE Bot Webhook v2 (หรืออะไรก็ได้)
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
7. คลิก **Deploy**
8. **คัดลอก URL ใหม่** ที่ได้

### ขั้นตอนที่ 2: อัปเดต Webhook URL ใน LINE Developers

1. ไปที่ https://developers.line.biz/
2. เลือก Channel ของคุณ
3. ไปที่ **Messaging API** tab
4. ใน **Webhook settings**:
   - **ลบ URL เก่า** ออก
   - **ใส่ URL ใหม่** จาก Apps Script
   - คลิก **Update**
   - เปิด **Use webhook** (เป็น ON)
5. คลิก **Verify** เพื่อทดสอบ

### ขั้นตอนที่ 3: ตรวจสอบการตั้งค่า

#### ใน Apps Script:
```javascript
// ตรวจสอบว่าฟังก์ชัน doPost มีอยู่และถูกต้อง
function doPost(e) {
  try {
    // ตรวจสอบว่ามี postData หรือไม่
    if (!e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ 
        status: 'error', 
        message: 'No postData' 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const events = JSON.parse(e.postData.contents).events;
    
    events.forEach(event => {
      if (event.type === 'message') {
        handleMessage(event);
      }
    });
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'error', 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

#### ใน LINE Developers:
- **Auto-reply messages**: OFF
- **Greeting messages**: ON (ถ้าต้องการ)
- **Webhooks**: ON
- **Allow bot to join group chats**: ON

### ขั้นตอนที่ 4: ทดสอบระบบ

#### ทดสอบใน Apps Script:
1. เลือกฟังก์ชัน `testBotSystem`
2. คลิก **Run**
3. ดูผลลัพธ์ใน Console

#### ทดสอบใน LINE:
1. ส่งข้อความ "เมนู"
2. ดูว่ามีการตอบกลับหรือไม่

### หากยังไม่ได้ผล:

#### ตรวจสอบ URL Format:
URL ควรมีรูปแบบ:
```
https://script.google.com/macros/s/[SCRIPT_ID]/exec
```

#### ตรวจสอบสิทธิ์:
- Apps Script ต้องมีสิทธิ์ "Anyone can access"
- Google Sheets ต้องแชร์ให้ Apps Script

#### Clear Cache:
```javascript
function clearAllCache() {
  CacheService.getScriptCache().removeAll();
  CacheService.getDocumentCache().removeAll();
  CacheService.getUserCache().removeAll();
}
```

## สาเหตุของ HTTP 302 Found:

1. **URL ไม่ถูกต้อง** - ใช้ URL ผิด
2. **Permission ไม่พอ** - Apps Script ไม่อนุญาตให้เข้าถึง
3. **Deployment เก่า** - ใช้ deployment เก่าที่ไม่ active
4. **Cache ปัญหา** - Browser หรือ LINE cache URL เก่า

## เคล็ดลับ:
- ใช้ Incognito/Private browsing เมื่อทดสอบ
- รอ 2-3 นาทีหลัง deploy ใหม่
- ตรวจสอบ Execution log ใน Apps Script
