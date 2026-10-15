/* V17 subtle motion; accessible, intersection-driven, and respectful of reduced motion. */
(function(){
"use strict";
const reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let observer;
function init(){
 const app=document.getElementById("app");if(!app||!app.querySelector(".page-enter"))return;
 document.documentElement.classList.add("v17-motion-ready");
 const ornamentHosts=app.querySelectorAll(".ed-page-hero,.ed-gallery-title");
 ornamentHosts.forEach(host=>{
  if(host.querySelector(".v18-interior-spark"))return;
  const a=document.createElement("span"),b=document.createElement("span");
  a.className="v18-interior-spark";a.textContent="✳";a.setAttribute("aria-hidden","true");
  b.className="v18-interior-spark alt";b.textContent="✦";b.setAttribute("aria-hidden","true");
  host.append(a,b);
 });

 /* Large ambient sculptures: animated in normal mode, static in reduced motion mode. */
 const hosts=app.querySelectorAll(".ed-page-hero,.ed-gallery-title,.ed-archive,.ed-about-layout,.ed-tools-section,.ed-services-list,.ed-contact-section,.ed-service-scope,.ed-contact-end,.v10-package,.v10-price-guide,.portfolio-masonry");
 let total=0;
 hosts.forEach(host=>{
  if(total>=9||host.classList.contains("v19-stage-host"))return;
  host.classList.add("v19-stage-host");
  let stage=document.createElement("div");stage.className="v19-art-stage";stage.setAttribute("aria-hidden","true");
  let ring=document.createElement("span");ring.className="v19-fx v19-fx-ring";
  let star=document.createElement("span");star.className="v19-fx v19-fx-star";star.textContent="✳";
  let bubble=document.createElement("span");bubble.className="v19-fx v19-fx-bubble";
  let word=document.createElement("span");word.className="v19-fx v19-fx-word";word.textContent=total%2===0?"MAKE IT POP":"CREATIVE";
  stage.append(ring,star,bubble,word);host.append(stage);total++;
 });
 if(reduced)return;
 if(observer)observer.disconnect();
 const els=app.querySelectorAll(".b12-section-heading,.b12-work,.b12-cat,.b12-about-banner,.b12-price-banner,.b12-ending,.ed-page-hero,.ed-gallery-title,.ed-about-layout,.ed-about-photo,.ed-about-text,.ed-section-head,.ed-service-row,.ed-contact-card,.ed-services-list,.ed-service-scope,.v10-package,.v10-package-head,.v10-pcard,.v10-price-guide,.catalog-card,.masonry-item,.ed-gallery-breadcrumb,.ed-archive-label,.ed-archive-bottom,.ed-contact-end,.ed-contact-list");
 if("IntersectionObserver" in window){
  observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("v17-visible");observer.unobserve(e.target)}})},{threshold:.06,rootMargin:"0px 0px 55px 0px"});
  els.forEach((el,i)=>{el.classList.add("v17-animate");el.style.setProperty("--v17-delay",Math.min(i%7,5)*45+"ms");observer.observe(el)})
 }else els.forEach(el=>el.classList.add("v17-visible"));
 app.querySelectorAll(".b12-work,.b12-cat,.v10-pcard").forEach(el=>{
  let pointerActive=false;
  el.addEventListener("pointermove",e=>{
   if(e.pointerType==="touch")return;
   const box=el.getBoundingClientRect(),x=(e.clientX-box.left)/box.width-.5,y=(e.clientY-box.top)/box.height-.5;
   el.style.setProperty("--v17-x",(x*4).toFixed(2)+"deg");
   el.style.setProperty("--v17-y",(-y*4).toFixed(2)+"deg");
   pointerActive=true;
  },{passive:true});
  el.addEventListener("pointerleave",()=>{if(pointerActive){el.style.setProperty("--v17-x","0deg");el.style.setProperty("--v17-y","0deg");pointerActive=false}});
 });
}
document.addEventListener("DOMContentLoaded",()=>{
 const app=document.getElementById("app");if(!app)return;
 const watch=new MutationObserver(()=>{if(app.querySelector(".page-enter")){watch.disconnect();init()}});
 watch.observe(app,{childList:true,subtree:false});if(app.querySelector(".page-enter")){watch.disconnect();init()}
});
})();