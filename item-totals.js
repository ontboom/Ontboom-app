(function(){
  function money(n){
    return 'R '+(Number(n)||0).toLocaleString('en-ZA',{minimumFractionDigits:2,maximumFractionDigits:2});
  }

  function ensureStyles(){
    if(document.getElementById('liveTotalsStyles')) return;
    const s=document.createElement('style');
    s.id='liveTotalsStyles';
    s.textContent=`
      #items .item .item-live-amount{
        display:block !important;
        width:100% !important;
        grid-column:1/-1 !important;
        text-align:right !important;
        font-weight:800 !important;
        font-size:17px !important;
        padding:8px 10px 2px !important;
        color:#173f31 !important;
        box-sizing:border-box !important;
      }
      #liveEstimateTotal{
        display:flex !important;
        justify-content:space-between !important;
        align-items:center !important;
        width:100% !important;
        box-sizing:border-box !important;
        margin:14px 0 18px !important;
        padding:16px 18px !important;
        border:2px solid #9db5aa !important;
        border-radius:14px !important;
        background:#eef4f1 !important;
        color:#173f31 !important;
        font-size:18px !important;
        font-weight:700 !important;
      }
      #liveEstimateTotal strong{font-size:22px !important;color:#173f31 !important;}
    `;
    document.head.appendChild(s);
  }

  function getRows(){
    const items=document.getElementById('items');
    return items ? Array.from(items.children).filter(el=>el.classList && el.classList.contains('item')) : [];
  }

  function ensureTotalBox(){
    const add=document.getElementById('addItem');
    if(!add) return null;
    let box=document.getElementById('liveEstimateTotal');
    if(!box){
      box=document.createElement('div');
      box.id='liveEstimateTotal';
      box.innerHTML='<span>Estimate Total</span><strong>R 0.00</strong>';
      add.insertAdjacentElement('afterend',box);
    }
    return box;
  }

  function update(){
    ensureStyles();
    let total=0;
    getRows().forEach(row=>{
      const qty=parseFloat(row.querySelector('input.qty')?.value)||0;
      const rate=parseFloat(row.querySelector('input.rate')?.value)||0;
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

  function queue(){ requestAnimationFrame(()=>requestAnimationFrame(update)); }

  function start(){
    update();
    const items=document.getElementById('items');
    if(items){
      new MutationObserver(queue).observe(items,{childList:true,subtree:true});
    }
    setTimeout(update,250);
    setTimeout(update,1000);
  }

  document.addEventListener('input',e=>{
    if(e.target && e.target.matches && (e.target.matches('#items .qty')||e.target.matches('#items .rate'))) queue();
  },true);
  document.addEventListener('change',e=>{
    if(e.target && e.target.matches && (e.target.matches('#items .qty')||e.target.matches('#items .rate'))) queue();
  },true);
  document.addEventListener('click',e=>{
    if(e.target && e.target.closest && (e.target.closest('#addItem')||e.target.closest('#items .remove'))) setTimeout(update,50);
  },true);

  window.ontboomUpdateTotals=update;
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start);
  else start();
  window.addEventListener('load',()=>setTimeout(update,100));
})();