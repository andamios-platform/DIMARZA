const API =
'https://script.google.com/macros/s/AKfycbzex_3Lnbvymek_tx_IVkm4S6EA1ShGGbdhQzCJdNTBW3lJjHlt76yF5meToB6Ng64V/exec';


const AREA =
document.body.dataset.area;


let candidatos = [];

let candidatoActual = null;


const CONFIG = {

  LEGAL: {

    titulo:
      'Legal - Verificativa',

    subtitulo:
      'Verificación de antecedentes',

    resultados: [
      'CONFORME',
      'OBSERVADO',
      'NO APTO'
    ]
  },


  OPERACIONES: {

    titulo:
      'Operaciones - Entrevista Técnica',

    subtitulo:
      'Evaluación técnica del candidato',

    resultados: [
      'APROBADO',
      'OBSERVADO',
      'NO APTO'
    ]
  },


  ATH: {

    titulo:
      'ATH - Valor Hora',

    subtitulo:
      'Definición y cierre del VH',

    resultados: [
      'CERRADO',
      'OBSERVADO'
    ]
  },


  GTH: {

    titulo:
      'GTH - Contrato',

    subtitulo:
      'Elaboración y firma del contrato',

    resultados: [
      'FIRMADO 100%',
      'OBSERVADO'
    ]
  },


  DOTACION: {

    titulo:
      'Dotación - Acreditación',

    subtitulo:
      'Programación, acreditación y habilitación',

    resultados: [
      'PROGRAMADO',
      'EN PROCESO',
      'OBSERVADO',
      'HABILITADO'
    ]
  }
};


document.addEventListener(
  'DOMContentLoaded',
  iniciar
);


async function iniciar(){

  const config =
    CONFIG[AREA];


  document.getElementById(
    'tituloPagina'
  ).textContent =
    config.titulo;


  document.getElementById(
    'subtituloPagina'
  ).textContent =
    config.subtitulo;


  await cargarCandidatos();
}



async function cargarCandidatos(){

  const tbody =
    document.getElementById(
      'tablaCandidatos'
    );


  tbody.innerHTML = `
    <tr>
      <td
        colspan="11"
        class="vacio"
      >
        Cargando...
      </td>
    </tr>
  `;


  try{

    const respuesta =
      await fetch(
        API +
        '?accion=listarPendientesArea&area=' +
        encodeURIComponent(AREA)
      );


    const resultado =
      await respuesta.json();


    if(!resultado.ok){

      throw new Error(
        resultado.mensaje
      );
    }


    candidatos =
      resultado.candidatos || [];


    actualizarKPIs();


    if(!candidatos.length){

      tbody.innerHTML = `
        <tr>
          <td
            colspan="11"
            class="vacio"
          >
            No existen candidatos pendientes.
          </td>
        </tr>
      `;

      return;
    }


    tbody.innerHTML =
      candidatos
      .map(crearFila)
      .join('');


  }catch(error){

    console.error(error);

    tbody.innerHTML = `
      <tr>
        <td
          colspan="11"
          class="vacio"
        >
          Error cargando candidatos.
        </td>
      </tr>
    `;
  }
}



function crearFila(c){

  let documentos = '';
    const estado =
    String(
      c.estadoGeneral || ''
    ).toUpperCase();


  const claseFila =
    estado === 'OBSERVADO'
    ? 'fila-observada'
    : '';

if(
  AREA === 'LEGAL' ||
  AREA === 'DOTACION'
){

  documentos = `
    <a
      href="${escapar(c.archivoDni)}"
      target="_blank"
    >
      DNI
    </a>
  `;
}


  if(
    AREA === 'OPERACIONES' ||
    AREA === 'DOTACION'
  ){

    documentos += `
      &nbsp;
      <a
        href="${escapar(c.cv)}"
        target="_blank"
      >
        CV
      </a>
    `;
  }


  if(
    AREA === 'GTH'
  ){

    documentos =
      'VH: ' +
      escapar(c.vh);
  }


return `

    <tr class="${claseFila}">

      <td>
        <strong>
          ${escapar(c.idCandidato)}
        </strong>
      </td>

      <td>
        ${escapar(c.nombres)}
      </td>

      <td>
        ${escapar(c.dni)}
      </td>

      <td>
        ${escapar(c.telefono)}
      </td>

      <td>
        ${escapar(c.residencia)}
      </td>

      <td>
        ${escapar(c.cargo)}
      </td>

      <td>
        ${escapar(c.unidad)}
      </td>

      <td>
        ${escapar(c.tipoContrato)}
      </td>

      <td>
        ${escapar(c.fechaObjetivo)}
      </td>

      <td>
        ${documentos || '-'}
      </td>

      <td>
        <button
          class="btn btn-accion"
          onclick="
            abrirGestion(
              '${escaparJS(c.idCandidato)}'
            )
          "
        >
          Gestionar
        </button>
      </td>

    </tr>
  `;
}



function actualizarKPIs(){

  const pendientes =
    candidatos.filter(
      c =>
        String(
          c.estadoGeneral || ''
        ).toUpperCase()
        !== 'OBSERVADO'
    ).length;


  document.getElementById(
    'kpiPendientes'
  ).textContent =
    pendientes;


  const observados =
    candidatos.filter(
      c =>
        String(c.estadoGeneral)
          .toUpperCase()
        === 'OBSERVADO'
    ).length;


  document.getElementById(
    'kpiObservados'
  ).textContent =
    observados;


  const contratos =
    candidatos.filter(
      c =>
        c.fechaContratacion
    ).length;


  document.getElementById(
    'kpiContratados'
  ).textContent =
    contratos;


  const habilitados =
    candidatos.filter(
      c =>
        c.fechaHabilitacion
    ).length;


  document.getElementById(
    'kpiHabilitados'
  ).textContent =
    habilitados;
}



function abrirGestion(id){

  candidatoActual =
    candidatos.find(
      c =>
        c.idCandidato === id
    );


  if(!candidatoActual)
    return;


  document.getElementById(
    'modalNombre'
  ).textContent =
    candidatoActual.nombres;


  document.getElementById(
    'modalDatos'
  ).innerHTML = `

    <div class="dato">
      <strong>DNI:</strong>
      ${escapar(candidatoActual.dni)}
    </div>

    <div class="dato">
      <strong>Cargo:</strong>
      ${escapar(candidatoActual.cargo)}
    </div>

    <div class="dato">
      <strong>Unidad:</strong>
      ${escapar(candidatoActual.unidad)}
    </div>

    <div class="dato">
      <strong>Tipo de contrato:</strong>
      ${escapar(candidatoActual.tipoContrato)}
    </div>

    <div class="dato">
      <strong>Residencia:</strong>
      ${escapar(candidatoActual.residencia)}
    </div>
  `;


  cargarResultados();


  cargarCamposEspeciales();


  document.getElementById(
    'responsable'
  ).value = '';


  document.getElementById(
    'observacion'
  ).value = '';


  document.getElementById(
    'modal'
  ).classList.add(
    'activo'
  );
}



function cargarResultados(){

  const select =
    document.getElementById(
      'resultado'
    );


  select.innerHTML =
    '<option value="">Seleccione...</option>';


  CONFIG[AREA]
    .resultados
    .forEach(r => {

      const option =
        document.createElement(
          'option'
        );

      option.value = r;

      option.textContent = r;

      select.appendChild(option);
    });
}



function cargarCamposEspeciales(){

  const contenedor =
    document.getElementById(
      'camposEspeciales'
    );


  contenedor.innerHTML = '';


  if(AREA === 'ATH'){

    contenedor.innerHTML = `

      <div class="campo">

        <label>
          VALOR HORA HOMBRE (VH)
        </label>

        <input
          type="number"
          step="0.01"
          min="0"
          id="vh"
          placeholder="Ej. 7.50"
        >

      </div>
    `;
  }


  if(AREA === 'GTH'){

    contenedor.innerHTML = `

      <div class="campo">

        <label>
          VH ACORDADO
        </label>

        <input
          type="text"
          value="${escapar(candidatoActual.vh)}"
          readonly
        >

      </div>
    `;
  }


  if(AREA === 'DOTACION'){

    contenedor.innerHTML = `

      <div class="campo">

        <label>
          FECHA PROGRAMACIÓN
        </label>

        <input
          type="date"
          id="fechaProgramacion"
        >

      </div>


      <div class="campo">

        <label>
          LUGAR DE ACREDITACIÓN
        </label>

        <input
          type="text"
          id="lugarAcreditacion"
          placeholder="Ej. Arequipa"
        >

      </div>
    `;
  }
}



function cerrarModal(){

  document.getElementById(
    'modal'
  ).classList.remove(
    'activo'
  );

  candidatoActual = null;
}



async function guardarGestion(){

  if(!candidatoActual)
    return;


  const resultado =
    document.getElementById(
      'resultado'
    ).value;


  const responsable =
    document.getElementById(
      'responsable'
    ).value.trim();


  const observacion =
    document.getElementById(
      'observacion'
    ).value.trim();


  if(!resultado){

    mostrarMensaje(
      'Seleccione un resultado.',
      'error'
    );

    return;
  }


  if(!responsable){

    mostrarMensaje(
      'Ingrese responsable.',
      'error'
    );

    return;
  }


  const datos = {

    accion:
      'actualizarEtapa',

    idCandidato:
      candidatoActual.idCandidato,

    area:
      AREA,

    resultado,
    responsable,
    observacion
  };


  if(AREA === 'ATH'){

    datos.vh =
      document.getElementById(
        'vh'
      )?.value || '';
  }


  if(AREA === 'DOTACION'){

    datos.fechaProgramacion =
      document.getElementById(
        'fechaProgramacion'
      )?.value || '';


    datos.lugarAcreditacion =
      document.getElementById(
        'lugarAcreditacion'
      )?.value || '';
  }


  const boton =
    document.getElementById(
      'btnGuardar'
    );


  boton.disabled = true;

  boton.textContent =
    'Guardando...';


  try{

    const respuesta =
      await fetch(
        API,
        {
          method:'POST',
          body:
            JSON.stringify(datos)
        }
      );


    const respuestaJson =
      await respuesta.json();


    if(!respuestaJson.ok){

      throw new Error(
        respuestaJson.mensaje
      );
    }


    cerrarModal();


    mostrarMensaje(
      respuestaJson.mensaje,
      'ok'
    );


    await cargarCandidatos();


  }catch(error){

    mostrarMensaje(
      error.message,
      'error'
    );


  }finally{

    boton.disabled = false;

    boton.textContent =
      'Guardar';
  }
}



function mostrarMensaje(
  texto,
  tipo
){

  const m =
    document.getElementById(
      'mensaje'
    );


  m.className =
    'mensaje ' +
    tipo;


  m.textContent =
    texto;


  setTimeout(
    () => {

      m.className =
        'mensaje';

    },
    5000
  );
}



function escapar(v){

  return String(
    v ?? ''
  )

  .replaceAll('&','&amp;')
  .replaceAll('<','&lt;')
  .replaceAll('>','&gt;')
  .replaceAll('"','&quot;')
  .replaceAll("'",'&#039;');
}



function escaparJS(v){

  return String(
    v ?? ''
  )

  .replaceAll(
    '\\',
    '\\\\'
  )

  .replaceAll(
    "'",
    "\\'"
  );
}
