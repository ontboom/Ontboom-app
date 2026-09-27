(function(){
  function money(n){
    return new Intl.NumberFormat('en-ZA',{style:'currency',currency:'ZAR'}).format(Number(n)||0);
  }

  function ensureTotalBox(){
    const items=document.getElementById('items');
    if(!items) return null;
    let box=document.getElementById('liveEstimateTotal');
    if(!box){
      box=document.createElement('div');
      box.id='liveEstimateTotal';
      box.className='live-estimate-total';
      box.innerHTML='<span>Estimate Total</span><strong>R 0.00</strong>';
      const add=document.getElementById('addItem');
      if(add && add.parentNode) add.parentNode.insertBefore(box,add.nextSibling);
    }
    return box;
  }

  function update(){
    const rows=[...document.querySelectorAll('#items .item')];
    let total=0;
    rows.forEach(row=>{
      const qty=Number(row.querySelector('.qty')?.value)||0;
      const rate=Number(row.querySelector('.rate')?.value)||0;
      const amount=qty*rate;
      total+=amount;
      let display=row.querySelector('.item-live-amount');
      if(!display){
        display=document.createElement('div');
        display.className='item-live-amount';
        row.appendChild(display);
      }
      display.textContent='Amount: '+money(amount);
    });
    const box=ensureTotalBox();
    if(box) box.querySelector('strong').textContent=money(total);
  }

  document.addEventListener('input',e=>{
    if(e.target.closest && e.target.closest('#items')) update();
  });
  document.addEventListener('click',e=>{
    if(e.target.closest && (e.target.closest('#addItem')||e.target.closest('.remove'))) setTimeout(update,0);
  });
  window.addEventListener('load',()=>setTimeout(update,0));
  const items=document.getElementById('items');
  if(items){
    new MutationObserver(()=>update()).observe(items,{childList:true,subtree:false});
    update();
  }
})();