export function drawGraph(canvas, snapshot){
  const dpr=Math.min(devicePixelRatio,2),w=canvas.clientWidth||360,h=canvas.clientHeight||180;canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);c.clearRect(0,0,w,h);
  c.strokeStyle='rgba(105,232,255,.16)';c.lineWidth=1;for(let x=36;x<w;x+=38){c.beginPath();c.moveTo(x,12);c.lineTo(x,h-26);c.stroke()}for(let y=16;y<h-25;y+=28){c.beginPath();c.moveTo(36,y);c.lineTo(w-8,y);c.stroke()}
  c.fillStyle='#8da9bb';c.font='11px system-ui';c.fillText('เวลา',w-38,h-8);c.save();c.translate(11,70);c.rotate(-Math.PI/2);c.fillText('ค่าที่วัด',0,0);c.restore();
  const colors=['#48e8ff','#ff6ec7','#ffe66d'];const labels=['สารตั้งต้น A','สารตั้งต้น B','ผลิตภัณฑ์'];
  labels.forEach((label,k)=>{c.strokeStyle=colors[k];c.lineWidth=2.5;c.beginPath();for(let i=0;i<=30;i++){const x=38+(w-52)*i/30;let y;if(k<2)y=28+(h-62)*(1-Math.exp(-i/9))*.67;else y=h-36-(h-68)*(1-Math.exp(-i/8));i?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();c.fillStyle=colors[k];c.fillRect(44+k*105,h-19,8,3);c.fillStyle='#bcd3df';c.font='10px system-ui';c.fillText(label,56+k*105,h-14)});
  c.fillStyle='#eaffff';c.font='600 12px system-ui';c.fillText(`pH ${snapshot.pH.toFixed(2)}  •  ${snapshot.temperature.toFixed(1)} °C  •  ${snapshot.pressure.toFixed(2)} atm`,42,18);
}

export function drawParticles(canvas, snapshot){
  const dpr=Math.min(devicePixelRatio,2),w=canvas.clientWidth||360,h=canvas.clientHeight||220;canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.scale(dpr,dpr);c.clearRect(0,0,w,h);
  const ions=snapshot.contents.flatMap(x=>x.id? (x.formula?[x.formula]:[]):[]);const palette=['#5ee7ff','#ff7ac8','#ffe173','#a78bfa'];
  for(let i=0;i<28;i++){const x=24+(i*73%Math.max(80,w-48)),y=34+(i*47%Math.max(100,h-70));c.beginPath();c.arc(x,y,10+(i%3),0,Math.PI*2);c.fillStyle=palette[i%palette.length]+'cc';c.fill();c.fillStyle='#041321';c.font='bold 8px system-ui';c.textAlign='center';c.fillText((ions[i%Math.max(1,ions.length)]||'H₂O').slice(0,4),x,y+3)}
  if(snapshot.result?.type==='precipitate'){c.fillStyle='rgba(220,246,255,.7)';for(let i=0;i<45;i++)c.fillRect((i*41)%w,h-18-(i%5)*3,4,4)}
  c.textAlign='left';c.fillStyle='#d8f8ff';c.font='12px system-ui';c.fillText(snapshot.result?.net||'เติมสารแล้วกดผสมเพื่อดูการเปลี่ยนแปลงระดับอนุภาค',14,h-8);
}
