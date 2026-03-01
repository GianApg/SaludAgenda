// registro.js
document.addEventListener('DOMContentLoaded', function () {
  const $ = (id) => document.getElementById(id);

  $('fecha').min = new Date().toISOString().split('T')[0];

  $('telefono').addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '');
  });

  // Modo edición: cargar datos si hay una cita pendiente de editar
  const editId = localStorage.getItem('editCitaId');
  if (editId) {
    const cita = JSON.parse(localStorage.getItem('citas') || '[]').find(c => String(c.id) === String(editId));
    if (cita) {
      ['nombre','email','telefono','especialidad','fecha','hora','motivo'].forEach(k => $(k).value = cita[k]);
      $('tituloForm').textContent = 'Editar Cita';
    } else {
      // ID inválido, limpiar para no bloquear
      localStorage.removeItem('editCitaId');
    }
  }

  $('formRegistro').addEventListener('submit', function (e) {
    e.preventDefault();
    let ok = true;

    const checks = [
      [$('nombre'),       $('nombre').value.trim().length >= 3],
      [$('email'),        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('email').value)],
      [$('telefono'),     $('telefono').value.length >= 10],
      [$('especialidad'), !!$('especialidad').value],
      [$('fecha'),        !!$('fecha').value && $('fecha').value >= new Date().toISOString().split('T')[0]],
      [$('hora'),         !!$('hora').value],
      [$('motivo'),       $('motivo').value.trim().length >= 10],
    ];

    checks.forEach(([el, valid]) => {
      el.classList.toggle('is-invalid', !valid);
      if (!valid) ok = false;
    });

    if (!ok) {
      $('alertError').classList.remove('d-none');
      $('alertSuccess').classList.add('d-none');
      return;
    }

    const datos = {
      nombre:       $('nombre').value.trim(),
      email:        $('email').value.trim(),
      telefono:     $('telefono').value,
      especialidad: $('especialidad').value,
      fecha:        $('fecha').value,
      hora:         $('hora').value,
      motivo:       $('motivo').value.trim()
    };

    const citas = JSON.parse(localStorage.getItem('citas') || '[]');
    const currentEditId = localStorage.getItem('editCitaId');

    if (currentEditId) {
      const idx = citas.findIndex(c => String(c.id) === String(currentEditId));
      if (idx >= 0) citas[idx] = { ...citas[idx], ...datos };
      localStorage.removeItem('editCitaId');
    } else {
      citas.push({
        id: Date.now(),
        ...datos,
        estado: 'Programada',
        fechaRegistro: new Date().toLocaleDateString('es-MX')
      });
    }

    localStorage.setItem('citas', JSON.stringify(citas));

    $('alertSuccess').classList.remove('d-none');
    $('alertError').classList.add('d-none');
    this.reset();
    checks.forEach(([el]) => el.classList.remove('is-invalid'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.limpiar = function () {
    $('formRegistro').reset();
    document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    $('alertSuccess').classList.add('d-none');
    $('alertError').classList.add('d-none');
    localStorage.removeItem('editCitaId');
  };
});