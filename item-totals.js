(function(){
'use strict';
function num(v){var n=parseFloat(String(v==null?'':v).replace(/[^0-9.-]/g,''));return isFinite(n)?n:0;}
function money(n){return 'R '+num(n).toLocaleString('en-ZA',{minimumFractionDigits:2,maximumFractionDigits:2});}
function installCss(){
 if(document.getElementById('ontboom-live-totals-css'))return;
 var s=document.createElement('style');s.id='ontboom-live-totals-css';
 s.textContent='.item-live-amount{grid-column:1/-1!important;display:flex!important;visibility:visible!important;opacity:1!important;justify-content:space-between!important;align-items:center!important;width:100%!important;min-width:0!important;min-height:46px!important;padding:10px 14px!important;margin:8px 0 0!important;border:2px solid #173c2a!important;border-radius:9px!important;background:#eef4f1!important;color:#173c2a!important;font-weight:800!important;box-sizing:border-box!important}.item-live-amount strong{font-size:18px!important;white-space:nowrap!important}.ontboom-live-total{display:flex!important;visibility:visible!important;opacity:1!important;justify-content:space-between!important;align-items:center!important;width:100%!important;min-width:0!important;min-height:58px!important;margin:14px 0 20px!important;padding:15px 17px!important;border:2px solid #173c2a!important;border-radius:10px!important;background:#173c2a!important;color:#fff!important;font-size:18px!important;font-weight:800!important;box-sizing:border-box!important}.ontboom-live-total strong{font-size:22px!important;color:#fff!important;white-space:nowrap!important}@media(max-width:650px){.item{grid-template-columns:minmax(0,1fr) minmax(0,1fr) 44px!important}.item .qty{grid-column:1!important;min-width:0!important;width:100%!important}.item .rate{grid-column:2!important;min-width:0!important;width:100%!important}.item .remove{grid-column:3!important}.item-live-amount{grid-column:1/-1!important;grid-row:auto!important;margin-top:2px!important}}';
 document.head.appendChild(s);
}
function ensureAmount(row){
 var box=row.querySelector('.item-live-amount');
 if(!box){box=document.createElement('div');box.className='item-live-amount';box.innerHTML='<span>Amount</span><strong>R 0.00</strong>';row.appendChild(box);}
 return box;
}
function ensureTotal(){
 var items=document.getElementById('items'),add=document.getElementById('addItem');if(!items||!add)return null;
 var t=document.getElementById('liveEstimateTotal');
 if(!t){t=document.createElement('div');t.id='liveEstimateTotal';t.className='ontboom-live-total';t.innerHTML='<span>ESTIMATE TOTAL</span><strong>R 0.00</strong>';add.insertAdjacentElement('afterend',t);}
 return t;
}
function update(){
 installCss();
 var items=document.getElementById('items');if(!items)return;
 var rows=items.getElementsByClassName('item'),total=0;
 for(var i=0;i<rows.length;i++){
   var row=rows[i],q=row.getElementsByClassName('qty')[0],r=row.getElementsByClassName('rate')[0];
   var amount=num(q&&q.value)*num(r&&r.value);total+=amount;
   var box=ensureAmount(row),strong=box.getElementsByTagName('strong')[0];if(strong)strong.textContent=money(amount);
 }
 var t=ensureTotal();if(t){var st=t.getElementsByTagName('strong')[0];if(st)st.textContent=money(total);}
}
function start(){
 installCss();update();
 document.addEventListener('input',function(e){var el=e.target;if(el&&(el.classList.contains('qty')||el.classList.contains('rate')))update();},true);
 document.addEventListener('change',update,true);
 document.addEventListener('click',function(e){if(e.target&&(e.target.id==='addItem'||e.target.classList.contains('remove')))setTimeout(update,0);},true);
 var items=document.getElementById('items');if(items&&window.MutationObserver){var busy=false;new MutationObserver(function(){if(busy)return;busy=true;setTimeout(function(){update();busy=false;},0);}).observe(items,{childList:true});}
 setInterval(update,500);
}
window.ontboomUpdateTotals=update;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();