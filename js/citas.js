// citas.js
let vista = [];
const gc = () => JSON.parse(localStorage.getItem('citas') || '[]');
const sc = (c) => localStorage.setItem('citas', JSON.stringify(c));
const badge = (e) => ({ Programada: 'bg-primary', Confirmada: 'bg-success', Cancelada: 'bg-danger' }[e] || 'bg-secondary');

function render(citas) {
  vista = citas;
  document.getElementById('total').textContent = citas.length;
  const tbody = document.getElementById('tbody');
  const sinCitas = document.getElementById('sinCitas');

  if (!citas.length) {
    tbody.innerHTML = '';
    sinCitas.classList.remove('d-none');
    return;
  }
  sinCitas.classList.add('d-none');
  tbody.innerHTML = citas.map((c, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${c.nombre}<br><small class="text-muted">${c.email}</small></td>
      <td>${c.especialidad}</td>
      <td>${c.fecha}</td>
      <td>${c.hora}</td>
      <td><span class="badge ${badge(c.estado)}">${c.estado}</span></td>
      <td>
        <button class="btn btn-sm btn-outline-info me-1" onclick="verDetalle(${c.id})">Ver</button>
        <button class="btn btn-sm btn-outline-warning me-1" onclick="editar(${c.id})">Editar</button>
        <button class="btn btn-sm btn-outline-secondary me-1" onclick="abrirEstado(${c.id})">Estado</button>
        <button class="btn btn-sm btn-outline-danger" onclick="eliminar(${c.id})">Eliminar</button>
      </td>
    </tr>`).join('');
}

function filtrar() {
  let c = gc();
  const esp   = document.getElementById('fEsp').value;
  const desde = document.getElementById('fDesde').value;
  const hasta = document.getElementById('fHasta').value;
  const est   = document.getElementById('fEstado').value;
  if (esp)   c = c.filter(x => x.especialidad === esp);
  if (est)   c = c.filter(x => x.estado === est);
  if (desde) c = c.filter(x => x.fecha >= desde);
  if (hasta) c = c.filter(x => x.fecha <= hasta);
  render(c);
}

function limpiarFiltros() {
  ['fEsp','fDesde','fHasta','fEstado'].forEach(id => document.getElementById(id).value = '');
  render(gc());
}

function verDetalle(id) {
  const c = gc().find(x => x.id == id);
  document.getElementById('bodyDetalle').innerHTML = `
    <table class="table table-sm">
      ${Object.entries({ Nombre: c.nombre, Correo: c.email, Teléfono: c.telefono,
        Especialidad: c.especialidad, Fecha: c.fecha, Hora: c.hora, Estado: c.estado, Motivo: c.motivo })
        .map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('')}
    </table>`;
  new bootstrap.Modal(document.getElementById('mDetalle')).show();
}

function editar(id) {
  localStorage.setItem('editCitaId', id);
  location.href = 'registro.html';
}

function abrirEstado(id) {
  const c = gc().find(x => x.id == id);
  document.getElementById('idEstado').value = id;
  document.getElementById('nuevoEstado').value = c.estado;
  new bootstrap.Modal(document.getElementById('mEstado')).show();
}

function guardarEstado() {
  const c = gc();
  const idx = c.findIndex(x => x.id == document.getElementById('idEstado').value);
  if (idx >= 0) { c[idx].estado = document.getElementById('nuevoEstado').value; sc(c); }
  bootstrap.Modal.getInstance(document.getElementById('mEstado')).hide();
  filtrar();
}

function eliminar(id) {
  if (!confirm('¿Eliminar esta cita?')) return;
  sc(gc().filter(c => c.id != id));
  filtrar();
}

function exportarTXT() {
  const citas = vista.length ? vista : gc();
  if (!citas.length) { alert('No hay citas para exportar.'); return; }
  let txt = `SALUDAGENDA - LISTADO DE CITAS\nFecha: ${new Date().toLocaleString('es-MX')}\nTotal: ${citas.length}\n${'='.repeat(40)}\n\n`;
  citas.forEach((c, i) => {
    txt += `Cita #${i+1}\nNombre: ${c.nombre}\nEspecialidad: ${c.especialidad}\nFecha: ${c.fecha} ${c.hora}\nEstado: ${c.estado}\nMotivo: ${c.motivo}\n${'-'.repeat(40)}\n\n`;
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([txt], { type: 'text/plain' }));
  a.download = 'citas.txt';
  a.click();
}

document.addEventListener('DOMContentLoaded', () => render(gc()));