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
// ใช้ถุงฟอยล์บรรจุ เก็บได้นานกว่าปกติ · แนะนำแช่เย็นทันทีหลังได้รับ (ไม่ใส่สารกันเสีย) · เก็บได้ 1 เดือนเมื่อแช่เย็น
const STORAGE_1L =
  'บรรจุในถุงฟอยล์จึงเก็บได้นานกว่าปกติ เมื่อได้รับสินค้าแล้วแนะนำให้แช่เย็นทันที เนื่องจากไม่ใส่สารกันเสีย สามารถแช่เย็นเก็บไว้ได้นาน 1 เดือน (นับจากวันที่รอบส่ง)'

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
    name: 'Honey VeLA Concentrate กาแฟสกัดเย็น คั่วกลาง แม่จันใต้ Honey Process 1L',
    tagline: 'หอมผลไม้ เปรี้ยวเบา ๆ หวานปลาย ดื่มง่าย สบายคอ',
    highlights: [
      'หอมกลิ่นผลไม้ เปรี้ยวเบา ๆ หวานปลาย ฟีลธรรมชาติจากป่าบ้านแม่จันใต้ลอยมาเลย',
      'สำหรับคนชอบกลิ่นผลไม้ ดื่มง่าย ๆ ไลท์ ๆ สบายคอ',
      'เมล็ด Arabica แม่จันใต้ แปรรูปแบบ Honey Process (กึ่งล้าง)',
      'หัวเชื้อกาแฟเข้มข้น 1 ลิตร ผสมได้หลายเมนู ทั้งน้ำ นม น้ำส้ม น้ำผลไม้',
      'สกัดเย็นนานกว่า 20 ชั่วโมง ชงสดต่อออเดอร์ ไม่มีน้ำตาล ไม่มีสารกันเสีย',
    ],
    description:
      'VeLA Honey คั่วกลาง (Honey Process) หอมกลิ่นผลไม้ เปรี้ยวเบา ๆ หวานปลาย ให้ฟีลธรรมชาติจากป่าบ้านแม่จันใต้ลอยมาเลย สำหรับคนชอบกลิ่นผลไม้ ดื่มง่าย ๆ ไลท์ ๆ สบายคอ เป็นหัวเชื้อกาแฟสกัดเย็นเข้มข้น 1,000 มล. ใช้เมล็ด Arabica คุณภาพสูงจากบ้านแม่จันใต้ หนึ่งในแหล่งกาแฟพิเศษ (Specialty Coffee) ของไทย เก็บเกี่ยวด้วยมือ (Hand-Picked) คัดเฉพาะผลสุกเต็มที่ สกัดที่อุณหภูมิต่ำนานกว่า 20 ชั่วโมง ทุกกระบวนการผ่านการรับรองความสะอาดปลอดภัย ชงสดใหม่ตามออเดอร์ ไม่สต๊อกสินค้า ไม่ปรุงแต่ง ไม่เติมน้ำตาล ไม่ใส่สารกันเสีย',
    howto:
      'ผสมกาแฟ 1 ส่วน : น้ำหรือนม 1 ส่วน (อัตรา 1:1) ปรับเพิ่มลดได้ตามชอบ ผสมได้ทั้งน้ำเปล่า (เย็นหรือร้อน) นม น้ำส้ม หรือน้ำผลไม้อื่น ๆ เหมาะทำน้ำผลไม้ผสมกาแฟ หรือลาเต้ใส่น้ำผึ้ง',
    specs: [
      { label: 'ปริมาณ', value: '1,000 มล. (1 ลิตร)' },
      { label: 'ประเภท', value: 'หัวเชื้อกาแฟสกัดเย็นเข้มข้น (Cold Brew Concentrate)' },
      { label: 'เมล็ดกาแฟ', value: 'Arabica บ้านแม่จันใต้' },
      { label: 'กระบวนการ', value: 'Honey Process (กึ่งล้าง)' },
      { label: 'ระดับคั่ว', value: 'คั่วกลาง (Medium Roast)' },
      { label: 'อัตราส่วนชง', value: '1:1 (ปรับได้ตามชอบ)' },
      { label: 'เวลาสกัด', value: 'มากกว่า 20 ชั่วโมง' },
    ],
    storage: STORAGE_1L,
    origin: 'แม่จันใต้ · Arabica · Honey Process · คั่วกลาง',
    hashtags: ['กาแฟ', 'กาแฟสกัดเย็นเข้มข้น', 'ColdBrew', 'ColdBrewConcentrate', 'Coldbrewcoffee', 'กาแฟแม่จันใต้', 'กาแฟสกัดเย็น', 'กาแฟดื่มง่าย', 'SpecialtyCoffee', 'HoneyProcess'],
    seoTitle: 'Honey VeLA Concentrate — หัวเชื้อกาแฟสกัดเย็น คั่วกลาง แม่จันใต้ Honey Process 1 ลิตร',
    seoDescription:
      'หัวเชื้อกาแฟสกัดเย็น VeLA Honey หอมกลิ่นผลไม้ เปรี้ยวเบา ๆ หวานปลาย ดื่มง่ายไลท์ ๆ เมล็ด Arabica แม่จันใต้ Honey Process สกัดเย็นกว่า 20 ชม. ไม่มีน้ำตาล ส่งฟรี',
  },

  'NUTTY': {
    name: 'VeLA Nutty Milk Concentrate กาแฟสกัดเย็น คั่วกลาง Brazil Natural Process 1L',
    tagline: 'หอมทะลุนม มันนัว ผสมนมลงตัวสุด ๆ',
    highlights: [
      'หอมทะลุนม มันนัว ผสมกับนมลงตัวสุด ๆ ใครชอบเมนูนม ๆ จะติดใจ',
      'เมล็ด Brazil Cerrado แปรรูปแบบ Natural Process คั่วกลาง',
      'หัวเชื้อกาแฟเข้มข้น 1 ลิตร ผสมได้หลายเมนู ทั้งน้ำ นม น้ำส้ม น้ำผลไม้',
      'สกัดเย็นนานกว่า 20 ชั่วโมง ชงสดต่อออเดอร์',
      'ไม่มีน้ำตาล ไม่มีสารปรุงแต่ง ไม่มีวัตถุกันเสีย',
    ],
    description:
      'VeLA Nutty Milk คั่วกลาง (Natural Process) จากเมล็ด Brazil Cerrado หอมทะลุนม มันนัว ผสมกับนมลงตัวสุด ๆ ใครชอบเมนูนม ๆ จะติดใจ เป็นหัวเชื้อกาแฟสกัดเย็นเข้มข้น 1,000 มล. สกัดที่อุณหภูมิต่ำนานกว่า 20 ชั่วโมง ด้วยกระบวนการพิเศษจนได้รสชาติเป็นเอกลักษณ์ ทุกกระบวนการผ่านการรับรองความสะอาดปลอดภัย ชงสดใหม่ตามออเดอร์ ไม่สต๊อกสินค้า ไม่ปรุงแต่ง ไม่เติมน้ำตาล ไม่ใส่สารกันเสีย',
    howto:
      'ผสมกาแฟ 1 ส่วน : นม 1 ส่วน (อัตรา 1:1) ปรับเพิ่มลดได้ตามชอบ ผสมได้ทั้งน้ำเปล่า นม น้ำส้ม หรือน้ำผลไม้อื่น ๆ เหมาะทำนมกาแฟ ใส่ไอศกรีม หรือ smoothie กาแฟนม',
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
    hashtags: ['กาแฟ', 'กาแฟสกัดเย็นเข้มข้น', 'ColdBrew', 'ColdBrewConcentrate', 'Coldbrewcoffee', 'กาแฟสกัดเย็น', 'กาแฟดื่มง่าย', 'BrazilColdBrewCoffee', 'กาแฟหอมถั่ว'],
    seoTitle: 'VeLA Nutty Milk Concentrate — หัวเชื้อกาแฟสกัดเย็น คั่วกลาง Brazil Natural Process 1 ลิตร',
    seoDescription:
      'หัวเชื้อกาแฟสกัดเย็น VeLA Nutty Milk หอมทะลุนม มันนัว ผสมนมลงตัวสุด ๆ เมล็ด Brazil Cerrado คั่วกลาง สกัดเย็นกว่า 20 ชม. ไม่มีน้ำตาล ผลิตสดทุกวัน ส่งฟรี',
  },

  'FRUITY': {
    name: 'Fruity VeLA Concentrate กาแฟสกัดเย็น คั่วกลางอ่อน Myanmar Natural Process 1L',
    tagline: 'กลิ่นดอกไม้ รสเบอร์รี่สุก ดื่มง่าย หวานสดชื่น',
    highlights: [
      'หอมฟุ้งไปกับกลิ่นดอกไม้ และรสชาติเบอร์รี่สุก',
      'ดื่มง่ายไลท์ ๆ หวานจากธรรมชาติ สดชื่น',
      'เมล็ด Myanmar แปรรูปแบบ Natural Process คั่วกลางอ่อน',
      'หัวเชื้อกาแฟเข้มข้น 1 ลิตร ผสมได้หลายเมนู ทั้งน้ำ นม น้ำส้ม น้ำผลไม้',
      'สกัดเย็นนานกว่า 20 ชั่วโมง ชงสดต่อออเดอร์ ไม่มีน้ำตาล ไม่มีสารกันเสีย',
    ],
    description:
      'VeLA Fruity คั่วกลางอ่อน (Natural Process) จากเมล็ด Myanmar หอมฟุ้งไปกับกลิ่นดอกไม้และรสชาติเบอร์รี่สุก ดื่มง่ายไลท์ ๆ หวานจากธรรมชาติ สดชื่น เป็นหัวเชื้อกาแฟสกัดเย็นเข้มข้น 1,000 มล. จากเมล็ดคุณภาพสูง สกัดที่อุณหภูมิต่ำนานกว่า 20 ชั่วโมง ด้วยกระบวนการพิเศษจนได้รสชาติเป็นเอกลักษณ์ ทุกกระบวนการผ่านการรับรองความสะอาดปลอดภัย ชงสดใหม่ตามออเดอร์ ไม่สต๊อกสินค้า ไม่ปรุงแต่ง ไม่เติมน้ำตาล ไม่ใส่สารกันเสีย',
    howto:
      'ผสมกาแฟ 1 ส่วน : น้ำหรือน้ำผลไม้ 1 ส่วน (อัตรา 1:1) ปรับเพิ่มลดได้ตามชอบ ผสมได้ทั้งน้ำเปล่า นม น้ำส้ม หรือน้ำผลไม้อื่น ๆ เหมาะทำ sparkling coffee หรือ coffee tonic ใส่น้ำโซดา',
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
    hashtags: ['กาแฟ', 'กาแฟสกัดเย็นเข้มข้น', 'ColdBrew', 'ColdBrewConcentrate', 'Coldbrewcoffee', 'กาแฟสกัดเย็น', 'กาแฟดื่มง่าย', 'กาแฟหอมเบอรี่', 'MyanmarColdBrew', 'MyanmarCoffee'],
    seoTitle: 'Fruity VeLA Concentrate — หัวเชื้อกาแฟสกัดเย็น คั่วกลางอ่อน Myanmar Natural Process 1 ลิตร',
    seoDescription:
      'หัวเชื้อกาแฟสกัดเย็น VeLA Fruity หอมกลิ่นดอกไม้ รสเบอร์รี่สุก ดื่มง่ายหวานสดชื่นจากธรรมชาติ เมล็ด Myanmar คั่วกลางอ่อน สกัดเย็นกว่า 20 ชม. ไม่มีน้ำตาล ส่งฟรี',
  },

  'KYOHO': {
    name: 'VeLA Kyoho Cold Drip Premium พร้อมดื่ม 200ml',
    tagline: 'Kyoho Grape · Mulberry · Blueberry · Blackcurrant · Caramel',
    highlights: [
      'หอมองุ่น Kyoho แบบตะโกน จากการหมัก Wine Yeast',
      'สกัดแบบ Cold Drip หยดทีละหยดช้า ๆ นาน 3–8 ชั่วโมง เข้มข้นชัดเจน กลมกล่อม หอมหวาน ไม่ขม',
      'Ethiopia Guji & Sidama กาแฟพิเศษ (Specialty Coffee) ปลูกที่ 1,600–1,900 เมตร',
      'ขวดพร้อมดื่ม 200 มล. เสิร์ฟ on the rocks ได้เลย',
      'ไม่ปรุงแต่ง ไม่เติมน้ำตาล ไม่ใส่สารกันเสีย',
    ],
    description:
      'VeLA Kyoho Cold Drip Premium ใช้การสกัดแบบปล่อยให้น้ำหยดทีละหยดลงมาอย่างช้า ๆ นานถึง 3–8 ชั่วโมง เพื่อให้ได้รสชาติที่เข้มข้นชัดเจน กลมกล่อม และหอมหวาน ไม่ขม เหมาะกับกาแฟพิเศษคุณภาพสูง (Specialty Coffee) ใช้เมล็ด Ethiopia Guji Sidama "Kyoho Magic" จากพื้นที่สูง 1,600–1,900 เมตรเหนือระดับน้ำทะเล ต้นกาแฟเติบโตช้า เมล็ดหนาแน่นและสะสมรสชาติได้ดี ผ่านการหมัก Wine Yeast จึงหอมองุ่น Kyoho แบบตะโกน โดดเด่นด้วย tasting note องุ่นไคโฮ หม่อน บลูเบอร์รี่ แบล็คเคอร์แรนต์ คาราเมล และอาฟเตอร์เทสต์ยาว',
    howto:
      'พร้อมดื่มได้เลย 200 มล. เสิร์ฟแบบ on the rocks หรือผสมนมเล็กน้อย ไม่ต้องเติมน้ำตาล',
    specs: [
      { label: 'ปริมาณ', value: '200 มล. (พร้อมดื่ม)' },
      { label: 'ประเภท', value: 'Cold Drip Premium (ขวดพร้อมดื่ม)' },
      { label: 'แหล่งเมล็ด', value: 'Ethiopia Guji & Sidama (Kyoho Magic)' },
      { label: 'กระบวนการ', value: 'Wine Yeast Fermentation' },
      { label: 'ระดับคั่ว', value: 'Medium Light (Omni)' },
      { label: 'ความสูง', value: '1,600–1,900 เมตร' },
      { label: 'Taste Note', value: 'Kyoho Grape, Mulberry, Blueberry, Blackcurrant, Caramel, Long Aftertaste' },
      { label: 'เวลาสกัด', value: '3–8 ชั่วโมง (แบบหยด)' },
    ],
    storage: STORAGE_1L,
    origin: 'Ethiopia Guji & Sidama · Wine Yeast Fermentation · Medium Light (Omni)',
    hashtags: ['กาแฟพิเศษ', 'ColdDrip', 'Colddriprewcoffee', 'SpecialtyCoffee', 'กาแฟสกัดเย็น', 'กาแฟดื่มง่าย'],
    seoTitle: 'VeLA Kyoho Cold Drip Premium — กาแฟสกัดเย็นแบบหยด พร้อมดื่ม 200 มล.',
    seoDescription:
      'VeLA Kyoho Cold Drip Premium หอมองุ่น Kyoho จากการหมัก Wine Yeast tasting note องุ่น หม่อน บลูเบอร์รี่ คาราเมล สกัดแบบหยด 3–8 ชม. Ethiopia Guji Sidama ขวดพร้อมดื่ม 200 มล.',
  },

  'GESHA': {
    name: 'VeLA Gesha Cold Drip Premium พร้อมดื่ม 200ml',
    tagline: 'Floral · Black Tea · Mango',
    highlights: [
      'กลิ่นดอกไม้ ชาดำ มะม่วงสุก จากเมล็ด Ethiopia Gesha (Geisha)',
      'สกัดแบบ Cold Drip หยดทีละหยดช้า ๆ นาน 3–8 ชั่วโมง เข้มข้นชัดเจน กลมกล่อม หอมหวาน ไม่ขม',
      'เกรด G1 Natural Process เก็บผลเชอร์รี่ด้วยมือล้วน (Hand Picked) จาก Bench Maji',
      'คั่วแบบ Omni ได้ทั้งโซนผลไม้และโซนน้ำตาล ไม่เปรี้ยวจัด หวานสูง',
      'ขวดพร้อมดื่ม 200 มล. ไม่ปรุงแต่ง ไม่เติมน้ำตาล ไม่ใส่สารกันเสีย',
    ],
    description:
      'VeLA Gesha Cold Drip Premium ใช้การสกัดแบบปล่อยให้น้ำหยดทีละหยดลงมาอย่างช้า ๆ นานถึง 3–8 ชั่วโมง เพื่อให้ได้รสชาติที่เข้มข้นชัดเจน กลมกล่อม และหอมหวาน ไม่ขม เหมาะกับกาแฟพิเศษคุณภาพสูง (Specialty Coffee) จากเมล็ด ETHIOPIA GESHA (Geisha) Natural Process แหล่งปลูก Bench Maji เก็บผลเชอร์รี่ด้วยมือล้วน (Hand Picked) เกรด G1 (Grade-1) ระดับความสูง 2,000–2,300 เมตรเหนือระดับน้ำทะเล คั่วแบบ Omni คั่วเฉลี่ยให้ได้ทั้งโซนผลไม้และโซนน้ำตาล ทำให้ไม่เปรี้ยวจัดเกินไปและได้ความหวานสูง โดดเด่นด้วย tasting note ดอกไม้ ชาดำ และมะม่วงสุก',
    howto:
      'พร้อมดื่มได้เลย 200 มล. เสิร์ฟแบบ on the rocks หรือผสมนมเล็กน้อย ไม่ต้องเติมน้ำตาล',
    specs: [
      { label: 'ปริมาณ', value: '200 มล. (พร้อมดื่ม)' },
      { label: 'ประเภท', value: 'Cold Drip Premium (ขวดพร้อมดื่ม)' },
      { label: 'แหล่งเมล็ด', value: 'Ethiopia Gesha — Bench Maji (เกรด G1)' },
      { label: 'กระบวนการ', value: 'Natural Process' },
      { label: 'ระดับคั่ว', value: 'Omni Roast' },
      { label: 'ความสูง', value: '2,000–2,300 เมตร' },
      { label: 'Taste Note', value: 'Floral, Black Tea, Mango' },
      { label: 'เวลาสกัด', value: '3–8 ชั่วโมง (แบบหยด)' },
    ],
    storage: STORAGE_1L,
    origin: 'Ethiopia Gesha · Natural Process · Omni Roast',
    hashtags: ['กาแฟพิเศษ', 'ColdDrip', 'Colddriprewcoffee', 'SpecialtyCoffee', 'กาแฟสกัดเย็น', 'กาแฟดื่มง่าย'],
    seoTitle: 'VeLA Gesha Cold Drip Premium — กาแฟสกัดเย็นแบบหยด พร้อมดื่ม 200 มล.',
    seoDescription:
      'VeLA Gesha Cold Drip Premium เกรด G1 กลิ่นดอกไม้ ชาดำ มะม่วงสุก Ethiopia Gesha Natural Process คั่ว Omni หวานสูง ไม่เปรี้ยวจัด สกัดแบบหยด 3–8 ชม. ขวดพร้อมดื่ม 200 มล.',
  },
}

export const ALL_SKUS = ['ORIGINAL', 'DARK', 'HONEY', 'NUTTY', 'FRUITY', 'KYOHO', 'GESHA']

export function resolveSku(raw: string): string {
  const s = (raw || '').toUpperCase().replace('-200', '')
  return SKU_META[s] ? s : 'ORIGINAL'
}
