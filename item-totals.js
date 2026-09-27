(function(){
  function money(n){
    return new Intl.NumberFormat('en-ZA',{style:'currency',currency:'ZAR'}).format(Number(n)||0);
  }

  function ensureStyles(){
    if(document.getElementById('liveTotalsStyles')) return;
    const s=document.createElement('style');
    s.id='liveTotalsStyles';
    s.textContent='.item-live-amount{grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;margin:0 4px 2px;padding:10px 12px;border-top:1px solid #d7dfdb;font-weight:700;color:#173f31}.item-live-amount span:first-child{color:#53635c;font-weight:600}.live-estimate-total{display:flex;justify-content:space-between;align-items:center;margin:14px 0 18px;padding:16px 18px;border:1px solid #cbd7d1;border-radius:14px;background:#f4f8f6;font-size:18px}.live-estimate-total strong{font-size:22px;color:#173f31}';
    document.head.appendChild(s);
  }

  function ensureTotalBox(){
    const add=document.getElementById('addItem');
    if(!add) return null;
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
        display.innerHTML='<span>Amount</span><strong></strong>';
        row.appendChild(display);
      }
      const value=display.querySelector('strong');
      if(value) value.textContent=money(amount);
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
    if(items){
      new MutationObserver(()=>setTimeout(update,0)).observe(items,{childList:true,subtree:true});
    }
    setTimeout(update,250);
    setTimeout(update,1000);
  }

  document.addEventListener('input',e=>{
    if(e.target && e.target.closest && e.target.closest('#items')) update();
  },true);
  document.addEventListener('change',e=>{
    if(e.target && e.target.closest && e.target.closest('#items')) update();
  },true);
  document.addEventListener('click',e=>{
    if(e.target && e.target.closest && (e.target.closest('#addItem') || e.target.closest('.remove'))) setTimeout(update,30);
  },true);

  window.ontboomUpdateTotals=update;
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start);
  else start();
  window.addEventListener('load',()=>setTimeout(update,100));
  window.addEventListener('pageshow',()=>setTimeout(update,100));
})();