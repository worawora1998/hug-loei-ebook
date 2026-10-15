/* V17 subtle motion; accessible, intersection-driven, and respectful of reduced motion. */
(function(){
"use strict";
const reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if(reduced)return;
let observer;
function init(){
 const app=document.getElementById("app");if(!app||!app.querySelector(".page-enter"))return;
 document.documentElement.classList.add("v17-motion-ready");
 if(observer)observer.disconnect();
 const els=app.querySelectorAll(".b12-section-heading,.b12-work,.b12-cat,.b12-about-banner,.b12-price-banner,.b12-ending,.ed-page-hero,.ed-about-layout,.ed-services-list .ed-service-row,.ed-contact-card,.v10-package,.v10-pcard,.catalog-card,.ed-gallery-title,.portfolio-masonry .masonry-item");
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