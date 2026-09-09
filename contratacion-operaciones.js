const API_CONTRATACION =
  'https://script.google.com/macros/s/AKfycbzex_3Lnbvymek_tx_IVkm4S6EA1ShGGbdhQzCJdNTBW3lJjHlt76yF5meToB6Ng64V/exec';


let candidatosOperaciones = [];
let agendaEntrevistas = [];

let candidatoSeleccionado = null;
let agendaSeleccionada = null;
let candidatoEntrevista = null;
let agendaEntrevistaActual = null;


/* =====================================================
   INICIO
===================================================== */

document.addEventListener(
  'DOMContentLoaded',
  async () => {

    prepararTabs();

    crearModalAgenda();
    
    crearModalEntrevista();
    
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


  botones.forEach(
    boton => {

      boton.addEventListener(
        'click',
        () => {

          botones.forEach(
            b =>
              b.classList.remove(
                'activo'
              )
          );


          document
            .querySelectorAll(
              '.contenido-tab'
            )
            .forEach(
              c =>
                c.classList.remove(
                  'activo'
                )
            );


          boton.classList.add(
            'activo'
          );


          const tab =
            boton.dataset.tab;


          if (
            tab === 'agenda'
          ) {

            document
              .getElementById(
                'tabAgenda'
              )
              .classList.add(
                'activo'
              );
          }


          if (
            tab === 'entrevistas'
          ) {

            document
              .getElementById(
                'tabEntrevistas'
              )
              .classList.add(
                'activo'
              );
          }
        }
      );
    }
  );
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
      respuestaAgenda
    ] =
      await Promise.all([

        fetch(
          API_CONTRATACION +
          '?accion=listarPendientesArea&area=OPERACIONES'
        ),

        fetch(
          API_CONTRATACION +
          '?accion=listarAgendaEntrevistas'
        )

      ]);


    const datosCandidatos =
      await respuestaCandidatos.json();


    const datosAgenda =
      await respuestaAgenda.json();


    if (!datosCandidatos.ok) {

      throw new Error(
        datosCandidatos.mensaje ||
        'No se pudieron cargar los candidatos'
      );
    }


    if (!datosAgenda.ok) {

      throw new Error(
        datosAgenda.mensaje ||
        'No se pudo cargar la agenda'
      );
    }


    candidatosOperaciones =
      datosCandidatos.candidatos || [];


    agendaEntrevistas =
      datosAgenda.agenda || [];


    renderizarAgenda();

    renderizarEntrevistas();

  } catch (error) {

    contenedor.innerHTML =
      `
        <div class="mensaje-error">
          ${escaparHTML(error.message)}
        </div>
      `;

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
              String(
                a.idCandidato
              ) ===
              String(
                candidato.idCandidato
              )
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
            <h2>Agenda de entrevistas</h2>

            <p>
              Candidatos derivados por Legal
              para entrevista técnica.
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
                ? candidatos
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
                        No hay candidatos pendientes
                        en Operaciones.
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
          ${
            escaparHTML(
              agenda.horaProgramada || ''
            )
          }
        </div>
      `
    :
      `
        <span class="texto-pendiente">
          Sin programar
        </span>
      `;


  const modalidad =
    tieneAgenda
    ?
      escaparHTML(
        agenda.modalidad || '-'
      )
    :
      '-';


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


  const boton =
    tieneAgenda
    ?
      `
        <button
          type="button"
          class="btn-agenda secundario"
          onclick="abrirAgenda('${escaparJS(
            candidato.idCandidato
          )}')"
        >
          Reprogramar
        </button>
      `
    :
      `
        <button
          type="button"
          class="btn-agenda"
          onclick="abrirAgenda('${escaparJS(
            candidato.idCandidato
          )}')"
        >
          Programar
        </button>
      `;


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
        ${escaparHTML(
          candidato.dni
        )}
      </td>

      <td>
        ${escaparHTML(
          candidato.cargo
        )}
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
        ${modalidad}
      </td>

      <td>

        <span class="estado-agenda ${claseEstado}">
          ${escaparHTML(estado)}
        </span>

      </td>

      <td>
        ${boton}
      </td>

    </tr>
  `;
}


/* =====================================================
   ABRIR MODAL
===================================================== */

function abrirAgenda(
  idCandidato
) {

  candidatoSeleccionado =
    candidatosOperaciones.find(
      c =>
        String(
          c.idCandidato
        ) ===
        String(
          idCandidato
        )
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
        String(
          a.idCandidato
        ) ===
        String(
          idCandidato
        )
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


  document.getElementById(
    'entrevistadorAgenda'
  ).value =
    agendaSeleccionada
      ?.entrevistador || '';


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


  document.getElementById(
    'modalAgenda'
  ).classList.add(
    'visible'
  );
}


/* =====================================================
   CREAR MODAL
===================================================== */

function crearModalAgenda() {

  const modal =
    document.createElement(
      'div'
    );


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

              <input
                type="text"
                id="entrevistadorAgenda"
                placeholder="Nombre del entrevistador"
                required
              >

            </div>


            <div class="campo-agenda ancho-completo">

              <label>
                Observación
              </label>

              <textarea
                id="observacionAgenda"
                rows="3"
                placeholder="Observación de la programación"
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


  if (!candidatoSeleccionado) {

    return;
  }


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
        document
          .getElementById(
            'fechaProgramada'
          )
          .value,

      horaProgramada:
        document
          .getElementById(
            'horaProgramada'
          )
          .value,

      modalidad:
        document
          .getElementById(
            'modalidadAgenda'
          )
          .value,

      lugarEnlace:
        document
          .getElementById(
            'lugarAgenda'
          )
          .value
          .trim(),

      entrevistador:
        document
          .getElementById(
            'entrevistadorAgenda'
          )
          .value
          .trim(),

      observacion:
        document
          .getElementById(
            'observacionAgenda'
          )
          .value
          .trim()

    };


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
            JSON.stringify(
              payload
            )
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
   CERRAR MODAL
===================================================== */

function cerrarAgenda() {

  document
    .getElementById(
      'modalAgenda'
    )
    .classList.remove(
      'visible'
    );


  candidatoSeleccionado =
    null;


  agendaSeleccionada =
    null;
}


/* =====================================================
   MODALIDAD
===================================================== */

function cambiarTextoLugar() {

  const modalidad =
    document
      .getElementById(
        'modalidadAgenda'
      )
      ?.value;


  const label =
    document.getElementById(
      'labelLugarAgenda'
    );


  const input =
    document.getElementById(
      'lugarAgenda'
    );


  if (
    modalidad === 'VIRTUAL'
  ) {

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


  const programados =
    candidatosOperaciones
      .map(candidato => {

        const agenda =
          agendaEntrevistas.find(
            a =>
              String(
                a.idCandidato
              ) ===
              String(
                candidato.idCandidato
              )
          );


        return {
          candidato,
          agenda
        };
      })
      .filter(
        x => x.agenda
      );


  contenedor.innerHTML =
    `

      <div class="bloque-operaciones">

        <div class="titulo-bloque-operaciones">

          <div>

            <h2>
              Entrevistas
            </h2>

            <p>
              Entrevistas programadas listas
              para iniciar evaluación técnica.
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
                programados.length
                ?
                  programados
                    .map(
                      x => `
                        <tr>

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

                            <span class="estado-agenda estado-programada">

                              ${escaparHTML(
                                x.agenda.estadoCita
                              )}

                            </span>

                          </td>

                          <td>

                            <button
                              type="button"
                              class="btn-iniciar-entrevista"
                              onclick="iniciarEntrevista('${escaparJS(
                                x.candidato.idCandidato
                              )}')"
                            >
                              Iniciar entrevista
                            </button>

                          </td>

                        </tr>
                      `
                    )
                    .join('')
                :
                  `
                    <tr>

                      <td
                        colspan="9"
                        class="sin-registros"
                      >
                        No hay entrevistas programadas.
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
   INICIAR ENTREVISTA
===================================================== */

function iniciarEntrevista(
  idCandidato
) {

  candidatoEntrevista =
    candidatosOperaciones.find(
      c =>
        String(
          c.idCandidato
        ) ===
        String(
          idCandidato
        )
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
        String(
          a.idCandidato
        ) ===
        String(
          idCandidato
        )
    ) || null;


  if (!agendaEntrevistaActual) {

    alert(
      'Primero debe programar la entrevista.'
    );

    return;
  }


  document.getElementById(
    'entrevistaNombre'
  ).textContent =
    candidatoEntrevista.nombres;


  document.getElementById(
    'entrevistaDni'
  ).textContent =
    candidatoEntrevista.dni;


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


  document.getElementById(
    'entrevistaPuestoClasifica'
  ).value =
    candidatoEntrevista.cargo || '';


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


  document.getElementById(
    'entrevistaEntrevistador'
  ).value =
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
   MODAL ENTREVISTA
===================================================== */

function crearModalEntrevista() {

  const modal =
    document.createElement(
      'div'
    );


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


        <form id="formEntrevistaOperaciones">

          <section class="seccion-entrevista">

            <h3>
              1. Datos Generales
            </h3>


            <div class="grid-entrevista">


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


              <div class="campo-entrevista ancho-completo">

                <label>
                  Lugar de entrevista
                </label>

                <input
                  type="text"
                  id="entrevistaLugar"
                  required
                >

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

                  <option value="TECNICO">
                    Técnico
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
                  Puesto en que clasifica
                </label>

                <input
                  type="text"
                  id="entrevistaPuestoClasifica"
                  required
                >

              </div>


              <div class="campo-entrevista">

                <label>
                  Entrevistador
                </label>

                <input
                  type="text"
                  id="entrevistaEntrevistador"
                  required
                >

              </div>


              <div class="campo-entrevista">

                <label>
                  Disponibilidad
                </label>

                <select
                  id="entrevistaDisponibilidad"
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


              <div class="campo-entrevista ancho-completo">

                <label>
                  Pretensión salarial
                </label>

                <input
                  type="text"
                  id="entrevistaPretension"
                >

              </div>


            </div>

          </section>


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


<section class="seccion-entrevista">

  <h3>
    2. Conocimientos de Seguridad
  </h3>


  <div class="preguntas-entrevista">


    <div
      class="pregunta-entrevista"
      data-seccion="SEGURIDAD"
      data-codigo="SEG-01"
    >

      <label>
        ¿Con qué Decreto Supremo se trabaja en la Unidad Minera?
      </label>

      <textarea
        class="respuesta-entrevista"
        rows="3"
      ></textarea>

    </div>


    <div
      class="pregunta-entrevista"
      data-seccion="SEGURIDAD"
      data-codigo="SEG-02"
    >

      <label>
        ¿Qué documentos de gestión se trabajan en la Unidad Minera?
      </label>

      <textarea
        class="respuesta-entrevista"
        rows="3"
      ></textarea>

    </div>


    <div
      class="pregunta-entrevista"
      data-seccion="SEGURIDAD"
      data-codigo="SEG-03"
    >

      <label>
        ¿Qué es Seguridad para ti?
      </label>

      <textarea
        class="respuesta-entrevista"
        rows="3"
      ></textarea>

    </div>


    <div
      class="pregunta-entrevista"
      data-seccion="SEGURIDAD"
      data-codigo="SEG-04"
    >

      <label>
        ¿Cuál sería tu aporte de Seguridad para la empresa?
      </label>

      <textarea
        class="respuesta-entrevista"
        rows="3"
      ></textarea>

    </div>


  </div>


  <div class="subtitulo-entrevista">
    Valoración de Seguridad
  </div>


  <div class="bloque-valoracion">

    <label>
      Calificación
    </label>

    <select
      id="valoracionSeguridad"
      required
    >

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

    </select>

  </div>


  <div class="subtitulo-entrevista">
    Antecedentes de accidente laboral
  </div>


  <div class="grid-entrevista">


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

      <select
        id="tipoAccidente"
      >

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
      class="campo-entrevista ancho-completo"
      id="campoDetalleAccidente"
      style="display:none;"
    >

      <label>
        Detalle del accidente
      </label>

      <textarea
        id="detalleAccidente"
        rows="3"
      ></textarea>

    </div>


  </div>

</section>


<section class="seccion-entrevista">

  <h3>
    3. Experiencia Laboral
  </h3>


  <div class="grid-entrevista">


    <div class="campo-entrevista">

      <label>
        Tiempo de experiencia
      </label>

      <input
        type="text"
        id="experienciaTiempo"
        placeholder="Ej. 3 años"
      >

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

      <input
        type="text"
        id="experienciaTiempoUltimaEmpresa"
        placeholder="Ej. 8 meses"
      >

    </div>


    <div class="campo-entrevista">

      <label>
        Modalidad de trabajo
      </label>

      <select
        id="experienciaModalidad"
        onchange="actualizarModalidadExperiencia()"
      >

        <option value="">
          Seleccione
        </option>

        <option value="PARADAS DE PLANTA">
          Paradas de planta
        </option>

        <option value="PERMANENTE">
          Permanente
        </option>

        <option value="PRACTICAS">
          Prácticas
        </option>

        <option value="OTROS">
          Otros
        </option>

      </select>

    </div>


    <div
      class="campo-entrevista ancho-completo"
      id="campoOtraModalidadExperiencia"
      style="display:none;"
    >

      <label>
        Especifique otra modalidad
      </label>

      <input
        type="text"
        id="experienciaOtraModalidad"
      >

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


    <div class="campo-entrevista ancho-completo">

      <label>
        Comentarios de experiencia laboral
      </label>

      <textarea
        id="experienciaComentarios"
        rows="4"
      ></textarea>

    </div>


  </div>


  <div class="subtitulo-entrevista">
    Valoración de Experiencia
  </div>


  <div class="bloque-valoracion">

    <label>
      Calificación
    </label>

    <select
      id="valoracionExperiencia"
      required
    >

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

    </select>

  </div>

</section>


<div class="aviso-entrevista-desarrollo">

  Siguiente bloque:
  4. Conocimientos Técnicos.

</div>


          <div class="acciones-modal-entrevista">

            <button
              type="button"
              class="btn-cancelar-entrevista"
              onclick="cerrarEntrevista()"
            >
              Cerrar
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
   UNIDADES MINERAS - ENTREVISTA
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
    .map(
      unidad => `

        <tr
          class="fila-unidad-entrevista"
          data-unidad="${unidad}"
        >

          <td>
            <strong>
              ${unidad}
            </strong>
          </td>


          <td>

            <select
              class="unidad-acreditado"
            >

              <option value="">
                -
              </option>

              <option value="SI">
                Sí
              </option>

              <option value="NO">
                No
              </option>

            </select>

          </td>


          <td>

            <select
              class="unidad-liberado"
            >

              <option value="">
                -
              </option>

              <option value="SI">
                Sí
              </option>

              <option value="NO">
                No
              </option>

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

      `
    )
    .join('');
}

/* =====================================================
   ACCIDENTE LABORAL
===================================================== */

function actualizarAccidenteEntrevista() {

  const tuvo =
    document
      .getElementById(
        'tuvoAccidente'
      )
      .value;


  const campoTipo =
    document.getElementById(
      'campoTipoAccidente'
    );


  const campoDetalle =
    document.getElementById(
      'campoDetalleAccidente'
    );


  const tipo =
    document.getElementById(
      'tipoAccidente'
    );


  const detalle =
    document.getElementById(
      'detalleAccidente'
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

    tipo.value = '';

    detalle.value = '';
  }
}

/* =====================================================
   EXPERIENCIA LABORAL - CAMPOS DINÁMICOS
===================================================== */

function actualizarModalidadExperiencia() {

  const valor =
    document
      .getElementById(
        'experienciaModalidad'
      )
      .value;


  const campo =
    document.getElementById(
      'campoOtraModalidadExperiencia'
    );


  const input =
    document.getElementById(
      'experienciaOtraModalidad'
    );


  if (valor === 'OTROS') {

    campo.style.display =
      'flex';

  } else {

    campo.style.display =
      'none';

    input.value = '';
  }
}



function actualizarMotivoRetiro() {

  const valor =
    document
      .getElementById(
        'experienciaMotivoRetiro'
      )
      .value;


  const campo =
    document.getElementById(
      'campoOtroMotivoRetiro'
    );


  const input =
    document.getElementById(
      'experienciaOtroMotivo'
    );


  if (valor === 'OTRO') {

    campo.style.display =
      'flex';

  } else {

    campo.style.display =
      'none';

    input.value = '';
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
   CLASE ESTADO
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
   FECHAS
===================================================== */

function convertirFechaInput(
  fecha
) {

  if (!fecha) {

    return '';
  }


  const partes =
    String(fecha)
      .split('/');


  if (
    partes.length === 3
  ) {

    return (
      partes[2] +
      '-' +
      partes[1].padStart(
        2,
        '0'
      ) +
      '-' +
      partes[0].padStart(
        2,
        '0'
      )
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
    .replace(
      /&/g,
      '&amp;'
    )
    .replace(
      /</g,
      '&lt;'
    )
    .replace(
      />/g,
      '&gt;'
    )
    .replace(
      /"/g,
      '&quot;'
    )
    .replace(
      /'/g,
      '&#039;'
    );
}



function escaparJS(
  valor
) {

  return String(
    valor ?? ''
  )
    .replace(
      /\\/g,
      '\\\\'
    )
    .replace(
      /'/g,
      "\\'"
    );
}
