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


 const estado =
  String(
    c.estadoGeneral || ''
  ).toUpperCase();


const claseFila =
  estado === 'OBSERVADO'
  ? 'fila-observada'
  : '';


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

<td>
  ${documentos}
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



async function abrirGestion(id){

 
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


if(AREA === 'ATH'){

  await cargarDatosContratoATH();

}else{

  cargarCamposEspeciales();

}


document.getElementById(
  'responsable'
).value = '';


document.getElementById(
  'observacion'
).value =
  candidatoActual
    .ultimaObservacionArea || '';


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
}



function cargarCamposEspeciales(){

  const contenedor =
    document.getElementById(
      'camposEspeciales'
    );


  contenedor.innerHTML = '';




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


if(
  resultado === 'CERRADO'
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


/*
 * Estos datos se envían tanto si está
 * CERRADO como si queda OBSERVADO.
 */

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
    if(
  AREA === 'ATH' &&
  (
    resultado === 'CERRADO' ||
    resultado === 'OBSERVADO'
  )
){

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

    responsable,

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
        method:'POST',

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

}
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
