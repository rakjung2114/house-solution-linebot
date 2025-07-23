/const CONFIG = {
  // Google Sheets - ใส่ Spreadsheet ID ที่ถูกต้องของคุณ
  SPREADSHEET_ID: '', // Admin API Spreadsheet ID
  LINE_SPREADSHEET_ID: '', // LINE Bot Spreadsheet ID
  
  // LINE Bot Configuration
  LINE_CHANNEL_ACCESS_TOKEN: '',
  CHANNEL_ACCESS_TOKEN: '',
  MAINTENANCE_PHOTOS_FOLDER_ID: '',
  LINE_REPLY_URL: 'https://api.line.me/v2/bot/message/reply',
  LINE_PUSH_URL: 'https://api.line.me/v2/bot/message/push'
};=========== Shared Configuration ====================
const CONFIG = {
  // Google Sheets - ใส่ Spreadsheet ID ที่ถูกต้องของคุณ
  SPREADSHEET_ID: '1uQIDSvNgf4C89tXNQCza7EpytrhN-tjDU2snA_w8z4w', // Admin API Spreadsheet ID
  LINE_SPREADSHEET_ID: '1uQIDSvNgf4C89tXNQCza7EpytrhN-tjDU2snA_w8z4w', // LINE Bot Spreadsheet ID
  
  // LINE Bot Configuration
  CHANNEL_ACCESS_TOKEN: 'fyqY671pI+IhINBcBTX1EcoLRaKRv7zQJx1r5MZqQhTl33GgHQOm8kJRuod+u2YHSbLO4xcWMgTDNJ5f0XN1IWkeMY3d88+eMlwTyiL1c/z/XYNgS4y771FGpsQp1bIc57nGwNoVpsicOzwjc18sMAdB04t89/1O/w1cDnyilFU=',
  MAINTENANCE_PHOTOS_FOLDER_ID: '1diMXhVGT5gzGYrn4rYrjvlWF_xjbF_tr',
  LINE_REPLY_URL: 'https://api.line.me/v2/bot/message/reply',
  LINE_PUSH_URL: 'https://api.line.me/v2/bot/message/push'
};

const SHEETS = {
  MEMBERS: 'Members',
  INVOICES: 'Invoices', 
  PAYMENTS: 'Payments',
  MAINTENANCE: 'Maintenance',
  EQUIPMENT: 'Equipment',
  BOOKINGS: 'Bookings',
  EVENTS: 'Events'
};

const ADMIN_CONFIG = {
  ADMIN_EMAILS: [
    'admin@example.com', // เปลี่ยนเป็นอีเมลแอดมินจริง
    'test@example.com'
  ],
  SYSTEM_ADMIN_ROLES: [
    'admin@example.com',
    'test@example.com'
  ]
};

// ==================== Helper Functions for Configuration ====================
function getAdminSpreadsheetId() {
  return CONFIG.SPREADSHEET_ID;
}

function getLineSpreadsheetId() {
  return CONFIG.LINE_SPREADSHEET_ID;
}

function getChannelAccessToken() {
  return CONFIG.LINE_CHANNEL_ACCESS_TOKEN;
}

function getLineChannelAccessToken() {
  return CONFIG.LINE_CHANNEL_ACCESS_TOKEN;
}

function getConfig() {
  return CONFIG;
}

// ==================== Spreadsheet Initialization Functions ====================
/**
 * สร้าง Google Spreadsheet ใหม่สำหรับระบบ Admin
 * เรียกใช้ครั้งเดียวเพื่อตั้งค่าเริ่มต้น
 */
function createAdminSpreadsheet() {
  try {
    // สร้าง Spreadsheet ใหม่
    const ss = SpreadsheetApp.create('The House Solution - Admin Database');
    const spreadsheetId = ss.getId();
    
    console.log('สร้าง Spreadsheet สำเร็จ!');
    console.log('Spreadsheet ID: ' + spreadsheetId);
    console.log('URL: https://docs.google.com/spreadsheets/d/' + spreadsheetId);
    
    // สร้าง Sheets ต่างๆ
    createMembersSheet(ss);
    createInvoicesSheet(ss);
    createPaymentsSheet(ss);
    createMaintenanceSheet(ss);
    createEquipmentSheet(ss);
    createBookingsSheet(ss);
    createEventsSheet(ss);
    
    // ลบ Sheet ที่เหลือ (Sheet1)
    const defaultSheet = ss.getSheetByName('Sheet1');
    if (defaultSheet) ss.deleteSheet(defaultSheet);
    
    return {
      success: true,
      spreadsheetId: spreadsheetId,
      url: 'https://docs.google.com/spreadsheets/d/' + spreadsheetId,
      message: 'สร้าง Database เรียบร้อย! กรุณาคัดลอก Spreadsheet ID ไปใส่ใน Configuration.gs'
    };
  } catch (error) {
    console.error('Error creating spreadsheet:', error);
    return { error: 'เกิดข้อผิดพลาด: ' + error.toString() };
  }
}

/**
 * ตรวจสอบว่า Spreadsheet ID ถูกต้องและเข้าถึงได้หรือไม่
 */
function testSpreadsheetAccess() {
  try {
    const spreadsheetId = getAdminSpreadsheetId();
    
    if (!spreadsheetId || spreadsheetId === 'YOUR_ADMIN_SPREADSHEET_ID_HERE') {
      return {
        success: false,
        error: 'กรุณาใส่ Spreadsheet ID ที่ถูกต้องใน Configuration.gs',
        action: 'เรียกใช้ createAdminSpreadsheet() เพื่อสร้าง Spreadsheet ใหม่'
      };
    }
    
    // ทดสอบเข้าถึง Spreadsheet
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheetNames = ss.getSheets().map(sheet => sheet.getName());
    
    return {
      success: true,
      spreadsheetId: spreadsheetId,
      spreadsheetName: ss.getName(),
      sheets: sheetNames,
      url: ss.getUrl(),
      message: 'เชื่อมต่อ Database สำเร็จ!'
    };
  } catch (error) {
    return {
      success: false,
      error: 'ไม่สามารถเข้าถึง Spreadsheet ได้: ' + error.toString(),
      action: 'ตรวจสอบ Spreadsheet ID หรือสิทธิ์การเข้าถึง'
    };
  }
}

function createMembersSheet(ss) {
  const sheet = ss.insertSheet('Members');
  sheet.getRange(1, 1, 1, 8).setValues([[
    'member_id', 'name', 'email', 'phone', 'address', 'status', 'created_date', 'updated_date'
  ]]);
  sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
  return sheet;
}

function createInvoicesSheet(ss) {
  const sheet = ss.insertSheet('Invoices');
  sheet.getRange(1, 1, 1, 8).setValues([[
    'invoice_id', 'member_id', 'unit_number', 'description', 'total_amount', 'due_date', 'issue_date', 'status'
  ]]);
  sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
  return sheet;
}

function createPaymentsSheet(ss) {
  const sheet = ss.insertSheet('Payments');
  sheet.getRange(1, 1, 1, 7).setValues([[
    'payment_id', 'invoice_id', 'member_id', 'amount', 'payment_method', 'payment_date', 'notes'
  ]]);
  sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
  return sheet;
}

function createMaintenanceSheet(ss) {
  const sheet = ss.insertSheet('Maintenance');
  sheet.getRange(1, 1, 1, 8).setValues([[
    'maintenance_id', 'equipment_id', 'issue_description', 'status', 'priority', 'created_date', 'completed_date', 'notes'
  ]]);
  sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
  return sheet;
}

function createEquipmentSheet(ss) {
  const sheet = ss.insertSheet('Equipment');
  sheet.getRange(1, 1, 1, 8).setValues([[
    'equipment_id', 'name', 'category', 'description', 'status', 'location', 'created_date', 'updated_date'
  ]]);
  sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
  return sheet;
}

function createBookingsSheet(ss) {
  const sheet = ss.insertSheet('Bookings');
  sheet.getRange(1, 1, 1, 14).setValues([[
    'booking_id', 'member_id', 'borrower_name', 'unit_number', 'phone_number', 
    'equipment_id', 'equipment_name', 'borrow_date', 'due_date', 'return_date', 
    'status', 'purpose', 'notes', 'created_date'
  ]]);
  sheet.getRange(1, 1, 1, 14).setFontWeight('bold');
  return sheet;
}

function createEventsSheet(ss) {
  const sheet = ss.insertSheet('Events');
  sheet.getRange(1, 1, 1, 18).setValues([[
    'event_id', 'title', 'description', 'event_date', 'start_time', 'end_time', 
    'location', 'organizer', 'max_participants', 'current_participants', 
    'registration_fee', 'registration_deadline', 'status', 'category', 
    'requirements', 'created_date', 'updated_date', 'notes'
  ]]);
  sheet.getRange(1, 1, 1, 18).setFontWeight('bold');
  return sheet;
}
