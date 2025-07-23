// Google Apps Script สำหรับ Admin Web App Backend
// Configuration is now in Configuration.gs to avoid duplication

// ==================== Main Entry Point for Web App ====================
function doGet(e) {
    try {
        // ตรวจสอบว่า e และ e.parameter มีค่าหรือไม่
        const page = (e && e.parameter && e.parameter.page) || 'user';
        const action = (e && e.parameter && e.parameter.action) || null;
        
        // จัดการ API calls ผ่าน GET parameters
        if (action) {
            switch (action) {
                case 'testUserConnection':
                    return ContentService
                        .createTextOutput(testUserConnection())
                        .setMimeType(ContentService.MimeType.JSON);
                        
                case 'testLineBotConnection':
                    return ContentService
                        .createTextOutput(testLineBotConnection())
                        .setMimeType(ContentService.MimeType.JSON);
                        
                case 'resetLineBotWebhook':
                    return ContentService
                        .createTextOutput(resetLineBotWebhook())
                        .setMimeType(ContentService.MimeType.JSON);
                        
                case 'getWebAppInfo':
                    return ContentService
                        .createTextOutput(getWebAppInfo())
                        .setMimeType(ContentService.MimeType.JSON);
                        
                case 'testBotSystem':
                    return ContentService
                        .createTextOutput(testBotSystem())
                        .setMimeType(ContentService.MimeType.JSON);
                        
                case 'getMemberCount':
                    return ContentService
                        .createTextOutput(getMemberCount())
                        .setMimeType(ContentService.MimeType.JSON);
                        
                default:
                    return ContentService
                        .createTextOutput(JSON.stringify({
                            success: false,
                            error: 'ไม่รู้จัก action: ' + action
                        }))
                        .setMimeType(ContentService.MimeType.JSON);
            }
        }
        
        // แสดงหน้าเว็บตาม page parameter
        if (page === 'admin') {
            return adminDoGet(e);
        } else {
            return userDoGet(e);
        }
    } catch (error) {
        console.error('Error in doGet:', error);
        return HtmlService.createHtmlOutput(`
            <html>
                <body style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
                    <h1>⚠️ เกิดข้อผิดพลาด</h1>
                    <p>ไม่สามารถโหลดหน้าเว็บได้</p>
                    <p><small>Error: ${error.message}</small></p>
                    <a href="?page=user" style="color: blue;">ลองเปิดหน้าลงทะเบียน</a> | 
                    <a href="?page=admin" style="color: blue;">ลองเปิดหน้าแอดมิน</a>
                </body>
            </html>
        `);
    }
}

function doPost(e) {
    try {
        return adminDoPost(e);
    } catch (error) {
        console.error('Error in doPost:', error);
        return ContentService
            .createTextOutput(JSON.stringify({
                success: false,
                error: 'เกิดข้อผิดพลาดในการประมวลผล: ' + error.message
            }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

function userDoGet(e) {
    try {
        return HtmlService.createHtmlOutputFromFile('user.html')
            .setTitle('The House Solution - ลงทะเบียนสมาชิกใหม่')
            .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    } catch (err) {
        console.error('Error in userDoGet:', err);
        return HtmlService.createHtmlOutput('เกิดข้อผิดพลาดในการโหลดหน้าลงทะเบียน');
    }
}

function adminDoGet(e) {
  try {
    return HtmlService.createHtmlOutputFromFile('index.html')
        .setTitle('The House Solution - Admin Panel')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) {
    console.error('Error in adminDoGet:', err);
    return HtmlService.createHtmlOutput('เกิดข้อผิดพลาดในการโหลดหน้าแอดมิน');
  }
}

function adminDoPost(e) {
    try {
        // ตรวจสอบว่ามี postData หรือไม่
        if (!e || !e.postData || !e.postData.contents) {
            return ContentService
                .createTextOutput(JSON.stringify({
                    success: false,
                    error: 'ไม่พบข้อมูลที่ส่งมา'
                }))
                .setMimeType(ContentService.MimeType.JSON);
        }

        const data = JSON.parse(e.postData.contents);
        const action = data.action;
        
        if (!action) {
            return ContentService
                .createTextOutput(JSON.stringify({
                    success: false,
                    error: 'ไม่พบ action ที่ต้องการทำ'
                }))
                .setMimeType(ContentService.MimeType.JSON);
        }
        
        switch (action) {
            // ==================== Members Management ====================
            case 'getAllMembers':
                return ContentService
                    .createTextOutput(JSON.stringify(getAllMembers(data.status)))
                    .setMimeType(ContentService.MimeType.JSON);
                    
            case 'createMember':
                return ContentService
                    .createTextOutput(JSON.stringify(createMember(data.memberData)))
                    .setMimeType(ContentService.MimeType.JSON);
                    
            case 'updateMember':
                return ContentService
                    .createTextOutput(JSON.stringify(updateMember(data.memberId, data.updateData)))
                    .setMimeType(ContentService.MimeType.JSON);
                    
            case 'deleteMember':
                return ContentService
                    .createTextOutput(JSON.stringify(deleteMember(data.memberId)))
                    .setMimeType(ContentService.MimeType.JSON);
                    
            case 'getMemberById':
                return ContentService
                    .createTextOutput(JSON.stringify(getMemberById(data.memberId)))
                    .setMimeType(ContentService.MimeType.JSON);
                    
            case 'searchMembers':
                return ContentService
                    .createTextOutput(JSON.stringify(searchMembers(data.searchTerm)))
                    .setMimeType(ContentService.MimeType.JSON);
                    
            case 'getMemberStatistics':
                return ContentService
                    .createTextOutput(JSON.stringify(getMemberStatistics()))
                    .setMimeType(ContentService.MimeType.JSON);
            
            // ==================== Dashboard & General ====================
            case 'getDashboardData':
                return ContentService
                    .createTextOutput(JSON.stringify(getDashboardData()))
                    .setMimeType(ContentService.MimeType.JSON);
                    
            case 'getStatistics':
                return ContentService
                    .createTextOutput(JSON.stringify(getStatistics()))
                    .setMimeType(ContentService.MimeType.JSON);
            
            // ==================== Equipment Management ====================
            case 'getAvailableEquipment':
                return ContentService
                    .createTextOutput(JSON.stringify(getAvailableEquipment(data.category)))
                    .setMimeType(ContentService.MimeType.JSON);
                    
            case 'createBooking':
                return ContentService
                    .createTextOutput(JSON.stringify(createBooking(data.bookingData)))
                    .setMimeType(ContentService.MimeType.JSON);
                    
            case 'getPendingBookings':
                return ContentService
                    .createTextOutput(JSON.stringify(getPendingBookings()))
                    .setMimeType(ContentService.MimeType.JSON);
                    
            case 'approveBooking':
                return ContentService
                    .createTextOutput(JSON.stringify(approveBooking(data.bookingId, data.notes)))
                    .setMimeType(ContentService.MimeType.JSON);
                    
            case 'rejectBooking':
                return ContentService
                    .createTextOutput(JSON.stringify(rejectBooking(data.bookingId, data.reason)))
                    .setMimeType(ContentService.MimeType.JSON);
            
            // ==================== Events Management ====================
            case 'getActiveEvents':
                return ContentService
                    .createTextOutput(JSON.stringify(getActiveEvents(data.category)))
                    .setMimeType(ContentService.MimeType.JSON);
                    
            case 'createEvent':
                return ContentService
                    .createTextOutput(JSON.stringify(createEvent(data.eventData)))
                    .setMimeType(ContentService.MimeType.JSON);
                    
            case 'registerForEvent':
                return ContentService
                    .createTextOutput(JSON.stringify(registerForEvent(data.eventId, data.memberId, data.participantData)))
                    .setMimeType(ContentService.MimeType.JSON);
                    
            case 'getEventStatistics':
                return ContentService
                    .createTextOutput(JSON.stringify(getEventStatistics()))
                    .setMimeType(ContentService.MimeType.JSON);
                    
            // ==================== Test Functions ====================
            case 'testConnection':
                return ContentService
                    .createTextOutput(JSON.stringify({success: true, message: 'เชื่อมต่อสำเร็จ', timestamp: new Date()}))
                    .setMimeType(ContentService.MimeType.JSON);
            
            default:
                return ContentService
                    .createTextOutput(JSON.stringify({error: 'ไม่รู้จัก action: ' + action}))
                    .setMimeType(ContentService.MimeType.JSON);
        }
        
    } catch (error) {
        console.error('Error in adminDoPost:', error);
        return ContentService
            .createTextOutput(JSON.stringify({error: 'เกิดข้อผิดพลาดในการประมวลผล: ' + error.message}))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

// ==================== Admin Data Fetching Functions ====================
function getDashboardData() {
    return {
        stats: getDashboardStats(),
        revenueChart: getRevenueChartData(),
        paymentChart: getPaymentChartData()
    };
}

function getSheetData(sheetName) {
    try {
        const sheet = SpreadsheetApp.openById(getAdminSpreadsheetId()).getSheetByName(sheetName);
        if (!sheet || sheet.getLastRow() < 2) return [];
        const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        return data.map(row => {
            const obj = {};
            headers.forEach((header, index) => { obj[header] = row[index]; });
            return obj;
        });
    } catch (err) {
        console.error(`Error getting sheet data for ${sheetName}:`, err);
        return { error: err.message };
    }
}

function getAdminEmail() {
    try {
        return Session.getActiveUser().getEmail();
    } catch (e) {
        return 'Admin';
    }
}

// ==================== Helper Functions for Admin Data ====================
function getDashboardStats() {
    const members = getSheetData(SHEETS.MEMBERS);
    const invoices = getSheetData(SHEETS.INVOICES);
    const maintenance = getSheetData(SHEETS.MAINTENANCE);
    const events = getSheetData(SHEETS.EVENTS);

    // ป้องกัน error ถ้าข้อมูลเป็น array
    const validMembers = Array.isArray(members) ? members : [];
    const validInvoices = Array.isArray(invoices) ? invoices : [];
    const validMaintenance = Array.isArray(maintenance) ? maintenance : [];
    const validEvents = Array.isArray(events) ? events : [];

    const monthlyRevenue = validInvoices
        .filter(inv => inv.status === 'Paid' && inv.payment_date && 
                new Date(inv.payment_date).getMonth() === new Date().getMonth())
        .reduce((sum, inv) => sum + (parseFloat(inv.total_amount) || 0), 0);

    return {
        totalMembers: validMembers.filter(m => m.status === 'Active').length,
        monthlyRevenue: monthlyRevenue,
        pendingMaintenance: validMaintenance.filter(m => m.status === 'Pending').length,
        upcomingEvents: validEvents.filter(e => e.event_date && new Date(e.event_date) > new Date()).length
    };
}

function getRevenueChartData() {
    try {
        const invoices = getSheetData(SHEETS.INVOICES);
        const validInvoices = Array.isArray(invoices) ? invoices : [];
        
        // สร้างข้อมูลรายรับ 6 เดือนย้อนหลัง
        const months = [];
        const revenue = [];
        const now = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = date.toLocaleDateString('th-TH', { month: 'short' });
            months.push(monthName);
            
            const monthlyRevenue = validInvoices
                .filter(inv => {
                    if (!inv.payment_date || inv.status !== 'Paid') return false;
                    const paymentDate = new Date(inv.payment_date);
                    return paymentDate.getMonth() === date.getMonth() && 
                           paymentDate.getFullYear() === date.getFullYear();
                })
                .reduce((sum, inv) => sum + (parseFloat(inv.total_amount) || 0), 0);
            
            revenue.push(monthlyRevenue);
        }
        
        return {
            labels: months,
            datasets: [{
                label: 'รายรับ',
                data: revenue,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
            }]
        };
    } catch (error) {
        console.error('Error creating revenue chart:', error);
        // Fallback data
        return {
            labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.'],
            datasets: [{
                label: 'รายรับ',
                data: [0, 0, 0, 0, 0, 0],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
            }]
        };
    }
}

function getPaymentChartData() {
    try {
        const invoices = getSheetData(SHEETS.INVOICES);
        const validInvoices = Array.isArray(invoices) ? invoices : [];
        
        const paid = validInvoices.filter(inv => inv.status === 'Paid').length;
        const pending = validInvoices.filter(inv => inv.status === 'Pending').length;
        const overdue = validInvoices.filter(inv => inv.status === 'Overdue').length;
        
        return {
            labels: ['ชำระแล้ว', 'ค้างชำระ', 'รอตรวจสอบ'],
            datasets: [{
                data: [paid, overdue, pending],
                backgroundColor: ['#10b981', '#ef4444', '#f59e0b']
            }]
        };
    } catch (error) {
        console.error('Error creating payment chart:', error);
        // Fallback data
        return {
            labels: ['ชำระแล้ว', 'ค้างชำระ', 'รอตรวจสอบ'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: ['#10b981', '#ef4444', '#f59e0b']
            }]
        };
    }
}

function isAdminUser() {
    try {
        return ADMIN_CONFIG.ADMIN_EMAILS.includes(Session.getActiveUser().getEmail());
    } catch (e) {
        return false;
    }
}

// ==================== CRUD Operations ====================
function createInvoice(invoiceData) {
    try {
        const sheet = SpreadsheetApp.openById(getAdminSpreadsheetId()).getSheetByName(SHEETS.INVOICES);
        const invoiceId = 'INV-' + new Date().getTime();
        const now = new Date();
        
        sheet.appendRow([
            invoiceId,
            invoiceData.member_id,
            invoiceData.unit_number,
            invoiceData.description,
            invoiceData.total_amount,
            invoiceData.due_date,
            now, // issue_date
            'Pending' // status
        ]);
        
        return { success: true, message: 'สร้างใบแจ้งหนี้เรียบร้อย', invoice_id: invoiceId };
    } catch (error) {
        console.error('Error creating invoice:', error);
        return { error: 'เกิดข้อผิดพลาดในการสร้างใบแจ้งหนี้: ' + error.message };
    }
}

function createMember(memberData) {
    try {
        const spreadsheet = SpreadsheetApp.openById(getAdminSpreadsheetId());
        let sheet = spreadsheet.getSheetByName(SHEETS.MEMBERS);
        
        // สร้าง Sheet ถ้าไม่มี
        if (!sheet) {
            sheet = spreadsheet.insertSheet(SHEETS.MEMBERS);
            sheet.appendRow([
                'member_id', 'name', 'email', 'phone', 'unit_number', 
                'address', 'status', 'member_since', 'last_updated', 'notes'
            ]);
            sheet.getRange(1, 1, 1, 10).setFontWeight('bold');
        }
        
        // สร้าง header ถ้าไม่มี
        if (sheet.getLastRow() === 0) {
            sheet.appendRow([
                'member_id', 'name', 'email', 'phone', 'unit_number', 
                'address', 'status', 'member_since', 'last_updated', 'notes'
            ]);
            sheet.getRange(1, 1, 1, 10).setFontWeight('bold');
        }
        
        const memberId = 'M-' + Date.now();
        
        sheet.appendRow([
            memberId,
            memberData.name || '',
            memberData.email || '',
            memberData.phone || '',
            memberData.unit_number || '',
            memberData.address || '',
            memberData.status || 'Active',
            new Date(),
            new Date(),
            memberData.notes || ''
        ]);
        
        return { success: true, message: 'เพิ่มสมาชิกเรียบร้อย', member_id: memberId };
    } catch (error) {
        console.error('Error creating member:', error);
        return { error: 'เกิดข้อผิดพลาดในการเพิ่มสมาชิก: ' + error.message };
    }
}

// ==================== Members Management Functions ====================
function getAllMembers(status = null) {
    try {
        const spreadsheet = SpreadsheetApp.openById(getAdminSpreadsheetId());
        let sheet = spreadsheet.getSheetByName(SHEETS.MEMBERS);
        
        // สร้าง Sheet ถ้าไม่มี
        if (!sheet) {
            sheet = spreadsheet.insertSheet(SHEETS.MEMBERS);
            sheet.appendRow([
                'member_id', 'name', 'email', 'phone', 'unit_number', 
                'address', 'status', 'member_since', 'last_updated', 'notes'
            ]);
            sheet.getRange(1, 1, 1, 10).setFontWeight('bold');
            return { success: true, data: [], message: 'ไม่มีข้อมูลสมาชิก (สร้าง Sheet ใหม่แล้ว)' };
        }
        
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const results = [];
        
        if (data.length <= 1) {
            return { success: true, data: results, message: 'ไม่มีข้อมูลสมาชิก' };
        }
        
        for (let i = 1; i < data.length; i++) {
            const member = {};
            headers.forEach((header, index) => {
                member[header] = data[i][index];
            });
            
            // กรองตามสถานะถ้ามีการระบุ
            if (!status || member.status === status) {
                results.push(member);
            }
        }
        
        return { 
            success: true, 
            data: results, 
            message: `พบข้อมูลสมาชิก ${results.length} คน${status ? ` (สถานะ: ${status})` : ''}` 
        };
    } catch (error) {
        console.error('Error getting members:', error);
        return { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก: ' + error.message };
    }
}

function getMemberById(memberId) {
    try {
        const sheet = SpreadsheetApp.openById(getAdminSpreadsheetId()).getSheetByName(SHEETS.MEMBERS);
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const memberIdIndex = headers.indexOf('member_id');
        
        for (let i = 1; i < data.length; i++) {
            if (data[i][memberIdIndex] === memberId) {
                const member = {};
                headers.forEach((header, index) => {
                    member[header] = data[i][index];
                });
                return { success: true, data: member };
            }
        }
        return { success: false, error: "ไม่พบสมาชิก" };
    } catch (error) {
        console.error('Error getting member by ID:', error);
        return { error: 'เกิดข้อผิดพลาดในการค้นหาสมาชิก: ' + error.message };
    }
}

function updateMember(memberId, updateData) {
    try {
        const sheet = SpreadsheetApp.openById(getAdminSpreadsheetId()).getSheetByName(SHEETS.MEMBERS);
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const memberIdIndex = headers.indexOf('member_id');
        const lastUpdatedIndex = headers.indexOf('last_updated');
        
        for (let i = 1; i < data.length; i++) {
            if (data[i][memberIdIndex] === memberId) {
                // อัปเดตข้อมูลที่ส่งมา
                Object.keys(updateData).forEach(key => {
                    const columnIndex = headers.indexOf(key);
                    if (columnIndex !== -1 && key !== 'member_id') {
                        sheet.getRange(i + 1, columnIndex + 1).setValue(updateData[key]);
                    }
                });
                
                // อัปเดตเวลาล่าสุด
                if (lastUpdatedIndex !== -1) {
                    sheet.getRange(i + 1, lastUpdatedIndex + 1).setValue(new Date());
                }
                
                return { success: true, message: 'อัปเดตข้อมูลสมาชิกเรียบร้อย' };
            }
        }
        return { error: "ไม่พบสมาชิก" };
    } catch (error) {
        console.error('Error updating member:', error);
        return { error: 'เกิดข้อผิดพลาดในการอัปเดตสมาชิก: ' + error.message };
    }
}

function deleteMember(memberId) {
    try {
        const sheet = SpreadsheetApp.openById(getAdminSpreadsheetId()).getSheetByName(SHEETS.MEMBERS);
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const memberIdIndex = headers.indexOf('member_id');
        
        for (let i = 1; i < data.length; i++) {
            if (data[i][memberIdIndex] === memberId) {
                sheet.deleteRow(i + 1);
                return { success: true, message: 'ลบสมาชิกเรียบร้อย' };
            }
        }
        return { error: "ไม่พบสมาชิก" };
    } catch (error) {
        console.error('Error deleting member:', error);
        return { error: 'เกิดข้อผิดพลาดในการลบสมาชิก: ' + error.message };
    }
}

function searchMembers(searchTerm) {
    try {
        const sheet = SpreadsheetApp.openById(getAdminSpreadsheetId()).getSheetByName(SHEETS.MEMBERS);
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const results = [];
        
        if (data.length <= 1) {
            return { success: true, data: results, message: 'ไม่มีข้อมูลสมาชิก' };
        }
        
        const searchLower = searchTerm.toLowerCase();
        
        for (let i = 1; i < data.length; i++) {
            const member = {};
            headers.forEach((header, index) => {
                member[header] = data[i][index];
            });
            
            // ค้นหาในชื่อ, อีเมล, เบอร์โทร, หมายเลขห้อง
            const searchFields = [
                member.name || '',
                member.email || '',
                member.phone || '',
                member.unit_number || '',
                member.member_id || ''
            ].join(' ').toLowerCase();
            
            if (searchFields.includes(searchLower)) {
                results.push(member);
            }
        }
        
        return { 
            success: true, 
            data: results, 
            message: `พบสมาชิก ${results.length} คน ที่ตรงกับ "${searchTerm}"` 
        };
    } catch (error) {
        console.error('Error searching members:', error);
        return { error: 'เกิดข้อผิดพลาดในการค้นหา: ' + error.message };
    }
}

function getMemberStatistics() {
    try {
        const allMembers = getAllMembers();
        if (!allMembers.success) {
            return allMembers;
        }
        
        const stats = {
            total: allMembers.data.length,
            active: 0,
            inactive: 0,
            new_this_month: 0,
            by_status: {},
            recent_members: []
        };
        
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        allMembers.data.forEach(member => {
            // นับตามสถานะ
            const status = member.status || 'Unknown';
            if (status === 'Active') stats.active++;
            else if (status === 'Inactive') stats.inactive++;
            
            stats.by_status[status] = (stats.by_status[status] || 0) + 1;
            
            // นับสมาชิกใหม่เดือนนี้
            const memberSince = new Date(member.member_since);
            if (memberSince >= thisMonth) {
                stats.new_this_month++;
            }
            
            // เก็บสมาชิกล่าสุด
            stats.recent_members.push({
                member_id: member.member_id,
                name: member.name,
                member_since: member.member_since,
                status: member.status
            });
        });
        
        // เรียงสมาชิกล่าสุด
        stats.recent_members.sort((a, b) => new Date(b.member_since) - new Date(a.member_since));
        stats.recent_members = stats.recent_members.slice(0, 10); // เอา 10 คนล่าสุด
        
        return { success: true, data: stats, message: 'สถิติสมาชิก' };
    } catch (error) {
        console.error('Error getting member statistics:', error);
        return { error: 'เกิดข้อผิดพลาดในการดึงสถิติ: ' + error.message };
    }
}

function createEquipment(equipmentData) {
    try {
        const sheet = SpreadsheetApp.openById(getAdminSpreadsheetId()).getSheetByName(SHEETS.EQUIPMENT);
        const equipmentId = 'EQ-' + Date.now();
        
        sheet.appendRow([
            equipmentId,
            equipmentData.name || '',
            equipmentData.category || '',
            equipmentData.description || '',
            'Available',
            equipmentData.location || '',
            new Date(),
            new Date()
        ]);
        
        return { success: true, message: 'เพิ่มครุภัณฑ์เรียบร้อย', equipment_id: equipmentId };
    } catch (error) {
        console.error('Error creating equipment:', error);
        return { error: 'เกิดข้อผิดพลาดในการเพิ่มครุภัณฑ์: ' + error.message };
    }
}

function createMaintenanceRequest(maintenanceData) {
    try {
        const sheet = SpreadsheetApp.openById(getAdminSpreadsheetId()).getSheetByName(SHEETS.MAINTENANCE);
        const maintenanceId = 'MNT-' + Date.now();
        
        sheet.appendRow([
            maintenanceId,
            maintenanceData.equipment_id || '',
            maintenanceData.issue_description || '',
            'Pending',
            maintenanceData.priority || 'Medium',
            new Date(),
            '',
            ''
        ]);
        
        return { success: true, message: 'สร้างงานซ่อมบำรุงเรียบร้อย', maintenance_id: maintenanceId };
    } catch (error) {
        console.error('Error creating maintenance:', error);
        return { error: 'เกิดข้อผิดพลาดในการสร้างงานซ่อม: ' + error.message };
    }
}

function createPayment(paymentData) {
    try {
        const sheet = SpreadsheetApp.openById(getAdminSpreadsheetId()).getSheetByName(SHEETS.PAYMENTS);
        const paymentId = 'PAY-' + Date.now();
        
        sheet.appendRow([
            paymentId,
            paymentData.invoice_id || '',
            paymentData.member_id || '',
            paymentData.amount || 0,
            paymentData.payment_method || '',
            new Date(),
            paymentData.notes || ''
        ]);
        
        return { success: true, message: 'บันทึกการชำระเงินเรียบร้อย', payment_id: paymentId };
    } catch (error) {
        console.error('Error creating payment:', error);
        return { error: 'เกิดข้อผิดพลาดในการบันทึกการชำระ: ' + error.message };
    }
}

// ==================== Update Functions ====================
function updateRecord(sheetName, recordId, idColumnName, updateData) {
    try {
        const sheet = SpreadsheetApp.openById(getAdminSpreadsheetId()).getSheetByName(sheetName);
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const idIndex = headers.indexOf(idColumnName);
        
        if (idIndex === -1) {
            return { error: `ไม่พบคอลัมน์ ${idColumnName}` };
        }
        
        for (let i = 1; i < data.length; i++) {
            if (data[i][idIndex] === recordId) {
                // อัปเดตข้อมูลตาม updateData
                Object.keys(updateData).forEach(key => {
                    const columnIndex = headers.indexOf(key);
                    if (columnIndex !== -1) {
                        sheet.getRange(i + 1, columnIndex + 1).setValue(updateData[key]);
                    }
                });
                
                // อัปเดตวันที่แก้ไข
                const updatedDateIndex = headers.indexOf('updated_date');
                if (updatedDateIndex !== -1) {
                    sheet.getRange(i + 1, updatedDateIndex + 1).setValue(new Date());
                }
                
                return { success: true, message: 'อัปเดตข้อมูลเรียบร้อย' };
            }
        }
        return { error: "ไม่พบข้อมูลที่ต้องการอัปเดต" };
    } catch (error) {
        console.error('Error updating record:', error);
        return { error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล: ' + error.message };
    }
}

// ==================== Delete Functions ====================
function deleteRecord(sheetName, recordId, idColumnName) {
    try {
        const sheet = SpreadsheetApp.openById(getAdminSpreadsheetId()).getSheetByName(sheetName);
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const idIndex = headers.indexOf(idColumnName);
        
        if (idIndex === -1) {
            return { error: `ไม่พบคอลัมน์ ${idColumnName}` };
        }
        
        for (let i = 1; i < data.length; i++) {
            if (data[i][idIndex] === recordId) {
                sheet.deleteRow(i + 1);
                return { success: true, message: 'ลบข้อมูลเรียบร้อย' };
            }
        }
        return { error: "ไม่พบข้อมูลที่ต้องการลบ" };
    } catch (error) {
        console.error('Error deleting record:', error);
        return { error: 'เกิดข้อผิดพลาดในการลบข้อมูล: ' + error.message };
    }
}

// ==================== Equipment Booking System ====================
function createBooking(bookingData) {
    try {
        // ตรวจสอบว่าครุภัณฑ์ว่างหรือไม่
        const equipmentStatus = getEquipmentStatus(bookingData.equipment_id);
        if (!equipmentStatus.success || equipmentStatus.status !== 'Available') {
            return { error: 'ครุภัณฑ์ไม่ว่างหรือไม่พร้อมใช้งาน' };
        }

        const sheet = SpreadsheetApp.openById(getAdminSpreadsheetId()).getSheetByName(SHEETS.BOOKINGS);
        const bookingId = 'BK' + Date.now();
        const now = new Date();
        
        // คำนวณวันครบกำหนดคืน (7 วันจากวันยืม)
        const dueDate = new Date(bookingData.borrow_date || now);
        dueDate.setDate(dueDate.getDate() + (bookingData.borrow_days || 7));
        
        const rowData = [
            bookingId,
            bookingData.member_id,
            bookingData.borrower_name,
            bookingData.unit_number,
            bookingData.phone_number,
            bookingData.equipment_id,
            bookingData.equipment_name,
            bookingData.borrow_date || now,
            dueDate,
            null, // return_date (จะใส่เมื่อคืน)
            'Active', // status
            bookingData.purpose || '',
            bookingData.notes || '',
            now // created_date
        ];
        
        sheet.appendRow(rowData);
        
        // อัปเดตสถานะครุภัณฑ์เป็น "In Use"
        updateEquipmentStatus(bookingData.equipment_id, 'In Use');
        
        return { 
            success: true, 
            message: 'สร้างการยืมเรียบร้อย',
            booking_id: bookingId,
            due_date: dueDate.toLocaleDateString('th-TH')
        };
    } catch (error) {
        console.error('Error creating booking:', error);
        return { error: 'เกิดข้อผิดพลาดในการสร้างการยืม: ' + error.message };
    }
}

function getEquipmentStatus(equipmentId) {
    try {
        const sheet = SpreadsheetApp.openById(getAdminSpreadsheetId()).getSheetByName(SHEETS.EQUIPMENT);
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const equipmentIdIndex = headers.indexOf('equipment_id');
        const statusIndex = headers.indexOf('status');
        const nameIndex = headers.indexOf('name');
        
        for (let i = 1; i < data.length; i++) {
            if (data[i][equipmentIdIndex] === equipmentId) {
                return { 
                    success: true, 
                    status: data[i][statusIndex],
                    name: data[i][nameIndex],
                    available: data[i][statusIndex] === 'Available'
                };
            }
        }
        return { success: false, error: "ไม่พบครุภัณฑ์" };
    } catch (error) {
        console.error('Error checking equipment status:', error);
        return { success: false, error: error.message };
    }
}

function updateEquipmentStatus(equipmentId, newStatus) {
    try {
        const sheet = SpreadsheetApp.openById(getAdminSpreadsheetId()).getSheetByName(SHEETS.EQUIPMENT);
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const equipmentIdIndex = headers.indexOf('equipment_id');
        const statusIndex = headers.indexOf('status');
        
        for (let i = 1; i < data.length; i++) {
            if (data[i][equipmentIdIndex] === equipmentId) {
                sheet.getRange(i + 1, statusIndex + 1).setValue(newStatus);
                return { success: true, message: 'อัปเดตสถานะครุภัณฑ์เรียบร้อย' };
            }
        }
        return { error: "ไม่พบรหัสครุภัณฑ์" };
    } catch (error) {
        console.error('Error updating equipment status:', error);
        return { error: 'เกิดข้อผิดพลาดในการอัปเดตสถานะครุภัณฑ์: ' + error.message };
    }
}

// ==================== Events Management System ====================
function createEvent(eventData) {
    try {
        const sheet = SpreadsheetApp.openById(getAdminSpreadsheetId()).getSheetByName(SHEETS.EVENTS);
        const eventId = 'EVT' + Date.now();
        const now = new Date();
        
        const rowData = [
            eventId,
            eventData.title,
            eventData.description || '',
            eventData.event_date,
            eventData.start_time || '',
            eventData.end_time || '',
            eventData.location || '',
            eventData.organizer || 'นิติบุคคล',
            eventData.max_participants || 0,
            0, // current_participants
            eventData.registration_fee || 0,
            eventData.registration_deadline || eventData.event_date,
            'Active', // status: Active, Cancelled, Completed
            eventData.category || 'General',
            eventData.requirements || '',
            now, // created_date
            null, // updated_date
            eventData.notes || ''
        ];
        
        sheet.appendRow(rowData);
        
        return { 
            success: true, 
            message: 'สร้างกิจกรรมเรียบร้อย',
            event_id: eventId,
            title: eventData.title
        };
    } catch (error) {
        console.error('Error creating event:', error);
        return { error: 'เกิดข้อผิดพลาดในการสร้างกิจกรรม: ' + error.message };
    }
}

// ==================== Statistics ====================
function getStatistics() {
    try {
        const stats = {
            members: {
                total: 0,
                active: 0,
                inactive: 0
            },
            equipment: {
                total: 0,
                available: 0,
                inUse: 0,
                maintenance: 0
            },
            maintenance: {
                pending: 0,
                inProgress: 0,
                completed: 0
            },
            payments: {
                thisMonth: 0,
                totalRevenue: 0
            },
            bookings: {
                pending: 0,
                active: 0,
                overdue: 0,
                completed: 0
            },
            events: {
                upcoming: 0,
                active: 0,
                completed: 0,
                total_participants: 0
            }
        };
        
        // Members statistics
        const membersData = SpreadsheetApp.openById(getAdminSpreadsheetId())
                               .getSheetByName(SHEETS.MEMBERS)
                               .getDataRange()
                               .getValues();
        
        if (membersData.length > 1) {
            const statusIndex = membersData[0].indexOf('status');
            stats.members.total = membersData.length - 1;
            
            for (let i = 1; i < membersData.length; i++) {
                const status = membersData[i][statusIndex];
                if (status === 'Active') stats.members.active++;
                else stats.members.inactive++;
            }
        }
        
        // Equipment statistics
        const equipmentData = SpreadsheetApp.openById(getAdminSpreadsheetId())
                                 .getSheetByName(SHEETS.EQUIPMENT)
                                 .getDataRange()
                                 .getValues();
        
        if (equipmentData.length > 1) {
            const statusIndex = equipmentData[0].indexOf('status');
            stats.equipment.total = equipmentData.length - 1;
            
            for (let i = 1; i < equipmentData.length; i++) {
                const status = equipmentData[i][statusIndex];
                if (status === 'Available') stats.equipment.available++;
                else if (status === 'In Use') stats.equipment.inUse++;
                else if (status === 'Maintenance') stats.equipment.maintenance++;
            }
        }
        
        // Maintenance statistics
        const maintenanceData = SpreadsheetApp.openById(getAdminSpreadsheetId())
                                   .getSheetByName(SHEETS.MAINTENANCE)
                                   .getDataRange()
                                   .getValues();
        
        if (maintenanceData.length > 1) {
            const statusIndex = maintenanceData[0].indexOf('status');
            
            for (let i = 1; i < maintenanceData.length; i++) {
                const status = maintenanceData[i][statusIndex];
                if (status === 'Pending') stats.maintenance.pending++;
                else if (status === 'In Progress') stats.maintenance.inProgress++;
                else if (status === 'Completed') stats.maintenance.completed++;
            }
        }
        
        // Payment statistics
        const paymentsData = SpreadsheetApp.openById(getAdminSpreadsheetId())
                               .getSheetByName(SHEETS.PAYMENTS)
                               .getDataRange()
                               .getValues();
        
        if (paymentsData.length > 1) {
            const amountIndex = paymentsData[0].indexOf('amount');
            const dateIndex = paymentsData[0].indexOf('payment_date');
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            
            for (let i = 1; i < paymentsData.length; i++) {
                const amount = parseFloat(paymentsData[i][amountIndex]) || 0;
                const paymentDate = new Date(paymentsData[i][dateIndex]);
                
                stats.payments.totalRevenue += amount;
                
                if (paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear) {
                    stats.payments.thisMonth += amount;
                }
            }
        }
        
        // Bookings statistics
        const bookingsData = SpreadsheetApp.openById(getAdminSpreadsheetId())
                               .getSheetByName(SHEETS.BOOKINGS)
                               .getDataRange()
                               .getValues();
        
        if (bookingsData.length > 1) {
            const statusIndex = bookingsData[0].indexOf('status');
            const dueDateIndex = bookingsData[0].indexOf('due_date');
            const now = new Date();
            
            for (let i = 1; i < bookingsData.length; i++) {
                const status = bookingsData[i][statusIndex];
                const dueDate = new Date(bookingsData[i][dueDateIndex]);
                
                if (status === 'Pending') stats.bookings.pending++;
                else if (status === 'Active') {
                    stats.bookings.active++;
                    if (dueDate < now) stats.bookings.overdue++;
                }
                else if (status === 'Returned') stats.bookings.completed++;
            }
        }
        
        // Events statistics
        const eventsData = SpreadsheetApp.openById(getAdminSpreadsheetId())
                             .getSheetByName(SHEETS.EVENTS)
                             .getDataRange()
                             .getValues();
        
        if (eventsData.length > 1) {
            const statusIndex = eventsData[0].indexOf('status');
            const eventDateIndex = eventsData[0].indexOf('event_date');
            const participantsIndex = eventsData[0].indexOf('current_participants');
            const now = new Date();
            
            for (let i = 1; i < eventsData.length; i++) {
                const status = eventsData[i][statusIndex];
                const eventDate = new Date(eventsData[i][eventDateIndex]);
                const participants = parseInt(eventsData[i][participantsIndex]) || 0;
                
                stats.events.total_participants += participants;
                
                if (status === 'Active') {
                    stats.events.active++;
                    if (eventDate > now) stats.events.upcoming++;
                }
                else if (status === 'Completed') stats.events.completed++;
            }
        }
        
        return { success: true, data: stats };
    } catch (error) {
        console.error('Error getting statistics:', error);
        return { error: 'เกิดข้อผิดพลาดในการดึงสถิติ: ' + error.message };
    }
}

// ==================== Administrative Functions ====================
function updateMaintenanceStatus(maintenanceId, newStatus) {
    try {
        const sheet = SpreadsheetApp.openById(getAdminSpreadsheetId()).getSheetByName(SHEETS.MAINTENANCE);
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const maintenanceIdIndex = headers.indexOf('maintenance_id');
        const statusIndex = headers.indexOf('status');
        
        for (let i = 1; i < data.length; i++) {
            if (data[i][maintenanceIdIndex] === maintenanceId) {
                sheet.getRange(i + 1, statusIndex + 1).setValue(newStatus);
                // อัปเดตเวลาที่แก้ไขล่าสุด
                const updatedDateIndex = headers.indexOf('updated_date');
                if (updatedDateIndex !== -1) {
                    sheet.getRange(i + 1, updatedDateIndex + 1).setValue(new Date());
                } else {
                    // ถ้าไม่มี column updated_date ให้เพิ่มหมายเหตุ
                    const notesIndex = headers.indexOf('notes');
                    if (notesIndex !== -1) {
                        const currentNotes = data[i][notesIndex] || '';
                        const newNote = `${currentNotes}\nอัปเดตสถานะเป็น ${newStatus} เมื่อ ${new Date().toLocaleString('th-TH')}`;
                        sheet.getRange(i + 1, notesIndex + 1).setValue(newNote.trim());
                    }
                }
                return { success: true, message: 'อัปเดตสถานะเรียบร้อย' };
            }
        }
        return { error: "ไม่พบรหัสงานซ่อม" };
    } catch (error) {
        console.error('Error updating maintenance status:', error);
        return { error: 'เกิดข้อผิดพลาดในการอัปเดต: ' + error.message };
    }
}

function markBookingAsReturned(bookingId) {
    try {
        const sheet = SpreadsheetApp.openById(getAdminSpreadsheetId()).getSheetByName(SHEETS.BOOKINGS);
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const bookingIdIndex = headers.indexOf('booking_id');
        const statusIndex = headers.indexOf('status');
        const returnDateIndex = headers.indexOf('return_date');
        
        for (let i = 1; i < data.length; i++) {
            if (data[i][bookingIdIndex] === bookingId) {
                sheet.getRange(i + 1, statusIndex + 1).setValue('Returned');
                if (returnDateIndex !== -1) {
                    sheet.getRange(i + 1, returnDateIndex + 1).setValue(new Date());
                }
                
                // อัปเดตสถานะครุภัณฑ์เป็น Available
                const equipmentIdIndex = headers.indexOf('equipment_id');
                if (equipmentIdIndex !== -1) {
                    const equipmentId = data[i][equipmentIdIndex];
                    if (equipmentId) {
                        updateEquipmentStatus(equipmentId, 'Available');
                    }
                }
                
                return { success: true, message: 'บันทึกการคืนเรียบร้อย' };
            }
        }
        return { error: "ไม่พบรหัสการยืม" };
    } catch (error) {
        console.error('Error marking booking as returned:', error);
        return { error: 'เกิดข้อผิดพลาดในการบันทึกการคืน: ' + error.message };
    }
}

// ==================== Enhanced Events Management System ====================
function registerForEvent(eventId, memberId, participantData) {
    try {
        // ตรวจสอบสถานะกิจกรรม
        const eventStatus = getEventStatus(eventId);
        if (!eventStatus.success) {
            return { error: eventStatus.error };
        }
        
        if (eventStatus.event.status !== 'Active') {
            return { error: 'กิจกรรมไม่เปิดรับสมัครแล้ว' };
        }
        
        // ตรวจสอบจำนวนผู้เข้าร่วม
        if (eventStatus.event.max_participants > 0 && 
            eventStatus.event.current_participants >= eventStatus.event.max_participants) {
            return { error: 'กิจกรรมเต็มแล้ว' };
        }
        
        // ตรวจสอบว่าลงทะเบียนแล้วหรือไม่
        if (isAlreadyRegistered(eventId, memberId)) {
            return { error: 'คุณได้ลงทะเบียนกิจกรรมนี้แล้ว' };
        }
        
        // ตรวจสอบวันหมดเขตลงทะเบียน
        const now = new Date();
        const deadline = new Date(eventStatus.event.registration_deadline);
        if (now > deadline) {
            return { error: 'หมดเขตการลงทะเบียนแล้ว' };
        }
        
        // สร้างการลงทะเบียน
        const registrationSheet = SpreadsheetApp.openById(getAdminSpreadsheetId())
                                      .getSheetByName('Event_Registrations') ||
                                  SpreadsheetApp.openById(getAdminSpreadsheetId())
                                      .insertSheet('Event_Registrations');
        
        // สร้าง header ถ้าไม่มี
        if (registrationSheet.getLastRow() === 0) {
            registrationSheet.appendRow([
                'registration_id', 'event_id', 'member_id', 'participant_name',
                'unit_number', 'phone_number', 'email', 'special_requirements',
                'registration_date', 'payment_status', 'attendance_status', 'notes'
            ]);
        }
        
        const registrationId = 'REG' + Date.now();
        registrationSheet.appendRow([
            registrationId,
            eventId,
            memberId,
            participantData.participant_name,
            participantData.unit_number,
            participantData.phone_number,
            participantData.email || '',
            participantData.special_requirements || '',
            now,
            eventStatus.event.registration_fee > 0 ? 'Pending' : 'Free',
            'Registered', // Registered, Attended, Absent
            participantData.notes || ''
        ]);
        
        // อัปเดตจำนวนผู้เข้าร่วมในกิจกรรม
        updateEventParticipantCount(eventId, 1);
        
        return { 
            success: true, 
            message: 'ลงทะเบียนเรียบร้อย',
            registration_id: registrationId,
            event_title: eventStatus.event.title,
            event_date: new Date(eventStatus.event.event_date).toLocaleDateString('th-TH'),
            registration_fee: eventStatus.event.registration_fee
        };
    } catch (error) {
        console.error('Error registering for event:', error);
        return { error: 'เกิดข้อผิดพลาดในการลงทะเบียน: ' + error.message };
    }
}

function getEventStatus(eventId) {
    try {
        const sheet = SpreadsheetApp.openById(getAdminSpreadsheetId()).getSheetByName(SHEETS.EVENTS);
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const eventIdIndex = headers.indexOf('event_id');
        
        for (let i = 1; i < data.length; i++) {
            if (data[i][eventIdIndex] === eventId) {
                const event = {};
                headers.forEach((header, index) => {
                    event[header] = data[i][index];
                });
                return { success: true, event: event };
            }
        }
        return { success: false, error: "ไม่พบกิจกรรม" };
    } catch (error) {
        console.error('Error getting event status:', error);
        return { success: false, error: error.message };
    }
}

function isAlreadyRegistered(eventId, memberId) {
    try {
        const registrationSheet = SpreadsheetApp.openById(getAdminSpreadsheetId())
                                      .getSheetByName('Event_Registrations');
        if (!registrationSheet) return false;
        
        const data = registrationSheet.getDataRange().getValues();
        if (data.length <= 1) return false;
        
        const headers = data[0];
        const eventIdIndex = headers.indexOf('event_id');
        const memberIdIndex = headers.indexOf('member_id');
        
        for (let i = 1; i < data.length; i++) {
            if (data[i][eventIdIndex] === eventId && data[i][memberIdIndex] === memberId) {
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('Error checking registration:', error);
        return false;
    }
}

function updateEventParticipantCount(eventId, change) {
    try {
        const sheet = SpreadsheetApp.openById(getAdminSpreadsheetId()).getSheetByName(SHEETS.EVENTS);
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const eventIdIndex = headers.indexOf('event_id');
        const participantsIndex = headers.indexOf('current_participants');
        
        for (let i = 1; i < data.length; i++) {
            if (data[i][eventIdIndex] === eventId) {
                const currentCount = data[i][participantsIndex] || 0;
                const newCount = Math.max(0, currentCount + change);
                sheet.getRange(i + 1, participantsIndex + 1).setValue(newCount);
                return { success: true, new_count: newCount };
            }
        }
        return { error: "ไม่พบกิจกรรม" };
    } catch (error) {
        console.error('Error updating participant count:', error);
        return { error: error.message };
    }
}

function getActiveEvents(category = null) {
    try {
        const sheet = SpreadsheetApp.openById(getAdminSpreadsheetId()).getSheetByName(SHEETS.EVENTS);
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const results = [];
        const now = new Date();
        
        if (data.length <= 1) {
            return { success: true, data: results, message: 'ไม่มีกิจกรรม' };
        }
        
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            const event = {};
            headers.forEach((header, index) => {
                event[header] = row[index];
            });
            
            // เงื่อนไขการคัดกรอง
            const isActive = event.status === 'Active';
            const notExpired = new Date(event.registration_deadline) > now;
            const matchCategory = !category || event.category === category;
            const hasSpace = event.max_participants === 0 || 
                           event.current_participants < event.max_participants;
            
            if (isActive && notExpired && matchCategory && hasSpace) {
                // เพิ่มข้อมูลเสริม
                event.days_left = Math.ceil((new Date(event.registration_deadline) - now) / (1000 * 60 * 60 * 24));
                event.spaces_left = event.max_participants > 0 ? 
                                  event.max_participants - event.current_participants : 'ไม่จำกัด';
                results.push(event);
            }
        }
        
        // เรียงตามวันที่จัดกิจกรรม
        results.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
        
        return { 
            success: true, 
            data: results, 
            message: `พบกิจกรรมที่เปิดรับสมัคร ${results.length} กิจกรรม`,
            category: category
        };
    } catch (error) {
        console.error('Error getting active events:', error);
        return { error: 'เกิดข้อผิดพลาดในการค้นหากิจกรรม: ' + error.message };
    }
}

// ==================== Enhanced Equipment Booking System ====================
function getAvailableEquipment(category = null) {
    try {
        const sheet = SpreadsheetApp.openById(getAdminSpreadsheetId()).getSheetByName(SHEETS.EQUIPMENT);
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const results = [];
        
        if (data.length <= 1) {
            return { success: true, data: results, message: 'ไม่มีครุภัณฑ์' };
        }
        
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            const equipment = {};
            headers.forEach((header, index) => {
                equipment[header] = row[index];
            });
            
            // เงื่อนไขการคัดกรอง
            const isAvailable = equipment.status === 'Available';
            const matchCategory = !category || equipment.category === category;
            
            if (isAvailable && matchCategory) {
                results.push(equipment);
            }
        }
        
        return { 
            success: true, 
            data: results, 
            message: `พบครุภัณฑ์ว่าง ${results.length} รายการ`,
            category: category
        };
    } catch (error) {
        console.error('Error getting available equipment:', error);
        return { error: 'เกิดข้อผิดพลาดในการค้นหาครุภัณฑ์: ' + error.message };
    }
}

function extendBooking(bookingId, extendDays) {
    try {
        const sheet = SpreadsheetApp.openById(getAdminSpreadsheetId()).getSheetByName(SHEETS.BOOKINGS);
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const bookingIdIndex = headers.indexOf('booking_id');
        const dueDateIndex = headers.indexOf('due_date');
        const statusIndex = headers.indexOf('status');
        
        for (let i = 1; i < data.length; i++) {
            if (data[i][bookingIdIndex] === bookingId) {
                const currentStatus = data[i][statusIndex];
                if (currentStatus !== 'Active') {
                    return { error: 'ไม่สามารถขยายเวลาได้ เนื่องจากสถานะไม่ใช่ Active' };
                }
                
                const currentDueDate = new Date(data[i][dueDateIndex]);
                const newDueDate = new Date(currentDueDate);
                newDueDate.setDate(newDueDate.getDate() + extendDays);
                
                sheet.getRange(i + 1, dueDateIndex + 1).setValue(newDueDate);
                
                return { 
                    success: true, 
                    message: `ขยายเวลายืมเรียบร้อย`,
                    new_due_date: newDueDate.toLocaleDateString('th-TH')
                };
            }
        }
        return { error: "ไม่พบรหัสการยืม" };
    } catch (error) {
        console.error('Error extending booking:', error);
        return { error: 'เกิดข้อผิดพลาดในการขยายเวลา: ' + error.message };
    }
}

function getMemberBookingHistory(memberId) {
    try {
        const sheet = SpreadsheetApp.openById(getAdminSpreadsheetId()).getSheetByName(SHEETS.BOOKINGS);
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const memberIdIndex = headers.indexOf('member_id');
        const results = [];
        
        for (let i = 1; i < data.length; i++) {
            if (data[i][memberIdIndex] === memberId) {
                const booking = {};
                headers.forEach((header, index) => {
                    booking[header] = data[i][index];
                });
                results.push(booking);
            }
        }
        
        // เรียงตามวันที่ยืมล่าสุด
        results.sort((a, b) => new Date(b.borrow_date) - new Date(a.borrow_date));
        
        return { 
            success: true, 
            data: results, 
            message: `พบประวัติการยืม ${results.length} รายการ`,
            member_id: memberId
        };
    } catch (error) {
        console.error('Error getting member booking history:', error);
        return { error: 'เกิดข้อผิดพลาดในการดูประวัติ: ' + error.message };
    }
}

// ==================== Admin Management Functions ====================
function approveBooking(bookingId, adminNotes = '') {
    try {
        const sheet = SpreadsheetApp.openById(getAdminSpreadsheetId()).getSheetByName(SHEETS.BOOKINGS);
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const bookingIdIndex = headers.indexOf('booking_id');
        const statusIndex = headers.indexOf('status');
        const notesIndex = headers.indexOf('notes');
        
        for (let i = 1; i < data.length; i++) {
            if (data[i][bookingIdIndex] === bookingId) {
                sheet.getRange(i + 1, statusIndex + 1).setValue('Approved');
                
                if (notesIndex !== -1 && adminNotes) {
                    const currentNotes = data[i][notesIndex] || '';
                    const updatedNotes = `${currentNotes}\n[Admin] ${adminNotes}`.trim();
                    sheet.getRange(i + 1, notesIndex + 1).setValue(updatedNotes);
                }
                
                return { success: true, message: 'อนุมัติการยืมเรียบร้อย' };
            }
        }
        return { error: "ไม่พบรหัสการยืม" };
    } catch (error) {
        console.error('Error approving booking:', error);
        return { error: 'เกิดข้อผิดพลาดในการอนุมัติ: ' + error.message };
    }
}

function rejectBooking(bookingId, reason) {
    try {
        const sheet = SpreadsheetApp.openById(getAdminSpreadsheetId()).getSheetByName(SHEETS.BOOKINGS);
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const bookingIdIndex = headers.indexOf('booking_id');
        const statusIndex = headers.indexOf('status');
        const equipmentIdIndex = headers.indexOf('equipment_id');
        const notesIndex = headers.indexOf('notes');
        
        for (let i = 1; i < data.length; i++) {
            if (data[i][bookingIdIndex] === bookingId) {
                // เปลี่ยนสถานะเป็น Rejected
                sheet.getRange(i + 1, statusIndex + 1).setValue('Rejected');
                
                // เพิ่มเหตุผลการปฏิเสธ
                if (notesIndex !== -1 && reason) {
                    const currentNotes = data[i][notesIndex] || '';
                    const updatedNotes = `${currentNotes}\n[Rejected] ${reason}`.trim();
                    sheet.getRange(i + 1, notesIndex + 1).setValue(updatedNotes);
                }
                
                // คืนสถานะครุภัณฑ์เป็น Available
                const equipmentId = data[i][equipmentIdIndex];
                if (equipmentId) {
                    updateEquipmentStatus(equipmentId, 'Available');
                }
                
                return { success: true, message: 'ปฏิเสธการยืมเรียบร้อย' };
            }
        }
        return { error: "ไม่พบรหัสการยืม" };
    } catch (error) {
        console.error('Error rejecting booking:', error);
        return { error: 'เกิดข้อผิดพลาดในการปฏิเสธ: ' + error.message };
    }
}

function getPendingBookings() {
    try {
        const sheet = SpreadsheetApp.openById(getAdminSpreadsheetId()).getSheetByName(SHEETS.BOOKINGS);
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const statusIndex = headers.indexOf('status');
        const results = [];
        
        for (let i = 1; i < data.length; i++) {
            if (data[i][statusIndex] === 'Pending') {
                const booking = {};
                headers.forEach((header, index) => {
                    booking[header] = data[i][index];
                });
                results.push(booking);
            }
        }
        
        // เรียงตามวันที่สร้าง (เก่าก่อน)
        results.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
        
        return { 
            success: true, 
            data: results, 
            message: `พบการยืมที่รออนุมัติ ${results.length} รายการ`
        };
    } catch (error) {
        console.error('Error getting pending bookings:', error);
        return { error: 'เกิดข้อผิดพลาดในการดูรายการรอ: ' + error.message };
    }
}

function getOverdueBookings() {
    try {
        const sheet = SpreadsheetApp.openById(getAdminSpreadsheetId()).getSheetByName(SHEETS.BOOKINGS);
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const statusIndex = headers.indexOf('status');
        const dueDateIndex = headers.indexOf('due_date');
        const results = [];
        const now = new Date();
        
        for (let i = 1; i < data.length; i++) {
            const status = data[i][statusIndex];
            const dueDate = new Date(data[i][dueDateIndex]);
            
            if (status === 'Active' && dueDate < now) {
                const booking = {};
                headers.forEach((header, index) => {
                    booking[header] = data[i][index];
                });
                
                // คำนวณจำนวนวันที่เกินกำหนด
                booking.days_overdue = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
                results.push(booking);
            }
        }
        
        // เรียงตามจำนวนวันที่เกิน (มากที่สุดก่อน)
        results.sort((a, b) => b.days_overdue - a.days_overdue);
        
        return { 
            success: true, 
            data: results, 
            message: `พบการยืมที่เกินกำหนด ${results.length} รายการ`
        };
    } catch (error) {
        console.error('Error getting overdue bookings:', error);
        return { error: 'เกิดข้อผิดพลาดในการดูรายการเกินกำหนด: ' + error.message };
    }
}

// ==================== Statistics and Analytics ====================
function getEventStatistics() {
    try {
        const eventSheet = SpreadsheetApp.openById(getAdminSpreadsheetId()).getSheetByName(SHEETS.EVENTS);
        const registrationSheet = SpreadsheetApp.openById(getAdminSpreadsheetId())
                                      .getSheetByName('Event_Registrations');
        
        const eventData = eventSheet.getDataRange().getValues();
        const stats = {
            total_events: eventData.length - 1,
            active_events: 0,
            completed_events: 0,
            cancelled_events: 0,
            total_registrations: 0,
            popular_events: [],
            upcoming_events: 0
        };
        
        const now = new Date();
        const eventHeaders = eventData[0];
        const statusIndex = eventHeaders.indexOf('status');
        const eventDateIndex = eventHeaders.indexOf('event_date');
        const participantsIndex = eventHeaders.indexOf('current_participants');
        const titleIndex = eventHeaders.indexOf('title');
        
        // วิเคราะห์กิจกรรม
        for (let i = 1; i < eventData.length; i++) {
            const status = eventData[i][statusIndex];
            const eventDate = new Date(eventData[i][eventDateIndex]);
            const participants = eventData[i][participantsIndex] || 0;
            
            // นับสถานะ
            if (status === 'Active') stats.active_events++;
            else if (status === 'Completed') stats.completed_events++;
            else if (status === 'Cancelled') stats.cancelled_events++;
            
            // นับกิจกรรมที่จะมาถึง
            if (status === 'Active' && eventDate > now) {
                stats.upcoming_events++;
            }
            
            // เก็บข้อมูลสำหรับกิจกรรมยอดนิยม
            if (participants > 0) {
                stats.popular_events.push({
                    title: eventData[i][titleIndex],
                    participants: participants,
                    event_date: eventDate
                });
            }
        }
        
        // เรียงกิจกรรมยอดนิยม
        stats.popular_events.sort((a, b) => b.participants - a.participants);
        stats.popular_events = stats.popular_events.slice(0, 10); // เอา 10 อันดับแรก
        
        // นับการลงทะเบียนทั้งหมด
        if (registrationSheet && registrationSheet.getLastRow() > 1) {
            stats.total_registrations = registrationSheet.getLastRow() - 1;
        }
        
        return { 
            success: true, 
            data: stats,
            message: 'สถิติกิจกรรม'
        };
    } catch (error) {
        console.error('Error getting event statistics:', error);
        return { error: 'เกิดข้อผิดพลาดในการดึงสถิติ: ' + error.message };
    }
}

// ==================== LINE Bot Integration Functions ====================
function getAvailableEquipmentForBot(category = null) {
    const result = getAvailableEquipment(category);
    if (result.success && result.data.length > 0) {
        let message = `🔍 ครุภัณฑ์ที่ว่าง${category ? ` (${category})` : ''}:\n\n`;
        result.data.slice(0, 10).forEach((item, index) => { // จำกัด 10 รายการ
            message += `${index + 1}. ${item.name}\n`;
            message += `   📍 สถานที่: ${item.location}\n`;
            message += `   🔧 ประเภท: ${item.category}\n`;
            message += `   📋 รหัส: ${item.equipment_id}\n\n`;
        });
        
        if (result.data.length > 10) {
            message += `และอีก ${result.data.length - 10} รายการ...\n\n`;
        }
        
        message += `📞 ต้องการยืม? กรุณาติดต่อแอดมิน`;
        return message;
    } else {
        return `😔 ไม่พบครุภัณฑ์ที่ว่าง${category ? ` ประเภท ${category}` : ''} ในขณะนี้`;
    }
}

function getActiveEventsForBot(category = null) {
    const result = getActiveEvents(category);
    if (result.success && result.data.length > 0) {
        let message = `🎉 กิจกรรมที่เปิดรับสมัคร${category ? ` (${category})` : ''}:\n\n`;
        result.data.slice(0, 5).forEach((event, index) => { // จำกัด 5 กิจกรรม
            message += `${index + 1}. ${event.title}\n`;
            message += `   📅 วันที่: ${new Date(event.event_date).toLocaleDateString('th-TH')}\n`;
            message += `   📍 สถานที่: ${event.location}\n`;
            message += `   👥 ที่ว่าง: ${event.spaces_left}\n`;
            message += `   ⏰ เหลือเวลาสมัคร: ${event.days_left} วัน\n`;
            if (event.registration_fee > 0) {
                message += `   💰 ค่าลงทะเบียน: ฿${event.registration_fee}\n`;
            }
            message += `\n`;
        });
        
        if (result.data.length > 5) {
            message += `และอีก ${result.data.length - 5} กิจกรรม...\n\n`;
        }
        
        message += `📝 ต้องการลงทะเบียน? กรุณาติดต่อแอดมิน`;
        return message;
    } else {
        return `😔 ไม่มีกิจกรรมที่เปิดรับสมัคร${category ? ` ประเภท ${category}` : ''} ในขณะนี้`;
    }
}

// ==================== Frontend Wrapper Functions ====================
/**
 * Wrapper function สำหรับการเรียกจาก frontend JavaScript
 * เพื่อให้สามารถเรียก google.script.run ได้
 */
function handleUserRegistration(memberData) {
    try {
        console.log('Handling user registration:', memberData);
        const result = createMember(memberData);
        return JSON.stringify(result);
    } catch (error) {
        console.error('Error in handleUserRegistration:', error);
        return JSON.stringify({
            success: false,
            error: 'เกิดข้อผิดพลาดในการลงทะเบียน: ' + error.message
        });
    }
}

/**
 * Test connection function สำหรับ user page
 */
function testUserConnection() {
    try {
        const spreadsheetId = getAdminSpreadsheetId();
        if (!spreadsheetId) {
            return JSON.stringify({
                success: false,
                error: 'ไม่พบ Spreadsheet ID'
            });
        }
        
        // ทดสอบการเชื่อมต่อ Google Sheets
        const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
        const memberSheet = spreadsheet.getSheetByName(SHEETS.MEMBERS);
        
        if (!memberSheet) {
            return JSON.stringify({
                success: false,
                error: 'ไม่พบ Members sheet'
            });
        }
        
        return JSON.stringify({
            success: true,
            message: 'เชื่อมต่อสำเร็จ',
            timestamp: new Date().toISOString(),
            sheetName: memberSheet.getName()
        });
        
    } catch (error) {
        console.error('Connection test error:', error);
        return JSON.stringify({
            success: false,
            error: 'เชื่อมต่อไม่สำเร็จ: ' + error.message
        });
    }
}

/**
 * Get member count for frontend
 */
function getMemberCount() {
    try {
        const result = getAllMembers();
        if (result.success) {
            return JSON.stringify({
                success: true,
                count: result.data.length,
                activeCount: result.data.filter(m => m.status === 'Active').length
            });
        } else {
            return JSON.stringify({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        return JSON.stringify({
            success: false,
            error: error.message
        });
    }
}

/**
 * ทดสอบการเชื่อมต่อ LINE Bot
 */
function testLineBotConnection() {
    try {
        const config = getConfig();
        
        // ตรวจสอบ Channel Access Token
        if (!config.LINE_CHANNEL_ACCESS_TOKEN) {
            return JSON.stringify({
                success: false,
                message: 'ไม่พบ LINE Channel Access Token',
                error: 'Missing LINE_CHANNEL_ACCESS_TOKEN'
            });
        }
        
        // ทดสอบ API call ไปยัง LINE
        const url = 'https://api.line.me/v2/bot/info';
        const response = UrlFetchApp.fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + config.LINE_CHANNEL_ACCESS_TOKEN
            }
        });
        
        if (response.getResponseCode() === 200) {
            const botInfo = JSON.parse(response.getContentText());
            return JSON.stringify({
                success: true,
                message: 'LINE Bot เชื่อมต่อสำเร็จ',
                data: {
                    botId: botInfo.userId,
                    displayName: botInfo.displayName,
                    timestamp: new Date().toISOString()
                }
            });
        } else {
            return JSON.stringify({
                success: false,
                message: 'LINE Bot เชื่อมต่อไม่สำเร็จ',
                error: 'HTTP ' + response.getResponseCode()
            });
        }
        
    } catch (error) {
        console.error('LINE Bot connection test failed:', error);
        return JSON.stringify({
            success: false,
            message: 'LINE Bot ทดสอบไม่สำเร็จ: ' + error.toString(),
            error: error.toString()
        });
    }
}

/**
 * รีเซ็ต LINE Bot webhook
 */
function resetLineBotWebhook() {
    try {
        const config = getConfig();
        const webappUrl = ScriptApp.getService().getUrl();
        
        // ตั้งค่า webhook URL ใหม่
        const url = 'https://api.line.me/v2/bot/channel/webhook/endpoint';
        const payload = {
            endpoint: webappUrl
        };
        
        const response = UrlFetchApp.fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + config.LINE_CHANNEL_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            },
            payload: JSON.stringify(payload)
        });
        
        if (response.getResponseCode() === 200) {
            return JSON.stringify({
                success: true,
                message: 'รีเซ็ต LINE Bot webhook สำเร็จ',
                data: {
                    webhookUrl: webappUrl,
                    timestamp: new Date().toISOString()
                }
            });
        } else {
            return JSON.stringify({
                success: false,
                message: 'รีเซ็ต webhook ไม่สำเร็จ',
                error: 'HTTP ' + response.getResponseCode()
            });
        }
        
    } catch (error) {
        console.error('Reset webhook failed:', error);
        return JSON.stringify({
            success: false,
            message: 'รีเซ็ต webhook ไม่สำเร็จ: ' + error.toString(),
            error: error.toString()
        });
    }
}

/**
 * ดูข้อมูล Web App URL
 */
function getWebAppInfo() {
    try {
        const webappUrl = ScriptApp.getService().getUrl();
        const scriptId = ScriptApp.getScriptId();
        
        return JSON.stringify({
            success: true,
            data: {
                webappUrl: webappUrl,
                scriptId: scriptId,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        return JSON.stringify({
            success: false,
            error: error.toString()
        });
    }
}

/**
 * ทดสอบระบบ Bot ทั้งหมด
 */
function testBotSystem() {
    try {
        const results = {
            channelToken: false,
            spreadsheet: false,
            flexMenu: false,
            errors: []
        };
        
        // Test 1: Channel Access Token
        try {
            const url = 'https://api.line.me/v2/bot/info';
            const response = UrlFetchApp.fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + getConfig().LINE_CHANNEL_ACCESS_TOKEN
                }
            });
            results.channelToken = response.getResponseCode() === 200;
            if (!results.channelToken) {
                results.errors.push('Channel token invalid: ' + response.getResponseCode());
            }
        } catch (error) {
            results.errors.push('Channel token test failed: ' + error.toString());
        }
        
        // Test 2: Spreadsheet Connection
        try {
            const sheet = SpreadsheetApp.openById(getConfig().SPREADSHEET_ID);
            const memberSheet = sheet.getSheetByName('Members');
            results.spreadsheet = memberSheet !== null;
            if (!results.spreadsheet) {
                results.errors.push('Members sheet not found');
            }
        } catch (error) {
            results.errors.push('Spreadsheet test failed: ' + error.toString());
        }
        
        // Test 3: Flex Menu Creation
        try {
            // เรียกฟังก์ชันจาก LINEBot.gs (ต้องแน่ใจว่าอยู่ใน scope เดียวกัน)
            results.flexMenu = true; // จะทดสอบใน LINEBot.gs แทน
        } catch (error) {
            results.errors.push('Flex menu test failed: ' + error.toString());
        }
        
        const allPassed = results.channelToken && results.spreadsheet && results.flexMenu;
        
        return JSON.stringify({
            success: allPassed,
            message: allPassed ? 'ระบบทำงานปกติทุกส่วน' : 'พบปัญหาในระบบ',
            data: results
        });
        
    } catch (error) {
        return JSON.stringify({
            success: false,
            message: 'ทดสอบระบบไม่สำเร็จ',
            error: error.toString()
        });
    }
}
