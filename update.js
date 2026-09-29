(() => {
  const el = {
    input: document.getElementById('pdfInput'), choose: document.getElementById('chooseBtn'), drop: document.getElementById('dropzone'),
    title: document.getElementById('fileTitle'), meta: document.getElementById('fileMeta'), previewWrap: document.getElementById('previewWrap'), preview: document.getElementById('pdfPreview'),
    key: document.getElementById('adminKey'), append: document.getElementById('appendCover'), store: document.getElementById('storeSource'), update: document.getElementById('updateBtn'),
    progress: document.getElementById('progress'), progressText: document.getElementById('progressText'), result: document.getElementById('result'), status: document.getElementById('serverStatus')
  };
  let file = null, objectUrl = null, serverReady = false;
  const fmt = bytes => bytes < 1024*1024 ? `${(bytes/1024).toFixed(0)} KB` : `${(bytes/1024/1024).toFixed(1)} MB`;

  async function checkServer() {
    try {
      const r = await fetch('./api/status', { cache:'no-store' });
      if (!r.ok) throw new Error();
      const data = await r.json(); serverReady = true;
      el.status.textContent = data.local_mode ? 'พร้อมอัปเดต • Local' : 'พร้อมอัปเดต • Server'; el.status.className = 'status-pill ok';
    } catch (_) {
      serverReady = false; el.status.textContent = 'โหมด Static • Preview เท่านั้น'; el.status.className = 'status-pill no';
    }
    updateButton();
  }
  function updateButton(){ el.update.disabled = !file || !serverReady; }
  function setFile(f){
    if(!f || (f.type && f.type !== 'application/pdf') || !/\.pdf$/i.test(f.name)){showResult('กรุณาเลือกไฟล์ PDF เท่านั้น',false);return;}
    file=f; el.title.textContent=f.name; el.meta.textContent=`ขนาด ${fmt(f.size)} • พร้อมตรวจสอบก่อนอัปเดต`; el.previewWrap.hidden=false;
    if(objectUrl) URL.revokeObjectURL(objectUrl); objectUrl=URL.createObjectURL(f); el.preview.src=objectUrl; updateButton(); hideResult();
  }
  el.choose.addEventListener('click', e=>{e.preventDefault();el.input.click();});
  el.input.addEventListener('change',()=>setFile(el.input.files?.[0]));
  ['dragenter','dragover'].forEach(t=>el.drop.addEventListener(t,e=>{e.preventDefault();el.drop.classList.add('drag');}));
  ['dragleave','drop'].forEach(t=>el.drop.addEventListener(t,e=>{e.preventDefault();el.drop.classList.remove('drag');}));
  el.drop.addEventListener('drop',e=>setFile(e.dataTransfer.files?.[0]));

  function showResult(html,ok){el.result.hidden=false;el.result.className=`result ${ok?'ok':'err'}`;el.result.innerHTML=html;}
  function hideResult(){el.result.hidden=true;}

  el.update.addEventListener('click', async()=>{
    if(!file || !serverReady) return;
    hideResult(); el.progress.hidden=false; el.update.disabled=true; el.progressText.textContent='กำลังตรวจสอบทุกหน้าและดึง JPEG ต้นฉบับ…';
    const fd=new FormData(); fd.append('file',file,file.name); fd.append('append_back_cover',el.append.checked?'true':'false'); fd.append('store_source',el.store.checked?'true':'false');
    try{
      const r=await fetch('./api/update-ebook',{method:'POST',headers:el.key.value?{'X-HUG-ADMIN-KEY':el.key.value}:{},body:fd});
      const data=await r.json().catch(()=>({detail:'เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง'}));
      if(!r.ok) throw new Error(data.detail || data.message || `HTTP ${r.status}`);
      showResult(`<b>อัปเดตสำเร็จ</b><br>ดึงภาพต้นฉบับโดยตรง ${data.extracted_pages} หน้า${data.appended_back_cover?' + หน้าปิด 1 หน้า':''} • รวม ${data.total_pages} หน้า<br>สร้าง Preview และ Thumbnail ใหม่เรียบร้อยแล้ว<br><small>กด “กลับไป E-Book” แล้วรีเฟรชหน้าเพื่อดูเวอร์ชันล่าสุด</small>`,true);
      el.progressText.textContent='เสร็จแล้ว';
    }catch(err){showResult(`<b>ยังไม่ได้อัปเดตไฟล์</b><br>${String(err.message||err)}<br><small>หากระบบแจ้งว่าหน้า PDF ไม่ใช่ JPEG เต็มหน้า ให้ Export PDF จาก Illustrator ด้วยรูปแบบเดียวกับไฟล์ต้นฉบับ แล้วลองใหม่อีกครั้ง</small>`,false);}
    finally{el.progress.hidden=true;el.update.disabled=false;}
  });
  checkServer();
})();
