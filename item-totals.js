(function(){
  'use strict';

  const money=n=>'R '+(Number(n)||0).toLocaleString('en-ZA',{minimumFractionDigits:2,maximumFractionDigits:2});

  function installStyles(){
    if(document.getElementById('ontboomTotalsStyles')) return;
    const style=document.createElement('style');
    style.id='ontboomTotalsStyles';
    style.textContent=`
      #items .item .item-live-amount{
        grid-column:1/-1 !important;
        display:flex !important;
        justify-content:space-between !important;
        align-items:center !important;
        min-height:46px !important;
        margin-top:2px !important;
        padding:10px 12px !important;
        border:1px solid #cbd5cf !important;
        border-radius:9px !important;
        background:#fff !important;
        color:#173c2a !important;
        font-size:15px !important;
        font-weight:700 !important;
        box-sizing:border-box !important;
      }
      #items .item .item-live-amount strong{font-size:17px !important;}
      #liveEstimateTotal{
        display:flex !important;
        justify-content:space-between !important;
        align-items:center !important;
        width:100% !important;
        margin:14px 0 18px !important;
        padding:16px 18px !important;
        border:2px solid #9db5aa !important;
        border-radius:12px !important;
        background:#eef4f1 !important;
        color:#173c31 !important;
        font-size:18px !important;
        font-weight:800 !important;
        box-sizing:border-box !important;
      }
      #liveEstimateTotal strong{font-size:22px !important;color:#173c2a !important;}
      @media(max-width:650px){
        #items .item .item-live-amount{grid-column:1/-1 !important;grid-row:auto !important;}
      }
    `;
    document.head.appendChild(style);
  }

  function rows(){
    const root=document.getElementById('items');
    return root?Array.from(root.querySelectorAll(':scope > .item')):[];
  }

  function ensureAmount(row){
    let el=row.querySelector('.item-live-amount');
    if(!el){
      el=document.createElement('div');
      el.className='item-live-amount';
      el.innerHTML='<span>Amount</span><strong>R 0.00</strong>';
      row.appendChild(el);
    }
    return el;
  }

  function ensureTotal(){
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
    installStyles();
    let total=0;
    rows().forEach(row=>{
      const qty=Number(row.querySelector('.qty')?.value)||0;
      const rate=Number(row.querySelector('.rate')?.value)||0;
      const amount=qty*rate;
      total+=amount;
      const el=ensureAmount(row);
      const value=el.querySelector('strong');
      if(value) value.textContent=money(amount);
    });
    const totalBox=ensureTotal();
    if(totalBox){
      const value=totalBox.querySelector('strong');
      if(value) value.textContent=money(total);
      const label=totalBox.querySelector('span');
      if(label) label.textContent=(window.type==='Invoice'?'Invoice Total':'Estimate Total');
    }
  }

  let queued=false;
  function queue(){
    if(queued) return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;update();});
  }

  function start(){
    installStyles();
    update();
    const root=document.getElementById('items');
    if(root){
      new MutationObserver(mutations=>{
        if(mutations.some(m=>Array.from(m.addedNodes).some(n=>n.nodeType===1&&n.classList?.contains('item'))||Array.from(m.removedNodes).some(n=>n.nodeType===1&&n.classList?.contains('item')))) queue();
      }).observe(root,{childList:true});
    }
  }

  document.addEventListener('input',e=>{
    if(e.target?.matches?.('#items .qty, #items .rate')) queue();
  },true);
  document.addEventListener('change',e=>{
    if(e.target?.matches?.('#items .qty, #items .rate')) queue();
  },true);
  document.addEventListener('click',e=>{
    if(e.target?.closest?.('#addItem, #items .remove')) setTimeout(update,0);
  },true);

  window.ontboomUpdateTotals=update;
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();