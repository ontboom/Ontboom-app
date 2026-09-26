// Samsung/Android Web Share compatibility fix.
// Share the PDF file by itself. Some Android browsers reject a Web Share
// payload when files and text are supplied together.
async function ontboomSharePdfOnly(){
  const d=data();
  if(!d.customer){ alert("Enter the customer name first."); return; }

  // The PDF is normally prepared in the background. Do not generate it after
  // the tap, because Android requires navigator.share() to retain user activation.
  if(!preparedShare || preparedShare.key!==currentShareKey()){
    scheduleShare();
    alert("Your PDF is being prepared. Please tap Send again in a moment.");
    return;
  }

  const r=preparedShare;
  if(!navigator.share){
    downloadPdf(r.blob,r.filename);
    alert("This browser cannot open Android sharing. The PDF was saved to Downloads.");
    return;
  }

  try{
    const filePayload={files:[r.file]};
    if(navigator.canShare && !navigator.canShare(filePayload)){
      downloadPdf(r.blob,r.filename);
      alert("This browser cannot share PDF attachments. The PDF was saved to Downloads.");
      return;
    }

    // Deliberately no text/title here: Samsung Internet can fail when a file
    // and text are combined. Android/WhatsApp will show the PDF filename.
    await navigator.share(filePayload);

    if(r.d.type==="Estimate" && r.d.status==="Draft"){
      $("estimateStatus").value="Sent";
      const x=data(); x.status="Sent"; persist(x,false); render();
    }
    saveCustomer(r.d);
    cloudChanged();
  }catch(e){
    if(e && e.name==="AbortError") return;
    console.error("PDF-only share failed",e);
    downloadPdf(r.blob,r.filename);
    alert("Your browser blocked direct PDF sharing. The PDF was saved to Downloads.");
  }
}

// Replace the old handler after app.js has initialized it.
const ontboomSendButton=document.getElementById("send");
if(ontboomSendButton) ontboomSendButton.onclick=ontboomSharePdfOnly;
