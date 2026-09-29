(function(){
 const b=document.getElementById('chooseContact'); if(!b)return;
 function apply(name,phone){const n=document.getElementById('customer'),p=document.getElementById('customerCell');if(n&&name)n.value=name;if(p&&phone)p.value=phone;n?.dispatchEvent(new Event('input',{bubbles:true}));p?.dispatchEvent(new Event('input',{bubbles:true}));if(typeof render==='function')render();if(typeof scheduleShare==='function')scheduleShare();}
 window.ontboomContactPicked=function(name,phone){apply(name||'',phone||'');};
 b.addEventListener('click',async function(e){
  e.preventDefault();e.stopPropagation();
  try{
   if(window.OntboomAndroid&&typeof window.OntboomAndroid.pickContact==='function'){window.OntboomAndroid.pickContact();return;}
   if(navigator.contacts&&typeof navigator.contacts.select==='function'){const x=await navigator.contacts.select(['name','tel'],{multiple:false});if(x&&x[0])apply(Array.isArray(x[0].name)?x[0].name[0]:x[0].name||'',Array.isArray(x[0].tel)?x[0].tel[0]:x[0].tel||'');return;}
   alert('Contacts are not available in this installation.');
  }catch(err){if(!/cancel/i.test(String(err)))alert('Could not open Contacts.');}
 },true);
})();