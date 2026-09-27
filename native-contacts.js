(function(){
  const area = document.getElementById('contactPickerArea');
  const button = document.getElementById('chooseContact');
  if (!button) return;
  if (area) area.hidden = false;

  const cap = window.Capacitor;
  const isNativeAndroid = !!cap && typeof cap.getPlatform === 'function' && cap.getPlatform() === 'android';

  function getContactsPlugin() {
    if (!cap) return null;
    if (typeof cap.registerPlugin === 'function') {
      try { return cap.registerPlugin('Contacts'); } catch (_) {}
    }
    return cap.Plugins && cap.Plugins.Contacts;
  }

  function applyContact(c) {
    if (!c) return;
    const name = c.displayName || c.fullName ||
      [c.givenName, c.middleName, c.familyName].filter(Boolean).join(' ') ||
      c.name?.display ||
      [c.name?.givenName, c.name?.middleName, c.name?.familyName].filter(Boolean).join(' ') ||
      (Array.isArray(c.name) ? c.name[0] : '');
    const phones = c.phoneNumbers || c.phones || c.tel || [];
    const firstPhone = Array.isArray(phones) ? phones[0] : phones;
    const phone = typeof firstPhone === 'string' ? firstPhone :
      (firstPhone?.value || firstPhone?.number || '');

    const customer = document.getElementById('customer');
    const cell = document.getElementById('customerCell');
    if (customer && name) customer.value = name;
    if (cell && phone) cell.value = phone;
    customer?.dispatchEvent(new Event('input', { bubbles:true }));
    cell?.dispatchEvent(new Event('input', { bubbles:true }));
    if (typeof render === 'function') render();
  }

  async function pickNativeContact() {
    const Contacts = getContactsPlugin();
    if (!Contacts || typeof Contacts.pickContact !== 'function') {
      throw new Error('Contacts native plugin bridge unavailable');
    }

    // Official @capacitor/contacts handles Android READ_CONTACTS permission
    // internally. pickContact takes no arguments and resolves to one Contact.
    const picked = await Contacts.pickContact();
    applyContact(picked);
  }

  async function pickWebContact() {
    if (!navigator.contacts || typeof navigator.contacts.select !== 'function') {
      throw new Error('Contact picker is not available on this device');
    }
    const selected = await navigator.contacts.select(['name','tel'], { multiple:false });
    if (!selected || !selected.length) return;
    applyContact(selected[0]);
  }

  button.addEventListener('click', async function(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    button.disabled = true;
    try {
      if (isNativeAndroid) await pickNativeContact();
      else await pickWebContact();
      if (typeof scheduleShare === 'function') scheduleShare();
    } catch (e) {
      const msg = String(e?.message || e || '');
      const code = String(e?.code || '');
      if (!/cancel/i.test(msg) && code !== 'OS-PLUG-CONT-0006') {
        console.error('Ontboom contact picker failed', e);
        alert(code === 'OS-PLUG-CONT-0020' || /permission denied/i.test(msg)
          ? 'Contacts permission is required. Please allow Contacts access for Ontboom.'
          : 'Could not open Contacts. Please send a screenshot of this message if it happens again.');
      }
    } finally {
      button.disabled = false;
    }
  }, { passive:false });
})();
