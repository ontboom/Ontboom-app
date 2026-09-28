// Ontboom Android send flow.
// First try Android's native file share. If Samsung Internet blocks PDF files,
// save the professional PDF and immediately open WhatsApp with a short client message.
// The user can attach the just-downloaded PDF from WhatsApp's document picker.

function ontboomClientMessage(d){
  return `Good day ${d.customer},\n\nPlease find attached your Ontboom ${d.type.toLowerCase()} ${d.no}.\n\nKind regards,\nFrik\nONTBOOM\n065 225 8354`;
}

function ontboomPhone(cell){
  let n=String(cell||"").replace(/\D/g,"");
  if(n.startsWith("0")) n="27"+n.slice(1);
  return n;
}

function ontboomOpenWhatsApp(d){
  const phone=ontboomPhone(d.cell);
  const text=encodeURIComponent(ontboomClientMessage(d));
  const url=phone
    ? `https://wa.me/${phone}?text=${text}`
    : `https://wa.me/?text=${text}`;
  window.location.href=url;
}

function ontboomMarkSent(d){
  if(d.type==="Estimate" && d.status==="Draft"){
    $("estimateStatus").value="Sent";
    const x=data(); x.status="Sent"; persist(x,false); render();
  }
  saveCustomer(d);
  cloudChanged();
}

async function ontboomSendDocument(){
  const d=data();
  if(!d.customer){ alert("Enter the customer name first."); return; }

  if(!preparedShare || preparedShare.key!==currentShareKey()){
    scheduleShare();
    alert("Preparing your PDF. Tap Send again in a moment.");
    return;
  }

  const r=preparedShare;

  if(navigator.share){
    try{
      const payload={files:[r.file]};
      if(!navigator.canShare || navigator.canShare(payload)){
        await navigator.share(payload);
        ontboomMarkSent(r.d);
        return;
      }
    }catch(e){
      if(e && e.name==="AbortError") return;
      console.warn("Native PDF share unavailable; using WhatsApp fallback",e);
    }
  }

  downloadPdf(r.blob,r.filename);
  ontboomMarkSent(r.d);

  const go=confirm(
    `The PDF has been saved as ${r.filename}.\n\n`+
    `Tap OK to open WhatsApp for ${r.d.customer}. Then tap the paperclip → Document and select this PDF from Downloads.`
  );
  if(go) ontboomOpenWhatsApp(r.d);
}

const ontboomSendButton=document.getElementById("send");
if(ontboomSendButton) ontboomSendButton.onclick=ontboomSendDocument;

// Editable document-preview settings for the six marked areas.
(function(){
  const KEY="ontboom_document_settings_v1";
  const defaults={
    businessName:"ONTBOOM",
    serviceLine:"Tree-Felling & Pruning Services",
    businessAddress:"Zwavelpoort, Pretoria",
    businessPhone:"065 225 8354",
    businessEmail:"frik.ontboom@gmail.com",
    vatText:"Not VAT registered",
    colDescription:"DESCRIPTION",
    colQty:"QTY",
    colRate:"RATE",
    colAmount:"AMOUNT",
    extraTerms:"All work is subject to the agreed scope above. Any additional work requested may be quoted separately.",
    footerService:"Tree-Felling & Pruning Services",
    footerTagline:"A cleaner, greener tomorrow."
  };
  function settings(){
    try{return Object.assign({},defaults,JSON.parse(localStorage.getItem(KEY)||"{}"));}
    catch(e){return {...defaults};}
  }
  function saveSettings(){
    const s={};
    Object.keys(defaults).forEach(k=>{const el=document.getElementById("set_"+k);s[k]=el?el.value:defaults[k];});
    localStorage.setItem(KEY,JSON.stringify(s));
    applySettings();
    if(typeof scheduleShare==="function") scheduleShare();
  }
  function applySettings(){
    const s=settings();
    const bd=document.querySelector(".business-details");
    if(bd){
      bd.innerHTML="";
      const b=document.createElement("b"); b.textContent=s.businessName; bd.appendChild(b); bd.appendChild(document.createElement("br"));
      [s.serviceLine,s.businessAddress,s.businessPhone,s.businessEmail].filter(Boolean).forEach((v,i)=>{bd.appendChild(document.createTextNode(v));if(i<[s.serviceLine,s.businessAddress,s.businessPhone,s.businessEmail].filter(Boolean).length-1)bd.appendChild(document.createElement("br"));});
    }
    const fallback=document.getElementById("brandFallback");
    if(fallback){const h=fallback.querySelector("h2"),strong=fallback.querySelector("strong");if(h)h.textContent=s.businessName;if(strong)strong.textContent=s.serviceLine;}
    const vat=document.querySelector(".vat-note"); if(vat)vat.textContent=s.vatText;
    const heads=document.querySelectorAll(".doc-table thead th");
    [s.colDescription,s.colQty,s.colRate,s.colAmount].forEach((v,i)=>{if(heads[i])heads[i].textContent=v;});
    const terms=document.querySelector(".terms");
    if(terms){let ps=terms.querySelectorAll("p");if(ps[1])ps[1].textContent=s.extraTerms;}
    const footer=document.querySelector(".paper footer");
    if(footer){footer.innerHTML="";const b=document.createElement("b");b.textContent=s.businessName;footer.appendChild(b);footer.appendChild(document.createTextNode(" • "+s.footerService+" • "+s.businessPhone));footer.appendChild(document.createElement("br"));const span=document.createElement("span");span.textContent=s.footerTagline;footer.appendChild(span);}
  }
  function addSettingsPanel(){
    const anchor=document.querySelector(".items-heading");
    if(!anchor||document.getElementById("documentSettings"))return;
    const s=settings(),box=document.createElement("div");
    box.id="documentSettings";box.className="photo-tools";
    box.innerHTML='<h3>Estimate / Invoice layout settings</h3><p style="margin-top:-4px;color:#66746b">Change the six marked areas on your document preview.</p><div class="grid">'+
      '<label>1. Business name<input id="set_businessName"></label><label>Service description<input id="set_serviceLine"></label><label>Business address<input id="set_businessAddress"></label><label>Phone<input id="set_businessPhone"></label><label class="wide">Email<input id="set_businessEmail" type="email"></label>'+
      '<label class="wide">3. VAT wording<input id="set_vatText"></label>'+
      '<label>4. Description heading<input id="set_colDescription"></label><label>Quantity heading<input id="set_colQty"></label><label>Rate heading<input id="set_colRate"></label><label>Amount heading<input id="set_colAmount"></label>'+
      '<label class="wide">5. Terms wording<textarea id="set_extraTerms" rows="3"></textarea></label>'+
      '<label>6. Footer service text<input id="set_footerService"></label><label>Footer tagline<input id="set_footerTagline"></label></div>'+
      '<p style="margin-bottom:0;color:#66746b"><b>2. Document number, date and status</b> are already editable in the main form above.</p>';
    anchor.parentNode.insertBefore(box,anchor);
    Object.keys(defaults).forEach(k=>{const el=document.getElementById("set_"+k);if(el){el.value=s[k];el.addEventListener("input",saveSettings);}});
  }
  addSettingsPanel();
  const originalRender=window.render;
  if(typeof originalRender==="function"){
    window.render=function(){originalRender.apply(this,arguments);applySettings();};
  }
  applySettings();
})();
