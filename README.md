# CHEMVERSE — Virtual Chemistry Institute

ห้องปฏิบัติการเคมีเสมือน 3D ภาษาไทยสำหรับนักเรียนมัธยมศึกษา สร้างให้เปิดผ่าน GitHub Pages ได้ทั้งมือถือและคอมพิวเตอร์

## ความสามารถ

- ห้องทดลอง 6 โซนและ Story Mission 6 ภารกิจ
- Chemistry Engine แยกจากกราฟิก เพิ่มสารและปฏิกิริยาได้ใน `src/data.js`
- ผลเสมือนจริง: สี ตะกอน แก๊ส อุณหภูมิ pH และความดัน
- Particle Vision, concentration–time graph และสมการไอออนิกสุทธิ
- ระบบความผิดพลาดจากภาชนะปิดและความดันสูง พร้อม Incident Analysis
- Lab Notebook บันทึกในอุปกรณ์และสั่งพิมพ์/บันทึก PDF
- กราฟิก Performance, Balanced และ Cinematic
- Responsive สำหรับมือถือ แท็บเล็ต และคอมพิวเตอร์

> แอปนี้เป็นสื่อจำลองการเรียนรู้ ไม่ใช้แทนข้อกำหนดความปลอดภัยหรือการทดลองจริงภายใต้การดูแลของครู

## เปิดบนเครื่อง

```bash
npm install
npm run dev
```

## สร้างไฟล์ Production

```bash
npm run build
npm run preview
```

## Deploy ด้วย GitHub Pages

1. สร้าง Repository ใหม่และอัปโหลดไฟล์ทั้งหมด
2. เปิด **Settings → Pages**
3. ที่ **Build and deployment** เลือก **GitHub Actions**
4. Workflow ใน `.github/workflows/deploy.yml` จะ Build และเผยแพร่อัตโนมัติ

ทุกครั้งที่ push ไปยัง branch `main` เว็บไซต์จะอัปเดตหลัง workflow สำเร็จ

## เนื้อหาทางวิทยาศาสตร์

ฐานข้อมูลเริ่มต้นครอบคลุม precipitation, acid–base neutralization, gas evolution, metal displacement, catalysis และ equilibrium พร้อมกรณี No observable reaction ควรตรวจทานสารและเงื่อนไขเพิ่มเติมก่อนเพิ่มการทดลองใหม่ทุกครั้ง

สร้างโดย **คุณครูสุพักตร์ศิริ พืชสิงห์ โรงเรียนโพธิ์ศรีสว่างวิทยา**
