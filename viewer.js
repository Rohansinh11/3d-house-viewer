/* Independent procedural WebGL villa viewer. No third-party engine or copied source. */
(() => {
'use strict';
const canvas=document.getElementById('scene');
const gl=canvas.getContext('webgl',{antialias:true,alpha:false,preserveDrawingBuffer:true});
const status=document.getElementById('status');
if(!gl){status.textContent='WebGL is unavailable in this browser.';return;}
const vs=`attribute vec3 p;attribute vec3 n;attribute vec3 c;uniform mat4 mvp;uniform mat4 model;varying vec3 vN;varying vec3 vC;varying float vY;void main(){vec4 w=model*vec4(p,1.0);gl_Position=mvp*vec4(p,1.0);vN=mat3(model)*n;vC=c;vY=w.y;}`;
const fs=`precision mediump float;varying vec3 vN;varying vec3 vC;varying float vY;uniform float sun;void main(){vec3 L=normalize(vec3(-0.45,0.85,0.38));float d=max(dot(normalize(vN),L),0.0);float k=0.50+sun*0.34*d;gl_FragColor=vec4(vC*k,1.0);}`;
function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
const prog=gl.createProgram();gl.attachShader(prog,shader(gl.VERTEX_SHADER,vs));gl.attachShader(prog,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(prog));gl.useProgram(prog);
const loc={p:gl.getAttribLocation(prog,'p'),n:gl.getAttribLocation(prog,'n'),c:gl.getAttribLocation(prog,'c'),mvp:gl.getUniformLocation(prog,'mvp'),model:gl.getUniformLocation(prog,'model'),sun:gl.getUniformLocation(prog,'sun')};
const meshes=[];const palette={wall:[.91,.90,.85],trim:[.98,.97,.93],roof:[.43,.45,.47],glass:[.12,.20,.24],wood:[.27,.17,.10],floor:[.58,.56,.51],grass:[.22,.38,.18],path:[.48,.47,.43],green:[.14,.31,.12],dark:[.12,.13,.13],gold:[.68,.48,.19],furn:[.48,.32,.20],fabric:[.57,.52,.43],white:[.97,.96,.92],soil:[.30,.25,.18]};
function mesh(name,verts,color,floor=0,kind='structure',room=''){meshes.push({name,verts,color:palette[color]||color,floor,kind,room,buf:null,count:verts.length/9});}
function face(a,b,c,col,out){const nx=(b[1]-a[1])*(c[2]-a[2])-(b[2]-a[2])*(c[1]-a[1]),ny=(b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2]),nz=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);const l=Math.hypot(nx,ny,nz)||1;for(const v of [a,b,c])out.push(...v,nx/l,ny/l,nz/l,...col);}
function box(name,x,y,z,w,h,d,color,floor=0,kind='structure',room=''){const x0=x-w/2,x1=x+w/2,y0=y-h/2,y1=y+h/2,z0=z-d/2,z1=z+d/2,o=[];const q=[[[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],[[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0]],[[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0]],[[x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1]],[[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0]],[[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]]];for(const f of q){face(f[0],f[1],f[2],palette[color]||color,o);face(f[0],f[2],f[3],palette[color]||color,o);}mesh(name,o,color,floor,kind,room);}
function cylinder(name,x,y,z,r,h,color,floor=0,kind='trim',segments=12){const o=[],top=y+h/2,bot=y-h/2;for(let i=0;i<segments;i++){const a=i/segments*Math.PI*2,b=(i+1)/segments*Math.PI*2,p0=[x+Math.cos(a)*r,bot,z+Math.sin(a)*r],p1=[x+Math.cos(b)*r,bot,z+Math.sin(b)*r],p2=[x+Math.cos(b)*r,top,z+Math.sin(b)*r],p3=[x+Math.cos(a)*r,top,z+Math.sin(a)*r];face(p0,p1,p2,palette[color],o);face(p0,p2,p3,palette[color],o);face([x,top,z],p3,p2,palette[color],o);}mesh(name,o,color,floor,kind);}
function beam(name,x1,y1,z1,x2,y2,z2,r,color,floor=0){const dx=x2-x1,dy=y2-y1,dz=z2-z1,len=Math.hypot(dx,dy,dz);box(name,(x1+x2)/2,(y1+y2)/2,(z1+z2)/2,Math.max(r,len),r,r,color,floor,'trim');}
// Site and paved forecourt
box('site base',0,-.32,0,46,.25,61,'soil');box('front paving',0,-.17,27,43,.12,15,'path');box('house plinth',0,.18,0,35.4,.45,49.75,'floor');
// lawns, boundary walls and shrubs
box('north lawn',-21,-.02,0,5,.10,47,'grass');box('south lawn',21,-.02,0,5,.10,47,'grass');
for(const z of [-21,-14,-7,0,7,14,21]){box('boundary west',-22,.7,z,.5,1.4,.5,'white');box('boundary east',22,.7,z,.5,1.4,.5,'white');}
box('boundary rear',0,.7,-24,44,.5,.5,'white');box('boundary front left',-15,.7,24,14,.5,.5,'white');box('boundary front right',15,.7,24,14,.5,.5,'white');
// Main structure floor slabs and wall bands
for(let f=0;f<2;f++){const y=f*11.5;box('floor slab',0,y+.22,0,35.2,.44,49.5,'floor',f,'floor');
// exterior wall bands, separated into facade segments to make the cutaway visibly work
box('front wall',0,y+5.4,24.3,35.2,10.4,.55,'wall',f,'wall');box('rear wall',0,y+5.4,-24.3,35.2,10.4,.55,'wall',f,'wall');box('left wall',-17.3,y+5.4,0,.55,10.4,48.1,'wall',f,'wall');box('right wall',17.3,y+5.4,0,.55,10.4,48.1,'wall',f,'wall');
// pilasters on facade and sides
for(const x of [-15,-9,-3,3,9,15]){box('front pilaster',x,y+5.4,23.86,.65,10.5,.45,'trim',f,'trim');box('front capital',x,y+10.5,23.8,1.15,.55,.7,'trim',f,'trim');box('front base',x,y+.65,23.8,1.0,.75,.75,'trim',f,'trim');}
for(const z of [-18,-9,0,9,18]){box('side pilaster',17.0,y+5.3,z,.45,10.4,.65,'trim',f,'trim');box('side pilaster',-17.0,y+5.3,z,.45,10.4,.65,'trim',f,'trim');}
// windows and pediments on front and side (decorative inset glazing)
for(const x of [-11,-3.5,5,12]){box('front window glass',x,y+5.1,23.98,3.5,3.1,.12,'glass',f,'window');box('front sill',x,y+3.45,23.8,4.0,.25,.55,'trim',f);box('front lintel',x,y+6.85,23.8,4.1,.25,.55,'trim',f);box('window mullion',x,y+5.1,23.84,.12,3.1,.2,'wood',f,'window');box('window pediment',x,y+7.65,23.72,4.3,.28,.7,'trim',f);}
for(const z of [-15,-5,5,15]){box('side window glass',17.0,y+5.0,z,.12,3.1,3.8,'glass',f,'window');box('side window frame',16.8,y+6.8,z, .25,.22,4.2,'trim',f);}
}
// Interior partitions: conceptual layout, clearly labelled as indicative
const roomWalls=[[-8,5,0,0,16, .28,10.6], [8,5,0,0,16,.28,10.6], [0,5,-8,35,.28,0], [0,5,8,35,.28,0]];
for(let f=0;f<2;f++){const y=f*11.5;box('partition living dining',0,y+5.2,5,.22,10,17,'wall',f,'wall');box('partition bedroom',-7,y+5.2,-10,.22,10,25,'wall',f,'wall');box('partition service',8,y+5.2,-13,18,.22,10,'wall',f,'wall');}
// Ground-floor entrance door, porch arch represented by columns + arch bands
box('main entrance door',0,3.2,23.85,3.2,6.2,.18,'wood',0,'door','Entrance');for(const x of [-4.0,4.0]){cylinder('porch column',x,3.4,26.1,.48,6.8,'trim');box('porch base',x,.55,26.1,1.25,.6,1.25,'trim');box('porch capital',x,6.9,26.1,1.3,.55,1.3,'trim');}
box('porch arch header',0,7.2,26.1,8.8,.6,1.0,'trim');box('porch pediment base',0,8.0,26.1,10,.35,1.2,'trim');
// stairs between levels
for(let i=0;i<15;i++){const z=14-i*1.35;box('stair tread',-10,.45+i*.72,z,3.2,.25,1.35,'floor',0,'stair','Staircase');}
for(let i=0;i<15;i++){const z=14-i*1.35;box('upper stair tread',-10,11.95+i*.72,z,3.2,.25,1.35,'floor',1,'stair','Staircase');}
// Balcony and roof terrace slabs, parapets, balusters
box('front balcony slab',0,11.8,19.5,22,.55,7,'floor',1);box('front balcony rail',0,13.2,16.2,22,.35,.4,'trim',1);for(let x=-10.5;x<=10.5;x+=1.0)cylinder('baluster',x,12.55,16.2,.09,1.25,'trim',1,'trim',8);
box('roof terrace slab',0,23.55,0,35.5,.55,49.8,'floor',2);for(const z of [-24,24]){box('roof parapet',0,25.0,z,35.5,2.4,.45,'trim',2);}for(const x of [-17.5,17.5])box('roof parapet',x,25,0,.45,2.4,48.5,'trim',2);
box('roof stair tower',0,27.6,-4,12,7.4,12,'wall',2);box('roof stair tower cap',0,31.5,-4,13,.5,13,'trim',2);box('skylight frame',9,24.1,-10,6,.45,7,'trim',2);box('skylight glazing',9,24.38,-10,5,.12,6,'glass',2);
// Balustrade rooftop rail detail
for(let x=-16;x<=16;x+=1.3)cylinder('roof baluster',x,25.0,24,.09,1.1,'trim',2,'trim',8);
// Conceptual furniture: room blocks, bed, sofa, dining, kitchen, bath
function furnitureSet(f,y){
 box('living rug',-8,y+.12,12,9,.12,7,'fabric',f,'furniture','Living room');box('sofa',-8,y+1.0,14,7,1.7,2.1,'furn',f,'furniture','Living room');box('coffee table',-8,y+.65,9,3,.65,1.8,'wood',f,'furniture','Living room');
 box('dining table',4,y+1.3,7,7,.3,3.5,'wood',f,'furniture','Dining');for(const x of [1,7])for(const z of [5.4,8.6])box('dining chair',x,y+.8,z,1,.9,1,'fabric',f,'furniture','Dining');
 box('kitchen counter',11,y+1.5,-15,8,1.1,2,'wall',f,'furniture','Kitchen');box('kitchen island',8,y+1.5,-10,5,1.1,2,'wood',f,'furniture','Kitchen');
 box('bed',-10,y+.8,-14,6,1.2,7,'fabric',f,'furniture','Bedroom');box('wardrobe',-15,y+2,-19,2,4,6,'wood',f,'furniture','Bedroom');
 box('bath vanity',12,y+1,-20,3,1.6,2,'white',f,'furniture','Bathroom');box('bath tub',14,y+.8,-16,2,1.1,4,'white',f,'furniture','Bathroom');
}
furnitureSet(0,0);furnitureSet(1,11.5);
// Garden stepping path and stylized shrubs
for(let i=0;i<9;i++)box('garden stepping stone',-21,.08,-18+i*4,1.8,.16,2.4,'path');
for(let i=0;i<12;i++){const x=i%2?19:-19,z=-20+Math.floor(i/2)*7;cylinder('garden shrub',x,.65,z,.7,1.3,'green',0,'furniture',10);}
// shader buffers
for(const m of meshes){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(m.verts),gl.STATIC_DRAW);m.buf=b;}
function matMul(a,b){const o=new Float32Array(16);for(let r=0;r<4;r++)for(let c=0;c<4;c++)o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];return o;}
function perspective(fov,asp,n,f){const t=1/Math.tan(fov/2),o=new Float32Array(16);o[0]=t/asp;o[5]=t;o[10]=(f+n)/(n-f);o[11]=-1;o[14]=2*f*n/(n-f);return o;}
function lookAt(eye,center,up){let z=norm(sub(eye,center)),x=norm(cross(up,z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);}
const sub=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>{const l=Math.hypot(...a)||1;return a.map(v=>v/l)};
let target=[0,11,0],yaw=.72,pitch=.42,dist=78,view='Exterior',level=0,cut=7.7,sun=0.8,walk=false,auto=false,labels=true,furniture=true,drag=null,lastX=0,lastY=0,keys={};
const cutCache=new Map();
function clippedWall(m,maxY){const key=m.name+'|'+maxY.toFixed(1);if(cutCache.has(key))return cutCache.get(key);const src=m.verts,out=[];for(let i=0;i<src.length;i+=27){let poly=[];for(let j=0;j<3;j++)poly.push(Array.from(src.slice(i+j*9,i+(j+1)*9)));const clipped=[];for(let j=0;j<poly.length;j++){const a=poly[j],b=poly[(j+1)%poly.length],ia=a[1]<=maxY,ib=b[1]<=maxY;if(ia)clipped.push(a);if(ia!==ib){const t=(maxY-a[1])/(b[1]-a[1]);clipped.push(a.map((v,k)=>v+(b[k]-v)*t));}}for(let j=1;j<clipped.length-1;j++)out.push(...clipped[0],...clipped[j],...clipped[j+1]);}const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(out),gl.STATIC_DRAW);const result={buf,count:out.length/9};cutCache.set(key,result);if(cutCache.size>120){const first=cutCache.keys().next().value;gl.deleteBuffer(cutCache.get(first).buf);cutCache.delete(first);}return result;}
function eye(){return [target[0]+dist*Math.sin(yaw)*Math.cos(pitch),target[1]+dist*Math.sin(pitch),target[2]+dist*Math.cos(yaw)*Math.cos(pitch)];}
function resize(){const dpr=Math.min(devicePixelRatio||1,2),w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);gl.viewport(0,0,canvas.width,canvas.height);}new ResizeObserver(resize).observe(canvas);resize();
function draw(){gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);gl.clearColor(.76,.82,.86,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);const asp=canvas.width/canvas.height;let cam=eye();if(view==='Plan'){cam=[target[0],level===2?43:level*11.5+34,target[2]+.01];}if(walk){cam=[target[0],level*11.5+5.8,target[2]];}
const aim=walk?[target[0]+Math.sin(yaw),level*11.5+5.8+Math.sin(pitch),target[2]+Math.cos(yaw)]:target;const V=lookAt(cam,aim, [0,1,0]),P=perspective(view==='Plan'?0.85:.72,asp,.1,240),M=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),mvp=matMul(P,V);gl.uniformMatrix4fv(loc.mvp,false,mvp);gl.uniformMatrix4fv(loc.model,false,M);gl.uniform1f(loc.sun,sun);
for(const m of meshes){if(view==='Plan'&&(m.floor!==level||m.floor===2&&level!==2))continue;if(view==='Dollhouse'&&m.floor>level)continue;if(view==='Exterior'&&m.floor===2&&m.kind==='furniture')continue;if(!furniture&&m.kind==='furniture')continue;if(m.floor>level&&view!=='Exterior'&&view!=='Plan'&&view!=='Dollhouse')continue;
 let drawBuf=m.buf,drawCount=m.count;if(view==='Dollhouse'&&m.kind==='wall'&&m.floor===level){const cutMesh=clippedWall(m,level*11.5+cut);drawBuf=cutMesh.buf;drawCount=cutMesh.count;}if(!drawCount)continue;gl.bindBuffer(gl.ARRAY_BUFFER,drawBuf);const stride=9*4;gl.enableVertexAttribArray(loc.p);gl.vertexAttribPointer(loc.p,3,gl.FLOAT,false,stride,0);gl.enableVertexAttribArray(loc.n);gl.vertexAttribPointer(loc.n,3,gl.FLOAT,false,stride,12);gl.enableVertexAttribArray(loc.c);gl.vertexAttribPointer(loc.c,3,gl.FLOAT,false,stride,24);gl.drawArrays(gl.TRIANGLES,0,drawCount);
}
if(auto&&!walk&&view==='Exterior')yaw+=.0015;requestAnimationFrame(draw);}
requestAnimationFrame(draw);
canvas.addEventListener('pointerdown',e=>{drag=e.button===2?'pan':'orbit';lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;if(drag==='orbit'){yaw-=dx*.006;pitch=Math.max(-.15,Math.min(1.35,pitch+dy*.005));}else{target[0]-=dx*.035;target[2]+=dy*.035;}});canvas.addEventListener('contextmenu',e=>e.preventDefault());canvas.addEventListener('wheel',e=>{dist=Math.max(28,Math.min(130,dist+e.deltaY*.045));},{passive:true});
function setView(v){view=v;walk=v==='Walk';document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===v));document.getElementById('viewName').textContent=v; if(v==='Plan'){pitch=1.45;dist=75;}else if(v==='Exterior'){pitch=.42;dist=78;}else if(v==='Dollhouse'){pitch=.75;dist=68;} }
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
document.getElementById('level').addEventListener('change',e=>{level=+e.target.value;target[1]=level===2?25:level*11.5+5;document.getElementById('levelName').textContent=e.target.selectedOptions[0].text;renderRooms();});
document.getElementById('cut').addEventListener('input',e=>{cut=+e.target.value;document.getElementById('cutValue').textContent=cut.toFixed(1)+' ft';});
document.getElementById('sun').addEventListener('input',e=>{sun=+e.target.value;const mins=Math.round((7+sun*11.5)*60),hh=Math.floor(mins/60),mm=mins%60,period=hh>=12?'PM':'AM';document.getElementById('sunValue').textContent=((hh%12)||12)+':'+String(mm).padStart(2,'0')+' '+period;});
document.getElementById('furnitureToggle').addEventListener('change',e=>furniture=e.target.checked);document.getElementById('labelsToggle').addEventListener('change',e=>{labels=e.target.checked;document.getElementById('labels').hidden=!labels;});document.getElementById('autoToggle').addEventListener('change',e=>auto=e.target.checked);
document.getElementById('reset').addEventListener('click',()=>{yaw=.72;pitch=.42;dist=78;target=[0,11,0];setView('Exterior');});
document.getElementById('shot').addEventListener('click',()=>{const a=document.createElement('a');a.download='villa-view.png';a.href=canvas.toDataURL('image/png');a.click();});
document.querySelectorAll('[data-angle]').forEach(b=>b.addEventListener('click',()=>{const a=b.dataset.angle;view='Exterior';walk=false;pitch=a==='Top'?1.48:.35;yaw=({Front:0,Right:Math.PI/2,Back:Math.PI,Left:-Math.PI/2,Top:0})[a];if(a==='Top')dist=90;else dist=78;document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x.dataset.view==='Exterior'));}));
const roomData=[['Living room','Ground floor','Approx. 18 × 16 ft','Indicative layout'],['Dining hall','Ground floor','Double-height concept','Indicative layout'],['Kitchen','Ground floor','Approx. 12 × 10 ft','Indicative layout'],['Bedroom 1','Ground floor','Approx. 14 × 13 ft','Indicative layout'],['Bathroom','Ground floor','Approx. 8 × 7 ft','Indicative layout'],['Bedroom 2','First floor','Approx. 14 × 13 ft','Proposed 2BHK'],['Bedroom 3','First floor','Approx. 14 × 13 ft','Proposed 2BHK'],['Family lounge','First floor','Approx. 16 × 14 ft','Proposed 2BHK'],['Roof terrace','Roof','Open terrace','Conceptual']];
function renderRooms(){const list=document.getElementById('rooms'),mini=document.getElementById('miniMap');list.innerHTML='';mini.innerHTML='';const f=level===0?['Living room','Dining hall','Kitchen','Bedroom 1','Bathroom']:level===1?['Bedroom 2','Bedroom 3','Family lounge']:['Roof terrace'];for(const name of f){const d=roomData.find(x=>x[0]===name);const focus=()=>{target=[name.includes('Kitchen')?10:name.includes('Bedroom')?-10:0,level*11.5+4,name.includes('Bedroom')?-12:name.includes('Dining')?5:12];dist=24;setView('Dollhouse');document.getElementById('selectedRoom').textContent=`${d[0]} · ${d[1]} · ${d[2]} · ${d[3]}`;};const b=document.createElement('button');b.className='room';b.innerHTML=`<span>${name}</span><small>${d[2]}</small>`;b.onclick=focus;list.appendChild(b);const mb=document.createElement('button');mb.className='mini-room';mb.textContent=name;mb.onclick=focus;mini.appendChild(mb);}}
renderRooms();
window.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName))return;keys[e.key.toLowerCase()]=true;if(e.key==='1')setView('Exterior');if(e.key==='2')setView('Dollhouse');if(e.key==='3')setView('Plan');if(e.key==='4')setView('Walk');if(e.key==='Escape')setView('Exterior');});window.addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
function walkStep(){if(walk){const speed=keys.shift?.12:.055;const fwd=(keys.w||keys.arrowup?1:0)-(keys.s||keys.arrowdown?1:0),side=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);target[0]+=Math.sin(yaw)*fwd*speed+Math.cos(yaw)*side*speed;target[2]+=Math.cos(yaw)*fwd*speed-Math.sin(yaw)*side*speed;target[0]=Math.max(-16,Math.min(16,target[0]));target[2]=Math.max(-23,Math.min(23,target[2]));}requestAnimationFrame(walkStep);}walkStep();
// Mobile touch movement joystick
let joy=document.getElementById('joystick');joy.addEventListener('touchstart',e=>{e.preventDefault();const t=e.touches[0],r=joy.getBoundingClientRect();joy.dataset.x=t.clientX-r.left-r.width/2;joy.dataset.y=t.clientY-r.top-r.height/2;},{passive:false});joy.addEventListener('touchmove',e=>{e.preventDefault();const t=e.touches[0],r=joy.getBoundingClientRect(),dx=t.clientX-r.left-r.width/2,dy=t.clientY-r.top-r.height/2;keys.w=dy<-8;keys.s=dy>8;keys.a=dx<-8;keys.d=dx>8;},{passive:false});joy.addEventListener('touchend',()=>{keys={};});
status.textContent='Independent conceptual model · WebGL active';
})();
