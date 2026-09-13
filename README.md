# CHEMVERSE 3.0 — Scientific Fidelity Lab

ห้องปฏิบัติการเคมีเสมือน 3D ภาษาไทยสำหรับนักเรียนมัธยมศึกษา จุดเด่นของ Version 3 คือ **Single-source scientific model**: การกระทำกับอุปกรณ์ ค่าที่วัด กราฟ หลักฐานระดับมหภาค Particle View และสมการเคมี ใช้สถานะการทดลองชุดเดียวกัน

## ห้องทดลองรุ่นแรก

1. Precision Acid–Base Titration — กราฟ pH–ปริมาตรคำนวณทุกครั้งที่เติม NaOH
2. Quantitative Precipitation — คำนวณสารกำหนดปริมาณและมวล AgCl
3. Gas Collection & Stoichiometry — ปริมาตร H₂ เปลี่ยนตามเวลา อุณหภูมิ และจำนวนโมล
4. Reaction Rate Research — อัตราการสลาย H₂O₂ เปลี่ยนตามอุณหภูมิและตัวเร่ง
5. Equilibrium Control — คำนวณ Fe³⁺/SCN⁻/FeSCN²⁺ จากค่าคงที่สมดุลและแสดง Absorbance

## ความสามารถ

- อุปกรณ์ 3D เปลี่ยนตามการทดลอง: บิวเรต ชุดเก็บแก๊ส ชุดกรอง และ colorimeter
- เติมสารทีละ 0.10, 0.50, 1.00 หรือ 5.00 mL
- ควบคุมเวลา อุณหภูมิ และระบบเปิด/ปิด
- เครื่องมือวัด pH อุณหภูมิ ความดัน ปริมาตรแก๊ส มวลตะกอน อัตรา และ absorbance
- กราฟสร้างจากประวัติข้อมูลที่คำนวณได้จริง ไม่ใช้เส้นกราฟสำเร็จรูป
- Particle View รักษาสัดส่วนชนิดสารแบบ representative particles
- ขั้นตอน technique checklist และผลผิดพลาด เช่น endpoint exceeded หรือตะกอนยังเปียก
- Scientific Lab Report พร้อมพิมพ์หรือบันทึกเป็น PDF
- Performance / Balanced / Cinematic graphics
- Responsive, PWA และ GitHub Pages workflow

## เริ่มใช้งาน

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## GitHub Pages

อัปโหลดไฟล์ภายในโฟลเดอร์นี้ทั้งหมดขึ้น repository โดยต้องเห็น `package.json` อยู่ระดับบนสุด และต้องอัปโหลด `.github/workflows/deploy.yml` จากนั้นเลือก **Settings → Pages → Source → GitHub Actions**

## ขอบเขตของแบบจำลอง

แบบจำลองนี้ออกแบบเพื่อการเรียนรู้ระดับมัธยมศึกษา ใช้สมมติฐานที่ระบุในแต่ละโมดูล เช่น ideal solution, ideal gas และ representative particles ผลลัพธ์ไม่ใช้แทนการวิเคราะห์ในห้องปฏิบัติการจริงหรือข้อกำหนดความปลอดภัย

สร้างโดย **คุณครูสุพักตร์ศิริ พืชสิงห์ โรงเรียนโพธิ์ศรีสว่างวิทยา**
