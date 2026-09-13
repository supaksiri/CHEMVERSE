import * as THREE from 'three';

export class LabScene {
  constructor(host){
    this.host=host; this.quality='balanced'; this.effect='idle'; this.clock=new THREE.Clock(); this.particles=[];
    this.scene=new THREE.Scene(); this.scene.background=new THREE.Color(0x041020); this.scene.fog=new THREE.FogExp2(0x041020,.035);
    this.camera=new THREE.PerspectiveCamera(42,host.clientWidth/host.clientHeight,.1,100); this.camera.position.set(0,3.4,8.4);
    this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'}); this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.7)); this.renderer.setSize(host.clientWidth,host.clientHeight); this.renderer.outputColorSpace=THREE.SRGBColorSpace; this.renderer.shadowMap.enabled=true; host.appendChild(this.renderer.domElement);
    this.build(); this.animate();
    this.resize=()=>{ if(!this.host.clientWidth)return; this.camera.aspect=this.host.clientWidth/this.host.clientHeight;this.camera.updateProjectionMatrix();this.renderer.setSize(this.host.clientWidth,this.host.clientHeight);};
    addEventListener('resize',this.resize);
    let down=false,lastX=0;
    this.renderer.domElement.addEventListener('pointerdown',e=>{down=true;lastX=e.clientX});
    addEventListener('pointerup',()=>down=false);
    addEventListener('pointermove',e=>{if(down){this.group.rotation.y+=(e.clientX-lastX)*.006;lastX=e.clientX}});
  }
  build(){
    const hemi=new THREE.HemisphereLight(0x85d9ff,0x07101c,2.3);this.scene.add(hemi);
    const key=new THREE.SpotLight(0x72e8ff,75,30,.5,.5);key.position.set(-4,7,5);key.castShadow=true;this.scene.add(key);
    const magenta=new THREE.PointLight(0xb24dff,32,15);magenta.position.set(4,3,-2);this.scene.add(magenta);
    const floor=new THREE.Mesh(new THREE.CylinderGeometry(5,5,.25,48),new THREE.MeshStandardMaterial({color:0x071c31,metalness:.65,roughness:.28}));floor.position.y=-1.3;floor.receiveShadow=true;this.scene.add(floor);
    const rings=new THREE.Mesh(new THREE.TorusGeometry(3.2,.035,8,100),new THREE.MeshBasicMaterial({color:0x2ce8ff}));rings.rotation.x=Math.PI/2;rings.position.y=-1.14;this.scene.add(rings);
    this.group=new THREE.Group();this.scene.add(this.group);
    const table=new THREE.Mesh(new THREE.BoxGeometry(6,.35,3),new THREE.MeshStandardMaterial({color:0x102a3d,metalness:.5,roughness:.25}));table.position.y=-.9;table.castShadow=true;this.group.add(table);
    const glass=new THREE.MeshPhysicalMaterial({color:0xaadfff,transparent:true,opacity:.28,roughness:.05,metalness:0,transmission:.55,side:THREE.DoubleSide});
    this.beaker=new THREE.Mesh(new THREE.CylinderGeometry(1.22,1.05,2.5,48,1,true),glass);this.beaker.position.y=.45;this.beaker.castShadow=true;this.group.add(this.beaker);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(1.22,.04,10,64),new THREE.MeshBasicMaterial({color:0xc7f6ff}));rim.rotation.x=Math.PI/2;rim.position.y=1.7;this.group.add(rim);
    this.liquid=new THREE.Mesh(new THREE.CylinderGeometry(1.03,1.0,1.35,48),new THREE.MeshPhysicalMaterial({color:0x5dccff,transparent:true,opacity:.72,roughness:.12,transmission:.2}));this.liquid.position.y=-.05;this.group.add(this.liquid);
    this.precipitate=new THREE.Group();this.group.add(this.precipitate);
    const standMat=new THREE.MeshStandardMaterial({color:0x8fa4b3,metalness:.9,roughness:.2});
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,3.3,12),standMat);pole.position.set(2.1,.4,.2);this.group.add(pole);
    const base=new THREE.Mesh(new THREE.BoxGeometry(1.3,.12,1.1),standMat);base.position.set(2.1,-.62,.2);this.group.add(base);
    this.burette=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,3.4,20),glass);this.burette.position.set(1.4,1.3,.2);this.group.add(this.burette);
    const screen=new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.2),new THREE.MeshBasicMaterial({color:0x082b40}));screen.position.set(-2.15,.45,-.46);screen.rotation.y=.22;this.group.add(screen);
    const grid=new THREE.GridHelper(1.8,9,0x41eaff,0x174b61);grid.rotation.x=Math.PI/2;grid.position.set(-2.14,.45,-.43);grid.rotation.z=.22;this.group.add(grid);
  }
  setLiquid(hex){ this.liquid.material.color.setHex(hex); }
  setLevel(v){this.liquid.scale.y=Math.min(1.45,.35+v/65);this.liquid.position.y=-.55+.45*this.liquid.scale.y;}
  react(result){
    this.effect=result.type;
    if(result.color) this.setLiquid(result.color);
    this.clearParticles();
    const count=this.quality==='low'?28:this.quality==='cinematic'?120:65;
    if(result.type==='precipitate') for(let i=0;i<count;i++) this.makeParticle(result.color||0xffffff,'fall');
    if(result.type==='gas') for(let i=0;i<count;i++) this.makeParticle(0xbff7ff,'bubble');
    if(result.type==='redox') for(let i=0;i<count/2;i++) this.makeParticle(0xb75b2a,'fall');
  }
  makeParticle(color,kind){
    const m=new THREE.Mesh(new THREE.SphereGeometry(kind==='bubble'?.035:.025,8,8),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.8}));
    m.position.set((Math.random()-.5)*1.65,-.55+Math.random()*1.4,(Math.random()-.5)*1.3);m.userData={kind,speed:.15+Math.random()*.35,phase:Math.random()*6};this.precipitate.add(m);this.particles.push(m);
  }
  clearParticles(){this.particles=[];this.precipitate.clear();}
  setQuality(q){this.quality=q;this.renderer.setPixelRatio(q==='low'?1:Math.min(devicePixelRatio,q==='cinematic'?2:1.5));this.resize();}
  animate(){
    requestAnimationFrame(()=>this.animate()); const t=this.clock.getElapsedTime(),dt=.016;
    this.liquid.rotation.y=t*.08; this.group.rotation.y+=((Math.sin(t*.15)*.035)-this.group.rotation.y)*.005;
    for(const p of this.particles){ if(p.userData.kind==='bubble'){p.position.y+=p.userData.speed*dt*4;p.position.x+=Math.sin(t*3+p.userData.phase)*.0018;if(p.position.y>1.2)p.position.y=-.55;} else {p.position.y-=p.userData.speed*dt;if(p.position.y<-.62)p.position.y=-.62;} }
    this.renderer.render(this.scene,this.camera);
  }
}
