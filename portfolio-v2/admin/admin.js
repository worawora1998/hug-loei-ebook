(() => {
"use strict";
const OWNER="worawora1998", REPO="hug-loei-ebook", BRANCH="portfolio-v2-site";
const CONTENT="portfolio-v2/index.html", UPLOAD_DIR="portfolio-v2/assets/uploads/";
const endpoint="https://api.github.com/repos/"+OWNER+"/"+REPO+"/contents/";
const $=id=>document.getElementById(id);
const overlay=$("authOverlay"), dashboard=$("dashboard"), panel=$("panel"), status=$("status");
let access="", snapshot="", fileSha="", db=null, dirty=false, busy=false, current="overview", currentCategory="poster";
const defaults={general:[[1,300],[5,1400],[10,2700],[20,5200],[30,7500]],concert:[[1,600],[2,1150],[3,1650],[4,2100],[5,2550],[6,3000]]};
function elem(tag,cls,text){let x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=String(text);return x}
function append(parent,...children){children.forEach(c=>{if(c!==null&&c!==undefined)parent.append(c)});return parent}
function button(label,action,cls="mini-btn"){const b=elem("button",cls,label);b.type="button";b.addEventListener("click",action);return b}
function setStatus(message,type=""){status.textContent=message;status.className="statusbar"+(type?" is-"+type:"")}
function pending(){dirty=true;setStatus("มีการแก้ไขที่ยังไม่ได้เผยแพร่ — กดปุ่ม “เผยแพร่การเปลี่ยนแปลง” เมื่อตรวจทานเรียบร้อย")}
function imgSrc(id){return /^assets\/uploads\/[a-z0-9_./-]+\.(png|jpe?g|webp)$/i.test(id)? "https://raw.githubusercontent.com/worawora1998/hug-loei-ebook/portfolio-v2-site/portfolio-v2/"+id : "https://drive.google.com/thumbnail?id="+encodeURIComponent(id)+"&sz=w420"}
function imageNode(id,label){let im=elem("img");im.alt=label||"ภาพผลงาน";im.loading="lazy";im.decoding="async";im.src=imgSrc(id);im.addEventListener("error",()=>{if(!im.dataset.retry&&!id.startsWith("assets/")){im.dataset.retry="1";im.src="https://lh3.googleusercontent.com/d/"+encodeURIComponent(id)+"=w420"}});return im}
function field(labelText,value,onInput,area=false,trackChange=true){let w=elem("div","input-wrap"),l=elem("label",null,labelText),i=elem(area?"textarea":"input");if(!area)i.type="text";i.value=value||"";i.addEventListener("input",()=>{onInput(i.value);if(trackChange)pending()});append(w,l,i);return w}
function heading(title,small){let wrap=elem("div","section-band");append(wrap,elem("h2",null,title),elem("span","chip",small||""));return wrap}
function box(title,extra=""){const b=elem("div","panel-card "+extra);if(title)append(b,elem("h2",null,title));return b}
function refresh(){if(!db)return; const labels={
overview:["YOUR CREATIVE CONTROL CENTER","ภาพรวมเว็บไซต์","รูปผลงาน หมวดงาน และการตั้งค่าต่าง ๆ อยู่ที่นี่"],
artworks:["01 / CONTENT LIBRARY","จัดการผลงาน","เพิ่มภาพ ลบออกจากแกลเลอรี จัดลำดับ และแก้ชื่อหมวดงาน"],
featured:["02 / FEATURED ART","งานเด่นหน้าแรก","เลือกโปสเตอร์ 6 ภาพที่ต้องการแสดงบนหน้าแรก"],
pricing:["03 / PACKAGES","ราคาแพ็กเกจ","ปรับราคาโดยไม่ต้องแก้โค้ด และแบ่ง General Ads / Concert Ads ชัดเจน"],
settings:["04 / WEBSITE SETTINGS","ข้อมูลเว็บไซต์","แก้ข้อความแนะนำตัวและ LINE ที่ลูกค้าใช้ติดต่อ"]
};let v=labels[current];$("sectionEyebrow").textContent=v[0];$("sectionTitle").textContent=v[1];$("sectionHelp").textContent=v[2];panel.replaceChildren();
document.querySelectorAll("[data-tab]").forEach(x=>x.classList.toggle("active",x.dataset.tab===current));
if(current==="overview")renderOverview();if(current==="artworks")renderArtworks();if(current==="featured")renderFeatured();if(current==="pricing")renderPricing();if(current==="settings")renderSettings()
}
function downloadBackup(){
if(!db)return;try{const blob=new Blob([JSON.stringify(db,null,2)],{type:"application/json;charset=utf-8"}),href=URL.createObjectURL(blob),a=elem("a");a.href=href;a.download="worachit-portfolio-backup-"+new Date().toISOString().slice(0,10)+".json";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),1000);setStatus("ดาวน์โหลดสำเนาข้อมูลเรียบร้อย ข้อมูลรูปที่จัดเก็บใน GitHub และ Drive ยังคงอยู่","success")}catch(e){setStatus("สำรองข้อมูลไม่สำเร็จ: "+e.message,"error")}
}
async function reloadData(){
if(busy)return;if(dirty&&!confirm("มีการแก้ไขที่ยังไม่ได้เผยแพร่ หากโหลดใหม่จะสูญเสียข้อมูลที่ยังไม่ได้บันทึก ดำเนินการต่อ?"))return;
busy=true;setStatus("กำลังโหลดข้อมูลล่าสุดจาก GitHub...");try{await loadData();refresh();setStatus("โหลดข้อมูลล่าสุดเรียบร้อย","success")}catch(e){setStatus("โหลดข้อมูลไม่ได้: "+e.message,"error")}finally{busy=false}
}
function totalWorks(){return Object.values(db.groups||{}).reduce((n,arr)=>n+arr.length,0)}
function renderOverview(){
let cards=elem("div","panel-grid"),stats=[
["ผลงานทั้งหมด",totalWorks(),"accent"],["หมวดงานทั้งหมด",(db.categories||[]).length,""],["งานเด่นหน้าแรก",(db.homePosterImages||[]).length,"lime"]];
stats.forEach(([label,n,variant])=>{let c=box(label,variant);append(c,elem("div","big-number",n),elem("p",null,"แก้ไขและจัดการผ่านระบบหลังบ้านได้"));cards.append(c)});
let guide=box("เริ่มใช้งานอย่างไร?","panel-wide");append(guide,elem("p",null,"เลือก “จัดการผลงาน” เพื่อเพิ่มรูปเข้าแต่ละหมวด เลือก “งานเด่นหน้าแรก” เพื่อเปลี่ยน 6 ภาพแรก แล้วกดปุ่มเผยแพร่ด้านบน"),elem("p",null,"ระบบจะบันทึกการเปลี่ยนแปลงไว้ใน GitHub พร้อมประวัติย้อนหลัง และ Render จะเผยแพร่เว็บไซต์ตามการตั้งค่าปัจจุบัน"));let acts=elem("div","inline-actions");append(acts,button("เพิ่มภาพผลงาน ↗",()=>switchTab("artworks"),"btn btn-blue"),button("แก้ราคาแพ็กเกจ ↗",()=>switchTab("pricing"),"btn btn-lime"));guide.append(acts);let utils=elem("div","inline-actions");append(utils,button("สำรองข้อมูล JSON ↓",downloadBackup,"btn btn-ghost"),button("โหลดข้อมูลล่าสุด ↻",reloadData,"btn btn-ghost"));guide.append(utils);cards.append(guide);
let warning=box("ข้อควรรู้","panel-wide");append(warning,elem("p",null,"เผยแพร่เฉพาะการเปลี่ยนแปลงที่ต้องการจริง ๆ เพราะการกดแต่ละครั้งสร้าง Commit ใหม่ใน GitHub"),elem("p",null,"การเอาผลงานออกจากหมวดจะไม่ลบไฟล์ภาพต้นฉบับ ส่วนภาพที่อัปโหลดใหม่จะถูกเก็บในโฟลเดอร์ assets/uploads ของ Repository"));cards.append(warning);panel.append(cards)
}

function renderArtworks(){
let stack=elem("div","stack"),top=box("หมวดผลงาน");let bar=elem("div","form-row"),catWrap=elem("div","input-wrap");
append(catWrap,elem("label",null,"เลือกหมวดผลงาน"));let choose=elem("select");
(db.categories||[]).forEach(c=>{let opt=elem("option",null,c.title+" · "+c.en);opt.value=c.key;choose.append(opt)});
if(!db.groups[currentCategory])currentCategory=db.categories[0].key;choose.value=currentCategory;
choose.addEventListener("change",()=>{currentCategory=choose.value;refresh()});catWrap.append(choose);
let cat=db.categories.find(c=>c.key===currentCategory);
let count=box("จำนวนรูป");append(count,elem("div","big-number",(db.groups[currentCategory]||[]).length));
append(bar,catWrap,count);top.append(bar);
let metadata=elem("div","form-row");append(metadata,field("ชื่อหมวดภาษาไทย",cat.title,v=>cat.title=v),field("ชื่อหมวดภาษาอังกฤษ",cat.en,v=>cat.en=v));append(top,metadata,field("คำอธิบายหมวด",cat.desc,v=>cat.desc=v,true));stack.append(top);
let upload=box("เพิ่มภาพใหม่","upload-card");
append(upload,elem("p",null,"เลือกภาพจากคอมพิวเตอร์ JPG / PNG / WebP ขนาดไม่เกิน 5 MB แล้วกดอัปโหลด"));
let files=elem("input");files.type="file";files.accept="image/png,image/jpeg,image/webp";
let name=field("ชื่อผลงาน (ไม่ใส่ก็ได้)", "",()=>{},false,false);let nameInput=name.querySelector("input");
append(upload,files,name,button("อัปโหลดรูปภาพ ↗",async()=>uploadImage(files.files[0],nameInput.value),"btn btn-blue"));
stack.append(upload);
let section=box("จัดเรียงภาพ — ลากได้เลย");
append(section,elem("p","helper","จับที่ปุ่ม ↕ บนภาพ แล้วลากไปวางตำแหน่งใหม่ได้ทั้งเมาส์และหน้าจอสัมผัส หรือใช้ “ขึ้นแรก” เพื่อย้ายทันที"));
const tools=elem("div","v17-sortbar"),filter=elem("input","v17-search");filter.placeholder="ค้นหาชื่อผลงาน...";filter.setAttribute("aria-label","ค้นหาผลงาน");
tools.append(filter,elem("span","chip",(db.groups[currentCategory]||[]).length+" ภาพ"));section.append(tools);
let grid=elem("div","art-list v17-sortgrid");
function draw(query=""){
 grid.replaceChildren();let values=db.groups[currentCategory]||[];let found=0;
 values.forEach((it,i)=>{
 if(query&&!(it.name||"").toLowerCase().includes(query.toLowerCase()))return;found++;
 let card=elem("article","art-card v17-dragcard");card.dataset.artIndex=i;card.draggable=true;
 let fig=elem("figure");fig.append(imageNode(it.id,it.name));
 let body=elem("div","art-card-body");append(body,elem("span","art-card-name",it.name||"ภาพที่ "+(i+1)));
 let n=elem("span","v17-sequence","ลำดับ "+(i+1));body.append(n);
 let actions=elem("div","art-card-actions"),handle=button("↕ ลากจัดเรียง",()=>{},"mini-btn v17-draghandle");
 handle.setAttribute("aria-label","ลากรูปที่ "+(i+1)+" เพื่อจัดเรียง");handle.dataset.dragIndex=i;
 append(actions,handle,button("ขึ้นแรก",()=>reorderArt(i,0),"mini-btn marked"),
 button("แก้ชื่อ",()=>{let name=prompt("ชื่อผลงานใหม่",it.name||"");if(name!==null&&name.trim()){it.name=name.trim().slice(0,180);pending();refresh()}}),
 button("งานเด่น",()=>{setSelected(it);pending();refresh()},"mini-btn"),
 button("นำออก",()=>removeArtwork(i),"mini-btn danger"));
 body.append(actions);append(card,fig,body);grid.append(card);
 card.addEventListener("dragstart",e=>{dragFrom=i;card.classList.add("is-moving");if(e.dataTransfer){e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",String(i))}});
 card.addEventListener("dragend",()=>{dragFrom=-1;grid.querySelectorAll(".is-moving,.drop-target").forEach(x=>x.classList.remove("is-moving","drop-target"))});
 card.addEventListener("dragover",e=>{e.preventDefault();card.classList.add("drop-target");if(e.dataTransfer)e.dataTransfer.dropEffect="move"});
 card.addEventListener("dragleave",()=>card.classList.remove("drop-target"));
 card.addEventListener("drop",e=>{e.preventDefault();let from=dragFrom>=0?dragFrom:Number(e.dataTransfer?.getData("text/plain"));dragFrom=-1;reorderArt(from,i)});
 });
 if(!found)grid.append(elem("p","helper","ไม่พบผลงานที่ค้นหา"));
}
let dragFrom=-1;draw();filter.addEventListener("input",()=>draw(filter.value));
section.append(grid);stack.append(section);panel.append(stack);
let active=-1;
grid.addEventListener("pointerdown",e=>{let handle=e.target.closest?.(".v17-draghandle");if(!handle)return;active=Number(handle.dataset.dragIndex);handle.setPointerCapture?.(e.pointerId);grid.classList.add("dragging-active")});
grid.addEventListener("pointermove",e=>{if(active<0)return;grid.querySelectorAll(".drop-target").forEach(x=>x.classList.remove("drop-target"));let target=document.elementFromPoint?.(e.clientX,e.clientY)?.closest?.("[data-art-index]");if(target)target.classList.add("drop-target")});
grid.addEventListener("pointerup",e=>{if(active<0)return;let from=active;active=-1;grid.classList.remove("dragging-active");let target=document.elementFromPoint?.(e.clientX,e.clientY)?.closest?.("[data-art-index]");grid.querySelectorAll(".drop-target").forEach(x=>x.classList.remove("drop-target"));if(target)reorderArt(from,Number(target.dataset.artIndex))});
grid.addEventListener("pointercancel",()=>{active=-1;grid.classList.remove("dragging-active")});
}
function reorderArt(from,to){
let works=db.groups[currentCategory];if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=works.length||to>=works.length||from===to)return;
let [it]=works.splice(from,1);works.splice(to,0,it);pending();refresh()
}
function move(i,delta){let a=db.groups[currentCategory];let j=i+delta;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];pending();refresh()}
function setSelected(it){let cat=db.categories.find(x=>x.key===currentCategory);db.selected=db.selected||[];let found=db.selected.findIndex(x=>x.key===currentCategory);let value={key:currentCategory,id:it.id,title:cat.title};if(found>=0)db.selected[found]=value;else db.selected.push(value);setStatus("ตั้งเป็นตัวแทนหมวด “"+cat.title+"” แล้ว อย่าลืมกดเผยแพร่");}
function removeArtwork(index){let a=db.groups[currentCategory],it=a[index];if(!confirm("นำ “"+it.name+"” ออกจากหน้าแกลเลอรี? ไฟล์ต้นฉบับจะไม่ถูกลบ"))return;a.splice(index,1);
db.homePosterImages=(db.homePosterImages||[]).filter(x=>x.id!==it.id);
db.selected=(db.selected||[]).filter(x=>x.id!==it.id);
pending();refresh()
}
function allArtworks(){let out=[];for(const c of db.categories){for(const it of db.groups[c.key]||[])out.push({id:it.id,name:it.name||c.title,label:c.title+" · "+(it.name||it.id).slice(0,50)})}return out}
function renderFeatured(){
let stack=elem("div","stack"),c=box("เลือกผลงานหน้าแรก");append(c,elem("p",null,"เลือก 6 ภาพที่แสดงบนหน้าแรก โดยเลือกจากทุกหมวดงาน (อาจเลือกภาพเดียวกันได้ แต่แนะนำให้เลือกไม่ซ้ำกัน)"));let works=allArtworks(),now=db.homePosterImages||[];
for(let i=0;i<6;i++){let r=elem("div","feature-row");append(r,elem("b",null,String(i+1).padStart(2,"0")));let cur=now[i]||works[0]||{id:"",name:""};r.append(imageNode(cur.id,cur.name));let select=elem("select");works.forEach(w=>{let o=elem("option",null,w.label);o.value=w.id;select.append(o)});if(!works.some(x=>x.id===cur.id)&&cur.id){let o=elem("option",null,cur.name+" (เดิม)");o.value=cur.id;select.append(o)}select.value=cur.id;select.addEventListener("change",()=>{let art=works.find(x=>x.id===select.value);if(!art)return;while(now.length<6)now.push(art);now[i]={id:art.id,name:art.name};db.homePosterImages=now;pending();refresh()});r.append(select);c.append(r)}
append(c,elem("p","helper","การเลือกใหม่นี้ยังไม่ขึ้นเว็บจนกว่าจะกด “เผยแพร่การเปลี่ยนแปลง”"));stack.append(c);panel.append(stack)
}
function renderPricing(){
if(!db.pricePackages)db.pricePackages=JSON.parse(JSON.stringify(defaults));
let layout=elem("div","price-groups");const def={general:["General Ads","ภาพโฆษณา ร้านค้า และสื่อออนไลน์"],concert:["Concert Ads","โปสเตอร์คอนเสิร์ตและภาพโปรโมต"]};
for(const type of ["general","concert"]){let c=elem("section","price-card "+type);append(c,elem("h3",null,def[type][0]),elem("p","helper",def[type][1]));let rows=db.pricePackages[type]||defaults[type];rows.forEach((p,i)=>{let line=elem("div","price-item"),label=elem("label",null,p[0]+" ภาพ"),inp=elem("input");inp.type="number";inp.min="1";inp.max="10000000";inp.step="1";inp.value=p[1];inp.setAttribute("aria-label","ราคา "+def[type][0]+" "+p[0]+" ภาพ");inp.addEventListener("input",()=>{let v=Number(inp.value);p[1]=inp.value.trim()!==""&&Number.isSafeInteger(v)&&v>0?v:NaN;pending();if(!Number.isSafeInteger(p[1]))setStatus("กรุณาใส่ราคาเป็นจำนวนเต็มมากกว่า 0 ก่อนเผยแพร่","error")});append(line,label,inp);c.append(line)});layout.append(c)}panel.append(layout);panel.append(append(box("คำแนะนำ"),elem("p","helper","ราคาทั้งหมดเป็นเงินบาท ระบบคำนวณแสดงราคาและจำนวนภาพจากข้อมูลนี้โดยอัตโนมัติ หลังบันทึกแล้ว Render จะเผยแพร่แพ็กเกจใหม่")))
}
function renderSettings(){
db.siteSettings=db.siteSettings||{};let s=db.siteSettings;
let wrap=elem("div","settings-grid"),intro=box("ข้อมูลแนะนำตัว"),contacts=box("ช่องทางติดต่อ");append(intro,
field("คำอธิบายหน้าแรก",s.heroDescription||"ผมสุข วรชิต ภูลายยาว นักออกแบบกราฟิกฟรีแลนซ์ รับออกแบบโปสเตอร์คอนเสิร์ต งานโฆษณา และสื่อออนไลน์",v=>s.heroDescription=v,true),
field("คำอธิบายหน้าเกี่ยวกับฉัน",s.aboutDescription||"ผมทำงานด้านกราฟิกดีไซน์มาตั้งแต่ปี 2017 โดยเน้นโปสเตอร์คอนเสิร์ต งานอีเวนต์ ภาพโฆษณา และสื่อประชาสัมพันธ์ รับงานออนไลน์ทั้งในประเทศไทยและต่างประเทศ",v=>s.aboutDescription=v,true));
append(contacts,field("LINE ID สำหรับรับงาน",s.lineId||"worachit98",v=>s.lineId=v),elem("p","helper","เปลี่ยน LINE ID เฉพาะเมื่อคุณตรวจสอบลิงก์จริงแล้ว ระบบจะเปลี่ยนปุ่ม LINE หลักและข้อความในหน้าเกี่ยวกับ"));
let profile=box("รูปโปรไฟล์ของฉัน");let currentPhoto=s.profileImageId||"1xdVr4OBE2O1dKQz724wRGNm4tKW7pzf8";let preview=imageNode(currentPhoto,"รูปโปรไฟล์ปัจจุบัน");preview.className="profile-preview";append(profile,preview,elem("p","helper","ใช้รูปต้นฉบับที่มีอยู่ หรือเปลี่ยนเป็น JPG / PNG / WebP จากเครื่อง ไฟล์ไม่เกิน 5 MB"));let uploadPicker=elem("input");uploadPicker.type="file";uploadPicker.accept="image/jpeg,image/png,image/webp";let change=button("เปลี่ยนรูปโปรไฟล์ ↗",async()=>uploadImage(uploadPicker.files[0],"รูปโปรไฟล์","profile"),"btn btn-blue");append(profile,uploadPicker,change);append(wrap,intro,contacts,profile);panel.append(wrap)
}
function switchTab(name){current=name;setStatus("");refresh();window.scrollTo({top:0,behavior:"auto"})}
function utf8Base64(text){let bytes=new TextEncoder().encode(text),binary="";for(let i=0;i<bytes.length;i+=16384)binary+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(binary)}
function fromBase64(s){let raw=atob(s.replace(/\s/g,""));let a=Uint8Array.from(raw,c=>c.charCodeAt(0));return new TextDecoder("utf-8",{fatal:true}).decode(a)}
async function github(path,options={}){const resp=await fetch("https://api.github.com/"+path,{...options,headers:{"Authorization":"Bearer "+access,"Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","Content-Type":"application/json",...(options.headers||{})},cache:"no-store"});let json;try{json=await resp.json()}catch{json={}}if(!resp.ok)throw Error("GitHub "+resp.status+": "+(json.message||"เชื่อมต่อไม่สำเร็จ"));return json}
async function loadData(){let file=await github("repos/"+OWNER+"/"+REPO+"/contents/"+CONTENT+"?ref="+encodeURIComponent(BRANCH));if(!file.content)throw Error("GitHub ไม่ส่งเนื้อหา index.html");let source=fromBase64(file.content);let m=source.match(/<script id="portfolio-data" type="application\/json">([\s\S]*?)<\/script>/);if(!m)throw Error("ไม่พบข้อมูล Portfolio ใน index.html");let data=JSON.parse(m[1]);if(!data.groups||!data.categories)throw Error("โครงสร้างข้อมูลไม่ถูกต้อง");snapshot=source;fileSha=file.sha;db=data;dirty=false}
async function login(){if(busy)return;if(window.WorachitPin&&!(await window.WorachitPin.guard()))return;let input=$("token"),candidate=input.value.trim();$("loginError").textContent="";if(!candidate){$("loginError").textContent="โปรดวาง GitHub Token ก่อน";return}access=candidate;input.value="";busy=true;$("loginBtn").disabled=true;$("loginBtn").textContent="กำลังตรวจสอบสิทธิ์...";try{let me=await github("user");if(String(me.login||"").toLowerCase()!==OWNER.toLowerCase())throw Error("บัญชีนี้ไม่ใช่เจ้าของเว็บไซต์ กรุณาใช้ Token ของ "+OWNER);await loadData();if(window.WorachitPin&&!window.WorachitPin.has()){if(!(await window.WorachitPin.setup()))throw Error("กรุณาตั้ง PIN 6 หลักสำหรับอุปกรณ์นี้ก่อนใช้งาน")}overlay.hidden=true;dashboard.hidden=false;$("connectedUser").textContent="@"+me.login;switchTab("overview");setStatus("เชื่อมต่อสำเร็จ พร้อมจัดการเว็บไซต์","success")}catch(e){access="";$("loginError").textContent=e.message||"เข้าสู่ระบบไม่ได้"}finally{busy=false;$("loginBtn").disabled=false;$("loginBtn").textContent="เชื่อมต่อ GitHub ↗"}}
async function publish(){if(busy)return;if(!dirty){setStatus("ยังไม่มีการแก้ไขใหม่ที่ต้องเผยแพร่");return}
const line=String(db.siteSettings?.lineId||"worachit98");if(!/^[a-zA-Z0-9_.~-]{2,100}$/.test(line)){setStatus("รูปแบบ LINE ID ไม่ถูกต้อง","error");return}
for(const key of ["general","concert"]){let rows=db.pricePackages?.[key]||defaults[key];if(rows.some(x=>!Number.isSafeInteger(x[1])||x[1]<=0)){setStatus("กรุณาตรวจสอบราคาแพ็กเกจทั้งหมด","error");return}}
if(!confirm("เผยแพร่การแก้ไขขึ้นเว็บไซต์จริงผ่าน GitHub?"))return;busy=true;$("publishBtn").disabled=true;$("publishBtn").textContent="กำลังเผยแพร่...";
try{db.categories.forEach(x=>x.count=(db.groups[x.key]||[]).length);let json=JSON.stringify(db).replace(/</g,"\\u003c");let re=/(<script id="portfolio-data" type="application\/json">)[\s\S]*?(<\/script>)/;if(!re.test(snapshot))throw Error("ไม่พบจุดเก็บข้อมูล");
let updated=snapshot.replace(re,(_,a,b)=>a+json+b);
const reply=await github("repos/"+OWNER+"/"+REPO+"/contents/"+CONTENT,{method:"PUT",body:JSON.stringify({message:"Update portfolio content via WORACHIT ADMIN",content:utf8Base64(updated),sha:fileSha,branch:BRANCH})});
snapshot=updated;fileSha=reply.content?.sha||fileSha;dirty=false;setStatus("เผยแพร่ข้อมูลไป GitHub เรียบร้อย! เว็บไซต์จะอ่านข้อมูลล่าสุดจาก GitHub โดยตรง อาจใช้เวลาสั้น ๆ ในการอัปเดต","success");
}catch(e){setStatus("เผยแพร่ไม่สำเร็จ: "+e.message+" — หากมีคนแก้โค้ดพร้อมกัน ให้รีโหลดหน้า Admin ก่อนบันทึก","error")}finally{busy=false;$("publishBtn").disabled=false;$("publishBtn").textContent="เผยแพร่การเปลี่ยนแปลง ↗"}}
async function uploadImage(file,name,target="artwork"){if(busy)return;if(!file){setStatus("กรุณาเลือกไฟล์ภาพก่อน","error");return}
const allowed={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};const ext=allowed[file.type];if(!ext){setStatus("รองรับเฉพาะ JPG, PNG หรือ WebP","error");return}if(file.size>5*1024*1024){setStatus("ไฟล์ใหญ่เกิน 5 MB กรุณาบีบอัดก่อนอัปโหลด","error");return}if(file.size===0){setStatus("ไฟล์ว่าง","error");return}
busy=true;setStatus("กำลังอัปโหลดภาพไป GitHub...");try{const binary=await new Promise((resolve,reject)=>{let reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(",")[1]);reader.onerror=()=>reject(Error("อ่านไฟล์ไม่ได้"));reader.readAsDataURL(file)});
const filename=Date.now()+"-"+Math.random().toString(36).slice(2,10)+"."+ext,path=UPLOAD_DIR+filename;
await github("repos/"+OWNER+"/"+REPO+"/contents/"+path,{method:"PUT",body:JSON.stringify({message:"Upload portfolio artwork via WORACHIT ADMIN",content:binary,branch:BRANCH})});
let item={id:"assets/uploads/"+filename,name:(name||file.name).trim().slice(0,180),type:file.type};if(target==="profile"){db.siteSettings=db.siteSettings||{};db.siteSettings.profileImageId=item.id}else{db.groups[currentCategory]=db.groups[currentCategory]||[];db.groups[currentCategory].unshift(item)}pending();setStatus("อัปโหลดรูปสำเร็จ! กด “เผยแพร่การเปลี่ยนแปลง” เพื่อแสดงบนเว็บไซต์","success");refresh();
}catch(e){setStatus("อัปโหลดไม่สำเร็จ: "+e.message,"error")}finally{busy=false}}
$("loginBtn").addEventListener("click",login);$("token").addEventListener("keydown",e=>{if(e.key==="Enter")login()});
$("publishBtn").addEventListener("click",publish);$("logoutBtn").addEventListener("click",()=>{if(dirty&&!confirm("มีข้อมูลที่ยังไม่ได้เผยแพร่ ต้องการออกจากระบบหรือไม่?"))return;access="";snapshot="";fileSha="";db=null;dirty=false;dashboard.hidden=true;overlay.hidden=false;setStatus("");$("loginError").textContent="";$("token").value=""});
document.querySelectorAll("[data-tab]").forEach(tab=>tab.addEventListener("click",()=>switchTab(tab.dataset.tab)));
window.addEventListener("beforeunload",e=>{if(dirty){e.preventDefault();e.returnValue=""}});
})();