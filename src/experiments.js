export const experiments = [
  {
    id:'titration', icon:'🧪', short:'Titration', title:'Precision Acid–Base Titration',
    thai:'การไทเทรตกรด–เบสอย่างแม่นยำ', level:'ม.5',
    equation:'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)',
    net:'H⁺(aq) + OH⁻(aq) → H₂O(l)',
    equipment:['ขาตั้งบิวเรต','บิวเรต 50.00 mL','ปิเปต 25.00 mL','ขวดรูปชมพู่','pH meter'],
    sample:{id:'hcl',volume:25,concentration:.1}, reagent:{id:'naoh',concentration:.1},
    graph:{x:'ปริมาตร NaOH (mL)',y:'pH',series:['pH']}, target:'หาจุดสมมูลและทำให้ pH อยู่ระหว่าง 6.8–7.2',
    steps:['Rinse ปิเปตด้วย HCl','ตวง HCl 25.00 mL ลงขวดรูปชมพู่','Rinse และเติมบิวเรตด้วย NaOH','สอบเทียบและจุ่ม pH probe','เปิด stopcock และหมุนขวดจนถึงจุดสมมูล'],
    actions:[['rinsePipette','ล้างปิเปตด้วย HCl','ปิเปต'],['transferSample','ดูด–ปล่อย HCl 25.00 mL','ปิเปต'],['fillBurette','เติมและไล่ฟองอากาศในบิวเรต','บิวเรต'],['calibrateProbe','สอบเทียบ pH 4/7/10','pH meter'],['placeProbe','จุ่มหัววัดในสารละลาย','pH meter'],['flow','เปิด/ปิด stopcock','บิวเรต'],['swirl','หมุนขวดรูปชมพู่','ขวดรูปชมพู่']]
  },
  {
    id:'precipitation', icon:'❄️', short:'Precipitate', title:'Quantitative Precipitation',
    thai:'การเกิดและหาปริมาณตะกอน', level:'ม.4–ม.5',
    equation:'AgNO₃(aq) + NaCl(aq) → AgCl(s)↓ + NaNO₃(aq)',
    net:'Ag⁺(aq) + Cl⁻(aq) → AgCl(s)',
    equipment:['ปิเปต 10.00 mL','บีกเกอร์ 100 mL','แท่งแก้วคน','กรวยกรอง','กระดาษกรอง','เครื่องชั่ง 0.01 g'],
    sample:{id:'agno3',volume:20,concentration:.1}, reagent:{id:'nacl',concentration:.1},
    graph:{x:'ปริมาตร NaCl (mL)',y:'จำนวนโมล (mmol)',series:['Ag⁺','Cl⁻','AgCl']}, target:'สร้าง กรอง และคำนวณมวลตะกอน AgCl',
    steps:['ตวง AgNO₃','เติม NaCl ทีละส่วน','คนและรอให้ตะกอนตก','กรองและล้างตะกอน','ทำให้แห้งแล้วชั่ง'],
    actions:[['transferSample','ตวง AgNO₃ ด้วยปิเปต','ปิเปต'],['dose','เติม NaCl ทีละส่วน','ปิเปต'],['swirl','คนและพักให้ตกตะกอน','แท่งแก้ว'],['filter','กรองและล้างตะกอน','กรวยกรอง'],['dry','ทำให้แห้ง','ตู้อบ'],['measure','ชั่งมวล','เครื่องชั่ง']]
  },
  {
    id:'gas', icon:'🫧', short:'Gas', title:'Gas Collection & Stoichiometry',
    thai:'การเกิดและเก็บแก๊สไฮโดรเจน', level:'ม.5',
    equation:'Zn(s) + 2HCl(aq) → ZnCl₂(aq) + H₂(g)↑',
    net:'Zn(s) + 2H⁺(aq) → Zn²⁺(aq) + H₂(g)',
    equipment:['เครื่องชั่ง 0.01 g','ขวดรูปชมพู่มีจุก','ท่อนำแก๊ส','อ่างน้ำ','กระบอกเก็บแก๊ส','เทอร์มอมิเตอร์'],
    sample:{id:'zn',mass:.13}, reagent:{id:'hcl',concentration:1},
    graph:{x:'เวลา (s)',y:'ปริมาตร H₂ (mL)',series:['H₂']}, target:'เก็บ H₂ และเปรียบเทียบปริมาตรกับค่าจากสโตอิชิโอเมตรี',
    steps:['ชั่ง Zn 0.13 g','ประกอบชุดเก็บแก๊ส','ตรวจระบบว่าไม่รั่ว','เติม HCl','บันทึกปริมาตรแก๊สทุกช่วงเวลา'],
    actions:[['transferSample','ชั่งและใส่ Zn','เครื่องชั่ง'],['assemble','ต่อจุกและท่อนำแก๊ส','ชุดเก็บแก๊ส'],['placeProbe','ตรวจรอยรั่ว','ข้อต่อ'],['dose','เติม HCl ผ่านกรวยหยด','กรวยหยด'],['run','เริ่ม/หยุดจับเวลา','นาฬิกา']]
  },
  {
    id:'kinetics', icon:'⏱️', short:'Kinetics', title:'Reaction Rate Research',
    thai:'อัตราการสลายตัวของไฮโดรเจนเปอร์ออกไซด์', level:'ม.5',
    equation:'2H₂O₂(aq) → 2H₂O(l) + O₂(g)↑',
    net:'2H₂O₂(aq) → 2H₂O(l) + O₂(g)',
    equipment:['ขวดปฏิกิริยา','ปิเปต','จุกและท่อนำแก๊ส','Gas sensor','เทอร์มอมิเตอร์','นาฬิกาจับเวลา'],
    sample:{id:'h2o2',volume:20,concentration:1}, reagent:{id:'ki',concentration:.1},
    graph:{x:'เวลา (s)',y:'ความเข้มข้น / O₂',series:['H₂O₂','O₂']}, target:'เปรียบเทียบอัตราเมื่อเปลี่ยนอุณหภูมิและใช้ตัวเร่ง',
    steps:['ตวง H₂O₂','ตั้งค่าอุณหภูมิ','ต่อ Gas sensor','เติม KI','เริ่มจับเวลาและเก็บข้อมูล'],
    actions:[['transferSample','ตวง H₂O₂','กระบอกตวง'],['temperature','ตั้งอ่างควบคุมอุณหภูมิ','อ่างน้ำ'],['connectSensor','ต่อ Gas sensor','Gas sensor'],['dose','เติม KI ด้วยปิเปต','ปิเปต'],['run','เริ่ม/หยุดเก็บข้อมูล','นาฬิกา']]
  },
  {
    id:'equilibrium', icon:'⚖️', short:'Equilibrium', title:'Equilibrium Control',
    thai:'สมดุลไอร์ออน(III)–ไทโอไซยาเนต', level:'ม.5',
    equation:'Fe³⁺(aq) + SCN⁻(aq) ⇌ FeSCN²⁺(aq)',
    net:'Fe³⁺(aq) + SCN⁻(aq) ⇌ FeSCN²⁺(aq)',
    equipment:['ปิเปต','หลอดทดลอง','คิวเวต','Colorimeter 447 nm','อ่างน้ำร้อน','อ่างน้ำแข็ง'],
    sample:{id:'fecl3',volume:10,concentration:.001}, reagent:{id:'kscn',concentration:.001},
    graph:{x:'เวลา / การรบกวน',y:'ความเข้มข้น (mM)',series:['Fe³⁺','SCN⁻','FeSCN²⁺']}, target:'รบกวนระบบและอธิบายทิศทางการเลื่อนสมดุลด้วย Q และ K',
    steps:['ตวง Fe³⁺','เติม SCN⁻','ทำ Blank เครื่องวัดสี','วัด Absorbance','รบกวนและติดตามสมดุลใหม่'],
    actions:[['transferSample','ตวง Fe³⁺ ลงหลอดทดลอง','ปิเปต'],['dose','เติม SCN⁻ ทีละหยด','หลอดหยด'],['blank','ทำ Blank ด้วยตัวทำละลาย','Colorimeter'],['measure','ใส่ cuvette และวัดค่า','Colorimeter'],['temperature','รบกวนด้วยอุณหภูมิ','อ่างน้ำ']]
  }
];

export const getExperiment=id=>experiments.find(x=>x.id===id)||experiments[0];
