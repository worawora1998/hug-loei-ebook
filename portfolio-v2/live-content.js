/* WORACHIT portfolio live content bridge.
   Read public content data directly from the GitHub source of truth;
   embedded Render data remains a complete offline/network fallback. */
(function(){
"use strict";
var data=document.getElementById("portfolio-data");
function startApp(){
  var tag=document.createElement("script");
  tag.src="./app-v12.js?v=20261015-v19";
  tag.onerror=function(){var mount=document.getElementById("app");if(mount&&!mount.querySelector(".page-enter")){mount.textContent="ไม่สามารถโหลดเว็บไซต์ได้ในขณะนี้ กรุณารีเฟรชอีกครั้ง"}if(window.WorachitIntro)window.WorachitIntro.fail()};
  document.body.appendChild(tag);
}
if(!data||typeof fetch!=="function"){startApp();return;}
var aborted=false;
var controller=typeof AbortController==="function"?new AbortController():null;
var timeout=setTimeout(function(){aborted=true;if(controller)controller.abort()},2500);
var cacheSlot=Math.floor(Date.now()/60000);
var url="https://raw.githubusercontent.com/worawora1998/hug-loei-ebook/portfolio-v2-site/portfolio-v2/index.html?v="+cacheSlot;
var options={cache:"no-store",mode:"cors"};
if(controller)options.signal=controller.signal;
fetch(url,options).then(function(response){
 if(!response.ok)throw Error("GitHub source not available");
 return response.text();
}).then(function(html){
 if(aborted)return;
 var match=html.match(/<script id="portfolio-data" type="application\/json">([\s\S]*?)<\/script>/);
 if(!match)return;
 var next=JSON.parse(match[1]);
 if(!next||!Array.isArray(next.categories)||!next.groups||typeof next.groups!=="object"||!Array.isArray(next.homePosterImages))return;
 data.textContent=match[1];
}).catch(function(){
 // Keep the last deployed data if network access is unavailable.
}).finally(function(){
 clearTimeout(timeout);
 startApp();
});
})();
