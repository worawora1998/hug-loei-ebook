
(function(){
"use strict";
var dataNode=document.getElementById("portfolio-data"),mount=document.getElementById("app");
if(!dataNode||!mount)return;
var D;try{D=JSON.parse(dataNode.textContent)}catch(e){mount.innerHTML="<div class='shell'><h1>ไม่สามารถอ่านข้อมูลผลงานได้</h1><a href='?page=home'>กลับหน้าแรก</a></div>";return}
var cats=D.categories||[],groups=D.groups||{},featuredData=D.selected||[],assets=D.decor||[],profiles=D.profile||[];
var query=new URLSearchParams(window.location.search),requested=query.get("page")||"home",page=requested==="contact"?"about":requested;
if(["home","selected","categories","gallery","about"].indexOf(page)<0)page="home";
var key=query.get("cat")||"poster",current=cats.find(function(x){return x.key===key})||cats[0];
var lightItems=[],lightIndex=0,focusBefore=null,touchX=0;
function clean(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}
function u(page,cat){return "?page="+encodeURIComponent(page)+(cat?"&cat="+encodeURIComponent(cat):"")}
function src(id,width){return "https://drive.google.com/thumbnail?id="+encodeURIComponent(id)+"&sz=w"+(width||960)}
function drive(id){return "https://drive.google.com/file/d/"+encodeURIComponent(id)+"/view"}
function image(id,alt,width,eager){return "<img class='art-image' data-file='"+clean(id)+"' alt='"+clean(alt)+"' src='"+src(id,width)+"' loading='"+(eager?"eager":"lazy")+"' decoding='async'"+(eager?" fetchpriority='high'":"")+">"}
function fall(){return "<div class='art-fallback'><strong>ไม่สามารถโหลดภาพได้</strong><span>กดเพื่อเปิดภาพจาก Google Drive ↗</span></div>"}
function decor(id,classes){return id?"<img aria-hidden='true' alt='' loading='lazy' class='"+classes+"' src='"+src(id,650)+"'>":""}
function shell(x){return "<div class='shell page-enter'>"+x+"</div>"}
function grad(x){return "<span class='gradient-text'>"+x+"</span>"}
function btn(label,link,kind){return "<a class='btn "+(kind||"primary")+"' href='"+clean(link)+"'>"+label+"</a>"}
function header(en,title,description,panel){return "<header class='"+(panel?"page-hero":"page-head")+"'><div class='"+(panel?"page-head":"")+"'><div class='eyebrow'>"+en+"</div><h1 class='section-title'>"+title+"</h1><p class='section-sub'>"+description+"</p></div>"+(panel?decor(assets[6],"decor parallax-decor"):"")+"</header>"}
function title(en,text,link){return "<header class='section-kicker'><div><div class='eyebrow'>"+en+"</div><h2 class='section-title'>"+text+"</h2></div>"+(link?btn("ดูทั้งหมด ↗",link,"soft"):"")+"</header>"}
var skillData=[
{code:"Ps",name:"Photoshop",desc:"งานภาพ / รีทัช",color:"#31A8FF",bg:"#E6F7FF",glow:"#31A8FF40",icon:"photoshop"},
{code:"Ai",name:"Illustrator",desc:"เวกเตอร์ / โลโก้",color:"#FF9A00",bg:"#FFF2DB",glow:"#FF9A0040",icon:"illustrator"},
{code:"Lr",name:"Lightroom",desc:"ภาพถ่าย / โทนสี",color:"#15BCD8",bg:"#DCF9FF",glow:"#15BCD840",icon:"lightroom"},
{code:"Pr",name:"Premiere Pro",desc:"ตัดต่อวิดีโอ",color:"#8275F8",bg:"#F0EAFF",glow:"#8275F840",icon:"premierepro"},
{code:"Ae",name:"After Effects",desc:"โมชั่นกราฟิก",color:"#BD71F1",bg:"#F8EAFF",glow:"#BD71F140",icon:"aftereffects"}
];
function skillCards(){return "<div class='skill-grid'>"+skillData.map(function(x,i){return "<article class='skill-card reveal' style='--skill:"+x.color+";--skillbg:"+x.bg+";--skillglow:"+x.glow+";transition-delay:"+(i*45)+"ms'><div class='skill-logo'><img class='brand-img' alt='Adobe "+clean(x.name)+"' src='https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/"+x.icon+"/"+x.icon+"-original.svg' loading='lazy'><span class='skill-backup'>"+x.code+"</span></div><span class='skill-name'>"+x.name+"</span><span class='skill-caption'>"+x.desc+"</span></article>"}).join("")+"</div>"}
function item(cat){return (groups[cat]||[])[0]}
function home(){
var homeKeys=["poster","lineup","logo"],homeWorks=homeKeys.map(item);
var stage="<div class='hero-stage' aria-label='ตัวอย่างผลงานออกแบบ'>"+homeKeys.map(function(k,i){var it=homeWorks[i],cat=cats.find(function(c){return c.key===k});return "<a class='hero-work "+["a","b","c"][i]+"' href='"+u("gallery",k)+"' aria-label='ชมหมวด "+clean(cat.title)+"'>"+image(it.id,"ตัวอย่างผลงาน "+cat.title,1100,i===0)+fall()+"</a>"}).join("")+decor(assets[1],"hero-art-element one parallax-decor")+decor(assets[3],"hero-art-element two parallax-decor")+decor(assets[4],"hero-art-element three parallax-decor")+"<div class='hero-mini-label'>✦ งานออกแบบที่เล่าเรื่องด้วยภาพ</div></div>";
var first="<section class='hero'><div class='hero-copy'><div class='eyebrow'>GRAPHIC DESIGNER · PORTFOLIO 2026</div><h1 class='display'><span>DESIGN</span><span class='gradient-text'>WITH</span><span>IMPACT.</span></h1><div class='hero-name'>วรชิต ภูลายยาว</div><p class='hero-lead'>Portfolio นักออกแบบกราฟิกฟรีแลนซ์ งานสร้างสรรค์ที่ผสมความคิด สีสัน และรายละเอียด เพื่อให้ทุกโปรเจกต์มีเอกลักษณ์</p><div class='hero-actions'>"+btn("ผลงานเด่น ↗",u("selected"))+btn("หมวดงานทั้งหมด",u("categories"),"soft")+btn("เกี่ยวกับและติดต่อ",u("about"),"soft")+"</div><div class='hero-stats'><div class='hero-stat'><strong>9 ปี</strong><small>ประสบการณ์</small></div><div class='hero-stat'><strong>151</strong><small>ชิ้นงานในเว็บไซต์</small></div><div class='hero-stat'><strong>15</strong><small>หมวดผลงาน</small></div></div></div>"+stage+"</section>";
var words=["CREATIVE DESIGN","CONCERT POSTER","VISUAL STORYTELLING","BRAND IDENTITY","DIGITAL ART","CREATIVE DESIGN","CONCERT POSTER","VISUAL STORYTELLING","BRAND IDENTITY","DIGITAL ART"];
var marquee="<div class='ticker' aria-hidden='true'><div class='ticker-track'>"+words.map(function(w){return "<span><b>✦</b> "+w+"</span>"}).join("")+"</div></div>";
var showcase=["poster","lineup","logo"].map(function(k){var it=item(k),c=cats.find(function(x){return x.key===k});return "<a class='showcase-card reveal' href='"+u("gallery",k)+"'>"+image(it.id,c.title,1000)+fall()+"<span class='cover-label'>"+clean(c.title)+" ↗</span></a>"}).join("");
var previews="<section class='section'>"+title("FIRST LOOK","ผลงานที่เล่าเรื่องด้วยภาพ",u("selected"))+"<div class='showcase'>"+showcase+"</div></section>";
var skills="<section class='section'>"+title("ADOBE CREATIVE TOOLS","เครื่องมือที่ใช้สร้างงาน")+"<p class='section-sub skills-intro'>Photoshop, Illustrator, Lightroom, Premiere Pro และ After Effects</p>"+skillCards()+"</section>";
var shortcuts="<section class='section'>"+title("QUICK ACCESS","เข้าถึง <span class='gradient-text'>15 หมวด</span> ได้ทันที",u("categories"))+"<div class='category-shortcuts'>"+cats.map(function(c){return "<a class='shortcut reveal' href='"+u("gallery",c.key)+"'><span>"+clean(c.title)+"</span><i>↗</i></a>"}).join("")+"</div></section>";
var cta="<section class='section'><div class='work-end reveal'><div><h2>มีโปรเจกต์ที่อยากให้ช่วยออกแบบ?</h2><p>พูดคุยไอเดีย งานออกแบบ และรายละเอียดโปรเจกต์กันได้เลย</p></div>"+btn("ติดต่อร่วมงาน ↗",u("about")+"#contact")+"</div></section>";
return shell(first+marquee+previews+skills+shortcuts+cta)}
function categoryCard(c,i){var it=item(c.key);return "<a class='catalog-card reveal' style='transition-delay:"+(i%3*65)+"ms' href='"+u("gallery",c.key)+"'><div class='catalog-thumb'>"+image(it.id,c.title,750)+fall()+"</div><div class='catalog-info'><span class='catalog-en'>"+clean(c.en)+"</span><span class='catalog-title'>"+clean(c.title)+"</span><span class='catalog-desc'>"+clean(c.desc)+"</span><div class='catalog-bottom'><span class='count-pill'>"+(groups[c.key]||[]).length+" ผลงาน</span><span class='catalog-arrow'>↗</span></div></div></a>"}
function categories(){return shell(header("EXPLORE THE PORTFOLIO","สำรวจ"+grad("ผลงาน")+"ตามหมวด","15 ประเภทงาน เลือกหมวดที่ต้องการได้ทันที ตั้งแต่โปสเตอร์คอนเสิร์ตไปจนถึงงานสิ่งพิมพ์",true)+"<section class='section'><div class='catalog'>"+cats.map(categoryCard).join("")+"</div></section>")}
function artworkCard(it,c,i,featured){var el=featured?"a":"button",action=featured?"href='"+u("gallery",c.key)+"'":"type='button' data-light-index='"+i+"'",css=featured?"masonry-item featured-item reveal":"masonry-item gallery-item reveal";return "<"+el+" class='"+css+"' "+action+" aria-label='"+(featured?"ดูหมวด ":"ขยายภาพ ")+clean(c.title)+"'>"+image(it.id,c.title,featured?1150:1080)+fall()+"<span aria-hidden='true' class='image-shine'></span>"+(featured?"<span class='featured-label'>"+clean(c.title)+" <span>↗</span></span>":"")+"</"+el+">"}
function endSection(){return "<div class='work-end reveal'><div><h2>อยากดูแนวงานอื่นอีกไหม?</h2><p>ผลงานรวม 15 หมวด พร้อมให้เลือกชมได้ทันที</p></div>"+btn("ดูหมวดทั้งหมด ↗",u("categories"))+"</div>"}
function featured(){return shell(header("SELECTED WORKS","ผลงาน"+grad("เด่น")+" 15 หมวด","คัดงานจริงหมวดละหนึ่งชิ้น และจัดเรียงแบบ Masonry เพื่อรักษาสัดส่วนภาพให้ดูต่อเนื่องโดยไม่ครอบตัด",true)+"<section class='section'><div class='portfolio-masonry featured-masonry'>"+featuredData.map(function(w,i){var c=cats.find(function(x){return x.key===w.key});return artworkCard(w,c,i,true)}).join("")+"</div>"+endSection()+"</section>")}
function categoryRail(active){return "<div class='category-nav-box'><div class='category-nav-title'>เปลี่ยนหมวดผลงานได้ทันที — เลื่อนไปด้านข้างเพื่อดูหมวดอื่น →</div><div class='category-scroll'><nav class='category-chips' aria-label='เลือกหมวดผลงาน'>"+cats.map(function(c){return "<a class='category-chip' "+(active===c.key?"aria-current='page' ":"")+"href='"+u("gallery",c.key)+"'>"+clean(c.title)+"</a>"}).join("")+"</nav></div></div>"}
function gallery(){
var works=groups[current.key]||[];lightItems=works;
var intro=header(current.en,clean(current.title),clean(current.desc),true)+"<div class='gallery-header'><div class='crumbs'><a href='"+u("categories")+"'>หมวดผลงาน</a> / "+clean(current.title)+"</div><span class='gallery-count'>"+works.length+" ผลงาน · คลิกเพื่อขยาย</span></div>"+categoryRail(current.key);
var cards=current.key==="mascot"?"<div class='mascot-showcase'><button class='mascot-display gallery-item' type='button' data-light-index='0' aria-label='ขยายภาพมาสคอต'>"+image(works[0].id,"ผลงานมาสคอต",1750)+fall()+"</button><div class='mascot-info'><div class='eyebrow'>CHARACTER DESIGN</div><h3>งานออกแบบ"+grad("มาสคอต")+"</h3><p>มาสคอตน้องรวงข้าว — โชว์ผลงานชิ้นเดียวอย่างเต็มพื้นที่ และรักษาสัดส่วนต้นฉบับ</p>"+btn("ดูหมวดอื่น",u("categories"),"soft")+"</div></div>":"<div class='portfolio-masonry gallery-masonry'>"+works.map(function(w,i){return artworkCard(w,current,i,false)}).join("")+"</div>";
var poster=current.key==="poster"?"<div class='work-end reveal'><div><h2>โปสเตอร์ครบ 20 ภาพในหน้าเดียว</h2><p>ชมผลงานเพิ่มเติมในอัลบั้ม Google Photos</p></div><a class='btn primary' target='_blank' rel='noopener noreferrer' href='https://photos.app.goo.gl/79buugzdZDSmo2FR9'>ดูอัลบั้มเพิ่มเติม ↗</a></div>":"";
return shell(intro+"<section class='section' style='padding-top:4px'>"+cards+poster+endSection()+"</section>")}
function socialIcon(icon,color,backup){return "<span class='contact-icon' style='background:#fff'><img class='social-img' alt='' src='https://cdn.simpleicons.org/"+icon+"/"+color+"' loading='lazy'><span class='social-backup sr-only'>"+backup+"</span></span>"}
function about(){
var portrait=profiles[1]||profiles[0];
var bio="<section class='section about-layout'><div class='about-portrait reveal'>"+image(portrait,"วรชิต ภูลายยาว",1100)+fall()+"</div><div class='about-content reveal'><div class='eyebrow'>NICE TO MEET YOU</div><h2>สวัสดีครับ ผม<br>"+grad("วรชิต ภูลายยาว")+"</h2><p>Graphic Designer ฟรีแลนซ์ เริ่มทำงานตั้งแต่ปี 2017 มีประสบการณ์ 9 ปี และผลงานสะสมประมาณ 10,000+ ชิ้น เชี่ยวชาญงานโปสเตอร์คอนเสิร์ต โฆษณา และภาพสำหรับแบรนด์หรือธุรกิจหลากหลายประเภท</p><p>ผมใส่ใจรายละเอียด ส่งงานรวดเร็ว ยินดีปรับแก้ตามขอบเขตที่ตกลง และสามารถรับงานฟรีแลนซ์แบบ Remote / WFH ได้</p><div class='about-facts'><span>✦ 9 ปี ประสบการณ์</span><span>✦ 15 หมวดผลงาน</span><span>✦ ฟรีแลนซ์ / WFH</span></div></div></section>";
var skills="<section class='section'>"+title("ADOBE CREATIVE WORKFLOW","โปรแกรมที่"+grad("ใช้งาน"))+"<p class='section-sub skills-intro'>ถนัด Photoshop, Illustrator และ Lightroom เป็นพิเศษ ส่วน Premiere Pro และ After Effects ใช้งานเบื้องต้น</p>"+skillCards()+"</section>";
var facebook="https://www.facebook.com/search/people/?q=Worachit%20Pulaiyaw";
var contacts=[
{name:"LINE",value:"worachit98",url:"https://line.me/ti/p/~worachit98",icon:socialIcon("line","06C755","LINE")},
{name:"INSTAGRAM",value:"@wora_chit98",url:"https://www.instagram.com/wora_chit98/",icon:socialIcon("instagram","E4405F","IG")},
{name:"FACEBOOK",value:"ค้นหา Worachit Pulaiyaw",url:facebook,icon:socialIcon("facebook","0866FF","f")},
{name:"โทรศัพท์",value:"082-872-3646",url:"tel:0828723646",icon:"<span class='contact-icon' style='background:#e5f5ff;color:#236fa9' aria-hidden='true'>☎</span>"}
];
var cards=contacts.map(function(c){return "<a class='contact-card' "+(c.url.indexOf("http")===0?"target='_blank' rel='noopener noreferrer' ":"")+"href='"+clean(c.url)+"'>"+c.icon+"<span><small>"+c.name+"</small><strong>"+clean(c.value)+"</strong></span></a>"}).join("");
var qr=D.qr?"<div class='contact-qr'>"+image(D.qr,"QR Code ติดต่อ LINE",580)+"<span>สแกน QR Code เพื่อเพิ่ม LINE</span></div>":"";
var contact="<section class='section' id='contact'><div class='contact-panel reveal'><div class='contact-grid'><div><div class='eyebrow'>LET’S WORK TOGETHER</div><h2 class='section-title'>มาสร้าง"+grad("งานดี ๆ")+"<br>ด้วยกัน</h2><p class='section-sub'>ติดต่อสอบถามรายละเอียดงานออกแบบและโปรเจกต์ได้ผ่านช่องทางเหล่านี้</p><div class='contacts'>"+cards+"</div><p class='contact-note'>Facebook ใช้การค้นหาชื่อ เนื่องจากยังไม่มี URL โปรไฟล์ตรงที่ยืนยันแล้ว</p></div><div>"+qr+"</div></div></div></section>";
return shell(header("ABOUT & CONTACT","เกี่ยวกับ"+grad("ฉัน"),"ข้อมูลส่วนตัว ทักษะ Adobe และช่องทางติดต่อ รวบรวมไว้ในหน้าเดียว",true)+bio+skills+contact)}
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
if(!lb.classList.contains("open"))focusBefore=document.activeElement;lb.classList.remove("zoomed","image-failed");document.getElementById("lbZoom").setAttribute("aria-pressed","false");lbImg.dataset.file=it.id;lbImg.dataset.retry="0";lbImg.src=src(it.id,2400);lbImg.alt="ภาพผลงานขนาดใหญ่";lb.classList.add("open");document.body.classList.add("is-modal");
document.getElementById("lbPrev").style.display=lightItems.length>1?"grid":"none";document.getElementById("lbNext").style.display=lightItems.length>1?"grid":"none";document.getElementById("lbClose").focus()}
function closeLight(){if(!lb)return;lb.classList.remove("open","zoomed","image-failed");document.body.classList.remove("is-modal");if(focusBefore&&focusBefore.focus)focusBefore.focus()}
function changeLight(n){if(lb&&lb.classList.contains("open")&&lightItems.length>1)openLight(lightIndex+n)}
function zoomLight(){if(!lb)return;lb.classList.toggle("zoomed");document.getElementById("lbZoom").setAttribute("aria-pressed",lb.classList.contains("zoomed")?"true":"false")}
function handler(id,fn){var el=document.getElementById(id);if(el)el.addEventListener("click",fn)}
handler("lbClose",closeLight);handler("lbNext",function(){changeLight(1)});handler("lbPrev",function(){changeLight(-1)});handler("lbZoom",zoomLight);
if(lb){lb.addEventListener("click",function(ev){if(ev.target===lb||ev.target===lbInner)closeLight()});lb.addEventListener("touchstart",function(ev){touchX=ev.changedTouches[0].screenX},{passive:true});lb.addEventListener("touchend",function(ev){var dx=ev.changedTouches[0].screenX-touchX;if(Math.abs(dx)>55&&!lb.classList.contains("zoomed"))changeLight(dx<0?1:-1)},{passive:true})}
document.addEventListener("keydown",function(e){if(!lb||!lb.classList.contains("open"))return;if(e.key==="Escape"){closeLight();e.preventDefault()}else if(e.key==="ArrowRight"){changeLight(1);e.preventDefault()}else if(e.key==="ArrowLeft"){changeLight(-1);e.preventDefault()}else if(e.key==="Tab"){var fs=["lbClose","lbZoom","lbPrev","lbNext"].map(function(id){return document.getElementById(id)}).filter(function(el){return el&&el.style.display!=="none"}),i=fs.indexOf(document.activeElement);if(e.shiftKey&&i===0){fs[fs.length-1].focus();e.preventDefault()}else if(!e.shiftKey&&i===fs.length-1){fs[0].focus();e.preventDefault()}}});
mount.addEventListener("click",function(e){var b=e.target.closest("[data-light-index]");if(!b)return;var n=Number(b.dataset.lightIndex);if(b.classList.contains("has-fallback")){window.open(drive(lightItems[n].id),"_blank","noopener");return}openLight(n)});
var menu=document.getElementById("menuToggle"),nav=document.getElementById("siteNav");if(menu&&nav){menu.addEventListener("click",function(){var opened=nav.classList.toggle("open");menu.setAttribute("aria-expanded",opened?"true":"false");menu.textContent=opened?"×":"☰"})}
var contents=page==="home"?home():page==="selected"?featured():page==="categories"?categories():page==="gallery"?gallery():about();
mount.innerHTML=contents;
document.querySelectorAll("[data-nav]").forEach(function(el){var currentNav=page==="gallery"?"categories":page;if(el.dataset.nav===currentNav)el.setAttribute("aria-current","page");else el.removeAttribute("aria-current")});
if(page==="gallery"){var active=document.querySelector(".category-chip[aria-current='page']");if(active&&active.scrollIntoView)active.scrollIntoView({block:"nearest",inline:"center"})}
if(page==="about"&&(requested==="contact"||window.location.hash==="#contact"))window.setTimeout(function(){var x=document.getElementById("contact");if(x)x.scrollIntoView({block:"start",behavior:"auto"})},100);
document.title=(page==="gallery"?current.title:page==="selected"?"ผลงานเด่น":page==="about"?"เกี่ยวกับและติดต่อ":page==="categories"?"หมวดผลงาน":"Graphic Design Portfolio")+" | Worachit Pulaiyaw";
reveal();motion();
})();
