const palette=['#4de7ff','#ff70c5','#ffe36b','#9d7cff','#6ef0aa'];
const setup=canvas=>{const dpr=Math.min(devicePixelRatio||1,2),w=canvas.clientWidth||420,h=canvas.clientHeight||240;canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);return {c,w,h}};
const nice=v=>v>=100?v.toFixed(0):v>=10?v.toFixed(1):v.toFixed(2);

function graphValues(point,id){
  if(id==='titration')return [point.pH];
  if(id==='precipitation')return [point.species['Ag⁺']||0,point.species['Cl⁻']||0,point.species['AgCl(s)']||0];
  if(id==='gas')return [point.gasVolume||0];
  if(id==='kinetics')return [point.species['H₂O₂']||0,point.species['O₂(g)']||0];
  return [point.species['Fe³⁺']||0,point.species['SCN⁻']||0,point.species['FeSCN²⁺']||0];
}

export function drawScientificGraph(canvas,s){
  const {c,w,h}=setup(canvas),pad={l:48,r:15,t:28,b:46},pw=w-pad.l-pad.r,ph=h-pad.t-pad.b,points=s.history.length?s.history:[{x:0,...s}];
  const all=points.flatMap(p=>graphValues(p,s.experiment.id)),maxY=s.experiment.id==='titration'?14:Math.max(...all,1)*1.12,maxX=Math.max(...points.map(p=>p.x),s.experiment.id==='titration'?30:1);
  c.strokeStyle='rgba(102,225,255,.16)';c.fillStyle='#7599aa';c.font='10px system-ui';
  for(let i=0;i<=5;i++){const y=pad.t+ph*i/5;c.beginPath();c.moveTo(pad.l,y);c.lineTo(w-pad.r,y);c.stroke();c.fillText(nice(maxY*(1-i/5)),4,y+3)}
  for(let i=0;i<=5;i++){const x=pad.l+pw*i/5;c.beginPath();c.moveTo(x,pad.t);c.lineTo(x,h-pad.b);c.stroke();c.textAlign='center';c.fillText(nice(maxX*i/5),x,h-pad.b+15)}c.textAlign='left';
  const labels=s.experiment.graph.series;
  labels.forEach((label,k)=>{c.strokeStyle=palette[k];c.lineWidth=2.4;c.beginPath();points.forEach((p,i)=>{const x=pad.l+pw*(p.x/maxX),v=graphValues(p,s.experiment.id)[k]||0,y=pad.t+ph*(1-v/maxY);i?c.lineTo(x,y):c.moveTo(x,y)});c.stroke();c.fillStyle=palette[k];c.fillRect(pad.l+k*92,8,9,3);c.fillStyle='#c8e3ec';c.font='10px system-ui';c.fillText(label,pad.l+13+k*92,12)});
  c.fillStyle='#86a8b6';c.font='10px system-ui';c.textAlign='center';c.fillText(s.experiment.graph.x,pad.l+pw/2,h-6);c.save();c.translate(12,pad.t+ph/2);c.rotate(-Math.PI/2);c.fillText(s.experiment.graph.y,0,0);c.restore();c.textAlign='left';
}

export function drawScientificParticles(canvas,s){
  const {c,w,h}=setup(canvas),entries=Object.entries(s.species).filter(([,v])=>v>1e-8),total=Math.max(entries.reduce((a,[,v])=>a+v,0),1),maxDots=58;
  c.fillStyle='#071a27';c.fillRect(0,0,w,h);let index=0;
  entries.forEach(([label,value],kind)=>{let count=Math.max(1,Math.round(value/total*maxDots));for(let j=0;j<count;j++,index++){const solid=label.includes('(s)'),gas=label.includes('(g)'),x=solid?25+(index*43%(w-50)):24+(index*71%(w-48)),y=solid?h-28-(index%4)*7:gas?28+(index*37%(h-80)):38+(index*53%(h-92));c.beginPath();c.arc(x,y,solid?6:gas?8:9,0,Math.PI*2);c.fillStyle=palette[kind%palette.length]+(gas?'66':'dd');c.fill();if(!gas){c.fillStyle='#06121c';c.font='bold 7px system-ui';c.textAlign='center';c.fillText(label.replace(/\(.\)/,'').slice(0,6),x,y+2.5)}}});
  c.textAlign='left';c.fillStyle='#b9dbe6';c.font='10px system-ui';let lx=12;entries.slice(0,5).forEach(([label,value],i)=>{c.fillStyle=palette[i];c.fillRect(lx,10,7,7);c.fillStyle='#b9dbe6';const txt=`${label} ${nice(value)} mmol`;c.fillText(txt,lx+10,17);lx+=Math.min(105,c.measureText(txt).width+22)});
  c.fillStyle='#e6fbff';c.font='11px system-ui';c.fillText(s.experiment.net,12,h-8);
}

export const drawGraph=drawScientificGraph;
export const drawParticles=drawScientificParticles;
