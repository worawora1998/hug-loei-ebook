
(function(){
"use strict";
var dataNode=document.getElementById("portfolio-data"),mount=document.getElementById("app");
if(!dataNode||!mount)return;
var D;try{D=JSON.parse(dataNode.textContent)}catch(e){mount.innerHTML="<div class='shell'><h1>ไม่สามารถอ่านข้อมูลผลงานได้</h1><a href='?page=home'>กลับหน้าแรก</a></div>";return}
var cats=D.categories||[],groups=D.groups||{},featuredData=D.selected||[],assets=D.decor||[],profiles=D.profile||[];
var query=new URLSearchParams(window.location.search),requested=query.get("page")||"home",page=requested==="contact"?"about":requested;
if(["home","selected","categories","gallery","about","pricing","services"].indexOf(page)<0)page="home";
var key=query.get("cat")||"poster",current=cats.find(function(x){return x.key===key})||cats[0];
var lightItems=[],lightIndex=0,focusBefore=null,touchX=0;
var preloadImages=new Map();function preloadNear(i){if(!lightItems.length)return;[-1,1].forEach(function(offset){var it=lightItems[(i+offset+lightItems.length)%lightItems.length];if(!it)return;var url=src(it.id,850);if(preloadImages.has(url))return;var im=new Image();im.decoding='async';im.src=url;preloadImages.set(url,im);if(preloadImages.size>24)preloadImages.delete(preloadImages.keys().next().value)})}
function clean(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}
function u(page,cat){return "?page="+encodeURIComponent(page)+(cat?"&cat="+encodeURIComponent(cat):"")}
function src(id,width){return "https://drive.google.com/thumbnail?id="+encodeURIComponent(id)+"&sz=w"+(width||960)}
function drive(id){return "https://drive.google.com/file/d/"+encodeURIComponent(id)+"/view"}
function image(id,alt,width,eager){return "<img class='art-image' data-file='"+clean(id)+"' alt='"+clean(alt)+"' src='"+src(id,width)+"' loading='"+(eager?"eager":"lazy")+"' decoding='async'"+(eager?" fetchpriority='high'":"")+">"}
function fall(){return "<span class='art-fallback'><strong>ไม่สามารถแสดงภาพตัวอย่างได้</strong><span>ภาพต้นฉบับยังอยู่ใน Google Drive</span></span>"}
function decor(id,classes){return id?"<img aria-hidden='true' alt='' loading='lazy' class='"+classes+"' src='"+src(id,460)+"'>":""}
function shell(x){return "<div class='shell page-enter'>"+x+"</div>"}
function grad(x){return "<span class='gradient-text'>"+x+"</span>"}
function btn(label,link,kind){return "<a class='btn "+(kind||"primary")+"' href='"+clean(link)+"'>"+label+"</a>"}
function directLine(label,kind){return "<a class='btn "+(kind||"primary")+"' href='https://line.me/ti/p/~worachit98' target='_blank' rel='noopener noreferrer'>"+label+"</a>"}
function header(en,title,description,panel){return "<header class='"+(panel?"page-hero":"page-head")+"'><div class='"+(panel?"page-head":"")+"'><div class='eyebrow'>"+en+"</div><h1 class='section-title'>"+title+"</h1><p class='section-sub'>"+description+"</p></div>"+(panel?decor(assets[page==="about"?8:page==="selected"?3:page==="gallery"?9:6],"decor parallax-decor"):"")+"</header>"}
function title(en,text,link){return "<header class='section-kicker'><div><div class='eyebrow'>"+en+"</div><h2 class='section-title'>"+text+"</h2></div>"+(link?btn("ดูทั้งหมด ↗",link,"soft"):"")+"</header>"}
var skillData=[
{code:"Ps",name:"Photoshop",desc:"งานภาพ / รีทัช",color:"#31A8FF",bg:"#E6F7FF",glow:"#31A8FF40",icon:"photoshop"},
{code:"Ai",name:"Illustrator",desc:"เวกเตอร์ / โลโก้",color:"#FF9A00",bg:"#FFF2DB",glow:"#FF9A0040",icon:"illustrator"},
{code:"Lr",name:"Lightroom",desc:"ภาพถ่าย / โทนสี",color:"#15BCD8",bg:"#DCF9FF",glow:"#15BCD840",icon:"lightroom"}
];
function skillCards(){return "<div class='skill-grid'>"+skillData.map(function(x,i){return "<article class='skill-card reveal' style='--skill:"+x.color+";--skillbg:"+x.bg+";--skillglow:"+x.glow+";transition-delay:"+(i*45)+"ms'><div class='skill-logo'><img class='brand-img' alt='Adobe "+clean(x.name)+"' src='"+(x.icon==="lightroom"?"https://www.adobe.com/cc-shared/assets/img/product-icons/svg/lightroom.svg":"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/"+x.icon+"/"+x.icon+"-original.svg")+"' loading='lazy'><span class='skill-backup'>"+x.code+"</span></div><span class='skill-name'>"+x.name+"</span><span class='skill-caption'>"+x.desc+"</span></article>"}).join("")+"</div>"}

var iconShapes={
poster:'<rect x="3" y="3" width="18" height="18" rx="2.5"/><path d="M8 7h8M8 11h8M8 15h5"/>',
lineup:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 7h5M16 11h5M18 15h3"/>',
night:'<path d="M20 14.6A8 8 0 0 1 9.4 4a8.3 8.3 0 1 0 10.6 10.6Z"/><path d="M17 4v4M15 6h4M4 3v2M3 4h2"/>',
course:'<path d="m2 10 10-5 10 5-10 5-10-5ZM6 12v5c3.5 3 8.5 3 12 0v-5M22 10v7"/>',
cover:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 16l3-3 3 3 3-5 4 6"/>',
product:'<path d="m12 2 8 4.5v10L12 21l-8-4.5v-10L12 2Z"/><path d="m4.5 6.5 7.5 4.5 7.5-4.5M12 11v10"/>',
promo:'<path d="M3 6.5V3h6l12 12-6 6L3 9V6.5Z"/><circle cx="7" cy="7" r="1"/><path d="m11 16 5-5M11.5 11h.01M16 16h.01"/>',
logo:'<path d="m12 2 2.8 6.2L22 9l-5.2 4.8 1.5 7.2-6.3-3.5-6.3 3.5 1.5-7.2L2 9l7.2-.8L12 2Z"/>',
youtube:'<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3V9Z"/>',
book:'<path d="M12 6c-3-2-6-2-10-1v14c4-1 7-1 10 1 3-2 6-2 10-1V5c-4-1-7-1-10 1ZM12 6v14"/>',
sign:'<path d="M4 4h16v12H4zM9 16v5M15 16v5M7 21h10M8 8h8M8 12h5"/>',
event:'<rect x="3" y="3" width="18" height="18" rx="2"/><rect x="6" y="6" width="5" height="5" rx="1"/><rect x="13" y="6" width="5" height="5" rx="1"/><path d="M6 15h12M6 18h8"/>',
mascot:'<path d="M5 10V6l4 2a8 8 0 0 1 6 0l4-2v4a8 8 0 1 1-14 0Z"/><path d="M9 13h.01M15 13h.01M11 17q1 1 2 0"/>',
menu:'<path d="M5 3v9M2 3v6a3 3 0 0 0 6 0V3M5 12v9M15 3v18M15 3a5 5 0 0 1 5 5v4h-5"/>',
apparel:'<path d="m8 3 4 3 4-3 5 4-3 5-2-1v10H8V11l-2 1-3-5 5-4Z"/>'
};
function iconSVG(key,extra){
 return "<svg class='"+(extra||"category-icon")+"' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linejoin='round' stroke-linecap='round' aria-hidden='true' focusable='false'>"+(iconShapes[key]||iconShapes.poster)+"</svg>";
}
function labelPair(c,variant){
 return "<span class='bilingual "+(variant||"")+"'><strong class='label-en'>"+clean(c.en)+"</strong><span class='label-th'>"+clean(c.title)+"</span></span>";
}

function item(cat){return (groups[cat]||[])[0]}
function contactChannels(){
 return [
  {name:"LINE",value:"worachit98",url:"https://line.me/ti/p/~worachit98",icon:socialIcon("line","06C755","LINE")},
  {name:"Facebook ส่วนตัว",value:"Worachit Pulaiyaw",url:"https://www.facebook.com/WORACHIT1998",icon:socialIcon("facebook","0866FF","f")},
  {name:"Facebook Page",value:"Facebook Page",url:"https://www.facebook.com/suksansrin8668",icon:socialIcon("facebook","0866FF","f")},
  {name:"INSTAGRAM",value:"@wora_chit98",url:"https://www.instagram.com/wora_chit98/",icon:socialIcon("instagram","E4405F","IG")},
  {name:"โทรศัพท์",value:"082-872-3646",url:"tel:0828723646",icon:"<span class='contact-icon phone-icon' aria-hidden='true'><svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'><path d='M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.7L7.1 10a16 16 0 0 0 6.9 6.9l1.6-1.9a2 2 0 0 1 1.7-.6l3 .5A2 2 0 0 1 22 16.9Z'/></svg></span>"}
 ];
}

function teamLineCard(){
 return "<div class='team-line-card'><div class='team-line-symbol'>"+socialIcon("line","06C755","LINE")+"</div><div class='team-line-info'><small>LINE ทีม/เพจ (บัญชีส่วนตัว)</small><strong>suksansrin8668</strong><span>ค้นหาด้วย LINE ID — ยังไม่มีลิงก์เพิ่มเพื่อนที่ยืนยันแล้ว</span></div><button type='button' class='copy-line-btn' data-copy-line='suksansrin8668' aria-label='คัดลอก LINE ID ของทีม'>คัดลอก ID</button></div>";
}

function home(){
var p=D.homePosterImages||groups.poster||[],indexes=p.slice(0,6).map(function(_,i){return i});
var heroVisual="<div class='hero-stage hero-stage-v4' aria-hidden='true'>"+
  "<div class='profile-halo'></div>"+
  "<div class='profile-cutout'>"+image(D.homeProfile||profiles[0]||profiles[1],"รูปผม สุข วรชิต ภูลายยาว",720,true)+fall()+"</div>"+
  decor(assets[1],"hero-art-element one parallax-decor")+
  decor(assets[3],"hero-art-element two parallax-decor")+
  decor(assets[6],"hero-art-element three parallax-decor")+
  "<div class='studio-seal seal-top'><span>INDEPENDENT<br>DESIGNER</span><b>2017 — NOW</b></div>"+
 "</div>";
var hero="<section class='hero hero-v4'><div class='hero-copy'>"+
 "<div class='eyebrow'>FREELANCE GRAPHIC DESIGNER · WORACHIT PULAIYAW</div>"+
 "<h1 class='display'><span class='hero-hello'>สวัสดีครับ</span><span>ผม <em>สุข.</em></span><span class='gradient-text'>GRAPHIC</span><span>DESIGNER</span></h1>"+
 "<p class='hero-lead'>ผมสุข (Suk) วรชิต ภูลายยาว — Freelance Graphic Designer ประสบการณ์ 9 ปี ตั้งแต่ปี 2017 เชี่ยวชาญงานโปสเตอร์คอนเสิร์ตและอีเวนต์ พร้อมรับงานโฆษณา โลโก้ และกราฟิกหลากหลายประเภท รับงานออนไลน์ทั่วประเทศครับ</p>"+
 "<div class='hero-actions'>"+btn("ดูโปสเตอร์คอนเสิร์ต ↗",u("gallery","poster"))+directLine("ทัก LINE คุยงาน","soft")+btn("ดูราคาแพ็กเกจ",u("pricing"),"soft")+"</div>"+
 "<div class='hero-stats'><div class='hero-stat'><strong>9 ปี</strong><small>ทำงานกราฟิกมาตั้งแต่ปี 2017</small></div><div class='hero-stat'><strong>15 หมวด</strong><small>เลือกดูผลงานตามที่สนใจได้เลย</small></div></div></div>"+heroVisual+"</section>";
var tickerLabels=["POSTER DESIGN","LOGO DESIGN","ARTIST LINEUP","SOCIAL MEDIA","EDITORIAL DESIGN","CREATIVE WORKS"];var words=tickerLabels.concat(tickerLabels);
var ticker="<div class='ticker ticker-v4' aria-hidden='true'><div class='ticker-track'>"+words.map(function(w){return "<span><b>✳</b> "+w+"</span>"}).join("")+"</div></div>";
var previews="<section class='section first-look' id='first-look'>"+
 title("POSTER / RECENT PICKS","ตัวอย่างโปสเตอร์ที่ผมทำไว้",u("gallery","poster"))+
 "<p class='section-sub quick-note'>เลือกมาให้ดู 6 ภาพก่อนครับ คลิกที่ภาพเพื่อดูใหญ่ได้เลย</p>"+
 "<div class='poster-six-grid'>"+
 indexes.map(function(i,index){return "<button type='button' class='poster-six-card reveal' data-home-poster='"+i+"' aria-label='ขยายตัวอย่างโปสเตอร์ที่ "+(index+1)+"'>"+
 "<span class='poster-six-image'>"+image(p[i].id,"ตัวอย่างโปสเตอร์ที่ "+(index+1),780,index<2)+fall()+"</span>"+
 "<span class='poster-six-action'>ดูภาพใหญ่ ↗</span></button>"}).join("")+
 "</div></section>";
var skills="<section class='section skill-section-v4'>"+title("MY ADOBE TOOLS","โปรแกรมที่ผมใช้งาน")+"<p class='section-sub skills-intro'>งานกราฟิกผมใช้ Photoshop กับ Illustrator เป็นหลัก ส่วนงานภาพถ่ายใช้ Lightroom ครับ</p>"+skillCards()+"</section>";
var shortcuts="<section class='section shortcut-section'>"+
 title("CHOOSE A CATEGORY","เลือกดูงานได้ครบ <span class='gradient-text'>15 หมวด</span>",u("categories"))+
 "<p class='section-sub quick-note'>ผมใส่ภาพตัวอย่างให้ทุกหมวดแล้วครับ คลิกภาพหรือชื่อหมวดเพื่อดูผลงานทั้งหมดได้เลย</p>"+
 "<div class='category-shortcuts shortcuts-v4 shortcuts-v6'>"+
 cats.map(function(c,i){
  var artwork=item(c.key);
  return "<a class='shortcut shortcut-v4 shortcut-visual reveal' style='--stagger:"+(i%5*55)+"ms' href='"+u("gallery",c.key)+"' aria-label='ชม "+clean(c.en)+" — "+clean(c.title)+"'>"+
  "<span class='shortcut-preview'>"+
  (artwork?image(artwork.id,"ตัวอย่างผลงาน "+c.title,460,false)+fall():"")+
  "<span class='shortcut-icon-wrap'>"+iconSVG(c.key)+"</span></span>"+
  "<span class='shortcut-details'>"+labelPair(c,"shortcut-label")+
  "<span class='shortcut-arrow' aria-hidden='true'>↗</span></span></a>";
 }).join("")+"</div></section>";
var cta="<section class='section'><div class='work-end reveal'><div><h2>มีงานที่อยากให้ผมช่วยออกแบบไหมครับ?</h2><p>ส่งรายละเอียดมาให้คุยกันก่อนได้เลยครับ</p></div>"+directLine("ทัก LINE คุยงาน ↗")+"</div></section>";
var homeContacts=contactChannels();
var homeContactLinks=homeContacts.map(function(c){
 var external=c.url.indexOf("https://")===0;
 return "<a class='home-contact-item' href='"+clean(c.url)+"'"+(external?" target='_blank' rel='noopener noreferrer'":"")+" aria-label='ติดต่อทาง "+clean(c.name)+"'>"+
 c.icon+"<span class='home-contact-details'><small>"+clean(c.name)+"</small><strong>"+clean(c.value)+"</strong></span>"+
 "<span class='home-contact-arrow' aria-hidden='true'>↗</span></a>";
}).join("");
var homeContact="<section class='section home-contact' id='home-contact'><div class='home-contact-panel reveal'>"+
 "<div class='home-contact-intro'><div class='eyebrow'>LET'S WORK TOGETHER</div><h2>มีงานออกแบบที่อยากให้ผมช่วยไหมครับ?</h2>"+
 "<p>ส่งรายละเอียดมาคุยกันได้เลยครับ เลือกช่องทางที่สะดวกได้ทั้ง 5 ช่องทาง</p>"+
 "<a class='home-contact-about' href='"+u("about")+"#contact'>ดูประวัติและช่องทางติดต่อทั้งหมด ↗</a></div>"+
 "<div class='home-contact-links'>"+homeContactLinks+teamLineCard()+"</div></div></section>";
return shell(hero+ticker+previews+homeServices()+skills+shortcuts+pricingTeaser()+cta+homeContact)}


function homeServices(){
var blocks=[
 ["โปสเตอร์คอนเสิร์ตและศิลปิน","งานเด่น ทั้งคอนเสิร์ต อีเวนต์ ผับ บาร์ DJ และ MC","poster"],
 ["ภาพโฆษณาและโปรโมชัน","สื่อโปรโมตสินค้า ร้านอาหาร คาเฟ่ และธุรกิจบนโซเชียล","promo"],
 ["โลโก้และกราฟิกอื่น ๆ","โลโก้ ภาพปก รีทัช และสื่อประชาสัมพันธ์ตามรายละเอียดงาน","logo"]
];
return "<section class='section service-teaser reveal'><div class='section-kicker'><div><div class='eyebrow'>WHAT I DESIGN</div><h2 class='section-title'>รับออกแบบ"+grad("งานอะไรบ้าง?")+"</h2></div>"+btn("ดูบริการทั้งหมด ↗",u("services"),"soft")+"</div><div class='home-service-grid'>"+blocks.map(function(b,i){return "<a class='home-service-card' href='"+u("services")+"'><span class='service-count'>0"+(i+1)+"</span><div class='service-icon'>"+iconSVG(b[2])+"</div><strong>"+b[0]+"</strong><span>"+b[1]+"</span><i aria-hidden='true'>↗</i></a>"}).join("")+"</div><p class='service-teaser-note'>รับงานออนไลน์ทั่วประเทศ • งานทั่วไปประมาณ 1–2 วันต่อภาพ • รับงานด่วนโดยไม่คิดค่าบริการเพิ่ม ทั้งนี้ขึ้นอยู่กับคิวงาน</p></section>";
}
function pricingTeaser(){
return "<section class='section pricing-teaser reveal'><div class='pricing-teaser-copy'><div class='eyebrow'>DESIGN SERVICES</div><h2>รับออกแบบภาพโฆษณา<br><span class='gradient-text'>เริ่มต้น 300 บาท</span></h2><p>ทั้งภาพโฆษณาร้านค้าและโปสเตอร์คอนเสิร์ต เลือกแพ็กเกจที่เหมาะกับงานได้เลยครับ</p>"+btn("ดูราคาและแพ็กเกจทั้งหมด ↗",u("pricing"))+"</div><div class='pricing-teaser-side'><span>ภาพโฆษณาทั่วไป</span><strong>300 <small>บาท / ภาพ</small></strong><span>โปสเตอร์คอนเสิร์ต</span><strong>600 <small>บาท / ภาพ</small></strong></div></section>"
}
function pricing(){
var general=[[1,300,300],[5,1400,280],[10,2700,270],[20,5200,260],[30,7500,250]];
var concert=[[1,600],[2,1150],[3,1650],[4,2100],[5,2550],[6,3000]];
function money(n){return Number(n).toLocaleString("th-TH")}
function prices(rows,type){return "<div class='price-table-wrap'><table class='price-table'><thead><tr><th>จำนวนภาพ</th><th>"+(type==="concert"?"สิ่งที่ได้รับ":"ราคาเฉลี่ยต่อภาพ")+"</th><th>ราคาแพ็กเกจ</th></tr></thead><tbody>"+rows.map(function(r,i){return "<tr"+(i===0?" class='price-first'":"")+"><td><b>"+r[0]+" ภาพ</b></td><td>"+(type==="concert"?(r[0]===1?"1 POSTER":"1 POSTER + ภาพโปรโมต "+(r[0]-1)+" ภาพ"):(money(r[2])+" บาท"))+"</td><td><strong>"+money(r[1])+" บาท</strong></td></tr>"}).join("")+"</tbody></table></div>"}
function li(arr){return "<ul class='price-bullets'>"+arr.map(function(x){return "<li>"+x+"</li>"}).join("")+"</ul>"}
var generalExamples=["ภาพโฆษณาสินค้า ร้านอาหาร และคาเฟ่","ภาพโปรโมชัน ลดราคา และกิจกรรม","ภาพลง Facebook / Instagram","ภาพสำหรับเว็บไซต์และร้านค้าออนไลน์"];
var concertExamples=["โปสเตอร์คอนเสิร์ตและงานดนตรี","ภาพโปรโมตศิลปิน DJ / MC","ภาพแจ้งราคาบัตรและรายละเอียดงาน","ภาพนับถอยหลังก่อนวันจัดงาน"];
var included=["ภาพ JPG / PNG คุณภาพสูง ตามจำนวนที่เลือก","ไฟล์ต้นฉบับ PSD หรือ AI ตามโปรแกรมที่ใช้","ปรับสี ข้อความ และรายละเอียดได้ฟรีไม่จำกัดรอบภายในบรีฟเดิม"];
function block(no,title,en,description,rows,type,examples){
return "<section class='section pricing-section reveal' id='"+type+"'><div class='pricing-section-heading'><span class='price-number'>"+no+"</span><div><div class='eyebrow'>"+en+"</div><h2>"+title+"</h2><p>"+description+"</p></div></div>"+
prices(rows,type)+
"<div class='pricing-details'><div><h3>เหมาะกับงานแบบไหน?</h3>"+li(examples)+"</div><div><h3>สิ่งที่ได้รับ</h3>"+li(included)+"</div></div>"+
"<div class='pricing-section-action'>"+directLine("ทัก LINE สอบถามแพ็กเกจ ↗")+"</div></section>"
}
var terms=[
["ไฟล์งาน","ได้รับ JPG / PNG และไฟล์ต้นฉบับ PSD หรือ AI ตามโปรแกรมที่ใช้ออกแบบ"],
["ก่อนเริ่มงาน","ส่งข้อความ รายละเอียดงาน โลโก้ และภาพประกอบที่มีสิทธิ์ใช้งานให้ครบก่อนเริ่มครับ"],
["การแก้ไข","แก้ไขฟรีไม่จำกัดรอบภายในบรีฟเดิม เช่น สี ข้อความ และตำแหน่ง หากเปลี่ยนคอนเซปต์ใหม่ทั้งหมดจะประเมินค่าออกแบบใหม่หรือคิดเพิ่มประมาณ 50% ของราคางานเดิมตามรายละเอียด โดยแจ้งราคาก่อนดำเนินการ"],
["ระยะเวลาทำงาน","งานทั่วไปประมาณ 1–2 วันต่อภาพหลังได้รับรายละเอียดครบถ้วน งานจำนวนมากและหลายโปรเจกต์ประเมินกำหนดส่งตามคิวงานที่มีอยู่"],
["งานด่วน","สามารถสอบถามงานด่วนได้โดยไม่มีค่าบริการเพิ่มเติม ทั้งนี้ขึ้นอยู่กับคิวงานที่รับอยู่"],
["การชำระเงิน","ชำระมัดจำอย่างน้อย 50% ก่อนเริ่มงาน หรือชำระเต็มจำนวนได้ เมื่อแบบเสร็จและลูกค้ายืนยันแล้ว ให้ชำระยอดที่เหลือก่อนรับไฟล์งานฉบับสมบูรณ์"],
["การยกเลิกงาน","หากลูกค้ายกเลิกหลังเริ่มดำเนินงานแล้ว จะไม่คืนเงินมัดจำตามข้อตกลงก่อนเริ่มงาน"],
["การนำไปใช้","นำผลงานไปใช้โฆษณา ประชาสัมพันธ์ โซเชียลมีเดีย หรือนำไฟล์ไปผลิตต่อได้ โดยต้องมีสิทธิ์ใช้งานภาพ ฟอนต์ และองค์ประกอบที่เกี่ยวข้อง"],
["ขอบเขตบริการ","รับออกแบบไฟล์เท่านั้น ไม่รวมงานพิมพ์หรือผลิตชิ้นงานจริง และไม่รับออกแบบเว็บไซต์ งานโลโก้ รีทัช วิดีโอ หรือบริการอื่นที่ไม่มีราคาแพ็กเกจสามารถทักมาสอบถามราคาได้"],
["แพ็กเกจหลายภาพ","ราคานี้สำหรับธุรกิจ แบรนด์ หรืออีเวนต์เดียวกันเป็นหลัก ถ้าเป็นหลายธุรกิจหรือหลายงาน ทักมาสอบถามก่อนได้ครับ"]
];
return shell(
"<section class='pricing-hero reveal'><div class='eyebrow'>DESIGN SERVICE & PRICING</div><h1>บริการออกแบบ<br><span class='gradient-text'>และราคาแพ็กเกจ</span></h1><p>ผมรับออกแบบภาพโฆษณาออนไลน์ โปสเตอร์คอนเสิร์ต และภาพประชาสัมพันธ์สำหรับร้านค้าและธุรกิจครับ เลือกจำนวนภาพที่ต้องการได้เลย</p><div class='pricing-hero-bottom'><div class='pricing-start'><small>ราคาเริ่มต้น</small><strong>300 <span>บาท</span></strong></div><div class='pricing-hero-actions'>"+btn("ภาพโฆษณาทั่วไป ↓","#general")+btn("โปสเตอร์คอนเสิร์ต ↓","#concert","soft")+"</div></div></section>"+
"<nav class='pricing-jump' aria-label='เลือกดูแพ็กเกจ'><a href='#general'>01 <b>ภาพโฆษณาทั่วไป</b><span>เริ่ม 300 บาท ↗</span></a><a href='#concert'>02 <b>โปสเตอร์คอนเสิร์ต</b><span>เริ่ม 600 บาท ↗</span></a><a href='#terms'>03 <b>เงื่อนไขการจ้างงาน</b><span>อ่านก่อนสั่งงาน ↗</span></a></nav>"+
block("01","ภาพโฆษณาทั่วไป","GENERAL ADVERTISING","สำหรับร้านค้า สินค้า ร้านอาหาร คาเฟ่ หรือภาพลงโซเชียล เลือกได้ตั้งแต่ 1–30 ภาพ",general,"general",generalExamples)+
block("02","โปสเตอร์คอนเสิร์ตและอีเวนต์","CONCERT & ENTERTAINMENT","มีโปสเตอร์หลัก 1 ภาพ และสามารถเพิ่มภาพโปรโมตในธีมเดียวกันได้ เหมาะกับงานดนตรี ผับ บาร์ และงาน DJ / MC",concert,"concert",concertExamples)+
"<div class='pricing-special reveal'><div><div class='eyebrow'>LARGE PROJECT</div><h2>งานอื่นที่ไม่มีราคาแพ็กเกจ?</h2><p>งานโลโก้ รีทัช วิดีโอ หรือโปรเจกต์ที่มีรายละเอียดพิเศษ สามารถทักมาสอบถามราคาและกำหนดส่งตามลักษณะงานได้ครับ</p></div>"+directLine("ทัก LINE สอบถามราคา ↗")+"</div>"+
"<section class='section pricing-terms reveal' id='terms'><div class='eyebrow'>BEFORE WE START</div><h2>เงื่อนไขการจ้างงาน</h2><p class='pricing-terms-intro'>อ่านส่วนนี้ก่อนเริ่มงานสักนิดนะครับ จะได้เข้าใจตรงกัน</p><div class='pricing-terms-grid'>"+terms.map(function(t,i){return "<article class='pricing-term'><span>"+String(i+1).padStart(2,"0")+"</span><div><h3>"+t[0]+"</h3><p>"+t[1]+"</p></div></article>"}).join("")+"</div></section>"+
"<section class='pricing-end reveal'><div class='eyebrow'>LET'S WORK TOGETHER</div><h2>มีงานที่อยากให้ผมช่วยออกแบบไหมครับ?</h2><p>ส่งรายละเอียดมาคุยกันก่อนได้เลยครับ จะสั่งงานเป็นภาพ เป็นแพ็กเกจ หรือเหมาทั้งโปรเจกต์ก็ได้</p><div class='pricing-end-actions'>"+directLine("ทัก LINE สอบถามราคา ↗")+btn("ดูขั้นตอนจ้างงาน",u("services"),"soft")+"</div></section>"
)
}

function services(){
var offers=[
 {name:"โปสเตอร์คอนเสิร์ต / ศิลปิน / DJ / MC",desc:"โปสเตอร์คอนเสิร์ต งานผับ บาร์ และงานอีเวนต์ พร้อมภาพโปรโมตในธีมเดียวกัน",key:"poster",gallery:"poster",badge:"งานที่เชี่ยวชาญ"},
 {name:"ภาพโฆษณา Facebook / Instagram / TikTok",desc:"ภาพลงโซเชียลสำหรับโฆษณาสินค้า บริการ และประชาสัมพันธ์ธุรกิจ",key:"promo",gallery:"promo"},
 {name:"ภาพโปรโมชันร้านค้า / ร้านอาหาร / คาเฟ่",desc:"งานโปรโมชัน ลดราคา เมนูใหม่ และภาพประชาสัมพันธ์ร้านค้า",key:"night",gallery:"night"},
 {name:"ออกแบบโลโก้ / แบรนด์",desc:"โลโก้และกราฟิกสำหรับสร้างภาพลักษณ์ของร้านค้าและแบรนด์",key:"logo",gallery:"logo"},
 {name:"ปก Facebook / YouTube / แบนเนอร์",desc:"ภาพปกและแบนเนอร์สำหรับช่องทางออนไลน์ต่าง ๆ",key:"cover",gallery:"cover"},
 {name:"ป้ายโฆษณา / เมนูอาหาร / สิ่งพิมพ์",desc:"ออกแบบไฟล์สำหรับป้าย เมนู และงานพิมพ์ โดยไม่รวมบริการผลิตจริง",key:"sign",gallery:"sign"},
 {name:"ปกหนังสือ / E-Book",desc:"ออกแบบหน้าปกหนังสือและสื่อสำหรับอ่านออนไลน์",key:"book",gallery:"book"},
 {name:"ตกแต่งภาพ / รีทัช / ตัดต่อภาพ",desc:"ปรับแสง สี ผิวภาพ และจัดองค์ประกอบภาพสำหรับการใช้งานตามบรีฟ",key:"product"},
 {name:"ลายเสื้อ / สินค้าที่ระลึก",desc:"ออกแบบลายเสื้อและลวดลายสินค้าเพื่อให้นำไฟล์ไปผลิตต่อได้",key:"apparel",gallery:"apparel"},
 {name:"แผนผังงานอีเวนต์ / ประชาสัมพันธ์",desc:"แผนผังพื้นที่งานและสื่อประชาสัมพันธ์กิจกรรม",key:"event",gallery:"event"},
 {name:"โมชั่นกราฟิก / วิดีโอ / ตัดต่อคลิป",desc:"รับงานวิดีโอและโมชั่นกราฟิกโดยมีทีมช่วยดำเนินการ ประเมินราคาตามรายละเอียด",key:"youtube"},
 {name:"งานกราฟิกอื่น ๆ ตามบรีฟ",desc:"มีไอเดียหรืองานออกแบบประเภทอื่น ทักมาสอบถามรายละเอียดก่อนได้ครับ",key:"product"}
];
var steps=[
 ["ทักมาคุยรายละเอียด","ส่งข้อความ สิ่งที่อยากได้ รูป โลโก้ และภาพอ้างอิงทาง LINE หรือช่องทางติดต่อที่สะดวก"],
 ["สรุปงานและตกลงราคา","ประเมินราคา จำนวนภาพ ระยะเวลา และคิวงานให้ชัดเจนก่อนเริ่ม"],
 ["มัดจำก่อนเริ่มงาน","ชำระมัดจำอย่างน้อย 50% หรือชำระเต็มจำนวนได้ตามสะดวก"],
 ["ออกแบบและตรวจแก้","ส่งภาพตัวอย่างให้ตรวจ แก้ไขฟรีไม่จำกัดรอบภายในรายละเอียดงานเดิม"],
 ["ยืนยันแบบและรับไฟล์","เมื่อคอนเฟิร์มแบบและชำระยอดที่เหลือแล้ว ส่งไฟล์ผ่าน Google Drive หรือแชท"]
];
var faq=[
 ["ออกแบบภาพทั่วไปใช้เวลากี่วัน?","ประมาณ 1–2 วันต่อภาพหลังได้รับรายละเอียดครบถ้วน งานจำนวนมากหรือหลายโปรเจกต์จะแจ้งกำหนดส่งตามคิวที่มีอยู่"],
 ["รับงานด่วนไหม มีค่าใช้จ่ายเพิ่มหรือเปล่า?","รับงานด่วนโดยไม่มีค่าบริการเพิ่มเติม แต่ต้องตรวจสอบคิวงานและกำหนดส่งก่อนรับงาน"],
 ["แก้ไขงานได้กี่ครั้ง?","แก้ไขฟรีไม่จำกัดรอบภายในบรีฟเดิม หากเปลี่ยนคอนเซปต์ใหม่ทั้งหมด จะประเมินราคาใหม่หรือคิดเพิ่มประมาณ 50% ของราคางานเดิมตามรายละเอียดและตกลงก่อนแก้"],
 ["ต้องมัดจำเท่าไร และจ่ายส่วนที่เหลือตอนไหน?","มัดจำอย่างน้อย 50% ก่อนเริ่มงาน หรือชำระเต็มจำนวนได้ เมื่อแบบเสร็จและลูกค้ายืนยันแล้ว ให้ชำระยอดที่เหลือก่อนรับไฟล์สมบูรณ์"],
 ["ถ้ายกเลิกงานหลังเริ่มออกแบบแล้ว คืนมัดจำไหม?","เมื่อเริ่มดำเนินงานแล้ว หากลูกค้ายกเลิกจะไม่คืนเงินมัดจำตามข้อตกลงก่อนเริ่มงาน"],
 ["ลูกค้าจะได้รับไฟล์อะไร?","ได้รับ JPG / PNG คุณภาพสูง และไฟล์ต้นฉบับ PSD หรือ AI ตามโปรแกรมที่ใช้ สำหรับงานวิดีโอหรือโมชั่นให้ตกลงรูปแบบไฟล์ก่อนเริ่มงาน"],
 ["ทำป้าย เสื้อ หรือสิ่งพิมพ์จริงให้ด้วยไหม?","รับเฉพาะออกแบบและส่งไฟล์สำหรับนำไปผลิตต่อ ไม่รวมการพิมพ์ ผลิตเสื้อ หรือผลิตชิ้นงานจริง และไม่รับออกแบบเว็บไซต์"],
 ["งานโลโก้ รีทัช หรือวิดีโอมีราคาเท่าไร?","งานที่ไม่อยู่ในแพ็กเกจราคาจะประเมินตามรายละเอียดและขอบเขตงาน ทักมาสอบถามราคาได้โดยตรง"]
];
return shell(
header("DESIGN SERVICES / WHAT I DO","บริการ"+grad("ออกแบบกราฟิก"),"รับออกแบบตั้งแต่โปสเตอร์คอนเสิร์ต งานอีเวนต์ ไปจนถึงภาพโฆษณาสำหรับร้านค้าและธุรกิจ รับงานออนไลน์ทั่วประเทศ",true)+
"<section class='section services-intro reveal'><div class='services-intro-badge'>FREELANCE GRAPHIC DESIGNER · SINCE 2017</div><h2>งานหลักคือโปสเตอร์คอนเสิร์ต<br><span class='gradient-text'>แต่งานกราฟิกแบบอื่นก็รับครับ</span></h2><p>ผมสุข (Suk) รับออกแบบไฟล์งานตามโจทย์ของลูกค้า โดยเน้นพูดคุยรายละเอียดกับนักออกแบบโดยตรง ไม่ต้องกรอกแบบฟอร์มหรือสมัครสมาชิก</p><div class='services-intro-actions'>"+btn("ดูโปสเตอร์ที่ผ่านมา ↗",u("gallery","poster"))+directLine("ทัก LINE คุยงาน ↗","soft")+"</div></section>"+
"<section class='section'><div class='section-kicker'><div><div class='eyebrow'>DESIGN CATEGORIES</div><h2 class='section-title'>งานที่"+grad("รับออกแบบ")+"</h2></div></div><div class='services-grid'>"+
offers.map(function(o,i){return "<article class='service-card reveal'><div class='service-card-top'><span class='service-card-icon'>"+iconSVG(o.key)+"</span><span class='service-card-number'>"+String(i+1).padStart(2,"0")+"</span></div>"+(o.badge?"<span class='service-card-badge'>"+o.badge+"</span>":"")+"<h3>"+o.name+"</h3><p>"+o.desc+"</p><div class='service-card-bottom'>"+(o.gallery?"<a href='"+u("gallery",o.gallery)+"'>ดูผลงานที่มี ↗</a>":"<a href='"+u("about")+"#contact'>ทักสอบถาม ↗</a>")+"</div></article>"}).join("")+
"</div><div class='service-scope'><strong>ขอบเขตบริการ</strong><p>รับออกแบบไฟล์เท่านั้น ไม่รวมการพิมพ์หรือผลิตชิ้นงานจริง และไม่รับออกแบบเว็บไซต์ ส่วนงานวิดีโอ/โมชั่นกราฟิกมีทีมช่วยดำเนินการ ทั้งหมดสามารถสอบถามราคาและคิวงานได้ก่อนตัดสินใจครับ</p></div></section>"+
"<section class='section service-workflow' id='workflow'><div class='section-kicker'><div><div class='eyebrow'>HOW IT WORKS</div><h2 class='section-title'>ขั้นตอน"+grad("การจ้างงาน")+"</h2></div></div><div class='workflow-grid'>"+steps.map(function(x,i){return "<article class='workflow-card reveal'><span>"+String(i+1).padStart(2,"0")+"</span><h3>"+x[0]+"</h3><p>"+x[1]+"</p></article>"}).join("")+"</div></section>"+
"<section class='section service-faq' id='faq'><div class='section-kicker'><div><div class='eyebrow'>FREQUENTLY ASKED QUESTIONS</div><h2 class='section-title'>คำถาม"+grad("ที่พบบ่อย")+"</h2></div></div><div class='faq-list'>"+faq.map(function(q){return "<details class='faq-item'><summary>"+q[0]+"<span aria-hidden='true'>+</span></summary><p>"+q[1]+"</p></details>"}).join("")+"</div></section>"+
"<section class='pricing-end reveal'><div class='eyebrow'>LET'S WORK TOGETHER</div><h2>มีงานออกแบบที่อยากให้ช่วยไหมครับ?</h2><p>ทักมาคุยรายละเอียดกันก่อนได้เลยครับ รับงานออนไลน์ทั่วประเทศ ติดต่อได้ทุกวัน ตอบกลับเมื่อสะดวก</p><div class='pricing-end-actions'>"+directLine("ทัก LINE คุยงาน ↗")+btn("ดูราคาแพ็กเกจ",u("pricing"),"soft")+"</div></section>"
);
}
function categoryCard(c,i){
var it=item(c.key);
return "<a class='catalog-card catalog-card-v4 reveal' style='transition-delay:"+(i%3*65)+"ms' href='"+u("gallery",c.key)+"' aria-label='"+clean(c.en+" "+c.title)+"'>"+
"<div class='catalog-thumb'>"+image(it.id,c.title,550)+fall()+"</div>"+
"<div class='catalog-info'><span class='catalog-mini-icon'>"+iconSVG(c.key)+"</span>"+
labelPair(c,"catalog-bilingual")+"<span class='catalog-desc'>"+clean(c.desc)+"</span>"+
"<span class='catalog-go'>ดูผลงาน <span aria-hidden='true'>↗</span></span></div></a>"
}
function categories(){
return shell(header("MY WORK / 15 CATEGORIES","เลือกดู"+grad("ผลงาน")+"ตามหมวด","ผมแยกผลงานที่เคยทำไว้เป็นหมวด ๆ ลองเลือกดูหมวดที่สนใจได้เลยครับ",true)+
"<section class='section category-list-section'><div class='catalog'>"+cats.map(categoryCard).join("")+"</div></section>")
}

function artworkCard(it,c,i,featured){var el=featured?"a":"button",action=featured?"href='"+u("gallery",c.key)+"'":"type='button' data-light-index='"+i+"'",css=featured?"masonry-item featured-item reveal":"masonry-item gallery-item reveal";return "<"+el+" class='"+css+"' "+action+" aria-label='"+(featured?"ดูหมวด ":"ขยายภาพ ")+clean(c.title)+"'>"+image(it.id,c.title,featured?900:850)+fall()+"<span aria-hidden='true' class='image-shine'></span>"+(featured?"<span class='featured-label'><span class='featured-bilingual'><strong>"+clean(c.en)+"</strong><small>"+clean(c.title)+"</small></span><span aria-hidden='true'>↗</span></span>":"")+"</"+el+">"}
function endSection(){return "<div class='work-end reveal'><div><h2>อยากดูงานแบบอื่นอีกไหมครับ?</h2><p>มีงานหลายแบบให้เลือกดูครับ กดเลือกหมวดที่สนใจได้เลย</p></div>"+btn("ดูหมวดทั้งหมด ↗",u("categories"))+"</div>"}
function featured(){
return shell(header("SELECTED WORKS","ผลงาน"+grad("ที่อยากให้ลองดู"),"ผมเลือกงานจากทั้ง 15 หมวดมาให้ดูเป็นตัวอย่างก่อนครับ ถ้าชอบแนวไหนก็กดเข้าไปดูงานในหมวดนั้นต่อได้เลย",true)+
"<section class='section'><div class='portfolio-masonry featured-masonry'>"+
featuredData.map(function(w,i){var c=cats.find(function(x){return x.key===w.key});return artworkCard(w,c,i,true)}).join("")+
"</div>"+endSection()+"</section>")
}

function categoryRail(active){
return "<div class='category-nav-box'><div class='category-nav-title'>อยากดูหมวดอื่น? เลือกจากแถบนี้ได้เลยครับ →</div>"+
"<div class='category-scroll'><nav class='category-chips' aria-label='เลือกหมวดผลงาน'>"+
cats.map(function(c){return "<a class='category-chip' "+(active===c.key?"aria-current='page' ":"")+"href='"+u("gallery",c.key)+"'>"+iconSVG(c.key,"nav-symbol")+"<span class='rail-text'><strong>"+clean(c.en)+"</strong><small>"+clean(c.title)+"</small></span></a>"}).join("")+
"</nav></div></div>"
}
function gallery(){
var works=groups[current.key]||[];lightItems=works;
var intro=header("MY WORK / "+clean(current.en),clean(current.en)+" <span class='heading-th'>"+clean(current.title)+"</span>",clean(current.desc),true)+
"<div class='gallery-header'><div class='crumbs'><a href='"+u("categories")+"'>หมวดผลงาน</a> / "+clean(current.title)+"</div>"+
"<span class='gallery-count'>คลิกที่รูปเพื่อดูภาพใหญ่ได้เลยครับ</span></div>"+categoryRail(current.key);
var cards=current.key==="mascot"?
"<div class='mascot-showcase'><button class='mascot-display gallery-item' type='button' data-light-index='0' aria-label='ขยายภาพมาสคอต'>"+
image(works[0].id,"ผลงานมาสคอต",1750)+fall()+"</button><div class='mascot-info'><div class='eyebrow'>CHARACTER DESIGN</div><h3>งานออกแบบ"+grad("มาสคอต")+"</h3><p>นี่คืองานออกแบบมาสคอตน้องรวงข้าวที่ผมเคยทำครับ</p>"+btn("ดูหมวดอื่น",u("categories"),"soft")+"</div></div>":
"<div class='portfolio-masonry gallery-masonry'>"+works.map(function(w,i){return artworkCard(w,current,i,false)}).join("")+"</div>";
var poster=current.key==="poster"?
"<div class='work-end reveal'><div><h2>อยากดูโปสเตอร์อื่น ๆ อีกไหมครับ?</h2><p>ผมมีรวมไว้อีกหลายงานใน Google Photos ครับ</p></div>"+
"<a class='btn primary' target='_blank' rel='noopener noreferrer' href='https://photos.app.goo.gl/79buugzdZDSmo2FR9'>ดูผลงานเพิ่มเติม ↗</a></div>":"";
return shell(intro+"<section class='section gallery-art-section' style='padding-top:4px'>"+cards+poster+endSection()+"</section>")
}

var socialIconPaths={"line":"M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314","instagram":"M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077","facebook":"M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"};
function socialIcon(icon,color,backup){
 var path=socialIconPaths[icon];
 return "<span class='contact-icon' style='background:#fff;color:#"+color+"'>"+
 (path?"<svg class='social-img' width='28' height='28' viewBox='0 0 24 24' aria-hidden='true' focusable='false'><path fill='currentColor' d='"+path+"'></path></svg>":"<span class='social-backup'>"+backup+"</span>")+
 "</span>";
}
function about(){
var portrait=profiles[1]||profiles[0];
var bio="<section class='section about-layout'><div class='about-portrait reveal'>"+image(portrait,"รูปผม สุข วรชิต ภูลายยาว",1100)+fall()+"</div>"+
"<div class='about-content reveal'><div class='eyebrow'>HELLO, I'M SUK</div>"+
"<h2>สวัสดีครับ ผม<br>"+grad('&quot;สุข&quot; วรชิต ภูลายยาว')+"</h2>"+
"<p>ผมทำงานด้านกราฟิกดีไซน์มาตั้งแต่ปี 2017 ครับ หลัก ๆ จะเป็นงานโปสเตอร์คอนเสิร์ต โลโก้ ภาพโฆษณา และงานออกแบบอื่น ๆ ที่เห็นในเว็บนี้เลยครับ</p>"+
"<p>ผมทำงานในฐานะ Freelance Graphic Designer รับงานออนไลน์ทั่วประเทศ รวมถึงลูกค้าคนไทยในต่างประเทศ สามารถพูดคุยรายละเอียดและตกลงขอบเขตงานกันได้โดยตรงครับ</p>"+
"<div class='about-facts'><span>✦ ประสบการณ์ 9 ปี (ตั้งแต่ 2017)</span><span>✦ Freelance Graphic Designer</span><span>✦ รับงานออนไลน์ทั่วประเทศ</span></div></div></section>";
var skills="<section class='section'>"+title("MY ADOBE TOOLS","โปรแกรมที่"+grad("ผมใช้งาน"))+
"<p class='section-sub skills-intro'>ผมใช้ Adobe Photoshop, Adobe Illustrator และ Adobe Lightroom ในการทำงานกราฟิกครับ สำหรับงานวิดีโอหรือโมชั่นกราฟิกสามารถรับงานโดยมีทีมช่วยดำเนินการได้</p>"+skillCards()+"</section>";
var contacts=contactChannels();
var cards=contacts.map(function(c){return "<a class='contact-card' "+(c.url.indexOf("http")===0?"target='_blank' rel='noopener noreferrer' ":"")+"href='"+clean(c.url)+"'>"+c.icon+"<span><small>"+c.name+"</small><strong>"+clean(c.value)+"</strong></span></a>"}).join("");
var qr=D.qr?"<div class='contact-qr'>"+image(D.qr,"QR Code LINE worachit98",580)+"<span>QR Code สำหรับ LINE ส่วนตัว: worachit98</span></div>":"";
var contact="<section class='section' id='contact'><div class='contact-panel reveal'><div class='contact-grid'><div>"+
"<div class='eyebrow'>CONTACT ME</div><h2 class='section-title'>คุยเรื่อง"+grad("งานออกแบบ")+"กันครับ</h2>"+
"<p class='section-sub'>สนใจงานออกแบบ หรืออยากสอบถามรายละเอียดเพิ่มเติม ติดต่อผมได้ตามช่องทางด้านล่างเลยครับ</p>"+
"<div class='contacts'>"+cards+teamLineCard()+"</div></div><div>"+qr+"</div></div></div></section>";
return shell(header("ABOUT / SUKH","เกี่ยวกับ"+grad("ผม"),"สวัสดีครับ ผมสุข ยินดีที่ได้รู้จักครับ ลองทำความรู้จักผมและติดต่อพูดคุยกันได้ที่หน้านี้เลย",true)+bio+skills+contact)
}

function reveal(){
var els=document.querySelectorAll(".reveal"),reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if(reduced||!window.IntersectionObserver){els.forEach(function(el){el.classList.add("visible")});return}
var o=new window.IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("visible");o.unobserve(e.target)}})},{threshold:.04,rootMargin:"0px 0px 90px 0px"});document.body.classList.add("motion-ready");els.forEach(function(el){o.observe(el)})}
function motion(){if(!window.matchMedia||window.matchMedia("(max-width: 950px)").matches||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
var els=document.querySelectorAll(".parallax-decor");if(!els.length)return;var busy=false;
function apply(){els.forEach(function(el){var r=el.getBoundingClientRect();if(r.bottom>0&&r.top<window.innerHeight){var off=Math.max(-26,Math.min(26,(window.innerHeight/2-r.top-r.height/2)*.04));el.style.transform="translate3d(0,"+off+"px,0)"}});busy=false}
window.addEventListener("scroll",function(){if(!busy){busy=true;window.requestAnimationFrame(apply)}},{passive:true});apply()}
function imageError(im){
if(!im.classList.contains("art-image"))return;var n=Number(im.dataset.retry||0),id=im.dataset.file;
if(n===0){im.dataset.retry="1";im.src="https://lh3.googleusercontent.com/d/"+encodeURIComponent(id)+"=w1600";return}
if(n===1){im.dataset.retry="2";im.src="https://drive.google.com/uc?export=view&id="+encodeURIComponent(id);return}
if(im.id==="lbImage"){lb.classList.add("image-failed");document.getElementById("lbSource").href=drive(id);return}im.parentElement.classList.add("has-fallback");if(im.parentElement.tagName==="A"&&im.parentElement.classList.contains("hero-work"))im.parentElement.href=drive(id)}
document.addEventListener("error",function(ev){var t=ev.target;if(!t||t.tagName!=="IMG")return;if(t.classList.contains("art-image"))imageError(t);else if(t.classList.contains("brand-img"))t.parentElement.classList.add("is-fallback");else if(t.classList.contains("social-img")){t.style.display="none";var b=t.nextElementSibling;if(b){b.classList.remove("sr-only");b.style.fontWeight="900";b.style.fontSize="14px"}}},true);
var lb=document.getElementById("lightbox"),lbImg=document.getElementById("lbImage"),lbInner=document.getElementById("lbInner");
function openLight(i){if(!lb||!lightItems.length)return;lightIndex=(i+lightItems.length)%lightItems.length;var it=lightItems[lightIndex];
if(!lb.classList.contains("open"))focusBefore=document.activeElement;lb.classList.remove("zoomed","image-failed");document.getElementById("lbZoom").setAttribute("aria-pressed","false");lbImg.dataset.file=it.id;lbImg.dataset.retry="0";var cached=preloadImages.get(src(it.id,850));var existing=document.querySelector("img.art-image[data-file=\u0022"+it.id+"\u0022]");var ready=existing&&existing.complete&&existing.naturalWidth?existing.currentSrc||existing.src:null;lbImg.src=ready||(cached&&cached.complete&&cached.naturalWidth?cached.src:src(it.id,850));preloadNear(lightIndex);lbImg.alt="ภาพผลงานขนาดใหญ่";lb.classList.add("open");document.body.classList.add("is-modal");
document.getElementById("lbPrev").style.display=lightItems.length>1?"grid":"none";document.getElementById("lbNext").style.display=lightItems.length>1?"grid":"none";document.getElementById("lbClose").focus()}
function closeLight(){if(!lb)return;lb.classList.remove("open","zoomed","image-failed");document.body.classList.remove("is-modal");if(focusBefore&&focusBefore.focus)focusBefore.focus()}
function changeLight(n){if(lb&&lb.classList.contains("open")&&lightItems.length>1)openLight(lightIndex+n)}
function zoomLight(){if(!lb)return;lb.classList.toggle("zoomed");if(lb.classList.contains("zoomed")&&lightItems[lightIndex]){var high=src(lightItems[lightIndex].id,2000),img=new Image();img.decoding="async";var activeId=lightItems[lightIndex].id;img.onload=function(){if(lb.classList.contains("open")&&lb.classList.contains("zoomed")&&lightItems[lightIndex]&&lightItems[lightIndex].id===activeId)lbImg.src=high};img.src=high}document.getElementById("lbZoom").setAttribute("aria-pressed",lb.classList.contains("zoomed")?"true":"false")}
function handler(id,fn){var el=document.getElementById(id);if(el)el.addEventListener("click",fn)}
handler("lbClose",closeLight);handler("lbNext",function(){changeLight(1)});handler("lbPrev",function(){changeLight(-1)});handler("lbZoom",zoomLight);
if(lb){lb.addEventListener("click",function(ev){if(ev.target===lb||ev.target===lbInner)closeLight()});lb.addEventListener("touchstart",function(ev){touchX=ev.changedTouches[0].screenX},{passive:true});lb.addEventListener("touchend",function(ev){var dx=ev.changedTouches[0].screenX-touchX;if(Math.abs(dx)>55&&!lb.classList.contains("zoomed"))changeLight(dx<0?1:-1)},{passive:true})}
document.addEventListener("keydown",function(e){if(!lb||!lb.classList.contains("open"))return;if(e.key==="Escape"){closeLight();e.preventDefault()}else if(e.key==="ArrowRight"){changeLight(1);e.preventDefault()}else if(e.key==="ArrowLeft"){changeLight(-1);e.preventDefault()}else if(e.key==="Tab"){var fs=["lbClose","lbZoom","lbPrev","lbNext"].map(function(id){return document.getElementById(id)}).filter(function(el){return el&&el.style.display!=="none"}),i=fs.indexOf(document.activeElement);if(e.shiftKey&&i===0){fs[fs.length-1].focus();e.preventDefault()}else if(!e.shiftKey&&i===fs.length-1){fs[0].focus();e.preventDefault()}}});
mount.addEventListener("click",function(e){var copyBtn=e.target.closest("[data-copy-line]");if(copyBtn){var id=copyBtn.getAttribute("data-copy-line");var ok=function(){copyBtn.textContent="คัดลอกแล้ว ✓";copyBtn.setAttribute("aria-label","คัดลอก LINE ID สำเร็จ")};var fallback=function(){var temp=document.createElement("textarea");temp.value=id;temp.style.position="fixed";temp.style.opacity="0";document.body.appendChild(temp);temp.select();var success=false;try{success=document.execCommand("copy")}catch(error){}document.body.removeChild(temp);if(success)ok();else window.prompt("คัดลอก LINE ID:",id)};if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(id).then(ok).catch(fallback)}else fallback();return}var homePoster=e.target.closest("[data-home-poster]");if(homePoster){lightItems=D.homePosterImages||groups.poster||[];openLight(Number(homePoster.dataset.homePoster));return}var b=e.target.closest("[data-light-index]");if(!b)return;var n=Number(b.dataset.lightIndex);if(b.classList.contains("has-fallback")){window.open(drive(lightItems[n].id),"_blank","noopener");return}openLight(n)});
var menu=document.getElementById("menuToggle"),nav=document.getElementById("siteNav");if(menu&&nav){menu.addEventListener("click",function(){var opened=nav.classList.toggle("open");menu.setAttribute("aria-expanded",opened?"true":"false");menu.textContent=opened?"×":"☰"})}
var contents=page==="home"?home():page==="selected"?featured():page==="categories"?categories():page==="gallery"?gallery():page==="pricing"?pricing():page==="services"?services():about();
document.body.classList.add("route-"+page);
mount.innerHTML=contents;
document.querySelectorAll("[data-nav]").forEach(function(el){var currentNav=page==="gallery"?"categories":page;if(el.dataset.nav===currentNav)el.setAttribute("aria-current","page");else el.removeAttribute("aria-current")});
if(page==="gallery"){var active=document.querySelector(".category-chip[aria-current='page']");if(active&&active.scrollIntoView)active.scrollIntoView({block:"nearest",inline:"center"})}
if(page==="about"&&(requested==="contact"||window.location.hash==="#contact"))window.setTimeout(function(){var x=document.getElementById("contact");if(x)x.scrollIntoView({block:"start",behavior:"auto"})},100);
document.title=(page==="gallery"?current.title:page==="selected"?"ผลงานเด่น":page==="about"?"เกี่ยวกับและติดต่อ":page==="categories"?"หมวดผลงาน":page==="pricing"?"ราคาและแพ็กเกจ":page==="services"?"บริการออกแบบ":"Graphic Design Portfolio")+" | worachitportfolio";
reveal();motion();
})();
