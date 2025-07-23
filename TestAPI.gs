// ไฟล์ทดสอบการทำงานของ AdminAPI.gs
// วิธีใช้: คัดลอกไฟล์นี้ไปใส่ใน Google Apps Script และรันฟังก์ชัน testAllFunctions()

function testAllFunctions() {
    console.log('🧪 เริ่มทดสอบฟังก์ชันทั้งหมด...');
    
    // ทดสอบ doGet แบบไม่มี parameter
    testDoGetWithoutParam();
    
    // ทดสอบ doGet แบบมี parameter
    testDoGetWithParam();
    
    // ทดสอบ doPost แบบไม่มี data
    testDoPostWithoutData();
    
    // ทดสอบ doPost แบบมี data
    testDoPostWithData();
    
    console.log('✅ ทดสอบเสร็จสิ้น');
}

function testDoGetWithoutParam() {
    console.log('\n📝 ทดสอบ doGet โดยไม่มี parameter...');
    try {
        const result = doGet();  // ไม่ส่ง parameter
        console.log('✅ ผลลัพธ์:', result ? 'สำเร็จ' : 'ล้มเหลว');
    } catch (error) {
        console.log('❌ เกิดข้อผิดพลาด:', error.message);
    }
}

function testDoGetWithParam() {
    console.log('\n📝 ทดสอบ doGet โดยมี parameter...');
    try {
        const mockEvent = {
            parameter: {
                page: 'admin'
            }
        };
        const result = doGet(mockEvent);
        console.log('✅ ผลลัพธ์:', result ? 'สำเร็จ' : 'ล้มเหลว');
    } catch (error) {
        console.log('❌ เกิดข้อผิดพลาด:', error.message);
    }
}

function testDoPostWithoutData() {
    console.log('\n📝 ทดสอบ doPost โดยไม่มี data...');
    try {
        const result = doPost();  // ไม่ส่ง data
        console.log('✅ ผลลัพธ์:', result ? 'สำเร็จ' : 'ล้มเหลว');
    } catch (error) {
        console.log('❌ เกิดข้อผิดพลาด:', error.message);
    }
}

function testDoPostWithData() {
    console.log('\n📝 ทดสอบ doPost โดยมี data...');
    try {
        const mockEvent = {
            postData: {
                contents: JSON.stringify({
                    action: 'testConnection'
                })
            }
        };
        const result = doPost(mockEvent);
        console.log('✅ ผลลัพธ์:', result ? 'สำเร็จ' : 'ล้มเหลว');
    } catch (error) {
        console.log('❌ เกิดข้อผิดพลาด:', error.message);
    }
}

// ทดสอบ Configuration
function testConfiguration() {
    console.log('\n🔧 ทดสอบ Configuration...');
    try {
        const spreadsheetId = getAdminSpreadsheetId();
        const channelToken = getChannelAccessToken();
        
        console.log('📊 Spreadsheet ID:', spreadsheetId ? '✅ มี' : '❌ ไม่มี');
        console.log('🤖 Channel Token:', channelToken ? '✅ มี' : '❌ ไม่มี');
        
        return true;
    } catch (error) {
        console.log('❌ เกิดข้อผิดพลาดใน Configuration:', error.message);
        return false;
    }
}

// ทดสอบการเชื่อมต่อ Google Sheets
function testSheetsConnection() {
    console.log('\n📈 ทดสอบการเชื่อมต่อ Google Sheets...');
    try {
        const spreadsheetId = getAdminSpreadsheetId();
        if (!spreadsheetId) {
            console.log('❌ ไม่พบ Spreadsheet ID');
            return false;
        }
        
        const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
        const sheets = spreadsheet.getSheets();
        
        console.log('✅ เชื่อมต่อสำเร็จ');
        console.log('📄 จำนวน Sheet:', sheets.length);
        
        sheets.forEach(sheet => {
            console.log('  - ' + sheet.getName());
        });
        
        return true;
    } catch (error) {
        console.log('❌ เชื่อมต่อไม่ได้:', error.message);
        return false;
    }
}

// ทดสอบ Member functions
function testMemberFunctions() {
    console.log('\n👥 ทดสอบ Member functions...');
    try {
        // ทดสอบ getAllMembers
        const members = getAllMembersData();
        console.log('📋 จำนวนสมาชิก:', members ? members.length || 0 : 0);
        
        return true;
    } catch (error) {
        console.log('❌ เกิดข้อผิดพลาด:', error.message);
        return false;
    }
}

// รันทดสอบทั้งหมด
function runAllTests() {
    console.log('🚀 เริ่มทดสอบระบบทั้งหมด\n');
    
    const tests = [
        { name: 'Configuration', func: testConfiguration },
        { name: 'Sheets Connection', func: testSheetsConnection },
        { name: 'Member Functions', func: testMemberFunctions },
        { name: 'All Functions', func: testAllFunctions }
    ];
    
    let passed = 0;
    let failed = 0;
    
    tests.forEach(test => {
        console.log(`\n🧪 ทดสอบ ${test.name}...`);
        try {
            const result = test.func();
            if (result !== false) {
                console.log(`✅ ${test.name}: ผ่าน`);
                passed++;
            } else {
                console.log(`❌ ${test.name}: ไม่ผ่าน`);
                failed++;
            }
        } catch (error) {
            console.log(`❌ ${test.name}: เกิดข้อผิดพลาด - ${error.message}`);
            failed++;
        }
    });
    
    console.log(`\n📊 สรุปผลการทดสอบ:`);
    console.log(`✅ ผ่าน: ${passed}`);
    console.log(`❌ ไม่ผ่าน: ${failed}`);
    console.log(`📈 อัตราความสำเร็จ: ${Math.round(passed/(passed+failed)*100)}%`);
}

// ==============================
// วิธีใช้:
// 1. คัดลอกโค้ดนี้ไปใส่ใน Google Apps Script
// 2. รันฟังก์ชัน runAllTests() เพื่อทดสอบทั้งหมด
// 3. หรือรันทีละฟังก์ชันตามต้องการ
// ==============================
