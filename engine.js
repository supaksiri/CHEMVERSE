import { getExperiment } from './experiments.js';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const round=(v,n=4)=>Number(v.toFixed(n));

// One state drives instruments, macro evidence, graphs and representative particles.
export class ScientificEngine {
  constructor(id='titration'){this.select(id)}
  select(id){
    this.experiment=getExperiment(id);this.temperature=25;this.pressure=1;this.time=0;this.added=0;this.closed=false;
    this.calibrated=false;this.rinsed=false;this.blank=false;this.filtered=false;this.dried=false;this.history=[];this.warning='';
    this.state={pH:7,gasVolume:0,precipitateMass:0,absorbance:0,rate:0,progress:0,species:{}};
    this.calculate(true);return this.snapshot();
  }
  technique(action){this[action]=true;return this.snapshot()}
  add(amount){this.added=round(this.added+Number(amount),3);this.time=round(this.time+.35,2);this.calculate();return this.snapshot()}
  setTemperature(v){this.temperature=clamp(Number(v),5,80);this.calculate();return this.snapshot()}
  advance(seconds=2){this.time+=Number(seconds);this.calculate();return this.snapshot()}
  calculate(initial=false){
    const id=this.experiment.id;if(id==='titration')this.calcTitration();
    if(id==='precipitation')this.calcPrecipitation();
    if(id==='gas')this.calcGas();
    if(id==='kinetics')this.calcKinetics();
    if(id==='equilibrium')this.calcEquilibrium();
    if(!initial)this.pushHistory();else this.history=[this.point()];
  }
  calcTitration(){
    const acid=.025*.1,base=this.added/1000*.1,total=.025+this.added/1000,diff=acid-base;
    this.state.pH=Math.abs(diff)<1e-12?7:diff>0?-Math.log10(diff/total):14+Math.log10((-diff)/total);
    this.state.pH=clamp(this.state.pH,0,14);this.state.progress=clamp(this.added/25,0,1.25);
    this.state.species={'H⁺':Math.max(diff,0)*1000,'OH⁻':Math.max(-diff,0)*1000,'Na⁺':base*1000,'Cl⁻':acid*1000,'H₂O':Math.min(acid,base)*1000};
    this.state.rate=0;this.state.color=this.state.pH>8.2?'#f16bb4':'#9eeeff';
    this.warning=this.added>25.3?'เติมเกินจุดสมมูล — endpoint exceeded':'';
  }
  calcPrecipitation(){
    const ag=.020*.1,cl=this.added/1000*.1,formed=Math.min(ag,cl),total=.020+this.added/1000;
    this.state.pH=7;this.state.precipitateMass=formed*143.321;this.state.progress=cl/ag;
    this.state.species={'Ag⁺':Math.max(ag-cl,0)*1000,'Cl⁻':Math.max(cl-ag,0)*1000,'AgCl(s)':formed*1000,'Na⁺':cl*1000,'NO₃⁻':ag*1000};
    this.state.color='#eaf8ff';this.state.rate=0;
    this.warning=this.filtered&&!this.dried?'ตะกอนยังเปียก มวลที่ชั่งจะสูงกว่าค่าจริง':'';
  }
  calcGas(){
    const zn=.13/65.38,maxH2=zn,acid=this.added/1000*1/2,finalMol=Math.min(maxH2,acid);
    const fraction=1-Math.exp(-this.time/12),mol=finalMol*fraction,R=.082057,T=this.temperature+273.15;
    this.state.gasVolume=mol*R*T*1000;this.state.pressure=this.closed?1+mol*R*T/.25:1;
    this.state.progress=finalMol?mol/finalMol:0;this.state.pH=this.added?clamp(-Math.log10(Math.max((this.added/1000-2*mol)/(this.added/1000+.01),1e-7)),0,7):7;
    this.state.species={'Zn(s)':Math.max(maxH2-mol,0)*1000,'H⁺':Math.max(this.added-mol*2000,0),'Zn²⁺':mol*1000,'H₂(g)':mol*1000};
    this.state.rate=finalMol/12*Math.exp(-this.time/12)*1000;this.state.color='#bdeeff';
    this.warning=this.closed&&this.state.pressure>2?'ความดันสูง: เปิดทางระบายแก๊สทันที':'';
  }
  calcKinetics(){
    const n0=.020,k=.018*Math.exp((this.temperature-25)*.055)*(this.added>0?4.5:1),left=n0*Math.exp(-k*this.time),o2=(n0-left)/2;
    this.state.gasVolume=o2*.082057*(this.temperature+273.15)*1000;this.state.progress=(n0-left)/n0;this.state.pH=6;
    this.state.species={'H₂O₂':left*1000,'H₂O':(n0-left)*1000,'O₂(g)':o2*1000,'I⁻ catalyst':this.added*.1};
    this.state.rate=k*left*1000;this.state.color='#d7f7ff';
  }
  calcEquilibrium(){
    const fe0=.010*.001,scn0=this.added/1000*.001,total=.010+this.added/1000,K=138;
    // Solve K = x / ((Fe-x)(SCN-x)) in concentration units by bisection.
    let lo=0,hi=Math.min(fe0,scn0)*.999999;
    for(let i=0;i<70;i++){const x=(lo+hi)/2,fe=(fe0-x)/total,scn=(scn0-x)/total,q=x/total/(Math.max(fe*scn,1e-18));if(q>K)hi=x;else lo=x}
    const x=(lo+hi)/2,fe=(fe0-x)/total,scn=(scn0-x)/total,complex=x/total;
    this.state.species={'Fe³⁺':fe*1000,'SCN⁻':scn*1000,'FeSCN²⁺':complex*1000};this.state.absorbance=4700*complex;
    const red=Math.round(90+150*clamp(this.state.absorbance,0,1));this.state.progress=scn0?x/Math.min(fe0,scn0):0;this.state.pH=3;this.state.color=`#${red.toString(16).padStart(2,'0')}142d`;
    this.state.rate=0;
  }
  point(){return {x:this.experiment.id==='titration'||this.experiment.id==='precipitation'||this.experiment.id==='equilibrium'?this.added:this.time,...structuredClone(this.state)}}
  pushHistory(){const p=this.point(),last=this.history.at(-1);if(!last||last.x!==p.x||JSON.stringify(last.species)!==JSON.stringify(p.species))this.history.push(p);if(this.history.length>180)this.history.shift()}
  observation(){
    const id=this.experiment.id,s=this.state;if(id==='titration')return this.added?`เติม NaOH ${this.added.toFixed(2)} mL ค่า pH = ${s.pH.toFixed(2)}`:'สารละลายกรดใส ไม่มีสี';
    if(id==='precipitation')return this.added?`เกิดตะกอน AgCl สีขาว ${s.precipitateMass.toFixed(3)} g (ค่าทฤษฎี)`:'สารละลาย AgNO₃ ใส ไม่มีสี';
    if(id==='gas')return this.added?`Zn ละลายและเกิดฟอง H₂ สะสม ${s.gasVolume.toFixed(1)} mL`:'สังกะสีอยู่ก้นภาชนะ ยังไม่เกิดแก๊ส';
    if(id==='kinetics')return this.added?`เกิด O₂ อัตราขณะนี้ ${s.rate.toFixed(3)} mmol/s`:'H₂O₂ สลายตัวช้าเมื่อยังไม่มีตัวเร่ง';
    return this.added?`สารละลายแดงขึ้น Absorbance = ${s.absorbance.toFixed(3)}`:'สารละลาย Fe³⁺ สีเหลืองอ่อน';
  }
  snapshot(){return {experiment:this.experiment,temperature:this.temperature,pressure:this.state.pressure||this.pressure,time:this.time,added:this.added,calibrated:this.calibrated,rinsed:this.rinsed,blank:this.blank,filtered:this.filtered,dried:this.dried,warning:this.warning,observation:this.observation(),history:this.history.map(x=>structuredClone(x)),...structuredClone(this.state)}}
}

// Backward-compatible export for classroom extensions.
export { ScientificEngine as ChemistryEngine };
