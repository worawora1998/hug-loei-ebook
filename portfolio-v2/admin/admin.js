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
hero:["02B / HERO IMAGES","ภาพใหญ่หน้าแรก","เปลี่ยนภาพที่เห็นทันทีเมื่อเข้าเว็บไซต์ เลือกจากผลงานหรืออัปโหลดใหม่"],
pricing:["03 / PACKAGES","ราคาแพ็กเกจ","ปรับราคาโดยไม่ต้องแก้โค้ด และแบ่ง General Ads / Concert Ads ชัดเจน"],
settings:["04 / WEBSITE SETTINGS","ข้อมูลเว็บไซต์","แก้ข้อความแนะนำตัวและ LINE ที่ลูกค้าใช้ติดต่อ"]
};let v=labels[current];$("sectionEyebrow").textContent=v[0];$("sectionTitle").textContent=v[1];$("sectionHelp").textContent=v[2];panel.replaceChildren();
document.querySelectorAll("[data-tab]").forEach(x=>x.classList.toggle("active",x.dataset.tab===current));
if(current==="overview")renderOverview();if(current==="artworks")renderArtworks();if(current==="featured")renderFeatured();if(current==="hero")renderHero();if(current==="pricing")renderPricing();if(current==="settings")renderSettings()
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
db.homePosterImages=db.homePosterImages||[];let chosen=db.homePosterImages;
let stack=elem("div","stack"),slots=box("01 / งานเด่น 6 ช่อง"),hint=elem("p","helper","แตะช่องที่ต้องการ แล้วแตะภาพจากคลังด้านล่าง หรือจับภาพลากไปวางบนช่องได้เลย");
slots.append(hint);let stage=elem("div","v17-feature-slots");let selectedSlot=0;
function redrawSlots(){stage.replaceChildren();for(let i=0;i<6;i++){let item=chosen[i];let slot=elem("button","v17-feature-slot"+(i===selectedSlot?" selected":""));slot.type="button";slot.dataset.slot=i;slot.draggable=!!item;
slot.append(elem("span","v17-slot-index","0"+(i+1)));if(item){slot.append(imageNode(item.id,item.name));slot.append(elem("span","v17-slot-label",item.name||"งานเด่น"))}else slot.append(elem("span","v17-empty","＋ เลือกรูป"));
slot.addEventListener("click",()=>{selectedSlot=i;redrawSlots()});
slot.addEventListener("dragstart",e=>{if(!item)return;e.dataTransfer.setData("application/x-feature-slot",String(i));e.dataTransfer.effectAllowed="move"});
slot.addEventListener("dragover",e=>{e.preventDefault();slot.classList.add("is-over")});
slot.addEventListener("dragleave",()=>slot.classList.remove("is-over"));
slot.addEventListener("drop",e=>{e.preventDefault();slot.classList.remove("is-over");let from=e.dataTransfer.getData("application/x-feature-slot"),artid=e.dataTransfer.getData("text/plain");
if(from!==""){let j=Number(from);if(j>=0&&j<6&&j!==i){while(chosen.length<6)chosen.push(null);[chosen[i],chosen[j]]=[chosen[j],chosen[i]];pending();redrawSlots()}}else if(artid)chooseArt(artid,i)});
stage.append(slot)}}
function chooseArt(id,index){let art=allArtworks().find(x=>x.id===id);if(!art)return;let item={id:art.id,name:art.name};while(chosen.length<6)chosen.push(null);chosen[index]=item;db.homePosterImages=chosen;selectedSlot=Math.min(5,index+1);pending();redrawSlots()}
redrawSlots();slots.append(stage);stack.append(slots);
let lib=box("02 / คลังภาพ — เลือกจากหมวด");append(lib,elem("p","helper","คลิกภาพเพื่อใส่ในช่องที่มีกรอบน้ำเงิน หรือใช้เมาส์ลากรูปไปวางในช่องที่ต้องการ"));
let ctl=elem("div","v17-pick-tools"),sel=elem("select");
db.categories.forEach(c=>{let opt=elem("option",null,c.title);opt.value=c.key;sel.append(opt)});
sel.value=currentCategory;sel.addEventListener("change",()=>{currentCategory=sel.value;drawGallery()});
let search=elem("input");search.type="search";search.placeholder="ค้นหาภาพ...";search.addEventListener("input",drawGallery);append(ctl,sel,search);lib.append(ctl);
let gallery=elem("div","v17-pick-gallery");
function drawGallery(){gallery.replaceChildren();let count=0;for(let it of db.groups[currentCategory]||[]){if(search.value&&!(it.name||"").toLowerCase().includes(search.value.toLowerCase()))continue;
count++;let tile=elem("button","v17-pick-tile");tile.type="button";tile.draggable=true;tile.append(imageNode(it.id,it.name),elem("span",null,it.name||"ผลงาน"));
tile.addEventListener("click",()=>chooseArt(it.id,selectedSlot));
tile.addEventListener("dragstart",e=>{e.dataTransfer.setData("text/plain",it.id);e.dataTransfer.effectAllowed="copy"});
gallery.append(tile)}if(!count)gallery.append(elem("p","helper","ยังไม่มีรูปในหมวดนี้"))}
drawGallery();lib.append(gallery);stack.append(lib);
stack.append(append(box("เคล็ดลับ"),elem("p","helper","ลากช่องงานเด่นเพื่อสลับตำแหน่งได้ และบนมือถือแตะช่องก่อน แล้วแตะภาพจากคลัง ระบบจะบันทึกหลังจากกด “เผยแพร่การเปลี่ยนแปลง”")));
panel.append(stack)
}
function renderHero(){
 db.siteSettings=db.siteSettings||{};let cfg=db.siteSettings;
 cfg.heroImages=cfg.heroImages||[];
 let area=elem("div","stack"),preview=box("ภาพ Hero 2 ตำแหน่ง");
 append(preview,elem("p","helper","นี่คือโปสเตอร์ 2 ภาพที่ซ้อนอยู่บนหน้าแรก แยกจาก 6 ภาพผลงานเด่น กดเลือกตำแหน่งแล้วคลิกภาพในคลัง หรืออัปโหลดภาพใหม่"));
 let slotList=elem("div","v18-hero-slots"),active=0;
 function redraw(){
 slotList.replaceChildren();
 for(let i=0;i<2;i++){
  let fallback=(db.homePosterImages||[])[i],current=cfg.heroImages[i]||fallback;
  let slot=button(i===0?"ภาพหลัก (ด้านหน้า)":"ภาพรอง (ด้านหลัง)",()=>{active=i;redraw()},"v18-hero-slot"+(active===i?" active":""));
  if(current)slot.prepend(imageNode(current.id,"ภาพ Hero "+(i+1)));
  slot.append(elem("span","helper",active===i?"กำลังเลือกภาพนี้":"คลิกเพื่อเลือก"));
  slotList.append(slot)
 }}
 redraw();preview.append(slotList);area.append(preview);
 let picker=box("เลือกภาพจากผลงาน"),controls=elem("div","v17-pick-tools"),category=elem("select"),search=elem("input");search.type="search";search.placeholder="ค้นหาชื่อภาพ";
 db.categories.forEach(c=>{let op=elem("option",null,c.title);op.value=c.key;category.append(op)});category.value=currentCategory;
 let gallery=elem("div","v17-pick-gallery");
 function draw(){gallery.replaceChildren();for(let im of db.groups[category.value]||[]){if(search.value&&!(im.name||"").toLowerCase().includes(search.value.toLowerCase()))continue;let tile=button(im.name||"ผลงาน",()=>{cfg.heroImages[active]={id:im.id,name:im.name||""};pending();redraw()},"v17-pick-tile");tile.prepend(imageNode(im.id,im.name));gallery.append(tile)}}
 category.addEventListener("change",()=>{currentCategory=category.value;draw()});search.addEventListener("input",draw);
 append(controls,category,search);append(picker,controls,gallery);draw();area.append(picker);
 let upload=box("หรืออัปโหลดภาพ Hero ใหม่","upload-card");let file=elem("input");file.type="file";file.accept="image/jpeg,image/png,image/webp";
 append(upload,elem("p","helper","รองรับ JPG / PNG / WebP ไม่เกิน 5 MB อัปโหลดเข้า Hero ตำแหน่งที่เลือกโดยตรง"),file,
 button("อัปโหลดเป็นภาพ Hero ↗",()=>uploadImage(file.files[0],"Hero "+(active+1),"hero:"+active),"btn btn-blue"));
 area.append(upload);panel.append(area)
}
function renderPricing(){
if(!db.pricePackages)db.pricePackages=JSON.parse(JSON.stringify(defaults));
let layout=elem("div","price-groups");const def={general:["General Ads","ภาพโฆษณา ร้านค้า และสื่อออนไลน์"],concert:["Concert Ads","โปสเตอร์คอนเสิร์ตและภาพโปรโมต"]};
for(const type of ["general","concert"]){
 let c=elem("section","price-card "+type);append(c,elem("h3",null,def[type][0]),elem("p","helper",def[type][1]+" — เพิ่ม ลบ และตั้งชื่อแพ็กเกจเองได้"));
 let rows=db.pricePackages[type]||(db.pricePackages[type]=JSON.parse(JSON.stringify(defaults[type])));
 rows.forEach((pkg,i)=>{
  let card=elem("div","v18-price-editor");
  const header=elem("div","v18-price-title");
  append(header,elem("strong",null,"แพ็กเกจ "+(i+1)),button("ลบแพ็กเกจ",()=>{
   if(rows.length<2){setStatus("ต้องมีแพ็กเกจอย่างน้อย 1 รายการต่อหมวด","error");return}
   if(!confirm("ลบแพ็กเกจรายการนี้?"))return;rows.splice(i,1);pending();refresh()
  },"mini-btn danger"));
  card.append(header);
  const number=elem("div","form-row");
  function numeric(label,index){
   let box=elem("div","input-wrap"),hint=elem("label",null,label),input=elem("input");
   input.type="number";input.min="1";input.step="1";input.max=index===0?"1000":"10000000";input.value=Number.isFinite(pkg[index])?pkg[index]:"";
   input.addEventListener("input",()=>{const v=Number(input.value);pkg[index]=input.value.trim()&&Number.isSafeInteger(v)&&v>0?v:NaN;pending()});
   append(box,hint,input);return box
  }
  append(number,numeric("จำนวนภาพ",0),numeric("ราคา (บาท)",1));card.append(number);
  card.append(field("ชื่อแพ็กเกจ / โปรโมชัน (เว้นว่างให้ระบบตั้งชื่อ)",pkg[2]||"",v=>pkg[2]=v.slice(0,90)));
  c.append(card)
 });
 let add=button("＋ เพิ่มแพ็กเกจใหม่",()=>{if(rows.length>=30){setStatus("จำกัดไม่เกิน 30 แพ็กเกจต่อหมวด","error");return}rows.push([rows.length+1,1000,"โปรโมชันใหม่"]);pending();refresh()},"btn btn-blue");
 c.append(add);layout.append(c)
}
panel.append(layout);
let note=box("วิธีใช้งานแพ็กเกจ");append(note,elem("p","helper","ทุกแพ็กเกจสามารถแก้จำนวนภาพ ราคา และชื่อได้อย่างอิสระ (เช่น PROMO 1 POSTER + 4 PROMO) ถ้าชื่อว่าง ระบบจะสร้างชื่อจากจำนวนภาพให้เอง"));panel.append(note)
}
function renderSettings(){
db.siteSettings=db.siteSettings||{};let s=db.siteSettings;let wrap=elem("div","settings-grid");
let security=box("ความปลอดภัย / PIN 6 หลัก");append(security,elem("p","helper","PIN เป็นด่านเข้าหน้า Admin บนอุปกรณ์นี้เท่านั้น การแก้ไขจริงยังต้องยืนยัน GitHub"));append(security,button("เปลี่ยน PIN 6 หลัก",async()=>{if(!window.WorachitPin){setStatus("อุปกรณ์นี้ไม่รองรับ PIN","error");return}let ok=await window.WorachitPin.change();setStatus(ok?"เปลี่ยน PIN สำเร็จ":"ไม่ได้เปลี่ยน PIN",ok?"success":"") },"btn btn-ghost"));append(security,elem("p","helper","ถ้าคุณเลือกจดจำ GitHub Token ระบบจะเก็บเฉพาะข้อมูลที่เข้ารหัสด้วย PIN 6 หลักบนอุปกรณ์นี้ ไม่แนะนำให้ใช้บนเครื่องสาธารณะ"),button("ลบการเชื่อมต่อที่จำไว้",()=>{window.WorachitPin?.forgetToken();setStatus("ลบ Token ที่จดจำไว้บนอุปกรณ์นี้แล้ว","success")},"btn btn-danger"));wrap.append(security);
let intro=box("01 / ข้อความและรายละเอียดหน้าเว็บ");
const fields=[
["ข้อความทักทายหน้าแรก","greeting","สวัสดีครับ! ยินดีต้อนรับสู่พอร์ตของผม"],
["ข้อความตัวใหญ่ใต้หัวข้อ","heroTagline","งานกราฟิกที่สนุก มีสไตล์ และตอบโจทย์การใช้งานจริง"],
["คำอธิบายหน้าแรก","heroDescription","ผมสุข วรชิต ภูลายยาว นักออกแบบกราฟิกฟรีแลนซ์ รับออกแบบโปสเตอร์คอนเสิร์ต งานโฆษณา และสื่อออนไลน์"],
["ข้อความเล็กใต้ปุ่ม","heroNote","ทำงานออนไลน์ · รับงานทั่วประเทศ · ตั้งแต่ปี 2017"],
["หัวข้อแนะนำตัว","aboutTitle","ยินดีที่รู้จักครับ!"],
["ข้อความแนะนำตัว","aboutDescription","ผมทำงานด้านกราฟิกดีไซน์มาตั้งแต่ปี 2017 โดยเน้นโปสเตอร์คอนเสิร์ต งานอีเวนต์ ภาพโฆษณา และสื่อประชาสัมพันธ์ รับงานออนไลน์ทั้งในประเทศไทยและต่างประเทศ"],
["หัวข้อหน้าเกี่ยวกับ","aboutSubtitle","นักออกแบบกราฟิกอิสระ ที่ชอบเปลี่ยนโจทย์ให้กลายเป็นงานภาพที่ชัดเจนและมีเอกลักษณ์"],
["คำอธิบายหน้าบริการ","servicesIntro","รับออกแบบกราฟิกสำหรับงานบันเทิง ธุรกิจ และสื่อออนไลน์ ด้วยแนวทางที่เหมาะกับแต่ละโปรเจกต์"],
["หัวข้อชวนคุยหน้าแรก","contactHeadline","มาออกแบบอะไรสนุก ๆ กัน!"],
["ข้อความแนะนำการติดต่อ","contactIntro","เลือกช่องทางติดต่อที่สะดวก หรือทัก LINE เพื่อคุยเรื่องงานได้โดยตรง"],
["คำโปรยท้ายเว็บไซต์","footerNote","Portfolio ของสุข"]
];
fields.forEach(([label,key,fallback])=>intro.append(field(label,s[key]||fallback,v=>s[key]=v,key==="heroDescription"||key==="aboutDescription"||key==="servicesIntro")));
wrap.append(intro);
let contact=box("02 / ช่องทางติดต่อ");
[["LINE ID","lineId","worachit98"],["Facebook ส่วนตัว (ลิงก์เต็ม)","facebookPersonal","https://www.facebook.com/WORACHIT1998"],["Facebook Page (ลิงก์เต็ม)","facebookPage","https://www.facebook.com/suksansrin8668"],["Instagram (ลิงก์เต็ม)","instagram","https://www.instagram.com/wora_chit98/"],["เบอร์โทรศัพท์","phone","082-872-3646"],["ชื่อแสดงใน Facebook","contactName","Worachit Pulaiyaw"]].forEach(([label,key,val])=>contact.append(field(label,s[key]||val,v=>s[key]=v)));
append(contact,elem("p","helper","URL ต้องขึ้นต้นด้วย https:// เพื่อป้องกันลิงก์ผิดพลาด ตรวจสอบก่อนเผยแพร่"));wrap.append(contact);
function photoUploader(parent,title,key,value,target){
 let block=box(title);if(value){let preview=imageNode(value,title);preview.className="profile-preview";block.append(preview)}else block.append(elem("p","helper","ยังไม่ได้ตั้งค่าโลโก้เว็บไซต์ ปัจจุบันแสดงชื่อ WORACHIT เป็นข้อความ"));append(block,elem("p","helper","รองรับ JPG, PNG, WebP ไม่เกิน 5 MB ต่อภาพ"));
 let file=elem("input");file.type="file";file.accept="image/png,image/jpeg,image/webp";append(block,file,button("เลือกอัปโหลดโลโก้ / รูปใหม่ ↗",()=>uploadImage(file.files[0],title,target),"btn btn-blue"));parent.append(block)
}
photoUploader(wrap,"03 / โลโก้เว็บไซต์ (ด้านบน)", "siteLogoId",s.siteLogoId||"","siteLogo");
photoUploader(wrap,"04 / รูปโปรไฟล์", "profileImageId",s.profileImageId||"1xdVr4OBE2O1dKQz724wRGNm4tKW7pzf8","profile");
let logo=box("05 / โลโก้โปรแกรม (หน้าเกี่ยวกับ)");
append(logo,elem("p","helper","แตะเลือกโปรแกรม แล้วอัปโหลดโลโก้ใหม่ โลโก้เดิมจะยังอยู่จนกว่าจะกดเผยแพร่"));let logos=elem("div","v17-logo-grid");
const defaultsLogo={Ps:"1opWMCoijL-jrBQ91eigI_Dww7ky6D6LZ",Ai:"1Tr3UOGGNvg-nxMOHouz1GOHrphtooXOe",Lr:"1GuI8hX0E3WLym9pd3Y-Fr4i2NOlp0owV",Pr:"1x_jBr7xHDuNrHA_aQOzvokID5MnMpDK1",Ae:"1U7Z2rQ2YZ6PuFLbHpmWkryZ1uDOVEGtv",Cc:"1iqetNGg8XETcMgBmfHYwLsxsiV4UPKd2"};
for(const [code,id] of Object.entries(defaultsLogo)){
 let tile=elem("div","v17-logo-tile");tile.append(imageNode((s.toolLogos||{})[code]||id,code),elem("strong",null,code));let input=elem("input");input.type="file";input.accept="image/png,image/jpeg,image/webp";
 tile.append(input,button("เปลี่ยนโลโก้",()=>uploadImage(input.files[0],"โลโก้ "+code,"tool:"+code),"mini-btn"));logos.append(tile)}
logo.append(logos);wrap.append(logo);panel.append(wrap)
}
function switchTab(name){current=name;setStatus("");refresh();window.scrollTo({top:0,behavior:"auto"})}
function utf8Base64(text){let bytes=new TextEncoder().encode(text),binary="";for(let i=0;i<bytes.length;i+=16384)binary+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(binary)}
function fromBase64(s){let raw=atob(s.replace(/\s/g,""));let a=Uint8Array.from(raw,c=>c.charCodeAt(0));return new TextDecoder("utf-8",{fatal:true}).decode(a)}
async function github(path,options={}){const resp=await fetch("https://api.github.com/"+path,{...options,headers:{"Authorization":"Bearer "+access,"Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","Content-Type":"application/json",...(options.headers||{})},cache:"no-store"});let json;try{json=await resp.json()}catch{json={}}if(!resp.ok)throw Error("GitHub "+resp.status+": "+(json.message||"เชื่อมต่อไม่สำเร็จ"));return json}
async function loadData(){let file=await github("repos/"+OWNER+"/"+REPO+"/contents/"+CONTENT+"?ref="+encodeURIComponent(BRANCH));if(!file.content)throw Error("GitHub ไม่ส่งเนื้อหา index.html");let source=fromBase64(file.content);let m=source.match(/<script id="portfolio-data" type="application\/json">([\s\S]*?)<\/script>/);if(!m)throw Error("ไม่พบข้อมูล Portfolio ใน index.html");let data=JSON.parse(m[1]);if(!data.groups||!data.categories)throw Error("โครงสร้างข้อมูลไม่ถูกต้อง");snapshot=source;fileSha=file.sha;db=data;dirty=false}
async function login(){if(busy)return;if(window.WorachitPin&&!(await window.WorachitPin.guard()))return;let input=$("token"),candidate=input.value.trim();$("loginError").textContent="";let restored=false;if(!candidate&&window.WorachitPin?.hasToken()){candidate=await window.WorachitPin.unlockToken();restored=!!candidate}if(!candidate){$("loginError").textContent="ครั้งแรกให้วาง GitHub Token หรือหาก Token ที่เคยบันทึกหมดอายุ ให้สร้างใหม่";return}access=candidate;input.value="";busy=true;$("loginBtn").disabled=true;$("loginBtn").textContent="กำลังตรวจสอบสิทธิ์...";try{let me=await github("user");if(String(me.login||"").toLowerCase()!==OWNER.toLowerCase())throw Error("บัญชีนี้ไม่ใช่เจ้าของเว็บไซต์ กรุณาใช้ Token ของ "+OWNER);await loadData();if(window.WorachitPin&&!window.WorachitPin.has()){if(!(await window.WorachitPin.setup()))throw Error("กรุณาตั้ง PIN 6 หลักสำหรับอุปกรณ์นี้ก่อนใช้งาน")}if(!restored&&$("rememberToken")?.checked&&window.WorachitPin?.rememberToken){try{await window.WorachitPin.rememberToken(candidate)}catch(e){setStatus("ไม่สามารถบันทึก Token แบบเข้ารหัสได้","error")}}overlay.hidden=true;dashboard.hidden=false;$("connectedUser").textContent="@"+me.login;switchTab("overview");setStatus("เชื่อมต่อสำเร็จ พร้อมจัดการเว็บไซต์","success")}catch(e){access="";$("loginError").textContent=e.message||"เข้าสู่ระบบไม่ได้"}finally{busy=false;$("loginBtn").disabled=false;$("loginBtn").textContent="เชื่อมต่อ GitHub ↗"}}
async function publish(){if(busy)return;if(!dirty){setStatus("ยังไม่มีการแก้ไขใหม่ที่ต้องเผยแพร่");return}
const line=String(db.siteSettings?.lineId||"worachit98");if(!/^[a-zA-Z0-9_.~-]{2,100}$/.test(line)){setStatus("รูปแบบ LINE ID ไม่ถูกต้อง","error");return}
for(const key of ["general","concert"]){let rows=db.pricePackages?.[key]||defaults[key];if(!Array.isArray(rows)||!rows.length||rows.length>30||rows.some(x=>!Number.isSafeInteger(x[0])||x[0]<=0||x[0]>1000||!Number.isSafeInteger(x[1])||x[1]<=0||x[1]>10000000||typeof(x[2]||"")!=="string"||(x[2]||"").length>90)){setStatus("กรุณาตรวจจำนวนภาพ ราคา และชื่อแพ็กเกจก่อนเผยแพร่","error");return}}
for(const field of ["facebookPersonal","facebookPage","instagram"]){let v=db.siteSettings?.[field];if(v&&(!/^https:\/\//i.test(v)||v.length>350)){setStatus("ลิงก์ "+field+" ต้องขึ้นต้นด้วย https:// และไม่ยาวเกินไป","error");return}}
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
let item={id:"assets/uploads/"+filename,name:(name||file.name).trim().slice(0,180),type:file.type};if(target==="profile"){db.siteSettings=db.siteSettings||{};db.siteSettings.profileImageId=item.id}else if(target==="siteLogo"){db.siteSettings=db.siteSettings||{};db.siteSettings.siteLogoId=item.id}else if(target.startsWith("tool:")){db.siteSettings=db.siteSettings||{};db.siteSettings.toolLogos=db.siteSettings.toolLogos||{};db.siteSettings.toolLogos[target.slice(5)]=item.id}else if(target.startsWith("hero:")){db.siteSettings=db.siteSettings||{};db.siteSettings.heroImages=db.siteSettings.heroImages||[];db.siteSettings.heroImages[Number(target.slice(5))]={id:item.id,name:item.name}}else{db.groups[currentCategory]=db.groups[currentCategory]||[];db.groups[currentCategory].unshift(item)}pending();setStatus("อัปโหลดรูปสำเร็จ! กด “เผยแพร่การเปลี่ยนแปลง” เพื่อแสดงบนเว็บไซต์","success");refresh();
}catch(e){setStatus("อัปโหลดไม่สำเร็จ: "+e.message,"error")}finally{busy=false}}
if(window.WorachitPin&&window.WorachitPin.has()){
 window.WorachitPin.guard().then(async ok=>{if(!ok){window.location.href="../?page=home";return}if(window.WorachitPin.hasToken())await login()})
}
$("loginBtn").addEventListener("click",login);$("token").addEventListener("keydown",e=>{if(e.key==="Enter")login()});
$("publishBtn").addEventListener("click",publish);$("logoutBtn").addEventListener("click",()=>{if(dirty&&!confirm("มีข้อมูลที่ยังไม่ได้เผยแพร่ ต้องการออกจากระบบหรือไม่?"))return;access="";snapshot="";fileSha="";db=null;dirty=false;if(window.WorachitPin)window.WorachitPin.lock();dashboard.hidden=true;overlay.hidden=false;setStatus("");$("loginError").textContent="";$("token").value=""});
document.querySelectorAll("[data-tab]").forEach(tab=>tab.addEventListener("click",()=>switchTab(tab.dataset.tab)));
window.addEventListener("beforeunload",e=>{if(dirty){e.preventDefault();e.returnValue=""}});
})();