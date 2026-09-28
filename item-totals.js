(function(){
'use strict';
function num(v){var n=parseFloat(String(v==null?'':v).replace(/[^0-9.-]/g,''));return isFinite(n)?n:0;}
function money(n){return 'R '+num(n).toLocaleString('en-ZA',{minimumFractionDigits:2,maximumFractionDigits:2});}
function css(){
 if(document.getElementById('ontboom-live-totals-css'))return;
 var s=document.createElement('style');s.id='ontboom-live-totals-css';
 s.textContent='.item-live-amount{grid-column:1/-1!important;display:flex!important;visibility:visible!important;opacity:1!important;justify-content:space-between!important;align-items:center!important;width:100%!important;min-height:50px!important;padding:12px 14px!important;margin:2px 0 0!important;border:2px solid #173c2a!important;border-radius:9px!important;background:#eef4f1!important;color:#173c2a!important;font-weight:800!important}.item-live-amount strong{font-size:19px!important}.ontboom-live-total{display:flex!important;visibility:visible!important;opacity:1!important;justify-content:space-between!important;align-items:center!important;width:100%!important;min-height:58px!important;margin:14px 0 20px!important;padding:15px 17px!important;border:2px solid #173c2a!important;border-radius:10px!important;background:#173c2a!important;color:#fff!important;font-size:18px!important;font-weight:800!important}.ontboom-live-total strong{font-size:22px!important;color:#fff!important}';
 document.head.appendChild(s);
}
function ensureTotal(){
 var items=document.getElementById('items'),add=document.getElementById('addItem');if(!items||!add)return null;
 var t=document.getElementById('liveEstimateTotal');
 if(!t){t=document.createElement('div');t.id='liveEstimateTotal';t.className='ontboom-live-total';t.innerHTML='<span>ESTIMATE TOTAL</span><strong>R 0.00</strong>';add.parentNode.insertBefore(t,add.nextSibling);}
 return t;
}
function update(){
 css();var items=document.getElementById('items');if(!items)return;
 var rows=items.querySelectorAll('.item'),total=0;
 for(var i=0;i<rows.length;i++){
  var row=rows[i],q=row.querySelector('.qty'),r=row.querySelector('.rate');
  var amount=num(q?q.value:0)*num(r?r.value:0);total+=amount;
  var box=row.querySelector('.item-live-amount');
  if(!box){box=document.createElement('div');box.className='item-live-amount';box.innerHTML='<span>Amount</span><strong></strong>';row.appendChild(box);}
  var strong=box.querySelector('strong');if(strong)strong.textContent=money(amount);
 }
 var t=ensureTotal();if(t){var st=t.querySelector('strong');if(st)st.textContent=money(total);}
}
function start(){
 css();update();
 document.addEventListener('input',function(e){if(e.target&&e.target.closest&&e.target.closest('#items'))update();},true);
 document.addEventListener('change',update,true);
 document.addEventListener('click',function(){setTimeout(update,20);},true);
 var items=document.getElementById('items');if(items&&window.MutationObserver){new MutationObserver(update).observe(items,{childList:true,subtree:true});}
 setInterval(update,500);
}
window.ontboomUpdateTotals=update;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();