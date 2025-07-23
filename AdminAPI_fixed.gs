// Google Apps Script สำหรับ Admin Web App Backend

// ==================== Configuration ====================
const CONFIG = {
  SPREADSHEET_ID: '1p1YVF6dLf9xEQAQ3ULZ4Q3YnAJfHRz0_9Vl7vdZPYhw' // ใส่ Spreadsheet ID ของคุณ
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

// ==================== Main Entry Point for Admin Web App ====================
function doGet(e) {
    return adminDoGet(e);
}

function adminDoGet(e) {
  try {
    return HtmlService.createHtmlOutputFromFile('index.html')
        .setTitle('The House Solution - Admin Panel')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) {
    console.error('Error in adminDoGet:', err);
    return HtmlService.createHtmlOutput('An error occurred while loading the application.');
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
        const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(sheetName);
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
        const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(SHEETS.INVOICES);
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
        const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(SHEETS.MEMBERS);
        const memberId = 'M-' + Date.now();
        
        sheet.appendRow([
            memberId,
            memberData.name || '',
            memberData.email || '',
            memberData.phone || '',
            memberData.address || '',
            'Active',
            new Date(),
            new Date()
        ]);
        
        return { success: true, message: 'เพิ่มสมาชิกเรียบร้อย', member_id: memberId };
    } catch (error) {
        console.error('Error creating member:', error);
        return { error: 'เกิดข้อผิดพลาดในการเพิ่มสมาชิก: ' + error.message };
    }
}

function createEquipment(equipmentData) {
    try {
        const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(SHEETS.EQUIPMENT);
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
        const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(SHEETS.MAINTENANCE);
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
        const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(SHEETS.PAYMENTS);
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
        const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(sheetName);
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
        const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(sheetName);
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

        const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(SHEETS.BOOKINGS);
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
        const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(SHEETS.EQUIPMENT);
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
        const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(SHEETS.EQUIPMENT);
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
        const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(SHEETS.EVENTS);
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
        const membersData = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
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
        const equipmentData = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
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
        const maintenanceData = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
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
        const paymentsData = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
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
        const bookingsData = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
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
        const eventsData = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
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
