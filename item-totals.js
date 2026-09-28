(function(){
'use strict';
function money(n){n=Number(n)||0;return 'R '+n.toLocaleString('en-ZA',{minimumFractionDigits:2,maximumFractionDigits:2});}
function installStyles(){
 if(document.getElementById('ontboomTotalsStyles'))return;
 var s=document.createElement('style');s.id='ontboomTotalsStyles';
 s.textContent='#items .item .item-live-amount{grid-column:1/-1!important;display:flex!important;justify-content:space-between!important;align-items:center!important;min-height:46px!important;margin-top:4px!important;padding:10px 12px!important;border:1px solid #9db5aa!important;border-radius:9px!important;background:#eef4f1!important;color:#173c2a!important;font-size:15px!important;font-weight:700!important;box-sizing:border-box!important}#items .item .item-live-amount strong{font-size:18px!important}#liveEstimateTotal{display:flex!important;justify-content:space-between!important;align-items:center!important;width:100%!important;margin:14px 0 18px!important;padding:16px 18px!important;border:2px solid #173c2a!important;border-radius:12px!important;background:#eef4f1!important;color:#173c2a!important;font-size:18px!important;font-weight:800!important;box-sizing:border-box!important}#liveEstimateTotal strong{font-size:22px!important;color:#173c2a!important}@media(max-width:650px){#items .item .item-live-amount{grid-column:1/-1!important;grid-row:auto!important}}';
 document.head.appendChild(s);
}
function update(){
 installStyles();
 var root=document.getElementById('items'),add=document.getElementById('addItem');
 if(!root||!add)return;
 var rows=root.getElementsByClassName('item'),total=0;
 for(var i=0;i<rows.length;i++){
  var row=rows[i],q=row.querySelector('.qty'),r=row.querySelector('.rate');
  var amount=(Number(q&&q.value)||0)*(Number(r&&r.value)||0);total+=amount;
  var box=row.querySelector('.item-live-amount');
  if(!box){box=document.createElement('div');box.className='item-live-amount';box.innerHTML='<span>Amount</span><strong>R 0.00</strong>';row.appendChild(box);}
  box.getElementsByTagName('strong')[0].textContent=money(amount);
 }
 var t=document.getElementById('liveEstimateTotal');
 if(!t){t=document.createElement('div');t.id='liveEstimateTotal';t.innerHTML='<span>Estimate Total</span><strong>R 0.00</strong>';add.parentNode.insertBefore(t,add.nextSibling);}
 t.getElementsByTagName('strong')[0].textContent=money(total);
}
function start(){installStyles();update();setInterval(update,250);document.addEventListener('input',update,true);document.addEventListener('change',update,true);document.addEventListener('click',function(){setTimeout(update,0);},true);}
window.ontboomUpdateTotals=update;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();