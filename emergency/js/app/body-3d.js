/* 3D body model (Three.js): procedural body surface split into selectable zones, camera control and picking.

   Classic script (no module): shares the global scope with the other files in js/.
   Load order is defined in index.html. */

/* =========================================================
   3D BODY  — procedural, continuous surface split into zones
   ========================================================= */
let renderer, scene, camera, pivot, pickables=[], regionMat={}, hovered=null;
let rotY=0, rotX=0, tgtY=0, tgtX=0, look=.9, tgtLook=.9, dist=4.4, tgtDist=4.4, zoomMode='body';
const SKIN=0xd9dfe7, FEAT=0xb4bfcd, HOV=0xb5cbef, SEL=0x2a6fdb;
const FEATURES=new Set(['eyeL','eyeR','earL','earR','mouth']);
const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const se=(s,n)=>Math.sign(s)*Math.pow(Math.abs(s),2/n);   // superellipse

// smooth 1-D profile through keys [[x, v1, v2, ...]] (monotone-ish Hermite)
function prof(keys){
  const n=keys.length;
  return x=>{
    if(x<=keys[0][0]) return keys[0].slice(1);
    if(x>=keys[n-1][0]) return keys[n-1].slice(1);
    let i=0; while(x>keys[i+1][0]) i++;
    const k0=keys[Math.max(i-1,0)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(i+2,n-1)];
    const h=k2[0]-k1[0], t=(x-k1[0])/h, t2=t*t, t3=t2*t;
    return k1.slice(1).map((_,j)=>{
      const p1=k1[j+1],p2=k2[j+1];
      const m1=(k2[j+1]-k0[j+1])/(k2[0]-k0[0]||h), m2=(k3[j+1]-k1[j+1])/(k3[0]-k1[0]||h);
      return (2*t3-3*t2+1)*p1+(t3-2*t2+t)*h*m1+(-2*t3+3*t2)*p2+(t3-t2)*h*m2;
    });
  };
}

// build a smooth surface patch from fn(u,v) with analytic-ish normals (finite differences)
function surf(fn,center,u0,u1,v0,v1,nu,nv){
  const pos=[],nor=[],idx=[],e=1e-4;
  for(let i=0;i<=nu;i++){ const u=u0+(u1-u0)*i/nu;
    for(let j=0;j<=nv;j++){ const v=v0+(v1-v0)*j/nv;
      const P=fn(u,v), Pu=fn(u+e,v).sub(fn(u-e,v)), Pv=fn(u,v+e).sub(fn(u,v-e));
      const out=P.clone().sub(center(u,v));
      let N=new THREE.Vector3().crossVectors(Pv,Pu);
      if(N.lengthSq()<1e-16) N=out.clone();
      if(N.dot(out)<0) N.negate();
      N.normalize(); pos.push(P.x,P.y,P.z); nor.push(N.x,N.y,N.z);
    }}
  for(let i=0;i<nu;i++) for(let j=0;j<nv;j++){
    const a=i*(nv+1)+j,b=a+nv+1; idx.push(a,b,a+1,b,b+1,a+1);
  }
  // make triangle winding agree with the outward normals (front faces outside)
  const tri=Math.floor(idx.length/6/2)*6, ia=idx[tri]*3, ib=idx[tri+1]*3, ic=idx[tri+2]*3;
  const A=V3(pos[ia],pos[ia+1],pos[ia+2]), Bv=V3(pos[ib],pos[ib+1],pos[ib+2]), Cv=V3(pos[ic],pos[ic+1],pos[ic+2]);
  const gn=new THREE.Vector3().crossVectors(Bv.sub(A),Cv.sub(A));
  if(gn.dot(V3(nor[ia],nor[ia+1],nor[ia+2]))<0) for(let k=0;k<idx.length;k+=3){ const t=idx[k+1]; idx[k+1]=idx[k+2]; idx[k+2]=t; }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
  g.setIndex(idx); return g;
}

/* ---- torso: superellipse rings, front/back depth separate ---- */
const TORSO=prof([ //  y     half-width  front-depth  back-depth
  [0.77,.150,.085,.095],[0.81,.165,.095,.108],[0.86,.170,.098,.115],[0.93,.158,.098,.100],
  [1.00,.140,.094,.086],[1.06,.136,.094,.080],[1.14,.148,.100,.084],[1.22,.164,.112,.090],
  [1.30,.178,.122,.095],[1.36,.186,.124,.096],[1.42,.190,.108,.092],[1.46,.178,.088,.086],
  [1.49,.140,.068,.072],[1.52,.085,.052,.058],[1.55,.052,.045,.048]]);
function torsoFn(y,th){
  const [a,bf,bb]=TORSO(y), f=y<0.81?Math.max(.03,Math.sqrt(clamp((y-0.77)/0.04,0,1))):1;
  const s=Math.sin(th), c=Math.cos(th);
  return V3(a*f*se(s,2.0), y, (c>=0?bf:bb)*f*se(c,2.0));
}
/* ---- head ---- */
const HEAD=prof([ // y  half-width  z-front  z-back
  [1.572,.014,.070,.050],[1.59,.046,.087,.004],[1.61,.061,.092,-.045],[1.635,.067,.095,-.070],
  [1.66,.071,.099,-.085],[1.69,.076,.097,-.098],[1.72,.078,.094,-.104],[1.75,.077,.088,-.104],[1.81,.074,.080,-.100]]);
const HN=2.2;
function headFn(y,th){
  const [a,zf,zb]=HEAD(y), zc=(zf+zb)/2, b=(zf-zb)/2;
  const f=Math.max(.04,Math.sqrt(clamp((y-1.572)/0.012,0,1))*(y>1.735?Math.sqrt(Math.max(0,1-((y-1.735)/.075)**2)):1));
  return V3(a*f*se(Math.sin(th),HN), y, zc+b*f*se(Math.cos(th),HN));
}
const headCenter=(y)=>{ const [,zf,zb]=HEAD(y); return V3(0,y,(zf+zb)/2); };
/* ---- neck ---- */
function neckFn(y,th){ return V3(.054*Math.sin(th), y, -.008+.051*Math.cos(th)); }
/* ---- limbs along a curve ---- */
function limb(points,keys,ref,capA=true,capB=true){
  const curve=new THREE.CatmullRomCurve3(points.map(p=>V3(...p)),false,'centripetal'), R=prof(keys);
  const fn=(t,v)=>{
    t=clamp(t,0,1);
    const Cc=curve.getPointAt(t), T=curve.getTangentAt(t);
    const F=ref.clone().sub(T.clone().multiplyScalar(T.dot(ref))).normalize();
    const Sx=new THREE.Vector3().crossVectors(F,T).normalize();
    const [rx,rz]=R(t);
    const ec=Math.max(.04,(capA?Math.sqrt(clamp(t/.05,0,1)):1)*(capB?Math.sqrt(clamp((1-t)/.05,0,1)):1));
    return Cc.add(Sx.multiplyScalar(Math.sin(v)*rx*ec)).add(F.multiplyScalar(Math.cos(v)*rz*ec));
  };
  fn.center=(t)=>curve.getPointAt(clamp(t,0,1));
  return fn;
}

function mat(id){
  if(!regionMat[id]) regionMat[id]=new THREE.MeshStandardMaterial({color:FEATURES.has(id)?FEAT:SKIN,roughness:.72,metalness:0,emissive:0x000000,side:THREE.DoubleSide});
  return regionMat[id];
}
function addMesh(parent,id,geo){
  const m=new THREE.Mesh(geo,mat(id)); m.userData.region=id; parent.add(m); pickables.push(m); return m;
}

function buildBody(B){
  const PI=Math.PI, up=V3(0,1,0), fwd=V3(0,0,1);
  const tc=(y)=>V3(0,y,0);
  // torso zones (one continuous surface)
  const zone=(id,y0,y1,a,l)=>addMesh(B,id,surf(torsoFn,tc,y0,y1,a,a+l,Math.max(6,Math.round((y1-y0)*160)),Math.round(l/PI*40)));
  zone('pelvis',.77,.93,0,2*PI);
  zone('lowerAbd',.93,1.08,-PI/2,PI); zone('lowerBackL',.93,1.08,PI/2,PI/2); zone('lowerBackR',.93,1.08,PI,PI/2);
  zone('upperAbd',1.08,1.235,-PI/2,PI); zone('midBack',1.08,1.235,PI/2,PI);
  zone('chestL',1.235,1.55,0,PI/2); zone('chestR',1.235,1.55,-PI/2,PI/2); zone('upperBack',1.235,1.55,PI/2,PI);

  // zone outlines on the torso
  const lm=new THREE.LineBasicMaterial({color:0x0B3D91,transparent:true,opacity:.28});
  const lineOn=(pts)=>B.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),lm));
  const push=(y,th)=>{ const p=torsoFn(y,th); const o=V3(p.x,0,p.z).normalize().multiplyScalar(.0015); return p.add(o); };
  [.93,1.08,1.235].forEach(y=>lineOn(Array.from({length:121},(_,i)=>push(y,i/120*2*PI))));
  const vline=(th,y0,y1)=>lineOn(Array.from({length:40},(_,i)=>push(y0+(y1-y0)*i/39,th)));
  vline(PI/2,.93,1.46); vline(-PI/2,.93,1.46); vline(0,1.235,1.47); vline(PI,.93,1.08);

  // neck + head
  addMesh(B,'neck',surf(neckFn,(y)=>V3(0,y,-.008),1.50,1.66,0,2*PI,10,40));
  addMesh(B,'head',surf(headFn,(y)=>headCenter(y),1.572,1.81,0,2*PI,56,64));

  // face features placed on the head surface
  const onHead=(y,th)=>{ const e=1e-4, P=headFn(y,th);
    const N=new THREE.Vector3().crossVectors(headFn(y,th+e).sub(headFn(y,th-e)),headFn(y+e,th).sub(headFn(y-e,th)));
    if(N.dot(P.clone().sub(headCenter(y)))<0) N.negate(); return {P,N:N.normalize()}; };
  const thX=(y,x)=>{ const [a]=HEAD(y); return Math.asin(Math.sign(x)*Math.pow(Math.abs(x)/a,HN/2)); };
  const feature=(id,y,th,sc,out,geo)=>{
    const {P,N}=onHead(y,th); const m=addMesh(B,id,geo||new THREE.SphereGeometry(1,28,18));
    m.position.copy(P.add(N.clone().multiplyScalar(out)));
    m.quaternion.setFromRotationMatrix(new THREE.Matrix4().lookAt(N,V3(0,0,0),up));
    m.scale.set(...sc); return m; };
  feature('eyeL',1.700,thX(1.70,.031),[.0165,.0085,.006],.0005);
  feature('eyeR',1.700,thX(1.70,-.031),[.0165,.0085,.006],.0005);
  feature('earL',1.690,PI/2+.14,[.018,.029,.008],.004);
  feature('earR',1.690,-PI/2-.14,[.018,.029,.008],.004);
  feature('mouth',1.628,0,[.022,.0075,.006],.001);
  feature('head',1.668,0,[.007,.018,.011],.004);          // nose (part of head)

  // arms (A-pose) incl. hand + thumb
  [['armL',1],['armR',-1]].forEach(([id,s])=>{
    const sh=[s*.15,1.47,-.005], sh2=[s*.215,1.425,-.005], el=[s*.32,1.14,.0], wr=[s*.43,.895,.02];
    const arm=limb([sh,sh2,el,wr],[[0,.052,.058],[.07,.063,.063],[.18,.054,.056],[.32,.045,.047],[.47,.037,.040],[.55,.040,.042],[.65,.041,.040],[.85,.031,.028],[1,.026,.022]],fwd);
    addMesh(B,id,surf(arm,arm.center,0,1,0,2*PI,64,32));
    const d=V3(wr[0]-el[0],wr[1]-el[1],wr[2]-el[2]).normalize(), W=V3(...wr);
    const pt=k=>W.clone().add(d.clone().multiplyScalar(k)).toArray();
    const hand=limb([pt(-.01),pt(.09),pt(.175)],[[0,.020,.030],[.25,.020,.042],[.6,.017,.040],[.85,.013,.031],[1,.008,.02]],fwd);
    addMesh(B,id,surf(hand,hand.center,0,1,0,2*PI,24,24));
    const tdir=d.clone().add(V3(0,0,.9)).normalize();
    const thumb=addMesh(B,id,new THREE.CapsuleGeometry(.0105,.035,6,12));
    thumb.position.copy(W.clone().add(d.clone().multiplyScalar(.045)).add(V3(0,0,.028)).add(tdir.clone().multiplyScalar(.02)));
    thumb.quaternion.setFromUnitVectors(up,tdir);
  });

  // legs + feet
  [['legL',1],['legR',-1]].forEach(([id,s])=>{
    const leg=limb([[s*.088,.90,0],[s*.10,.68,.01],[s*.108,.47,.012],[s*.112,.27,-.005],[s*.115,.075,-.015]],
      [[0,.096,.102],[.12,.090,.094],[.3,.074,.076],[.47,.052,.054],[.53,.050,.055],[.62,.054,.062],[.72,.050,.056],[.85,.036,.040],[1,.030,.032]],fwd);
    addMesh(B,id,surf(leg,leg.center,0,1,0,2*PI,72,32));
    const foot=limb([[s*.116,.045,-.055],[s*.12,.035,.03],[s*.125,.026,.15]],[[0,.032,.035],[.15,.038,.040],[.5,.042,.030],[.8,.045,.020],[1,.035,.012]],up);
    addMesh(B,id,surf(foot,foot.center,0,1,0,2*PI,28,24));
  });
}

function init3D(){
  const canvas=$('#gl');
  if(!window.THREE){
    canvas.remove();
    $('#vp').insertAdjacentHTML('beforeend','<div class="fallback">'+Object.keys(REGIONS).map(id=>`<button class="opt" data-action="rm" data-v="${id}"><b>${REGIONS[id].label}</b></button>`).join('')+'</div>');
    return;
  }
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(27,1,.05,50);

  scene.add(new THREE.HemisphereLight(0xffffff,0x7d8899,.6));
  const key=new THREE.DirectionalLight(0xffffff,.7); key.position.set(2.5,3.5,4); scene.add(key);
  const fill=new THREE.DirectionalLight(0xe6efff,.25); fill.position.set(-3,1,2); scene.add(fill);
  const rim=new THREE.DirectionalLight(0x9cc8ff,.4); rim.position.set(0,2.5,-4); scene.add(rim);

  const ringM=new THREE.MeshBasicMaterial({color:0x0B3D91,transparent:true,opacity:.3,side:THREE.DoubleSide});
  const ring=new THREE.Mesh(new THREE.RingGeometry(.44,.447,96),ringM); ring.rotation.x=-Math.PI/2; scene.add(ring);
  const ring2=new THREE.Mesh(new THREE.RingGeometry(.58,.583,96),ringM.clone()); ring2.material.opacity=.12; ring2.rotation.x=-Math.PI/2; scene.add(ring2);
  const disc=new THREE.Mesh(new THREE.CircleGeometry(.44,64),new THREE.MeshBasicMaterial({color:0x0B3D91,transparent:true,opacity:.05})); disc.rotation.x=-Math.PI/2; scene.add(disc);

  pivot=new THREE.Group(); pivot.position.y=.9; scene.add(pivot);
  const body=new THREE.Group(); body.position.y=-.9; pivot.add(body);
  buildBody(body);

  bindPointer(canvas);
  new ResizeObserver(resize3D).observe($('#vp'));
  resize3D(); loop();
}

function paint3D(){
  if(!renderer) return;
  for(const id in regionMat){
    const m=regionMat[id], sel=S.regions.includes(id), hov=hovered===id;
    const bl=S.flow==='bleeding'; m.color.setHex(sel?(bl?0xE23A1E:SEL):hov?HOV:(FEATURES.has(id)?FEAT:SKIN));
    m.emissive.setHex(sel?(bl?0x5a1206:0x0b2f70):0x000000);
  }
}
let baseDist=4.4;
function resize3D(){
  if(!renderer) return;
  const r=$('#vp').getBoundingClientRect(); if(!r.width) return;
  renderer.setSize(r.width,r.height,false); camera.aspect=r.width/r.height;
  baseDist = camera.aspect<.75 ? 4.4*.75/camera.aspect : 4.4;
  setZoom(zoomMode,true);
  camera.updateProjectionMatrix();
}
function setView(v){
  const base=v==='back'?Math.PI:0, k=Math.round((tgtY-base)/(2*Math.PI));
  tgtY=base+k*2*Math.PI; tgtX=0;
}
function setZoom(v,keep){
  zoomMode=v;
  if(v==='head'){ tgtLook=1.69; tgtDist=1.0; } else { tgtLook=.9; tgtDist=baseDist; }
  $$('#zoom button').forEach(b=>b.classList.toggle('on',b.dataset.v===v));
}
function loop(){
  rotY+=(tgtY-rotY)*.12; rotX+=(tgtX-rotX)*.12; look+=(tgtLook-look)*.12; dist+=(tgtDist-dist)*.12;
  pivot.rotation.y=rotY; pivot.rotation.x=rotX;
  camera.position.set(0,look+.02*dist,dist); camera.lookAt(0,look,0);
  const front=Math.cos(rotY)>=0;
  $('#facing').textContent='VIEW · '+(front?'FRONT':'BACK');
  $$('#view button').forEach(b=>b.classList.toggle('on',(b.dataset.v==='front')===front));
  renderer.render(scene,camera);
  requestAnimationFrame(loop);
}
function pick(e){
  const r=e.target.getBoundingClientRect();
  const v=new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
  const rc=new THREE.Raycaster(); rc.setFromCamera(v,camera);
  const hit=rc.intersectObjects(pickables,false)[0];
  return hit?hit.object.userData.region:null;
}
function bindPointer(c){
  let down=null, moved=0;
  const hov=$('#hover');
  const label=id=>REGIONS[id].label+(S.regions.includes(id)?'  ✓':'');
  c.addEventListener('pointerdown',e=>{ down={x:e.clientX,y:e.clientY}; moved=0; c.setPointerCapture(e.pointerId); });
  c.addEventListener('pointermove',e=>{
    if(down){
      const dx=e.clientX-down.x, dy=e.clientY-down.y; moved+=Math.abs(dx)+Math.abs(dy);
      if(moved>4){ c.classList.add('drag'); tgtY+=dx*.012; tgtX=clamp(tgtX+dy*.006,-.35,.35); hov.style.opacity=0; }
      down={x:e.clientX,y:e.clientY}; return;
    }
    if(e.pointerType!=='mouse') return;
    const id=pick(e);
    if(id!==hovered){ hovered=id; paint3D(); }
    const vr=$('#vp').getBoundingClientRect();
    hov.style.opacity=id?1:0;
    if(id){ hov.textContent=label(id); hov.style.left=(e.clientX-vr.left+14)+'px'; hov.style.top=(e.clientY-vr.top+14)+'px'; }
  });
  c.addEventListener('pointerup',e=>{
    c.classList.remove('drag');
    if(down && moved<=4){ const id=pick(e); if(id){ toggleRegion(id); hov.textContent=label(id); } }
    down=null;
  });
  c.addEventListener('pointerleave',()=>{ if(!down){ hovered=null; paint3D(); hov.style.opacity=0; } });
  c.addEventListener('wheel',e=>{ e.preventDefault(); setZoom(e.deltaY<0?'head':'body'); },{passive:false});
}
