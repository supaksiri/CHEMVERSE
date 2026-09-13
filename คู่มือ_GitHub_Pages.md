# คู่มือนำ CHEMVERSE ขึ้น GitHub Pages

## วิธีที่ 1: อัปโหลดผ่านหน้าเว็บ GitHub

1. เข้าสู่ระบบ GitHub แล้วกด **New repository**
2. ตั้งชื่อ เช่น `chemverse-virtual-lab`
3. เลือก **Public** หรือ **Private** ตามต้องการ แล้วสร้าง Repository
4. แตกไฟล์ ZIP และอัปโหลดไฟล์ภายในโฟลเดอร์ `chemverse` ทั้งหมด โดยต้องเห็น `package.json` อยู่ระดับบนสุด
5. Commit ไฟล์ไปที่ branch `main`
6. เปิด **Settings → Pages**
7. ในหัวข้อ **Build and deployment → Source** เลือก **GitHub Actions**
8. เปิดแท็บ **Actions** รอรายการ `Deploy CHEMVERSE to GitHub Pages` แสดงเครื่องหมายสีเขียว
9. URL จะอยู่ในหน้า Deploy หรือ Settings → Pages

## วิธีที่ 2: ใช้ Git command

```bash
git init
git add .
git commit -m "Launch CHEMVERSE 1.0"
git branch -M main
git remote add origin https://github.com/USERNAME/chemverse-virtual-lab.git
git push -u origin main
```

จากนั้นตั้งค่า Pages ให้ใช้ GitHub Actions เช่นเดียวกับวิธีที่ 1

## ทดลองก่อนอัปโหลด

ติดตั้ง Node.js รุ่น 20 หรือใหม่กว่า แล้วใช้คำสั่ง

```bash
npm install
npm run dev
```

เปิด URL ที่แสดงใน Terminal หากต้องการตรวจ Production Build ใช้

```bash
npm run build
npm run preview
```

## การเพิ่มสารและปฏิกิริยา

- ข้อมูลสารเคมีอยู่ที่ `src/data.js` ในตัวแปร `chemicals`
- สมการและผลการทดลองอยู่ในตัวแปร `reactions`
- ภารกิจอยู่ในตัวแปร `missions`
- การคำนวณ pH อุณหภูมิ และความดันอยู่ที่ `src/engine.js`

ก่อนเพิ่มสารหรือการทดลองใหม่ ควรตรวจสอบสมการ สถานะของสาร เงื่อนไข ความเข้มข้น และความปลอดภัยทางเคมีทุกครั้ง

## หมายเหตุสำหรับห้องเรียน

- ให้ผู้เรียนเลือก Performance Mode หากโทรศัพท์ทำงานช้า
- ความก้าวหน้าและ Lab Notebook เก็บในเบราว์เซอร์ของอุปกรณ์นั้น
- ใช้ปุ่ม **พิมพ์ / บันทึก PDF** ใน Lab Notebook เพื่อส่งหลักฐานท้ายคาบ
- หากล้างข้อมูลเว็บไซต์หรือเปลี่ยนอุปกรณ์ ความก้าวหน้าที่เก็บในเครื่องจะไม่ติดตามไปด้วย
