HUG LOEI E-BOOK WEBSITE V3
===========================

เปิดอ่านเว็บ
- อัปโหลดโฟลเดอร์นี้ขึ้น Web Hosting ได้ตามปกติ
- หน้าอ่านหลัก: index.html
- หน้าอัปเดต PDF: update.html

ระบบความคมชัด
- โฟลเดอร์ pages/ คือ JPEG ต้นฉบับที่ดึงจาก PDF โดยตรง ไม่บีบอัดซ้ำ
- previews/ คือภาพเบา 420px สำหรับเปิดเร็วเมื่ออินเทอร์เน็ตช้า
- thumbs/ คือภาพย่อสำหรับหน้าภาพรวม
- เมื่อเลือก HD หรือซูม เว็บจะโหลด pages/ ต้นฉบับ

อัปเดต PDF ผ่านหน้าเว็บ
1) ติดตั้ง Python 3.11+ (แนะนำ 3.12/3.13)
2) ดับเบิลคลิก RUN_UPDATE.bat บน Windows
   หรือรัน:
      pip install -r requirements.txt
      python server.py
3) เปิด http://localhost:8000/update.html
4) เลือก PDF แล้วกดอัปเดต

เพื่อรักษาคุณภาพ 100% ระบบจะรับ PDF ที่แต่ละหน้าเป็น JPEG เต็มหน้าแบบไฟล์งาน HUG LOEI ปัจจุบันเท่านั้น
ถ้าพบหน้า Vector / PNG / หลายภาพ ระบบจะหยุดก่อนเขียนทับไฟล์เดิม แทนการบีบอัดใหม่

ความปลอดภัย
- เมื่อรันใน localhost สามารถอัปเดตได้โดยไม่ต้องใส่คีย์
- ถ้ารัน server.py บนเซิร์ฟเวอร์จริง ให้ตั้ง Environment Variable HUG_LOEI_ADMIN_KEY
  และใส่คีย์เดียวกันในช่อง Admin Key บนหน้า update.html
- ถ้าไม่ตั้ง HUG_LOEI_ADMIN_KEY ระบบจะปิดการอัปเดตจากภายนอกอัตโนมัติ

Static Hosting
- GitHub Pages / Static Netlify / Static Cloudflare Pages ไม่อนุญาตให้เว็บเขียนทับไฟล์บนเซิร์ฟเวอร์เอง
- หน้า update.html จะ Preview ไฟล์ได้ แต่การอัปเดตโดยตรงต้องใช้ server.py หรือ API ฝั่งเซิร์ฟเวอร์

ไฟล์โลโก้ใน assets/logos/source/ คือไฟล์ PNG ที่ผู้ใช้แนบมาโดยตรง
assets/logos/ui/ เป็นเพียงสำเนาย่อขนาดจาก PNG เดิมเพื่อให้เว็บโหลดเร็วขึ้น ไม่มีการสร้างโลโก้ใหม่
