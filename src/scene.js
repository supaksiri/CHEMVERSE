import * as THREE from 'three';

const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const mixHex=(a,b,t)=>{
  const ca=new THREE.Color(a),cb=new THREE.Color(b);return ca.lerp(cb,t).getHex();
};

export class LabScene {
  constructor(host){
    this.host=host;this.quality='balanced';this.clock=new THREE.Clock();this.particles=[];this.pourJob=null;this.totalVolume=0;this.chemColors=[0x73dbff,0xe8ffff];
    this.scene=new THREE.Scene();this.scene.background=new THREE.Color(0x030c18);this.scene.fog=new THREE.FogExp2(0x041020,.03);
    this.camera=new THREE.PerspectiveCamera(40,host.clientWidth/host.clientHeight,.1,100);this.camera.position.set(0,3.8,9.6);this.camera.lookAt(0,.4,0);
    this.renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));this.renderer.setSize(host.clientWidth,host.clientHeight);this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;host.appendChild(this.renderer.domElement);
    this.build();this.bindInteraction();this.animate();
    this.resize=()=>{if(!host.clientWidth)return;this.camera.aspect=host.clientWidth/host.clientHeight;this.camera.updateProjectionMatrix();this.renderer.setSize(host.clientWidth,host.clientHeight)};addEventListener('resize',this.resize);
  }
  build(){
    this.scene.add(new THREE.HemisphereLight(0x8ce7ff,0x050913,2.1));
    const key=new THREE.SpotLight(0x83efff,90,30,.5,.48);key.position.set(-4,8,6);key.castShadow=true;this.scene.add(key);
    const rimLight=new THREE.PointLight(0xa65cff,45,16);rimLight.position.set(4,3,-2);this.scene.add(rimLight);
    const warm=new THREE.PointLight(0xffa84b,18,9);warm.position.set(0,1,4);this.scene.add(warm);
    const floor=new THREE.Mesh(new THREE.CylinderGeometry(6,6,.26,64),new THREE.MeshStandardMaterial({color:0x071a2c,metalness:.75,roughness:.25}));floor.position.y=-1.42;floor.receiveShadow=true;this.scene.add(floor);
    for(let r of [3.4,4.7]){const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.025,8,120),new THREE.MeshBasicMaterial({color:r<4?0x31e7ff:0x6f45d7,transparent:true,opacity:.55}));ring.rotation.x=Math.PI/2;ring.position.y=-1.27;this.scene.add(ring)}
    this.group=new THREE.Group();this.scene.add(this.group);
    const table=new THREE.Mesh(new THREE.BoxGeometry(7,.34,3.5),new THREE.MeshStandardMaterial({color:0x102b3e,metalness:.55,roughness:.23}));table.position.y=-.95;table.castShadow=true;table.receiveShadow=true;this.group.add(table);
    this.glass=new THREE.MeshPhysicalMaterial({color:0xbbeeff,transparent:true,opacity:.28,roughness:.04,metalness:0,transmission:.62,side:THREE.DoubleSide,depthWrite:false});
    this.beaker=new THREE.Group();this.group.add(this.beaker);
    const wall=new THREE.Mesh(new THREE.CylinderGeometry(1.28,1.08,2.5,64,1,true),this.glass);wall.position.y=.38;wall.castShadow=true;this.beaker.add(wall);
    const base=new THREE.Mesh(new THREE.CylinderGeometry(1.08,1.08,.08,64),this.glass);base.position.y=-.88;this.beaker.add(base);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(1.28,.035,10,80),new THREE.MeshBasicMaterial({color:0xd5f8ff}));rim.rotation.x=Math.PI/2;rim.position.y=1.64;this.beaker.add(rim);
    this.liquid=new THREE.Mesh(new THREE.CylinderGeometry(1.08,1.03,1,64),new THREE.MeshPhysicalMaterial({color:0x5dccff,transparent:true,opacity:.78,roughness:.08,transmission:.17,metalness:.03}));this.liquid.position.y=-.81;this.liquid.scale.y=.08;this.beaker.add(this.liquid);
    this.surface=new THREE.Mesh(new THREE.CircleGeometry(1.07,64),new THREE.MeshPhysicalMaterial({color:0xa6f3ff,transparent:true,opacity:.7,roughness:.05}));this.surface.rotation.x=-Math.PI/2;this.surface.position.y=-.76;this.beaker.add(this.surface);
    this.effectGroup=new THREE.Group();this.beaker.add(this.effectGroup);
    this.bottles=[this.makeBottle(-2.65,0x53cfff,'A'),this.makeBottle(2.65,0xf3faff,'B')];
    this.stirrer=new THREE.Group();const rod=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,2.9,12),new THREE.MeshPhysicalMaterial({color:0xd7f5ff,transparent:true,opacity:.7,transmission:.5}));rod.rotation.z=-.16;this.stirrer.add(rod);this.stirrer.position.set(1.8,.45,.2);this.group.add(this.stirrer);
    const hotplate=new THREE.Mesh(new THREE.BoxGeometry(2.9,.22,2.3),new THREE.MeshStandardMaterial({color:0x172736,metalness:.75,roughness:.25}));hotplate.position.set(0,-.69,0);this.group.add(hotplate);
    this.heatRing=new THREE.Mesh(new THREE.TorusGeometry(.95,.07,12,64),new THREE.MeshBasicMaterial({color:0xff582e,transparent:true,opacity:0}));this.heatRing.rotation.x=Math.PI/2;this.heatRing.position.set(0,-.55,0);this.group.add(this.heatRing);
    this.stream=new THREE.Mesh(new THREE.CylinderGeometry(.045,.075,2.4,16),new THREE.MeshPhysicalMaterial({color:0x64dfff,transparent:true,opacity:.8,roughness:.1}));this.stream.visible=false;this.group.add(this.stream);
    this.equipmentRig=new THREE.Group();this.group.add(this.equipmentRig);this.buildScientificEquipment();
    this.labelCanvas=document.createElement('canvas');
  }
  buildScientificEquipment(){
    const metal=new THREE.MeshStandardMaterial({color:0x8ca5b3,metalness:.85,roughness:.2}),dark=new THREE.MeshStandardMaterial({color:0x172a36,metalness:.65,roughness:.3});
    this.buretteRig=new THREE.Group();const stand=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,4.5,12),metal);stand.position.set(-1.8,1.1,-.7);this.buretteRig.add(stand);const tube=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,3.5,18),this.glass.clone());tube.position.set(-.75,1.65,0);this.buretteRig.add(tube);const tip=new THREE.Mesh(new THREE.CylinderGeometry(.018,.045,.7,10),this.glass.clone());tip.position.set(-.75,-.45,0);this.buretteRig.add(tip);const tap=new THREE.Mesh(new THREE.BoxGeometry(.45,.07,.07),dark);tap.position.set(-.75,-.15,0);this.buretteRig.add(tap);this.equipmentRig.add(this.buretteRig);
    this.gasRig=new THREE.Group();const bath=new THREE.Mesh(new THREE.BoxGeometry(2.4,.75,1.5),new THREE.MeshPhysicalMaterial({color:0x42bdea,transparent:true,opacity:.35}));bath.position.set(2.1,-.35,-.2);this.gasRig.add(bath);const collector=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,2.2,30,1,true),this.glass.clone());collector.position.set(2.1,.9,-.2);this.gasRig.add(collector);const gasFill=new THREE.Mesh(new THREE.CylinderGeometry(.37,.37,.1,24),new THREE.MeshPhysicalMaterial({color:0xc9f7ff,transparent:true,opacity:.23}));gasFill.position.set(2.1,0,-.2);this.gasRig.add(gasFill);this.gasFill=gasFill;this.equipmentRig.add(this.gasRig);
    this.filterRig=new THREE.Group();const cone=new THREE.Mesh(new THREE.ConeGeometry(.65,1.25,32,1,true),this.glass.clone());cone.rotation.x=Math.PI;cone.position.set(2.15,.85,-.15);this.filterRig.add(cone);const neck=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,.8,12),this.glass.clone());neck.position.set(2.15,-.15,-.15);this.filterRig.add(neck);this.equipmentRig.add(this.filterRig);
    this.cuvetteRig=new THREE.Group();const machine=new THREE.Mesh(new THREE.BoxGeometry(1.65,1.25,1.45),dark);machine.position.set(2.1,.05,-.1);this.cuvetteRig.add(machine);const slot=new THREE.Mesh(new THREE.BoxGeometry(.45,.75,.4),new THREE.MeshStandardMaterial({color:0x4c0b24,emissive:0x42001a,emissiveIntensity:.7}));slot.position.set(2.1,.72,-.1);this.cuvetteRig.add(slot);this.colorimeterSlot=slot;this.equipmentRig.add(this.cuvetteRig);
  }
  makeBottle(x,color,label){
    const g=new THREE.Group();g.position.set(x,.05,.15);g.userData.home=g.position.clone();g.userData.label=label;
    const body=new THREE.Mesh(new THREE.CylinderGeometry(.57,.66,1.75,36),this.glass.clone());body.position.y=.08;body.userData.bottle=label;g.add(body);
    const shoulder=new THREE.Mesh(new THREE.CylinderGeometry(.3,.56,.42,36),this.glass.clone());shoulder.position.y=1.12;shoulder.userData.bottle=label;g.add(shoulder);
    const neck=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,.6,30),this.glass.clone());neck.position.y=1.62;neck.userData.bottle=label;g.add(neck);
    const cap=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,.18,24),new THREE.MeshStandardMaterial({color:label==='A'?0x31b9e5:0xb36cff,metalness:.3,roughness:.35}));cap.position.y=1.98;cap.userData.bottle=label;g.add(cap);
    const liquid=new THREE.Mesh(new THREE.CylinderGeometry(.51,.59,1.25,36),new THREE.MeshPhysicalMaterial({color,transparent:true,opacity:.72,roughness:.1}));liquid.position.y=-.08;g.add(liquid);g.userData.liquid=liquid;
    const badge=new THREE.Mesh(new THREE.CircleGeometry(.26,32),new THREE.MeshBasicMaterial({color:label==='A'?0x36dfff:0xb978ff}));badge.position.set(0,.22,.615);badge.userData.bottle=label;g.add(badge);
    this.group.add(g);return g;
  }
  bindInteraction(){
    const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
    this.renderer.domElement.addEventListener('pointerdown',e=>{
      const rect=this.renderer.domElement.getBoundingClientRect();pointer.x=(e.clientX-rect.left)/rect.width*2-1;pointer.y=-(e.clientY-rect.top)/rect.height*2+1;ray.setFromCamera(pointer,this.camera);
      const hit=ray.intersectObjects(this.bottles,true)[0];if(!hit)return;const label=hit.object.userData.bottle;const index=label==='A'?0:1;this.bottles[index].scale.setScalar(1.07);this.onBottleSelect?.(index);setTimeout(()=>this.bottles[index].scale.setScalar(1),180);
    });
  }
  setExperiment(id){
    this.buretteRig.visible=id==='titration';this.gasRig.visible=id==='gas'||id==='kinetics';this.filterRig.visible=id==='precipitation';this.cuvetteRig.visible=id==='equilibrium';
    this.bottles[0].visible=id!=='titration';this.stirrer.visible=id==='precipitation'||id==='equilibrium';
  }
  updateScientificState(s){
    if(s.color)this.liquid.material.color.set(s.color);this.surface.material.color.copy(this.liquid.material.color);
    if(this.gasFill){const fill=Math.max(.08,Math.min(1.8,(s.gasVolume||0)/180));this.gasFill.scale.y=fill;this.gasFill.position.y=.05+fill*.45}
    if(this.colorimeterSlot&&s.color)this.colorimeterSlot.material.color.set(s.color);
  }
  setChemicals(a,b){this.chemColors=[a.color||0x7bdfff,b.color||0xe8ffff];this.bottles.forEach((g,i)=>g.userData.liquid.material.color.setHex(this.chemColors[i]));}
  resetMacro(){this.pourJob=null;this.totalVolume=0;this.clearParticles();this.stream.visible=false;this.liquid.scale.y=.08;this.liquid.position.y=-.81;this.surface.position.y=-.76;this.liquid.material.color.setHex(0x5dccff);this.bottles.forEach(g=>{g.position.copy(g.userData.home);g.rotation.set(0,0,0);g.userData.liquid.scale.y=1;g.userData.liquid.position.y=-.08});}
  pourChemical(index,volume,onDone){
    if(this.pourJob)return false;const bottle=this.bottles[index];this.pourJob={index,volume:Number(volume),start:performance.now(),duration:2200,from:bottle.position.clone(),onDone};return true;
  }
  dispense(volume,onDone){
    if(this.pourJob)return false;this.stream.visible=true;this.stream.position.set(-.75,.15,0);this.stream.scale.set(.45,.62,.45);const start=performance.now(),initial=this.totalVolume;
    const tick=()=>{const p=Math.min(1,(performance.now()-start)/900);this.setLevel(initial+Number(volume)*p);this.stream.material.opacity=.35+.45*Math.abs(Math.sin(p*Math.PI*8));if(p<1)requestAnimationFrame(tick);else{this.totalVolume+=Number(volume);this.stream.visible=false;this.stream.scale.set(1,1,1);this.stream.material.opacity=.8;onDone?.()}};tick();return true;
  }
  updatePour(now){
    const j=this.pourJob;if(!j)return;const p=Math.min(1,(now-j.start)/j.duration),b=this.bottles[j.index],dir=j.index===0?-1:1;
    if(p<.24){const q=ease(p/.24);b.position.lerpVectors(j.from,new THREE.Vector3(dir*.75,2.45,.05),q);b.rotation.z=dir*1.82*q;}
    else if(p<.72){const q=(p-.24)/.48;b.position.set(dir*.75,2.45+Math.sin(q*Math.PI)*.08,.05);b.rotation.z=dir*1.82;this.stream.visible=true;this.stream.material.color.setHex(this.chemColors[j.index]);this.stream.position.set(dir*.13,.92,.02);this.stream.rotation.z=dir*.08;b.userData.liquid.scale.y=Math.max(.05,1-q*.92);b.userData.liquid.position.y=-.08-.55*q;this.setLevel(this.totalVolume+j.volume*q);this.liquid.material.color.setHex(this.totalVolume?mixHex(this.liquid.material.color.getHex(),this.chemColors[j.index],.035):this.chemColors[j.index]);}
    else{this.stream.visible=false;const q=ease((p-.72)/.28);b.position.lerpVectors(new THREE.Vector3(dir*.75,2.45,.05),b.userData.home,q);b.rotation.z=dir*1.82*(1-q);}
    if(p>=1){this.totalVolume+=j.volume;b.position.copy(b.userData.home);b.rotation.set(0,0,0);const cb=j.onDone;this.pourJob=null;cb?.();}
  }
  setLevel(v){const height=Math.min(2.05,.06+v/52);this.liquid.scale.y=height;this.liquid.position.y=-.84+height/2;this.surface.position.y=-.83+height;this.surface.material.color.copy(this.liquid.material.color);}
  stir(onDone){
    const start=performance.now();const home=this.stirrer.position.clone();const tick=()=>{const p=Math.min(1,(performance.now()-start)/1700);this.stirrer.position.set(Math.sin(p*Math.PI*8)*.65,.48,Math.cos(p*Math.PI*8)*.25);this.liquid.scale.x=1+Math.sin(p*Math.PI*12)*.018;this.surface.rotation.z+=.18;if(p<1)requestAnimationFrame(tick);else{this.stirrer.position.copy(home);this.liquid.scale.x=1;onDone?.()}};tick();
  }
  react(result){
    this.clearParticles();const count=this.quality==='low'?36:this.quality==='cinematic'?150:82;if(result.color)this.liquid.material.color.setHex(result.color);this.surface.material.color.copy(this.liquid.material.color);
    if(result.type==='precipitate')for(let i=0;i<count;i++)this.makeParticle(result.color||0xffffff,'fall');
    if(result.type==='gas')for(let i=0;i<count;i++)this.makeParticle(0xc7f8ff,'bubble');
    if(result.type==='redox')for(let i=0;i<count*.7;i++)this.makeParticle(0xc56735,'metal');
    if(result.type==='equilibrium')for(let i=0;i<count*.45;i++)this.makeParticle(0xff2e63,'swirl');
    if(result.heat>0){this.heatRing.material.opacity=.8;setTimeout(()=>this.heatRing.material.opacity=.15,1800)}
  }
  makeParticle(color,kind){
    const bubble=kind==='bubble';const m=new THREE.Mesh(new THREE.SphereGeometry(bubble?.045:.032,8,8),new THREE.MeshPhysicalMaterial({color,transparent:true,opacity:bubble?.42:.86,roughness:.2,transmission:bubble?.55:0}));m.position.set((Math.random()-.5)*1.75,-.62+Math.random()*1.5,(Math.random()-.5)*1.4);m.userData={kind,speed:.18+Math.random()*.45,phase:Math.random()*6,radius:.25+Math.random()*.7};this.effectGroup.add(m);this.particles.push(m);
  }
  clearParticles(){this.particles=[];this.effectGroup.clear()}
  setQuality(q){this.quality=q;this.renderer.setPixelRatio(q==='low'?1:Math.min(devicePixelRatio,q==='cinematic'?2:1.5));this.resize()}
  heat(active=true){this.heatRing.material.opacity=active?.85:0}
  animate(){requestAnimationFrame(()=>this.animate());const t=this.clock.getElapsedTime(),now=performance.now();this.updatePour(now);this.surface.position.y+=Math.sin(t*3)*.0007;this.group.rotation.y=Math.sin(t*.13)*.018;for(const p of this.particles){const d=p.userData;if(d.kind==='bubble'){p.position.y+=d.speed*.012;p.scale.setScalar(1+(p.position.y+.6)*.12);if(p.position.y>this.surface.position.y)p.position.y=-.58;}else if(d.kind==='swirl'){p.position.x=Math.cos(t*2+d.phase)*d.radius;p.position.z=Math.sin(t*2+d.phase)*d.radius;p.position.y=-.3+Math.sin(t*3+d.phase)*.2;}else{p.position.y-=d.speed*.005;if(p.position.y<-.7)p.position.y=-.7;if(d.kind==='metal')p.position.x*=.998;}}this.renderer.render(this.scene,this.camera)}
}
