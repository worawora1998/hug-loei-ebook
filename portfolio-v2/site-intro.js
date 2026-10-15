/* V19 first-visit art reel. Keeps original portfolio hidden until actual content is ready. */
(function(){
"use strict";
var intro=document.getElementById("v19-intro");
var root=document.documentElement;
var seen=root.classList.contains("v19-intro-seen");
var reduced=!!(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches);
var ready=false,elapsed=seen||reduced,finished=false;
var timer=null,watchdog=null;
function setText(id,value){var n=document.getElementById(id);if(n)n.textContent=value}
function finish(){
 if(finished||!ready||!elapsed)return;
 finished=true;
 root.classList.remove("v19-loading");root.classList.add("v19-loaded");
 if(intro){intro.classList.add("v19-intro-exit");intro.setAttribute("aria-hidden","true");window.setTimeout(function(){intro.remove()},reduced?0:650)}
 try{window.sessionStorage.setItem("v19_intro_seen","1")}catch(e){}
 window.dispatchEvent(new Event("worachit:revealed"));
 if(timer)clearTimeout(timer);if(watchdog)clearTimeout(watchdog)
}
function appReady(){ready=true;setText("v19-stage-label","READY TO EXPLORE");finish()}
function fail(){setText("v19-stage-label","โหลดข้อมูลขัดข้อง · ลองโหลดหน้าอีกครั้ง");var btn=document.getElementById("v19-retry");if(btn)btn.hidden=false}
window.WorachitIntro={ready:appReady,fail:fail};
if(!intro){elapsed=true;return}
if(seen||reduced){intro.classList.add("v19-intro-fast");elapsed=true}
else{
 function validId(id){return typeof id==="string" && (/^[\w-]{18,}$/.test(id)||/^assets\/uploads\/[\w./-]+\.(?:png|jpe?g|webp)$/i.test(id))}
 function photoSrc(id){return id.indexOf("assets/uploads/")===0?"https://raw.githubusercontent.com/worawora1998/hug-loei-ebook/portfolio-v2-site/portfolio-v2/"+id:"https://drive.google.com/thumbnail?id="+encodeURIComponent(id)+"&sz=w360"}
 try{
  var node=document.getElementById("portfolio-data");
  var D=JSON.parse(node.textContent||"{}");
  var candidates=[].concat(D.homePosterImages||[],(D.groups||{}).poster||[],(D.groups||{}).product||[],(D.groups||{}).logo||[],(D.groups||{}).lineup||[]);
  var used=new Set(),arts=[];
  candidates.forEach(function(a){if(a&&validId(a.id)&&!used.has(a.id)&&arts.length<16){used.add(a.id);arts.push(a)}});
  function fill(id,arr){
   var target=document.getElementById(id);if(!target)return;
   for(var repeat=0;repeat<2;repeat++)arr.forEach(function(a,i){
    var card=document.createElement("div");card.className="v19-film-card";
    var img=document.createElement("img");img.alt="";img.decoding="async";img.loading="eager";img.src=photoSrc(a.id);
    img.addEventListener("error",function(){card.classList.add("v19-image-failed")});
    var caption=document.createElement("span");caption.textContent="WORACHIT / "+String(i+1).padStart(2,"0");
    card.append(img,caption);target.append(card)
   })
  }
  if(arts.length){fill("v19-track-a",arts.slice(0,8));fill("v19-track-b",arts.slice(8,16).length?arts.slice(8,16):arts.slice(0,8).reverse())}
 }catch(e){setText("v19-stage-label","PREPARING CREATIVE PORTFOLIO")}
 timer=window.setTimeout(function(){elapsed=true;finish()},3200);
 var skip=document.getElementById("v19-skip");
 if(skip)skip.addEventListener("click",function(){elapsed=true;skip.disabled=true;skip.textContent=ready?"กำลังเข้าสู่เว็บไซต์...":"กำลังเตรียมผลงาน...";finish()})
}
var retry=document.getElementById("v19-retry");
if(retry)retry.addEventListener("click",function(){location.reload()});
watchdog=window.setTimeout(function(){if(!ready&&!finished)fail()},10000);
if(ready)finish()
})();