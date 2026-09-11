/* =====================================================
   APIs
===================================================== */

const API_CONTRATACION =
  'https://script.google.com/macros/s/AKfycbzex_3Lnbvymek_tx_IVkm4S6EA1ShGGbdhQzCJdNTBW3lJjHlt76yF5meToB6Ng64V/exec';

const API_PERSONAL =
  'https://script.google.com/macros/s/AKfycbwvueeUnXA1khv-qj-xxZnPi8jq_MzBygE__2TI3w7GMK3-4ev5pMNQ5KIam8mMMlQb/exec';

const API_GESTION_ANDAMIOS =
  'https://script.google.com/macros/s/AKfycbzCpKxltI72KxV8A4igwkxeIHr9XP7SA81SoZZSxo4OoB5N7VaMLLklU9ym82vCwDQN/exec';


/* =====================================================
   VARIABLES
===================================================== */

let candidatosOperaciones = [];
let todosCandidatos = [];
let agendaEntrevistas = [];
let entrevistasRealizadas = [];

let candidatoSeleccionado = null;
let agendaSeleccionada = null;

let candidatoEntrevista = null;
let agendaEntrevistaActual = null;

let entrevistadoresOperaciones = [];


/* =====================================================
   INICIO
===================================================== */

document.addEventListener(
  'DOMContentLoaded',
  async () => {

    prepararTabs();

    crearModalAgenda();
    crearModalEntrevista();

    await cargarEntrevistadores();
    await cargarOperaciones();

  }
);


/* =====================================================
   TABS
===================================================== */

function prepararTabs() {

  const botones =
    document.querySelectorAll(
      '.tab-operaciones'
    );

  botones.forEach(boton => {

    boton.addEventListener(
      'click',
      () => {

        botones.forEach(
          b => b.classList.remove('activo')
        );

        document
          .querySelectorAll('.contenido-tab')
          .forEach(
            c => c.classList.remove('activo')
          );

        boton.classList.add('activo');

        const tab =
          boton.dataset.tab;

        if (tab === 'agenda') {

          document
            .getElementById('tabAgenda')
            .classList.add('activo');

        }

        if (tab === 'entrevistas') {

          document
            .getElementById('tabEntrevistas')
            .classList.add('activo');

        }

      }
    );

  });

}


/* =====================================================
   ENTREVISTADORES
   RESIDENTE + SUPERVISOR ANDAMIERO
===================================================== */

async function cargarEntrevistadores() {

  try {

    const [
      respuestaResidente,
      respuestaSupervisores
    ] = await Promise.all([

      fetch(
        API_PERSONAL +
        '?action=personalContratacion&t=' +
        Date.now()
      ),

      fetch(
        API_CONTRATACION +
        '?accion=listarSupervisoresEntrevista&t=' +
        Date.now()
      )

    ]);


    const datosResidente =
      await respuestaResidente.json();

    const datosSupervisores =
      await respuestaSupervisores.json();


    const nombres = [];


    /* RESIDENTE */

    if (
      datosResidente.ok &&
      datosResidente.residente
    ) {

      nombres.push(
        String(
          datosResidente.residente
        ).trim()
      );

    }


    /* SUPERVISORES */

    const supervisores =
      Array.isArray(
        datosSupervisores.supervisores
      )
        ? datosSupervisores.supervisores
        : [];


    supervisores.forEach(item => {

      const nombre =
        typeof item === 'string'
          ? item
          : (
              item.nombre ||
              item.nombres ||
              ''
            );


      if (nombre) {

        nombres.push(
          String(nombre).trim()
        );

      }

    });


    entrevistadoresOperaciones =
      [
        ...new Set(
          nombres.filter(Boolean)
        )
      ]
      .sort(
        (a, b) =>
          a.localeCompare(
            b,
            'es'
          )
      );


    actualizarSelectEntrevistadores();

  } catch (error) {

    console.error(
      'Error cargando entrevistadores:',
      error
    );

  }

}


/* =====================================================
   ACTUALIZAR SELECTS ENTREVISTADORES
===================================================== */

function actualizarSelectEntrevistadores() {

  [
    'entrevistadorAgenda',
    'entrevistaEntrevistador'
  ].forEach(id => {

    const select =
      document.getElementById(id);

    if (!select)
      return;


    const valorAnterior =
      select.value;


    select.innerHTML =
      `
        <option value="">
          Seleccione...
        </option>
      `
      +
      entrevistadoresOperaciones
        .map(nombre => `
          <option value="${escaparHTML(nombre)}">
            ${escaparHTML(nombre)}
          </option>
        `)
        .join('');


    if (valorAnterior) {

      asegurarOpcionSelect(
        select,
        valorAnterior
      );

      select.value =
        valorAnterior;

    }

  });

}


/* =====================================================
   ASEGURAR OPCIÓN
===================================================== */

function asegurarOpcionSelect(
  select,
  valor
) {

  if (!select || !valor)
    return;


  const existe =
    Array
      .from(select.options)
      .some(
        op =>
          String(op.value) ===
          String(valor)
      );


  if (!existe) {

    const opcion =
      document.createElement(
        'option'
      );

    opcion.value =
      valor;

    opcion.textContent =
      valor;

    select.appendChild(
      opcion
    );

  }

}


/* =====================================================
   CARGA GENERAL
===================================================== */

async function cargarOperaciones() {

  const contenedor =
    document.getElementById(
      'contenidoAgenda'
    );


  contenedor.innerHTML =
    `
      <div class="estado-carga">
        Cargando agenda...
      </div>
    `;


  try {

    const [
      respuestaCandidatos,
      respuestaTodosCandidatos,
      respuestaAgenda,
      respuestaEntrevistas
    ] = await Promise.all([

      fetch(
        API_CONTRATACION +
        '?accion=listarPendientesArea&area=OPERACIONES&t=' +
        Date.now()
      ),

      fetch(
        API_CONTRATACION +
        '?accion=listarCandidatos&t=' +
        Date.now()
      ),

      fetch(
        API_CONTRATACION +
        '?accion=listarAgendaEntrevistas&t=' +
        Date.now()
      ),

      fetch(
        API_CONTRATACION +
        '?accion=listarEntrevistasOperaciones&t=' +
        Date.now()
      )

    ]);


    const datosCandidatos =
      await respuestaCandidatos.json();

    const datosTodosCandidatos =
      await respuestaTodosCandidatos.json();

    const datosAgenda =
      await respuestaAgenda.json();

    const datosEntrevistas =
      await respuestaEntrevistas.json();


    if (!datosCandidatos.ok) {

      throw new Error(
        datosCandidatos.mensaje ||
        'No se pudieron cargar los candidatos'
      );

    }


    if (!datosTodosCandidatos.ok) {

      throw new Error(
        datosTodosCandidatos.mensaje ||
        'No se pudo cargar el historial de candidatos'
      );

    }


    if (!datosAgenda.ok) {

      throw new Error(
        datosAgenda.mensaje ||
        'No se pudo cargar la agenda'
      );

    }


    if (!datosEntrevistas.ok) {

      throw new Error(
        datosEntrevistas.mensaje ||
        'No se pudo cargar el historial de entrevistas'
      );

    }


    candidatosOperaciones =
      datosCandidatos.candidatos || [];

    todosCandidatos =
      datosTodosCandidatos.candidatos || [];

    agendaEntrevistas =
      datosAgenda.agenda || [];

    entrevistasRealizadas =
      datosEntrevistas.entrevistas || [];


    renderizarAgenda();
    renderizarEntrevistas();


  } catch (error) {

    contenedor.innerHTML =
      `
        <div class="mensaje-error">
          ${escaparHTML(error.message)}
        </div>
      `;

    console.error(
      'Error cargando Operaciones:',
      error
    );

  }

}

/* =====================================================
   AGENDA
===================================================== */

function renderizarAgenda() {

  const contenedor =
    document.getElementById(
      'contenidoAgenda'
    );


  const candidatos =
    candidatosOperaciones.map(
      candidato => {

        const agenda =
          agendaEntrevistas.find(
            a =>
              String(a.idCandidato) ===
              String(candidato.idCandidato)
          ) || null;

        return {
          candidato,
          agenda
        };

      }
    );


  const pendientes =
    candidatos.filter(
      x => !x.agenda
    ).length;


  const programadas =
    candidatos.filter(
      x =>
        [
          'PROGRAMADA',
          'REPROGRAMADA'
        ].includes(
          String(
            x.agenda?.estadoCita || ''
          ).toUpperCase()
        )
    ).length;


  const reprogramadas =
    candidatos.filter(
      x =>
        String(
          x.agenda?.estadoCita || ''
        ).toUpperCase()
        === 'REPROGRAMADA'
    ).length;


  contenedor.innerHTML =
    `

      <div class="kpis-operaciones">

        <div class="kpi-operaciones">
          <span>Pendientes de programar</span>
          <strong>${pendientes}</strong>
        </div>

        <div class="kpi-operaciones">
          <span>Entrevistas programadas</span>
          <strong>${programadas}</strong>
        </div>

        <div class="kpi-operaciones">
          <span>Reprogramadas</span>
          <strong>${reprogramadas}</strong>
        </div>

        <div class="kpi-operaciones">
          <span>Total en Operaciones</span>
          <strong>${candidatos.length}</strong>
        </div>

      </div>


      <div class="bloque-operaciones">

        <div class="titulo-bloque-operaciones">

          <div>

            <h2>
              Agenda de entrevistas
            </h2>

            <p>
              Candidatos derivados por Legal para entrevista técnica.
            </p>

          </div>


          <button
            type="button"
            class="btn-actualizar-agenda"
            onclick="cargarOperaciones()"
          >
            ↻ Actualizar
          </button>

        </div>


        <div class="tabla-responsive">

          <table class="tabla-operaciones">

            <thead>

              <tr>
                <th>Candidato</th>
                <th>DNI</th>
                <th>Cargo</th>
                <th>Unidad</th>
                <th>Tipo contrato</th>
                <th>Fecha objetivo</th>
                <th>Entrevista</th>
                <th>Modalidad</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>

            </thead>

            <tbody>

              ${
                candidatos.length
                  ?
                    candidatos
                      .map(
                        x =>
                          crearFilaAgenda(
                            x.candidato,
                            x.agenda
                          )
                      )
                      .join('')
                  :
                    `
                      <tr>
                        <td
                          colspan="10"
                          class="sin-registros"
                        >
                          No hay candidatos pendientes en Operaciones.
                        </td>
                      </tr>
                    `
              }

            </tbody>

          </table>

        </div>

      </div>

    `;

}


/* =====================================================
   FILA AGENDA
===================================================== */

function crearFilaAgenda(
  candidato,
  agenda
) {

  const tieneAgenda =
    !!agenda;


  const fechaHora =
    tieneAgenda
      ?
        `
          <strong>
            ${escaparHTML(
              agenda.fechaProgramada || '-'
            )}
          </strong>

          <div class="dato-secundario">
            ${escaparHTML(
              agenda.horaProgramada || ''
            )}
          </div>
        `
      :
        `
          <span class="texto-pendiente">
            Sin programar
          </span>
        `;


  const estado =
    tieneAgenda
      ?
        String(
          agenda.estadoCita ||
          'PROGRAMADA'
        ).toUpperCase()
      :
        'PENDIENTE DE PROGRAMAR';


  const claseEstado =
    obtenerClaseEstadoAgenda(
      estado
    );


  return `
    <tr>

      <td>

        <strong>
          ${escaparHTML(
            candidato.nombres
          )}
        </strong>

        <div class="dato-secundario">
          ${escaparHTML(
            candidato.idCandidato
          )}
        </div>

      </td>

      <td>
        ${escaparHTML(candidato.dni)}
      </td>

      <td>
        ${escaparHTML(candidato.cargo)}
      </td>

      <td>
        ${escaparHTML(
          candidato.unidad || '-'
        )}
      </td>

      <td>
        ${escaparHTML(
          candidato.tipoContrato || '-'
        )}
      </td>

      <td>
        ${escaparHTML(
          candidato.fechaObjetivo || '-'
        )}
      </td>

      <td>
        ${fechaHora}
      </td>

      <td>
        ${
          tieneAgenda
            ? escaparHTML(
                agenda.modalidad || '-'
              )
            : '-'
        }
      </td>

      <td>

        <span
          class="estado-agenda ${claseEstado}"
        >
          ${escaparHTML(estado)}
        </span>

      </td>

      <td>

        <button
          type="button"
          class="btn-agenda ${
            tieneAgenda
              ? 'secundario'
              : ''
          }"
          onclick="abrirAgenda('${escaparJS(
            candidato.idCandidato
          )}')"
        >
          ${
            tieneAgenda
              ? 'Reprogramar'
              : 'Programar'
          }
        </button>

      </td>

    </tr>
  `;

}


/* =====================================================
   ABRIR AGENDA
===================================================== */

function abrirAgenda(
  idCandidato
) {

  candidatoSeleccionado =
    candidatosOperaciones.find(
      c =>
        String(c.idCandidato) ===
        String(idCandidato)
    );


  if (!candidatoSeleccionado) {

    alert(
      'No se encontró el candidato.'
    );

    return;

  }


  agendaSeleccionada =
    agendaEntrevistas.find(
      a =>
        String(a.idCandidato) ===
        String(idCandidato)
    ) || null;


  document.getElementById(
    'agendaCandidato'
  ).textContent =
    candidatoSeleccionado.nombres;


  document.getElementById(
    'agendaDni'
  ).textContent =
    candidatoSeleccionado.dni;


  document.getElementById(
    'agendaCargo'
  ).textContent =
    candidatoSeleccionado.cargo;


  document.getElementById(
    'agendaUnidad'
  ).textContent =
    candidatoSeleccionado.unidad || '-';


  document.getElementById(
    'fechaProgramada'
  ).value =
    convertirFechaInput(
      agendaSeleccionada
        ?.fechaProgramada
    );


  document.getElementById(
    'horaProgramada'
  ).value =
    agendaSeleccionada
      ?.horaProgramada || '';


  document.getElementById(
    'modalidadAgenda'
  ).value =
    agendaSeleccionada
      ?.modalidad || '';


  document.getElementById(
    'lugarAgenda'
  ).value =
    agendaSeleccionada
      ?.lugarEnlace || '';


  const selectEntrevistador =
    document.getElementById(
      'entrevistadorAgenda'
    );


  const entrevistadorActual =
    agendaSeleccionada
      ?.entrevistador || '';


  asegurarOpcionSelect(
    selectEntrevistador,
    entrevistadorActual
  );


  selectEntrevistador.value =
    entrevistadorActual;


  document.getElementById(
    'observacionAgenda'
  ).value =
    agendaSeleccionada
      ?.observacion || '';


  cambiarTextoLugar();


  document.getElementById(
    'tituloModalAgenda'
  ).textContent =
    agendaSeleccionada
      ? 'Reprogramar entrevista'
      : 'Programar entrevista';


  document.getElementById(
    'btnGuardarAgenda'
  ).textContent =
    agendaSeleccionada
      ? 'Guardar reprogramación'
      : 'Programar entrevista';


  document
    .getElementById('modalAgenda')
    .classList.add('visible');

}


/* =====================================================
   MODAL AGENDA
===================================================== */

function crearModalAgenda() {

  const modal =
    document.createElement('div');


  modal.id =
    'modalAgenda';

  modal.className =
    'modal-agenda';


  modal.innerHTML =
    `

      <div class="modal-agenda-contenido">

        <div class="modal-agenda-header">

          <div>

            <h2 id="tituloModalAgenda">
              Programar entrevista
            </h2>

            <p>
              Programación de entrevista técnica
            </p>

          </div>

          <button
            type="button"
            class="cerrar-modal-agenda"
            onclick="cerrarAgenda()"
          >
            ×
          </button>

        </div>


        <div class="resumen-candidato-agenda">

          <div>
            <span>Candidato</span>
            <strong id="agendaCandidato"></strong>
          </div>

          <div>
            <span>DNI</span>
            <strong id="agendaDni"></strong>
          </div>

          <div>
            <span>Cargo</span>
            <strong id="agendaCargo"></strong>
          </div>

          <div>
            <span>Unidad</span>
            <strong id="agendaUnidad"></strong>
          </div>

        </div>


        <form
          id="formAgenda"
          onsubmit="guardarAgenda(event)"
        >

          <div class="grid-agenda">

            <div class="campo-agenda">

              <label>
                Fecha de entrevista *
              </label>

              <input
                type="date"
                id="fechaProgramada"
                required
              >

            </div>


            <div class="campo-agenda">

              <label>
                Hora *
              </label>

              <input
                type="time"
                id="horaProgramada"
                required
              >

            </div>


            <div class="campo-agenda">

              <label>
                Modalidad *
              </label>

              <select
                id="modalidadAgenda"
                required
                onchange="cambiarTextoLugar()"
              >

                <option value="">
                  Seleccione
                </option>

                <option value="PRESENCIAL">
                  Presencial
                </option>

                <option value="VIRTUAL">
                  Virtual
                </option>

              </select>

            </div>


            <div class="campo-agenda">

              <label id="labelLugarAgenda">
                Lugar / enlace *
              </label>

              <input
                type="text"
                id="lugarAgenda"
                required
              >

            </div>


            <div class="campo-agenda ancho-completo">

              <label>
                Entrevistador *
              </label>

              <select
                id="entrevistadorAgenda"
                required
              >

                <option value="">
                  Seleccione...
                </option>

              </select>

            </div>


            <div class="campo-agenda ancho-completo">

              <label>
                Observación
              </label>

              <textarea
                id="observacionAgenda"
                rows="2"
              ></textarea>

            </div>

          </div>


          <div class="acciones-modal-agenda">

            <button
              type="button"
              class="btn-cancelar-agenda"
              onclick="cerrarAgenda()"
            >
              Cancelar
            </button>


            <button
              type="submit"
              class="btn-guardar-agenda"
              id="btnGuardarAgenda"
            >
              Programar entrevista
            </button>

          </div>

        </form>

      </div>

    `;


  document.body.appendChild(
    modal
  );

}


/* =====================================================
   GUARDAR AGENDA
===================================================== */

async function guardarAgenda(
  event
) {

  event.preventDefault();


  if (!candidatoSeleccionado)
    return;


  const boton =
    document.getElementById(
      'btnGuardarAgenda'
    );

  const textoOriginal =
    boton.textContent;


  boton.disabled =
    true;

  boton.textContent =
    'Guardando...';


  try {

    const payload = {

      accion:
        'guardarAgendaEntrevista',

      idCandidato:
        candidatoSeleccionado
          .idCandidato,

      idRequerimiento:
        candidatoSeleccionado
          .idRequerimiento,

      fechaProgramada:
        document.getElementById(
          'fechaProgramada'
        ).value,

      horaProgramada:
        document.getElementById(
          'horaProgramada'
        ).value,

      modalidad:
        document.getElementById(
          'modalidadAgenda'
        ).value,

      lugarEnlace:
        document.getElementById(
          'lugarAgenda'
        ).value.trim(),

      entrevistador:
        document.getElementById(
          'entrevistadorAgenda'
        ).value,

      observacion:
        document.getElementById(
          'observacionAgenda'
        ).value.trim()

    };


    const respuesta =
      await fetch(
        API_CONTRATACION,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'text/plain;charset=utf-8'
          },
          body:
            JSON.stringify(payload)
        }
      );


    const resultado =
      await respuesta.json();


    if (!resultado.ok) {

      throw new Error(
        resultado.mensaje ||
        'No se pudo guardar la entrevista'
      );

    }


    alert(
      resultado.mensaje
    );


    cerrarAgenda();

    await cargarOperaciones();

  } catch (error) {

    alert(
      error.message
    );

  } finally {

    boton.disabled =
      false;

    boton.textContent =
      textoOriginal;

  }

}


/* =====================================================
   CERRAR AGENDA
===================================================== */

function cerrarAgenda() {

  document
    .getElementById('modalAgenda')
    .classList.remove('visible');

  candidatoSeleccionado =
    null;

  agendaSeleccionada =
    null;

}


/* =====================================================
   MODALIDAD AGENDA
===================================================== */

function cambiarTextoLugar() {

  const modalidad =
    document.getElementById(
      'modalidadAgenda'
    )?.value;


  const label =
    document.getElementById(
      'labelLugarAgenda'
    );


  const input =
    document.getElementById(
      'lugarAgenda'
    );


  if (modalidad === 'VIRTUAL') {

    label.textContent =
      'Enlace de entrevista *';

    input.placeholder =
      'https://...';

  } else {

    label.textContent =
      'Lugar de entrevista *';

    input.placeholder =
      'Ej. Oficina Arequipa';

  }

}


/* =====================================================
   TAB ENTREVISTAS
===================================================== */

function renderizarEntrevistas() {

  const contenedor =
    document.getElementById(
      'contenidoEntrevistas'
    );


  const registros =
    agendaEntrevistas
      .map(agenda => {

        const candidato =
          todosCandidatos.find(
            c =>
              String(c.idCandidato) ===
              String(agenda.idCandidato)
          );


        if (!candidato)
          return null;


        const entrevista =
          entrevistasRealizadas.find(
            e =>
              String(e.idCandidato) ===
              String(candidato.idCandidato)
          ) || null;


        return {

          candidato,
          agenda,
          entrevista

        };

      })
      .filter(Boolean)
      .sort((a, b) => {

        const estadoA =
          String(
            a.agenda.estadoCita || ''
          ).toUpperCase();

        const estadoB =
          String(
            b.agenda.estadoCita || ''
          ).toUpperCase();


        const realizadaA =
          estadoA === 'REALIZADA'
            ? 1
            : 0;

        const realizadaB =
          estadoB === 'REALIZADA'
            ? 1
            : 0;


        /*
         * Primero entrevistas pendientes.
         * Después entrevistas realizadas.
         */

        if (
          realizadaA !== realizadaB
        ) {

          return (
            realizadaA -
            realizadaB
          );

        }


        /*
         * Dentro del mismo grupo:
         * fecha más próxima primero.
         */

        const fechaA =
          convertirFechaOrden(
            a.agenda.fechaProgramada,
            a.agenda.horaProgramada
          );

        const fechaB =
          convertirFechaOrden(
            b.agenda.fechaProgramada,
            b.agenda.horaProgramada
          );


        return (
          fechaA -
          fechaB
        );

      });


  contenedor.innerHTML =
    `

      <div class="bloque-operaciones">

        <div class="titulo-bloque-operaciones">

          <div>

            <h2>
              Entrevistas
            </h2>

            <p>
              Entrevistas programadas e historial de entrevistas realizadas.
            </p>

          </div>

        </div>


        <div class="tabla-responsive">

          <table class="tabla-operaciones">

            <thead>

              <tr>
                <th>Candidato</th>
                <th>DNI</th>
                <th>Cargo</th>
                <th>Unidad</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Entrevistador</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>

            </thead>


            <tbody>

              ${
                registros.length
                  ?
                    registros
                      .map(x => {

                        const realizada =
                          String(
                            x.agenda.estadoCita || ''
                          ).toUpperCase()
                          === 'REALIZADA';


                        return `

                          <tr class="${
                            realizada
                              ? 'fila-entrevista-realizada'
                              : ''
                          }">

                            <td>

                              <strong>
                                ${escaparHTML(
                                  x.candidato.nombres
                                )}
                              </strong>

                              <div class="dato-secundario">
                                ${escaparHTML(
                                  x.candidato.idCandidato
                                )}
                              </div>

                            </td>

                            <td>
                              ${escaparHTML(
                                x.candidato.dni
                              )}
                            </td>

                            <td>
                              ${escaparHTML(
                                x.candidato.cargo
                              )}
                            </td>

                            <td>
                              ${escaparHTML(
                                x.candidato.unidad || '-'
                              )}
                            </td>

                            <td>
                              ${escaparHTML(
                                x.agenda.fechaProgramada || '-'
                              )}
                            </td>

                            <td>
                              ${escaparHTML(
                                x.agenda.horaProgramada || '-'
                              )}
                            </td>

                            <td>
                              ${escaparHTML(
                                x.agenda.entrevistador || '-'
                              )}
                            </td>

                            <td>

                              <span
                                class="estado-agenda ${
                                  realizada
                                    ? 'estado-realizada'
                                    : obtenerClaseEstadoAgenda(
                                        x.agenda.estadoCita
                                      )
                                }"
                              >
                                ${escaparHTML(
                                  x.agenda.estadoCita
                                )}
                              </span>

                            </td>

                            <td>

                              ${
                                realizada
                                  ?
                                    (
                                      x.entrevista?.urlPdf
                                        ?
                                          `
                                            <a
                                              href="${escaparHTML(
                                                x.entrevista.urlPdf
                                              )}"
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              class="btn-ver-pdf"
                                            >
                                              Ver PDF
                                            </a>
                                          `
                                        :
                                          `
                                            <span class="dato-secundario">
                                              PDF no disponible
                                            </span>
                                          `
                                    )
                                  :
                                    `
                                      <button
                                        type="button"
                                        class="btn-iniciar-entrevista"
                                        onclick="iniciarEntrevista('${escaparJS(
                                          x.candidato.idCandidato
                                        )}')"
                                      >
                                        Iniciar entrevista
                                      </button>
                                    `
                              }

                            </td>

                          </tr>

                        `;

                      })
                      .join('')
                  :
                    `
                      <tr>

                        <td
                          colspan="9"
                          class="sin-registros"
                        >
                          No hay entrevistas registradas.
                        </td>

                      </tr>
                    `
              }

            </tbody>

          </table>

        </div>

      </div>

    `;

}

function convertirFechaOrden(
  fecha,
  hora
) {

  if (!fecha)
    return Number.MAX_SAFE_INTEGER;


  const partes =
    String(fecha)
      .split('/');


  if (
    partes.length !== 3
  ) {

    return Number.MAX_SAFE_INTEGER;

  }


  const dia =
    Number(partes[0]);

  const mes =
    Number(partes[1]) - 1;

  const anio =
    Number(partes[2]);


  const partesHora =
    String(
      hora || '00:00'
    )
      .split(':');


  const horas =
    Number(
      partesHora[0] || 0
    );

  const minutos =
    Number(
      partesHora[1] || 0
    );


  return new Date(
    anio,
    mes,
    dia,
    horas,
    minutos
  ).getTime();

}
/* =====================================================
   INICIAR ENTREVISTA
===================================================== */

function iniciarEntrevista(
  idCandidato
) {

  candidatoEntrevista =
    candidatosOperaciones.find(
      c =>
        String(c.idCandidato) ===
        String(idCandidato)
    );


  if (!candidatoEntrevista) {

    alert(
      'Candidato no encontrado.'
    );

    return;

  }


  agendaEntrevistaActual =
    agendaEntrevistas.find(
      a =>
        String(a.idCandidato) ===
        String(idCandidato)
    ) || null;


  if (!agendaEntrevistaActual) {

    alert(
      'Primero debe programar la entrevista.'
    );

    return;

  }


  /* LIMPIA COMPLETAMENTE LA FICHA */

  limpiarFormularioEntrevista();


  /* CABECERA */

  document.getElementById(
    'entrevistaNombre'
  ).textContent =
    candidatoEntrevista.nombres;


  document.getElementById(
    'entrevistaDni'
  ).textContent =
    candidatoEntrevista.dni;


  /* DATOS DEL CANDIDATO */

  document.getElementById(
    'entrevistaTelefono'
  ).value =
    candidatoEntrevista.telefono || '';


  document.getElementById(
    'entrevistaResidencia'
  ).value =
    candidatoEntrevista.residencia || '';


  document.getElementById(
    'entrevistaPuestoPostula'
  ).value =
    candidatoEntrevista.cargo || '';


  /* AGENDA */

  document.getElementById(
    'entrevistaFecha'
  ).value =
    convertirFechaInput(
      agendaEntrevistaActual
        .fechaProgramada
    );


  document.getElementById(
    'entrevistaModalidad'
  ).value =
    agendaEntrevistaActual
      .modalidad || '';


  document.getElementById(
    'entrevistaLugar'
  ).value =
    agendaEntrevistaActual
      .lugarEnlace || '';


  const selectEntrevistador =
    document.getElementById(
      'entrevistaEntrevistador'
    );


  asegurarOpcionSelect(
    selectEntrevistador,
    agendaEntrevistaActual
      .entrevistador || ''
  );


  selectEntrevistador.value =
    agendaEntrevistaActual
      .entrevistador || '';


  document
    .getElementById(
      'modalEntrevista'
    )
    .classList.add(
      'visible'
    );

}


/* =====================================================
   LIMPIAR FICHA
===================================================== */

function limpiarFormularioEntrevista() {

  const formulario =
    document.getElementById(
      'formEntrevistaOperaciones'
    );


  formulario.reset();


  document
    .querySelectorAll(
      '.respuesta-entrevista'
    )
    .forEach(
      campo =>
        campo.value = ''
    );


  document
    .querySelectorAll(
      '.fila-unidad-entrevista'
    )
    .forEach(fila => {

      fila.querySelector(
        '.unidad-acreditado'
      ).value = '';

      fila.querySelector(
        '.unidad-liberado'
      ).value = '';

      fila.querySelector(
        '.unidad-cargo'
      ).value = '';

      fila.querySelector(
        '.unidad-empresa'
      ).value = '';

    });


  document
    .querySelectorAll(
      '.equipo-entrevista, .sistema-andamio-entrevista, .certificacion-entrevista'
    )
    .forEach(
      check =>
        check.checked = false
    );


  [
    'campoTipoAccidente',
    'campoDetalleAccidente',
    'campoOtroMotivoRetiro',
    'campoDisponibilidadOtros'
  ].forEach(id => {

    const elemento =
      document.getElementById(id);

    if (elemento)
      elemento.style.display =
        'none';

  });


  document.getElementById(
    'promedioEntrevista'
  ).value = '';


  document.getElementById(
    'criterioEntrevista'
  ).value = '';


  const puestoClasifica =
    document.getElementById(
      'entrevistaPuestoClasifica'
    );


  puestoClasifica.value = '';
  puestoClasifica.disabled = true;

  const labelPretension =
    document.getElementById(
      'labelPretension'
    );

  if (labelPretension) {

    labelPretension.textContent =
      'Monto';

  }

  actualizarSelectEntrevistadores();

}


/* =====================================================
   MODAL ENTREVISTA
===================================================== */

function crearModalEntrevista() {

  const modal =
    document.createElement('div');


  modal.id =
    'modalEntrevista';

  modal.className =
    'modal-entrevista';


  modal.innerHTML =
    `

      <div class="modal-entrevista-contenido">

        <div class="modal-entrevista-header">

          <div>

            <h2>
              Ficha de Entrevista para Operativos
            </h2>

            <p>
              DMZ-RH-PR01-F11
            </p>

          </div>


          <button
            type="button"
            class="cerrar-modal-entrevista"
            onclick="cerrarEntrevista()"
          >
            ×
          </button>

        </div>


        <div class="cabecera-candidato-entrevista">

          <div>

            <span>
              Candidato
            </span>

            <strong
              id="entrevistaNombre"
            ></strong>

          </div>


          <div>

            <span>
              DNI
            </span>

            <strong
              id="entrevistaDni"
            ></strong>

          </div>

        </div>


        <form
          id="formEntrevistaOperaciones"
          onsubmit="guardarEntrevistaOperaciones(event)"
        >


          <!-- ==========================================
               1. DATOS GENERALES
          =========================================== -->

          <section class="seccion-entrevista">

            <h3>
              1. Datos Generales
            </h3>


            <div class="grid-entrevista grid-4">


              <div class="campo-entrevista">

                <label>
                  Fecha de entrevista
                </label>

                <input
                  type="date"
                  id="entrevistaFecha"
                  required
                >

              </div>


              <div class="campo-entrevista">

                <label>
                  Modalidad
                </label>

                <select
                  id="entrevistaModalidad"
                  required
                >

                  <option value="">
                    Seleccione
                  </option>

                  <option value="PRESENCIAL">
                    Presencial
                  </option>

                  <option value="VIRTUAL">
                    Virtual
                  </option>

                </select>

              </div>


              <div class="campo-entrevista">

                <label>
                  Residencia actual
                </label>

                <input
                  type="text"
                  id="entrevistaResidencia"
                  required
                >

              </div>


              <div class="campo-entrevista">

                <label>
                  Teléfono
                </label>

                <input
                  type="text"
                  id="entrevistaTelefono"
                  required
                >

              </div>


              <div class="campo-entrevista ancho-doble">

                <label>
                  Lugar / enlace de entrevista
                </label>

                <input
                  type="text"
                  id="entrevistaLugar"
                  required
                >

              </div>


              <div class="campo-entrevista">

                <label>
                  Grado académico
                </label>

                <select
                  id="entrevistaGradoAcademico"
                >

                  <option value="">
                    Seleccione
                  </option>

                  <option value="SECUNDARIA INCOMPLETA">
                    Secundaria incompleta
                  </option>

                  <option value="SECUNDARIA COMPLETA">
                    Secundaria completa
                  </option>

                  <option value="TECNICO INCOMPLETO">
                    Técnico incompleto
                  </option>

                  <option value="TECNICO">
                    Técnico
                  </option>

                  <option value="UNIVERSITARIO INCOMPLETO">
                    Universitario incompleto
                  </option>

                  <option value="BACHILLER">
                    Bachiller
                  </option>

                  <option value="TITULADO">
                    Titulado
                  </option>

                  <option value="COLEGIADO">
                    Colegiado
                  </option>

                </select>

              </div>


              <div class="campo-entrevista">

                <label>
                  Estudios
                </label>

                <input
                  type="text"
                  id="entrevistaEstudios"
                  placeholder="Ej. Mecánica, Industrial..."
                >

              </div>


              <div class="campo-entrevista">

                <label>
                  Puesto al que postula
                </label>

                <input
                  type="text"
                  id="entrevistaPuestoPostula"
                  readonly
                >

              </div>


              <div class="campo-entrevista">

                <label>
                  Entrevistador
                </label>

                <select
                  id="entrevistaEntrevistador"
                  required
                >

                  <option value="">
                    Seleccione...
                  </option>

                </select>

              </div>


              <div class="campo-entrevista">

                <label>
                  Disponibilidad
                </label>

                <select
                  id="entrevistaDisponibilidad"
                  onchange="actualizarDisponibilidadEntrevista()"
                >

                  <option value="">
                    Seleccione
                  </option>

                  <option value="INMEDIATA">
                    Inmediata
                  </option>

                  <option value="OTROS">
                    Otros
                  </option>

                </select>

              </div>


              <div
                class="campo-entrevista"
                id="campoDisponibilidadOtros"
                style="display:none;"
              >

                <label>
                  Especifique disponibilidad
                </label>

                <input
                  type="text"
                  id="entrevistaDisponibilidadOtros"
                  placeholder="Ej. En 7 días"
                >

              </div>


              <div class="campo-entrevista">

                <label>
                  Modalidad económica
                </label>

                <select
                  id="tipoPretension"
                  onchange="actualizarTipoPretension()"
                >

                  <option value="">
                    Seleccione
                  </option>

                  <option value="MENSUAL">
                    Pretensión mensual
                  </option>

                  <option value="VALOR HORA">
                    Valor Hora / HH
                  </option>

                </select>

              </div>


              <div class="campo-entrevista">

                <label id="labelPretension">
                  Monto
                </label>

                <input
                  type="number"
                  id="entrevistaPretension"
                  min="0"
                  step="0.01"
                >

              </div>


            </div>

          </section>


          <!-- ==========================================
               UNIDADES MINERAS
          =========================================== -->

          <section class="seccion-entrevista">

            <h3>
              Unidades Mineras donde ha trabajado / ingresado
            </h3>


            <div class="tabla-unidades-contenedor">

              <table class="tabla-unidades-entrevista">

                <thead>

                  <tr>
                    <th>Unidad Minera</th>
                    <th>Acreditado</th>
                    <th>Liberado</th>
                    <th>Cargo</th>
                    <th>Empresa</th>
                  </tr>

                </thead>

                <tbody>

                  ${crearFilasUnidadesEntrevista()}

                </tbody>

              </table>

            </div>

          </section>


          <!-- ==========================================
               2. SEGURIDAD
          =========================================== -->

          <section class="seccion-entrevista">

            <h3>
              2. Conocimientos de Seguridad
            </h3>


            <div class="preguntas-entrevista preguntas-2-columnas">


              ${crearPregunta(
                'SEGURIDAD',
                'SEG-01',
                '¿Con qué Decreto Supremo se trabaja en la Unidad Minera?'
              )}


              ${crearPregunta(
                'SEGURIDAD',
                'SEG-02',
                '¿Qué documentos de gestión se trabajan en la Unidad Minera?'
              )}


              ${crearPregunta(
                'SEGURIDAD',
                'SEG-03',
                '¿Qué es Seguridad para ti?'
              )}


              ${crearPregunta(
                'SEGURIDAD',
                'SEG-04',
                '¿Cuál sería tu aporte de Seguridad para la empresa?'
              )}


            </div>


            <div class="subtitulo-entrevista">
              Valoración de Seguridad
            </div>


            <div class="bloque-valoracion">

              <select
                id="valoracionSeguridad"
                required
              >

                ${opcionesValoracion()}

              </select>

            </div>


            <div class="subtitulo-entrevista">
              Antecedentes de accidente laboral
            </div>


            <div class="grid-entrevista grid-4">


              <div class="campo-entrevista">

                <label>
                  ¿Tuvo accidente laboral?
                </label>

                <select
                  id="tuvoAccidente"
                  onchange="actualizarAccidenteEntrevista()"
                >

                  <option value="">
                    Seleccione
                  </option>

                  <option value="NO">
                    No
                  </option>

                  <option value="SI">
                    Sí
                  </option>

                </select>

              </div>


              <div
                class="campo-entrevista"
                id="campoTipoAccidente"
                style="display:none;"
              >

                <label>
                  Tipo de accidente
                </label>

                <select id="tipoAccidente">

                  <option value="">
                    Seleccione
                  </option>

                  <option value="LEVE">
                    Leve
                  </option>

                  <option value="PERMANENTE">
                    Permanente
                  </option>

                </select>

              </div>


              <div
                class="campo-entrevista ancho-doble"
                id="campoDetalleAccidente"
                style="display:none;"
              >

                <label>
                  Detalle del accidente
                </label>

                <input
                  type="text"
                  id="detalleAccidente"
                >

              </div>


            </div>

          </section>


          <!-- ==========================================
               3. EXPERIENCIA LABORAL
          =========================================== -->

          <section class="seccion-entrevista">

            <h3>
              3. Experiencia Laboral
            </h3>


            <div class="grid-entrevista grid-4">


              <div class="campo-entrevista">

                <label>
                  Tiempo de experiencia
                </label>

                <select id="experienciaTiempo">

                  ${opcionesAniosExperiencia()}

                </select>

              </div>


              <div class="campo-entrevista">

                <label>
                  Última empresa
                </label>

                <input
                  type="text"
                  id="experienciaUltimaEmpresa"
                >

              </div>


              <div class="campo-entrevista">

                <label>
                  Tiempo en la última empresa
                </label>

                <select id="experienciaTiempoUltimaEmpresa">

                  ${opcionesTiempoUltimaEmpresa()}

                </select>

              </div>


              <div class="campo-entrevista">

                <label>
                  Modalidad de trabajo
                </label>

                <select id="experienciaModalidad">

                  <option value="">
                    Seleccione
                  </option>

                  <option value="PERMANENTE">
                    Permanente
                  </option>

                  <option value="INTERMITENTE">
                    Intermitente
                  </option>

                </select>

              </div>


              <div class="campo-entrevista">

                <label>
                  Motivo de retiro
                </label>

                <select
                  id="experienciaMotivoRetiro"
                  onchange="actualizarMotivoRetiro()"
                >

                  <option value="">
                    Seleccione
                  </option>

                  <option value="FIN DE CONTRATO">
                    Fin de contrato
                  </option>

                  <option value="FIN DE PROYECTO">
                    Fin de proyecto
                  </option>

                  <option value="RENUNCIA">
                    Renuncia
                  </option>

                  <option value="OTRO">
                    Otro
                  </option>

                </select>

              </div>


              <div
                class="campo-entrevista"
                id="campoOtroMotivoRetiro"
                style="display:none;"
              >

                <label>
                  Otro motivo
                </label>

                <input
                  type="text"
                  id="experienciaOtroMotivo"
                >

              </div>


              <div class="campo-entrevista ancho-doble">

                <label>
                  Comentarios de experiencia laboral
                </label>

                <input
                  type="text"
                  id="experienciaComentarios"
                >

              </div>


            </div>


            <div class="subtitulo-entrevista">
              Valoración de Experiencia
            </div>


            <div class="bloque-valoracion">

              <select
                id="valoracionExperiencia"
                required
              >

                ${opcionesValoracion()}

              </select>

            </div>

          </section>


          <!-- ==========================================
               4. CONOCIMIENTOS TÉCNICOS
          =========================================== -->

          <section class="seccion-entrevista">

            <h3>
              4. Conocimientos Técnicos
            </h3>


            <div class="subtitulo-entrevista">
              4.1 Conocimientos generales de andamios
            </div>


            <div class="preguntas-entrevista preguntas-2-columnas">


              ${crearPregunta(
                'TECNICA',
                'TEC-01',
                '¿Con qué norma o estándar se realiza el armado de andamios?'
              )}


              ${crearPregunta(
                'TECNICA',
                'TEC-02',
                '¿Qué componentes tiene un andamio? Mencione un ejemplo.'
              )}


              ${crearPregunta(
                'TECNICA',
                'TEC-03',
                '¿Qué significan la tarjeta verde, amarilla y roja?'
              )}


              ${crearPregunta(
                'TECNICA',
                'TEC-04',
                '¿Quién inspecciona el andamio y cada cuánto tiempo?'
              )}


            </div>


            <div class="subtitulo-entrevista">
              Áreas / Equipos donde ha trabajado
            </div>


            <div class="grid-checks-entrevista">

              ${crearChecksEquiposEntrevista()}

            </div>


            <div class="subtitulo-entrevista">
              4.2 Sistemas de andamios y certificaciones
            </div>


            <div class="bloque-checks-entrevista">

              <label class="titulo-checks">
                Tipos de andamio que conoce o ha armado
              </label>

              <div class="grid-checks-entrevista">

                ${crearChecksSistemasAndamios()}

              </div>


              <label class="titulo-checks">
                Certificaciones
              </label>

              <div class="grid-certificaciones-entrevista">

                ${crearChecksCertificaciones()}

              </div>

            </div>


            <div class="subtitulo-entrevista">
              Preguntas técnicas de montaje / desmontaje
            </div>


            <div class="preguntas-entrevista preguntas-2-columnas">


              ${crearPregunta(
                'TECNICA',
                'TEC-05',
                '¿Cuáles son los componentes principales de un andamio multidireccional?'
              )}


              ${crearPregunta(
                'TECNICA',
                'TEC-06',
                '¿Qué verificaciones se deben realizar antes de iniciar el montaje?'
              )}


              ${crearPregunta(
                'TECNICA',
                'TEC-07',
                '¿Cuál es la función de las diagonales en un andamio?'
              )}


              ${crearPregunta(
                'TECNICA',
                'TEC-08',
                '¿Qué protección colectiva debe tener una plataforma de trabajo?'
              )}


              ${crearPregunta(
                'TECNICA',
                'TEC-09',
                '¿Qué haría ante una condición insegura o una modificación no autorizada del andamio?'
              )}


            </div>


            <div class="subtitulo-entrevista">
              Valoración de Conocimientos Técnicos
            </div>


            <div class="bloque-valoracion">

              <select
                id="valoracionTecnica"
                required
              >

                ${opcionesValoracion()}

              </select>

            </div>

          </section>


          <!-- ==========================================
               RESULTADO FINAL
          =========================================== -->

          <section class="seccion-entrevista">

            <h3>
              Resultado Final
            </h3>


            <div class="grid-entrevista grid-4">


              <div class="campo-entrevista">

                <label>
                  Promedio
                </label>

                <input
                  type="text"
                  id="promedioEntrevista"
                  readonly
                >

              </div>


              <div class="campo-entrevista">

                <label>
                  Criterio
                </label>

                <input
                  type="text"
                  id="criterioEntrevista"
                  readonly
                >

              </div>


              <div class="campo-entrevista">

                <label>
                  Puesto en que clasifica
                </label>

                <input
                  type="text"
                  id="entrevistaPuestoClasifica"
                  placeholder="Calcule primero"
                  disabled
                  required
                >

              </div>


              <div class="campo-entrevista">

                <label>
                  Resultado
                </label>

                <select
                  id="resultadoEntrevista"
                  required
                >

                  <option value="">
                    Seleccione
                  </option>

                  <option value="APTO">
                    APTO
                  </option>

                  <option value="NO APTO">
                    NO APTO
                  </option>

                </select>

              </div>


              <div class="campo-entrevista ancho-completo">

                <label>
                  Comentarios generales
                </label>

                <textarea
                  id="comentariosGeneralesEntrevista"
                  rows="2"
                ></textarea>

              </div>


            </div>

          </section>


          <div class="acciones-modal-entrevista">

            <button
              type="button"
              class="btn-cancelar-entrevista"
              onclick="cerrarEntrevista()"
            >
              Cancelar
            </button>


            <button
              type="button"
              class="btn-iniciar-entrevista"
              onclick="calcularResultadoEntrevista()"
            >
              Calcular evaluación
            </button>


            <button
              type="submit"
              class="btn-guardar-agenda"
              id="btnGuardarEntrevista"
            >
              Guardar entrevista
            </button>

          </div>


        </form>

      </div>

    `;


  document.body.appendChild(
    modal
  );

}


/* =====================================================
   PREGUNTA COMPACTA
===================================================== */

function crearPregunta(
  seccion,
  codigo,
  pregunta
) {

  return `
    <div
      class="pregunta-entrevista"
      data-seccion="${seccion}"
      data-codigo="${codigo}"
    >

      <label>
        ${pregunta}
      </label>

      <textarea
        class="respuesta-entrevista"
        rows="2"
      ></textarea>

    </div>
  `;

}


/* =====================================================
   VALORACIONES
===================================================== */

function opcionesValoracion() {

  return `
    <option value="">
      Seleccione
    </option>

    <option value="1">
      1 - Muy por debajo del perfil
    </option>

    <option value="2">
      2 - Por debajo del perfil
    </option>

    <option value="3">
      3 - Cumple con el perfil
    </option>

    <option value="4">
      4 - Por encima del perfil
    </option>

    <option value="5">
      5 - Sobrepasa el perfil
    </option>
  `;

}


/* =====================================================
   AÑOS DE EXPERIENCIA
===================================================== */

function opcionesAniosExperiencia() {

  let html =
    `
      <option value="">
        Seleccione
      </option>
    `;


  for (
    let i = 1;
    i <= 20;
    i++
  ) {

    html += `
      <option value="${i} ${i === 1 ? 'AÑO' : 'AÑOS'}">
        ${i} ${i === 1 ? 'año' : 'años'}
      </option>
    `;

  }


  html += `
    <option value="MAS DE 20 AÑOS">
      Más de 20 años
    </option>
  `;


  return html;

}


/* =====================================================
   TIEMPO ÚLTIMA EMPRESA
===================================================== */

function opcionesTiempoUltimaEmpresa() {

  let html =
    `
      <option value="">
        Seleccione
      </option>
    `;


  for (
    let i = 1;
    i <= 11;
    i++
  ) {

    html += `
      <option value="${i} ${i === 1 ? 'MES' : 'MESES'}">
        ${i} ${i === 1 ? 'mes' : 'meses'}
      </option>
    `;

  }


  for (
    let i = 1;
    i <= 20;
    i++
  ) {

    html += `
      <option value="${i} ${i === 1 ? 'AÑO' : 'AÑOS'}">
        ${i} ${i === 1 ? 'año' : 'años'}
      </option>
    `;

  }


  return html;

}


/* =====================================================
   UNIDADES MINERAS
===================================================== */

function crearFilasUnidadesEntrevista() {

  const unidades = [

    'ANTAPACCAY',
    'HUDBAY',
    'SMCV',
    'SOUTHERN',
    'QUELLAVECO',
    'LAS BAMBAS',
    'MARCOBRE',
    'CHINALCO',
    'SIERRA GORDA',
    'CENTINELA',
    'ANTAMINA',
    'OTROS'

  ];


  return unidades
    .map(unidad => `

      <tr
        class="fila-unidad-entrevista"
        data-unidad="${unidad}"
      >

        <td>
          <strong>${unidad}</strong>
        </td>

        <td>

          <select class="unidad-acreditado">

            <option value="">-</option>
            <option value="SI">Sí</option>
            <option value="NO">No</option>

          </select>

        </td>

        <td>

          <select class="unidad-liberado">

            <option value="">-</option>
            <option value="SI">Sí</option>
            <option value="NO">No</option>

          </select>

        </td>

        <td>

          <input
            type="text"
            class="unidad-cargo"
          >

        </td>

        <td>

          <input
            type="text"
            class="unidad-empresa"
          >

        </td>

      </tr>

    `)
    .join('');

}


/* =====================================================
   ACCIDENTE
===================================================== */

function actualizarAccidenteEntrevista() {

  const tuvo =
    document.getElementById(
      'tuvoAccidente'
    ).value;


  const campoTipo =
    document.getElementById(
      'campoTipoAccidente'
    );


  const campoDetalle =
    document.getElementById(
      'campoDetalleAccidente'
    );


  if (tuvo === 'SI') {

    campoTipo.style.display =
      'flex';

    campoDetalle.style.display =
      'flex';

  } else {

    campoTipo.style.display =
      'none';

    campoDetalle.style.display =
      'none';

    document.getElementById(
      'tipoAccidente'
    ).value = '';

    document.getElementById(
      'detalleAccidente'
    ).value = '';

  }

}


/* =====================================================
   DISPONIBILIDAD
===================================================== */

function actualizarDisponibilidadEntrevista() {

  const valor =
    document.getElementById(
      'entrevistaDisponibilidad'
    ).value;


  const campo =
    document.getElementById(
      'campoDisponibilidadOtros'
    );


  if (valor === 'OTROS') {

    campo.style.display =
      'flex';

  } else {

    campo.style.display =
      'none';

    document.getElementById(
      'entrevistaDisponibilidadOtros'
    ).value = '';

  }

}


/* =====================================================
   TIPO PRETENSIÓN
===================================================== */

function actualizarTipoPretension() {

  const tipo =
    document.getElementById(
      'tipoPretension'
    ).value;


  const label =
    document.getElementById(
      'labelPretension'
    );


  if (tipo === 'VALOR HORA') {

    label.textContent =
      'Valor por hora / HH';

  } else if (tipo === 'MENSUAL') {

    label.textContent =
      'Pretensión salarial mensual';

  } else {

    label.textContent =
      'Monto';

  }

}


/* =====================================================
   MOTIVO RETIRO
===================================================== */

function actualizarMotivoRetiro() {

  const valor =
    document.getElementById(
      'experienciaMotivoRetiro'
    ).value;


  const campo =
    document.getElementById(
      'campoOtroMotivoRetiro'
    );


  if (valor === 'OTRO') {

    campo.style.display =
      'flex';

  } else {

    campo.style.display =
      'none';

    document.getElementById(
      'experienciaOtroMotivo'
    ).value = '';

  }

}


/* =====================================================
   EQUIPOS
===================================================== */

function crearChecksEquiposEntrevista() {

  const equipos = [

    'CHANCADORA PRIMARIA',
    'CHANCADORA SECUNDARIA',
    'FAJAS',
    'HPGR',
    'MOLINOS',
    'MOLINOS VERTIMIL',
    'NIDO DE CICLONES',
    'ZARANDAS VIBRATORIAS',
    'BOMBAS',
    'CELDAS DE FLOTACIÓN',
    'ESPESADORES',
    'FILTROS DE COBRE',
    'OTROS'

  ];


  return equipos
    .map(equipo => `

      <label class="check-entrevista">

        <input
          type="checkbox"
          class="equipo-entrevista"
          value="${equipo}"
        >

        <span>
          ${equipo}
        </span>

      </label>

    `)
    .join('');

}


/* =====================================================
   SISTEMAS
===================================================== */

function crearChecksSistemasAndamios() {

  const sistemas = [

    'LAYHER',
    'ULMA',
    'PERI',
    'DOKA',
    'SCFOM-RUX',
    'OTROS'

  ];


  return sistemas
    .map(sistema => `

      <label class="check-entrevista">

        <input
          type="checkbox"
          class="sistema-andamio-entrevista"
          value="${sistema}"
        >

        <span>
          ${sistema}
        </span>

      </label>

    `)
    .join('');

}


/* =====================================================
   CERTIFICACIONES
===================================================== */

function crearChecksCertificaciones() {

  const certificaciones = [

    'LAYHER BASIC',
    'LAYHER OFICIAL',
    'LAYHER OPERARIO',
    'LAYHER CAPATAZ',
    'LAYHER SUPERVISOR',
    'LAYHER SCHULE',

    'ULMA BASIC',
    'ULMA TÉCNICO I',
    'ULMA TÉCNICO II',

    'PERI BASIC',
    'PERI TÉCNICO I',
    'PERI TÉCNICO II',

    'DOKA BASIC',
    'DOKA TÉCNICO I',
    'DOKA TÉCNICO II',

    'SCFOM-RUX BASIC',
    'SCFOM-RUX TÉCNICO I',
    'SCFOM-RUX TÉCNICO II'

  ];


  return certificaciones
    .map(cert => `

      <label class="check-entrevista">

        <input
          type="checkbox"
          class="certificacion-entrevista"
          value="${cert}"
        >

        <span>
          ${cert}
        </span>

      </label>

    `)
    .join('');

}


/* =====================================================
   CALCULAR RESULTADO
===================================================== */

function calcularResultadoEntrevista() {

  const seguridad =
    Number(
      document.getElementById(
        'valoracionSeguridad'
      ).value || 0
    );


  const experiencia =
    Number(
      document.getElementById(
        'valoracionExperiencia'
      ).value || 0
    );


  const tecnica =
    Number(
      document.getElementById(
        'valoracionTecnica'
      ).value || 0
    );


  if (
    !seguridad ||
    !experiencia ||
    !tecnica
  ) {

    alert(
      'Debe completar las tres valoraciones.'
    );

    return false;

  }


  const promedio =
    (
      seguridad +
      experiencia +
      tecnica
    ) / 3;


  let criterio = '';


  if (promedio < 2) {

    criterio =
      'MUY POR DEBAJO DEL PERFIL';

  } else if (promedio < 3) {

    criterio =
      'POR DEBAJO DEL PERFIL';

  } else if (promedio < 4) {

    criterio =
      'CUMPLE CON EL PERFIL';

  } else if (promedio < 5) {

    criterio =
      'POR ENCIMA DEL PERFIL';

  } else {

    criterio =
      'SOBREPASA EL PERFIL';

  }


  document.getElementById(
    'promedioEntrevista'
  ).value =
    promedio.toFixed(2);


  document.getElementById(
    'criterioEntrevista'
  ).value =
    criterio;


  /*
   * RECIÉN DESPUÉS DE CALCULAR
   * SE HABILITA EL CARGO EN QUE CLASIFICA
   */

  const puestoClasifica =
    document.getElementById(
      'entrevistaPuestoClasifica'
    );


  puestoClasifica.disabled =
    false;


  if (!puestoClasifica.value) {

    puestoClasifica.value =
      candidatoEntrevista?.cargo || '';

  }


  puestoClasifica.focus();


  return true;

}


/* =====================================================
   RECOLECTAR UNIDADES
===================================================== */

function obtenerUnidadesEntrevista() {

  return Array
    .from(
      document.querySelectorAll(
        '.fila-unidad-entrevista'
      )
    )
    .map(fila => ({

      unidadMinera:
        fila.dataset.unidad || '',

      acreditado:
        fila.querySelector(
          '.unidad-acreditado'
        ).value,

      liberado:
        fila.querySelector(
          '.unidad-liberado'
        ).value,

      cargo:
        fila.querySelector(
          '.unidad-cargo'
        ).value.trim(),

      empresa:
        fila.querySelector(
          '.unidad-empresa'
        ).value.trim()

    }))
    .filter(u =>

      u.acreditado ||
      u.liberado ||
      u.cargo ||
      u.empresa

    );

}


/* =====================================================
   RECOLECTAR RESPUESTAS
===================================================== */

function obtenerRespuestasEntrevista() {

  const respuestas = [];


  document
    .querySelectorAll(
      '.pregunta-entrevista'
    )
    .forEach(bloque => {

      const textarea =
        bloque.querySelector(
          '.respuesta-entrevista'
        );


      if (!textarea)
        return;


      const pregunta =
        bloque.querySelector(
          'label'
        )?.textContent
          ?.trim() || '';


      respuestas.push({

        seccion:
          bloque.dataset.seccion || '',

        codigoPregunta:
          bloque.dataset.codigo || '',

        pregunta,

        respuesta:
          textarea.value.trim(),

        valor: ''

      });

    });


  const equipos =
    Array
      .from(
        document.querySelectorAll(
          '.equipo-entrevista:checked'
        )
      )
      .map(x => x.value);


  respuestas.push({

    seccion:
      'TECNICA',

    codigoPregunta:
      'TEC-EQUIPOS',

    pregunta:
      'Áreas / Equipos donde ha trabajado',

    respuesta:
      equipos.join(', '),

    valor: ''

  });


  const sistemas =
    Array
      .from(
        document.querySelectorAll(
          '.sistema-andamio-entrevista:checked'
        )
      )
      .map(x => x.value);


  respuestas.push({

    seccion:
      'TECNICA',

    codigoPregunta:
      'TEC-SISTEMAS',

    pregunta:
      'Tipos de andamio que conoce o ha armado',

    respuesta:
      sistemas.join(', '),

    valor: ''

  });


  const certificaciones =
    Array
      .from(
        document.querySelectorAll(
          '.certificacion-entrevista:checked'
        )
      )
      .map(x => x.value);


  respuestas.push({

    seccion:
      'TECNICA',

    codigoPregunta:
      'TEC-CERTIFICACIONES',

    pregunta:
      'Certificaciones',

    respuesta:
      certificaciones.join(', '),

    valor: ''

  });


  return respuestas;

}


/* =====================================================
   RECOLECTAR EXPERIENCIA
===================================================== */

function obtenerExperienciaEntrevista() {

  return {

    tiempoExperiencia:
      document.getElementById(
        'experienciaTiempo'
      ).value,

    ultimaEmpresa:
      document.getElementById(
        'experienciaUltimaEmpresa'
      ).value.trim(),

    tiempoUltimaEmpresa:
      document.getElementById(
        'experienciaTiempoUltimaEmpresa'
      ).value,

    modalidadTrabajo:
      document.getElementById(
        'experienciaModalidad'
      ).value,

    motivoRetiro:
      document.getElementById(
        'experienciaMotivoRetiro'
      ).value,

    otroMotivo:
      document.getElementById(
        'experienciaOtroMotivo'
      ).value.trim(),

    tuvoAccidente:
      document.getElementById(
        'tuvoAccidente'
      ).value,

    tipoAccidente:
      document.getElementById(
        'tipoAccidente'
      ).value,

    detalleAccidente:
      document.getElementById(
        'detalleAccidente'
      ).value.trim(),

    comentarios:
      document.getElementById(
        'experienciaComentarios'
      ).value.trim()

  };

}


/* =====================================================
   GUARDAR ENTREVISTA
===================================================== */

async function guardarEntrevistaOperaciones(
  event
) {

  event.preventDefault();


  if (
    !candidatoEntrevista ||
    !agendaEntrevistaActual
  ) {

    alert(
      'No se encontró la información de la entrevista.'
    );

    return;

  }


  const formulario =
    document.getElementById(
      'formEntrevistaOperaciones'
    );


  /*
   * Valida primero los required visibles.
   */

  if (!formulario.checkValidity()) {

    formulario.reportValidity();
    return;

  }


  if (
    !calcularResultadoEntrevista()
  ) {

    return;

  }


  const puestoClasifica =
    document.getElementById(
      'entrevistaPuestoClasifica'
    ).value.trim();


  if (!puestoClasifica) {

    alert(
      'Indique el puesto en que clasifica el candidato.'
    );

    return;

  }


  const resultado =
    document.getElementById(
      'resultadoEntrevista'
    ).value;


  if (!resultado) {

    alert(
      'Seleccione el resultado de la entrevista.'
    );

    return;

  }


  const comentarios =
    document.getElementById(
      'comentariosGeneralesEntrevista'
    ).value.trim();


  if (
    resultado === 'NO APTO' &&
    !comentarios
  ) {

    alert(
      'Para un NO APTO debe indicar el motivo en Comentarios generales.'
    );

    return;

  }


  /* DISPONIBILIDAD */

  let disponibilidad =
    document.getElementById(
      'entrevistaDisponibilidad'
    ).value;


  if (
    disponibilidad === 'OTROS'
  ) {

    const detalle =
      document.getElementById(
        'entrevistaDisponibilidadOtros'
      ).value.trim();


    if (!detalle) {

      alert(
        'Especifique la disponibilidad del candidato.'
      );

      return;

    }


    disponibilidad =
      'OTROS - ' + detalle;

  }


 /* TIPO REMUNERACIÓN / MONTO */

const tipoRemuneracion =
  document.getElementById(
    'tipoPretension'
  ).value;


const monto =
  document.getElementById(
    'entrevistaPretension'
  ).value;


  const valorSeguridad =
    Number(
      document.getElementById(
        'valoracionSeguridad'
      ).value
    );


  const valorExperiencia =
    Number(
      document.getElementById(
        'valoracionExperiencia'
      ).value
    );


  const valorTecnica =
    Number(
      document.getElementById(
        'valoracionTecnica'
      ).value
    );


  const boton =
    document.getElementById(
      'btnGuardarEntrevista'
    );


  const textoOriginal =
    boton.textContent;


  const confirmar =
    confirm(
      resultado === 'APTO'
        ?
          '¿Confirmar entrevista como APTO?\n\nEl candidato será derivado a ATH para Valor Hora.'
        :
          '¿Confirmar entrevista como NO APTO?\n\nEl proceso del candidato será finalizado.'
    );


  if (!confirmar)
    return;


  boton.disabled =
    true;

  boton.textContent =
    'Guardando entrevista...';


  try {

    const payload = {

      accion:
        'guardarEntrevistaOperaciones',

      idCandidato:
        candidatoEntrevista
          .idCandidato,

      idRequerimiento:
        candidatoEntrevista
          .idRequerimiento,


      fechaEntrevista:
        document.getElementById(
          'entrevistaFecha'
        ).value,

      lugarEntrevista:
        document.getElementById(
          'entrevistaLugar'
        ).value.trim(),

      modalidadEntrevista:
        document.getElementById(
          'entrevistaModalidad'
        ).value,

      gradoAcademico:
        document.getElementById(
          'entrevistaGradoAcademico'
        ).value,

      estudios:
        document.getElementById(
          'entrevistaEstudios'
        ).value.trim(),

      puestoPostula:
        document.getElementById(
          'entrevistaPuestoPostula'
        ).value.trim(),

      puestoClasifica,

      entrevistador:
        document.getElementById(
          'entrevistaEntrevistador'
        ).value,

      disponibilidad,
      
      tipoRemuneracion,
      
      monto,
      
      resultado,

      comentariosGenerales:
        comentarios,

      valoracionSeguridad:
        valorSeguridad,

      valoracionExperiencia:
        valorExperiencia,

      valoracionTecnica:
        valorTecnica,

      unidades:
        obtenerUnidadesEntrevista(),

      respuestas:
        obtenerRespuestasEntrevista(),

      experiencia:
        obtenerExperienciaEntrevista()

    };


const idCandidatoGuardado =
  candidatoEntrevista.idCandidato;


const respuesta =
  await fetch(
    API_CONTRATACION,
    {

      method:
        'POST',

      headers: {

        'Content-Type':
          'text/plain;charset=utf-8'

      },

      body:
        JSON.stringify(payload)

    }
  );


const textoRespuesta =
  await respuesta.text();


let datos = null;


try {

  datos =
    JSON.parse(
      textoRespuesta
    );

} catch (errorJSON) {

  console.warn(
    'Apps Script no devolvió JSON:',
    textoRespuesta
  );

}


/* =====================================================
   RESPUESTA JSON NORMAL
===================================================== */

if (datos) {

  if (!datos.ok) {

    throw new Error(
      datos.mensaje ||
      'No se pudo guardar la entrevista.'
    );

  }


  alert(
    datos.mensaje +
    '\n\n' +
    'Entrevista: ' +
    datos.idEntrevista +
    '\n' +
    'Promedio: ' +
    datos.promedio +
    '\n' +
    'Criterio: ' +
    datos.criterio
  );


  cerrarEntrevista();

  await cargarOperaciones();

  return;

}


/* =====================================================
   GOOGLE DEVOLVIÓ HTML EN VEZ DE JSON
   VERIFICAMOS SI EL CANDIDATO YA SALIÓ DE OPERACIONES
===================================================== */

await new Promise(
  resolve =>
    setTimeout(
      resolve,
      800
    )
);


await cargarOperaciones();


const sigueEnOperaciones =
  candidatosOperaciones.some(
    candidato =>
      String(
        candidato.idCandidato
      ) ===
      String(
        idCandidatoGuardado
      )
  );


if (!sigueEnOperaciones) {

  cerrarEntrevista();


  alert(
    'Entrevista registrada correctamente.\n\n' +
    'El proceso del candidato fue actualizado.'
  );


  return;

}


throw new Error(
  'El servidor devolvió una respuesta no válida. ' +
  'La entrevista no pudo confirmarse.'
);

  } catch (error) {

    alert(
      error.message
    );

  } finally {

    boton.disabled =
      false;

    boton.textContent =
      textoOriginal;

  }

}


/* =====================================================
   CERRAR ENTREVISTA
===================================================== */

function cerrarEntrevista() {

  document
    .getElementById(
      'modalEntrevista'
    )
    .classList.remove(
      'visible'
    );


  candidatoEntrevista =
    null;

  agendaEntrevistaActual =
    null;

}


/* =====================================================
   ESTADO AGENDA
===================================================== */

function obtenerClaseEstadoAgenda(
  estado
) {

  estado =
    String(
      estado || ''
    ).toUpperCase();


  if (
    estado ===
    'PENDIENTE DE PROGRAMAR'
  ) {

    return 'estado-pendiente';

  }


  if (
    estado ===
    'REPROGRAMADA'
  ) {

    return 'estado-reprogramada';

  }


  return 'estado-programada';

}


/* =====================================================
   FECHA PARA INPUT
===================================================== */

function convertirFechaInput(
  fecha
) {

  if (!fecha)
    return '';


  const partes =
    String(fecha)
      .split('/');


  if (
    partes.length === 3
  ) {

    return (
      partes[2] +
      '-' +
      partes[1].padStart(2, '0') +
      '-' +
      partes[0].padStart(2, '0')
    );

  }


  return fecha;

}


/* =====================================================
   SEGURIDAD HTML
===================================================== */

function escaparHTML(
  valor
) {

  return String(
    valor ?? ''
  )
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

}


function escaparJS(
  valor
) {

  return String(
    valor ?? ''
  )
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'");

}
