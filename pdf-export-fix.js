/* Ontboom PDF export: render a visible A4 copy, then share the verified PDF. */
(function(){
 const $=id=>document.getElementById(id);
 const native=()=>!!(window.Capacitor&&Capacitor.isNativePlatform?.()&&Capacitor.getPlatform?.()==='android');
 const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 const base64=blob=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.onerror=reject;r.readAsDataURL(blob)});
 let busy=false;
 async function makePdf(){
   if(typeof html2pdf==='undefined')throw new Error('PDF generator not loaded. Check your internet connection.');
   if(typeof render==='function')render();
   await document.fonts?.ready;
   const source=$('document');
   if(!source)throw new Error('Estimate preview missing.');
   const clone=source.cloneNode(true);
   clone.removeAttribute('id');
   // html2canvas can produce entirely white pages for fixed/negative-z-index sources.
   // Render a normal-flow A4 document inside a visible temporary overlay instead.
   const stage=document.createElement('div');
   stage.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#fff;overflow:auto;pointer-events:none;';
   clone.style.cssText='display:block!important;visibility:visible!important;opacity:1!important;position:relative!important;left:auto!important;top:auto!important;width:190mm!important;max-width:190mm!important;height:auto!important;min-height:0!important;transform:none!important;z-index:auto!important;background:white!important;overflow:visible!important;margin:0 auto!important;box-sizing:border-box!important;';
   stage.appendChild(clone);
   clone.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
   document.body.appendChild(stage);
   try{
     await Promise.all([...clone.querySelectorAll('img')].map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});setTimeout(resolve,5000)})));
     await wait(150);
     const opt={margin:[10,10,10,10],image:{type:'jpeg',quality:.96},html2canvas:{scale:2,useCORS:true,backgroundColor:'#ffffff',scrollX:0,scrollY:0},jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},pagebreak:{mode:['css','legacy'],avoid:['tr','.client-box','.summary-row','.terms','.doc-notes']}};
     const blob=await html2pdf().set(opt).from(clone).outputPdf('blob');
     if(!blob||blob.size<2500||blob.type!=='application/pdf')throw new Error('PDF output was incomplete.');
     return blob;
   }finally{stage.remove()}
 }
 async function exportPdf(share){
   if(busy)return;
   busy=true;
   const button=$(share?'send':'print');
   const original=button?.textContent;
   if(button){button.disabled=true;button.textContent='Preparing PDF…'}
   try{
     const d=data();
     if(share&&!d.customer){alert('Enter the customer name first.');return}
     const blob=await makePdf();
     const filename='Ontboom-'+d.type+'-'+(d.no||'Document')+'.pdf';
     if(native()){
       const fs=Capacitor.Plugins?.Filesystem,sh=Capacitor.Plugins?.Share;
       if(!fs||!sh)throw new Error('Android PDF sharing components unavailable.');
       const saved=await fs.writeFile({path:filename,data:await base64(blob),directory:'CACHE',recursive:true});
       // Both Preview and Send open Android's chooser for a real PDF file.
       await sh.share({title:share?'Send '+d.type:'Open / Save '+d.type,text:share?shareMessage(d):undefined,url:saved.uri,dialogTitle:share?'Send PDF':'Open or save PDF'});
     }else if(share&&navigator.share&&(!navigator.canShare||navigator.canShare({files:[new File([blob],filename,{type:'application/pdf'})]}))){
       await navigator.share({files:[new File([blob],filename,{type:'application/pdf'})],title:filename});
     }else{
       downloadPdf(blob,filename);
       if(share)alert('PDF downloaded. Attach it to your WhatsApp message from Downloads.');
     }
     if(share){if(typeof ontboomMarkSent==='function')ontboomMarkSent(d);else if(typeof saveCustomer==='function')saveCustomer(d)}
   }catch(e){if(e?.name!=='AbortError'&&!/cancel/i.test(String(e?.message||''))){console.error('Ontboom PDF export',e);alert('Could not create or open the PDF: '+(e?.message||e))}}
   finally{busy=false;if(button){button.disabled=false;button.textContent=original}}
 }
 // Installed after the legacy and native handlers so only one path runs.
 if($('print'))$('print').onclick=()=>exportPdf(false);
 if($('send'))$('send').onclick=()=>exportPdf(true);
})();
