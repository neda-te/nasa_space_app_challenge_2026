/* Live vitals strip of the assessment screen.

   SIMULATED DATA: the values are a fixed baseline per scenario plus random jitter (Math.random).
   No sensor is connected. A real feed would replace startVitals() and call vitHtml() with
   measured values (see docs/data-ingestion.md).

   Classic script (no module): shares the global scope with the other files in js/.
   Load order is defined in index.html. */

/* live vitals strip */
let vitTimer=null;
function vitHtml(v){
  const cls=(k,x)=>{ if(k==='hr') return x<=0||x<45||x>125?'crit':x>100||x<55?'warn':''; if(k==='spo2') return x<90?'crit':x<94?'warn':''; if(k==='sys') return x<=0||x<90?'crit':x<100||x>140?'warn':''; if(k==='rr') return x<8||x>26?'crit':x>20||x<11?'warn':''; return x>=39||x<35?'crit':x>=38?'warn':''; };
  const box=(k,l,val,u)=>`<div class="v ${cls(k,v[k])}"><span>${l}</span><b>${val}<u>${u}</u></b></div>`;
  return `<div class="lv">LIVE<br>VITALS</div>`+box('hr','Heart rate',v.hr>0?v.hr:'—','bpm')+box('spo2','SpO₂',v.spo2,'%')+box('sys','Blood pressure',v.sys>0?v.sys+'/'+v.dia:'—','')+box('rr','Breathing',v.rr,'/min')+box('temp','Temp.',v.temp.toFixed(1),'°C');
}
function startVitals(base){
  stopVitals();
  const j=(x,d)=>x>0?x+Math.round((Math.random()*2-1)*d):x;
  const tick=()=>{ $('#vit').innerHTML=vitHtml({hr:j(base.hr,2),spo2:Math.min(100,j(base.spo2,1)),sys:j(base.sys,2),dia:base.dia,rr:j(base.rr,1),temp:base.temp}); };
  tick(); vitTimer=setInterval(tick,1600);
}
function stopVitals(){ if(vitTimer){ clearInterval(vitTimer); vitTimer=null; } }
