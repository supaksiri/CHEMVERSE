export const rooms = [
  { id:'foundation', icon:'⚗️', name:'Foundation Lab', th:'พื้นฐานห้องปฏิบัติการ', color:'#67e8f9' },
  { id:'reaction', icon:'✨', name:'Reaction Lab', th:'ปฏิกิริยาเคมี', color:'#a78bfa' },
  { id:'acid', icon:'🧪', name:'Acid–Base Lab', th:'กรด–เบสและ pH', color:'#f472b6' },
  { id:'precipitation', icon:'❄️', name:'Precipitation Lab', th:'ตะกอนและไอออน', color:'#60a5fa' },
  { id:'gas', icon:'🫧', name:'Gas Lab', th:'การเกิดและเก็บแก๊ส', color:'#34d399' },
  { id:'safety', icon:'🛡️', name:'Safety Lab', th:'ความปลอดภัยเสมือน', color:'#fb923c' }
];

export const chemicals = {
  water:{ name:'น้ำกลั่น', formula:'H₂O', color:0x8bdcff, phase:'aq', pH:7, ions:[] },
  hcl:{ name:'กรดไฮโดรคลอริก', formula:'HCl', color:0xb7efff, phase:'aq', pH:1, acid:1, ions:['H⁺','Cl⁻'], hazard:'ระคายเคือง' },
  naoh:{ name:'โซเดียมไฮดรอกไซด์', formula:'NaOH', color:0xe8ffff, phase:'aq', pH:13, base:1, ions:['Na⁺','OH⁻'], hazard:'กัดกร่อน' },
  nacl:{ name:'โซเดียมคลอไรด์', formula:'NaCl', color:0xd9f7ff, phase:'aq', pH:7, ions:['Na⁺','Cl⁻'] },
  agno3:{ name:'ซิลเวอร์ไนเทรต', formula:'AgNO₃', color:0xe7f7ff, phase:'aq', pH:6, ions:['Ag⁺','NO₃⁻'], hazard:'ระคายเคือง' },
  cuso4:{ name:'คอปเปอร์(II) ซัลเฟต', formula:'CuSO₄', color:0x168cff, phase:'aq', pH:5, ions:['Cu²⁺','SO₄²⁻'] },
  fecl3:{ name:'ไอร์ออน(III) คลอไรด์', formula:'FeCl₃', color:0xd98b13, phase:'aq', pH:3, ions:['Fe³⁺','Cl⁻'] },
  kscn:{ name:'โพแทสเซียมไทโอไซยาเนต', formula:'KSCN', color:0xe8ffff, phase:'aq', pH:7, ions:['K⁺','SCN⁻'] },
  bacl2:{ name:'แบเรียมคลอไรด์', formula:'BaCl₂', color:0xe8ffff, phase:'aq', pH:7, ions:['Ba²⁺','Cl⁻'], hazard:'เป็นพิษ' },
  na2so4:{ name:'โซเดียมซัลเฟต', formula:'Na₂SO₄', color:0xe8ffff, phase:'aq', pH:7, ions:['Na⁺','SO₄²⁻'] },
  na2co3:{ name:'โซเดียมคาร์บอเนต', formula:'Na₂CO₃', color:0xe8ffff, phase:'aq', pH:11, base:.5, ions:['Na⁺','CO₃²⁻'] },
  zn:{ name:'สังกะสี', formula:'Zn', color:0xbac4ce, phase:'s', ions:[], solid:true },
  fe:{ name:'เหล็ก', formula:'Fe', color:0x79828c, phase:'s', ions:[], solid:true },
  h2o2:{ name:'ไฮโดรเจนเปอร์ออกไซด์เจือจาง', formula:'H₂O₂', color:0xd9f7ff, phase:'aq', pH:6, ions:[] },
  ki:{ name:'โพแทสเซียมไอโอไดด์', formula:'KI', color:0xe8ffff, phase:'aq', pH:7, ions:['K⁺','I⁻'] },
  kno3:{ name:'โพแทสเซียมไนเทรต', formula:'KNO₃', color:0xe8ffff, phase:'aq', pH:7, ions:['K⁺','NO₃⁻'] }
};

export const reactions = [
  { pair:['agno3','nacl'], type:'precipitate', color:0xf7fbff, observation:'เกิดตะกอนสีขาว', equation:'AgNO₃(aq) + NaCl(aq) → AgCl(s)↓ + NaNO₃(aq)', net:'Ag⁺(aq) + Cl⁻(aq) → AgCl(s)', products:['AgCl','NaNO₃'], heat:0 },
  { pair:['cuso4','naoh'], type:'precipitate', color:0x27a8ff, observation:'เกิดตะกอนสีฟ้า', equation:'CuSO₄(aq) + 2NaOH(aq) → Cu(OH)₂(s)↓ + Na₂SO₄(aq)', net:'Cu²⁺(aq) + 2OH⁻(aq) → Cu(OH)₂(s)', products:['Cu(OH)₂','Na₂SO₄'], heat:1 },
  { pair:['bacl2','na2so4'], type:'precipitate', color:0xffffff, observation:'เกิดตะกอนสีขาวละเอียด', equation:'BaCl₂(aq) + Na₂SO₄(aq) → BaSO₄(s)↓ + 2NaCl(aq)', net:'Ba²⁺(aq) + SO₄²⁻(aq) → BaSO₄(s)', products:['BaSO₄','NaCl'], heat:0 },
  { pair:['hcl','naoh'], type:'neutralization', color:0xbdeeff, observation:'อุณหภูมิเพิ่มขึ้นจากปฏิกิริยาคายความร้อน', equation:'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)', net:'H⁺(aq) + OH⁻(aq) → H₂O(l)', products:['NaCl','H₂O'], heat:7 },
  { pair:['hcl','na2co3'], type:'gas', color:0xcceeff, gas:'CO₂', observation:'เกิดฟองแก๊สคาร์บอนไดออกไซด์', equation:'2HCl(aq) + Na₂CO₃(aq) → 2NaCl(aq) + H₂O(l) + CO₂(g)↑', net:'2H⁺(aq) + CO₃²⁻(aq) → H₂O(l) + CO₂(g)', products:['NaCl','H₂O','CO₂'], heat:1 },
  { pair:['hcl','zn'], type:'gas', color:0xcceeff, gas:'H₂', observation:'เกิดฟองแก๊ส ไม่มีสี และโลหะค่อย ๆ ละลาย', equation:'Zn(s) + 2HCl(aq) → ZnCl₂(aq) + H₂(g)↑', net:'Zn(s) + 2H⁺(aq) → Zn²⁺(aq) + H₂(g)', products:['ZnCl₂','H₂'], heat:4 },
  { pair:['cuso4','fe'], type:'redox', color:0x63a86a, observation:'มีทองแดงสีน้ำตาลแดงเกาะบนเหล็ก สีฟ้าของสารละลายจางลง', equation:'Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s)', net:'Fe(s) + Cu²⁺(aq) → Fe²⁺(aq) + Cu(s)', products:['FeSO₄','Cu'], heat:1 },
  { pair:['fecl3','kscn'], type:'equilibrium', color:0xa40027, observation:'สารละลายเปลี่ยนเป็นสีแดงเลือดนก', equation:'Fe³⁺(aq) + SCN⁻(aq) ⇌ FeSCN²⁺(aq)', net:'Fe³⁺(aq) + SCN⁻(aq) ⇌ FeSCN²⁺(aq)', products:['FeSCN²⁺'], heat:0 },
  { pair:['h2o2','ki'], type:'gas', color:0xeefcff, gas:'O₂', catalyst:true, observation:'เกิดฟองแก๊สออกซิเจนอย่างรวดเร็ว KI ทำหน้าที่เป็นตัวเร่ง', equation:'2H₂O₂(aq) → 2H₂O(l) + O₂(g)↑', net:'2H₂O₂(aq) → 2H₂O(l) + O₂(g)', products:['H₂O','O₂'], heat:5 }
];

export const missions = [
 {id:1,title:'WHITE EVIDENCE',room:'precipitation',brief:'สร้างตะกอนสีขาวจากสารที่มีอยู่',targets:['agno3','nacl'],xp:120},
 {id:2,title:'BLUE MYSTERY',room:'precipitation',brief:'สร้างตะกอนคอปเปอร์(II) ไฮดรอกไซด์สีฟ้า',targets:['cuso4','naoh'],xp:140},
 {id:3,title:'NEUTRALIZE REACTOR',room:'acid',brief:'ทำให้สารในเครื่องปฏิกรณ์มี pH 6.8–7.2',targets:['hcl','naoh'],xp:180},
 {id:4,title:'MYSTERY GAS',room:'gas',brief:'สร้างแก๊สไฮโดรเจนและระบุหลักฐานการเกิดปฏิกิริยา',targets:['hcl','zn'],xp:180},
 {id:5,title:'RED METAL SIGNAL',room:'reaction',brief:'ทำให้เกิดโลหะทองแดงจากปฏิกิริยาแทนที่',targets:['cuso4','fe'],xp:200},
 {id:6,title:'CRIMSON EQUILIBRIUM',room:'reaction',brief:'สร้างสารเชิงซ้อนสีแดงและอธิบายสมดุล',targets:['fecl3','kscn'],xp:220}
];
