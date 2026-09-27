(function(){
  const area = document.getElementById('contactPickerArea');
  const button = document.getElementById('chooseContact');
  if (!window.Capacitor || Capacitor.getPlatform() !== 'android' || !button) return;
  if (area) area.hidden = false;
  button.onclick = async function () {
    try {
      const Contacts = Capacitor.Plugins.Contacts;
      const picked = await Contacts.pickContact();
      const c = picked.contacts ? picked.contacts[0] : picked;
      if (!c) return;
      const name = c.displayName || [c.name?.givenName, c.name?.familyName].filter(Boolean).join(' ');
      const phone = c.phoneNumbers?.[0]?.value || '';
      if (name) document.getElementById('customer').value = name;
      if (phone) document.getElementById('customerCell').value = phone;
      render();
    } catch (e) {
      if (!String(e?.message || e).toLowerCase().includes('cancel')) alert('Could not open Contacts. Please check Ontboom Contacts permission and try again.');
    }
  };
})();
