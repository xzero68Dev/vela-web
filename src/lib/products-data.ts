// ข้อมูลสินค้ากลาง — ใช้ได้ทั้ง server (metadata/JSON-LD) และ client (หน้าแสดงผล)

export type SkuMeta = { bg: string; accent: string; img: string; dark: boolean }

export type SkuSpec = { label: string; value: string }

export type SkuDetail = {
  name: string            // ชื่อสินค้าเต็ม (แบบ Shopee)
  tagline: string         // บรรทัดเด่นใต้ชื่อ
  highlights: string[]    // จุดเด่น (bullet)
  description: string      // รายละเอียดสินค้า (ย่อหน้าเต็ม)
  howto: string           // วิธีชง/ดื่ม
  specs: SkuSpec[]        // ข้อมูลสินค้า (ตาราง)
  storage: string         // การเก็บรักษา
  origin: string          // บรรทัดสั้นแหล่งที่มา
  hashtags: string[]      // แฮชแท็ก
  seoTitle: string        // <title> เฉพาะสินค้า
  seoDescription: string  // meta description เฉพาะสินค้า
}

export const SKU_META: Record<string, SkuMeta> = {
  'ORIGINAL': { bg: '#F5C5A0', accent: '#D64B2A', img: '/products/original.png', dark: false },
  'DARK':     { bg: '#2C1810', accent: '#C17F3A', img: '/products/dark.png',     dark: true  },
  'HONEY':    { bg: '#F9D0DC', accent: '#E05A7A', img: '/products/honey.png',    dark: false },
  'NUTTY':    { bg: '#C8E8F5', accent: '#4A8FBF', img: '/products/nutty.png',    dark: false },
  'FRUITY':   { bg: '#C8EFC0', accent: '#3A8F3A', img: '/products/fruity.png',   dark: false },
  'KYOHO':    { bg: '#2A1A3A', accent: '#9B6AC0', img: '/products/kyoho.png',    dark: true  },
  'GESHA':    { bg: '#F0E0C0', accent: '#C07830', img: '/products/gesha.png',    dark: false },
}

// การเก็บรักษามาตรฐานของหัวเชื้อ 1 ลิตร
const STORAGE_1L =
  'บรรจุในถุงฟอยล์ปิดสนิท แนะนำนำเข้าแช่ตู้เย็นทันทีหลังได้รับสินค้า เก็บได้นาน 1 เดือนเมื่อแช่เย็น (นับจากวันที่จัดส่ง) เขย่าเบา ๆ ก่อนดื่มทุกครั้ง'

// การเก็บรักษาแบบขวดพร้อมดื่ม 200ml (Cold Drip)
const STORAGE_RTD =
  'เก็บในตู้เย็นตลอดเวลา พร้อมดื่มทันที ไม่ต้องเติมน้ำตาล แนะนำดื่มให้หมดหลังเปิดขวด และดื่มภายในวันที่ระบุข้างขวดเพื่อรสชาติที่ดีที่สุด'

export const SKU_DETAIL: Record<string, SkuDetail> = {
  'ORIGINAL': {
    name: 'VeLA Original Concentrate กาแฟสกัดเย็น คั่วกลางเข้ม แม่จันใต้ 1L',
    tagline: 'รสชาติบาลานซ์ ไม่เปรี้ยวไม่ขมไป ผสมได้ทุกเมนู',
    highlights: [
      'รสชาติบาลานซ์ กลมกล่อม ไม่เปรี้ยว ไม่ขมจนเกินไป เหมาะกับคนที่ชอบกาแฟรสกลาง ๆ',
      'หัวเชื้อกาแฟเข้มข้น 1 ลิตร ชงได้หลายแก้ว คุ้มค่า',
      'ผสมได้หลากหลาย ทั้งน้ำเปล่า นม น้ำส้ม น้ำผลไม้ ดื่มได้ทั้งร้อนและเย็น',
      'เมล็ด Arabica จากบ้านแม่จันใต้ คัดด้วยมือ สกัดเย็นนานกว่า 20 ชั่วโมง',
      'ไม่มีน้ำตาล ไม่มีสารปรุงแต่ง ไม่มีวัตถุกันเสีย ผลิตสดทุกวัน',
    ],
    description:
      'VeLA Original คั่วกลางเข้ม (Wash Process) รสชาติบาลานซ์ เป็นสูตรผสมรสชาติสำหรับคนที่ชอบกาแฟรสกลาง ๆ ไม่เปรี้ยวและไม่ขมจนเกินไป เป็นหัวเชื้อกาแฟสกัดเย็นเข้มข้นที่ยืดหยุ่นที่สุด ผสมได้หลากหลายเมนู ไม่ว่าจะเป็นน้ำเปล่า (เย็นหรือร้อนก็ได้) นม น้ำส้ม หรือน้ำผลไม้อื่น ๆ เมล็ดกาแฟมาจากบ้านแม่จันใต้ เป็น Arabica คัดเก็บด้วยมือล้วน ผ่านการสกัดเย็นนานกว่า 20 ชั่วโมง ชงสด ๆ ต่อออเดอร์ ไม่ใส่น้ำตาล ไม่มีสารปรุงแต่ง และไม่ใส่วัตถุกันเสีย',
    howto:
      'ผสมกาแฟ 1 ส่วน : น้ำหรือนม 1 ส่วน (อัตรา 1:1) เช่น กาแฟ 50 มล. + นม 50 มล. = กาแฟพร้อมดื่ม 100 มล. สามารถปรับความเข้มข้นได้ตามชอบ เติมน้ำแข็งเพื่อความสดชื่น หรือชงร้อนก็ได้',
    specs: [
      { label: 'ปริมาณ', value: '1,000 มล. (1 ลิตร)' },
      { label: 'ประเภท', value: 'หัวเชื้อกาแฟสกัดเย็นเข้มข้น (Cold Brew Concentrate)' },
      { label: 'เมล็ดกาแฟ', value: 'Arabica บ้านแม่จันใต้' },
      { label: 'กระบวนการ', value: 'Wash Process' },
      { label: 'ระดับคั่ว', value: 'คั่วกลางเข้ม (Medium–Dark Roast)' },
      { label: 'อัตราส่วนชง', value: '1:1 (ปรับได้ตามชอบ)' },
      { label: 'เวลาสกัด', value: 'มากกว่า 20 ชั่วโมง' },
    ],
    storage: STORAGE_1L,
    origin: 'แม่จันใต้ · Arabica · Wash Process · คั่วกลางเข้ม',
    hashtags: ['กาแฟ', 'ColdBrew', 'กาแฟสกัดเย็น', 'กาแฟแม่จันใต้', 'หัวเชื้อกาแฟ', 'กาแฟอราบิก้า', 'กาแฟพร้อมชง', 'VeLA'],
    seoTitle: 'VeLA Original Concentrate — หัวเชื้อกาแฟสกัดเย็น คั่วกลางเข้ม แม่จันใต้ 1 ลิตร',
    seoDescription:
      'หัวเชื้อกาแฟสกัดเย็น VeLA Original รสบาลานซ์ ไม่เปรี้ยวไม่ขม เมล็ด Arabica บ้านแม่จันใต้ สกัดเย็นกว่า 20 ชม. ไม่มีน้ำตาล ผสมได้ทุกเมนู ผลิตสดทุกวัน ส่งฟรี',
  },

  'DARK': {
    name: 'VeLA Dark Concentrate กาแฟสกัดเย็น คั่วเข้ม แม่จันใต้ 1L',
    tagline: 'สายขม สายเข้ม หอม สะใจสุด ๆ ไม่เปรี้ยว',
    highlights: [
      'รสชาติกาแฟระดับร้านคาเฟ่คุณภาพสูง แต่ราคาสบายกระเป๋า ตกแก้วละ 20–30 บาทเท่านั้น',
      'คั่วเข้มสายขม หอม สะใจ ไม่เปรี้ยว สำหรับคนชอบเข้มอร่อย',
      'เมล็ด Arabica แม่จันใต้ ผสม Robusta ภาคใต้ ให้บอดี้แน่น เข้มถึงใจ',
      'หัวเชื้อกาแฟเข้มข้น 1 ลิตร ผสมได้หลายเมนู ทั้งน้ำ นม น้ำส้ม น้ำผลไม้',
      'สกัดเย็นนานกว่า 20 ชั่วโมง ชงสดต่อออเดอร์ ไม่มีน้ำตาล ไม่มีสารกันเสีย',
    ],
    description:
      'VeLA Dark คั่วเข้ม (Wash Process) สายขมสายเข้ม หอม สะใจสุด ๆ ไม่เปรี้ยว สำหรับคนชอบเข้มอร่อย ให้รสชาติกาแฟระดับร้านคาเฟ่คุณภาพสูงในราคาสบายกระเป๋า ตกแก้วละเพียง 20–30 บาท เหมาะกับคนดื่มเป็นประจำ เป็นหัวเชื้อกาแฟสกัดเย็นเข้มข้น 1,000 มล. ใช้เมล็ด Arabica จากบ้านแม่จันใต้ผสมกับ Robusta จากภาคใต้ เก็บเกี่ยวด้วยมือ (Hand-Picked) คัดเฉพาะผลสุกเต็มที่ สกัดที่อุณหภูมิต่ำนานกว่า 20 ชั่วโมง ทุกกระบวนการผ่านการรับรองความสะอาดปลอดภัย ชงสดใหม่ตามออเดอร์ ไม่สต๊อกสินค้า ไม่ปรุงแต่ง ไม่เติมน้ำตาล ไม่ใส่สารกันเสีย',
    howto:
      'ผสมกาแฟ 1 ส่วน : น้ำหรือนม 1 ส่วน (อัตรา 1:1) ปรับเพิ่มลดได้ตามชอบ ผสมได้ทั้งน้ำเปล่า (เย็นหรือร้อน) นม น้ำส้ม หรือน้ำผลไม้อื่น ๆ เหมาะทำลาเต้เย็น หรือดื่มแบล็คกาแฟใส่น้ำแข็ง',
    specs: [
      { label: 'ปริมาณ', value: '1,000 มล. (1 ลิตร)' },
      { label: 'ประเภท', value: 'หัวเชื้อกาแฟสกัดเย็นเข้มข้น (Cold Brew Concentrate)' },
      { label: 'เมล็ดกาแฟ', value: 'Arabica (แม่จันใต้) ผสม Robusta (ภาคใต้)' },
      { label: 'กระบวนการ', value: 'Wash Process' },
      { label: 'ระดับคั่ว', value: 'คั่วเข้ม (Dark Roast)' },
      { label: 'อัตราส่วนชง', value: '1:1 (ปรับได้ตามชอบ)' },
      { label: 'เวลาสกัด', value: 'มากกว่า 20 ชั่วโมง' },
    ],
    storage: STORAGE_1L,
    origin: 'แม่จันใต้ + ภาคใต้ · Arabica ผสม Robusta · Wash Process · คั่วเข้ม',
    hashtags: ['กาแฟ', 'กาแฟสกัดเย็นเข้มข้น', 'ColdBrew', 'ColdBrewConcentrate', 'Coldbrewcoffee', 'กาแฟแม่จันใต้', 'กาแฟสกัดเย็น', 'กาแฟดื่มง่าย', 'คั่วเข้ม', 'กาแฟเข้มๆ', 'Dark'],
    seoTitle: 'VeLA Dark Concentrate — หัวเชื้อกาแฟสกัดเย็น คั่วเข้ม แม่จันใต้ 1 ลิตร',
    seoDescription:
      'หัวเชื้อกาแฟสกัดเย็น VeLA Dark คั่วเข้มสายขม หอม สะใจ ไม่เปรี้ยว เมล็ด Arabica แม่จันใต้ ผสม Robusta ภาคใต้ ตกแก้วละ 20–30 บาท สกัดเย็นกว่า 20 ชม. ไม่มีน้ำตาล ส่งฟรี',
  },

  'HONEY': {
    name: 'VeLA Honey Concentrate กาแฟสกัดเย็น Honey Process แม่จันใต้ 1L',
    tagline: 'หอมผลไม้ เปรี้ยวเบา ๆ หวานปลาย',
    highlights: [
      'หอมกลิ่นผลไม้ เปรี้ยวเบา ๆ ตามด้วยความหวานปลาย',
      'ฟีลธรรมชาติจากเมล็ดแม่จันใต้ Honey Process',
      'ผสมได้หลากหลาย นม น้ำส้ม น้ำผลไม้ หรือดื่มดำ',
      'สกัดเย็นนานกว่า 20 ชั่วโมง ชงสดต่อออเดอร์',
      'ไม่มีน้ำตาล ไม่มีสารปรุงแต่ง ไม่มีวัตถุกันเสีย',
    ],
    description:
      'VeLA Honey คั่วกลาง (Honey Process) หอมกลิ่นผลไม้ เปรี้ยวเบา ๆ หวานปลาย ให้ฟีลธรรมชาติจากเมล็ดบ้านแม่จันใต้ เหมาะสำหรับคนที่ชอบกลิ่นและรสผลไม้ ผสมได้หลากหลายทั้งใส่นม น้ำส้ม หรือน้ำผลไม้ต่าง ๆ เป็นหัวเชื้อกาแฟสกัดเย็นเข้มข้น สกัดนานกว่า 20 ชั่วโมง ไม่ใส่น้ำตาล ไม่มีสารปรุงแต่ง',
    howto:
      'ผสมกาแฟ 1 ส่วน : น้ำหรือนม 1 ส่วน (อัตรา 1:1) เหมาะทำน้ำผลไม้ผสมกาแฟ หรือลาเต้ใส่น้ำผึ้ง เติมน้ำแข็งเพื่อความสดชื่น',
    specs: [
      { label: 'ปริมาณ', value: '1,000 มล. (1 ลิตร)' },
      { label: 'ประเภท', value: 'หัวเชื้อกาแฟสกัดเย็นเข้มข้น (Cold Brew Concentrate)' },
      { label: 'เมล็ดกาแฟ', value: 'Arabica บ้านแม่จันใต้' },
      { label: 'กระบวนการ', value: 'Honey Process' },
      { label: 'ระดับคั่ว', value: 'คั่วกลาง (Medium Roast)' },
      { label: 'อัตราส่วนชง', value: '1:1 (ปรับได้ตามชอบ)' },
      { label: 'เวลาสกัด', value: 'มากกว่า 20 ชั่วโมง' },
    ],
    storage: STORAGE_1L,
    origin: 'แม่จันใต้ · Honey Process · คั่วกลาง',
    hashtags: ['กาแฟ', 'ColdBrew', 'กาแฟสกัดเย็น', 'HoneyProcess', 'กาแฟแม่จันใต้', 'หัวเชื้อกาแฟ', 'กาแฟหอมผลไม้', 'VeLA'],
    seoTitle: 'VeLA Honey Concentrate — หัวเชื้อกาแฟสกัดเย็น Honey Process แม่จันใต้ 1 ลิตร',
    seoDescription:
      'หัวเชื้อกาแฟสกัดเย็น VeLA Honey หอมกลิ่นผลไม้ เปรี้ยวเบา ๆ หวานปลาย เมล็ดแม่จันใต้ Honey Process สกัดเย็นกว่า 20 ชม. ไม่มีน้ำตาล ผลิตสดทุกวัน ส่งฟรี',
  },

  'NUTTY': {
    name: 'VeLA Nutty Milk Concentrate กาแฟสกัดเย็น หอมนัว เข้ากับนม 1L',
    tagline: 'หอมทะลุนม มันนัวสุด ๆ',
    highlights: [
      'หอมทะลุนม มันนัว เข้ากับนมได้ดีที่สุด',
      'สายเมนูนม ๆ ต้องลอง ทำนมกาแฟ ใส่ไอศกรีม หรือ smoothie',
      'เมล็ด Brazil Cerrado (Natural Process) คั่วกลาง',
      'หัวเชื้อกาแฟเข้มข้น 1 ลิตร ชงได้หลายแก้ว',
      'ไม่มีน้ำตาล ไม่มีสารปรุงแต่ง ไม่มีวัตถุกันเสีย',
    ],
    description:
      'VeLA Nutty Milk คั่วกลาง (Natural Process) จากเมล็ด Brazil Cerrado หอมทะลุนม มันนัว ผสมกับนมลงตัวที่สุด ใครชอบเมนูนม ๆ จะติดใจ เป็นหัวเชื้อกาแฟสกัดเย็นเข้มข้น ปริมาณ 1,000 มล. สกัดนานกว่า 20 ชั่วโมง ชงสดต่อออเดอร์ ไม่ใส่น้ำตาล ไม่มีสารปรุงแต่ง',
    howto:
      'ผสมกาแฟ 1 ส่วน : นม 1 ส่วน (อัตรา 1:1) เหมาะทำนมกาแฟ ใส่ไอศกรีม หรือ smoothie กาแฟนม เติมน้ำแข็งเพื่อความสดชื่น',
    specs: [
      { label: 'ปริมาณ', value: '1,000 มล. (1 ลิตร)' },
      { label: 'ประเภท', value: 'หัวเชื้อกาแฟสกัดเย็นเข้มข้น (Cold Brew Concentrate)' },
      { label: 'เมล็ดกาแฟ', value: 'Brazil Cerrado' },
      { label: 'กระบวนการ', value: 'Natural Process' },
      { label: 'ระดับคั่ว', value: 'คั่วกลาง (Medium Roast)' },
      { label: 'อัตราส่วนชง', value: '1:1 (ปรับได้ตามชอบ)' },
      { label: 'เวลาสกัด', value: 'มากกว่า 20 ชั่วโมง' },
    ],
    storage: STORAGE_1L,
    origin: 'Brazil Cerrado · Natural Process · คั่วกลาง',
    hashtags: ['กาแฟ', 'ColdBrew', 'กาแฟสกัดเย็น', 'กาแฟนม', 'NuttyMilk', 'หัวเชื้อกาแฟ', 'กาแฟหอมนัว', 'VeLA'],
    seoTitle: 'VeLA Nutty Milk Concentrate — หัวเชื้อกาแฟสกัดเย็น หอมนัว เข้ากับนม 1 ลิตร',
    seoDescription:
      'หัวเชื้อกาแฟสกัดเย็น VeLA Nutty Milk หอมทะลุนม มันนัว เข้ากับนมสุด ๆ เมล็ด Brazil Cerrado คั่วกลาง สกัดเย็นกว่า 20 ชม. ไม่มีน้ำตาล ผลิตสดทุกวัน ส่งฟรี',
  },

  'FRUITY': {
    name: 'VeLA Fruity Concentrate กาแฟสกัดเย็น กลิ่นดอกไม้ รสเบอร์รี่ 1L',
    tagline: 'รสเบอร์รี่ กลิ่นดอกไม้ หวานสดชื่น',
    highlights: [
      'หอมกลิ่นดอกไม้ รสเบอร์รี่ ไลท์ ๆ หวานจากธรรมชาติ',
      'สดชื่น เหมาะทำ sparkling coffee หรือ coffee tonic',
      'เมล็ด Myanmar (Natural Process) คั่วกลางอ่อน',
      'สกัดเย็นนานกว่า 20 ชั่วโมง ชงสดต่อออเดอร์',
      'ไม่มีน้ำตาล ไม่มีสารปรุงแต่ง ไม่มีวัตถุกันเสีย',
    ],
    description:
      'VeLA Fruity คั่วกลางอ่อน (Natural Process) จากเมล็ด Myanmar หอมหึ่งด้วยกลิ่นดอกไม้และรสชาติเบอร์รี่ ดื่มง่ายไลท์ ๆ หวานจากธรรมชาติ สดชื่น เป็นหัวเชื้อกาแฟสกัดเย็นเข้มข้น สกัดนานกว่า 20 ชั่วโมง ไม่ใส่น้ำตาล ไม่มีสารปรุงแต่ง เหมาะกับคนที่ชอบกาแฟกลิ่นผลไม้สดใส',
    howto:
      'ผสมกาแฟ 1 ส่วน : น้ำหรือน้ำผลไม้ 1 ส่วน เหมาะทำ sparkling coffee หรือ coffee tonic ใส่น้ำโซดาและน้ำแข็งเพื่อความซ่าสดชื่น',
    specs: [
      { label: 'ปริมาณ', value: '1,000 มล. (1 ลิตร)' },
      { label: 'ประเภท', value: 'หัวเชื้อกาแฟสกัดเย็นเข้มข้น (Cold Brew Concentrate)' },
      { label: 'เมล็ดกาแฟ', value: 'Myanmar' },
      { label: 'กระบวนการ', value: 'Natural Process' },
      { label: 'ระดับคั่ว', value: 'คั่วกลางอ่อน (Medium–Light Roast)' },
      { label: 'อัตราส่วนชง', value: '1:1 (ปรับได้ตามชอบ)' },
      { label: 'เวลาสกัด', value: 'มากกว่า 20 ชั่วโมง' },
    ],
    storage: STORAGE_1L,
    origin: 'Myanmar · Natural Process · คั่วกลางอ่อน',
    hashtags: ['กาแฟ', 'ColdBrew', 'กาแฟสกัดเย็น', 'กาแฟผลไม้', 'Fruity', 'หัวเชื้อกาแฟ', 'CoffeeTonic', 'VeLA'],
    seoTitle: 'VeLA Fruity Concentrate — หัวเชื้อกาแฟสกัดเย็น กลิ่นดอกไม้ รสเบอร์รี่ 1 ลิตร',
    seoDescription:
      'หัวเชื้อกาแฟสกัดเย็น VeLA Fruity หอมกลิ่นดอกไม้ รสเบอร์รี่ หวานสดชื่นจากธรรมชาติ เมล็ด Myanmar คั่วกลางอ่อน สกัดเย็นกว่า 20 ชม. ไม่มีน้ำตาล ผลิตสดทุกวัน ส่งฟรี',
  },

  'KYOHO': {
    name: 'VeLA Kyoho Cold Drip Premium กาแฟสกัดเย็นแบบหยด 200ml',
    tagline: 'Kyoho Grape · Mulberry · Blueberry · Caramel',
    highlights: [
      'กลิ่นองุ่นไคโฮ หม่อน บลูเบอร์รี่ ปิดท้ายคาราเมล',
      'สกัดแบบ Cold Drip หยดช้า ๆ 3–8 ชั่วโมง เข้มข้น กลมกล่อม',
      'ขวดพร้อมดื่ม 200 มล. เสิร์ฟ on the rocks ได้เลย',
      'ไม่ต้องเติมน้ำตาล ไม่มีสารปรุงแต่ง',
      'เมล็ดพรีเมียม หมักด้วย Wine Yeast เพิ่มมิติกลิ่นหอมหวาน',
    ],
    description:
      'VeLA Kyoho Cold Drip Premium ใช้การสกัดแบบหยดน้ำให้ไหลผ่านกาแฟอย่างช้า ๆ ใช้เวลานาน 3–8 ชั่วโมง เพื่อให้ได้รสชาติที่เข้มข้น กลมกล่อม และหอมหวาน โดดเด่นด้วยกลิ่นองุ่นไคโฮ หม่อน บลูเบอร์รี่ และปิดท้ายด้วยคาราเมล เป็นกาแฟขวดพร้อมดื่มระดับพรีเมียม',
    howto:
      'พร้อมดื่มได้เลย 200 มล. เสิร์ฟแบบ on the rocks หรือผสมนมเล็กน้อย ไม่ต้องเติมน้ำตาล',
    specs: [
      { label: 'ปริมาณ', value: '200 มล. (พร้อมดื่ม)' },
      { label: 'ประเภท', value: 'Cold Drip Premium (ขวดพร้อมดื่ม)' },
      { label: 'แหล่งเมล็ด', value: 'Ethiopia Guji Sidama' },
      { label: 'กระบวนการ', value: 'Wine Yeast Fermentation' },
      { label: 'ระดับคั่ว', value: 'Medium–Light Roast' },
      { label: 'เวลาสกัด', value: '3–8 ชั่วโมง (แบบหยด)' },
    ],
    storage: STORAGE_RTD,
    origin: 'Ethiopia Guji Sidama · Wine Yeast Fermentation · Medium–Light Roast',
    hashtags: ['กาแฟ', 'ColdDrip', 'กาแฟสกัดเย็น', 'Kyoho', 'กาแฟพรีเมียม', 'กาแฟพร้อมดื่ม', 'VeLA'],
    seoTitle: 'VeLA Kyoho Cold Drip Premium — กาแฟสกัดเย็นแบบหยด พร้อมดื่ม 200 มล.',
    seoDescription:
      'VeLA Kyoho Cold Drip Premium กลิ่นองุ่นไคโฮ หม่อน บลูเบอร์รี่ คาราเมล สกัดแบบหยด 3–8 ชม. ขวดพร้อมดื่ม 200 มล. ไม่ต้องเติมน้ำตาล ระดับพรีเมียม ส่งฟรี',
  },

  'GESHA': {
    name: 'VeLA Gesha Cold Drip Premium กาแฟสกัดเย็นแบบหยด 200ml',
    tagline: 'Floral · Black Tea · Mango · Long Aftertaste',
    highlights: [
      'กลิ่นดอกไม้ ชาดำ มะม่วงสุก อาฟเตอร์เทสต์ยาว',
      'Ethiopia Gesha (Geisha) เกรด G1 Natural Process',
      'เก็บผลเชอร์รี่ด้วยมือล้วน จากแหล่งปลูก Bench Maji',
      'สกัดแบบ Cold Drip หยดช้า ๆ เข้มข้น กลมกล่อม',
      'ขวดพร้อมดื่ม 200 มล. ไม่ต้องเติมน้ำตาล',
    ],
    description:
      'VeLA Gesha Cold Drip Premium จากเมล็ด ETHIOPIA GESHA (Geisha) Natural Process แหล่งปลูก Bench Maji เก็บผลเชอร์รี่ด้วยมือล้วน (Hand Picked) เกรด G1 ระดับความสูง 2,000–2,300 เมตรเหนือระดับน้ำทะเล โดดเด่นด้วยกลิ่นดอกไม้ ชาดำ มะม่วงสุก และอาฟเตอร์เทสต์ที่ยาวนาน เป็นกาแฟขวดพร้อมดื่มระดับพรีเมียม',
    howto:
      'พร้อมดื่มได้เลย 200 มล. เสิร์ฟแบบ on the rocks หรือผสมนมเล็กน้อย ไม่ต้องเติมน้ำตาล',
    specs: [
      { label: 'ปริมาณ', value: '200 มล. (พร้อมดื่ม)' },
      { label: 'ประเภท', value: 'Cold Drip Premium (ขวดพร้อมดื่ม)' },
      { label: 'แหล่งเมล็ด', value: 'Ethiopia Gesha — Bench Maji (G1)' },
      { label: 'กระบวนการ', value: 'Natural Process' },
      { label: 'ระดับคั่ว', value: 'Omni Roast' },
      { label: 'ความสูง', value: '2,000–2,300 เมตร' },
    ],
    storage: STORAGE_RTD,
    origin: 'Ethiopia Gesha · Natural Process · Omni Roast',
    hashtags: ['กาแฟ', 'ColdDrip', 'กาแฟสกัดเย็น', 'Gesha', 'Geisha', 'กาแฟพรีเมียม', 'กาแฟพร้อมดื่ม', 'VeLA'],
    seoTitle: 'VeLA Gesha Cold Drip Premium — กาแฟสกัดเย็นแบบหยด พร้อมดื่ม 200 มล.',
    seoDescription:
      'VeLA Gesha Cold Drip Premium เกรด G1 กลิ่นดอกไม้ ชาดำ มะม่วงสุก อาฟเตอร์เทสต์ยาว Ethiopia Gesha Natural Process ขวดพร้อมดื่ม 200 มล. ระดับพรีเมียม ส่งฟรี',
  },
}

export const ALL_SKUS = ['ORIGINAL', 'DARK', 'HONEY', 'NUTTY', 'FRUITY', 'KYOHO', 'GESHA']

export function resolveSku(raw: string): string {
  const s = (raw || '').toUpperCase().replace('-200', '')
  return SKU_META[s] ? s : 'ORIGINAL'
}
