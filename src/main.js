import './style.css';
import { experiments,getExperiment } from './experiments.js';
import { chemicals } from './data.js';
import { ScientificEngine } from './engine.js';
import { LabScene } from './scene.js';
import { drawGraph,drawParticles } from './charts.js';

const safe=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
const state={id:localStorage.getItem('chemverse-v3-experiment')||'titration',quality:localStorage.getItem('chemverse-quality')||'balanced',notes:safe('chemverse-v3-notes',[]),busy:false,view:'macro'};
const engine=new ScientificEngine(state.id);

document.querySelector('#app').innerHTML=`
<div class="noise"></div><div id="flash"></div>
<header><button class="brand" id="homeBtn"><span class="atom">⚛</span><span>CHEMVERSE 3.0<small>SCIENTIFIC FIDELITY LAB</small></span></button><div class="hud"><span class="live-dot">● LIVE MODEL</span><span>STEP <b id="stepNo">1</b>/5</span><select id="quality"><option value="low">Performance</option><option value="balanced">Balanced</option><option value="cinematic">Cinematic</option></select></div></header>
<main>
 <aside class="rooms v3-side"><h2>EXPERIMENTS</h2><div id="experimentList"></div><button class="notebook-btn" id="openNotebook">📓 LAB REPORTS <b id="noteCount">0</b></button></aside>
 <section class="world"><div id="scene"></div><div class="world-title"><small id="labTitle">PRECISION LAB</small><h1 id="labThai"></h1><span class="version-badge">DIGITAL TWIN ACTIVE</span></div><div class="telemetry v3-telemetry"><span>🌡 <b id="temp">25.0</b> °C</span><span>◉ pH <b id="ph">7.00</b></span><span>◌ <b id="pressure">1.00</b> atm</span><span>⏱ <b id="time">0.0</b> s</span></div><div class="macro-tip" id="macroTip">ค่าทุกจุดบนกราฟมาจากสถานะเดียวกับฉาก 3D และ Particle View</div></section>
 <aside class="console v3-console">
  <nav><button class="active" data-tab="procedure">ปฏิบัติ</button><button data-tab="evidence">หลักฐาน</button><button data-tab="analysis">วิเคราะห์</button></nav>
  <div class="tab active" id="procedure">
   <div class="assistant"><div class="bot">A</div><p><b>ATOM SCIENCE MENTOR</b><span id="atomText"></span></p></div>
   <section class="goal-card"><small>MISSION TARGET</small><p id="target"></p></section>
   <h3 class="section-title">อุปกรณ์ที่สอดคล้องกับการทดลอง</h3><div class="equipment-grid" id="equipment"></div>
   <h3 class="section-title">ขั้นตอนและเทคนิค</h3><div class="techniques" id="techniques"></div>
   <div class="control-card"><label>ปริมาณที่เติมต่อครั้ง<select id="dose"><option value="0.1">0.10 mL — ทีละหยด</option><option value="0.5">0.50 mL</option><option value="1">1.00 mL</option><option value="5">5.00 mL</option></select></label><button class="primary" id="addReagent">เติมสารจากอุปกรณ์</button><div class="quick-controls"><button id="advance">⏩ เดินเวลา +5 s</button><button id="cool">❄ −10°C</button><button id="heat">🔥 +10°C</button></div><label class="closed-control"><input id="closed" type="checkbox"> ปิดระบบทดลอง</label></div>
   <button class="ghost" id="reset">เริ่มการทดลองใหม่</button>
  </div>
  <div class="tab" id="evidence">
   <div class="measurement-grid"><article><span>ปริมาณที่เติม</span><b id="mAdded">0.00</b><small>mL</small></article><article><span>อุณหภูมิ</span><b id="mTemp">25.0</b><small>°C</small></article><article><span id="measure3Label">pH</span><b id="measure3">7.00</b><small id="measure3Unit"></small></article><article><span id="measure4Label">อัตรา</span><b id="measure4">0.000</b><small id="measure4Unit"></small></article></div>
   <div class="observation-card"><small>MACRO OBSERVATION</small><p id="observation"></p><div class="warning-box hidden" id="warning"></div></div>
   <h3 class="section-title">สมการที่สอดคล้อง</h3><div class="equation-v3"><b id="equation"></b><small id="net"></small></div><button class="primary report" id="record">บันทึกผลการทดลอง</button>
  </div>
  <div class="tab" id="analysis"><div class="instrument"><button class="active" data-view="graph">📈 กราฟจากข้อมูลจริง</button><button data-view="particle">🔬 ระดับอนุภาค</button></div><canvas id="graph"></canvas><canvas id="particle" class="hidden"></canvas><div class="science-note" id="scienceNote"></div></div>
 </aside>
</main>
<section class="drawer" id="notebook"><button class="close">×</button><h2>📓 SCIENTIFIC LAB REPORTS</h2><p>ข้อมูลจากเครื่องมือ กราฟ อนุภาค และสมการในเวลาที่บันทึก</p><div id="notes"></div><div class="drawer-actions"><button id="print">🖨 พิมพ์ / บันทึก PDF</button><button id="clearNotes">ล้างรายงาน</button></div></section>
<section class="intro" id="intro"><div class="orb">⚛</div><p class="eyebrow">PHOSI SAWANG WITTAYA SCHOOL</p><h1>CHEMVERSE</h1><h2>SCIENTIFIC FIDELITY LAB · VERSION 3.0</h2><p>อุปกรณ์ 3D การวัด กราฟ อนุภาค และสมการ เชื่อมจากแบบจำลองเดียวกัน</p><button id="enter">ENTER VERSION 3</button><small>สร้างโดย คุณครูสุพักตร์ศิริ พืชสิงห์</small></section>`;

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const labScene=new LabScene($('#scene'));labScene.setQuality(state.quality);$('#quality').value=state.quality;

function switchTab(id){$$('.console nav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));$$('.console .tab').forEach(t=>t.classList.toggle('active',t.id===id));if(id==='analysis')setTimeout(renderAnalysis,30)}
function toast(text){const el=document.createElement('div');el.className='toast';el.textContent=text;document.body.append(el);setTimeout(()=>el.remove(),2600)}
function experimentResultType(id){return id==='precipitation'?'precipitate':id==='gas'||id==='kinetics'?'gas':id==='equilibrium'?'equilibrium':'neutralization'}
function setExperiment(id){
  state.id=id;localStorage.setItem('chemverse-v3-experiment',id);engine.select(id);const e=getExperiment(id);
  $('#labTitle').textContent=e.title.toUpperCase();$('#labThai').textContent=e.thai;$('#target').textContent=e.target;$('#equation').textContent=e.equation;$('#net').textContent='Net ionic: '+e.net;
  $('#atomText').textContent=`จัดเตรียม ${e.equipment[0]} และทำตามเทคนิคทีละขั้น ค่าที่วัดจะเปลี่ยนตามการกระทำของคุณ`;
  $('#equipment').innerHTML=e.equipment.map((x,i)=>`<span title="เครื่องมือจำลองหมายเลข ${i+1}">${['⚗️','🧪','📏','🔬','⚖️','🌡️'][i%6]} ${x}</span>`).join('');
  $('#techniques').innerHTML=e.steps.map((x,i)=>`<button data-tech="${i}"><i>${i+1}</i><span>${x}</span><b>○</b></button>`).join('');
  $$('[data-tech]').forEach(b=>b.onclick=()=>completeTechnique(b));$$('[data-experiment]').forEach(b=>b.classList.toggle('active',b.dataset.experiment===id));
  $('#dose').value=id==='titration'?'.5':id==='precipitation'?'5':id==='equilibrium'?'1':'5';$('#closed').checked=false;
  labScene.resetMacro();labScene.setExperiment?.(id);const c1=chemicals[e.sample.id],c2=chemicals[e.reagent.id];labScene.setChemicals(c1,c2);labScene.totalVolume=e.sample.volume||12;labScene.setLevel?.(labScene.totalVolume);
  renderAll();
}
function completeTechnique(button){button.classList.add('done');button.querySelector('b').textContent='✓';const n=Number(button.dataset.tech),e=engine.experiment;if(n===0||n===2)engine.technique('rinsed');if((e.id==='titration'&&n===3))engine.technique('calibrated');if(e.id==='equilibrium'&&n===2)engine.technique('blank');if(e.id==='precipitation'&&n===3)engine.technique('filtered');if(e.id==='precipitation'&&n===4)engine.technique('dried');$('#stepNo').textContent=Math.min(5,$$('.techniques .done').length+1);renderAll()}
function addReagent(){
  if(state.busy)return;const amount=Number($('#dose').value),e=engine.experiment;state.busy=true;$('#atomText').textContent=`กำลังเติม ${chemicals[e.reagent.id].formula} ${amount.toFixed(2)} mL — สังเกตเครื่องมือและค่าที่วัด`;
  const done=()=>{const s=engine.add(amount);state.busy=false;labScene.updateScientificState?.(s);labScene.react(experimentResultType(e.id)==='neutralization'?{type:'neutralization',color:parseInt((s.color||'#9eeeff').slice(1),16),heat:1}:{type:experimentResultType(e.id),color:parseInt((s.color||'#eaf8ff').slice(1),16),heat:e.id==='kinetics'?3:0});renderAll();if(s.warning)toast(s.warning)};
  if(e.id==='titration')labScene.dispense(amount,done);else labScene.pourChemical(1,amount,done);
}
function adjustTime(){engine.advance(5);labScene.updateScientificState?.(engine.snapshot());renderAll()}
function adjustTemp(delta){engine.setTemperature(engine.temperature+delta);labScene.heat(delta>0);renderAll()}
function renderMeasurement(s){
  $('#mAdded').textContent=s.added.toFixed(2);$('#mTemp').textContent=s.temperature.toFixed(1);
  let third=['pH',s.pH.toFixed(2),''],fourth=['อัตรา',s.rate.toFixed(3),'mmol/s'];
  if(s.experiment.id==='precipitation'){third=['มวล AgCl',s.precipitateMass.toFixed(3),'g'];fourth=['AgCl', (s.species['AgCl(s)']||0).toFixed(3),'mmol']}
  if(s.experiment.id==='gas'){third=['ปริมาตร H₂',s.gasVolume.toFixed(1),'mL'];fourth=['ความดัน',s.pressure.toFixed(2),'atm']}
  if(s.experiment.id==='kinetics'){third=['ปริมาตร O₂',s.gasVolume.toFixed(1),'mL'];fourth=['อัตรา',s.rate.toFixed(3),'mmol/s']}
  if(s.experiment.id==='equilibrium'){third=['Absorbance',s.absorbance.toFixed(3),'AU'];fourth=['FeSCN²⁺',(s.species['FeSCN²⁺']||0).toFixed(3),'mM']}
  [$('#measure3Label').textContent,$('#measure3').textContent,$('#measure3Unit').textContent]=third;[$('#measure4Label').textContent,$('#measure4').textContent,$('#measure4Unit').textContent]=fourth;
}
function renderAnalysis(){const s=engine.snapshot();drawGraph($('#graph'),s);drawParticles($('#particle'),s);$('#scienceNote').innerHTML=`<b>Single-source scientific model</b><span>${s.experiment.graph.x} เชื่อมกับ ${s.experiment.graph.y}</span><span>จำนวนอนุภาคเป็นตัวแทนแบบปรับสเกล แต่รักษาสัดส่วนของชนิดสาร</span>`}
function renderAll(){const s=engine.snapshot();$('#temp').textContent=s.temperature.toFixed(1);$('#ph').textContent=s.pH.toFixed(2);$('#pressure').textContent=s.pressure.toFixed(2);$('#time').textContent=s.time.toFixed(1);$('#observation').textContent=s.observation;$('#warning').textContent=s.warning;$('#warning').classList.toggle('hidden',!s.warning);renderMeasurement(s);renderAnalysis()}
function record(){const s=engine.snapshot();state.notes.unshift({date:new Date().toLocaleString('th-TH'),id:s.experiment.id,title:s.experiment.thai,added:s.added,temp:s.temperature,pH:s.pH,observation:s.observation,equation:s.experiment.equation,species:s.species,technique:$$('.techniques .done').length});localStorage.setItem('chemverse-v3-notes',JSON.stringify(state.notes));renderNotes();toast('บันทึก Scientific Lab Report แล้ว')}
function renderNotes(){$('#noteCount').textContent=state.notes.length;$('#notes').innerHTML=state.notes.length?state.notes.map((n,i)=>`<article><header><b>REPORT #${state.notes.length-i}</b><time>${n.date}</time></header><h3>${n.title}</h3><p><strong>Procedure fidelity</strong>${n.technique}/5 ขั้นตอน</p><p><strong>Macro evidence</strong>${n.observation}</p><p><strong>Equation</strong>${n.equation}</p><p><strong>Species snapshot</strong>${Object.entries(n.species).map(([k,v])=>`${k} ${Number(v).toFixed(3)} mmol`).join(' • ')}</p><footer>เติม ${n.added.toFixed(2)} mL • pH ${n.pH.toFixed(2)} • ${n.temp.toFixed(1)} °C</footer></article>`).join(''):'<div class="empty">ยังไม่มีรายงาน เริ่มทดลองและกดบันทึกผล</div>'}

$('#experimentList').innerHTML=experiments.map(e=>`<button data-experiment="${e.id}"><span>${e.icon}</span><p><b>${e.short}</b><small>${e.thai}</small></p><i></i></button>`).join('');
$$('[data-experiment]').forEach(b=>b.onclick=()=>setExperiment(b.dataset.experiment));$$('.console nav button').forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));
$$('.instrument button').forEach(b=>b.onclick=()=>{$$('.instrument button').forEach(x=>x.classList.toggle('active',x===b));$('#graph').classList.toggle('hidden',b.dataset.view!=='graph');$('#particle').classList.toggle('hidden',b.dataset.view!=='particle');renderAnalysis()});
$('#addReagent').onclick=addReagent;$('#advance').onclick=adjustTime;$('#heat').onclick=()=>adjustTemp(10);$('#cool').onclick=()=>adjustTemp(-10);$('#reset').onclick=()=>setExperiment(state.id);$('#record').onclick=record;
$('#closed').onchange=e=>{engine.closed=e.target.checked;engine.calculate();renderAll()};$('#quality').onchange=e=>{state.quality=e.target.value;localStorage.setItem('chemverse-quality',state.quality);labScene.setQuality(state.quality)};
$('#openNotebook').onclick=()=>$('#notebook').classList.add('open');$('.drawer .close').onclick=()=>$('#notebook').classList.remove('open');$('#print').onclick=()=>print();$('#clearNotes').onclick=()=>{if(confirm('ล้างรายงานทั้งหมดหรือไม่?')){state.notes=[];localStorage.removeItem('chemverse-v3-notes');renderNotes()}};
$('#enter').onclick=()=>{$('#intro').classList.add('gone');setTimeout(()=>$('#intro')?.remove(),900)};$('#homeBtn').onclick=()=>location.reload();

renderNotes();setExperiment(state.id);
if('serviceWorker' in navigator&&import.meta.env.PROD)addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
