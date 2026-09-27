(function(){
  function money(n){
    return new Intl.NumberFormat('en-ZA',{style:'currency',currency:'ZAR'}).format(Number(n)||0);
  }

  function ensureStyles(){
    if(document.getElementById('liveTotalsStyles')) return;
    const s=document.createElement('style');
    s.id='liveTotalsStyles';
    s.textContent='.item-live-amount{grid-column:1/-1;text-align:right;font-weight:700;padding:4px 8px 2px;color:#173f31}.live-estimate-total{display:flex;justify-content:space-between;align-items:center;margin:14px 0 18px;padding:16px 18px;border:1px solid #cbd7d1;border-radius:14px;background:#f4f8f6;font-size:18px}.live-estimate-total strong{font-size:22px;color:#173f31}';
    document.head.appendChild(s);
  }

  function ensureTotalBox(){
    const items=document.getElementById('items');
    const add=document.getElementById('addItem');
    if(!items || !add) return null;
    let box=document.getElementById('liveEstimateTotal');
    if(!box){
      box=document.createElement('div');
      box.id='liveEstimateTotal';
      box.className='live-estimate-total';
      box.innerHTML='<span>Estimate Total</span><strong>R 0.00</strong>';
      add.insertAdjacentElement('afterend',box);
    }
    return box;
  }

  function update(){
    ensureStyles();
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
    if(box){
      const strong=box.querySelector('strong');
      if(strong) strong.textContent=money(total);
    }
  }

  function start(){
    update();
    const items=document.getElementById('items');
    if(items) new MutationObserver(()=>setTimeout(update,0)).observe(items,{childList:true});
  }

  document.addEventListener('input',e=>{
    if(e.target && e.target.closest && e.target.closest('#items')) update();
  });
  document.addEventListener('click',e=>{
    if(e.target && e.target.closest && (e.target.closest('#addItem') || e.target.closest('.remove'))) setTimeout(update,20);
  });

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start);
  else start();
  window.addEventListener('load',()=>setTimeout(update,100));
})();