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

const PROCESO_RESPONSABLE = {

  LEGAL:
    'LEGAL - VERIFICATIVA',

  ATH:
    'ATH - VALOR HORA',

  GTH:
    'GTH - FIRMA DE CONTRATO',

  DOTACION:
    'DOTACION - ACREDITACION'

};
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
 /* =====================================================
   NOMBRES DE KPI SEGÚN ÁREA
===================================================== */

if(AREA === 'LEGAL'){

  document.getElementById(
    'nombreKpiPendientes'
  ).textContent =
    'PENDIENTES EN MI ÁREA';


  document.getElementById(
    'nombreKpiObservados'
  ).textContent =
    'OBSERVADOS';


  document.getElementById(
    'nombreKpiTercero'
  ).textContent =
    'CONFORMES';


  document.getElementById(
    'nombreKpiCuarto'
  ).textContent =
    'NO APTOS';


  document.getElementById(
    'nombreKpiQuinto'
  ).textContent =
    'TOTAL GESTIONADOS';

}

 if(AREA === 'ATH'){

  document.getElementById(
    'nombreKpiPendientes'
  ).textContent =
    'PENDIENTES EN MI ÁREA';

  document.getElementById(
    'nombreKpiObservados'
  ).textContent =
    'OBSERVADOS EN PROCESO';

  document.getElementById(
    'nombreKpiTercero'
  ).textContent =
    'ENVIADOS A GTH';

  document.getElementById(
    'nombreKpiCuarto'
  ).textContent =
    'NO APTOS EN PROCESO';

  document.getElementById(
    'nombreKpiQuinto'
  ).textContent =
    'TOTAL GESTIONADOS ATH';

}

 if(AREA === 'GTH'){

  document.getElementById(
    'nombreKpiPendientes'
  ).textContent =
    'PENDIENTES EN GTH';

  document.getElementById(
    'nombreKpiObservados'
  ).textContent =
    'OBSERVADOS EN GTH';

  document.getElementById(
    'nombreKpiTercero'
  ).textContent =
    'CONTRATOS FIRMADOS';

  document.getElementById(
    'nombreKpiCuarto'
  ).textContent =
    'CONTRATOS POR VENCER';

  document.getElementById(
    'nombreKpiQuinto'
  ).textContent =
    'TOTAL GESTIONADOS GTH';

}

 
  const tituloDocumentos =
    document.getElementById(
      'tituloDocumentos'
    );


  if(tituloDocumentos){

    if(AREA === 'LEGAL'){

      tituloDocumentos.textContent =
        'DNI';

    }else if(AREA === 'OPERACIONES'){

      tituloDocumentos.textContent =
        'CV';

    }else if(
      AREA === 'ATH' ||
      AREA === 'GTH' ||
      AREA === 'DOTACION'
    ){

      tituloDocumentos.textContent =
        'CARPETA';

    }else{

      tituloDocumentos.textContent =
        'DOCUMENTOS';

    }

  }

const btnExportarExcel =
  document.getElementById(
    'btnExportarExcel'
  );


if(
  AREA === 'GTH' &&
  btnExportarExcel
){

  btnExportarExcel.style.display =
    'inline-flex';

}

 const tituloFinContrato =
  document.getElementById(
    'tituloFinContrato'
  );

if(
  AREA === 'GTH' &&
  tituloFinContrato
){

  tituloFinContrato.style.display =
    '';

}
await cargarCandidatos();

if(
  AREA === 'LEGAL' ||
  AREA === 'ATH' ||
  AREA === 'GTH'
){
  await cargarKPIsArea();
}
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

    /* =====================================================
       CANDIDATOS ACTUALMENTE PENDIENTES EN EL ÁREA
    ===================================================== */

    const respuestaPendientes =
      await fetch(
        API +
        '?accion=listarPendientesArea&area=' +
        encodeURIComponent(AREA) +
        '&t=' +
        Date.now()
      );


    const resultadoPendientes =
      await respuestaPendientes.json();


    if(!resultadoPendientes.ok){

      throw new Error(
        resultadoPendientes.mensaje
      );

    }


    let lista =
      (resultadoPendientes.candidatos || [])
        .map(c => ({
          ...c,
          gestionATH:
            'PENDIENTE'
        }));


    /* =====================================================
       ATH
       TAMBIÉN MOSTRAR LOS YA GESTIONADOS POR ATH
    ===================================================== */

    if(AREA === 'ATH'){

      const respuestaGestionados =
        await fetch(
          API +
          '?accion=listarGestionadosATH' +
          '&t=' +
          Date.now()
        );


      const resultadoGestionados =
        await respuestaGestionados.json();


      if(!resultadoGestionados.ok){

        throw new Error(
          resultadoGestionados.mensaje ||
          'No se pudieron cargar los candidatos gestionados por ATH.'
        );

      }


      const gestionados =
        (resultadoGestionados.candidatos || [])
          .map(c => ({
            ...c,
            gestionATH:
              'GESTIONADO'
          }));


      /*
       * Evitamos duplicados.
       *
       * Si por alguna razón un candidato
       * aparece en ambas listas,
       * prevalece el pendiente actual.
       */

      const idsExistentes =
        new Set(
          lista.map(
            c =>
              String(
                c.idCandidato
              )
          )
        );


      gestionados.forEach(
        candidato => {

          if(
            !idsExistentes.has(
              String(
                candidato.idCandidato
              )
            )
          ){

            lista.push(
              candidato
            );

          }

        }
      );

    }

/* =====================================================
   GTH
   TAMBIÉN MOSTRAR CONTRATOS YA FIRMADOS
===================================================== */

if(AREA === 'GTH'){

  const respuestaGestionadosGTH =
    await fetch(
      API +
      '?accion=listarGestionadosGTH' +
      '&t=' +
      Date.now()
    );


  const resultadoGestionadosGTH =
    await respuestaGestionadosGTH.json();


  if(!resultadoGestionadosGTH.ok){

    throw new Error(
      resultadoGestionadosGTH.mensaje ||
      'No se pudieron cargar los contratos gestionados por GTH.'
    );

  }


  const gestionadosGTH =
    (resultadoGestionadosGTH.candidatos || [])
      .map(c => ({
        ...c,
        gestionGTH:
          'GESTIONADO'
      }));


  /*
   * Marcamos los candidatos que actualmente
   * siguen pendientes en GTH.
   */

  lista =
    lista.map(c => ({
      ...c,
      gestionGTH:
        'PENDIENTE'
    }));


  /*
   * Evitar duplicados.
   *
   * Si aparece en pendientes y gestionados,
   * prevalece el pendiente actual.
   */

  const idsExistentesGTH =
    new Set(
      lista.map(
        c =>
          String(
            c.idCandidato
          )
      )
    );


  gestionadosGTH.forEach(
    candidato => {

      if(
        !idsExistentesGTH.has(
          String(
            candidato.idCandidato
          )
        )
      ){

        lista.push(
          candidato
        );

      }

    }
  );

}
    candidatos =
      lista;


    /*
     * Para LEGAL / otras áreas continúa
     * funcionando como antes.
     *
     * ATH luego obtiene sus indicadores
     * reales mediante cargarKPIsArea().
     */

    actualizarKPIs();


    if(!candidatos.length){

      tbody.innerHTML = `
        <tr>
          <td
            colspan="11"
            class="vacio"
          >
            No existen candidatos.
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


const estado =
  String(
    c.estadoGeneral || ''
  ).toUpperCase();


let claseFila =
  estado === 'OBSERVADO'
    ? 'fila-observada'
    : '';


/* =====================================================
   GTH - ALERTA DE VENCIMIENTO DE CONTRATO
===================================================== */

if(
  AREA === 'GTH' &&
  c.finContrato
){

  const partes =
    String(
      c.finContrato
    ).split('/');


  if(partes.length === 3){

    const fechaFin =
      new Date(
        Number(partes[2]),
        Number(partes[1]) - 1,
        Number(partes[0])
      );


    fechaFin.setHours(
      0, 0, 0, 0
    );


    const hoy =
      new Date();


    hoy.setHours(
      0, 0, 0, 0
    );


    const limite =
      new Date(hoy);


    limite.setDate(
      limite.getDate() + 30
    );


    if(fechaFin < hoy){

      claseFila =
        'fila-contrato-vencido';

    }else if(
      fechaFin <= limite
    ){

      claseFila =
        'fila-contrato-por-vencer';

    }

  }

}


let documentos = '-';


/* LEGAL → DNI */

if(
  AREA === 'LEGAL' &&
  c.archivoDni
){

  documentos = `

    <a
      href="${escapar(c.archivoDni)}"
      target="_blank"
      rel="noopener noreferrer"
      class="btn-carpeta"
      title="Ver DNI"
    >
      📄 Ver DNI
    </a>
  `;

}


/* ATH → CARPETA COMPLETA */

if(
  AREA === 'ATH' &&
  c.carpetaDrive
){

  documentos = `

    <a
      href="${escapar(c.carpetaDrive)}"
      target="_blank"
      rel="noopener noreferrer"
      class="btn-carpeta"
      title="Abrir carpeta del candidato"
    >
      📁 Abrir
    </a>
  `;

}


/* OPERACIONES → CV */

if(
  AREA === 'OPERACIONES' &&
  c.cv
){

  documentos = `

    <a
      href="${escapar(c.cv)}"
      target="_blank"
      rel="noopener noreferrer"
      class="btn-carpeta"
      title="Ver CV"
    >
      📄 Ver CV
    </a>
  `;

}


/* GTH → CARPETA COMPLETA */

if(
  AREA === 'GTH' &&
  c.carpetaDrive
){

  documentos = `

    <a
      href="${escapar(c.carpetaDrive)}"
      target="_blank"
      rel="noopener noreferrer"
      class="btn-carpeta"
      title="Abrir carpeta del candidato"
    >
      📁 Abrir
    </a>
  `;

}


/* DOTACIÓN → CARPETA COMPLETA */

if(
  AREA === 'DOTACION' &&
  c.carpetaDrive
){

  documentos = `

    <a
      href="${escapar(c.carpetaDrive)}"
      target="_blank"
      rel="noopener noreferrer"
      class="btn-carpeta"
      title="Abrir carpeta del candidato"
    >
      📁 Abrir
    </a>
  `;

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

${
  AREA === 'GTH'
    ? `
      <td>
        ${escapar(c.finContrato || '-')}
      </td>
    `
    : ''
}

<td>
  ${documentos}
</td>
<td>

  ${
    (
      AREA === 'ATH' &&
      c.gestionATH === 'GESTIONADO'
    ) ||
    (
      AREA === 'GTH' &&
      c.gestionGTH === 'GESTIONADO'
    )

      ? `

        <button
          class="btn btn-accion"
          onclick="
            abrirGestion(
              '${escaparJS(c.idCandidato)}'
            )
          "
        >
          ✏️ Editar
        </button>

      `

      : `

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

      `
  }

</td>
    </tr>
  `;
}

async function cargarKPIsArea(){

  try{

    const respuesta =
      await fetch(
        API +
        '?accion=obtenerKPIsArea' +
        '&area=' +
        encodeURIComponent(AREA) +
        '&t=' +
        Date.now()
      );


    const resultado =
      await respuesta.json();


    if(!resultado.ok){

      throw new Error(
        resultado.mensaje ||
        'No se pudieron cargar los indicadores.'
      );

    }


    const kpis =
      resultado.kpis || {};


    /* ==============================
       LEGAL
    ============================== */

    if(AREA === 'LEGAL'){

      document.getElementById(
        'kpiPendientes'
      ).textContent =
        kpis.pendientes || 0;


      document.getElementById(
        'kpiObservados'
      ).textContent =
        kpis.observados || 0;


      document.getElementById(
        'kpiContratados'
      ).textContent =
        kpis.conformes || 0;


      document.getElementById(
        'kpiHabilitados'
      ).textContent =
        kpis.noAptos || 0;


      document.getElementById(
        'kpiGestionados'
      ).textContent =
        kpis.gestionados || 0;

    }


    /* ==============================
       ATH
    ============================== */

    if(AREA === 'ATH'){

      document.getElementById(
        'kpiPendientes'
      ).textContent =
        kpis.pendientes || 0;


      document.getElementById(
        'kpiObservados'
      ).textContent =
        kpis.observados || 0;


      document.getElementById(
        'kpiContratados'
      ).textContent =
        kpis.conformes || 0;


      document.getElementById(
        'kpiHabilitados'
      ).textContent =
        kpis.noAptos || 0;


      document.getElementById(
        'kpiGestionados'
      ).textContent =
        kpis.gestionados || 0;

    }


    /* ==============================
       GTH
    ============================== */

    if(AREA === 'GTH'){

      document.getElementById(
        'kpiPendientes'
      ).textContent =
        kpis.pendientes || 0;


      document.getElementById(
        'kpiObservados'
      ).textContent =
        kpis.observados || 0;


      document.getElementById(
        'kpiContratados'
      ).textContent =
        kpis.contratosFirmados || 0;


      document.getElementById(
        'kpiHabilitados'
      ).textContent =
        kpis.contratosPorVencer || 0;


      document.getElementById(
        'kpiGestionados'
      ).textContent =
        kpis.gestionados || 0;

    }


  }catch(error){

    console.error(
      'Error cargando KPIs:',
      error
    );

  }

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


async function cargarResponsablesArea(
  responsableActual = ''
){

  const select =
    document.getElementById(
      'responsable'
    );


  if(!select)
    return;


  const proceso =
    PROCESO_RESPONSABLE[AREA];


  if(!proceso){

    select.innerHTML = `
      <option value="">
        No configurado
      </option>
    `;

    return;
  }


  select.innerHTML = `
    <option value="">
      Cargando responsables...
    </option>
  `;


  try{

    const respuesta =
      await fetch(
        API +
        '?accion=listarResponsables' +
        '&proceso=' +
        encodeURIComponent(proceso) +
        '&t=' +
        Date.now()
      );


    const resultado =
      await respuesta.json();


    if(!resultado.ok){

      throw new Error(
        resultado.mensaje ||
        'No se pudieron cargar los responsables.'
      );
    }


    const responsables =
      resultado.responsables || [];


    select.innerHTML = `
      <option value="">
        Seleccione...
      </option>
    `;


    responsables.forEach(
      nombre => {

        const option =
          document.createElement(
            'option'
          );

        option.value =
          nombre;

        option.textContent =
          nombre;

        select.appendChild(
          option
        );

      }
    );


    /*
     * Si el candidato estaba OBSERVADO,
     * conserva/preselecciona el responsable
     * anterior si sigue en la lista.
     */

    if(responsableActual){

      select.value =
        responsableActual;

    }


    if(!responsables.length){

      select.innerHTML = `
        <option value="">
          No existen responsables disponibles
        </option>
      `;

    }


  }catch(error){

    console.error(
      'Error cargando responsables:',
      error
    );


    select.innerHTML = `
      <option value="">
        Error al cargar responsables
      </option>
    `;

  }

}
async function abrirGestion(id){

 
  candidatoActual =
    candidatos.find(
      c =>
        c.idCandidato === id
    );


  if(!candidatoActual)
    return;
 const esEdicionATH =
  AREA === 'ATH' &&
  candidatoActual.gestionATH === 'GESTIONADO';
 const esEdicionGTH =
  AREA === 'GTH' &&
  candidatoActual.gestionGTH === 'GESTIONADO';

  document.getElementById(
    'modalNombre'
  ).textContent =
    candidatoActual.nombres;
 


document.getElementById(
  'modalDatos'
).innerHTML = `

  <div class="resumen-candidato">

    <div class="resumen-item">

      <span class="resumen-label">
        DNI
      </span>

      <strong class="resumen-valor">
        ${escapar(candidatoActual.dni)}
      </strong>

    </div>


    <div class="resumen-item">

      <span class="resumen-label">
        Cargo
      </span>

      <strong class="resumen-valor">
        ${escapar(candidatoActual.cargo)}
      </strong>

    </div>


    <div class="resumen-item">

      <span class="resumen-label">
        Unidad minera
      </span>

      <strong class="resumen-valor">
        ${escapar(candidatoActual.unidad)}
      </strong>

    </div>


    <div class="resumen-item">

      <span class="resumen-label">
        Tipo de contrato
      </span>

      <strong class="resumen-valor">
        ${escapar(candidatoActual.tipoContrato)}
      </strong>

    </div>


    <div class="resumen-item">

      <span class="resumen-label">
        Residencia
      </span>

      <strong class="resumen-valor">
        ${escapar(candidatoActual.residencia)}
      </strong>

    </div>

  </div>
`;


  cargarResultados();

if(
  esEdicionATH ||
  esEdicionGTH
){

  document.getElementById(
    'resultado'
  ).closest(
    '.campo'
  ).style.display =
    'none';

}else{

  document.getElementById(
    'resultado'
  ).closest(
    '.campo'
  ).style.display =
    '';

}
 
if(AREA === 'ATH'){

  await cargarDatosContratoATH();

}else{

  cargarCamposEspeciales();


  if(esEdicionGTH){

    const campos =
      document.getElementById(
        'camposContratoFirmado'
      );


    if(campos){

      campos.style.display =
        'block';

    }


    document.getElementById(
      'fechaFirmaContrato'
    ).value =
      convertirFechaInputATH(
        candidatoActual.fechaFirmaContrato || ''
      );


    document.getElementById(
      'inicioVigenciaContrato'
    ).value =
      convertirFechaInputATH(
        candidatoActual.inicioVigenciaContrato || ''
      );


    document.getElementById(
      'finContrato'
    ).value =
      convertirFechaInputATH(
        candidatoActual.finContrato || ''
      );


    calcularVigenciaContrato();

  }

}


await cargarResponsablesArea(
  candidatoActual
    .ultimoResponsableArea || ''
);
document.getElementById(
  'observacion'
).value =
  candidatoActual
    .ultimaObservacionArea || '';
const btnGuardar =
  document.getElementById(
    'btnGuardar'
  );


if(
  esEdicionATH ||
  esEdicionGTH
){

  btnGuardar.textContent =
    'Guardar cambios';

}else{

  btnGuardar.textContent =
    'Guardar';

}

document.getElementById(
  'modal'
).classList.add(
  'activo'
);

}


/* =====================================================
   ATH - DATOS PARA CONTRATO
===================================================== */

async function cargarDatosContratoATH(){

  const contenedor =
    document.getElementById(
      'camposEspeciales'
    );


  contenedor.innerHTML = `
    <div class="estado-carga">
      Cargando datos del candidato...
    </div>
  `;


  try{

    const respuesta =
      await fetch(
        API +
        '?accion=obtenerDatosContrato&idCandidato=' +
        encodeURIComponent(
          candidatoActual.idCandidato
        ) +
        '&t=' +
        Date.now()
      );


    const resultado =
      await respuesta.json();


    if(!resultado.ok){

      throw new Error(
        resultado.mensaje ||
        'No se pudieron cargar los datos para contrato.'
      );
    }


    const d =
      resultado.datos || {};


    contenedor.innerHTML = `

      <div class="bloque-ath">

        <div class="subtitulo-ath">
          Información proveniente del proceso
        </div>


        <div class="grid-ath">

          <div class="campo">

            <label>
              FECHA DE PARADA / FECHA OBJETIVO
            </label>

            <input
              type="text"
              value="${escapar(
                d.fechaParada || ''
              )}"
              readonly
            >

          </div>


          <div class="campo">

            <label>
              UNIDAD MINERA
            </label>

            <input
              type="text"
              value="${escapar(
                d.unidadMinera || ''
              )}"
              readonly
            >

          </div>


          <div class="campo">

            <label>
              CARGO EN QUE CLASIFICA
            </label>

            <input
              type="text"
              value="${escapar(
                d.cargoClasifica || ''
              )}"
              readonly
            >

          </div>


          <div class="campo">

            <label>
              APROBADO POR
            </label>

            <input
              type="text"
              value="${escapar(
                d.aprobadoPor || ''
              )}"
              readonly
            >

          </div>


          <div class="campo">

            <label>
              PRETENSIÓN INDICADA EN ENTREVISTA
            </label>

            <input
              type="text"
              value="${escapar(
                construirPretensionATH(d)
              )}"
              readonly
            >

          </div>


          <div class="campo">

            <label>
              DISPONIBILIDAD INDICADA
            </label>

            <input
              type="text"
              value="${escapar(
                d.disponibilidadEntrevista || ''
              )}"
              readonly
            >

          </div>

        </div>

      </div>


      <div class="bloque-ath">

        <div class="subtitulo-ath">
          Acuerdo con el candidato
        </div>


        <div class="grid-ath">

          <div class="campo">

            <label>
              TIPO DE REMUNERACIÓN ACORDADA *
            </label>

            <select
              id="tipoRemuneracionAcordada"
              onchange="actualizarLabelMontoATH()"
            >

              <option value="">
                Seleccione...
              </option>

              <option value="VALOR HORA">
                Valor Hora / HH
              </option>

              <option value="MENSUAL">
                Sueldo mensual
              </option>

            </select>

          </div>


          <div class="campo">

            <label id="labelMontoATH">
              MONTO ACORDADO *
            </label>

            <input
              type="number"
              id="montoAcordado"
              min="0"
              step="0.01"
              placeholder="Ingrese monto"
            >

          </div>


          <div class="campo">

            <label>
              FECHA DE INICIO ACORDADA *
            </label>

            <input
              type="date"
              id="fechaInicioAcordada"
            >

          </div>

        </div>

      </div>


      <div class="bloque-ath">

        <div class="subtitulo-ath">
          Datos para contrato
        </div>


        <div class="grid-ath">

          ${campoATH(
            'FECHA DE ENVÍO PARA CONTRATO',
            'fechaEnvioContrato',
            'date',
            d.fechaEnvioContrato
          )}

          ${campoATH(
            'FECHA DE CADUCIDAD DNI',
            'fechaCaducidad',
            'date',
            d.fechaCaducidad
          )}

<div class="campo">

  <label>
    FECHA DE NACIMIENTO
  </label>

  <input
    type="date"
    id="fechaNacimiento"
    value="${escapar(
      convertirFechaInputATH(
        d.fechaNacimiento || ''
      )
    )}"
    onchange="calcularEdadATH()"
  >

</div>


<div class="campo">

  <label>
    EDAD
  </label>

  <input
    type="number"
    id="edad"
    value="${escapar(
      d.edad || ''
    )}"
    readonly
  >

</div>

          ${campoATH(
            'CELULAR 2',
            'celular2',
            'text',
            d.celular2
          )}

          ${campoATH(
            'CORREO ELECTRÓNICO',
            'correo',
            'email',
            d.correo
          )}

          ${campoATH(
            'DIRECCIÓN',
            'direccion',
            'text',
            d.direccion
          )}

          ${campoATH(
            'DISTRITO',
            'distrito',
            'text',
            d.distrito
          )}

          ${campoATH(
            'PROVINCIA',
            'provincia',
            'text',
            d.provincia
          )}

          ${campoATH(
            'DEPARTAMENTO',
            'departamento',
            'text',
            d.departamento
          )}

          ${campoATH(
            'PROFESIÓN / CARRERA TÉCNICA',
            'profesion',
            'text',
            d.profesion
          )}

          ${campoATH(
            'INSTITUTO / UNIVERSIDAD',
            'instituto',
            'text',
            d.instituto
          )}

          ${campoATH(
            'AÑO DE EGRESO',
            'anioEgreso',
            'number',
            d.anioEgreso
          )}

          ${campoATH(
            'PASAPORTE',
            'pasaporte',
            'text',
            d.pasaporte
          )}

          ${campoATH(
            'PESO (KG)',
            'peso',
            'number',
            d.peso
          )}

         ${campoATH(
           'TALLA (CM)',
           'talla',
           'number',
           d.talla,
           '1'
         )}

         ${selectATH(
           'UNIFORME',
           'uniforme',
           [
             'XS',
             'S',
             'M',
             'L',
             'XL',
             'XXL',
             'XXXL'
           ],
           d.uniforme
         )}

     ${selectATH(
       'ZAPATOS',
       'zapatos',
       [
         '35',
         '36',
         '37',
         '38',
         '39',
         '40',
         '41',
         '42',
         '43',
         '44',
         '45',
         '46'
       ],
       d.zapatos
     )}

        </div>


        <div class="campo">

          <label>
            MENSAJE DE CONFIRMACIÓN
          </label>

          <textarea
            id="mensajeConfirmacion"
          >${escapar(
            d.mensajeConfirmacion || ''
          )}</textarea>

        </div>


        <div class="campo">

          <label>
            COMENTARIO
          </label>

          <textarea
            id="comentarioContrato"
          >${escapar(
            d.comentario || ''
          )}</textarea>

        </div>

      </div>
    `;


    const tipo =
      document.getElementById(
        'tipoRemuneracionAcordada'
      );


    tipo.value =
      d.tipoRemuneracionAcordada || '';


    document.getElementById(
      'montoAcordado'
    ).value =
      d.montoAcordado || '';


    document.getElementById(
      'fechaInicioAcordada'
    ).value =
      convertirFechaInputATH(
        d.fechaInicioAcordada || ''
      );


    actualizarLabelMontoATH();
    calcularEdadATH();


  }catch(error){

    contenedor.innerHTML = `
      <div class="mensaje error">
        ${escapar(error.message)}
      </div>
    `;

  }

}

function calcularEdadATH(){

  const fecha =
    document.getElementById(
      'fechaNacimiento'
    )?.value;


  const campoEdad =
    document.getElementById(
      'edad'
    );


  if(
    !fecha ||
    !campoEdad
  ){

    return;
  }


  const nacimiento =
    new Date(
      fecha + 'T00:00:00'
    );


  const hoy =
    new Date();


  let edad =
    hoy.getFullYear() -
    nacimiento.getFullYear();


  const mes =
    hoy.getMonth() -
    nacimiento.getMonth();


  if(
    mes < 0 ||
    (
      mes === 0 &&
      hoy.getDate() <
      nacimiento.getDate()
    )
  ){

    edad--;

  }


  campoEdad.value =
    edad >= 0
      ? edad
      : '';

}
function construirPretensionATH(d){

  const tipo =
    String(
      d.pretensionTipo || ''
    ).trim();

  const monto =
    d.pretensionMonto;


  if(!tipo && !monto)
    return 'No registrada';


  if(
    monto !== '' &&
    monto !== null &&
    monto !== undefined
  ){

    return (
      tipo +
      ' - S/ ' +
      monto
    );

  }


  return tipo;
}


function campoATH(
  label,
  id,
  tipo,
  valor,
  step = ''
){

  return `

    <div class="campo">

      <label>
        ${escapar(label)}
      </label>

      <input
        type="${tipo}"
        id="${id}"
        value="${escapar(
          convertirFechaInputATH(
            valor || ''
          )
        )}"
        ${step ? `step="${step}"` : ''}
      >

    </div>
  `;

}

function selectATH(
  label,
  id,
  opciones,
  valorActual
){

  const opcionesHtml =
    opciones
      .map(opcion => {

        const seleccionado =
          String(opcion) ===
          String(valorActual || '')
            ? 'selected'
            : '';


        return `
          <option
            value="${escapar(opcion)}"
            ${seleccionado}
          >
            ${escapar(opcion)}
          </option>
        `;

      })
      .join('');


  return `

    <div class="campo">

      <label>
        ${escapar(label)}
      </label>

      <select id="${id}">

        <option value="">
          Seleccione...
        </option>

        ${opcionesHtml}

      </select>

    </div>
  `;

}
function convertirFechaInputATH(fecha){

  if(!fecha)
    return '';


  const texto =
    String(fecha);


  if(
    /^\d{4}-\d{2}-\d{2}$/.test(
      texto
    )
  ){

    return texto;

  }


  const partes =
    texto.split('/');


  if(partes.length === 3){

    return (
      partes[2] +
      '-' +
      partes[1].padStart(2,'0') +
      '-' +
      partes[0].padStart(2,'0')
    );

  }


  return texto;
}


function actualizarLabelMontoATH(){

  const tipo =
    document.getElementById(
      'tipoRemuneracionAcordada'
    )?.value || '';


  const label =
    document.getElementById(
      'labelMontoATH'
    );


  if(!label)
    return;


  label.textContent =
    tipo === 'VALOR HORA'
      ? 'VALOR HORA ACORDADO (VH) *'
      : tipo === 'MENSUAL'
        ? 'SUELDO MENSUAL ACORDADO *'
        : 'MONTO ACORDADO *';

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


  /* GTH */

  if(AREA === 'GTH'){

    select.onchange =
      actualizarCamposContratoGTH;

  }

}


function cargarCamposEspeciales(){

  const contenedor =
    document.getElementById(
      'camposEspeciales'
    );


  contenedor.innerHTML = '';
if(AREA === 'GTH'){

  contenedor.innerHTML = `

    <div
      id="camposContratoFirmado"
      style="display:none;"
    >

      <div class="campo">

        <label>
          FECHA DE FIRMA *
        </label>

        <input
          type="date"
          id="fechaFirmaContrato"
        >

      </div>


      <div class="campo">

        <label>
          INICIO DE VIGENCIA *
        </label>

        <input
          type="date"
          id="inicioVigenciaContrato"
        >

      </div>


      <div class="campo">

        <label>
          FIN DE CONTRATO *
        </label>

        <input
          type="date"
          id="finContrato"
        >

      </div>


      <div class="campo">

        <label>
          VIGENCIA
        </label>

        <input
          type="text"
          id="vigenciaContrato"
          readonly
          placeholder="Se calculará automáticamente"
        >

      </div>

    </div>

  `;


  document
    .getElementById(
      'inicioVigenciaContrato'
    )
    .addEventListener(
      'change',
      calcularVigenciaContrato
    );


  document
    .getElementById(
      'finContrato'
    )
    .addEventListener(
      'change',
      calcularVigenciaContrato
    );


  return;

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

function actualizarCamposContratoGTH(){

  const resultado =
    document.getElementById(
      'resultado'
    ).value;


  const campos =
    document.getElementById(
      'camposContratoFirmado'
    );


  if(!campos){
    return;
  }


  campos.style.display =
    resultado === 'FIRMADO 100%'
      ? 'block'
      : 'none';

}
function calcularVigenciaContrato(){

  const inicio =
    document.getElementById(
      'inicioVigenciaContrato'
    ).value;

  const fin =
    document.getElementById(
      'finContrato'
    ).value;

  const campo =
    document.getElementById(
      'vigenciaContrato'
    );


  if(
    !inicio ||
    !fin
  ){

    campo.value = '';
    return;

  }


  const fechaInicio =
    new Date(
      inicio + 'T00:00:00'
    );

  const fechaFin =
    new Date(
      fin + 'T00:00:00'
    );


  const diferencia =
    Math.floor(
      (
        fechaFin -
        fechaInicio
      ) /
      86400000
    );


  if(diferencia < 0){

    campo.value =
      'Fecha inválida';

    return;

  }


  campo.value =
    diferencia + 1 + ' días';

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


  const esEdicionATH =
    AREA === 'ATH' &&
    candidatoActual.gestionATH === 'GESTIONADO';
    const esEdicionGTH =
  AREA === 'GTH' &&
  candidatoActual.gestionGTH === 'GESTIONADO';

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


  /* =====================================================
     VALIDACIONES GENERALES

     En edición ATH:
     - NO pedimos resultado
     - NO pedimos nuevamente responsable
  ===================================================== */

if(
  !esEdicionATH &&
  !esEdicionGTH &&
  !resultado
){

    mostrarMensaje(
      'Seleccione un resultado.',
      'error'
    );

    return;
  }

if(
  !esEdicionATH &&
  !esEdicionGTH &&
  !responsable
){
    mostrarMensaje(
      'Seleccione un responsable.',
      'error'
    );

    return;
  }


  /* =====================================================
     DATOS DE LA GESTIÓN DE ETAPA
  ===================================================== */

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


  /* =====================================================
   GTH - FECHAS DEL CONTRATO
===================================================== */

if(AREA === 'GTH'){

  const fechaFirmaContrato =
    document.getElementById(
      'fechaFirmaContrato'
    )?.value || '';


  const inicioVigenciaContrato =
    document.getElementById(
      'inicioVigenciaContrato'
    )?.value || '';


  const finContrato =
    document.getElementById(
      'finContrato'
    )?.value || '';


if(
  resultado === 'FIRMADO 100%' ||
  esEdicionGTH
){

    if(!fechaFirmaContrato){

      mostrarMensaje(
        'Ingrese la fecha de firma del contrato.',
        'error'
      );

      return;

    }


    if(!inicioVigenciaContrato){

      mostrarMensaje(
        'Ingrese la fecha de inicio de vigencia.',
        'error'
      );

      return;

    }


    if(!finContrato){

      mostrarMensaje(
        'Ingrese la fecha de fin del contrato.',
        'error'
      );

      return;

    }


    if(
      new Date(finContrato + 'T00:00:00') <
      new Date(inicioVigenciaContrato + 'T00:00:00')
    ){

      mostrarMensaje(
        'La fecha de fin del contrato no puede ser anterior al inicio de vigencia.',
        'error'
      );

      return;

    }

  }


  datos.fechaFirmaContrato =
    fechaFirmaContrato;

  datos.inicioVigenciaContrato =
    inicioVigenciaContrato;

  datos.finContrato =
    finContrato;

}

  /* =====================================================
     ATH
  ===================================================== */

  if(AREA === 'ATH'){

    const tipoRemuneracion =
      document.getElementById(
        'tipoRemuneracionAcordada'
      )?.value || '';


    const montoAcordado =
      document.getElementById(
        'montoAcordado'
      )?.value || '';


    const fechaInicioAcordada =
      document.getElementById(
        'fechaInicioAcordada'
      )?.value || '';


    /*
     * Cuando:
     *
     * 1. se está cerrando ATH por primera vez
     * 2. O se está editando un ATH ya cerrado
     *
     * estos datos deben ser válidos.
     */

    if(
      resultado === 'CERRADO' ||
      esEdicionATH
    ){

      if(!tipoRemuneracion){

        mostrarMensaje(
          'Seleccione el tipo de remuneración acordada.',
          'error'
        );

        return;

      }


      if(
        !montoAcordado ||
        Number(montoAcordado) <= 0
      ){

        mostrarMensaje(
          'Ingrese un monto acordado válido.',
          'error'
        );

        return;

      }


      if(!fechaInicioAcordada){

        mostrarMensaje(
          'Ingrese la fecha de inicio acordada.',
          'error'
        );

        return;

      }

    }


    datos.tipoRemuneracionAcordada =
      tipoRemuneracion;


    datos.montoAcordado =
      montoAcordado;


    datos.fechaInicioAcordada =
      fechaInicioAcordada;


    datos.vh =
      tipoRemuneracion === 'VALOR HORA'
        ? montoAcordado
        : '';

  }


  /* =====================================================
     DOTACIÓN
  ===================================================== */

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
  (
    esEdicionATH ||
    esEdicionGTH
  )
    ? 'Guardando cambios...'
    : 'Guardando...';

  try{


    /* =====================================================
       GUARDAR DATOS PARA CONTRATO - ATH

       Se ejecuta:
       - al cerrar
       - al observar
       - al editar un registro ya gestionado
    ===================================================== */

    if(
      AREA === 'ATH' &&
      (
        resultado === 'CERRADO' ||
        resultado === 'OBSERVADO' ||
        esEdicionATH
      )
    ){

      /*
       * En modo edición el select de responsable
       * puede estar vacío.
       *
       * Conservamos el responsable que tenía
       * anteriormente el registro.
       */

      const responsableContrato =
        esEdicionATH
          ? (
              responsable ||
              candidatoActual.responsableATH ||
              candidatoActual.ultimoResponsableArea ||
              ''
            )
          : responsable;


      const datosContrato = {

        accion:
          'guardarDatosContrato',

        idCandidato:
          candidatoActual.idCandidato,


        tipoRemuneracionAcordada:
          document.getElementById(
            'tipoRemuneracionAcordada'
          )?.value || '',


        montoAcordado:
          document.getElementById(
            'montoAcordado'
          )?.value || '',


        fechaInicioAcordada:
          document.getElementById(
            'fechaInicioAcordada'
          )?.value || '',


        fechaEnvioContrato:
          document.getElementById(
            'fechaEnvioContrato'
          )?.value || '',


        responsable:
          responsableContrato,


        fechaCaducidad:
          document.getElementById(
            'fechaCaducidad'
          )?.value || '',


        edad:
          document.getElementById(
            'edad'
          )?.value || '',


        celular2:
          document.getElementById(
            'celular2'
          )?.value || '',


        fechaNacimiento:
          document.getElementById(
            'fechaNacimiento'
          )?.value || '',


        correo:
          document.getElementById(
            'correo'
          )?.value.trim() || '',


        direccion:
          document.getElementById(
            'direccion'
          )?.value.trim() || '',


        distrito:
          document.getElementById(
            'distrito'
          )?.value.trim() || '',


        provincia:
          document.getElementById(
            'provincia'
          )?.value.trim() || '',


        departamento:
          document.getElementById(
            'departamento'
          )?.value.trim() || '',


        profesion:
          document.getElementById(
            'profesion'
          )?.value.trim() || '',


        instituto:
          document.getElementById(
            'instituto'
          )?.value.trim() || '',


        anioEgreso:
          document.getElementById(
            'anioEgreso'
          )?.value || '',


        mensajeConfirmacion:
          document.getElementById(
            'mensajeConfirmacion'
          )?.value.trim() || '',


        pasaporte:
          document.getElementById(
            'pasaporte'
          )?.value.trim() || '',


        peso:
          document.getElementById(
            'peso'
          )?.value || '',


        talla:
          document.getElementById(
            'talla'
          )?.value || '',


        uniforme:
          document.getElementById(
            'uniforme'
          )?.value.trim() || '',


        zapatos:
          document.getElementById(
            'zapatos'
          )?.value.trim() || '',


        comentario:
          document.getElementById(
            'comentarioContrato'
          )?.value.trim() || ''

      };


      const respuestaContrato =
        await fetch(
          API,
          {
            method:
              'POST',

            headers:{
              'Content-Type':
                'text/plain;charset=utf-8'
            },

            body:
              JSON.stringify(
                datosContrato
              )
          }
        );


      const contratoJson =
        await respuestaContrato.json();


      if(!contratoJson.ok){

        throw new Error(
          contratoJson.mensaje ||
          'No se pudieron guardar los datos para contrato.'
        );

      }


      /* =================================================
         EDICIÓN DE UN ATH YA GESTIONADO

         AQUÍ TERMINAMOS.

         NO:
         - actualizarEtapa
         - cambiar área
         - crear seguimiento
         - volver a enviar a GTH
      ================================================= */

      if(esEdicionATH){

        cerrarModal();


        mostrarMensaje(
          'Datos actualizados correctamente.',
          'ok'
        );


        await cargarCandidatos();

        await cargarKPIsArea();


        return;

      }

    }
/* =====================================================
   EDICIÓN DE CONTRATO YA FIRMADO - GTH
===================================================== */

if(esEdicionGTH){

  const respuestaEdicionGTH =
    await fetch(
      API,
      {
        method:
          'POST',

        headers:{
          'Content-Type':
            'text/plain;charset=utf-8'
        },

        body:
          JSON.stringify({
            accion:
              'actualizarFechasContrato',

            idCandidato:
              candidatoActual.idCandidato,

            fechaFirmaContrato:
              datos.fechaFirmaContrato,

            inicioVigenciaContrato:
              datos.inicioVigenciaContrato,

            finContrato:
              datos.finContrato
          })
      }
    );


  const resultadoEdicionGTH =
    await respuestaEdicionGTH.json();


  if(!resultadoEdicionGTH.ok){

    throw new Error(
      resultadoEdicionGTH.mensaje ||
      'No se pudieron actualizar las fechas del contrato.'
    );

  }


  cerrarModal();


  mostrarMensaje(
    'Contrato actualizado correctamente.',
    'ok'
  );


  await cargarCandidatos();

  await cargarKPIsArea();


  return;

}

    /* =====================================================
       GESTIÓN NORMAL

       Solo llegamos aquí cuando NO estamos
       editando un ATH ya gestionado.
    ===================================================== */

    const respuesta =
      await fetch(
        API,
        {
          method:
            'POST',

          body:
            JSON.stringify(
              datos
            )
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


if(
  AREA === 'LEGAL' ||
  AREA === 'ATH' ||
  AREA === 'GTH'
){

  await cargarKPIsArea();

}

  }catch(error){

    console.error(
      error
    );


    mostrarMensaje(
      error.message,
      'error'
    );


  }finally{

    boton.disabled =
      false;


    /*
     * cerrarModal() pone candidatoActual = null,
     * por eso aquí no volvemos a consultar
     * esEdicionATH desde candidatoActual.
     */

boton.textContent =
  (
    esEdicionATH ||
    esEdicionGTH
  )
    ? 'Guardar cambios'
    : 'Guardar';

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
/* =====================================================
   GTH - EXPORTAR CONSOLIDADO EXCEL
===================================================== */

async function exportarExcelGTH(){

  if(AREA !== 'GTH')
    return;


  const boton =
    document.getElementById(
      'btnExportarExcel'
    );


  const textoOriginal =
    boton?.textContent ||
    '↓ Exportar Excel';


  if(boton){

    boton.disabled = true;

    boton.textContent =
      'Generando Excel...';

  }


  try{

    /*
     * Verificar que SheetJS
     * esté correctamente cargado.
     */

    if(typeof XLSX === 'undefined'){

      throw new Error(
        'No se pudo cargar el generador de Excel.'
      );

    }


    const respuesta =
      await fetch(
        API +
        '?accion=exportarDatosContrato&t=' +
        Date.now()
      );


    const resultado =
      await respuesta.json();


    if(!resultado.ok){

      throw new Error(
        resultado.mensaje ||
        'No se pudo obtener el consolidado.'
      );

    }


    const filas =
      resultado.datos || [];


    if(!filas.length){

      throw new Error(
        'No existen datos para exportar.'
      );

    }


    /*
     * 40 columnas del consolidado.
     * No se incluyen:
     *
     * ID CANDIDATO
     * ID REQUERIMIENTO
     *
     * Tampoco se exporta el VH
     * solicitado en entrevista.
     */

    const encabezados = [

      'FECHA DE PARADA',
      'UNIDAD MINERA',
      'FECHA DE ENVÍO PARA CONTRATO',
      'RESPONSABLE',
      'APELLIDOS Y NOMBRES',
      'DNI',
      'FECHA DE CADUCIDAD',
      'EDAD',
      'CELULAR 1',
      'CELULAR 2',
      'FECHA DE NACIMIENTO',
      'CORREO ELECTRÓNICO',
      'DIRECCIÓN',
      'DISTRITO',
      'PROVINCIA',
      'DEPARTAMENTO',
      'PROFESIÓN / CARRERA TÉCNICA',
      'GRADO ACADÉMICO',
      'INSTITUTO / UNIVERSIDAD',
      'AÑO DE EGRESO',
      'EXPERIENCIA',
      'CARGO AL QUE CLASIFICA',
      'APROBADO POR',
      'TIPO REMUNERACIÓN ACORDADA',
      'MONTO ACORDADO',
      'MENSAJE DE CONFIRMACIÓN',
      'PASAPORTE',
      'VERIFICATIVA',
      'ESTADO DE CONTRATO',
      'PESO',
      'TALLA',
      'IMC',
      'UNIFORME',
      'ZAPATOS',
      'COMENTARIO',
      'FECHA DE INICIO ACORDADA',
      'FECHA ÚLTIMA ACTUALIZACIÓN',
      'FECHA DE FIRMA DE CONTRATO',
      'INICIO DE VIGENCIA',
      'FIN DE CONTRATO'

    ];


    const datosExcel = [
      encabezados,
      ...filas
    ];


    /*
     * Crear hoja Excel.
     */

    const hoja =
      XLSX.utils.aoa_to_sheet(
        datosExcel
      );


/*
 * Autofiltro para las 40 columnas.
 *
 * A → AN = 40 columnas
 */

hoja['!autofilter'] = {
  ref:
    'A1:AN' +
    datosExcel.length
};


    /*
     * Ancho de cada columna.
     */

    hoja['!cols'] = [

      { wch: 16 }, // Fecha parada
      { wch: 22 }, // Unidad minera
      { wch: 24 }, // Fecha envío contrato
      { wch: 24 }, // Responsable
      { wch: 38 }, // Apellidos y nombres
      { wch: 13 }, // DNI
      { wch: 18 }, // Caducidad
      { wch: 8  }, // Edad
      { wch: 14 }, // Celular 1
      { wch: 14 }, // Celular 2
      { wch: 18 }, // Nacimiento
      { wch: 32 }, // Correo
      { wch: 38 }, // Dirección
      { wch: 20 }, // Distrito
      { wch: 20 }, // Provincia
      { wch: 20 }, // Departamento
      { wch: 34 }, // Profesión
      { wch: 22 }, // Grado académico
      { wch: 34 }, // Instituto
      { wch: 16 }, // Año egreso
      { wch: 32 }, // Experiencia
      { wch: 30 }, // Cargo
      { wch: 26 }, // Aprobado por
      { wch: 30 }, // Tipo remuneración
      { wch: 18 }, // Monto
      { wch: 38 }, // Mensaje confirmación
      { wch: 16 }, // Pasaporte
      { wch: 20 }, // Verificativa
      { wch: 22 }, // Estado contrato
      { wch: 12 }, // Peso
      { wch: 12 }, // Talla
      { wch: 10 }, // IMC
      { wch: 12 }, // Uniforme
      { wch: 12 }, // Zapatos
      { wch: 40 }, // Comentario
      { wch: 24 }, // Fecha inicio acordada
      { wch: 26 }, // Última actualización
      { wch: 22 }, // Fecha firma contrato
      { wch: 22 }, // Inicio vigencia
      { wch: 22 }  // Fin contrato

    ];


    /*
     * Altura del encabezado.
     */

    hoja['!rows'] = [
      {
        hpt: 32
      }
    ];


    /*
     * Crear libro Excel.
     */

    const libro =
      XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
      libro,
      hoja,
      'CONTRATACIÓN'
    );


    /*
     * Propiedades del archivo.
     */

    libro.Props = {

      Title:
        'Consolidado de Contratación',

      Subject:
        'Gestión de contratación DIMARZA',

      Author:
        'DIMARZA',

      Company:
        'DIMARZA'

    };


    /*
     * Generar fecha para nombre
     * del archivo.
     */

    const hoy =
      new Date();


    const fecha =
      String(
        hoy.getFullYear()
      ) +
      String(
        hoy.getMonth() + 1
      ).padStart(2,'0') +
      String(
        hoy.getDate()
      ).padStart(2,'0');


    /*
     * Descargar XLSX real.
     */

    XLSX.writeFile(
      libro,
      'CONSOLIDADO_CONTRATACION_' +
      fecha +
      '.xlsx'
    );


    mostrarMensaje(
      'Excel generado correctamente.',
      'ok'
    );


  }catch(error){

    console.error(error);


    mostrarMensaje(
      error.message ||
      'Error al generar el Excel.',
      'error'
    );


  }finally{

    if(boton){

      boton.disabled = false;

      boton.textContent =
        textoOriginal;

    }

  }

}
