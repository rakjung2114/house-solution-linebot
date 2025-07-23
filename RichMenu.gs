// ==================== LINE Rich Menu และ Flex Menu System ====================
// Google Apps Script สำหรับสร้างและจัดการ LINE Rich Menu และ Flex Message

// ==================== Rich Menu Main Setup Function ====================
/**
 * ฟังก์ชันหลักสำหรับสร้าง Rich Menu สำหรับ LINE Bot
 * รองรับการสร้าง, อัปโหลดรูปภาพ, และตั้งค่าเป็นเมนูเริ่มต้น
 * 
 * วิธีใช้งาน:
 * 1. เตรียมรูปภาพ Rich Menu ขนาด 2500x1686 px
 * 2. อัปโหลดรูปไปที่ hosting (เช่น Google Drive, Imgur, etc.)
 * 3. ใส่ URL ของรูปใน imageUrl
 * 4. รันฟังก์ชัน setupRichMenu()
 */
function setupRichMenu() {
    try {
        // *** สำคัญ: ใส่ URL ของรูปภาพ Rich Menu ขนาด 2500x1686 px ***
        const imageUrl = 'YOUR_RICH_MENU_IMAGE_URL';
        
        if (imageUrl === 'YOUR_RICH_MENU_IMAGE_URL') {
            throw new Error("กرุณาใส่ URL ของรูปภาพ Rich Menu ในตัวแปร imageUrl");
        }

        console.log('🚀 เริ่มการตั้งค่า Rich Menu...');
        
        // สร้าง Rich Menu
        const richMenuId = createRichMenuAPI();
        console.log('✅ สร้าง Rich Menu ID:', richMenuId);
        
        if (!richMenuId) {
            throw new Error("ไม่สามารถสร้าง Rich Menu ID ได้");
        }
        
        // รอให้ LINE ประมวลผล
        Utilities.sleep(2000);
        
        // อัปโหลดรูปภาพ
        console.log('📷 กำลังอัปโหลดรูปภาพ...');
        uploadRichMenuImage(richMenuId, imageUrl);
        
        // รอให้ LINE ประมวลผล
        Utilities.sleep(2000);
        
        // ตั้งค่าเป็นเมนูเริ่มต้น
        console.log('⚙️ ตั้งค่าเป็นเมนูเริ่มต้น...');
        setDefaultRichMenu(richMenuId);
        
        console.log('🎉 ตั้งค่า Rich Menu เสร็จสมบูรณ์! ID:', richMenuId);
        return richMenuId;
        
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาดในการตั้งค่า Rich Menu:', error.message);
        throw error;
    }
}

// ==================== Rich Menu API Functions ====================
/**
 * สร้าง Rich Menu ผ่าน LINE Messaging API
 * Rich Menu ขนาด 2500x1686 px แบ่งเป็น 6 พื้นที่ (2 แถว x 3 คอลัมน์)
 */
function createRichMenuAPI() {
    const richMenuObject = {
        size: { width: 2500, height: 1686 },
        selected: true,
        name: "The House Solution Main Menu",
        chatBarText: "เมนูหลัก",
        areas: [
            // แถวบน - ตรวจสอบบิล, แจ้งซ่อม, ยืมครุภัณฑ์
            { 
                bounds: { x: 0, y: 0, width: 833, height: 843 }, 
                action: { type: "message", text: "ตรวจสอบบิล" }
            },
            { 
                bounds: { x: 833, y: 0, width: 834, height: 843 }, 
                action: { type: "message", text: "แจ้งซ่อม" }
            },
            { 
                bounds: { x: 1667, y: 0, width: 833, height: 843 }, 
                action: { type: "message", text: "ยืมครุภัณฑ์" }
            },
            // แถวล่าง - กิจกรรม, ติดต่อ, โปรไฟล์
            { 
                bounds: { x: 0, y: 843, width: 833, height: 843 }, 
                action: { type: "message", text: "กิจกรรม" }
            },
            { 
                bounds: { x: 833, y: 843, width: 834, height: 843 }, 
                action: { type: "message", text: "ติดต่อ" }
            },
            { 
                bounds: { x: 1667, y: 843, width: 833, height: 843 }, 
                action: { type: "message", text: "โปรไฟล์" }
            }
        ]
    };

    const url = 'https://api.line.me/v2/bot/richmenu';
    const options = {
        method: 'POST',
        headers: { 
            'Authorization': 'Bearer ' + CONFIG.CHANNEL_ACCESS_TOKEN, 
            'Content-Type': 'application/json' 
        },
        payload: JSON.stringify(richMenuObject),
        muteHttpExceptions: true
    };

    try {
        const response = UrlFetchApp.fetch(url, options);
        const result = JSON.parse(response.getContentText());
        
        if (response.getResponseCode() === 200 && result.richMenuId) {
            console.log('✅ สร้าง Rich Menu สำเร็จ:', result.richMenuId);
            return result.richMenuId;
        } else {
            console.error('❌ เกิดข้อผิดพลาดในการสร้าง Rich Menu:', result);
            return null;
        }
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาดในการเรียก API:', error.message);
        return null;
    }
}

/**
 * อัปโหลดรูปภาพไปยัง Rich Menu ที่สร้างแล้ว
 * @param {string} richMenuId - ID ของ Rich Menu
 * @param {string} imageUrl - URL ของรูปภาพ (ขนาด 2500x1686 px)
 */
function uploadRichMenuImage(richMenuId, imageUrl) {
    try {
        console.log('📥 กำลังดาวน์โหลดรูปภาพจาก:', imageUrl);
        const imageBlob = UrlFetchApp.fetch(imageUrl).getBlob();
        
        const url = `https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`;
        const options = {
            method: 'POST',
            headers: { 
                'Authorization': 'Bearer ' + CONFIG.CHANNEL_ACCESS_TOKEN, 
                'Content-Type': imageBlob.getContentType() 
            },
            payload: imageBlob,
            muteHttpExceptions: true
        };
        
        const response = UrlFetchApp.fetch(url, options);
        
        if (response.getResponseCode() === 200) {
            console.log('✅ อัปโหลดรูปภาพสำเร็จ');
        } else {
            console.error('❌ อัปโหลดรูปภาพล้มเหลว:', response.getContentText());
        }
        
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาดในการอัปโหลดรูป:', error.message);
        throw error;
    }
}

/**
 * ตั้งค่า Rich Menu เป็นเมนูเริ่มต้นสำหรับผู้ใช้ทั้งหมด
 * @param {string} richMenuId - ID ของ Rich Menu
 */
function setDefaultRichMenu(richMenuId) {
    try {
        const url = `https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`;
        const options = {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + CONFIG.CHANNEL_ACCESS_TOKEN },
            muteHttpExceptions: true
        };
        
        const response = UrlFetchApp.fetch(url, options);
        
        if (response.getResponseCode() === 200) {
            console.log('✅ ตั้งค่าเมนูเริ่มต้นสำเร็จ');
        } else {
            console.error('❌ ตั้งค่าเมนูเริ่มต้นล้มเหลว:', response.getContentText());
        }
        
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาดในการตั้งค่าเมนู:', error.message);
        throw error;
    }
}

// ==================== Flex Message Creator Functions ====================
/**
 * สร้าง Flex Menu สำหรับแสดงเมนูหลักในรูปแบบ Bubble
 * ใช้เป็นทางเลือกแทน Rich Menu หรือสำหรับแสดงเมนูใน chat
 */
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

/**
 * สร้างปุ่มเมนูสำหรับ Flex Message
 * @param {string} icon - Emoji หรือ icon
 * @param {string} label - ข้อความบนปุ่ม
 * @param {string} actionText - ข้อความที่จะส่งเมื่อกดปุ่ม
 */
function createMenuButton(icon, label, actionText) {
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
            text: actionText
        }
    };
}

/**
 * สร้าง Flex Message สำหรับแสดงข้อมูลใบแจ้งหนี้
 * @param {Object} invoice - ข้อมูลใบแจ้งหนี้
 */
function createInvoiceFlexMessage(invoice) {
    // กำหนดสีตามสถานะ
    const statusColor = invoice.status === 'Paid' ? '#00C851' : 
                       invoice.status === 'Overdue' ? '#ff4444' : '#ffbb33';
    
    // แปลสถานะเป็นภาษาไทย
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
                    // บ้านเลขที่
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
                                text: invoice.unit_number || '-',
                                flex: 5
                            }
                        ]
                    },
                    {
                        type: 'separator',
                        margin: 'md'
                    },
                    // รายละเอียด
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
                                text: invoice.description || '-',
                                flex: 5,
                                wrap: true
                            }
                        ],
                        margin: 'md'
                    },
                    // จำนวนเงิน
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
                                text: '฿' + (invoice.total_amount || 0).toFixed(2),
                                flex: 5,
                                size: 'lg',
                                weight: 'bold',
                                color: '#ff5722'
                            }
                        ],
                        margin: 'md'
                    },
                    // วันครบกำหนด
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
                                text: invoice.due_date ? 
                                      new Date(invoice.due_date).toLocaleDateString('th-TH') : '-',
                                flex: 5
                            }
                        ],
                        margin: 'md'
                    },
                    // สถานะ
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

// ==================== Utility Functions ====================
/**
 * สร้าง Flex Message สำหรับแสดงข้อมูลการซ่อมบำรุง
 * @param {Object} maintenance - ข้อมูลการซ่อมบำรุง
 */
function createMaintenanceFlexMessage(maintenance) {
    const statusColor = maintenance.status === 'Completed' ? '#00C851' :
                       maintenance.status === 'In Progress' ? '#ffbb33' : '#ff4444';
    
    const statusText = maintenance.status === 'Completed' ? 'เสร็จสมบูรณ์' :
                      maintenance.status === 'In Progress' ? 'กำลังดำเนินการ' : 'รอดำเนินการ';

    return {
        type: 'flex',
        altText: `การซ่อมบำรุง ${maintenance.maintenance_id}`,
        contents: {
            type: 'bubble',
            header: {
                type: 'box',
                layout: 'vertical',
                contents: [
                    {
                        type: 'text',
                        text: '🔧 การซ่อมบำรุง',
                        color: '#ffffff',
                        size: 'xl',
                        weight: 'bold'
                    },
                    {
                        type: 'text',
                        text: maintenance.maintenance_id || 'N/A',
                        color: '#ffffff',
                        size: 'md'
                    }
                ],
                backgroundColor: '#34A853',
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
                            { type: 'text', text: 'หมวดหมู่:', color: '#666666', flex: 3 },
                            { type: 'text', text: maintenance.category || '-', flex: 5 }
                        ]
                    },
                    { type: 'separator', margin: 'md' },
                    {
                        type: 'box',
                        layout: 'horizontal',
                        contents: [
                            { type: 'text', text: 'รายละเอียด:', color: '#666666', flex: 3 },
                            { type: 'text', text: maintenance.description || '-', flex: 5, wrap: true }
                        ],
                        margin: 'md'
                    },
                    {
                        type: 'box',
                        layout: 'horizontal',
                        contents: [
                            { type: 'text', text: 'สถานะ:', color: '#666666', flex: 3 },
                            { type: 'text', text: statusText, flex: 5, color: statusColor, weight: 'bold' }
                        ],
                        margin: 'md'
                    }
                ],
                paddingAll: '20px'
            }
        }
    };
}

/**
 * สร้าง Quick Reply สำหรับเมนูหลัก
 */
function createQuickReplyMenu() {
    return {
        items: [
            { type: 'action', action: { type: 'message', label: '💰 ตรวจสอบบิล', text: 'ตรวจสอบบิล' }},
            { type: 'action', action: { type: 'message', label: '🔧 แจ้งซ่อม', text: 'แจ้งซ่อม' }},
            { type: 'action', action: { type: 'message', label: '📦 ยืมครุภัณฑ์', text: 'ยืมครุภัณฑ์' }},
            { type: 'action', action: { type: 'message', label: '📅 กิจกรรม', text: 'กิจกรรม' }},
            { type: 'action', action: { type: 'message', label: '📞 ติดต่อ', text: 'ติดต่อ' }},
            { type: 'action', action: { type: 'message', label: '👤 โปรไฟล์', text: 'โปรไฟล์' }}
        ]
    };
}
