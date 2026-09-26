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

  // PDF must already exist before the share tap so Android keeps user activation.
  if(!preparedShare || preparedShare.key!==currentShareKey()){
    scheduleShare();
    alert("Preparing your PDF. Tap Send again in a moment.");
    return;
  }

  const r=preparedShare;

  // Preferred route: the same Android share chooser used by native invoice apps.
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

  // Samsung Internet fallback. A normal website cannot manufacture Android's
  // FileProvider URI, so it cannot force a downloaded file into WhatsApp.
  // We therefore save the actual PDF, then open the correct client's WhatsApp chat.
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
