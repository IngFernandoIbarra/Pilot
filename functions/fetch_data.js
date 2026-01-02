//Saber que token usar segun el BID
function getToken(bid) {
  let token;

  if (bid == "M2041" || bid == "M2095" || bid == "M2142") {
    token = globalTokenCM;
  } else if (bid == "M2042") {
    token = globalTokenZoo;
  } else if (bid == "M2032") {
    token = globalTokenAgs;
  } else if (bid == "M2105") {
    token = globalTokenLG;
  } else if (bid == "M2112") {
    token = globalTokenQro;
  }

  return token;
}

//Funcion que trae datos de la BD en formato de texto
function fetchGetData(url) {
  return fetch(url)
    .then((response) => response.text())
    .then((data) => data.trim());
}

//Funcion que exporta json's
function fetchDataJson(url) {
  return fetch(url).then((response) => response.json());
}

//Funcion que trae datos de pilot
function fetchGetDataPilot(url, data) {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-type": "text/json",
      Cookie: "PHPSESSID=9tk2vt9q85nkngfteftlh67d7v",
    },
    body: JSON.stringify(data),
  }).then((response) => response.json());
}

//Funcion que recibe response de pilot y lo manda al servidor local
function fetchLogData(url, data) {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/json",
    },
    body: JSON.stringify(data),
  });
}

//Funcion que da formato UTC como lo requiere PILOT
function formatDate(dateString) {
  const [day, month, year] = dateString.split("-");
  return `${year}-${month}-${day}`;
}

//Funcion que regresa un true si el formato del RFC esta correcto con o sin guiones
function formatRFC(rfc) {
  // Expresión regular para validar RFC de personas físicas
  const regexPersonaFisica = /^[A-Z]{3,4}-\d{6}-[A-Z\d]{3}$/;
  // Expresión regular para validar RFC de personas morales

  const regexPersonaMoral = /^[A-Z&]{3,4}\d{6}[A-Z\d]{3}$/;

  // Verificar si el RFC coincide con alguno de los formatos
  if (regexPersonaFisica.test(rfc) || regexPersonaMoral.test(rfc)) {
    return true;
  } else {
    return false;
  }
}

// Crear un nuevo objeto de fecha
let currentDate = new Date();

// Obtener el año, mes y día
let year = currentDate.getFullYear();
let mounth = currentDate.getMonth() + 1; // Los meses en JavaScript se cuentan desde 0, así que se suma 1
let day = currentDate.getDate();

// Obtener la fecha completa en formato YYYY-MM-DD
let fullDate =
  year +
  "-" +
  (mounth < 10 ? "0" : "") +
  mounth +
  "-" +
  (day < 10 ? "0" : "") +
  day;

//Funcion que regresa un true si el formato del RFC esta correcto con o sin guiones
function removeHyphens(rfc) {
  
  var newRfc = rfc.replace(/[-\s]/g, "");

  return newRfc;
}
