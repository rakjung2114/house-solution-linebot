// ฟังก์ชันทดสอบเพิ่มเติมสำหรับ LINE Bot
// คัดลอกและเพิ่มในไฟล์ LINEBot.gs

// ==================== Testing Functions ====================

// ทดสอบการส่งข้อความแบบ Push (ต้องมี User ID)
function testPushMessage() {
  const testUserId = 'YOUR_USER_ID_HERE'; // ใส่ User ID ของคุณ
  const testMessage = {
    type: 'text',
    text: 'นี่คือข้อความทดสอบจากระบบ LINE Bot 🤖'
  };
  
  console.log('Sending test push message...');
  pushMessage(testUserId, [testMessage]);
}

// ฟังก์ชันจำลอง Webhook Event
function simulateWebhookEvent() {
  const testEvent = {
    type: 'message',
    source: {
      userId: 'TEST_USER_ID'
    },
    replyToken: 'TEST_REPLY_TOKEN',
    message: {
      type: 'text',
      text: 'เมนู'
    }
  };
  
  console.log('Simulating webhook event...');
  handleMessage(testEvent);
}

// ทดสอบการสร้าง Flex Message
function testFlexMessage() {
  try {
    const flexMenu = createFlexMenu();
    console.log('Flex message created successfully:', JSON.stringify(flexMenu, null, 2));
    return true;
  } catch (error) {
    console.error('Error creating flex message:', error);
    return false;
  }
}

// ทดสอบการเชื่อมต่อครบถ้วน
function fullSystemTest() {
  console.log('=== Full System Test ===');
  
  // Test 1: Configuration
  console.log('1. Testing Configuration...');
  console.log('Channel Access Token length:', CONFIG.CHANNEL_ACCESS_TOKEN.length);
  console.log('Spreadsheet ID:', CONFIG.SPREADSHEET_ID);
  
  // Test 2: LINE API Connection
  console.log('2. Testing LINE API...');
  const tokenTest = testChannelAccessToken();
  console.log('LINE API Connection:', tokenTest ? 'SUCCESS' : 'FAILED');
  
  // Test 3: Google Sheets Connection
  console.log('3. Testing Google Sheets...');
  const sheetTest = testSpreadsheetConnection();
  console.log('Google Sheets Connection:', sheetTest ? 'SUCCESS' : 'FAILED');
  
  // Test 4: Flex Message Creation
  console.log('4. Testing Flex Message...');
  const flexTest = testFlexMessage();
  console.log('Flex Message Creation:', flexTest ? 'SUCCESS' : 'FAILED');
  
  // Test 5: Message Handler
  console.log('5. Testing Message Handler...');
  try {
    // จำลองการจัดการข้อความ
    const testReplyToken = 'TEST_TOKEN';
    const testUserId = 'TEST_USER';
    
    // ทดสอบ default message
    handleDefaultMessage(testReplyToken);
    console.log('Message Handler: SUCCESS');
  } catch (error) {
    console.error('Message Handler: FAILED', error);
  }
  
  console.log('=== Test Complete ===');
  
  return {
    lineApi: tokenTest,
    googleSheets: sheetTest,
    flexMessage: flexTest
  };
}

// ตรวจสอบ Webhook Endpoint
function testWebhookEndpoint() {
  try {
    // สร้าง test request
    const testRequest = {
      postData: {
        contents: JSON.stringify({
          events: [{
            type: 'message',
            source: { userId: 'TEST_USER' },
            replyToken: 'TEST_REPLY_TOKEN',
            message: { type: 'text', text: 'เมนู' }
          }]
        })
      }
    };
    
    console.log('Testing webhook endpoint...');
    const response = doPost(testRequest);
    console.log('Webhook test response:', response.getContent());
    
    return true;
  } catch (error) {
    console.error('Webhook test failed:', error);
    return false;
  }
}

// ดูข้อมูล Bot Info
function getBotInfo() {
  const url = 'https://api.line.me/v2/bot/info';
  const options = {
    method: 'get',
    headers: {
      'Authorization': 'Bearer ' + CONFIG.CHANNEL_ACCESS_TOKEN
    }
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const botInfo = JSON.parse(response.getContentText());
    console.log('Bot Info:', JSON.stringify(botInfo, null, 2));
    return botInfo;
  } catch (error) {
    console.error('Error getting bot info:', error);
    return null;
  }
}
