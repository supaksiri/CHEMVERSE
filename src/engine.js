import { chemicals, reactions } from './data.js';

const samePair = (a,b,p) => p.includes(a) && p.includes(b);

export class ChemistryEngine {
  constructor(){ this.reset(); }
  reset(){ this.contents=[]; this.temperature=25; this.closed=false; this.pressure=1; this.pH=7; this.result=null; }
  add(id, volume=10, concentration=1){
    const chem=chemicals[id];
    this.contents.push({id,volume:Number(volume),concentration:Number(concentration),...chem});
    this.updatePH();
    return chem;
  }
  updatePH(){
    let acid=0,base=0,total=0;
    this.contents.forEach(c=>{ const mol=c.volume/1000*c.concentration; acid+=mol*(c.acid||0); base+=mol*(c.base||0); total+=c.volume/1000; });
    if(acid>base) this.pH=Math.max(0,-Math.log10((acid-base)/Math.max(total,.001)));
    else if(base>acid) this.pH=Math.min(14,14+Math.log10((base-acid)/Math.max(total,.001)));
    else this.pH=7;
    this.pH=Math.round(this.pH*100)/100;
  }
  mix(){
    if(this.contents.length<2) return {type:'incomplete',observation:'ต้องเติมสารอย่างน้อย 2 ชนิด'};
    const a=this.contents.at(-2).id,b=this.contents.at(-1).id;
    const reaction=reactions.find(r=>samePair(a,b,r.pair));
    if(!reaction){
      this.result={type:'none',observation:'ไม่พบการเปลี่ยนแปลงที่สังเกตได้ (No observable reaction)',equation:'NR',net:'ไอออนยังคงกระจายตัวอยู่ในสารละลาย',products:[]};
      return this.result;
    }
    this.temperature+=reaction.heat||0;
    if(reaction.gas){
      const scale=Math.min(...this.contents.slice(-2).map(c=>c.volume*c.concentration));
      this.pressure += this.closed ? Math.max(.3,scale/13) : 0.03;
    }
    this.result={...reaction,pH:this.pH,temperature:this.temperature,pressure:this.pressure};
    return this.result;
  }
  heat(delta=10){
    this.temperature=Math.min(180,this.temperature+delta);
    if(this.closed) this.pressure=Math.round((this.pressure*(this.temperature+273)/(this.temperature-delta+273))*100)/100;
    return {temperature:this.temperature,pressure:this.pressure,critical:this.pressure>3.2};
  }
  snapshot(){ return {contents:this.contents.map(({id,name,formula,volume,concentration})=>({id,name,formula,volume,concentration})),temperature:this.temperature,pH:this.pH,pressure:this.pressure,closed:this.closed,result:this.result}; }
}
