// LINE Bot Handler - Configuration is now in Configuration.gs to avoid duplication

// ==================== Main Webhook Handler ====================
/**
 * Handles GET requests for LINE Bot verification and Admin Web App
 */
function doGet(e) {
  try {
    console.log('doGet called with parameters:', JSON.stringify(e ? e.parameter : 'no parameters'));
    
    // Handle debug page request
    if (e && e.parameter && e.parameter.debug === 'true') {
      console.log('Showing debug center page');
      return HtmlService.createHtmlOutputFromFile('debug-center.html')
          .setTitle('🤖 LINE Bot Debug Center')
          .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
    
    // ตรวจสอบว่าเป็น LINE Bot webhook verification หรือไม่
    if (e && e.parameter) {
      // หากมี hub.challenge ให้ตอบกลับเพื่อ verify webhook
      if (e.parameter['hub.challenge']) {
        console.log('LINE webhook verification challenge:', e.parameter['hub.challenge']);
        return ContentService.createTextOutput(e.parameter['hub.challenge'])
          .setMimeType(ContentService.MimeType.TEXT);
      }
      
      // Handle specific actions for testing
      if (e.parameter.action) {
        const action = e.parameter.action;
        console.log('Handling action:', action);
        
        switch (action) {
          case 'testLineBotConnection':
            return ContentService.createTextOutput(JSON.stringify(testLineBotConnection()))
                .setMimeType(ContentService.MimeType.JSON);
                
          case 'testUserConnection':
            return ContentService.createTextOutput(JSON.stringify(testUserConnection()))
                .setMimeType(ContentService.MimeType.JSON);
                
          case 'getWebAppInfo':
            return ContentService.createTextOutput(JSON.stringify({
              success: true,
              data: {
                webappUrl: ScriptApp.getService().getUrl(),
                scriptId: ScriptApp.getScriptId()
              }
            })).setMimeType(ContentService.MimeType.JSON);
            
          default:
            // ส่งต่อไปยัง AdminAPI สำหรับ action อื่นๆ
            console.log('Routing to AdminAPI for action:', action);
            return adminDoGet(e);
        }
      }
      
      // หากมี parameter page=admin ให้เรียก AdminAPI สำหรับหน้าแอดมิน
      if (e.parameter.page === 'admin') {
        console.log('Routing to AdminAPI for admin page');
        return adminDoGet(e);
      }
    }
    
    // สำหรับการเข้าถึงโดยไม่มี parameter หรือ page=user ให้แสดงหน้าหลักแทน
    console.log('Showing main page with popup registration');
    return HtmlService.createHtmlOutputFromFile('main.html')
        .setTitle('The House Solution - ระบบบริหารนิติบุคคล')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
      
  } catch (error) {
    console.error('Error in doGet:', error);
    return ContentService.createTextOutput('Error: ' + error.message)
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

function doPost(e) {
  console.log('=== doPost called ===');
  
  try {
    // **CRITICAL: ตอบกลับ LINE ทันทีเพื่อป้องกัน timeout (ภายใน 1 วินาที)**
    const immediateResponse = ContentService.createTextOutput('OK')
      .setMimeType(ContentService.MimeType.TEXT);
    
    // ตรวจสอบข้อมูล POST อย่างรวดเร็ว
    if (!e || !e.postData || !e.postData.contents) {
        console.log('Empty POST data - returning OK to LINE');
        return immediateResponse;
    }
    
    // Parse และประมวลผลแบบ async ไม่ให้ block การตอบกลับ
    try {
      const postData = JSON.parse(e.postData.contents);
      const events = postData.events;
      
      if (events && events.length > 0) {
        console.log('Received', events.length, 'events - processing async');
        
        // ใช้ ScriptApp.newTrigger เพื่อประมวลผลแบบ background
        // หรือประมวลผลทันทีแต่ไม่รอผลลัพธ์
        Utilities.sleep(10); // รอเล็กน้อยให้ response ส่งออกไปก่อน
        
        events.forEach(event => {
          try {
            processEventImmediate(event);
          } catch (eventError) {
            console.error('Event processing error:', eventError);
          }
        });
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
    }
    
    // ส่ง OK response กลับไปให้ LINE ทันที
    return immediateResponse;
      
  } catch (error) {
    console.error('doPost error:', error);
    // ต้อง return OK เสมอเพื่อไม่ให้ LINE retry
    return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT);
  }
}

/**
 * ประมวลผล event ทันที - ต้องเร็วและไม่ซับซ้อน
 */
function processEventImmediate(event) {
  console.log('Processing event:', event.type);
  
  if (event.type === 'message' && event.message.type === 'text') {
    const text = event.message.text.trim();
    const replyToken = event.replyToken;
    
    // จัดการข้อความเฉพาะที่ตอบง่ายๆ ได้ทันที
    if (text === 'test' || text === 'ทดสอบ') {
      quickReply(replyToken, '✅ ระบบทำงานปกติ!');
      return;
    }
    
    if (text.toLowerCase() === 'ping') {
      quickReply(replyToken, 'pong! 🏓');
      return;
    }
    
    if (text === 'debug') {
      quickReply(replyToken, `🔧 Debug: ${new Date().toLocaleString('th-TH')}`);
      return;
    }
    
    if (text === 'เมนู') {
      quickReply(replyToken, '📋 เมนูหลัก\n\n• ตรวจสอบบิล\n• แจ้งซ่อม\n• ติดต่อสำนักงาน\n\nพิมพ์เมนูที่ต้องการ');
      return;
    }
    
    // สำหรับข้อความอื่นๆ ให้ตอบแบบทั่วไป
    quickReply(replyToken, 'ได้รับข้อความแล้ว กำลังประมวลผล...');
  }
}

// ==================== Event Handlers ====================
function handleMessage(event) {
  console.log('=== handleMessage START ===');
  console.log('Event received:', JSON.stringify(event));
  
  const userId = event.source.userId;
  const replyToken = event.replyToken;
  
  console.log('User ID:', userId);
  console.log('Reply Token:', replyToken);
  
  if (event.message.type === 'text') {
    const text = event.message.text.trim();
    console.log('Text message received:', text);
    
    // ทดสอบการตอบกลับพื้นฐานก่อน
    if (text === 'test' || text === 'ทดสอบ') {
      console.log('Test message detected - sending simple reply');
      try {
        replyMessage(replyToken, [{ type: 'text', text: '✅ ระบบทำงานปกติ!' }]);
        console.log('Test reply sent successfully');
        return;
      } catch (error) {
        console.error('Error sending test reply:', error);
        return;
      }
    }
    
    // เพิ่มการตอบกลับ "ping" เพื่อทดสอบ
    if (text.toLowerCase() === 'ping') {
      console.log('Ping message detected');
      try {
        replyMessage(replyToken, [{ type: 'text', text: 'pong! 🏓' }]);
        return;
      } catch (error) {
        console.error('Error sending ping reply:', error);
        return;
      }
    }
    
    // ทดสอบ token
    if (text === 'debug') {
      console.log('Debug message detected');
      try {
        const token = getChannelAccessToken();
        const hasToken = token ? 'มี Token' : 'ไม่มี Token';
        replyMessage(replyToken, [{ 
          type: 'text', 
          text: `🔧 Debug Info:\n${hasToken}\nTime: ${new Date().toLocaleString('th-TH')}` 
        }]);
        return;
      } catch (error) {
        console.error('Error sending debug reply:', error);
        return;
      }
    }
    
    // Check for user state (conversational context)
    const userState = getUserState(userId);
    if (userState) {
      console.log('User has state:', userState.state);
      if (userState.state === 'registering') {
        processRegistration(replyToken, userId, text);
        return;
      }
      if (userState.state === 'maintenance_reporting') {
        processMaintenanceReport(replyToken, userId, text);
        return;
      }
    }
    
    // ตรวจสอบการลงทะเบียน
    const isRegistered = isUserRegistered(userId);
    console.log('User registered status:', isRegistered);
    
    if (!isRegistered && text !== 'ลงทะเบียน' && text !== 'เมนู') {
      console.log('User not registered, sending registration prompt');
      replyMessage(replyToken, [{ type: 'text', text: 'กรุณาลงทะเบียนก่อนใช้งาน โดยพิมพ์ "ลงทะเบียน"' }]);
      return;
    }
    
    console.log('Processing command:', text);
    switch (text) {
      case 'ลงทะเบียน': 
        console.log('Handling registration');
        handleRegistration(replyToken, userId); 
        break;
      case 'เมนู': 
        console.log('Handling menu');
        handleShowMenu(replyToken); 
        break;
      case 'สวัสดี':
      case 'สวัสดีครับ':
      case 'สวัสดีค่ะ':
        console.log('Handling greeting');
        replyMessage(replyToken, [{ type: 'text', text: '🏠 สวัสดีครับ! ยินดีต้อนรับสู่ The House Solution\nพิมพ์ "เมนู" เพื่อดูรายการบริการ' }]);
        break;
      case 'ตรวจสอบบิล': handleCheckBill(replyToken, userId); break;
      case 'แจ้งซ่อม': handleMaintenance(replyToken, userId); break;
      case 'ยืมครุภัณฑ์': handleEquipmentBooking(replyToken, userId); break;
      case 'กิจกรรม': handleEvents(replyToken, userId); break;
      case 'ติดต่อ': handleContact(replyToken); break;
      case 'โปรไฟล์': handleProfile(replyToken, userId); break;
      default: 
        console.log('Handling default message for:', text);
        handleDefaultMessage(replyToken);
    }
  } else {
    console.log('Non-text message received:', event.message.type);
    replyMessage(replyToken, [{ type: 'text', text: 'ขออภัย ระบบรองรับเฉพาะข้อความเท่านั้น' }]);
  }
  
  console.log('=== handleMessage END ===');
}

function handlePostback(event) {
  const userId = event.source.userId;
  const replyToken = event.replyToken;
  const data = parsePostbackData(event.postback.data);
  
  switch (data.action) {
    case 'maintenanceCategory':
      startMaintenanceReport(replyToken, userId, data.category);
      break;
    case 'confirmMaintenance':
      confirmMaintenanceReport(replyToken, userId, data);
      break;
    default:
      console.log(`Unhandled postback action: ${data.action}`);
  }
}

function startMaintenanceReport(replyToken, userId, category) {
  const member = getMemberByLineId(userId);
  if (!member) {
    replyMessage(replyToken, [{ type: 'text', text: '❌ ไม่พบข้อมูลผู้ใช้' }]);
    return;
  }
  
  const categoryText = {
    'electrical': 'ไฟฟ้า',
    'plumbing': 'ประปา', 
    'structure': 'โครงสร้าง',
    'other': 'อื่นๆ'
  };
  
  // เก็บ state สำหรับการแจ้งซ่อม
  setUserState(userId, 'maintenance_reporting', { 
    category: category,
    categoryText: categoryText[category],
    step: 1 
  });
  
  replyMessage(replyToken, [{
    type: 'text',
    text: `📝 แจ้งซ่อม${categoryText[category]}\n\nขั้นตอนที่ 1/2\nกรุณาอธิบายปัญหาที่พบ`,
    quickReply: {
      items: [{
        type: 'action',
        action: {
          type: 'message',
          label: 'ยกเลิก',
          text: 'ยกเลิกการแจ้งซ่อม'
        }
      }]
    }
  }]);
}

function handleFollow(event) {
  const replyToken = event.replyToken;
  const messages = [
    { type: 'text', text: '🏠 ยินดีต้อนรับสู่ The House Solution!' },
    { type: 'text', text: 'กรุณาพิมพ์ "ลงทะเบียน" เพื่อเริ่มต้นใช้งาน', quickReply: { items: [{ type: 'action', action: { type: 'message', label: 'ลงทะเบียน', text: 'ลงทะเบียน' }}]}}
  ];
  replyMessage(replyToken, messages);
}

function handleUnfollow(event) {
  updateUserStatus(event.source.userId, 'Inactive');
}

// ==================== Conversational Flows ====================
function handleRegistration(replyToken, userId) {
  if (isUserRegistered(userId)) {
    replyMessage(replyToken, [{ type: 'text', text: 'คุณได้ลงทะเบียนเรียบร้อยแล้ว ✅' }]);
    return;
  }
  setUserState(userId, 'registering', { step: 1 });
  replyMessage(replyToken, [{ type: 'text', text: '📝 เริ่มการลงทะเบียน\nขั้นตอนที่ 1/4\nกรุณาระบุ "ชื่อ-นามสกุล"', quickReply: { items: [{ type: 'action', action: { type: 'message', label: 'ยกเลิก', text: 'ยกเลิก' }}]}}]);
}

function processRegistration(replyToken, userId, text) {
  if (text.toLowerCase() === 'ยกเลิก') {
    clearUserState(userId);
    replyMessage(replyToken, [{ type: 'text', text: 'ยกเลิกการลงทะเบียนแล้ว' }]);
    return;
  }
  
  const state = getUserState(userId);
  
  switch (state.step) {
    case 1: // Get Full Name
      state.fullName = text;
      state.step = 2;
      setUserState(userId, 'registering', state);
      replyMessage(replyToken, [{ type: 'text', text: `ชื่อ: ${text}\nขั้นตอนที่ 2/4\nกรุณาระบุ "เลขที่บ้าน/ห้อง"` }]);
      break;
    case 2: // Get Unit Number
      state.unitNumber = text;
      state.step = 3;
      setUserState(userId, 'registering', state);
      replyMessage(replyToken, [{ type: 'text', text: `บ้านเลขที่: ${text}\nขั้นตอนที่ 3/4\nกรุณาระบุ "เบอร์โทรศัพท์"` }]);
      break;
    case 3: // Get Phone Number
      if (!isValidPhone(text)) {
        replyMessage(replyToken, [{ type: 'text', text: 'รูปแบบเบอร์โทรไม่ถูกต้อง กรุณาลองใหม่' }]);
        return;
      }
      state.phone = text;
      state.step = 4;
      setUserState(userId, 'registering', state);
      replyMessage(replyToken, [{ type: 'text', text: `เบอร์โทร: ${text}\nขั้นตอนที่ 4/4\nกรุณาระบุ "อีเมล"` }]);
      break;
    case 4: // Get Email and finalize
      if (!isValidEmail(text)) {
        replyMessage(replyToken, [{ type: 'text', text: 'รูปแบบอีเมลไม่ถูกต้อง กรุณาลองใหม่' }]);
        return;
      }
      state.email = text;
      const success = createMember(userId, state);
      clearUserState(userId);
      if (success) {
        replyMessage(replyToken, [
          { type: 'text', text: `✅ ลงทะเบียนสำเร็จ!\nยินดีต้อนรับคุณ ${state.fullName}` },
          { type: 'text', text: 'พิมพ์ "เมนู" เพื่อดูเมนูการใช้งาน' }
        ]);
      } else {
        replyMessage(replyToken, [{ type: 'text', text: '❌ เกิดข้อผิดพลาดในการลงทะเบียน' }]);
      }
      break;
  }
}

// ==================== Bot Feature Functions ====================
function handleShowMenu(replyToken) { replyMessage(replyToken, [createFlexMenu()]); }

function createFlexMenu() {
  return {
    type: 'flex',
    altText: 'เมนูหลัก The House Solution',
    contents: {
      type: 'bubble',
      size: 'giga',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '🏠 The House Solution',
            size: 'xl',
            weight: 'bold',
            color: '#ffffff',
            align: 'center'
          },
          {
            type: 'text',
            text: 'ระบบบริหารนิติบุคคลอัจฉริยะ',
            size: 'sm',
            color: '#ffffff',
            align: 'center',
            margin: 'sm'
          }
        ],
        backgroundColor: '#3b82f6',
        paddingAll: 'xl'
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              createMenuButton('💰', 'ตรวจสอบบิล', 'ตรวจสอบบิล'),
              createMenuButton('🔧', 'แจ้งซ่อม', 'แจ้งซ่อม'),
              createMenuButton('📦', 'ยืมครุภัณฑ์', 'ยืมครุภัณฑ์')
            ],
            spacing: 'sm'
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              createMenuButton('📅', 'กิจกรรม', 'กิจกรรม'),
              createMenuButton('📞', 'ติดต่อ', 'ติดต่อ'),
              createMenuButton('👤', 'โปรไฟล์', 'โปรไฟล์')
            ],
            spacing: 'sm',
            margin: 'md'
          }
        ],
        paddingAll: 'lg'
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: 'เลือกเมนูที่ต้องการใช้งาน',
            size: 'xs',
            color: '#999999',
            align: 'center'
          }
        ],
        paddingAll: 'sm'
      }
    }
  };
}

function createMenuButton(icon, label, action) {
  return {
    type: 'box',
    layout: 'vertical',
    contents: [
      {
        type: 'text',
        text: icon,
        size: 'xxl',
        align: 'center'
      },
      {
        type: 'text',
        text: label,
        size: 'xs',
        align: 'center',
        margin: 'sm',
        wrap: true
      }
    ],
    backgroundColor: '#f3f4f6',
    cornerRadius: 'md',
    paddingAll: 'lg',
    action: {
      type: 'message',
      label: label,
      text: action
    }
  };
}

function handleCheckBill(replyToken, userId) { 
  const member = getMemberByLineId(userId);
  if (!member) {
    replyMessage(replyToken, [{ type: 'text', text: '❌ ไม่พบข้อมูลผู้ใช้' }]);
    return;
  }
  
  // ดึงใบแจ้งหนี้ล่าสุด
  const invoices = getInvoicesByMemberId(member.member_id);
  
  if (invoices.length === 0) {
    replyMessage(replyToken, [{ type: 'text', text: '📋 ไม่พบใบแจ้งหนี้ของคุณ' }]);
    return;
  }
  
  const latestInvoice = invoices[0];
  const flexMessage = createInvoiceFlexMessage(latestInvoice);
  replyMessage(replyToken, [flexMessage]);
}

function handleMaintenance(replyToken, userId) { 
  const quickReply = {
    items: [
      {
        type: 'action',
        action: {
          type: 'postback',
          label: '💡 ไฟฟ้า',
          data: 'action=maintenanceCategory&category=electrical'
        }
      },
      {
        type: 'action',
        action: {
          type: 'postback',
          label: '🚿 ประปา',
          data: 'action=maintenanceCategory&category=plumbing'
        }
      },
      {
        type: 'action',
        action: {
          type: 'postback',
          label: '🏗️ โครงสร้าง',
          data: 'action=maintenanceCategory&category=structure'
        }
      },
      {
        type: 'action',
        action: {
          type: 'postback',
          label: '📦 อื่นๆ',
          data: 'action=maintenanceCategory&category=other'
        }
      }
    ]
  };
  
  replyMessage(replyToken, [{
    type: 'text',
    text: '🔧 แจ้งซ่อม\n\nกรุณาเลือกประเภทการแจ้งซ่อม:',
    quickReply: quickReply
  }]);
}
function handleEquipmentBooking(replyToken, userId) { replyMessage(replyToken, [{ type: 'text', text: '📦 ระบบยืม-คืนครุภัณฑ์\n⚠️ ขออภัย ฟังก์ชันนี้อยู่ระหว่างการพัฒนา' }]); }
function handleEvents(replyToken, userId) { replyMessage(replyToken, [{ type: 'text', text: '📅 กิจกรรมนิติบุคคล\n⚠️ ขออภัย ฟังก์ชันนี้อยู่ระหว่างการพัฒนา' }]); }
function handleContact(replyToken) { replyMessage(replyToken, [{ type: 'text', text: '📞 ติดต่อสำนักงานนิติบุคคล\n\n' + '🏢 สำนักงาน: อาคารสโมสร ชั้น 1\n' + '📱 โทร: 02-XXX-XXXX' }]); }
function handleProfile(replyToken, userId) {
  const member = getMemberByLineId(userId);
  if (!member) { replyMessage(replyToken, [{ type: 'text', text: 'ไม่พบข้อมูลของคุณ' }]); return; }
  const profileText = `👤 ข้อมูลส่วนตัว\n\nชื่อ: ${member.first_name} ${member.last_name}\nบ้านเลขที่: ${member.unit_number}\nโทรศัพท์: ${member.phone_number}\nอีเมล: ${member.email}`;
  replyMessage(replyToken, [{ type: 'text', text: profileText }]);
}
function handleDefaultMessage(replyToken) { replyMessage(replyToken, [{ type: 'text', text: 'ขออภัยค่ะ ไม่เข้าใจคำสั่ง\nกรุณาพิมพ์ "เมนู" เพื่อดูรายการที่สามารถใช้งานได้' }]); }

// ==================== Maintenance Process Functions ====================
function processMaintenanceReport(replyToken, userId, text) {
  if (text === 'ยกเลิกการแจ้งซ่อม' || text.toLowerCase() === 'ยกเลิก') {
    clearUserState(userId);
    replyMessage(replyToken, [{ type: 'text', text: 'ยกเลิกการแจ้งซ่อมแล้ว' }]);
    return;
  }
  
  const state = getUserState(userId);
  const member = getMemberByLineId(userId);
  
  switch (state.step) {
    case 1: // Get problem description
      state.description = text;
      state.step = 2;
      setUserState(userId, 'maintenance_reporting', state);
      
      replyMessage(replyToken, [{
        type: 'text',
        text: `📝 รายละเอียดปัญหา: ${text}\n\nขั้นตอนที่ 2/2\nกรุณาส่งรูปภาพ (ถ้ามี) หรือพิมพ์ "ไม่มีรูป" เพื่อดำเนินการต่อ`,
        quickReply: {
          items: [{
            type: 'action',
            action: {
              type: 'message',
              label: 'ไม่มีรูป',
              text: 'ไม่มีรูป'
            }
          }]
        }
      }]);
      break;
      
    case 2: // Get confirmation or handle "no photo"
      if (text === 'ไม่มีรูป') {
        // Save maintenance request without photo
        const maintenanceId = saveMaintenance(member.member_id, state.category, state.description, null);
        clearUserState(userId);
        
        if (maintenanceId) {
          replyMessage(replyToken, [{
            type: 'text',
            text: `✅ แจ้งซ่อมเรียบร้อยแล้ว\n\nรหัสการแจ้งซ่อม: ${maintenanceId}\nประเภท: ${state.categoryText}\nรายละเอียด: ${state.description}\n\nเจ้าหน้าที่จะติดต่อกลับภายใน 24 ชั่วโมง`
          }]);
        } else {
          replyMessage(replyToken, [{ type: 'text', text: '❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง' }]);
        }
      }
      break;
  }
}

// ==================== Database Functions ====================
function getSpreadsheet() { return SpreadsheetApp.openById(getLineSpreadsheetId()); }
function getMemberByLineId(lineId) {
  try {
    const sheet = getSpreadsheet().getSheetByName(SHEETS.MEMBERS);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const lineIdIndex = headers.indexOf('line_id');
    for (let i = 1; i < data.length; i++) {
      if (data[i][lineIdIndex] === lineId) {
        const member = {};
        headers.forEach((header, index) => { member[header] = data[i][index]; });
        return member;
      }
    }
    return null;
  } catch (error) { console.error('Error in getMemberByLineId:', error); return null; }
}
function isUserRegistered(lineId) { return getMemberByLineId(lineId) !== null; }
function createMember(lineId, data) {
  try {
    const sheet = getSpreadsheet().getSheetByName(SHEETS.MEMBERS);
    const memberId = 'MEM-' + new Date().getTime();
    const names = data.fullName.split(' ');
    const firstName = names[0];
    const lastName = names.slice(1).join(' ');
    sheet.appendRow([ memberId, lineId, firstName, lastName, data.unitNumber, data.phone, data.email, new Date(), 'Active', '', '' ]);
    return true;
  } catch (error) { console.error('Error in createMember:', error); return false; }
}
function updateUserStatus(lineId, status) {
  try {
    const sheet = getSpreadsheet().getSheetByName(SHEETS.MEMBERS);
    const data = sheet.getDataRange().getValues();
    const lineIdIndex = data[0].indexOf('line_id');
    const statusIndex = data[0].indexOf('status');
    for (let i = 1; i < data.length; i++) {
      if (data[i][lineIdIndex] === lineId) {
        sheet.getRange(i + 1, statusIndex + 1).setValue(status);
        break;
      }
    }
  } catch (error) { console.error('Error in updateUserStatus:', error); }
}

// ==================== Invoice & Bill Functions ====================
function getInvoicesByMemberId(memberId) {
  try {
    const sheet = getSpreadsheet().getSheetByName(SHEETS.INVOICES);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const memberIdIndex = headers.indexOf('member_id');
    
    const invoices = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][memberIdIndex] === memberId) {
        const invoice = {};
        headers.forEach((header, index) => {
          invoice[header] = data[i][index];
        });
        invoices.push(invoice);
      }
    }
    
    // Sort by issue date, newest first
    invoices.sort((a, b) => new Date(b.issue_date) - new Date(a.issue_date));
    return invoices;
  } catch (error) {
    console.error('Error getting invoices:', error);
    return [];
  }
}

function createInvoiceFlexMessage(invoice) {
  const statusColor = invoice.status === 'Paid' ? '#00C851' : 
                     invoice.status === 'Overdue' ? '#ff4444' : '#ffbb33';
  const statusText = invoice.status === 'Paid' ? 'ชำระแล้ว' : 
                     invoice.status === 'Overdue' ? 'เกินกำหนดชำระ' : 'รอการชำระ';
  
  return {
    type: 'flex',
    altText: `ใบแจ้งหนี้ ${invoice.invoice_id}`,
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: 'ใบแจ้งหนี้',
            color: '#ffffff',
            size: 'xl',
            weight: 'bold'
          },
          {
            type: 'text',
            text: invoice.invoice_id || 'N/A',
            color: '#ffffff',
            size: 'md'
          }
        ],
        backgroundColor: '#4285f4',
        paddingAll: '20px'
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: 'บ้านเลขที่:',
                color: '#666666',
                flex: 3
              },
              {
                type: 'text',
                text: invoice.unit_number || 'N/A',
                flex: 5
              }
            ]
          },
          {
            type: 'separator',
            margin: 'md'
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: 'รายละเอียด:',
                color: '#666666',
                flex: 3
              },
              {
                type: 'text',
                text: invoice.description || 'N/A',
                flex: 5,
                wrap: true
              }
            ],
            margin: 'md'
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: 'จำนวนเงิน:',
                color: '#666666',
                flex: 3
              },
              {
                type: 'text',
                text: '฿' + formatNumber(invoice.total_amount || 0),
                flex: 5,
                size: 'lg',
                weight: 'bold',
                color: '#ff5722'
              }
            ],
            margin: 'md'
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: 'ครบกำหนด:',
                color: '#666666',
                flex: 3
              },
              {
                type: 'text',
                text: formatDate(invoice.due_date),
                flex: 5
              }
            ],
            margin: 'md'
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: 'สถานะ:',
                color: '#666666',
                flex: 3
              },
              {
                type: 'text',
                text: statusText,
                flex: 5,
                color: statusColor,
                weight: 'bold'
              }
            ],
            margin: 'md'
          }
        ],
        paddingAll: '20px'
      }
    }
  };
}

// ==================== Maintenance Functions ====================
function saveMaintenance(memberId, category, description, photoUrl) {
  try {
    const sheet = getSpreadsheet().getSheetByName(SHEETS.MAINTENANCE);
    const maintenanceId = 'MAIN-' + new Date().getTime();
    const now = new Date();
    
    sheet.appendRow([
      maintenanceId,
      memberId,
      category,
      description,
      photoUrl || '',
      now,
      'Pending',
      '',
      ''
    ]);
    
    return maintenanceId;
  } catch (error) {
    console.error('Error saving maintenance:', error);
    return null;
  }
}

// ==================== Utility Functions ====================
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatDate(date) {
  if (!date) return 'N/A';
  const d = new Date(date);
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
}

// ==================== Testing Functions ====================
function testChannelAccessToken() {
  const url = 'https://api.line.me/v2/bot/info';
  const options = {
    method: 'get',
    headers: {
      'Authorization': 'Bearer ' + getChannelAccessToken()
    }
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    console.log('Channel Access Token test response:', response.getContentText());
    return response.getResponseCode() === 200;
  } catch (error) {
    console.error('Error testing Channel Access Token:', error);
    return false;
  }
}

function testSpreadsheetConnection() {
  try {
    const sheet = SpreadsheetApp.openById(getLineSpreadsheetId());
    console.log('Spreadsheet connection successful:', sheet.getName());
    return true;
  } catch (error) {
    console.error('Error connecting to spreadsheet:', error);
    return false;
  }
}

function testBotSystem() {
  console.log('=== Testing Bot System ===');
  
  // Test 1: Channel Access Token
  console.log('Testing Channel Access Token...');
  const tokenValid = testChannelAccessToken();
  console.log('Channel Access Token valid:', tokenValid);
  
  // Test 2: Spreadsheet Connection
  console.log('Testing Spreadsheet connection...');
  const sheetConnected = testSpreadsheetConnection();
  console.log('Spreadsheet connected:', sheetConnected);
  
  // Test 3: Test creating flex menu
  console.log('Testing Flex Menu creation...');
  try {
    const menu = createFlexMenu();
    console.log('Flex Menu created successfully');
  } catch (error) {
    console.error('Error creating Flex Menu:', error);
  }
  
  console.log('=== Bot System Test Complete ===');
  return {
    channelToken: tokenValid,
    spreadsheet: sheetConnected
  };
}

// ==================== State Management ====================
function getUserState(userId) {
  const cache = CacheService.getScriptCache();
  const state = cache.get(`state_${userId}`);
  return state ? JSON.parse(state) : null;
}
function setUserState(userId, state, data = {}) {
  const cache = CacheService.getScriptCache();
  const stateData = { state: state, ...data };
  cache.put(`state_${userId}`, JSON.stringify(stateData), 300); // Store state for 5 minutes
}
function clearUserState(userId) {
  const cache = CacheService.getScriptCache();
  cache.remove(`state_${userId}`);
}

// ==================== LINE API Wrappers ====================

/**
 * ฟังก์ชันตอบกลับแบบเร็ว - ใช้สำหรับ immediate response
 */
function quickReply(replyToken, message) {
  try {
    const token = getChannelAccessToken();
    if (!token) {
      console.error('No token available for quick reply');
      return;
    }
    
    const payload = {
      replyToken: replyToken,
      messages: [{ type: 'text', text: message }]
    };
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: { 'Authorization': 'Bearer ' + token },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    // ส่งแบบ fire-and-forget ไม่รอ response
    UrlFetchApp.fetch(CONFIG.LINE_REPLY_URL, options);
    console.log('Quick reply sent:', message.substring(0, 50));
    
  } catch (error) {
    console.error('Quick reply error:', error);
  }
}

function replyMessage(replyToken, messages) {
  try {
    console.log('=== replyMessage START ===');
    console.log('Reply Token:', replyToken);
    console.log('Messages to send:', JSON.stringify(messages));
    
    // ตรวจสอบ Channel Access Token
    const token = getChannelAccessToken();
    console.log('Channel Access Token available:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.error('No Channel Access Token found!');
      return;
    }
    
    const payload = { replyToken: replyToken, messages: messages };
    const options = { 
      method: 'post', 
      contentType: 'application/json', 
      headers: { 'Authorization': 'Bearer ' + token }, 
      payload: JSON.stringify(payload), 
      muteHttpExceptions: true 
    };
    
    console.log('Sending request to LINE API...');
    const response = UrlFetchApp.fetch(CONFIG.LINE_REPLY_URL, options);
    
    console.log('LINE API Response Code:', response.getResponseCode());
    console.log('LINE API Response:', response.getContentText());
    
    if (response.getResponseCode() !== 200) {
      console.error('LINE API Error:', response.getContentText());
      
      // ลองใช้ Push Message แทนถ้า Reply ไม่ได้
      console.log('Attempting to use Push Message instead...');
      // แต่เราต้องมี userId สำหรับ push message
    } else {
      console.log('✅ Message sent successfully!');
    }
    
    console.log('=== replyMessage END ===');
    return response;
  } catch (error) {
    console.error('Error in replyMessage:', error);
    console.error('Error details:', error.toString());
    
    // ส่ง simple text response แทน
    try {
      console.log('Attempting simple reply...');
      const simplePayload = { 
        replyToken: replyToken, 
        messages: [{ type: 'text', text: 'ระบบได้รับข้อความแล้ว กำลังประมวลผล...' }] 
      };
      
      const simpleOptions = { 
        method: 'post', 
        contentType: 'application/json', 
        headers: { 'Authorization': 'Bearer ' + getChannelAccessToken() }, 
        payload: JSON.stringify(simplePayload), 
        muteHttpExceptions: true 
      };
      
      UrlFetchApp.fetch(CONFIG.LINE_REPLY_URL, simpleOptions);
    } catch (fallbackError) {
      console.error('Fallback reply also failed:', fallbackError);
    }
  }
}

// ==================== Helper Functions ====================
function isValidPhone(phone) { return /^\d{9,10}$/.test(phone.replace(/\D/g,'')); }
function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function parsePostbackData(dataString) {
    const params = {};
    if (dataString) {
        const pairs = dataString.split('&');
        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i].split('=');
            if (pair.length === 2) {
                params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
            }
        }
    }
    return params;
}
