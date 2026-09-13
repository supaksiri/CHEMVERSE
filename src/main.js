import './style.css';
import { chemicals, rooms, missions } from './data.js';
import { ChemistryEngine } from './engine.js';
import { LabScene } from './scene.js';
import { drawGraph, drawParticles } from './charts.js';

const state={room:'reaction',quality:localStorage.getItem('chemverse-quality')||'balanced',xp:Number(localStorage.getItem('chemverse-xp')||0),completed:JSON.parse(localStorage.getItem('chemverse-completed')||'[]'),notebook:JSON.parse(localStorage.getItem('chemverse-notebook')||'[]'),mission:null,hints:0};
const engine=new ChemistryEngine();

document.querySelector('#app').innerHTML=`
<div class="noise"></div><div id="flash"></div>
<header><button class="brand" id="homeBtn"><span class="atom">⚛</span><span>CHEMVERSE<small>VIRTUAL CHEMISTRY INSTITUTE</small></span></button><div class="hud"><span>LEVEL <b id="level">1</b></span><span class="xp"><i id="xpbar"></i></span><span><b id="xp">0</b> XP</span><button id="soundBtn" aria-label="เสียง">🔊</button><select id="quality" aria-label="คุณภาพกราฟิก"><option value="low">Performance</option><option value="balanced">Balanced</option><option value="cinematic">Cinematic</option></select></div></header>
<main>
 <aside class="rooms"><h2>LAB ZONES</h2><div id="roomList"></div><button class="notebook-btn" data-panel="notebook">📓 LAB NOTEBOOK <b id="noteCount">0</b></button></aside>
 <section class="world"><div id="scene"></div><div class="world-title"><small id="roomEn">REACTION LAB</small><h1 id="roomTh">ปฏิกิริยาเคมี</h1></div><div class="telemetry"><span>🌡 <b id="temp">25.0</b> °C</span><span>◉ pH <b id="ph">7.00</b></span><span>◌ <b id="pressure">1.00</b> atm</span></div><div class="drag-tip">ลากเพื่อหมุนมุมมอง • แตะอุปกรณ์เพื่อทดลอง</div></section>
 <aside class="console">
  <nav><button class="active" data-tab="experiment">ทดลอง</button><button data-tab="analysis">วิเคราะห์</button><button data-tab="missions">ภารกิจ</button></nav>
  <div class="tab active" id="experiment">
   <div class="assistant"><div class="bot">A</div><p><b>ATOM</b><span id="atomText">เลือกสาร 2 ชนิด แล้วสังเกตสิ่งที่เกิดขึ้น ผมจะถามนำก่อนเฉลยเสมอ</span></p></div>
   <label>สาร A<select id="chemA"></select></label><div class="row"><label>ปริมาตร<input id="volA" type="range" min="1" max="50" value="10"><output id="outA">10 mL</output></label><label>ความเข้มข้น<select id="conA"><option>.1</option><option>.5</option><option selected>1</option><option>2</option></select></label></div>
   <label>สาร B<select id="chemB"></select></label><div class="row"><label>ปริมาตร<input id="volB" type="range" min="1" max="50" value="10"><output id="outB">10 mL</output></label><label>ความเข้มข้น<select id="conB"><option>.1</option><option>.5</option><option selected>1</option><option>2</option></select></label></div>
   <div class="toggles"><label><input id="closed" type="checkbox"> ภาชนะปิด</label><button id="heat">🔥 ให้ความร้อน +10°C</button></div>
   <button class="primary" id="mix">⚡ เริ่มการทดลอง</button><button class="ghost" id="reset">ล้างโต๊ะทดลอง</button>
   <div class="result hidden" id="result"><span id="resultTag"></span><h3 id="observation"></h3><div class="equation locked" id="equation">🔒 วิเคราะห์ก่อนเปิดสมการ</div><button class="hint" id="hint">ขอคำใบ้จาก ATOM</button></div>
  </div>
  <div class="tab" id="analysis"><div class="instrument"><button class="active" data-view="graph">📈 LIVE GRAPH</button><button data-view="particle">🔬 PARTICLE VISION</button></div><canvas id="graph"></canvas><canvas id="particle" class="hidden"></canvas><div class="metrics"><div><span>การสังเกต</span><b id="skillObs">0%</b></div><div><span>ความปลอดภัย</span><b id="skillSafe">100%</b></div><div><span>สมการเคมี</span><b id="skillEq">0%</b></div></div></div>
  <div class="tab" id="missions"><h3>RECOVER THE DATABASE</h3><p class="muted">ทำภารกิจเพื่อปลดล็อก Reaction Core</p><div id="missionList"></div></div>
 </aside>
</main>
<section class="drawer" id="notebook"><button class="close">×</button><h2>📓 MY LAB NOTEBOOK</h2><p>หลักฐานการค้นพบทั้งหมดของคุณจะบันทึกอัตโนมัติ</p><div id="notes"></div><div class="drawer-actions"><button id="print">🖨 พิมพ์ / บันทึก PDF</button><button id="clearNotes">ล้างสมุด</button></div></section>
<section class="intro" id="intro"><div class="orb">⚛</div><p class="eyebrow">PHOSI SAWANG WITTAYA SCHOOL</p><h1>CHEMVERSE</h1><h2>THE LOST REACTION DATABASE</h2><p>เข้าสู่สถาบันวิจัยเคมีเสมือน ทดลอง สังเกต และกู้คืนองค์ความรู้ด้วยตัวคุณเอง</p><button id="enter">ENTER THE INSTITUTE</button><small>สร้างโดย คุณครูสุพักตร์ศิริ พืชสิงห์</small></section>
<div class="incident hidden" id="incident"><div class="warning">⚠</div><h2>PRESSURE CRITICAL</h2><p>ความดันในภาชนะปิดสูงเกินขีดปลอดภัย</p><div class="pressureline"><i></i></div><button id="emergency">EMERGENCY STOP</button></div>`;

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const labScene=new LabScene($('#scene')); labScene.setQuality(state.quality); $('#quality').value=state.quality;

function chemOptions(){return Object.entries(chemicals).map(([id,c])=>`<option value="${id}">${c.formula} — ${c.name}</option>`).join('')}
$('#chemA').innerHTML=chemOptions();$('#chemB').innerHTML=chemOptions();$('#chemA').value='agno3';$('#chemB').value='nacl';
$('#roomList').innerHTML=rooms.map(r=>`<button data-room="${r.id}" style="--c:${r.color}" class="${r.id===state.room?'active':''}"><span>${r.icon}</span><p><b>${r.name}</b><small>${r.th}</small></p><i></i></button>`).join('');

function updateHud(){const level=Math.floor(state.xp/500)+1;$('#level').textContent=level;$('#xp').textContent=state.xp;$('#xpbar').style.width=`${state.xp%500/5}%`;$('#noteCount').textContent=state.notebook.length;localStorage.setItem('chemverse-xp',state.xp);localStorage.setItem('chemverse-completed',JSON.stringify(state.completed));localStorage.setItem('chemverse-notebook',JSON.stringify(state.notebook));}
function telemetry(){const s=engine.snapshot();$('#temp').textContent=s.temperature.toFixed(1);$('#ph').textContent=s.pH.toFixed(2);$('#pressure').textContent=s.pressure.toFixed(2);labScene.setLevel(s.contents.reduce((n,c)=>n+c.volume,0));drawGraph($('#graph'),s);drawParticles($('#particle'),s);}
function setRoom(id){state.room=id;const room=rooms.find(r=>r.id===id);$('#roomEn').textContent=room.name.toUpperCase();$('#roomTh').textContent=room.th;$$('[data-room]').forEach(b=>b.classList.toggle('active',b.dataset.room===id));$('#flash').animate([{opacity:.5},{opacity:0}],{duration:550});}
function toast(text){const el=document.createElement('div');el.className='toast';el.textContent=text;document.body.append(el);setTimeout(()=>el.remove(),2600)}
function switchTab(id){$$('.console nav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));$$('.console .tab').forEach(t=>t.classList.toggle('active',t.id===id));if(id==='analysis')setTimeout(telemetry,10)}

$$('[data-room]').forEach(b=>b.onclick=()=>setRoom(b.dataset.room));
$$('.console nav button').forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));
$$('input[type=range]').forEach(i=>i.oninput=()=>$('#out'+i.id.at(-1)).textContent=i.value+' mL');
$('#quality').onchange=e=>{state.quality=e.target.value;localStorage.setItem('chemverse-quality',state.quality);labScene.setQuality(state.quality);toast('ปรับกราฟิกเป็น '+e.target.selectedOptions[0].text)};
$('#closed').onchange=e=>engine.closed=e.target.checked;
$('#reset').onclick=()=>{engine.reset();labScene.setLiquid(0x5dccff);labScene.clearParticles();$('#result').classList.add('hidden');$('#atomText').textContent='โต๊ะทดลองพร้อมแล้ว เลือกสารคู่ใหม่และตั้งสมมติฐานก่อนทดลอง';telemetry()};
$('#heat').onclick=()=>{const h=engine.heat();telemetry();if(h.critical)showIncident();else toast(`อุณหภูมิ ${h.temperature} °C`)};

$('#mix').onclick=()=>{
 engine.reset();engine.closed=$('#closed').checked;const a=$('#chemA').value,b=$('#chemB').value;engine.add(a,$('#volA').value,$('#conA').value);engine.add(b,$('#volB').value,$('#conB').value);const result=engine.mix();
 labScene.react(result);telemetry();const box=$('#result');box.classList.remove('hidden');$('#resultTag').textContent=result.type.toUpperCase();$('#observation').textContent=result.observation;$('#equation').className='equation locked';$('#equation').textContent='🔒 วิเคราะห์ก่อนเปิดสมการ';state.hints=0;
 $('#atomText').textContent=result.type==='none'?'การไม่เห็นการเปลี่ยนแปลงก็เป็นหลักฐาน ลองเปิด Particle Vision แล้วดูว่าไอออนหายไปหรือไม่':'คุณสังเกตเห็นหลักฐานระดับมหภาคอะไรบ้าง? อธิบายก่อนเปิดสมการ';
 if(result.pressure>3.2)showIncident();
 const now=new Date();state.notebook.unshift({time:now.toLocaleString('th-TH'),a:chemicals[a].formula,b:chemicals[b].formula,observation:result.observation,equation:result.equation,net:result.net,pH:engine.pH,temp:engine.temperature});
 checkMission(a,b);updateHud();renderNotes();$('#skillObs').textContent=Math.min(100,state.notebook.length*12)+'%';
};
$('#hint').onclick=()=>{state.hints++;const r=engine.result;if(!r)return; if(state.hints===1)$('#atomText').textContent=r.type==='precipitate'?'อนุภาคใดรวมตัวแล้วไม่ละลายน้ำ?':'ตรวจชนิดของสารตั้งต้นและหลักฐานที่มองเห็น';else if(state.hints===2){$('#atomText').textContent=r.net;switchTab('analysis');$('.instrument [data-view=particle]').click()}else{$('#equation').classList.remove('locked');$('#equation').innerHTML=`<b>${r.equation}</b><small>Net ionic: ${r.net}</small>`;$('#skillEq').textContent=Math.min(100,state.notebook.length*15)+'%'} };

function checkMission(a,b){const m=state.mission;if(!m)return;if(m.targets.includes(a)&&m.targets.includes(b)){if(!state.completed.includes(m.id)){state.completed.push(m.id);state.xp+=m.xp;toast(`MISSION COMPLETE +${m.xp} XP`);$('#flash').animate([{background:'#82ffe6',opacity:.8},{opacity:0}],{duration:900});}state.mission=null;renderMissions();}}
function renderMissions(){$('#missionList').innerHTML=missions.map(m=>`<button class="mission ${state.completed.includes(m.id)?'done':''} ${state.mission?.id===m.id?'selected':''}" data-mission="${m.id}"><span>${String(m.id).padStart(2,'0')}</span><p><b>${m.title}</b><small>${m.brief}</small></p><em>${state.completed.includes(m.id)?'✓':m.xp+' XP'}</em></button>`).join('');$$('[data-mission]').forEach(b=>b.onclick=()=>{const m=missions.find(x=>x.id===Number(b.dataset.mission));state.mission=m;setRoom(m.room);switchTab('experiment');$('#atomText').textContent=`ภารกิจ: ${m.brief} เลือกสารและปริมาณด้วยตัวเอง`;renderMissions()})}
renderMissions();

$$('.instrument button').forEach(b=>b.onclick=()=>{$$('.instrument button').forEach(x=>x.classList.toggle('active',x===b));$('#graph').classList.toggle('hidden',b.dataset.view!=='graph');$('#particle').classList.toggle('hidden',b.dataset.view!=='particle');telemetry()});
function renderNotes(){$('#notes').innerHTML=state.notebook.length?state.notebook.map((n,i)=>`<article><header><b>EXPERIMENT #${state.notebook.length-i}</b><time>${n.time}</time></header><h3>${n.a} + ${n.b}</h3><p><strong>Observation</strong>${n.observation}</p><p><strong>Equation</strong>${n.equation}</p><p><strong>Net ionic</strong>${n.net}</p><footer>pH ${n.pH.toFixed(2)} • ${n.temp.toFixed(1)} °C</footer></article>`).join(''):'<div class="empty">ยังไม่มีการทดลอง เริ่มค้นพบปฏิกิริยาแรกของคุณได้เลย</div>';updateHud()}
$('[data-panel=notebook]').onclick=()=>$('#notebook').classList.add('open');$('.drawer .close').onclick=()=>$('#notebook').classList.remove('open');$('#print').onclick=()=>print();$('#clearNotes').onclick=()=>{if(confirm('ล้างบันทึกการทดลองทั้งหมดหรือไม่?')){state.notebook=[];renderNotes()}};
function showIncident(){$('#incident').classList.remove('hidden');$('#skillSafe').textContent='55%';}
$('#emergency').onclick=()=>{$('#incident').classList.add('hidden');engine.closed=false;$('#closed').checked=false;engine.pressure=1;telemetry();$('#atomText').textContent='วิเคราะห์เหตุการณ์: เมื่อแก๊สเกิดในภาชนะปิด จำนวนโมลแก๊สและอุณหภูมิทำให้ความดันสูงขึ้น';toast('Emergency stop สำเร็จ — ปลดระบบและลดความดันแล้ว')};
$('#enter').onclick=()=>{$('#intro').classList.add('gone');setTimeout(()=>$('#intro').remove(),900)};
$('#homeBtn').onclick=()=>location.reload();
let sound=true;$('#soundBtn').onclick=()=>{sound=!sound;$('#soundBtn').textContent=sound?'🔊':'🔇'};
renderNotes();telemetry();
if('serviceWorker' in navigator && import.meta.env.PROD) addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
