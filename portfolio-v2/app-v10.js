
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
{code:"Ps",name:"Photoshop",desc:"ออกแบบภาพและรีทัช",type:"primary",fg:"#31A8FF",bg:"#001E36"},
{code:"Ai",name:"Illustrator",desc:"เวกเตอร์และโลโก้",type:"primary",fg:"#FF9A00",bg:"#330000"},
{code:"Lr",name:"Lightroom",desc:"ปรับแต่งภาพถ่าย",type:"primary",fg:"#31C5F4",bg:"#001E36"},
{code:"Pr",name:"Premiere Pro",desc:"ตัดต่อวิดีโอ",type:"support",fg:"#9999FF",bg:"#00005B"},
{code:"Ae",name:"After Effects",desc:"โมชั่นกราฟิก",type:"support",fg:"#9999FF",bg:"#00005B"},
{code:"Cc",name:"CapCut",desc:"ตัดต่อคลิปสั้น",type:"support",fg:"#FFFFFF",bg:"#17191D"}];
function skillCards(){return "<div class='studio-tools'><div class='studio-tools-main'><div class='tool-group-title'><span>01 / MAIN WORKFLOW</span><strong>เครื่องมือหลัก</strong></div><div class='studio-tool-grid'>"+
 skillData.filter(function(x){return x.type==="primary"}).map(function(x){return "<article class='studio-tool'><span class='tool-mark' style='--tool-bg:"+x.bg+";--tool-fg:"+x.fg+"'>"+x.code+"</span><div><strong>"+x.name+"</strong><small>"+x.desc+"</small></div></article>"}).join("")+"</div></div>"+
 "<div class='studio-tools-support'><div class='tool-group-title'><span>02 / TEAM SUPPORT</span><strong>งานตัดต่อและโมชั่น</strong></div><p>สำหรับงานวิดีโอและโมชั่นกราฟิก มีทีมงานร่วมดูแลการผลิต</p><div class='studio-tool-grid studio-tool-small'>"+
 skillData.filter(function(x){return x.type==="support"}).map(function(x){return "<article class='studio-tool'><span class='tool-mark' style='--tool-bg:"+x.bg+";--tool-fg:"+x.fg+"'>"+(x.code==="Cc"?"<svg viewBox='0 0 32 32' aria-hidden='true'><path d='M6 9H26V13H6ZM7 23L25 10M7 10L25 23M6 19H26V23H6Z' stroke='currentColor' stroke-width='2.8' fill='none' stroke-linejoin='round'/></svg>":x.code)+"</span><div><strong>"+x.name+"</strong><small>"+x.desc+"</small></div></article>"}).join("")+"</div></div></div>"}

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
 return "<div class='team-line-card'><div class='team-line-symbol'>"+socialIcon("line","06C755","LINE")+"</div><div class='team-line-info'><small>LINE ส่วนตัว</small><strong>worachit98</strong><span>ค้นหาด้วย LINE ID — ยังไม่มีลิงก์เพิ่มเพื่อนที่ยืนยันแล้ว</span></div><button type='button' class='copy-line-btn' data-copy-line='worachit98' aria-label='คัดลอก LINE ID ของทีม'>คัดลอก ID</button></div>";
}


function home(){
var p=D.homePosterImages||groups.poster||[];
function poster(i,cls){var art=p[i];return art?"<button class='ed-art "+(cls||"")+"' type='button' data-home-poster='"+i+"' aria-label='ดูภาพผลงานโปสเตอร์ "+(i+1)+"'><span class='ed-art-frame'>"+image(art.id,"โปสเตอร์คอนเสิร์ต ผลงาน "+(i+1),950,i<2)+fall()+"</span><span class='ed-art-caption'><span>SELECTED POSTER / "+String(i+1).padStart(2,"0")+"</span><span>↗</span></span></button>":""}
var hero="<section class='ed-hero'><div class='ed-hero-issue'><span>WORACHIT® / CREATIVE PORTFOLIO</span><span>INDEPENDENT DESIGNER · THAILAND</span></div><div class='ed-hero-layout'><div class='ed-hero-copy'><div class='ed-status'><i></i> FREELANCE GRAPHIC DESIGNER · SINCE 2017</div><h1 class='v11-hero-title'>GRAPHIC<br>DESIGNER<br><em>PORTFOLIO.</em></h1><p class='ed-hero-thai'>กราฟิกดีไซน์ที่โดดเด่น<br>และสื่อสารได้ตรงจุด</p><p class='ed-hero-desc'>ผมสุข วรชิต ภูลายยาว รับออกแบบโปสเตอร์คอนเสิร์ต ภาพโฆษณา และสื่อออนไลน์ สำหรับแบรนด์และธุรกิจทั่วประเทศ</p><div class='ed-hero-actions'>"+btn("ดูผลงาน ↗",u("selected"))+directLine("LINE · คุยงาน","line-link")+"</div><div class='ed-hero-foot'><span>POSTERS / ADS / VISUAL DESIGN</span><span>SCROLL TO EXPLORE ↓</span></div></div><div class='ed-hero-art v10-interactive-art'><span class='v10-hero-tracer' aria-hidden='true'></span><span class='v10-hero-asterisk' aria-hidden='true'>✳</span><span class='v10-hero-coordinate' aria-hidden='true'>VISUAL STUDIO / 017</span>"+poster(0,"ed-hero-poster p-one")+poster(1,"ed-hero-poster p-two")+"<span class='ed-visual-stamp'>GRAPHIC<br>DESIGN<br>STUDIO ✳</span></div></div></section>";
var works="<section class='ed-section ed-work' id='featured'><div class='ed-section-head'><div><span class='ed-section-label'>01 / FEATURED WORK</span><h2>SELECTED <i>WORK.</i></h2><p>ผลงานโปสเตอร์คอนเสิร์ตและอีเวนต์ที่คัดเลือกมา</p></div>"+btn("ดูผลงานทั้งหมด ↗",u("selected"),"soft")+"</div><div class='ed-work-grid'>"+[0,1,2,3,4,5].map(function(i){return poster(i,i===0?"ed-feature-lead":"")}).join("")+"</div></section>";
var priorities=[["poster","POSTER & CONCERT","โปสเตอร์คอนเสิร์ตและศิลปิน"],["product","ADVERTISING","โฆษณาสินค้าและธุรกิจ"],["logo","LOGO & IDENTITY","โลโก้และอัตลักษณ์แบรนด์"],["lineup","ARTIST LINEUP","ตารางศิลปินและสื่ออีเวนต์"],["cover","SOCIAL MEDIA","ภาพปกและสื่อโซเชียล"],["promo","PROMOTION","ภาพโปรโมชันและแคมเปญ"]];
var kinds="<section class='ed-section ed-category-section'><div class='ed-section-head'><div><span class='ed-section-label'>02 / EXPLORE BY CATEGORY</span><h2>FIND YOUR <i>STYLE.</i></h2><p>เลือกดูผลงานตามประเภทที่สนใจ</p></div>"+btn("ดูครบ 15 หมวด ↗",u("categories"),"soft")+"</div><div class='ed-category-grid'>"+priorities.map(function(c,i){var art=item(c[0]);return "<a class='ed-category' href='"+u("gallery",c[0])+"'><span class='ed-category-no'>0"+(i+1)+"</span><span class='ed-category-image'>"+(art?image(art.id,c[2],520):"")+"</span><span class='ed-category-info'><b>"+c[1]+"</b><small>"+c[2]+"</small></span><span class='ed-category-arrow'>↗</span></a>"}).join("")+"</div></section>";
var note="<section class='ed-about-strip'><span>03 / INDEPENDENT DESIGNER</span><p>ผมทำงานด้านกราฟิกมาตั้งแต่ปี 2017 เน้นงานที่ชัดเจน ใช้งานได้จริง และมีเอกลักษณ์ในแต่ละโปรเจกต์</p>"+btn("รู้จักผมเพิ่มเติม ↗",u("about"),"soft")+"</section>";
var price="<section class='ed-price-strip v10-home-pricing'><div><span>04 / DESIGN PACKAGES</span><h2>GOOD DESIGN.<br><em>CLEAR PRICING.</em></h2><p>General Ads เริ่มต้น 300 บาท · Concert Ads เริ่มต้น 600 บาท</p></div>"+btn("ดูแพ็กเกจ ↗",u("pricing"))+"</section>";
var contact="<section class='ed-contact-end'><div><span>HAVE A PROJECT IN MIND?</span><h2>LET'S MAKE<br><em>IT HAPPEN.</em></h2><p>ส่งรายละเอียดและภาพอ้างอิงมาคุยงานได้โดยตรง</p></div>"+directLine("LINE · ติดต่อออกแบบ ↗","line-link")+"</section>";
var marquee="<div class='v10-marquee' aria-label='บริการสร้างสรรค์งานโปสเตอร์ ภาพโฆษณา งานแบรนด์ และสื่ออีเวนต์'><div class='v10-marquee-track' aria-hidden='true'>"+Array(3).fill(["POSTER DESIGN","✳","VISUAL COMMUNICATION","✳","ART DIRECTION","✳","ADVERTISING","✳"].map(function(x){return "<span>"+x+"</span>"}).join("")).join("")+"</div></div>";
return shell(hero+marquee+works+kinds+note+price+contact)
}

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
var general=[[1,300],[5,1400],[10,2700],[20,5200],[30,7500]];
var concert=[[1,600],[2,1150],[3,1650],[4,2100],[5,2550],[6,3000]];
function money(n){return Number(n).toLocaleString("th-TH")}
function priceCard(entry,type,index){
  var n=entry[0],total=entry[1],isConcert=type==="concert",featured=n===5;
  var contents=isConcert?(n===1?"1 POSTER":"1 POSTER + "+(n-1)+" PROMO"):n+" ภาพโฆษณา";
  var explain=isConcert?(n===1?"โปสเตอร์หลักสำหรับประชาสัมพันธ์งาน":"โปสเตอร์หลัก 1 ภาพ และภาพโปรโมตในธีมเดียวกัน"):(n===1?"สำหรับโฆษณาหรือประชาสัมพันธ์หนึ่งชิ้น":"ชุดภาพสำหรับแบรนด์หรือแคมเปญเดียวกัน");
  var caption=isConcert?"CONCERT PACKAGE / "+String(index+1).padStart(2,"0"):"DESIGN SET / "+String(index+1).padStart(2,"0");
  return "<article class='v10-pcard "+(isConcert?"v10-concert-card":"v10-general-card")+(featured?" v10-recommended":"")+"'>"+
   "<div class='v10-pcard-top'><span>"+caption+"</span>"+(featured?"<b>ยอดนิยม</b>":"<i aria-hidden='true'>↗</i>")+"</div>"+
   "<div class='v10-pcard-count'><strong>"+String(n).padStart(2,"0")+"</strong><span>ภาพ</span></div>"+
   "<div class='v10-pcard-body'><h3>"+contents+"</h3><p>"+explain+"</p></div>"+
   "<div class='v10-pcard-bottom'><div><small>ราคารวมแพ็กเกจ</small><strong>"+money(total)+" <span>บาท</span></strong></div>"+
   (isConcert?"<span class='v10-pcard-micro'>ONE EVENT / ONE VISUAL THEME</span>":"<span class='v10-pcard-micro'>เฉลี่ย "+money(Math.round(total/n))+" บาท / ภาพ</span>")+"</div>"+
   directLine("ปรึกษาแพ็กเกจ ↗","price-line")+"</article>";
}
function pack(type,heading,subtitle,rows){
 var isConcert=type==="concert";
 var art=isConcert?"<div class='v10-poster-art' aria-hidden='true'><span class='v10-ticket-word'>LIVE<br>SHOW</span><span class='v10-ticket-star'>✳</span><span class='v10-ticket-small'>POSTER + PROMOTION</span></div>":"<div class='v10-ad-art' aria-hidden='true'><div class='v10-ad-card a'></div><div class='v10-ad-card b'></div><div class='v10-ad-ring'>AD.</div></div>";
 var highlights=isConcert?["โปสเตอร์หลัก 1 ภาพ","ภาพโปรโมตเสริม","ธีมงานเดียวกัน"]:["Social Media","สินค้า / ร้านค้า","ภาพโฆษณาแคมเปญ"];
 return "<section class='v10-package v10-package-"+type+"' id='"+type+"'>"+
  "<div class='v10-package-head'><div class='v10-head-copy'><div class='v10-pack-meta'><span>"+(isConcert?"02 / CONCERT ADS":"01 / GENERAL ADS")+"</span><span>"+(isConcert?"START AT ฿600":"START AT ฿300")+"</span></div>"+
  "<span class='v10-pack-kicker'>"+(isConcert?"EVENT / MUSIC / ENTERTAINMENT":"BRAND / PRODUCT / SOCIAL MEDIA")+"</span>"+
  "<h2>"+heading+"</h2><p>"+subtitle+"</p><div class='v10-pills'>"+highlights.map(function(k){return "<span>"+k+"</span>"}).join("")+"</div></div>"+art+"</div>"+
  "<div class='v10-package-body'><div class='v10-package-caption'><strong>"+(isConcert?"CONCERT PACKAGES":"ADVERTISING PACKAGES")+"</strong><span>เลือกจำนวนภาพตามต้องการ</span></div><div class='v10-cards v10-cards-"+type+"'>"+rows.map(function(x,i){return priceCard(x,type,i)}).join("")+"</div></div></section>";
}
var terms=[
["ไฟล์ที่ได้รับ","ส่ง JPG / PNG คุณภาพสูง พร้อมไฟล์ต้นฉบับ PSD หรือ AI ตามโปรแกรมที่ใช้"],
["แก้ไขงาน","แก้ไขฟรีภายในขอบเขตบรีฟเดิม หากเปลี่ยนคอนเซปต์หลักจะประเมินราคาใหม่ก่อนดำเนินการ"],
["ระยะเวลาส่งงาน","งานทั่วไปประมาณ 1–2 วันต่อภาพหลังได้รับบรีฟครบถ้วน งานหลายภาพและงานด่วนขึ้นอยู่กับคิวงาน"],
["การชำระเงิน","มัดจำอย่างน้อย 50% ก่อนเริ่มงาน ชำระส่วนที่เหลือก่อนรับไฟล์งานสมบูรณ์ หากยกเลิกหลังเริ่มงานจะไม่คืนมัดจำตามข้อตกลง"],
["ข้อควรทราบ","แพ็กเกจสำหรับแบรนด์หรืออีเวนต์เดียวกัน ไม่รวมการพิมพ์หรือผลิตชิ้นงานจริง และลูกค้าต้องมีสิทธิ์ใช้รูปภาพ โลโก้ หรือเนื้อหาที่ส่งมา"]
];
return shell("<section class='ed-page-hero v10-price-hero'><span class='ed-section-label'>DESIGN PACKAGES / WORACHIT</span><h1>CHOOSE THE<br><em>RIGHT FORMAT.</em></h1><p>งานโฆษณาแต่ละแบบมีเป้าหมายต่างกัน ผมจึงแยกแพ็กเกจเป็นสองประเภทให้เลือกได้ชัดเจน</p><nav class='v10-package-nav' aria-label='เลือกแพ็กเกจ'><a href='#general' class='v10-pnav-general'><span>A / GENERAL ADS</span><strong>ภาพโฆษณาทั่วไป</strong><small>สำหรับสินค้า ธุรกิจ และโซเชียล · เริ่ม 300 บาท</small><i>↘</i></a><a href='#concert' class='v10-pnav-concert'><span>B / CONCERT ADS</span><strong>โปสเตอร์คอนเสิร์ต</strong><small>โปสเตอร์หลัก + ภาพโปรโมต · เริ่ม 600 บาท</small><i>↘</i></a></nav></section>"+
"<div class='v10-price-guide'><span class='v10-guide-number'>01 — 02</span><p>เลือกแบบที่เหมาะกับโปรเจกต์ แล้วเลือกจำนวนภาพในแพ็กเกจได้เลย</p><span class='v10-guide-arrow' aria-hidden='true'>↓</span></div>"+
pack("general","ภาพโฆษณา<br><em>GENERAL ADS</em>","ภาพโฆษณาสำหรับร้านค้า สินค้า โปรโมชัน และสื่อออนไลน์ เลือกจำนวนชิ้นที่เหมาะกับการใช้งานได้",general)+
"<div class='v10-between-packs' aria-hidden='true'><span>CREATIVE WORK / DIFFERENT PURPOSE</span><b>✳</b><span>02 / ENTERTAINMENT PACKAGES</span></div>"+
pack("concert","โปสเตอร์คอนเสิร์ต<br><em>CONCERT ADS</em>","เริ่มจาก 1 POSTER หลัก และเพิ่มภาพโปรโมตเพื่อสื่อสารงานคอนเสิร์ต อีเวนต์ และศิลปินภายใต้ธีมเดียวกัน",concert)+
"<div class='ed-price-note'><strong>งานอื่นนอกแพ็กเกจ</strong><span>งานโลโก้ รีทัช วิดีโอ และงานออกแบบเฉพาะทาง ประเมินราคาตามรายละเอียดของโปรเจกต์</span>"+directLine("สอบถามราคา ↗","line-link")+"</div>"+
"<section class='ed-terms' id='terms'><div class='ed-section-head'><div><span class='ed-section-label'>BEFORE WE START</span><h2>ข้อตกลงการทำงาน</h2></div></div><div class='ed-term-list'>"+terms.map(function(t,i){return "<details class='ed-term'><summary><b>0"+(i+1)+"</b><strong>"+t[0]+"</strong><span>+</span></summary><p>"+t[1]+"</p></details>"}).join("")+"</div></section>"+
"<section class='ed-contact-end ed-price-footer'><div><span>READY TO START?</span><h2>LET'S TALK<br><em>DESIGN.</em></h2><p>แจ้งประเภทงาน จำนวนภาพ และกำหนดส่งที่ต้องการได้เลย</p></div>"+directLine("LINE · สอบถามงาน ↗","line-link")+"</section>")
}


function services(){
var offers=[
["โปสเตอร์คอนเสิร์ตและอีเวนต์","โปสเตอร์ศิลปิน งานดนตรี DJ / MC และสื่อโปรโมตในธีมเดียวกัน","poster"],
["ภาพโฆษณาและโปรโมชัน","ภาพสำหรับสินค้า ร้านค้า คาเฟ่ Facebook และ Instagram","product"],
["ออกแบบโลโก้และอัตลักษณ์","โลโก้แบรนด์ งานตัวอักษร และองค์ประกอบภาพลักษณ์","logo"],
["สื่อโซเชียลและภาพปก","ภาพปกเพจ ภาพปกวิดีโอ แบนเนอร์ และสื่อประกาศ","cover"],
["ออกแบบสำหรับงานพิมพ์","ป้าย เมนู เสื้อ และไฟล์กราฟิกสำหรับนำไปผลิตต่อ","sign"],
["งานวิดีโอและโมชั่น","วิดีโอสั้น งานตัดต่อ และโมชั่นกราฟิก โดยร่วมงานกับทีมตัดต่อ","youtube"]
];
return shell("<section class='ed-page-hero'><span class='ed-section-label'>DESIGN SERVICES / WHAT I DO</span><h1>WHAT I<br><em>DESIGN.</em></h1><p>รับออกแบบกราฟิกสำหรับงานบันเทิง ธุรกิจ และสื่อออนไลน์ ด้วยแนวทางที่เหมาะกับแต่ละโปรเจกต์</p></section>"+
"<section class='ed-services-list'>"+offers.map(function(x,i){var art=item(x[2]);return "<a href='"+u("gallery",x[2])+"' class='ed-service-row'><span class='ed-service-number'>0"+(i+1)+"</span><span class='ed-service-visual'>"+(art?image(art.id,x[0],480):"")+"</span><span class='ed-service-title'><strong>"+x[0]+"</strong><small>"+x[1]+"</small></span><span class='ed-service-arrow'>↗</span></a>"}).join("")+"</section>"+
"<section class='ed-service-scope'><span>PROJECT SCOPE</span><div><h2>ออกแบบไฟล์ พร้อมนำไปใช้งาน</h2><p>รับงานออนไลน์ทั่วประเทศ ส่งไฟล์ดิจิทัลตามบรีฟ ไม่รวมบริการพิมพ์หรือผลิตชิ้นงานจริง ส่วนงานวิดีโอและโมชั่นกราฟิกมีทีมร่วมดูแลและประเมินราคาตามขอบเขตงาน</p></div></section>"+
"<section class='ed-contact-end'><div><span>START A PROJECT</span><h2>HAVE AN IDEA?<br><em>LET'S TALK.</em></h2><p>ส่งตัวอย่างงานที่ชอบ รายละเอียด และกำหนดส่งมาคุยกันได้เลย</p></div>"+directLine("LINE · คุยรายละเอียด ↗","line-link")+"</section>")
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
return shell("<section class='ed-page-hero'><span class='ed-section-label'>PORTFOLIO / ALL CATEGORIES</span><h1>EXPLORE<br><em>THE WORK.</em></h1><p>15 หมวดผลงาน ตั้งแต่งานโปสเตอร์คอนเสิร์ตจนถึงกราฟิกสำหรับแบรนด์และธุรกิจ</p></section>"+
"<section class='ed-archive'><div class='ed-archive-label'><span>WORK ARCHIVE</span><span>15 CATEGORIES ↘</span></div><div class='catalog'>"+cats.map(categoryCard).join("")+"</div></section>")
}

function artworkCard(it,c,i,featured){var el=featured?"a":"button",action=featured?"href='"+u("gallery",c.key)+"'":"type='button' data-light-index='"+i+"'",css=featured?"masonry-item featured-item reveal":"masonry-item gallery-item reveal";return "<"+el+" class='"+css+"' "+action+" aria-label='"+(featured?"ดูหมวด ":"ขยายภาพ ")+clean(c.title)+"'>"+image(it.id,c.title,featured?900:850)+fall()+"<span aria-hidden='true' class='image-shine'></span>"+(featured?"<span class='featured-label'><span class='featured-bilingual'><strong>"+clean(c.en)+"</strong><small>"+clean(c.title)+"</small></span><span aria-hidden='true'>↗</span></span>":"")+"</"+el+">"}
function endSection(){return "<div class='work-end reveal'><div><h2>อยากดูงานแบบอื่นอีกไหมครับ?</h2><p>มีงานหลายแบบให้เลือกดูครับ กดเลือกหมวดที่สนใจได้เลย</p></div>"+btn("ดูหมวดทั้งหมด ↗",u("categories"))+"</div>"}

function featured(){
return shell("<section class='ed-page-hero'><span class='ed-section-label'>PORTFOLIO / SELECTED WORKS</span><h1>BUILT TO<br><em>STAND OUT.</em></h1><p>คัดเลือกผลงานจากงานโปสเตอร์ โฆษณา โลโก้ และสื่อออนไลน์ เพื่อให้เห็นแนวทางออกแบบที่หลากหลาย</p></section>"+
"<section class='ed-archive'><div class='ed-archive-label'><span>SELECTED PROJECTS</span><a href='"+u("categories")+"'>เปิดดูครบ 15 หมวด ↗</a></div><div class='portfolio-masonry featured-masonry'>"+
featuredData.map(function(w,i){var c=cats.find(function(x){return x.key===w.key});return c?artworkCard(w,c,i,true):""}).join("")+
"</div><div class='ed-archive-bottom'>"+btn("ดูงานตามหมวดทั้งหมด ↗",u("categories"))+"</div></section>")
}

function categoryRail(active){
return "<div class='category-nav-box'><div class='category-nav-title'>อยากดูหมวดอื่น? เลือกจากแถบนี้ได้เลยครับ →</div>"+
"<div class='category-scroll'><nav class='category-chips' aria-label='เลือกหมวดผลงาน'>"+
cats.map(function(c){return "<a class='category-chip' "+(active===c.key?"aria-current='page' ":"")+"href='"+u("gallery",c.key)+"'>"+iconSVG(c.key,"nav-symbol")+"<span class='rail-text'><strong>"+clean(c.en)+"</strong><small>"+clean(c.title)+"</small></span></a>"}).join("")+
"</nav></div></div>"
}

function gallery(){
var works=groups[current.key]||[];lightItems=works;
var intro="<section class='ed-gallery-title'><div class='ed-gallery-breadcrumb'><a href='"+u("selected")+"'>ผลงาน</a><span>/</span><a href='"+u("categories")+"'>หมวดทั้งหมด</a><span>/</span><strong>"+clean(current.title)+"</strong></div><span class='ed-section-label'>"+clean(current.en)+" / PORTFOLIO</span><h1>"+clean(current.en)+"</h1><p>"+clean(current.title)+" · "+clean(current.desc)+"</p></section>"+categoryRail(current.key);
var cards=current.key==="mascot"?
"<div class='mascot-showcase'><button class='mascot-display gallery-item' type='button' data-light-index='0' aria-label='ขยายภาพมาสคอต'>"+image(works[0].id,"ผลงานมาสคอต",1750)+fall()+"</button><div class='mascot-info'><h3>งานออกแบบมาสคอต</h3><p>ตัวอย่างงานออกแบบตัวละคร</p></div></div>":
"<div class='portfolio-masonry gallery-masonry'>"+works.map(function(w,i){return artworkCard(w,current,i,false)}).join("")+"</div>";
return shell(intro+"<section class='ed-archive ed-gallery-archive'>"+cards+"<div class='ed-archive-bottom'>"+btn("ดูหมวดผลงานอื่น ↗",u("categories"),"soft")+"</div></section>")
}

var socialIconPaths={"line":"M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314","instagram":"M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077","facebook":"M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"};
function socialIcon(icon,color,backup){
 var path=socialIconPaths[icon];
 return "<span class='contact-icon' style='background:#fff;color:#"+color+"'>"+
 (path?"<svg class='social-img' width='28' height='28' viewBox='0 0 24 24' aria-hidden='true' focusable='false'><path fill='currentColor' d='"+path+"'></path></svg>":"<span class='social-backup'>"+backup+"</span>")+
 "</span>";
}

function about(){
var portrait='1xdVr4OBE2O1dKQz724wRGNm4tKW7pzf8',contacts=contactChannels();
return shell("<section class='ed-page-hero ed-about-hero'><span class='ed-section-label'>ABOUT / WORACHIT PULAIYAW</span><h1>HELLO, I'M<br><em>SUK.</em></h1><p>นักออกแบบกราฟิกอิสระ ที่ชอบเปลี่ยนโจทย์ให้กลายเป็นงานภาพที่ชัดเจนและมีเอกลักษณ์</p></section>"+
"<section class='ed-about-layout'><div class='ed-about-photo v10-photo-frame'><span class='v10-photo-stamp' aria-hidden='true'>SUK. / GRAPHIC DESIGNER</span>"+image(portrait,"สุข วรชิต ภูลายยาว",1000)+fall()+"</div><div class='ed-about-text'><span class='ed-section-label'>INDEPENDENT DESIGNER · SINCE 2017</span><h2>วรชิต ภูลายยาว<br><em>FREELANCE GRAPHIC DESIGNER</em></h2><p>ผมทำงานด้านกราฟิกดีไซน์มาตั้งแต่ปี 2017 โดยเน้นโปสเตอร์คอนเสิร์ต งานอีเวนต์ ภาพโฆษณา และสื่อประชาสัมพันธ์ รับงานออนไลน์ทั้งในประเทศไทยและต่างประเทศ</p><p>ทุกโปรเจกต์พูดคุยเรื่องรูปแบบ งานที่ต้องใช้ และกำหนดส่งร่วมกันได้โดยตรง</p><div class='ed-about-facts'><span>2017 — PRESENT</span><span>GRAPHIC / ADVERTISING / POSTER</span></div></div></section>"+
"<section class='ed-section ed-tools-section'><div class='ed-section-head'><div><span class='ed-section-label'>TOOLS & WORKFLOW</span><h2>DESIGN <i>TOOLKIT.</i></h2><p>งานกราฟิกเป็นความเชี่ยวชาญหลัก ส่วนงานวิดีโอมีทีมตัดต่อช่วยดำเนินการ</p></div></div>"+skillCards()+"</section>"+
"<section class='ed-contact-section' id='contact'><div class='ed-section-head'><div><span class='ed-section-label'>CONTACT / LET'S CONNECT</span><h2>LET'S <i>CONNECT.</i></h2><p>เลือกช่องทางติดต่อที่สะดวก หรือทัก LINE เพื่อคุยเรื่องงานได้โดยตรง</p></div></div><div class='ed-contact-list'>"+contacts.map(function(c){return "<a class='ed-contact-card' href='"+clean(c.url)+"' "+(c.url.indexOf("http")===0?"target='_blank' rel='noopener noreferrer'":"")+">"+c.icon+"<span><small>"+c.name+"</small><strong>"+clean(c.value)+"</strong></span><i>↗</i></a>"}).join("")+"</div></section>")
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
document.querySelectorAll("[data-nav]").forEach(function(el){var currentNav=page==="gallery"?"selected":page;if(el.dataset.nav===currentNav)el.setAttribute("aria-current","page");else el.removeAttribute("aria-current")});
if(page==="gallery"){var active=document.querySelector(".category-chip[aria-current='page']");if(active&&active.scrollIntoView)active.scrollIntoView({block:"nearest",inline:"center"})}
if(page==="about"&&(requested==="contact"||window.location.hash==="#contact"))window.setTimeout(function(){var x=document.getElementById("contact");if(x)x.scrollIntoView({block:"start",behavior:"auto"})},100);
document.title=(page==="gallery"?current.title:page==="selected"?"ผลงาน":page==="about"?"เกี่ยวกับและติดต่อ":page==="categories"?"หมวดผลงาน":page==="pricing"?"ราคาและแพ็กเกจ":page==="services"?"บริการออกแบบ":"Graphic Design Portfolio")+" | worachitportfolio";

reveal();motion();
(function(){
  var progress=document.getElementById("v10ReadingProgress");
  if(progress&&window.addEventListener){
    var busy=false;
    function updateProgress(){var doc=document.documentElement,range=Math.max(1,doc.scrollHeight-window.innerHeight);progress.style.width=Math.min(100,Math.max(0,window.scrollY/range*100)).toFixed(2)+"%";busy=false}
    window.addEventListener("scroll",function(){if(!busy){busy=true;(window.requestAnimationFrame||function(fn){fn()})(updateProgress)}},{passive:true});
    updateProgress();
  }
  var art=mount.querySelector&&mount.querySelector(".v10-interactive-art");
  if(art&&window.matchMedia&&window.matchMedia("(pointer:fine)").matches&&!window.matchMedia("(prefers-reduced-motion:reduce)").matches){
     art.addEventListener("pointermove",function(e){var r=art.getBoundingClientRect();art.style.setProperty("--vx",((e.clientX-r.left)/r.width*100).toFixed(1)+"%");art.style.setProperty("--vy",((e.clientY-r.top)/r.height*100).toFixed(1)+"%")});
     art.addEventListener("pointerleave",function(){art.style.removeProperty("--vx");art.style.removeProperty("--vy")});
  }
})();

})();
