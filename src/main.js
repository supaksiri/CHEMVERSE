import './style.css';
import { experiments,getExperiment } from './experiments.js';
import { chemicals } from './data.js';
import { ScientificEngine } from './engine.js';
import { LabScene } from './scene.js';
import { drawGraph,drawParticles } from './charts.js';

const safe=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
const state={id:localStorage.getItem('chemverse-v4-experiment')||'titration',quality:localStorage.getItem('chemverse-quality')||'balanced',notes:safe('chemverse-v4-notes',[]),busy:false,lastFrame:performance.now(),lastPaint:0,measured:false};
const engine=new ScientificEngine(state.id);

document.querySelector('#app').innerHTML=`
<div class="noise"></div><div id="flash"></div>
<header><button class="brand" id="homeBtn"><span class="atom">⚛</span><span>CHEMVERSE 4.0<small>AUTHENTIC APPARATUS LAB</small></span></button><div class="hud"><span class="live-dot">● REAL-TIME</span><span id="syncState">4 SYSTEMS SYNCED</span><select id="quality"><option value="low">Performance</option><option value="balanced">Balanced</option><option value="cinematic">Cinematic</option></select></div></header>
<main class="v4-layout">
 <aside class="rooms v4-side"><h2>LAB MODULES</h2><div id="experimentList"></div><button class="notebook-btn" id="openNotebook">📓 REPORTS <b id="noteCount">0</b></button></aside>
 <section class="world"><div id="scene"></div><div class="world-title"><small id="labTitle"></small><h1 id="labThai"></h1><span class="version-badge">APPARATUS STATE MACHINE</span></div><div class="telemetry v4-telemetry"><span>🌡 <b id="temp">25.0</b> °C</span><span>◉ pH <b id="ph">—</b></span><span>⏱ <b id="time">0.0</b> s</span></div><div class="apparatus-hint" id="sceneHint">คลิกอุปกรณ์ที่เรืองแสง หรือใช้แผงขั้นตอนด้านขวา</div></section>
 <aside class="console v4-console">
  <div class="console-head"><div><small>MISSION TARGET</small><p id="target"></p></div><button id="reset">↻ RESET</button></div>
  <div class="assistant compact"><div class="bot">A</div><p><b>ATOM</b><span id="atomText"></span></p></div>
  <section class="workflow-panel"><div class="panel-title"><b>อุปกรณ์และขั้นตอนจริง</b><span id="progressText">0/5</span></div><div class="action-list" id="actions"></div></section>
  <section class="flow-control" id="flowControl"><div><label>อัตราการไหล</label><input id="flowRate" type="range" min="0.05" max="2" step="0.05" value="0.45"><output id="flowOut">0.45 mL/s</output></div><div><label>ปริมาณต่อครั้ง</label><select id="dose"><option value="0.1">0.10 mL</option><option value="0.5" selected>0.50 mL</option><option value="1">1.00 mL</option><option value="5">5.00 mL</option></select></div></section>
  <section class="live-dashboard">
   <div class="panel-title"><b>ข้อมูลสดจากการทดลอง</b><span class="live-dot">● LIVE</span></div>
   <div class="measurement-grid compact-grid"><article><span>บิวเรต/สารเติม</span><b id="mAdded">0.00</b><small>mL</small></article><article><span id="measure3Label">pH meter</span><b id="measure3">—</b><small id="measure3Unit"></small></article><article><span>อุณหภูมิ</span><b id="mTemp">25.0</b><small>°C</small></article><article><span id="measure4Label">อัตราการไหล</span><b id="measure4">0.00</b><small id="measure4Unit">mL/s</small></article></div>
   <p class="macro-observation" id="observation"></p><div class="warning-box hidden" id="warning"></div>
   <div class="dual-analysis"><figure><figcaption>📈 กราฟเรียลไทม์</figcaption><canvas id="graph"></canvas></figure><figure><figcaption>🔬 อนุภาคสัมพันธ์</figcaption><canvas id="particle"></canvas></figure></div>
   <div class="equation-v3"><b id="equation"></b><small id="net"></small></div>
  </section>
  <div class="bottom-controls"><button id="cool">❄ −10°C</button><button id="heat">🔥 +10°C</button><button class="primary" id="record">บันทึกรายงาน</button></div>
 </aside>
</main>
<section class="drawer" id="notebook"><button class="close">×</button><h2>📓 AUTHENTIC LAB REPORTS</h2><p>บันทึกค่าที่วัดจริง พร้อมสถานะอุปกรณ์และข้อมูลกราฟ</p><div id="notes"></div><div class="drawer-actions"><button id="print">🖨 พิมพ์ / PDF</button><button id="clearNotes">ล้างรายงาน</button></div></section>
<section class="intro" id="intro"><div class="orb">⚛</div><p class="eyebrow">PHOSI SAWANG WITTAYA SCHOOL</p><h1>CHEMVERSE</h1><h2>AUTHENTIC APPARATUS LAB · VERSION 4.0</h2><p>จับอุปกรณ์ตามหน้าที่ เปิดวาล์วจริง และเห็นมหภาค–เครื่องมือ–กราฟ–อนุภาคพร้อมกัน</p><button id="enter">ENTER AUTHENTIC LAB</button><small>สร้างโดย คุณครูสุพักตร์ศิริ พืชสิงห์</small></section>`;

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const labScene=new LabScene($('#scene'));labScene.setQuality(state.quality);$('#quality').value=state.quality;
const toast=text=>{const el=document.createElement('div');el.className='toast';el.textContent=text;document.body.append(el);setTimeout(()=>el.remove(),2600)};

function actionDone(action,s){
  return ({rinsePipette:s.rinsed,transferSample:s.sampleTransferred,fillBurette:s.buretteFilled,calibrateProbe:s.calibrated,placeProbe:s.probePlaced,swirl:s.swirled,filter:s.filtered,dry:s.dried,blank:s.blank,assemble:s.apparatus.system==='assembled',connectSensor:s.apparatus.sensor==='online',dose:s.added>0,flow:s.added>0,run:s.time>1,measure:state.measured,temperature:s.temperature!==25})[action]||false;
}
function setExperiment(id){
  state.id=id;state.busy=false;state.measured=false;localStorage.setItem('chemverse-v4-experiment',id);engine.select(id);const e=getExperiment(id);
  $('#labTitle').textContent=e.title.toUpperCase();$('#labThai').textContent=e.thai;$('#target').textContent=e.target;$('#equation').textContent=e.equation;$('#net').textContent='Net ionic: '+e.net;
  $('#atomText').textContent=id==='titration'?'เริ่มจากล้างปิเปต ก่อนตวง HCl ลงขวดรูปชมพู่ ระบบจะไม่เปิด stopcock จนกว่าอุปกรณ์พร้อม':'เลือกใช้อุปกรณ์ตามลำดับ แต่ละปุ่มจะเรียกการเคลื่อนไหวเฉพาะของอุปกรณ์นั้น';
  $('#actions').innerHTML=e.actions.map(([action,label,tool],i)=>`<button data-action="${action}"><i>${i+1}</i><span><b>${label}</b><small>${tool}</small></span><em>○</em></button>`).join('');
  $$('[data-action]').forEach(b=>b.onclick=()=>perform(b.dataset.action));$$('[data-experiment]').forEach(b=>b.classList.toggle('active',b.dataset.experiment===id));
  $('#flowControl').classList.toggle('generic',id!=='titration');$('#dose').value=id==='titration'?'.5':id==='equilibrium'?'1':'5';
  labScene.resetMacro();labScene.setExperiment(id);labScene.setChemicals(chemicals[e.sample.id],chemicals[e.reagent.id]);labScene.totalVolume=0;labScene.setLevel(.2);labScene.updateScientificState(engine.snapshot());renderAll(true);
}
function perform(action){
  if(state.busy)return;const e=engine.experiment;
  if(action==='flow'){
    if(engine.running){engine.stopFlow();labScene.setContinuousFlow(false);$('#atomText').textContent='ปิด stopcock แล้ว อ่านปริมาตรและตรวจตำแหน่งบนกราฟ';renderAll();return}
    if(!engine.canFlow()){toast('ยังเปิดไม่ได้: ต้องตวง HCl เติมบิวเรต และเตรียม pH meter ก่อน');$('#atomText').textContent='ทำขั้นตอนเตรียมอุปกรณ์ให้ครบก่อนเปิด stopcock';return}
    const rate=Number($('#flowRate').value);engine.startFlow(rate);labScene.setContinuousFlow(true,rate);$('#atomText').textContent='NaOH กำลังไหล ค่าบิวเรต pH กราฟ และอนุภาคเปลี่ยนพร้อมกัน — ใกล้ 25 mL ให้ลดอัตราไหล';renderAll();return;
  }
  if(action==='run'){engine.running=!engine.running;$('#atomText').textContent=engine.running?'เริ่มเก็บข้อมูลตามเวลาแบบต่อเนื่องแล้ว':'หยุดเวลาและเก็บข้อมูลแล้ว';renderAll();return}
  if(action==='dose'){
    const amount=Number($('#dose').value);state.busy=true;labScene.pourChemical(1,amount,()=>{engine.add(amount);state.busy=false;labScene.updateScientificState(engine.snapshot());renderAll();toast(`เติม ${chemicals[e.reagent.id].formula} ${amount.toFixed(2)} mL`)});return;
  }
  if(action==='temperature'){engine.setTemperature(engine.temperature+10);labScene.heat();renderAll();return}
  state.busy=true;labScene.performAction(action,()=>{engine.apparatusAction(action);state.busy=false;if(action==='transferSample'){labScene.totalVolume=e.sample.volume||10;labScene.setLevel(labScene.totalVolume)}if(action==='measure')state.measured=true;labScene.updateScientificState(engine.snapshot());$('#atomText').textContent=`ดำเนินการ “${e.actions.find(a=>a[0]===action)?.[1]}” แล้ว สังเกตสถานะอุปกรณ์และค่าที่เปลี่ยน`;renderAll()});
}
function renderMeasurement(s){
  $('#mAdded').textContent=s.added.toFixed(2);$('#mTemp').textContent=s.temperature.toFixed(1);
  let third=['pH meter',s.probePlaced&&s.calibrated?s.pH.toFixed(2):'—',''],fourth=['อัตราการไหล',s.running?s.flowRate.toFixed(2):'0.00','mL/s'];
  if(s.experiment.id==='precipitation')third=['มวล AgCl',state.measured?s.precipitateMass.toFixed(3):'—','g'];
  if(s.experiment.id==='gas')third=['ปริมาตร H₂',s.gasVolume.toFixed(1),'mL'];
  if(s.experiment.id==='kinetics')third=['ปริมาตร O₂',s.gasVolume.toFixed(1),'mL'];
  if(s.experiment.id==='equilibrium')third=['Absorbance',state.measured&&s.blank?s.absorbance.toFixed(3):'—','AU'];
  if(s.experiment.id!=='titration')fourth=['อัตราปฏิกิริยา',s.rate.toFixed(3),'mmol/s'];
  [$('#measure3Label').textContent,$('#measure3').textContent,$('#measure3Unit').textContent]=third;[$('#measure4Label').textContent,$('#measure4').textContent,$('#measure4Unit').textContent]=fourth;
}
function renderAll(force=false){
  const s=engine.snapshot();$('#temp').textContent=s.temperature.toFixed(1);$('#ph').textContent=s.probePlaced&&s.calibrated?s.pH.toFixed(2):'—';$('#time').textContent=s.time.toFixed(1);$('#observation').textContent=s.observation;$('#warning').textContent=s.warning;$('#warning').classList.toggle('hidden',!s.warning);renderMeasurement(s);
  let completed=0;$$('[data-action]').forEach(b=>{const done=actionDone(b.dataset.action,s);b.classList.toggle('done',done);b.querySelector('em').textContent=b.dataset.action==='flow'&&s.running?'■':done?'✓':'○';if(done)completed++});$('#progressText').textContent=`${completed}/${engine.experiment.actions.length}`;
  drawGraph($('#graph'),s);drawParticles($('#particle'),s);labScene.updateScientificState(s);
  if(force||s.added>24.5&&s.added<25.5)$('#syncState').textContent=s.added>24.5&&s.added<25.5?'NEAR EQUIVALENCE':'4 SYSTEMS SYNCED';
}
function record(){const s=engine.snapshot();state.notes.unshift({date:new Date().toLocaleString('th-TH'),title:s.experiment.thai,added:s.added,temp:s.temperature,pH:s.pH,observation:s.observation,equation:s.experiment.equation,apparatus:s.apparatus,points:s.history.length});localStorage.setItem('chemverse-v4-notes',JSON.stringify(state.notes));renderNotes();toast('บันทึกรายงานพร้อมสถานะอุปกรณ์แล้ว')}
function renderNotes(){$('#noteCount').textContent=state.notes.length;$('#notes').innerHTML=state.notes.length?state.notes.map((n,i)=>`<article><header><b>REPORT #${state.notes.length-i}</b><time>${n.date}</time></header><h3>${n.title}</h3><p><strong>Macro evidence</strong>${n.observation}</p><p><strong>Equation</strong>${n.equation}</p><p><strong>Apparatus state</strong>${Object.entries(n.apparatus).map(([k,v])=>`${k}: ${v}`).join(' • ')}</p><footer>เติม ${n.added.toFixed(2)} mL • pH ${n.pH.toFixed(2)} • กราฟ ${n.points} จุด</footer></article>`).join(''):'<div class="empty">ยังไม่มีรายงาน เริ่มใช้อุปกรณ์และบันทึกผล</div>'}
function loop(now){const dt=Math.min(.1,(now-state.lastFrame)/1000);state.lastFrame=now;if(engine.running)engine.tick(dt);if(now-state.lastPaint>90){renderAll();state.lastPaint=now}requestAnimationFrame(loop)}

$('#experimentList').innerHTML=experiments.map((e,i)=>`<button data-experiment="${e.id}" style="--c:${i?'#8c72ff':'#55e9ff'}"><span>${e.icon}</span><p><b>${e.short}</b><small>${e.thai}</small></p><i></i></button>`).join('');
$$('[data-experiment]').forEach(b=>b.onclick=()=>setExperiment(b.dataset.experiment));$('#flowRate').oninput=e=>$('#flowOut').textContent=Number(e.target.value).toFixed(2)+' mL/s';
$('#heat').onclick=()=>{engine.setTemperature(engine.temperature+10);labScene.heat();renderAll()};$('#cool').onclick=()=>{engine.setTemperature(engine.temperature-10);renderAll()};$('#reset').onclick=()=>setExperiment(state.id);$('#record').onclick=record;
$('#quality').onchange=e=>{state.quality=e.target.value;localStorage.setItem('chemverse-quality',state.quality);labScene.setQuality(state.quality)};labScene.onApparatusAction=perform;
$('#openNotebook').onclick=()=>$('#notebook').classList.add('open');$('.drawer .close').onclick=()=>$('#notebook').classList.remove('open');$('#print').onclick=()=>print();$('#clearNotes').onclick=()=>{if(confirm('ล้างรายงานทั้งหมดหรือไม่?')){state.notes=[];localStorage.removeItem('chemverse-v4-notes');renderNotes()}};
$('#enter').onclick=()=>{$('#intro').classList.add('gone');setTimeout(()=>$('#intro')?.remove(),900)};$('#homeBtn').onclick=()=>location.reload();

renderNotes();setExperiment(state.id);requestAnimationFrame(loop);
if('serviceWorker' in navigator&&import.meta.env.PROD)addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').then(r=>r.update()));
