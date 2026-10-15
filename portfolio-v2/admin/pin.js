/* Small optional device PIN gate. GitHub authorization remains mandatory for writes. */
(function(){
"use strict";
const KEY="worachit_admin_pin_v1",UNLOCK="worachit_admin_unlock_v1";
const safeGet=k=>{try{return localStorage.getItem(k)}catch{return null}};
const safeSet=(k,v)=>{try{localStorage.setItem(k,v);return true}catch{return false}};
function hex(a){return Array.from(new Uint8Array(a),b=>b.toString(16).padStart(2,"0")).join("")}
function bytes(h){return new Uint8Array((h.match(/.{2}/g)||[]).map(x=>parseInt(x,16)))}
async function derive(pin,salt){
 const seed=await crypto.subtle.importKey("raw",new TextEncoder().encode(pin),"PBKDF2",false,["deriveBits"]);
 return hex(await crypto.subtle.deriveBits({name:"PBKDF2",salt:bytes(salt),iterations:180000,hash:"SHA-256"},seed,256))
}
function has(){return !!safeGet(KEY)}
function unlocked(){try{return sessionStorage.getItem(UNLOCK)==="1"}catch{return false}}
function grant(){try{sessionStorage.setItem(UNLOCK,"1")}catch{}}
async function check(pin){const stored=safeGet(KEY);if(!stored)return false;try{const item=JSON.parse(stored);return item.hash===await derive(pin,item.salt)}catch{return false}}
async function save(pin){if(!/^\d{6}$/.test(pin))return false;if(!crypto?.subtle)return false;let salt=hex(crypto.getRandomValues(new Uint8Array(16)));let digest=await derive(pin,salt);if(!safeSet(KEY,JSON.stringify({salt,hash:digest})))return false;grant();return true}
function dialog(mode){
 return new Promise(resolve=>{
 let overlay=document.createElement("div");overlay.className="pin-overlay";
 let modal=document.createElement("section");modal.className="pin-modal";modal.setAttribute("role","dialog");modal.setAttribute("aria-modal","true");modal.setAttribute("aria-label","WORACHIT ADMIN PIN");
 let label=document.createElement("span");label.className="pin-kicker";label.textContent="✳ WORACHIT · PRIVATE";
 let title=document.createElement("h2");title.textContent=mode==="setup"?"ตั้งค่า PIN 6 หลัก":"ใส่ PIN เพื่อเข้า Admin";
 let detail=document.createElement("p");detail.textContent=mode==="setup"?"ตั้ง PIN สำหรับอุปกรณ์นี้ หลังจากยืนยัน GitHub แล้ว ใช้เป็นด่านเข้าหน้า Admin เพิ่มเติม":"กรอก PIN 6 หลักที่คุณตั้งไว้บนอุปกรณ์นี้";
 let input=document.createElement("input");input.type="password";input.inputMode="numeric";input.autocomplete="off";input.maxLength=6;input.pattern="[0-9]{6}";input.placeholder="••••••";input.setAttribute("aria-label","PIN 6 หลัก");
 let confirmInput=null;if(mode==="setup"){confirmInput=input.cloneNode();confirmInput.placeholder="ยืนยัน PIN อีกครั้ง";confirmInput.setAttribute("aria-label","ยืนยัน PIN 6 หลัก")}
 let error=document.createElement("p");error.className="pin-error";error.setAttribute("role","alert");
 let actions=document.createElement("div");actions.className="pin-actions";
 let cancel=document.createElement("button");cancel.type="button";cancel.className="pin-cancel";cancel.textContent="ยกเลิก";
 let submit=document.createElement("button");submit.type="button";submit.className="pin-submit";submit.textContent=mode==="setup"?"บันทึก PIN":"ปลดล็อก ↗";
 let attempts=0,busy=false;const finish=v=>{overlay.remove();resolve(v)};
 async function go(){
 if(busy)return;if(!/^\d{6}$/.test(input.value)){error.textContent="กรุณากรอกตัวเลขให้ครบ 6 หลัก";return}
 if(mode==="setup"&&input.value!==confirmInput.value){error.textContent="รหัส PIN สองช่องไม่ตรงกัน";return}
 busy=true;submit.disabled=true;
 try{
 let ok=mode==="setup"?await save(input.value):await check(input.value);
 if(ok){grant();finish(true);return}
 attempts++;error.textContent=mode==="setup"?"เบราว์เซอร์ไม่รองรับการจัดเก็บ PIN":("PIN ไม่ถูกต้อง ("+attempts+"/5)");
 input.value="";if(attempts>=5){error.textContent="กรอกผิด 5 ครั้ง กรุณารอ 30 วินาที";setTimeout(()=>{attempts=0;submit.disabled=false;error.textContent=""},30000);return}
 }catch{error.textContent="ไม่สามารถตรวจ PIN ได้"}
 finally{busy=false;if(attempts<5)submit.disabled=false}
 }
 input.addEventListener("keydown",e=>{if(e.key==="Enter")go()});
 if(confirmInput)confirmInput.addEventListener("keydown",e=>{if(e.key==="Enter")go()});
 cancel.addEventListener("click",()=>finish(false));submit.addEventListener("click",go);
 actions.append(cancel,submit);modal.append(label,title,detail,input);if(confirmInput)modal.append(confirmInput);modal.append(error,actions);overlay.append(modal);document.body.append(overlay);input.focus()
 })
}
async function guard(){if(!has()||unlocked())return true;return await dialog("verify")}
async function setup(){return has()?true:dialog("setup")}
function attachLink(){document.querySelectorAll('a[href="./admin/"],a[href="../admin/"]').forEach(link=>{link.addEventListener("click",async e=>{if(!has())return;e.preventDefault();let ok=await dialog("verify");if(ok)location.href=link.href})})}
window.WorachitPin={has,unlocked,guard,setup,attachLink};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",attachLink);else attachLink();
})();