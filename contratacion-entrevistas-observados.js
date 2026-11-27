/* DIMARZA - complemento de entrevistas no realizadas (usa la API de agenda existente). */
let idNoRealizadaOps = null;
function leerNoRealizadaOps(agenda) {
  const marca = '[[DIMARZA_ENTREVISTA_NO_REALIZADA_V1]]';
  const texto = String(agenda?.observacion || '');
  if (!texto.startsWith(marca)) return null;
  const fin = texto.indexOf('\n');
  if (fin < 0) return null;
  try {
    const datos = JSON.parse(texto.slice(marca.length, fin));
    if (!datos || !String(datos.motivo || '').trim()) return null;
    return { motivo: String(datos.motivo).trim(), fecha: datos.fecha || '', previa: texto.slice(fin + 1) };
  } catch (_) { return null; }
}

function estadoEntrevistaOps(id, agenda, esRealizada) {
  if (esRealizada) return 'REALIZADAS';
  const estado = String(agenda?.estadoCita || '').toUpperCase().trim();
  if (leerNoRealizadaOps(agenda) || ['NO REALIZADA','NO_REALIZADA','OBSERVADO','OBSERVADA'].includes(estado)) return 'OBSERVADOS';
  return 'PENDIENTES';
}

function prepararVistaObservadosOps() {
  if (!document.getElementById('cssObservadosOperaciones')) {
    const estilo = document.createElement('style');
    estilo.id = 'cssObservadosOperaciones';
    estilo.textContent = `
      #tabEntrevistas .subtabs-entrevistas { grid-template-columns:repeat(3,minmax(0,1fr)); }
      #tabEntrevistas .tabla-operaciones { min-width:1200px !important; }
      #tabEntrevistas .tabla-operaciones th:nth-child(1) {width:15%}
      #tabEntrevistas .tabla-operaciones th:nth-child(2) {width:6%}
      #tabEntrevistas .tabla-operaciones th:nth-child(3) {width:8%}
      #tabEntrevistas .tabla-operaciones th:nth-child(4) {width:8%}
      #tabEntrevistas .tabla-operaciones th:nth-child(5) {width:7%}
      #tabEntrevistas .tabla-operaciones th:nth-child(6) {width:7%}
      #tabEntrevistas .tabla-operaciones th:nth-child(7) {width:5%}
      #tabEntrevistas .tabla-operaciones th:nth-child(8) {width:12%}
      #tabEntrevistas .tabla-operaciones th:nth-child(9) {width:8%}
      #tabEntrevistas .tabla-operaciones th:nth-child(10) {width:10%}
      #tabEntrevistas .tabla-operaciones th:nth-child(11) {width:6%}
      #tabEntrevistas .tabla-operaciones th:nth-child(12) {width:8%}
      #tabEntrevistas .acciones-pendientes-ops {display:flex;flex-direction:column;gap:6px}
      #tabEntrevistas .btn-no-realizada-ops, #tabEntrevistas .btn-reprogramar-observada {
        display:block;box-sizing:border-box;width:100%;border-radius:7px;padding:7px 4px;
        border:1px solid #d97706;background:#fffbeb;color:#92400e;font-weight:700;
        font-size:11px;line-height:1.25;white-space:normal;cursor:pointer;
      }
      #tabEntrevistas .btn-no-realizada-ops:hover, #tabEntrevistas .btn-reprogramar-observada:hover {background:#fde68a}
      #tabEntrevistas .estado-observada-ops {background:#fef3c7;color:#92400e;border:1px solid #fbbf24}
      #tabEntrevistas .texto-motivo-ops {display:block;font-size:12px;line-height:1.35;overflow-wrap:anywhere;max-height:4.05em;overflow:hidden}
      #modalNoRealizadaOps {display:none;position:fixed;inset:0;z-index:20000;align-items:center;justify-content:center;padding:16px;background:rgba(15,23,42,.55);box-sizing:border-box}
      #modalNoRealizadaOps.visible {display:flex}
      #modalNoRealizadaOps .contenido-no-realizada {background:#fff;border-radius:12px;padding:24px;max-width:480px;width:100%;box-sizing:border-box;box-shadow:0 12px 46px rgba(0,0,0,.25)}
      #modalNoRealizadaOps h2 {margin:0 0 8px;font-size:20px}
      #modalNoRealizadaOps p {margin:0 0 14px;color:#475569;font-size:13px}
      #modalNoRealizadaOps label {display:block;font-weight:700;font-size:13px;margin-bottom:6px}
      #modalNoRealizadaOps textarea {box-sizing:border-box;display:block;width:100%;min-height:110px;border:1px solid #cbd5e1;border-radius:8px;padding:10px;font:inherit;font-size:14px;resize:vertical}
      #modalNoRealizadaOps .pie-no-realizada {display:flex;justify-content:flex-end;gap:10px;flex-wrap:wrap;margin-top:16px}
      #modalNoRealizadaOps button {padding:10px 14px;border:0;border-radius:7px;font-weight:700;cursor:pointer}
      #modalNoRealizadaOps button:disabled {opacity:.55;cursor:wait}
      #modalNoRealizadaOps .cancelar-no-realizada {background:#e2e8f0;color:#334155}
      #modalNoRealizadaOps .guardar-no-realizada {background:#b45309;color:#fff}
      @media(max-width:650px) {#tabEntrevistas .subtab-entrevista {padding:11px 4px;font-size:11px}}
    `;
    document.head.appendChild(estilo);
  }
  if (!document.getElementById('modalNoRealizadaOps')) {
    const modal = document.createElement('div');
    modal.id = 'modalNoRealizadaOps';
    modal.setAttribute('role','dialog');
    modal.setAttribute('aria-modal','true');
    modal.setAttribute('aria-labelledby','tituloNoRealizadaOps');
    modal.innerHTML = `
      <div class="contenido-no-realizada">
        <h2 id="tituloNoRealizadaOps">Entrevista no realizada</h2>
        <p id="nombreNoRealizadaOps"></p>
        <form onsubmit="guardarNoRealizadaOps(event)">
          <label for="motivoNoRealizadaOps">Motivo por el que no se realizó la entrevista *</label>
          <textarea id="motivoNoRealizadaOps" maxlength="1500" required placeholder="Ej.: No se presentó; no contestó las llamadas; solicitó reprogramación."></textarea>
          <div class="pie-no-realizada">
            <button type="button" class="cancelar-no-realizada" onclick="cerrarNoRealizadaOps()">Cancelar</button>
            <button type="submit" class="guardar-no-realizada" id="btnGuardarNoRealizadaOps">Guardar motivo</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => {if(e.target===modal) cerrarNoRealizadaOps();});
    document.addEventListener('keydown', e => {if(e.key==='Escape' && modal.classList.contains('visible')) cerrarNoRealizadaOps();});
  }
}

function abrirNoRealizadaOps(idCandidato) {
  const agenda = agendaEntrevistas.find(a => String(a.idCandidato) === String(idCandidato));
  const candidato = todosCandidatos.find(c => String(c.idCandidato) === String(idCandidato));
  const realizada = entrevistasRealizadas.some(e => String(e.idCandidato) === String(idCandidato));
  if (!agenda || !candidato || realizada) {
    alert('Esta opción requiere una entrevista programada que todavía no se haya realizado.');
    return;
  }
  prepararVistaObservadosOps();
  idNoRealizadaOps = idCandidato;
  document.getElementById('nombreNoRealizadaOps').textContent = candidato.nombres + ' — ' + (agenda.fechaProgramada || '');
  document.getElementById('motivoNoRealizadaOps').value = leerNoRealizadaOps(agenda)?.motivo || '';
  document.getElementById('modalNoRealizadaOps').classList.add('visible');
  document.getElementById('motivoNoRealizadaOps').focus();
}

function cerrarNoRealizadaOps() {
  if (document.getElementById('btnGuardarNoRealizadaOps')?.disabled) return;
  document.getElementById('modalNoRealizadaOps')?.classList.remove('visible');
  idNoRealizadaOps = null;
}

async function guardarNoRealizadaOps(event) {
  event.preventDefault();
  const agenda = agendaEntrevistas.find(a => String(a.idCandidato) === String(idNoRealizadaOps));
  const candidato = todosCandidatos.find(c => String(c.idCandidato) === String(idNoRealizadaOps));
  const motivo = document.getElementById('motivoNoRealizadaOps').value.trim();
  if (!agenda || !candidato || !motivo) {
    alert('No se pudo identificar la entrevista o falta el motivo.');
    return;
  }
  const antes = leerNoRealizadaOps(agenda);
  const observacionPrevia = antes ? antes.previa : String(agenda.observacion || '');
  const observacion = '[[DIMARZA_ENTREVISTA_NO_REALIZADA_V1]]' +
    JSON.stringify({motivo, fecha:new Date().toISOString()}) + '\n' + observacionPrevia;
  const boton = document.getElementById('btnGuardarNoRealizadaOps');
  boton.disabled = true;
  boton.textContent = 'Guardando...';
  try {
    const respuesta = await fetch(API_CONTRATACION, {
      method:'POST',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({
        accion:'guardarAgendaEntrevista',
        idCandidato:candidato.idCandidato,
        idRequerimiento:candidato.idRequerimiento || agenda.idRequerimiento || '',
        fechaProgramada:convertirFechaInput(agenda.fechaProgramada),
        horaProgramada:agenda.horaProgramada || '',
        modalidad:agenda.modalidad || '',
        lugarEnlace:agenda.lugarEnlace || '',
        entrevistador:agenda.entrevistador || '',
        observacion,
        estadoCita:'NO REALIZADA'
      })
    });
    const resultado = await respuesta.json();
    if (!resultado.ok) throw new Error(resultado.mensaje || 'El servidor rechazó el registro.');
    document.getElementById('modalNoRealizadaOps').classList.remove('visible');
    idNoRealizadaOps = null;
    vistaEntrevistasActual = 'OBSERVADOS';
    await cargarOperaciones();
    const confirmado = agendaEntrevistas.find(a => String(a.idCandidato) === String(candidato.idCandidato));
    if (!leerNoRealizadaOps(confirmado)) alert('El servidor respondió correctamente, pero no se pudo verificar el motivo al recargar. Comprueba el registro.');
  } catch (error) {
    alert('No se pudo guardar el motivo: ' + error.message);
  } finally {
    boton.disabled = false;
    boton.textContent = 'Guardar motivo';
  }
}

function agregarObservadosOps() {
  prepararVistaObservadosOps();
  const contenedor = document.getElementById('contenidoEntrevistas');
  if (!contenedor) return;
  const subtabs = contenedor.querySelector('.subtabs-entrevistas');
  if (!subtabs) return;
  if (!document.getElementById('subtabObservados')) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'subtab-entrevista';
    boton.id = 'subtabObservados';
    boton.setAttribute('aria-pressed','false');
    boton.innerHTML = 'Observados <span id="totalEntrevistasObservados" class="contador-entrevistas">0</span>';
    boton.addEventListener('click', () => cambiarVistaEntrevistas('OBSERVADOS'));
    subtabs.appendChild(boton);
  }
  const tabla = contenedor.querySelector('table.tabla-operaciones');
  if (!tabla) return;
  const encabezado = tabla.querySelector('thead tr');
  if (encabezado && !encabezado.querySelector('.col-motivo-observado')) {
    const col = document.createElement('th');
    col.className = 'col-motivo-observado';
    col.textContent = 'Motivo';
    encabezado.insertBefore(col, encabezado.lastElementChild);
  }
  tabla.querySelectorAll('tbody tr').forEach(fila => {
    if (fila.dataset.motivoAplicadoOps === '1') return;
    if (fila.cells.length < 2) {
      if (fila.cells[0]?.hasAttribute('colspan')) fila.cells[0].colSpan += 1;
      return;
    }
    const id = fila.querySelector('.dato-secundario')?.textContent.trim() || '';
    const agenda = agendaEntrevistas.find(a => String(a.idCandidato) === id);
    const metadata = leerNoRealizadaOps(agenda);
    const realizada = fila.dataset.estadoEntrevista === 'REALIZADA';
    const estadoOriginal = String(agenda?.estadoCita || '').toUpperCase();
    const observada = !realizada && (metadata || ['NO REALIZADA','NO_REALIZADA','OBSERVADA','OBSERVADO'].includes(estadoOriginal));
    if (observada) {
      fila.dataset.estadoEntrevista = 'OBSERVADOS';
      const badge = fila.querySelector('.estado-agenda');
      if (badge) {
        badge.textContent = 'NO REALIZADA';
        badge.className = 'estado-agenda estado-observada-ops';
      }
    }
    const motivo = document.createElement('td');
    const valor = metadata?.motivo || (observada ? String(agenda?.observacion || '') : '');
    if (valor) {
      const texto = document.createElement('span');
      texto.className = 'texto-motivo-ops';
      texto.title = valor;
      texto.textContent = valor;
      motivo.appendChild(texto);
    } else {
      motivo.textContent = '—';
    }
    const celdaAccion = fila.lastElementChild;
    fila.insertBefore(motivo, celdaAccion);
    if (observada) {
      celdaAccion.innerHTML = '';
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'btn-reprogramar-observada';
      boton.textContent = 'Reprogramar';
      boton.addEventListener('click', () => abrirAgenda(id));
      celdaAccion.appendChild(boton);
    } else if (!realizada && agenda) {
      const original = celdaAccion.querySelector('.btn-iniciar-entrevista');
      if (original) {
        const grupo = document.createElement('div');
        grupo.className = 'acciones-pendientes-ops';
        original.parentNode.replaceChild(grupo, original);
        grupo.appendChild(original);
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'btn-no-realizada-ops';
        boton.textContent = 'No se realizó';
        boton.addEventListener('click', () => abrirNoRealizadaOps(id));
        grupo.appendChild(boton);
      }
    }
    fila.dataset.motivoAplicadoOps = '1';
  });
}

function filtrarConObservadosOps() {
  filtroEntrevistadorSeleccionado = document.getElementById('filtroEntrevistador')?.value || '';
  const filas = [...document.querySelectorAll('#tabEntrevistas tbody tr[data-entrevistador]')];
  const conteo = {PENDIENTES:0,REALIZADAS:0,OBSERVADOS:0};
  let visibles = 0;
  for (const fila of filas) {
    const estado = fila.dataset.estadoEntrevista === 'OBSERVADOS' ? 'OBSERVADOS'
      : fila.dataset.estadoEntrevista === 'REALIZADA' ? 'REALIZADAS' : 'PENDIENTES';
    const coincide = !filtroEntrevistadorSeleccionado || fila.dataset.entrevistador === filtroEntrevistadorSeleccionado;
    if (coincide) conteo[estado]++;
    const mostrar = coincide && estado === vistaEntrevistasActual;
    fila.style.display = mostrar ? '' : 'none';
    if (mostrar) visibles++;
  }
  [['PENDIENTES','totalEntrevistasPendientes'],['REALIZADAS','totalEntrevistasRealizadas'],['OBSERVADOS','totalEntrevistasObservados']].forEach(([estado,id]) => {
    const nodo = document.getElementById(id);
    if (nodo) nodo.textContent = String(conteo[estado]);
  });
  const descripcion = document.getElementById('descripcionVistaEntrevistas');
  if (descripcion) descripcion.textContent = {
    PENDIENTES:'Candidatos sin entrevista realizada, incluidos los que todavía no tienen fecha programada.',
    REALIZADAS:'Entrevistas completadas, independientemente del resultado de la evaluación.',
    OBSERVADOS:'Entrevistas no realizadas: consulta el motivo registrado y reprograma cuando corresponda.'
  }[vistaEntrevistasActual] || '';
  [['PENDIENTES','subtabPendientes'],['REALIZADAS','subtabRealizadas'],['OBSERVADOS','subtabObservados']].forEach(([estado,id]) => {
    const boton = document.getElementById(id);
    if (boton) {
      boton.classList.toggle('activa', vistaEntrevistasActual === estado);
      boton.setAttribute('aria-pressed', String(vistaEntrevistasActual === estado));
    }
  });
  let vacia = document.getElementById('sinEntrevistasFiltradas');
  if (!vacia && filas.length) {
    const tbody = document.querySelector('#tabEntrevistas table.tabla-operaciones tbody');
    if (tbody) {
      vacia = document.createElement('tr');
      vacia.id = 'sinEntrevistasFiltradas';
      const td = document.createElement('td');
      td.colSpan = 12;
      td.className = 'sin-registros';
      vacia.appendChild(td);
      tbody.appendChild(vacia);
    }
  }
  if (vacia) {
    vacia.style.display = visibles ? 'none' : '';
    const td = vacia.querySelector('td');
    if (td) {
      td.textContent = 'No hay entrevistas ' +
        ({PENDIENTES:'pendientes',REALIZADAS:'realizadas',OBSERVADOS:'observadas'}[vistaEntrevistasActual]) +
        (filtroEntrevistadorSeleccionado ? ' para este entrevistador.' : '.');
    }
  }
}

function marcarAgendaObservadosOps() {
  const tbody = document.querySelector('#tabAgenda table.tabla-operaciones tbody');
  if (!tbody) return;
  let marcados = 0;
  tbody.querySelectorAll('tr').forEach(fila => {
    const id = fila.querySelector('.dato-secundario')?.textContent.trim() || '';
    const agenda = agendaEntrevistas.find(a => String(a.idCandidato) === id);
    if (!agenda || !leerNoRealizadaOps(agenda)) return;
    marcados++;
    const estado = fila.querySelector('.estado-agenda');
    if (estado) {
      estado.className = 'estado-agenda estado-observada-ops';
      estado.textContent = 'NO REALIZADA';
    }
  });
  const tarjetas = document.querySelectorAll('#tabAgenda .kpi-operaciones .kpi-operaciones');
  if (tarjetas.length > 1 && marcados) {
    const programadas = tarjetas[1].querySelector('strong');
    if (programadas) programadas.textContent = String(Math.max(0, Number(programadas.textContent || 0) - marcados));
  }
}

function activarObservadosOperaciones() {
  const previoRenderEntrevistas = renderizarEntrevistas;
  renderizarEntrevistas = function () {
    previoRenderEntrevistas.apply(this,arguments);
    agregarObservadosOps();
    filtrarConObservadosOps();
  };
  cambiarVistaEntrevistas = function(vista) {
    if (!['PENDIENTES','REALIZADAS','OBSERVADOS'].includes(vista)) return;
    vistaEntrevistasActual = vista;
    filtrarConObservadosOps();
  };
  filtrarEntrevistas = filtrarConObservadosOps;
  const previoAbrirAgenda = abrirAgenda;
  abrirAgenda = function(id) {
    previoAbrirAgenda.apply(this,arguments);
    const agenda = agendaEntrevistas.find(a => String(a.idCandidato) === String(id));
    const original = leerNoRealizadaOps(agenda);
    if (original) {
      const textarea = document.getElementById('observacionAgenda');
      if (textarea) textarea.value = original.previa;
    }
  };
  const previoRenderAgenda = renderizarAgenda;
  renderizarAgenda = function() {
    previoRenderAgenda.apply(this,arguments);
    marcarAgendaObservadosOps();
  };
  document.addEventListener('DOMContentLoaded', prepararVistaObservadosOps);
}

activarObservadosOperaciones();
