import './style.css';
import { chemicals, rooms, missions } from './data.js';
import { ChemistryEngine } from './engine.js';
import { LabScene } from './scene.js';
import { drawGraph, drawParticles } from './charts.js';

const state={room:'reaction',quality:localStorage.getItem('chemverse-quality')||'balanced',xp:Number(localStorage.getItem('chemverse-xp')||0),completed:JSON.parse(localStorage.getItem('chemverse-completed')||'[]'),notebook:JSON.parse(localStorage.getItem('chemverse-notebook')||'[]'),mission:null,hints:0,stage:0,poured:[false,false],busy:false};
const engine=new ChemistryEngine();

document.querySelector('#app').innerHTML=`
<div class="noise"></div><div id="flash"></div>
<header><button class="brand" id="homeBtn"><span class="atom">⚛</span><span>CHEMVERSE 2.0<small>MACRO LAB EDITION</small></span></button><div class="hud"><span>LEVEL <b id="level">1</b></span><span class="xp"><i id="xpbar"></i></span><span><b id="xp">0</b> XP</span><select id="quality"><option value="low">Performance</option><option value="balanced">Balanced</option><option value="cinematic">Cinematic</option></select></div></header>
<main>
 <aside class="rooms"><h2>LAB ZONES</h2><div id="roomList"></div><button class="notebook-btn" data-panel="notebook">📓 LAB NOTEBOOK <b id="noteCount">0</b></button></aside>
 <section class="world"><div id="scene"></div><div class="world-title"><small id="roomEn">REACTION LAB</small><h1 id="roomTh">ปฏิกิริยาเคมี</h1><span class="version-badge">MACRO SIMULATION ACTIVE</span></div><div class="telemetry"><span>🌡 <b id="temp">25.0</b> °C</span><span>◉ pH <b id="ph">7.00</b></span><span>◌ <b id="pressure">1.00</b> atm</span></div><div class="macro-tip">แตะขวด A หรือ B เพื่อเทสาร • ของเหลวและปฏิกิริยาเกิดในฉาก 3D</div></section>
 <aside class="console">
  <nav><button class="active" data-tab="experiment">ลงมือทดลอง</button><button data-tab="analysis">วิเคราะห์</button><button data-tab="missions">ภารกิจ</button></nav>
  <div class="tab active" id="experiment">
   <div class="assistant"><div class="bot">A</div><p><b>ATOM</b><span id="atomText">เลือกสารและปริมาตร จากนั้นแตะขวดในฉากหรือใช้ปุ่มควบคุมเพื่อเทจริง</span></p></div>
   <div class="stage-track"><i class="active">1<span>เตรียม</span></i><i>2<span>เท A</span></i><i>3<span>เท B</span></i><i>4<span>คน–สังเกต</span></i></div>
   <div class="chemical-card a"><b>A</b><label>สารละลาย<select id="chemA"></select></label><div class="row"><label>ปริมาตร<input id="volA" type="range" min="1" max="50" value="20"><output id="outA">20 mL</output></label><label>ความเข้มข้น<select id="conA"><option>.1</option><option>.5</option><option selected>1</option><option>2</option></select></label></div><button class="pour" id="pourA">🧴 หยิบและเทสาร A</button></div>
   <div class="chemical-card b"><b>B</b><label>สารละลาย<select id="chemB"></select></label><div class="row"><label>ปริมาตร<input id="volB" type="range" min="1" max="50" value="20"><output id="outB">20 mL</output></label><label>ความเข้มข้น<select id="conB"><option>.1</option><option>.5</option><option selected>1</option><option>2</option></select></label></div><button class="pour" id="pourB">🧴 หยิบและเทสาร B</button></div>
   <div class="toggles"><label><input id="closed" type="checkbox"> ปิดภาชนะ</label><button id="heat">🔥 ให้ความร้อน +10°C</button></div>
   <button class="primary stir" id="stir">🥄 คนสารและสังเกตปฏิกิริยา</button><button class="demo" id="auto">▶ เล่นการทดลองอัตโนมัติ</button><button class="ghost" id="reset">ล้างโต๊ะทดลอง</button>
   <div class="result hidden" id="result"><span id="resultTag"></span><h3 id="observation"></h3><div class="macro-evidence"><i id="eColor">◉ สี</i><i id="ePpt">❄ ตะกอน</i><i id="eGas">○ แก๊ส</i><i id="eHeat">♨ อุณหภูมิ</i></div><div class="equation locked" id="equation">🔒 วิเคราะห์หลักฐานก่อนเปิดสมการ</div><button class="hint" id="hint">ขอคำใบ้จาก ATOM</button></div>
  </div>
  <div class="tab" id="analysis"><div class="instrument"><button class="active" data-view="graph">📈 LIVE GRAPH</button><button data-view="particle">🔬 PARTICLE VISION</button></div><canvas id="graph"></canvas><canvas id="particle" class="hidden"></canvas><div class="metrics"><div><span>การสังเกต</span><b id="skillObs">0%</b></div><div><span>ความปลอดภัย</span><b id="skillSafe">100%</b></div><div><span>สมการเคมี</span><b id="skillEq">0%</b></div></div></div>
  <div class="tab" id="missions"><h3>RECOVER THE DATABASE</h3><p class="muted">ทำภารกิจด้วยการเทและผสมสารใน Macro Lab</p><div id="missionList"></div></div>
 </aside>
</main>
<section class="drawer" id="notebook"><button class="close">×</button><h2>📓 MY LAB NOTEBOOK</h2><p>บันทึกหลักฐานระดับมหภาค สมการ และค่าที่วัดได้</p><div id="notes"></div><div class="drawer-actions"><button id="print">🖨 พิมพ์ / บันทึก PDF</button><button id="clearNotes">ล้างสมุด</button></div></section>
<section class="intro" id="intro"><div class="orb">⚛</div><p class="eyebrow">PHOSI SAWANG WITTAYA SCHOOL</p><h1>CHEMVERSE</h1><h2>MACRO LAB EDITION · VERSION 2.0</h2><p>หยิบ เท ผสม และสังเกตปฏิกิริยาเคมีในโลก 3D</p><button id="enter">ENTER MACRO LAB</button><small>สร้างโดย คุณครูสุพักตร์ศิริ พืชสิงห์</small></section>
<div class="incident hidden" id="incident"><div class="warning">⚠</div><h2>PRESSURE CRITICAL</h2><p>การเกิดแก๊สในภาชนะปิดทำให้ความดันเพิ่มสูงขึ้น</p><div class="pressureline"><i></i></div><button id="emergency">EMERGENCY STOP</button></div>`;

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const labScene=new LabScene($('#scene'));labScene.setQuality(state.quality);$('#quality').value=state.quality;
const chemOptions=()=>Object.entries(chemicals).map(([id,c])=>`<option value="${id}">${c.formula} — ${c.name}</option>`).join('');
$('#chemA').innerHTML=chemOptions();$('#chemB').innerHTML=chemOptions();$('#chemA').value='agno3';$('#chemB').value='nacl';
$('#roomList').innerHTML=rooms.map(r=>`<button data-room="${r.id}" style="--c:${r.color}" class="${r.id===state.room?'active':''}"><span>${r.icon}</span><p><b>${r.name}</b><small>${r.th}</small></p><i></i></button>`).join('');

function save(){localStorage.setItem('chemverse-xp',state.xp);localStorage.setItem('chemverse-completed',JSON.stringify(state.completed));localStorage.setItem('chemverse-notebook',JSON.stringify(state.notebook))}
function updateHud(){const level=Math.floor(state.xp/500)+1;$('#level').textContent=level;$('#xp').textContent=state.xp;$('#xpbar').style.width=`${state.xp%500/5}%`;$('#noteCount').textContent=state.notebook.length;save()}
function telemetry(){const s=engine.snapshot();$('#temp').textContent=s.temperature.toFixed(1);$('#ph').textContent=s.pH.toFixed(2);$('#pressure').textContent=s.pressure.toFixed(2);drawGraph($('#graph'),s);drawParticles($('#particle'),s)}
function toast(text){const el=document.createElement('div');el.className='toast';el.textContent=text;document.body.append(el);setTimeout(()=>el.remove(),2600)}
function switchTab(id){$$('.console nav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));$$('.console .tab').forEach(t=>t.classList.toggle('active',t.id===id));if(id==='analysis')setTimeout(telemetry,20)}
function setRoom(id){state.room=id;const room=rooms.find(r=>r.id===id);$('#roomEn').textContent=room.name.toUpperCase();$('#roomTh').textContent=room.th;$$('[data-room]').forEach(b=>b.classList.toggle('active',b.dataset.room===id));$('#flash').animate([{opacity:.45},{opacity:0}],{duration:520})}
function updateStages(n){state.stage=n;$$('.stage-track i').forEach((x,i)=>{x.classList.toggle('active',i<=n);x.classList.toggle('done',i<n)})}
function setEvidence(result){$('#eColor').classList.toggle('on',Boolean(result.color));$('#ePpt').classList.toggle('on',result.type==='precipitate'||result.type==='redox');$('#eGas').classList.toggle('on',result.type==='gas');$('#eHeat').classList.toggle('on',Boolean(result.heat))}

function resetLab(silent=false){engine.reset();state.poured=[false,false];state.busy=false;state.hints=0;labScene.resetMacro();labScene.setChemicals(chemicals[$('#chemA').value],chemicals[$('#chemB').value]);$('#result').classList.add('hidden');updateStages(0);telemetry();if(!silent)$('#atomText').textContent='โต๊ะสะอาดแล้ว เลือกสารและแตะขวด A หรือ B เพื่อเริ่มเท'}
function pour(index,next){
 if(state.busy||state.poured[index])return;state.busy=true;const suffix=index?'B':'A',id=$('#chem'+suffix).value,volume=$('#vol'+suffix).value,con=$('#con'+suffix).value;
 $('#atomText').textContent=`กำลังเท ${chemicals[id].name} ${volume} mL สังเกตสายของเหลวและระดับในบีกเกอร์`;
 labScene.pourChemical(index,volume,()=>{engine.add(id,volume,con);state.poured[index]=true;state.busy=false;updateStages(state.poured[0]&&state.poured[1]?2:index+1);telemetry();toast(`เทสาร ${suffix} แล้ว ${volume} mL`);next?.()});
}
function react(){
 if(state.busy)return;if(!state.poured[0]||!state.poured[1]){toast('ต้องเทสาร A และ B ก่อน');return}state.busy=true;$('#atomText').textContent='กำลังคนสาร… สังเกตสี ความขุ่น ฟองแก๊ส และอุณหภูมิ';
 labScene.stir(()=>{engine.closed=$('#closed').checked;const result=engine.mix();labScene.react(result);state.busy=false;updateStages(3);telemetry();showResult(result);record(result);checkMission($('#chemA').value,$('#chemB').value);if(result.pressure>3.2)setTimeout(showIncident,700)});
}
function showResult(result){$('#result').classList.remove('hidden');$('#resultTag').textContent=result.type.toUpperCase();$('#observation').textContent=result.observation;$('#equation').className='equation locked';$('#equation').textContent='🔒 วิเคราะห์หลักฐานก่อนเปิดสมการ';setEvidence(result);$('#atomText').textContent=result.type==='none'?'ไม่มีการเปลี่ยนแปลงที่มองเห็นได้ นี่ก็เป็นหลักฐานทางวิทยาศาสตร์':'ระบุหลักฐานระดับมหภาคที่เห็น ก่อนเชื่อมโยงสู่ระดับอนุภาค';$('#skillObs').textContent=Math.min(100,state.notebook.length*12+12)+'%'}
function record(result){const a=chemicals[$('#chemA').value],b=chemicals[$('#chemB').value],now=new Date();state.notebook.unshift({time:now.toLocaleString('th-TH'),a:a.formula,b:b.formula,volA:$('#volA').value,volB:$('#volB').value,observation:result.observation,equation:result.equation,net:result.net,pH:engine.pH,temp:engine.temperature});renderNotes()}
function autoDemo(){if(state.busy)return;resetLab(true);$('#atomText').textContent='โหมดสาธิต: เริ่มหยิบและเทสาร A';setTimeout(()=>pour(0,()=>setTimeout(()=>pour(1,()=>setTimeout(react,500)),350)),250)}

labScene.onBottleSelect=index=>pour(index);
$('#pourA').onclick=()=>pour(0);$('#pourB').onclick=()=>pour(1);$('#stir').onclick=react;$('#auto').onclick=autoDemo;$('#reset').onclick=()=>resetLab();
[$('#chemA'),$('#chemB')].forEach(x=>x.onchange=()=>resetLab(true));
$$('input[type=range]').forEach(i=>i.oninput=()=>{$('#out'+i.id.at(-1)).textContent=i.value+' mL'});
$('#closed').onchange=e=>engine.closed=e.target.checked;
$('#heat').onclick=()=>{const h=engine.heat();labScene.heat();telemetry();if(h.critical)showIncident();else toast(`อุณหภูมิ ${h.temperature} °C`)};
$('#quality').onchange=e=>{state.quality=e.target.value;localStorage.setItem('chemverse-quality',state.quality);labScene.setQuality(state.quality);toast('ปรับกราฟิกแล้ว')};
$$('[data-room]').forEach(b=>b.onclick=()=>setRoom(b.dataset.room));$$('.console nav button').forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));
$$('.instrument button').forEach(b=>b.onclick=()=>{$$('.instrument button').forEach(x=>x.classList.toggle('active',x===b));$('#graph').classList.toggle('hidden',b.dataset.view!=='graph');$('#particle').classList.toggle('hidden',b.dataset.view!=='particle');telemetry()});
$('#hint').onclick=()=>{const r=engine.result;if(!r)return;state.hints++;if(state.hints===1)$('#atomText').textContent='เริ่มจากสิ่งที่มองเห็น: สี ความขุ่น ฟอง หรืออุณหภูมิเปลี่ยนหรือไม่?';else if(state.hints===2){$('#atomText').textContent=r.net;switchTab('analysis');$('[data-view=particle]').click()}else{$('#equation').classList.remove('locked');$('#equation').innerHTML=`<b>${r.equation}</b><small>Net ionic: ${r.net}</small>`;$('#skillEq').textContent=Math.min(100,state.notebook.length*15)+'%'}};

function checkMission(a,b){const m=state.mission;if(!m)return;if(m.targets.includes(a)&&m.targets.includes(b)){if(!state.completed.includes(m.id)){state.completed.push(m.id);state.xp+=m.xp;toast(`MISSION COMPLETE +${m.xp} XP`);$('#flash').animate([{background:'#82ffe6',opacity:.8},{opacity:0}],{duration:900})}state.mission=null;renderMissions();updateHud()}}
function renderMissions(){$('#missionList').innerHTML=missions.map(m=>`<button class="mission ${state.completed.includes(m.id)?'done':''} ${state.mission?.id===m.id?'selected':''}" data-mission="${m.id}"><span>${String(m.id).padStart(2,'0')}</span><p><b>${m.title}</b><small>${m.brief}</small></p><em>${state.completed.includes(m.id)?'✓':m.xp+' XP'}</em></button>`).join('');$$('[data-mission]').forEach(b=>b.onclick=()=>{const m=missions.find(x=>x.id===Number(b.dataset.mission));state.mission=m;setRoom(m.room);switchTab('experiment');resetLab(true);$('#atomText').textContent=`ภารกิจ: ${m.brief} เลือกสารแล้วลงมือเทด้วยตัวเอง`;renderMissions()})}
function renderNotes(){$('#notes').innerHTML=state.notebook.length?state.notebook.map((n,i)=>`<article><header><b>EXPERIMENT #${state.notebook.length-i}</b><time>${n.time}</time></header><h3>${n.a} (${n.volA} mL) + ${n.b} (${n.volB} mL)</h3><p><strong>Macro observation</strong>${n.observation}</p><p><strong>Equation</strong>${n.equation}</p><p><strong>Net ionic</strong>${n.net}</p><footer>pH ${n.pH.toFixed(2)} • ${n.temp.toFixed(1)} °C</footer></article>`).join(''):'<div class="empty">ยังไม่มีการทดลอง แตะขวดสารในฉาก 3D เพื่อเริ่มต้น</div>';updateHud()}
$('[data-panel=notebook]').onclick=()=>$('#notebook').classList.add('open');$('.drawer .close').onclick=()=>$('#notebook').classList.remove('open');$('#print').onclick=()=>print();$('#clearNotes').onclick=()=>{if(confirm('ล้างบันทึกทั้งหมดหรือไม่?')){state.notebook=[];renderNotes()}};
function showIncident(){$('#incident').classList.remove('hidden');$('#skillSafe').textContent='55%'}
$('#emergency').onclick=()=>{$('#incident').classList.add('hidden');engine.closed=false;$('#closed').checked=false;engine.pressure=1;telemetry();$('#atomText').textContent='วิเคราะห์เหตุการณ์: เมื่อแก๊สเกิดในภาชนะปิด จำนวนโมลแก๊สและอุณหภูมิทำให้ความดันสูงขึ้น';toast('Emergency stop สำเร็จ')};
$('#enter').onclick=()=>{$('#intro').classList.add('gone');setTimeout(()=>$('#intro').remove(),900)};$('#homeBtn').onclick=()=>location.reload();
renderMissions();renderNotes();resetLab(true);telemetry();
if('serviceWorker' in navigator&&import.meta.env.PROD)addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
