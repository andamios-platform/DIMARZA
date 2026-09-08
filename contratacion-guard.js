(function () {

  const CLAVE_ROL =
    'dimarzaRolContratacion';

  const rol =
    String(
      sessionStorage.getItem(CLAVE_ROL) || ''
    )
      .trim()
      .toUpperCase();

  const permitidos =
    String(
      document.body.dataset.permitidos || ''
    )
      .split(',')
      .map(x => x.trim().toUpperCase())
      .filter(Boolean);


  if (
    !rol ||
    !permitidos.includes(rol)
  ) {

    alert(
      'No tiene autorización para acceder a esta sección.'
    );

    window.location.replace(
      'contratacion.html'
    );

    return;
  }

})();
