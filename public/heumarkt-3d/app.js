import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {TransformControls} from 'three/addons/controls/TransformControls.js';

/* Heumarkt 3D — editable reconstruction of Heinzels Wintermärchen 2025.
   Camera/editor behavior retained from Office Atlas; geometry and labels are market-specific. */
const $ = id => document.getElementById(id);
const APP_MODE = new URLSearchParams(window.location.search).get('mode') || 'editor';
document.body.dataset.mode = APP_MODE;
const BASE = await fetch('./model-data.json').then(r => {
  if (!r.ok) throw Error(`HTTP ${r.status}`);
  return r.json();
}).catch(e => { $('loading').textContent = `Model unavailable: ${e.message}. Please start the local HTTP server.`; throw e; });
const W = BASE.meta.floorWidth, D = BASE.meta.floorDepth, H = BASE.meta.wallHeight;
const STORAGE_KEY = 'hidden-path-heumarkt-layout-v4';
const LEGACY_STORAGE_KEY = null; // v0.3 and v0.2 saves remain untouched; do not override corrected default geometry.
const clone = value => JSON.parse(JSON.stringify(value));
const clamp = (v,lo,hi) => Math.max(lo,Math.min(hi,v));
const round = v => Math.round(v*1000)/1000;
const kinds = {market:0xd5b98b,ice:0x8fc9df,plaza:0xb9a68a,other:0xc5d0d8};
const library = {
  stall:{label:'Markthütte',w:4,d:3,h:3.4}, lodge:{label:'Große Markthütte',w:9,d:6,h:5.8},
  kiosk:{label:'Kiosk / Service',w:4,d:3,h:3.2}, gate:{label:'Markttor',w:6.8,d:2.2,h:7.8},
  carousel:{label:'Kinderkarussell',w:8,d:8,h:6.5}, tree:{label:'Weihnachtsbaum',w:4,d:4,h:8},
  statue:{label:'Reiterdenkmal',w:9,d:7,h:8.8}, ice_lane:{label:'Eisfläche',w:20,d:7,h:.16},
  ice_ring:{label:'Eisring',w:20,d:18,h:.16}, bridge:{label:'Eisbahnbrücke',w:6,d:4,h:3},
  gondola:{label:'Gondel',w:3.6,d:2,h:2.4}, lightpole:{label:'Lichtmast',w:.4,d:.4,h:5.2},
  sign:{label:'Hinweisschild',w:2,d:.3,h:2.2},
  table:{label:'Tisch',w:1.8,d:.85,h:.75}, chair:{label:'Stuhl',w:.52,d:.55,h:1.12},
  sofa:{label:'Bank',w:1.8,d:.65,h:.75},
  plant:{label:'Pflanze',w:.55,d:.55,h:.92}, wall:{label:'Begrenzung',w:2.4,d:.10,h:H}
};
const mat = {
 floor:new THREE.MeshStandardMaterial({color:0x425047,roughness:1}), slab:new THREE.MeshStandardMaterial({color:0x27322d,roughness:.95}),
 walls:new THREE.MeshStandardMaterial({color:0xe4edf5,transparent:true,opacity:.82,depthWrite:true}),
 exterior:new THREE.MeshStandardMaterial({color:0xa8baca,roughness:.82}),
 wood:new THREE.MeshStandardMaterial({color:0xe4d8c6,roughness:.7}),white:new THREE.MeshStandardMaterial({color:0xf1f5f7,roughness:.84}),
 metal:new THREE.MeshStandardMaterial({color:0x73899c,metalness:.2,roughness:.55}),dark:new THREE.MeshStandardMaterial({color:0x415b73,roughness:.9}),
 chair:new THREE.MeshStandardMaterial({color:0x657d93,roughness:.9}),table:new THREE.MeshStandardMaterial({color:0xbdcbd6,roughness:.8}),
 screens:new THREE.MeshStandardMaterial({color:0x21364a,metalness:.15,roughness:.32}),plant:new THREE.MeshStandardMaterial({color:0x4a9d80,roughness:.9}),
 pot:new THREE.MeshStandardMaterial({color:0xb4c1c6,roughness:.9}),sofa:new THREE.MeshStandardMaterial({color:0x93b9bc,roughness:1}),
 stairs:new THREE.MeshStandardMaterial({color:0xc4d1dd,roughness:1}),accent:new THREE.MeshStandardMaterial({color:0x37698a,roughness:.58}),
 server:new THREE.MeshStandardMaterial({color:0x263444,metalness:.38,roughness:.46}),light:new THREE.MeshBasicMaterial({color:0x73ddba}),
 red:new THREE.MeshStandardMaterial({color:0x9b525d,roughness:.75}),
 ice:new THREE.MeshStandardMaterial({color:0x9fdff5,roughness:.28,metalness:.08,transparent:true,opacity:.92}),
 woodDark:new THREE.MeshStandardMaterial({color:0x3b261b,roughness:.86}),
 roof:new THREE.MeshStandardMaterial({color:0x20242b,roughness:.9}),
 festiveBlue:new THREE.MeshStandardMaterial({color:0x264f73,roughness:.75}),
 gold:new THREE.MeshStandardMaterial({color:0xd5a23f,metalness:.18,roughness:.5}),
 warm:new THREE.MeshBasicMaterial({color:0xffd978}),
 stone:new THREE.MeshStandardMaterial({color:0x777773,roughness:.95}),
 snow:new THREE.MeshStandardMaterial({color:0xf0f4f5,roughness:.95})
};
const panel=$('canvas'),scene=new THREE.Scene();scene.background=new THREE.Color(0x1f2824);
const camera=new THREE.PerspectiveCamera(48,1,.1,500);camera.position.set(W*.54,72,D*2.55);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;panel.appendChild(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);
controls.target.set(W/2,0,D/2);controls.minDistance=3;controls.maxDistance=185;controls.maxPolarAngle=Math.PI*.48;
controls.enableDamping=true;controls.dampingFactor=.085;
scene.add(new THREE.HemisphereLight(0xc7dcff,0x34291f,2.25));
const sun=new THREE.DirectionalLight(0xffffff,2.0);sun.position.set(W*.28,62,-32);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-90;sun.shadow.camera.right=90;sun.shadow.camera.top=90;sun.shadow.camera.bottom=-90;sun.shadow.normalBias=.035;scene.add(sun);
const wallGroup=new THREE.Group(),groundGroup=new THREE.Group(),staticGroup=new THREE.Group(),entityGroup=new THREE.Group(),gameOverlayGroup=new THREE.Group();
scene.add(wallGroup,groundGroup,staticGroup,entityGroup,gameOverlayGroup);
let clickable=[],selected=null,editMode=false,placement=null,outline=null,down=null,transformDragging=false,transformMode='translate';
const roomMeshes=new Map(),objectRoots=new Map(),roomLabels=[],ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
const choicePointMeshes=new Map();
const center=b=>[(b[0]+b[2])/2,(b[1]+b[3])/2];
function box(parent,x,y,z,w,h,d,material,selection=null){const mesh=new THREE.Mesh(new THREE.BoxGeometry(Math.max(.01,w),Math.max(.01,h),Math.max(.01,d)),material);
 mesh.position.set(x,y,z);mesh.castShadow=y>.2;mesh.receiveShadow=true;parent.add(mesh);if(selection){mesh.userData.selection=selection;clickable.push(mesh)}return mesh;}
function cylinder(parent,x,y,z,r,h,material,segments=16,selection=null){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,segments),material);
 mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);if(selection){mesh.userData.selection=selection;clickable.push(mesh)}return mesh;}
box(groundGroup,W/2,-.19,D/2,W+.65,.35,D+.65,mat.slab);
box(groundGroup,W/2,-.006,D/2,W,.06,D,mat.floor);
const grid=new THREE.GridHelper(150,75,0x415148,0x2d3a34);grid.position.set(W/2,-.39,D/2);scene.add(grid);
for(const room of BASE.rooms){const [x1,z1,x2,z2]=room.bounds,[x,z]=center(room.bounds),color=new THREE.Color(kinds[room.kind]||kinds.other);
 const material=new THREE.MeshStandardMaterial({color,transparent:true,opacity:.10,roughness:1,depthWrite:false});
 const floor=box(groundGroup,x,.041,z,Math.max(.05,x2-x1),.014,Math.max(.05,z2-z1),material,{type:'room',id:room.id});roomMeshes.set(room.id,floor);
 const border=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(x2-x1,.015,z2-z1)),new THREE.LineBasicMaterial({color,transparent:true,opacity:.24}));border.position.set(x,.054,z);groundGroup.add(border);
 const el=document.createElement('span');el.className='roomlabel';el.textContent=room.name;el.title=room.name;$('floatingLabels').appendChild(el);roomLabels.push({room,el,position:new THREE.Vector3(x,.15,z)});
}
// These 61 walls have exactly the same positions, height, thickness, rotation and materials
// as the ORIGINAL v0.1 viewer (four facade segments + 57 interior wall segments).
// Facade glazing is a child of its wall and disappears when that wall is deleted.
const defaultWallObjects = () => {
 const out=[];
 for(let i=0;i<BASE.walls.length;i++){
  const a=BASE.walls[i].a,b=BASE.walls[i].b,dx=b[0]-a[0],dz=b[1]-a[1];
  out.push({id:`boundary-${String(i+1).padStart(3,'0')}`,kind:'wall',roomId:'',
   position:[round((a[0]+b[0])/2),round((a[1]+b[1])/2)],rotation:round(-Math.atan2(dz,dx)),
   width:round(Math.hypot(dx,dz)),depth:.08,height:.45,elevation:0,exterior:false,glazing:false});
 }
 return out;
};
let wallEntities=defaultWallObjects();
const wallRoots=new Map();
const wallLookup=id=>wallEntities.find(w=>w.id===id);
const lookupAny=id=>lookup(id)||wallLookup(id);
function buildWall(e){
 const root=new THREE.Group();
 const mesh=box(root,0,e.height/2,0,e.width,e.height,e.depth,e.exterior?mat.exterior:mat.walls);
 if(e.glazing){
  // Original v0.1 glazing: north and south facades, 1.55 m glass strips every 2.1 m.
  const glass=new THREE.MeshStandardMaterial({color:0xa3c3da,transparent:true,opacity:.55,metalness:.18,roughness:.2,depthWrite:false});
  const span=Math.max(0,e.width-1);
  for(let x=2; x<span; x+=2.1){
   const pane=box(root,x-e.width/2,1.72,(e.position[1]<D/2?.025:-.025),1.55,.70,.03,glass);
   pane.castShadow=false;
  }
 }
 root.position.set(e.position[0],e.elevation||0,e.position[1]);root.rotation.y=e.rotation;
 root.userData.objectId=e.id;
 root.traverse(obj=>{if(obj.isMesh){obj.userData.selection={type:'wall',id:e.id};clickable.push(obj);}});
 wallGroup.add(root);wallRoots.set(e.id,root);return root;
}
function removeWall(id){const root=wallRoots.get(id);if(!root)return;
 const meshes=new Set();root.traverse(o=>{if(o.isMesh){meshes.add(o);o.geometry?.dispose();}});
 clickable=clickable.filter(o=>!meshes.has(o));wallGroup.remove(root);wallRoots.delete(id);
}
function rebuildWalls(){for(const id of [...wallRoots.keys()])removeWall(id);for(const wall of wallEntities)buildWall(wall);}
for(const r of BASE.rooms.filter(r=>r.kind==='stairs')){const [x1,z1,x2,z2]=r.bounds;for(let i=0;i<11;i++){const zz=z1+.35+i*(z2-z1-.7)/11;
 box(staticGroup,(x1+x2)/2,.11+i*.022,zz,(x2-x1)*.52,.07,(z2-z1-.6)/11,mat.stairs);}}
const tex=new THREE.TextureLoader().load(BASE.meta.mapImage);tex.colorSpace=THREE.SRGBColorSpace;
const overlay=new THREE.Mesh(new THREE.PlaneGeometry(W,D),new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:.62,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4}));
overlay.rotation.x=-Math.PI/2;overlay.position.set(W/2,.083,D/2);overlay.visible=false;scene.add(overlay);

function roomAt(x,z){const options=BASE.rooms.filter(r=>x>=r.bounds[0]&&x<=r.bounds[2]&&z>=r.bounds[1]&&z<=r.bounds[3]);
 options.sort((a,b)=>(a.bounds[2]-a.bounds[0])*(a.bounds[3]-a.bounds[1])-(b.bounds[2]-b.bounds[0])*(b.bounds[3]-b.bounds[1]));return options[0]?.id||'';}
function entity(kind,id,x,z,roomId='',w=null,d=null,h=null,rotation=0){const def=library[kind];return {id,kind,roomId:roomId||roomAt(x,z),position:[round(x),round(z)],rotation:round(rotation),width:w??def.w,depth:d??def.d,height:h??def.h,elevation:0};}
function defaultEntities(){ return []; }
function validateObjects(list){if(!Array.isArray(list)||list.length>5000)throw Error('Layout must contain an objects array of at most 5000 items.');
 const seen=new Set();return list.map((e,i)=>{if(!e||typeof e!=='object'||!library[e.kind])throw Error(`Unknown furniture kind at item ${i}.`);
 const id=String(e.id??'').trim();if(!id||id.length>70||seen.has(id))throw Error(`Missing or duplicate object ID: ${id}`);seen.add(id);
 if(!Array.isArray(e.position)||e.position.length!==2||!e.position.every(Number.isFinite))throw Error(`Invalid location for ${id}`);
 const nums=[e.width,e.depth,e.height,e.rotation];if(!nums.every(Number.isFinite))throw Error(`Invalid dimensions or rotation for ${id}`);
 const clean=entity(e.kind,id,clamp(e.position[0],0,W),clamp(e.position[1],0,D),String(e.roomId||''),clamp(e.width,.1,e.kind==='wall'?160:160),clamp(e.depth,e.kind==='wall'?.03:.1,e.kind==='wall'?2:80),clamp(e.height,.1,H),e.rotation);
 clean.elevation=Number.isFinite(e.elevation)?clamp(e.elevation,0,H):0;
 if(e.label)clean.label=String(e.label).slice(0,120);
 if(Number.isFinite(e.innerRatio))clean.innerRatio=clamp(e.innerRatio,.2,.85);
 if(e.twoStorey)clean.twoStorey=true;
 if(e.kind==='wall'){clean.exterior=Boolean(e.exterior);clean.glazing=Boolean(e.glazing);}return clean;
 });}
let entities=Array.isArray(BASE.objects)?validateObjects(BASE.objects):defaultEntities();
// Preserve old 0.2 furniture edits if present, but never import its construction as walls.
try{
 const raw=localStorage.getItem(STORAGE_KEY); // New layout revision has its own saved state.
 if(raw){const layout=JSON.parse(raw);if(Array.isArray(layout.objects))entities=validateObjects(layout.objects);
  if(Array.isArray(layout.wallObjects)){const importedWalls=validateObjects(layout.wallObjects);
   if(importedWalls.some(w=>w.kind!=='wall'))throw Error('Saved wallObjects contain furniture.');
   wallEntities=importedWalls;}}
}catch(e){console.warn('Saved layout could not be loaded:',e);}
rebuildWalls();
const lookup=id=>entities.find(e=>e.id===id);
function addCube(root,x,y,z,w,h,d,material){return box(root,x,y,z,w,h,d,material);}
const labelTextureCache=new Map();
function makeLabelMaterial(text){
 const key=text||'';if(labelTextureCache.has(key))return labelTextureCache.get(key);
 const c=document.createElement('canvas');c.width=768;c.height=128;const ctx=c.getContext('2d');
 ctx.fillStyle='#2a1b14';ctx.fillRect(0,0,c.width,c.height);ctx.strokeStyle='#d7ad62';ctx.lineWidth=8;ctx.strokeRect(5,5,c.width-10,c.height-10);
 ctx.fillStyle='#f5e4bf';ctx.font='700 42px system-ui, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
 const t=String(text||'').length>28?String(text).slice(0,27)+'…':String(text||'');ctx.fillText(t,c.width/2,c.height/2);
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const m=new THREE.MeshBasicMaterial({map:tex});labelTextureCache.set(key,m);return m;
}
function addPitchedRoof(root,w,d,y,overhang=.22,material=mat.roof){
 const panelW=Math.hypot(d/2+overhang,1.05);
 for(const side of [-1,1]){const roof=new THREE.Mesh(new THREE.BoxGeometry(w+overhang*2,.12,panelW),material);
  roof.position.set(0,y,side*(d*.25));roof.rotation.x=side*(Math.PI/4.9);roof.castShadow=true;root.add(roof);}
}
function addFrontLabel(root,text,w,y,z){if(!text)return;const plate=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(w*.86,7.8),.62),makeLabelMaterial(text));plate.position.set(0,y,z);plate.rotation.y=Math.PI;root.add(plate);}
function selectable(mesh,e){mesh.userData.selection={type:'object',id:e.id};clickable.push(mesh);}
function buildGeometry(e){const root=new THREE.Group(),w=e.width,d=e.depth,h=e.height;
 const b=(x,y,z,bw,bh,bd,m)=>addCube(root,x,y,z,bw,bh,bd,m);
 const c=(x,y,z,r,bh,m,n=16)=>cylinder(root,x,y,z,r,bh,m,n);
 switch(e.kind){
  case 'stall': case 'kiosk': {
   const bodyMat=e.kind==='kiosk'?mat.festiveBlue:mat.woodDark;
   b(0,h*.42,0,w,h*.72,d,bodyMat);
   addPitchedRoof(root,w,d,h*.82,.28,e.kind==='kiosk'?mat.festiveBlue:mat.roof);
   b(0,h*.46,-d/2-.035,w*.72,h*.27,.05,mat.warm);
   addFrontLabel(root,e.label||e.id,w,h*.72,-d/2-.075);
   break;
  }
  case 'lodge': {
   b(0,h*.34,0,w,h*.60,d,mat.woodDark);
   if(e.twoStorey){b(0,h*.67,0,w*.88,h*.28,d*.86,mat.wood);addPitchedRoof(root,w*.95,d*.92,h*.90,.32,mat.roof);}
   else addPitchedRoof(root,w,d,h*.71,.34,mat.roof);
   for(const sx of [-w*.28,0,w*.28])b(sx,h*.38,-d/2-.035,w*.16,h*.22,.05,mat.warm);
   addFrontLabel(root,e.label||e.id,w,e.twoStorey?h*.73:h*.61,-d/2-.085);
   break;
  }
  case 'gate': {
   const towerW=w*.17, towerH=h*.82;
   for(const sx of [-w*.38,w*.38]){
    b(sx,towerH*.52,0,towerW,towerH,d,mat.festiveBlue);
    const roof=new THREE.Mesh(new THREE.ConeGeometry(towerW*.72,h*.18,6),mat.roof);roof.position.set(sx,h*.94,0);root.add(roof);
    const finial=new THREE.Mesh(new THREE.SphereGeometry(.11,10,8),mat.gold);finial.position.set(sx,h*1.03,0);root.add(finial);
    for(const sy of [h*.30,h*.52]){
      const win=new THREE.Mesh(new THREE.PlaneGeometry(towerW*.45,h*.10),mat.warm);win.position.set(sx,sy,-d/2-.03);root.add(win);
    }
   }
   b(0,h*.17,0,w*.82,h*.34,d*.84,mat.festiveBlue);
   b(0,h*.56,0,w*.62,h*.16,d*.76,mat.festiveBlue);
   const arch=new THREE.Mesh(new THREE.TorusGeometry(w*.20,.11,10,24,Math.PI),mat.gold);arch.rotation.z=Math.PI;arch.position.set(0,h*.40,-d*.02);root.add(arch);
   const gable=new THREE.Mesh(new THREE.CylinderGeometry(.01,w*.17,d*.78,3,1,false),mat.festiveBlue);gable.rotation.z=Math.PI/2;gable.rotation.x=Math.PI/2;gable.position.set(0,h*.76,0);root.add(gable);
   const crest=new THREE.Mesh(new THREE.BoxGeometry(w*.16,h*.10,d*.28),mat.gold);crest.position.set(0,h*.90,0);root.add(crest);
   addFrontLabel(root,e.label||e.id,w*.88,h*.62,-d/2-.09);break;
  }
  case 'tree': {
   c(0,h*.18,0,Math.max(.16,w*.07),h*.36,mat.woodDark,10);
   for(let i=0;i<4;i++){const cone=new THREE.Mesh(new THREE.ConeGeometry(w*(.50-i*.07),h*.34,16),mat.plant);cone.position.y=h*(.38+i*.15);cone.castShadow=true;root.add(cone);}
   const star=new THREE.Mesh(new THREE.OctahedronGeometry(w*.13,0),mat.gold);star.position.y=h*.93;root.add(star);break;
  }
  case 'carousel': {
   c(0,.16,0,w*.50,.28,mat.wood,32);c(0,h*.44,0,.16,h*.70,mat.gold,16);
   const roof=new THREE.Mesh(new THREE.ConeGeometry(w*.53,h*.34,32),mat.red);roof.position.y=h*.73;root.add(roof);
   for(let i=0;i<10;i++){const a=i*Math.PI*2/10;c(Math.cos(a)*w*.34,h*.36,Math.sin(a)*d*.34,.035,h*.45,mat.gold,8);}
   break;
  }
  case 'statue': {
   b(0,.75,0,w*.98,1.5,d*.92,mat.stone);
   b(0,2.05,0,w*.78,1.05,d*.72,mat.stone);
   b(0,2.95,0,w*.68,.72,d*.60,mat.stone);
   const frieze=new THREE.Mesh(new THREE.BoxGeometry(w*.62,.38,d*.54),mat.red);frieze.position.set(0,1.15,-d*.09);root.add(frieze);
   const glow=new THREE.Mesh(new THREE.BoxGeometry(w*.60,.30,d*.02),mat.warm);glow.position.set(0,1.20,-d*.31);root.add(glow);
   for(const sx of [-w*.28,-w*.09,w*.09,w*.28]){
    c(sx,2.55,d*.24,.14,1.05,mat.stone,10);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.16,10,8),mat.stone);head.position.set(sx,3.18,d*.24);root.add(head);
   }
   const plinth=new THREE.Mesh(new THREE.BoxGeometry(w*.34,.34,d*.24),mat.stone);plinth.position.set(0,3.52,0);root.add(plinth);
   const body=new THREE.Mesh(new THREE.BoxGeometry(w*.30,.46,d*.18),mat.stone);body.position.set(0,4.08,0);root.add(body);
   const neck=new THREE.Mesh(new THREE.CylinderGeometry(.12,.15,.22,8),mat.stone);neck.position.set(w*.13,4.22,0);neck.rotation.z=-.25;root.add(neck);
   const head=new THREE.Mesh(new THREE.SphereGeometry(.16,12,10),mat.stone);head.position.set(w*.23,4.34,.03);root.add(head);
   for(const lx of [-w*.11,w*.05]) for(const lz of [-d*.08,d*.08]){c(lx,3.60,lz,.06,.72,mat.stone,8);}
   const tail=new THREE.Mesh(new THREE.CylinderGeometry(.03,.06,.55,6),mat.stone);tail.position.set(-w*.18,4.00,-d*.11);tail.rotation.z=.7;root.add(tail);
   const rider=new THREE.Mesh(new THREE.CapsuleGeometry(.08,.34,6,10),mat.stone);rider.position.set(-.02,4.46,0);root.add(rider);
   const riderHead=new THREE.Mesh(new THREE.SphereGeometry(.08,10,8),mat.stone);riderHead.position.set(-.02,4.74,0);root.add(riderHead);
   break;
  }
  case 'ice_lane': {
   b(0,.05,0,w,.10,d,mat.ice);
   const edgeThick=.08;
   for(const sz of [-d/2,d/2]){
    b(0,.36,sz,w,.56,edgeThick,mat.white);
    for(let x=-w/2+.8;x<=w/2-.8;x+=2.4)b(x,.26,sz,edgeThick,.34,.16,mat.metal);
   }
   break;
  }
  case 'ice_ring': {
   const outer=Math.max(w,d)/2,inner=outer*(e.innerRatio||.55);const ring=new THREE.Mesh(new THREE.RingGeometry(inner,outer,72),mat.ice);
   ring.rotation.x=-Math.PI/2;ring.scale.set(w/Math.max(w,d),d/Math.max(w,d),1);ring.position.y=.06;root.add(ring);
   const edgeMat=new THREE.LineBasicMaterial({color:0xeaf8ff,transparent:true,opacity:.9});
   for(const r of [inner,outer]){const pts=[];for(let i=0;i<=72;i++){const a=i*Math.PI*2/72;pts.push(new THREE.Vector3(Math.cos(a)*r*w/Math.max(w,d),.11,Math.sin(a)*r*d/Math.max(w,d)));}
    root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),edgeMat));}
   // low acrylic barrier on outer rim only
   for(let i=0;i<28;i++){const a=i*Math.PI*2/28;const px=Math.cos(a)*(outer-.1)*w/Math.max(w,d), pz=Math.sin(a)*(outer-.1)*d/Math.max(w,d);
    const panel=new THREE.Mesh(new THREE.BoxGeometry(1.05,.48,.05),mat.walls);panel.position.set(px,.26,pz);panel.rotation.y=-a;root.add(panel);}
   break;
  }
  case 'bridge': {
   b(0,1.55,0,w,.28,d*.78,mat.wood);
   // stairs north/south
   for(let i=0;i<7;i++){
    const y=.18+i*.20, off=(6-i)*.34;
    b(-w/2+off,y,-d*.40,w*.30,.14,d*.24,mat.wood);
    b(w/2-off,y,d*.40,w*.30,.14,d*.24,mat.wood);
   }
   // central truss posts
   for(const sz of [-d*.40,d*.40]){
    for(let x=-w*.42;x<=w*.42;x+=.7)b(x,1.72,sz,.06,.88,.06,mat.gold);
    b(0,2.14,sz,w*.92,.08,.08,mat.gold);
   }
   const arch1=new THREE.Mesh(new THREE.TorusGeometry(w*.32,.05,6,24,Math.PI),mat.gold);arch1.rotation.y=Math.PI/2;arch1.position.set(0,2.00,-d*.40);root.add(arch1);
   const arch2=arch1.clone();arch2.position.z=d*.40;root.add(arch2);
   break;
  }
  case 'gondola': {
   b(0,h*.47,0,w,h*.74,d,mat.red);b(0,h*.93,0,w*.86,.12,d*.86,mat.roof);b(0,h*.50,-d/2-.02,w*.62,h*.34,.04,mat.warm);break;
  }
  case 'lightpole': {
   c(0,h*.5,0,.06,h,mat.dark,10);const ring=new THREE.Mesh(new THREE.TorusGeometry(w*.9,.07,8,24),mat.warm);ring.rotation.x=Math.PI/2;ring.position.y=h*.84;root.add(ring);break;
  }
  case 'sign': {b(0,h*.45,0,.08,h*.9,.08,mat.woodDark);b(0,h*.82,0,w,.55,d,mat.wood);addFrontLabel(root,e.label||e.id,w,h*.82,-d/2-.02);break;}
  case 'table': {
   b(0,h,0,w,.075,d,mat.wood);for(const sx of [-w/2+.09,w/2-.09])for(const sz of [-d/2+.10,d/2-.10])b(sx,h/2,sz,.045,Math.max(.12,h-.06),.045,mat.metal);break;
  }
  case 'chair': {b(0,.50,0,w*.94,.13,d*.87,mat.chair);b(0,.83,d*.43,w*.96,.58,.10,mat.dark);c(0,.24,0,.045,.44,mat.metal,8);break;}
  case 'plant': {c(0,h*.24,0,Math.min(w,d)*.29,h*.4,mat.pot,10);const leaves=new THREE.Mesh(new THREE.IcosahedronGeometry(Math.min(w,d)*.53,1),mat.plant);leaves.position.y=h*.75;root.add(leaves);leaves.castShadow=true;break;}
  case 'desk': case 'meeting_table': {
   if(e.kind==='meeting_table'&&(e.shape==='oval'||(!e.shape&&['1019','1100'].includes(e.roomId)))){
     const oval=new THREE.Mesh(new THREE.CylinderGeometry(1,1,.105,32),mat.table);
     oval.scale.set(w/2,1,d/2);oval.position.set(0,.75,0);oval.castShadow=true;root.add(oval);
   }else{
     b(0,h,0,w,e.kind==='meeting_table'?.10:.075,d,
      e.kind==='meeting_table'&&e.roomId==='1220'?mat.screens:e.kind==='meeting_table'?mat.table:mat.wood);
     for(const sx of [-w/2+.09,w/2-.09])for(const sz of [-d/2+.10,d/2-.10])
       b(sx,h/2,sz,.045,Math.max(.12,h-.06),.045,mat.metal);
   }
   break;
  }
  case 'chair': {
   // The chair back points along local +Z; the entire chair rotates as one unit.
   b(0,.50,0,w*.94,.13,d*.87,mat.chair);
   b(0,.83,d*.43,w*.96,.58,.10,mat.dark);
   c(0,.24,0,.045,.44,mat.metal,8);
   for(const sx of [-w*.38,w*.38])b(sx,.09,0,.06,.035,d*.8,mat.metal);
   break;
  }
  case 'rack': {
   b(0,h/2,0,w,h,d,mat.server);b(0,h/2,-d/2-.005,w*.82,h*.88,.018,mat.dark);
   for(let i=0;i<Math.max(4,Math.floor(h/.16));i++){const yy=.17+i*.145;if(yy>=h-.08)break;
    b(0,yy,-d/2-.02,w*.68,.058,.026,mat.metal);c(-w*.29,yy,-d/2-.041,.009,.013,mat.light,6);}
   break;
  }
  case 'server': {
   b(0,h/2,0,w,h,d,mat.server);b(0,h/2,-d/2-.006,w*.9,h*.68,.018,mat.dark);
   for(let i=0;i<4;i++)c(-w*.36+i*w*.15,h*.52,-d/2-.02,.012,.018,i===0?mat.light:mat.metal,8);break;
  }
  case 'shelf': {
   for(const sx of [-w/2+.028,w/2-.028])b(sx,h/2,0,.055,h,d,mat.metal);
   for(let i=0;i<=4;i++)b(0,.045+i*(h-.09)/4,0,w,.07,d,mat.white);
   break;
  }
  case 'cabinet': {
   b(0,h/2,0,w,h,d,mat.white);b(0,h/2,-d/2-.012,.02,h*.85,.025,mat.metal);
   for(const sx of [-w*.08,w*.08])b(sx,h*.55,-d/2-.02,.027,.13,.029,mat.dark);break;
  }
  case 'monitor': case 'tv': {
   if(e.kind==='monitor'){
    // The original v0.1 desk accessory was a low dark screen with a short stand.
    b(0,.89,0,w,.045,Math.max(.11,d),mat.screens);
    b(0,.97,-.05,.038,.16,.035,mat.metal);
   }else{
    const mid=1.45;
    b(0,mid+h/2,0,w,h,Math.max(.055,d*.5),mat.screens);
    b(0,mid+h/2,-d/2-.008,w*.91,h*.84,.013,mat.dark);
    b(0,mid*.5,0,.04,mid,.045,mat.metal);b(0,.03,0,Math.max(.12,w*.32),.035,Math.max(.12,d),mat.metal);
   }break;
  }
  case 'sofa': {
   b(0,.41,0,w,.36,d,mat.sofa);b(0,.68,d*.41,w,.43,.18,mat.sofa);
   for(const sx of [-w/2+.095,w/2-.095])b(sx,.6,0,.15,.35,d,mat.sofa);break;
  }
  case 'plant': {
   c(0,h*.24,0,Math.min(w,d)*.29,h*.4,mat.pot,10);
   const leaves=new THREE.Mesh(new THREE.IcosahedronGeometry(Math.min(w,d)*.53,1),mat.plant);leaves.position.y=h*.75;root.add(leaves);leaves.castShadow=true;break;
  }
  case 'printer': {
   b(0,h*.45,0,w,h*.67,d,mat.white);b(0,h*.85,d*.15,w*.85,h*.22,d*.7,mat.metal);
   b(0,h*.48,-d/2-.013,w*.76,.035,.026,mat.dark);break;
  }
  case 'stool': {c(0,h,0,Math.min(w,d)*.47,.13,mat.chair,14);c(0,h/2,0,.045,h-.1,mat.metal,8);b(0,.10,0,w*.65,.035,d*.65,mat.metal);break;}
 }
 root.position.set(e.position[0],e.elevation||0,e.position[1]);root.rotation.y=e.rotation;
 // Selecting any mesh selects its parent furniture object, never just a chair leg.
 root.traverse(o=>{if(o.isMesh){o.userData.selection={type:e.kind==='desk'?'desk':'object',id:e.id};clickable.push(o);}});
 root.userData.objectId=e.id;entityGroup.add(root);objectRoots.set(e.id,root);return root;
}
function removeRoot(id){const root=objectRoots.get(id);if(!root)return;
 const meshes=new Set();root.traverse(o=>{if(o.isMesh){meshes.add(o);o.geometry?.dispose();}});
 clickable=clickable.filter(o=>!meshes.has(o));entityGroup.remove(root);objectRoots.delete(id);
}
function rebuildFurniture(){for(const id of [...objectRoots.keys()])removeRoot(id);for(const e of entities)buildGeometry(e);}
rebuildFurniture();
const transform=new TransformControls(camera,renderer.domElement);
scene.add(typeof transform.getHelper==='function'?transform.getHelper():transform);
transform.setMode('translate');transform.space='world';transform.showX=true;transform.showY=true;transform.showZ=true;
transform.addEventListener('dragging-changed',event=>{transformDragging=event.value;controls.enabled=!event.value;
 if(!event.value&&selected?.type!=='room'){const e=lookupAny(selected.id);if(e){e.roomId=roomAt(e.position[0],e.position[1])||e.roomId;showDetails();saveLocally('SAVED LOCALLY');}}});
transform.addEventListener('objectChange',()=>{if(!selected||selected.type==='room')return;
 const e=lookupAny(selected.id),root=objectRoots.get(selected.id)||wallRoots.get(selected.id);if(!e||!root)return;
 root.position.x=clamp(root.position.x,0,W);root.position.y=clamp(root.position.y,0,H);root.position.z=clamp(root.position.z,0,D);
 e.position=[round(root.position.x),round(root.position.z)];e.elevation=round(root.position.y);e.rotation=round(root.rotation.y);showObjectFields(e);outline?.update();setStatus('EDITING…',true);});
function setTransformMode(mode){transformMode=mode;transform.setMode(mode);transform.showX=mode==='translate';transform.showY=true;transform.showZ=mode==='translate';
 $('moveBtn').classList.toggle('active',mode==='translate');$('rotateBtn').classList.toggle('active',mode==='rotate');}
setTransformMode('translate');
function setStatus(message,changed=false){$('saveStatus').innerHTML='<i></i> '+message;$('saveStatus').classList.toggle('changed',changed);}
function exportLayout(){const result=clone(BASE);result.objects=clone(entities);result.wallObjects=clone(wallEntities);
 // Keep legacy wall segment coordinates for clients that only read model-data.walls.
 result.walls=wallEntities.map(e=>{const dx=Math.cos(-e.rotation)*e.width/2,dz=Math.sin(-e.rotation)*e.width/2;return {a:[round(e.position[0]-dx),round(e.position[1]-dz)],b:[round(e.position[0]+dx),round(e.position[1]+dz)]};});
 result.desks=entities.filter(e=>e.kind==='desk').map(e=>({id:e.id,roomId:e.roomId,center:[...e.position],width:e.width,depth:e.depth}));
 result.meta.editorVersion='heumarkt-1.0';result.meta.objectCount=entities.length;result.meta.wallCount=wallEntities.length;return result;}
function saveLocally(message='SAVED LOCALLY'){
 try{localStorage.setItem(STORAGE_KEY,JSON.stringify(exportLayout()));setStatus(message);}
 catch(e){setStatus('SAVE FAILED — DOWNLOAD JSON',true);console.warn(e);}
 publishLayoutChange();}
function publishLayoutChange(){const payload={version:1,event:'heumarkt-map:layout-change',scene:'Heumarkt 2025',objectCount:entities.length,wallCount:wallEntities.length};
 window.dispatchEvent(new CustomEvent('heumarkt-map:layout-change',{detail:payload}));if(window.parent!==window)window.parent.postMessage(payload,window.location.origin);}
function getPointer(event){const rect=renderer.domElement.getBoundingClientRect();pointer.set(((event.clientX-rect.left)/rect.width)*2-1,-((event.clientY-rect.top)/rect.height)*2+1);ray.setFromCamera(pointer,camera);}
function hitAt(event){getPointer(event);
 const hits=ray.intersectObjects(clickable.filter(o=>o.visible&&o.parent?.visible!==false&&
  (o.userData.selection?.type==='choicepoint'||o.userData.selection?.type!=='wall'||(editMode&&wallGroup.visible))&&
  (o.userData.selection?.type==='choicepoint'||o.userData.selection?.type==='wall'||(o.userData.selection?.type==='room'||entityGroup.visible))),false);
 // Choice points always win so buildings beneath them don't swallow clicks.
 return hits.find(hit=>hit.object.userData.selection?.type==='choicepoint')
  ||hits.find(hit=>hit.object.userData.selection?.type!=='room')||hits[0]||null;}
const plane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
function floorPoint(event){getPointer(event);const p=new THREE.Vector3();if(!ray.ray.intersectPlane(plane,p))return null;
 if(p.x<0||p.x>W||p.z<0||p.z>D)return null;return p;}
function selectionType(e){return e.kind==='wall'?'wall':e.kind==='desk'?'desk':'object';}
function focusOn(item,shouldMove=true){if(!item)return;const e=item.type==='room'?null:lookupAny(item.id);
 const room=item.type==='room'?BASE.rooms.find(r=>r.id===item.id):BASE.rooms.find(r=>r.id===e?.roomId);
 if(item.type!=='room'&&!e)return;if(item.type==='room'&&!room)return;
 selected={type:item.type,id:item.id,roomId:room?.id||e?.roomId||''};
 for(const [id,m] of roomMeshes)m.material.opacity=(id===selected.roomId?.48:.24);
 if(outline){scene.remove(outline);outline.geometry?.dispose();outline=null;}
 if(e){const root=objectRoots.get(e.id)||wallRoots.get(e.id);outline=new THREE.BoxHelper(root,0x74c8ff);scene.add(outline);}
 if(e&&editMode){transform.attach(objectRoots.get(e.id)||wallRoots.get(e.id));}else transform.detach();
 const [cx,cz]=e?e.position:center(room.bounds);
 if(shouldMove){const delta=new THREE.Vector3(cx,0,cz).sub(controls.target);controls.target.add(delta);camera.position.add(delta);controls.update();}
 showDetails();
 for(const b of $('directory').querySelectorAll('button'))b.classList.toggle('active',b.dataset.id===selected.roomId);
 for(const {room:r,el} of roomLabels)el.classList.toggle('active',r.id===selected.roomId);
 const payload={version:1,event:'heumarkt-map:selection',scene:'Heumarkt 2025',type:selected.type,id:selected.id,roomId:selected.roomId};
 if(e){payload.kind=e.kind;payload.label=e.label||library[e.kind]?.label||e.id;payload.position=[e.position[0],e.position[1]];}
 window.dispatchEvent(new CustomEvent('office-map:selection',{detail:payload}));if(window.parent!==window)window.parent.postMessage(payload,window.location.origin);
}
function clearSelection(){selected=null;transform.detach();if(outline){scene.remove(outline);outline.geometry?.dispose();outline=null;}
 $('empty').hidden=false;$('details').hidden=true;for(const mesh of roomMeshes.values())mesh.material.opacity=.24;
 for(const {el} of roomLabels)el.classList.remove('active');for(const b of $('directory').querySelectorAll('button'))b.classList.remove('active');}
function field(id,value){const el=$(id);if(document.activeElement!==el)el.value=value;}
function showObjectFields(e){field('objectX',e.position[0].toFixed(2));field('objectZ',e.position[1].toFixed(2));field('objectAngle',(e.rotation*180/Math.PI).toFixed(1));field('objectElevation',(e.elevation||0).toFixed(2));
 field('objectRoom',e.roomId);field('objectWidth',e.width.toFixed(2));field('objectDepth',e.depth.toFixed(2));field('objectHeight',e.height.toFixed(2));field('objectId',e.id);}
function showDetails(){if(!selected)return;const e=selected.type==='room'?null:lookupAny(selected.id),r=BASE.rooms.find(r=>r.id===(e?.roomId||selected.roomId));
 $('empty').hidden=true;$('details').hidden=false;$('kindBadge').textContent=e?e.kind.toUpperCase().replace('_',' '):'ROOM';
 $('detailId').textContent=selected.id;$('detailName').textContent=e?`${e.label||library[e.kind].label} · ${r?.name||'Freie Fläche'}`:r?.name||'Bereich';
 const rows=e?[['Room',e.roomId||'Unassigned'],['Position',`${e.position[0].toFixed(2)} × ${e.position[1].toFixed(2)} m`],['Dimensions',`${e.width.toFixed(2)} × ${e.depth.toFixed(2)} × ${e.height.toFixed(2)} m`],['Floor','1.OG']]:[
 ['Kategorie',r.kind],['Szene','Heumarkt 2025'],['Ungefähre Abmessungen',`${(r.bounds[2]-r.bounds[0]).toFixed(1)} × ${(r.bounds[3]-r.bounds[1]).toFixed(1)} m`],
 ['Objekte hier',String(entities.filter(t=>t.roomId===r.id).length)]];
 $('detailRows').replaceChildren(...rows.map(([key,val])=>{const div=document.createElement('div'),label=document.createElement('span'),strong=document.createElement('strong');label.textContent=key;strong.textContent=val;div.append(label,strong);return div;}));
 $('objectEditor').hidden=!editMode||!e;if(e){showObjectFields(e);
 $('objectWidthLabel').textContent=e.kind==='wall'?'Length (m)':'Width (m)';
 $('objectDepthLabel').textContent=e.kind==='wall'?'Thickness (m)':'Depth (m)';
 $('objectWidth').max=e.kind==='wall'?'120':'12';$('objectDepth').min=e.kind==='wall'?'.03':'.1';
 $('objectElevation').max=String(H);}
 $('payload').textContent=JSON.stringify({version:1,event:'heumarkt-map:selection',scene:'Heumarkt 2025',type:selected.type,id:selected.id,roomId:e?.roomId||r?.id||'',...(e?{kind:e.kind}:{})},null,2);
}
function syncObject(e,geometryChanged=false){const isWall=e.kind==='wall';const old=isWall?wallRoots.get(e.id):objectRoots.get(e.id);
 if(geometryChanged){if(old)(isWall?removeWall:removeRoot)(e.id);(isWall?buildWall:buildGeometry)(e);}else if(old){old.position.set(e.position[0],e.elevation||0,e.position[1]);old.rotation.y=e.rotation;}
 if(selected?.id===e.id){focusOn({type:selectionType(e),id:e.id},false);}refreshSearch();saveLocally();}
function uniqueId(base){let id=base,i=1;while(lookupAny(id)){id=`${base}-${i++}`;}return id;}
function addEntity(kind,x,z,properties={}){const id=uniqueId(properties.id||`${kind}-${String(entities.filter(e=>e.kind===kind).length+1).padStart(3,'0')}`);
 const def=library[kind];if(!def)throw Error('Unknown object type');const e=entity(kind,id,x,z,properties.roomId||roomAt(x,z),properties.width??def.w,properties.depth??def.d,properties.height??def.h,properties.rotation??0);
 e.elevation=Number.isFinite(properties.elevation)?clamp(properties.elevation,0,H):0;
 if(properties.label)e.label=String(properties.label);if(Number.isFinite(properties.innerRatio))e.innerRatio=properties.innerRatio;if(properties.twoStorey)e.twoStorey=true;
 if(kind==='wall'){e.exterior=Boolean(properties.exterior);e.glazing=Boolean(properties.glazing);
  wallEntities.push(e);buildWall(e);}
 else{entities.push(e);buildGeometry(e);}
 refreshSearch();focusOn({type:selectionType(e),id:e.id},false);saveLocally();return e;}
function duplicateSelected(){if(!selected||selected.type==='room')return;const e=lookupAny(selected.id);if(!e)return;
 addEntity(e.kind,clamp(e.position[0]+.6,0,W),clamp(e.position[1]+.6,0,D),{...e,id:uniqueId(`${e.id}-copy`)});}
function deleteSelected(){if(!selected||selected.type==='room')return;const id=selected.id,isWall=selected.type==='wall';clearSelection();
 if(isWall){wallEntities=wallEntities.filter(e=>e.id!==id);removeWall(id);}
 else{entities=entities.filter(e=>e.id!==id);removeRoot(id);}
 refreshSearch();saveLocally();}
function setEdit(on){editMode=!!on;$('editMode').setAttribute('aria-pressed',String(editMode));$('editMode').textContent=editMode?'✓ Finish editing':'✎ Edit layout';
 $('editSidebar').hidden=!editMode;$('modePill').hidden=!editMode;$('bottomHint').textContent=editMode?'Edit mode · Select furniture or individual walls · Use the gizmo to move or rotate · Ctrl+D to duplicate':'Drag to rotate · Scroll to zoom · Right-drag to pan · Click to select';
 if(!editMode){cancelPlacement();transform.detach();}else if(selected?.type!=='room'&&selected){transform.attach(objectRoots.get(selected.id)||wallRoots.get(selected.id));}
 if(selected)showDetails();}
function cancelPlacement() {placement=null;for(const b of $('palette').querySelectorAll('button'))b.classList.remove('active');$('cancelPlace').hidden=true;renderer.domElement.style.cursor='grab';}
function setPlacement(kind,button){if(kind==='wall'&&!$('walls').checked){$('walls').checked=true;wallGroup.visible=true;}placement=kind;for(const b of $('palette').querySelectorAll('button'))b.classList.toggle('active',b===button);$('cancelPlace').hidden=false;}
for(const [kind,def] of Object.entries(library)){const btn=document.createElement('button');btn.textContent=def.label;btn.type='button';btn.dataset.kind=kind;
 btn.addEventListener('click',()=>setPlacement(kind,btn));$('palette').appendChild(btn);}
$('cancelPlace').addEventListener('click',cancelPlacement);
renderer.domElement.addEventListener('pointerdown',event=>{down=[event.clientX,event.clientY];});
renderer.domElement.addEventListener('pointerup',event=>{if(!down||transformDragging)return;const moved=Math.hypot(event.clientX-down[0],event.clientY-down[1]);down=null;if(moved>5)return;
 const hit=hitAt(event);
 if(hit?.object.userData.selection?.type==='choicepoint'){
  const data=hit.object.userData.selection;
  const root=choicePointMeshes.get(data.id);
  if(root){
   root.scale.set(1.16,1.16,1.16);
   window.setTimeout(()=>root.scale.set(1,1,1),130);
  }
  const payload={version:1,event:'heumarkt-map:choice-point',id:data.id,objectId:data.objectId,label:data.label,position:[data.x,data.z]};
  if(window.parent!==window)window.parent.postMessage(payload,window.location.origin);
  return;
 }
 if(APP_MODE==='calibration'){const point=floorPoint(event);if(point){const payload={version:1,event:'heumarkt-map:selection',scene:'Heumarkt 2025',type:'point',id:'calibration-point',roomId:roomAt(point.x,point.z),label:'Freier Kalibrierpunkt',position:[round(point.x),round(point.z)]};if(window.parent!==window)window.parent.postMessage(payload,window.location.origin);clearGameOverlay();markerAt(point.x,point.z,0x6bbcf2,.42);}return;}
 if(editMode&&placement){const point=floorPoint(event);if(point){addEntity(placement,point.x,point.z);cancelPlacement();}return;}
 if(hit)focusOn(hit.object.userData.selection,false);});
renderer.domElement.addEventListener('pointermove',event=>{const tip=$('tooltip');if(APP_MODE==='calibration'){const calibrationHit=hitAt(event);renderer.domElement.style.cursor=calibrationHit?.object.userData.selection?.type==='choicepoint'?'pointer':'crosshair';tip.hidden=true;return;}if(editMode&&placement){renderer.domElement.style.cursor='crosshair';tip.hidden=true;return;}
 if(transformDragging){tip.hidden=true;return;}const hit=hitAt(event),data=hit?.object.userData.selection;
 renderer.domElement.style.cursor=data?'pointer':'grab';if(!data){tip.hidden=true;return;}tip.hidden=false;
 tip.textContent=data.type==='choicepoint'?`${data.id} · ${data.label}`:data.type==='room'?`Room ${data.id}`:`${library[lookupAny(data.id)?.kind]?.label||'Object'} · ${data.id}`;
 const rc=panel.getBoundingClientRect();tip.style.left=`${Math.min(rc.width-140,event.clientX-rc.left+14)}px`;tip.style.top=`${Math.max(8,event.clientY-rc.top-34)}px`;});
renderer.domElement.addEventListener('pointerleave',()=>{$('tooltip').hidden=true;down=null;});
const directory=$('directory');for(const r of BASE.rooms){const b=document.createElement('button');b.dataset.id=r.id;
 const dot=document.createElement('span');dot.className=`dir-dot ${r.kind}`;const label=document.createElement('b');label.textContent=r.id;
 const name=document.createElement('span');name.textContent=r.name;b.append(dot,label,name);b.addEventListener('click',()=>focusOn({type:'room',id:r.id}));directory.appendChild(b);}
$('spaceCount').textContent=BASE.rooms.length;
const search=$('search'),suggestions=$('suggestions');let searchItems=[];
function refreshSearch(){searchItems=[...BASE.rooms.map(r=>({type:'room',id:r.id,title:r.name})),...entities.map(e=>({type:selectionType(e),id:e.id,title:`${e.label||library[e.kind].label} · ${e.roomId}`})),...wallEntities.map(e=>({type:'wall',id:e.id,title:`Wall segment · ${e.width.toFixed(2)} m`}))];
 refreshSuggestions();}
function refreshSuggestions(){const q=search.value.trim().toLowerCase();suggestions.replaceChildren();if(!q){suggestions.hidden=true;return;}
 const hits=searchItems.filter(i=>`${i.id} ${i.title}`.toLowerCase().includes(q)).slice(0,10);for(const h of hits){const b=document.createElement('button'),name=document.createElement('strong'),small=document.createElement('small');
 name.textContent=h.id;small.textContent=h.title;b.append(name,small);b.addEventListener('click',()=>{focusOn(h);search.value=h.id;suggestions.hidden=true;});suggestions.appendChild(b);}suggestions.hidden=!hits.length;}
search.addEventListener('input',refreshSuggestions);search.addEventListener('keydown',event=>{if(event.key==='Enter'){const q=search.value.trim().toLowerCase();const item=searchItems.find(i=>i.id.toLowerCase()===q)||searchItems.find(i=>i.id.toLowerCase().startsWith(q));if(item)focusOn(item);suggestions.hidden=true;}
 if(event.key==='Escape')suggestions.hidden=true;});refreshSearch();
const presets={iso:[W*.53,48,D*3.4],top:[W/2,115,D/2+.001],north:[W/2,30,-38],east:[W+18,27,D/2]};
function preset(name){camera.position.set(...(presets[name]||presets.iso));controls.target.set(W/2,0,D/2);controls.update();for(const b of document.querySelectorAll('[data-camera]'))b.classList.toggle('selected',b.dataset.camera===name);}
for(const b of document.querySelectorAll('[data-camera]'))b.addEventListener('click',()=>preset(b.dataset.camera));$('resetBtn').addEventListener('click',()=>preset('iso'));
$('walls').addEventListener('change',event=>{wallGroup.visible=event.target.checked;if(!event.target.checked&&selected?.type==='wall')clearSelection();});
$('furniture').addEventListener('change',event=>{entityGroup.visible=event.target.checked;staticGroup.visible=event.target.checked;if(!event.target.checked)transform.detach();else if(editMode&&selected?.type!=='room'&&selected)transform.attach(objectRoots.get(selected.id)||wallRoots.get(selected.id));});
$('labels').addEventListener('change',event=>$('floatingLabels').hidden=!event.target.checked);
$('overlay').addEventListener('change',event=>overlay.visible=event.target.checked);
$('editMode').addEventListener('click',()=>setEdit(!editMode));$('moveBtn').addEventListener('click',()=>setTransformMode('translate'));
$('rotateBtn').addEventListener('click',()=>setTransformMode('rotate'));
$('duplicateBtn').addEventListener('click',duplicateSelected);$('deleteBtn').addEventListener('click',deleteSelected);
$('clearBtn').addEventListener('click',clearSelection);
$('copyBtn').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('payload').textContent);$('copyBtn').textContent='Copied!';setTimeout(()=>$('copyBtn').textContent='Copy selection JSON',1100);}catch{window.prompt('Copy selection JSON',$('payload').textContent);}});
const numericFields={objectX:'x',objectZ:'z',objectAngle:'angle',objectElevation:'elevation',objectWidth:'width',objectDepth:'depth',objectHeight:'height'};
for(const [id,key] of Object.entries(numericFields))$(id).addEventListener('change',event=>{if(!editMode||!selected||selected.type==='room')return;const e=lookupAny(selected.id),value=Number(event.target.value);if(!e||!Number.isFinite(value))return;
 if(key==='x')e.position[0]=clamp(value,0,W);else if(key==='z')e.position[1]=clamp(value,0,D);
 else if(key==='angle')e.rotation=round(value*Math.PI/180);else if(key==='elevation')e.elevation=clamp(value,0,H);else e[key]=clamp(value,key==='depth'&&e.kind==='wall'?.03:.1,key==='height'?H:key==='width'?160:key==='depth'&&e.kind==='wall'?2:80);
 const geometryChanged=['width','depth','height'].includes(key);syncObject(e,geometryChanged);});
$('objectRoom').addEventListener('change',event=>{if(!editMode||!selected||selected.type==='room')return;const e=lookupAny(selected.id);if(e){e.roomId=event.target.value.trim();syncObject(e);}});
$('objectId').addEventListener('change',event=>{if(!editMode||!selected||selected.type==='room')return;const e=lookupAny(selected.id);if(!e)return;
 const next=event.target.value.trim();if(!next||next.length>70||(next!==e.id&&lookupAny(next))){window.alert('Enter a unique object ID (1–70 characters).');$('objectId').value=e.id;return;}
 const old=e.id;(e.kind==='wall'?removeWall:removeRoot)(old);e.id=next;(e.kind==='wall'?buildWall:buildGeometry)(e);selected={type:selectionType(e),id:e.id,roomId:e.roomId};focusOn(selected,false);refreshSearch();saveLocally();});
$('saveBtn').addEventListener('click',()=>saveLocally('SAVED LOCALLY'));
$('exportBtn').addEventListener('click',()=>{const content=JSON.stringify(exportLayout(),null,2),blob=new Blob([content],{type:'application/json'}),url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download='office-atlas-1OG-layout.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);setStatus('JSON DOWNLOADED');});
$('importBtn').addEventListener('click',()=>$('importFile').click());
$('importFile').addEventListener('change',async event=>{const file=event.target.files?.[0];if(!file)return;
 try{const data=JSON.parse(await file.text());const imported=validateObjects(data.objects).filter(e=>e.kind!=='wall');
 const importedWalls=Array.isArray(data.wallObjects)?validateObjects(data.wallObjects):defaultWallObjects();
 if(importedWalls.some(e=>e.kind!=='wall'))throw Error('wallObjects must contain wall entities only.');
 const ids=[...imported,...importedWalls].map(e=>e.id);if(new Set(ids).size!==ids.length)throw Error('Duplicate ID across furniture and walls.');
 clearSelection();entities=imported;wallEntities=importedWalls;rebuildFurniture();rebuildWalls();refreshSearch();saveLocally('LAYOUT IMPORTED');}
 catch(e){window.alert('Could not import the layout: '+e.message);}event.target.value='';});
$('restoreBtn').addEventListener('click',()=>{if(!window.confirm('Restore the v0.4 plan-aligned furniture and original editable walls? Your current layout will be replaced; download your layout JSON first if you want to keep it.'))return;
 entities=defaultEntities();wallEntities=defaultWallObjects();clearSelection();rebuildFurniture();rebuildWalls();refreshSearch();saveLocally('PLAN-ALIGNED LAYOUT RESTORED');});
$('helpBtn').addEventListener('click',()=>$('helpModal').hidden=false);$('closeHelp').addEventListener('click',()=>$('helpModal').hidden=true);
$('helpModal').addEventListener('click',event=>{if(event.target===$('helpModal'))$('helpModal').hidden=true;});

function clearGameOverlay(){
 const overlayMeshes=new Set();
 gameOverlayGroup.traverse(child=>{if(child.isMesh||child.isSprite)overlayMeshes.add(child);});
 clickable=clickable.filter(item=>!overlayMeshes.has(item));
 choicePointMeshes.clear();
 while(gameOverlayGroup.children.length){
  const child=gameOverlayGroup.children[0];
  gameOverlayGroup.remove(child);
  child.traverse?.(part=>{
   part.geometry?.dispose?.();
   if(part.material){
    if(Array.isArray(part.material))part.material.forEach(m=>m.dispose?.());
    else part.material.dispose?.();
   }
  });
 }
}
function markerAt(x,z,color=0xff7447,size=.75){
 const mesh=new THREE.Mesh(new THREE.SphereGeometry(size,20,14),new THREE.MeshBasicMaterial({color,depthTest:false}));
 mesh.position.set(x,5.8,z);mesh.renderOrder=10;gameOverlayGroup.add(mesh);return mesh;
}
function choiceLabel(text,color){
 const canvas=document.createElement('canvas');canvas.width=160;canvas.height=160;
 const ctx=canvas.getContext('2d');
 ctx.beginPath();ctx.arc(80,80,58,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
 ctx.lineWidth=8;ctx.strokeStyle='#f3ede0';ctx.stroke();
 ctx.fillStyle='#f3ede0';ctx.font='700 54px system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,80,83);
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
 const material=new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false});
 const sprite=new THREE.Sprite(material);sprite.scale.set(2.3,2.3,1);return sprite;
}
function choiceMarker(point,status='idle'){
 const colors={idle:0xd66f34,selected:0xd4ab5e,correct:0x6eaa75,wrong:0xc8534c,admin:0xd4ab5e};
 const color=colors[status]||colors.idle;
 const root=new THREE.Group();
 const selection={type:'choicepoint',id:point.id,objectId:point.objectId,label:point.label,x:point.x,z:point.z};

 const stem=new THREE.Mesh(
  new THREE.CylinderGeometry(.12,.16,1.0,12),
  new THREE.MeshBasicMaterial({color,depthTest:false})
 );
 stem.position.y=.52;
 stem.renderOrder=10;
 root.add(stem);

 const cap=new THREE.Mesh(
  new THREE.SphereGeometry(.56,20,14),
  new THREE.MeshBasicMaterial({color,depthTest:false})
 );
 cap.position.y=1.18;
 cap.renderOrder=10;
 root.add(cap);

 const label=choiceLabel(
  point.id,
  color===colors.correct?'#5f9867':
  color===colors.wrong?'#b94943':
  color===colors.admin?'#c59b4c':
  status==='selected'?'#c59b4c':'#c7622f'
 );
 label.position.y=2.02;
 label.renderOrder=11;
 label.userData.selection=selection;
 root.add(label);

 // Larger invisible hit target so taps/clicks on the visible number badge
 // or immediately around the pin are reliably detected on desktop and mobile.
 const hitbox=new THREE.Mesh(
  new THREE.SphereGeometry(1.15,16,12),
  new THREE.MeshBasicMaterial({
   color:0xffffff,
   transparent:true,
   opacity:0,
   depthWrite:false
  })
 );
 hitbox.position.y=1.45;
 hitbox.renderOrder=10;
 hitbox.userData.selection=selection;
 root.add(hitbox);

 root.position.set(point.x,5,point.z);

 for(const target of [stem,cap,label,hitbox]){
  target.userData.selection=selection;
  clickable.push(target);
 }

 gameOverlayGroup.add(root);
 choicePointMeshes.set(point.id,root);
 return root;
}
function addHeartAt(x,z){
 const shape=new THREE.Shape();
 shape.moveTo(0,0.35);shape.bezierCurveTo(0,0.95,-1.1,1.1,-1.1,.25);shape.bezierCurveTo(-1.1,-.45,-.35,-.8,0,-1.25);shape.bezierCurveTo(.35,-.8,1.1,-.45,1.1,.25);shape.bezierCurveTo(1.1,1.1,0,.95,0,.35);
 const geo=new THREE.ExtrudeGeometry(shape,{depth:.16,bevelEnabled:true,bevelSize:.05,bevelThickness:.05,bevelSegments:2});
 const heart=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0xd94f46,emissive:0x5c100d,roughness:.42}));
 heart.rotation.x=-Math.PI/2;heart.scale.set(.75,.75,.75);heart.position.set(x,6.15,z);gameOverlayGroup.add(heart);
 return heart;
}
function renderChoicePoints(points=[],attemptObjectIds=[],successObjectIds=[],wrongObjectIds=[],solved=false,centerPoint=null,adminPreview=false){
 clearGameOverlay();
 const pointByObject=new Map(points.map(p=>[p.objectId,p]));
 for(const point of points){
  const status=wrongObjectIds.includes(point.objectId)?'wrong':successObjectIds.includes(point.objectId)?'correct':attemptObjectIds.includes(point.objectId)?'selected':adminPreview?'admin':'idle';
  choiceMarker(point,status);
 }
 if(solved&&successObjectIds.length===3){
  const pts=successObjectIds.map(id=>pointByObject.get(id)).filter(Boolean).map(p=>new THREE.Vector3(p.x,5.62,p.z));
  if(pts.length===3){
   const closed=[...pts,pts[0]].map(p=>p.clone());
   const lineMat=new THREE.LineBasicMaterial({color:0xf1d7a0,transparent:true,opacity:.96,depthTest:false});
   const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(closed),lineMat);
   line.renderOrder=9;
   gameOverlayGroup.add(line);
   const center=centerPoint&&Number.isFinite(centerPoint.x)&&Number.isFinite(centerPoint.z)
    ?centerPoint:{x:(pts[0].x+pts[1].x+pts[2].x)/3,z:(pts[0].z+pts[1].z+pts[2].z)/3};
   markerAt(center.x,center.z,0xd94f46,.5);addHeartAt(center.x,center.z);
  }
 }
}
function showTriangle(ids=[],centerPoint=null){
 const points=ids.map((id,index)=>{
  const object=lookupAny(id);if(!object)return null;
  return {id:`${index+1}`,objectId:id,label:object.label||id,x:object.position[0],z:object.position[1]};
 }).filter(Boolean);
 renderChoicePoints(points,[],ids,[],ids.length===3,centerPoint,false);
}
window.addEventListener('message',event=>{
 if(event.origin!==window.location.origin||!event.data)return;
 const msg=event.data;
 if(msg.event==='heumarkt-map:show-triangle')showTriangle(Array.isArray(msg.ids)?msg.ids:[],msg.center||null);
 if(msg.event==='heumarkt-map:render-choice-points')renderChoicePoints(
  Array.isArray(msg.points)?msg.points:[],
  Array.isArray(msg.attemptObjectIds)?msg.attemptObjectIds:[],
  Array.isArray(msg.successObjectIds)?msg.successObjectIds:[],
  Array.isArray(msg.wrongObjectIds)?msg.wrongObjectIds:[],
  Boolean(msg.solved),
  msg.center||null,
  Boolean(msg.adminPreview)
 );
 if(msg.event==='heumarkt-map:clear-triangle')clearGameOverlay();
 if(msg.event==='heumarkt-map:focus-object'&&typeof msg.id==='string')window.OfficeMap?.selectObject?.(msg.id);
});
// Tell the parent game route that the Three.js map, message listener and
// game overlay are ready. This prevents choice-point markers from being lost
// when the parent's first postMessage happens too early.
if(window.parent!==window){
 window.parent.postMessage(
  {version:1,event:'heumarkt-map:ready'},
  window.location.origin
 );
}

if(APP_MODE!=='editor'){
 const edit=$('editMode');if(edit)edit.hidden=true;
 const editSidebar=$('editSidebar');if(editSidebar)editSidebar.hidden=true;
 const status=$('saveStatus');if(status)status.textContent=APP_MODE==='calibration'?' CALIBRATION':' ARCHIVSZENE';
}

document.addEventListener('keydown',event=>{const target=event.target,typing=target instanceof HTMLElement&&(target.matches('input, textarea, select')||target.isContentEditable);if(typing)return;
 if(event.key==='/'&&!event.ctrlKey&&!event.metaKey){event.preventDefault();search.focus();return;}
 if(event.key==='Escape'){if(placement)cancelPlacement();else clearSelection();return;}
 if(!editMode||!selected||selected.type==='room')return;
 if(event.key.toLowerCase()==='g'){event.preventDefault();setTransformMode('translate');}
 if(event.key.toLowerCase()==='r'){event.preventDefault();setTransformMode('rotate');}
 if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='d'){event.preventDefault();duplicateSelected();}
 if(event.key==='Delete'||event.key==='Backspace'){event.preventDefault();deleteSelected();}
});
// Same-origin dashboard bridge. Furniture placement/editing is local; no network API or credentials are involved.
window.OfficeMap={selectRoom:id=>{if(BASE.rooms.some(r=>r.id===id))focusOn({type:'room',id});},
 selectDesk:id=>{if(lookup(id)?.kind==='desk')focusOn({type:'desk',id});},
 selectObject:id=>{const e=lookupAny(id);if(e)focusOn({type:selectionType(e),id});},clearSelection,
 getSelection:()=>selected?clone(selected):null,getData:()=>exportLayout(),exportLayout,
 addObject:(kind,position,properties={})=>{if(!library[kind]||!Array.isArray(position)||position.length!==2||!position.every(Number.isFinite))throw Error('Invalid kind or position');return clone(addEntity(kind,clamp(position[0],0,W),clamp(position[1],0,D),properties));},
 removeObject:id=>{const e=lookupAny(id);if(!e)return false;if(selected?.id===id)clearSelection();
 if(e.kind==='wall'){wallEntities=wallEntities.filter(a=>a.id!==id);removeWall(id);}
 else{entities=entities.filter(a=>a.id!==id);removeRoot(id);}
 refreshSearch();saveLocally();return true;},
 updateObject:(id,patch={})=>{const e=lookupAny(id);if(!e)return false;for(const key of ['width','depth','height','rotation'])if(Number.isFinite(patch[key]))e[key]=key==='rotation'?patch[key]:clamp(patch[key],.1,key==='height'?H:key==='width'?160:80);
 if(Array.isArray(patch.position)&&patch.position.length===2&&patch.position.every(Number.isFinite))e.position=[clamp(patch.position[0],0,W),clamp(patch.position[1],0,D)];
 if(Number.isFinite(patch.elevation))e.elevation=clamp(patch.elevation,0,H);if(typeof patch.roomId==='string')e.roomId=patch.roomId;syncObject(e,true);return true;},
 setEditMode:setEdit};
function resize(){const w=Math.max(1,panel.clientWidth),h=Math.max(1,panel.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);}new ResizeObserver(resize).observe(panel);resize();
const temp=new THREE.Vector3();function renderLabels(){if(!$('labels').checked||camera.position.distanceTo(controls.target)>145){for(const item of roomLabels)item.el.hidden=true;return;}
 for(const {el,position} of roomLabels){temp.copy(position).project(camera);const x=(temp.x*.5+.5)*panel.clientWidth,y=(-temp.y*.5+.5)*panel.clientHeight;
 const visible=temp.z<1&&temp.z>-1&&x>-40&&x<panel.clientWidth+40&&y>-20&&y<panel.clientHeight+20;
 el.hidden=!visible;el.style.left=`${x}px`;el.style.top=`${y}px`;}}
function animate(){requestAnimationFrame(animate);controls.update();outline?.update();renderLabels();renderer.render(scene,camera);}animate();$('loading').hidden=true;
