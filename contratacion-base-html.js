document.getElementById(
  'contenidoBase'
).innerHTML = `

<main class="contenedor">


  <div
    id="mensaje"
    class="mensaje"
  ></div>


  <section class="kpis">

    <div class="kpi">

<div
  class="kpi-nombre"
  id="nombreKpiPendientes"
>
  PENDIENTES EN MI ÁREA
</div>

      <div
        class="kpi-valor"
        id="kpiPendientes"
      >
        0
      </div>

    </div>


    <div class="kpi">

<div
  class="kpi-nombre"
  id="nombreKpiObservados"
>
  OBSERVADOS
</div>

      <div
        class="kpi-valor"
        id="kpiObservados"
      >
        0
      </div>

    </div>


    <div class="kpi">

<div
  class="kpi-nombre"
  id="nombreKpiTercero"
>
  CONTRATADOS
</div>

      <div
        class="kpi-valor"
        id="kpiContratados"
      >
        0
      </div>

    </div>


    <div class="kpi">

<div
  class="kpi-nombre"
  id="nombreKpiCuarto"
>
  HABILITADOS
</div>

      <div
        class="kpi-valor"
        id="kpiHabilitados"
      >
        0
      </div>

    </div>

  </section>


  <section class="card">

<div class="cabecera-tabla">

  <div class="titulo">
    Candidatos pendientes
  </div>

  <button
    type="button"
    class="btn btn-exportar"
    id="btnExportarExcel"
    onclick="exportarExcelGTH()"
    style="display:none;"
  >
    ↓ Exportar Excel
  </button>

</div>


    <div class="tabla">

      <table>

        <thead>

          <tr>

            <th>ID</th>
            <th>NOMBRE</th>
            <th>DNI</th>
            <th>TELÉFONO</th>
            <th>RESIDENCIA</th>
            <th>CARGO</th>
            <th>UNIDAD</th>
            <th>TIPO DE CONTRATO</th>
            <th>FECHA OBJETIVO</th>
            <th id="tituloDocumentos">
  DOCUMENTOS
</th>
            <th>ACCIÓN</th>

          </tr>

        </thead>


        <tbody
          id="tablaCandidatos"
        ></tbody>

      </table>

    </div>

  </section>

</main>


<div
  class="modal"
  id="modal"
>

  <div class="modal-contenido">


    <div class="modal-cabecera">

      <div>

        <div class="titulo">
          Gestionar candidato
        </div>

        <strong
          id="modalNombre"
        ></strong>

      </div>


      <div
        class="cerrar"
        onclick="cerrarModal()"
      >
        ×
      </div>

    </div>


    <div
      id="modalDatos"
    ></div>


    <hr>


    <div class="campo">

      <label>
        RESULTADO *
      </label>

      <select
        id="resultado"
      ></select>

    </div>


    <div
      id="camposEspeciales"
    ></div>


<div class="campo">

  <label>
    RESPONSABLE *
  </label>

  <select
    id="responsable"
  >

    <option value="">
      Cargando responsables...
    </option>

  </select>

</div>


    <div class="campo">

      <label>
        OBSERVACIÓN
      </label>

      <textarea
        id="observacion"
      ></textarea>

    </div>


    <div class="acciones">

      <button
        class="btn btn-cancelar"
        onclick="cerrarModal()"
      >
        Cancelar
      </button>


      <button
        class="btn btn-guardar"
        id="btnGuardar"
        onclick="guardarGestion()"
      >
        Guardar
      </button>

    </div>

  </div>

</div>
`;
