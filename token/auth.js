//Americas, Patria & Agua azul
let globalTokenCM;

fetch(
  "https://api.pilotsolution.net/v1/users/auth.php?username=api.countrymotors@myworkplace.com.ar&password=PLK.hd217JF",
  {
    method: "GET",
  }
)
  .then((response) => response.json())
  .then((json) => {
    globalTokenCM = json.result.entitydata;
  })
  .catch((err) => {
    console.log("ERROR EN AUTENTICACION", err);
  });

//Zoo
let globalTokenZoo;

fetch(
  "https://api.pilotsolution.net/v1/users/auth.php?username=api.countryzoo@myworkplace.com.ar&password=FGR.2D4jk89",
  {
    method: "GET",
  }
)
  .then((response) => response.json())
  .then((json) => {
    globalTokenZoo = json.result.entitydata;
  })
  .catch((err) => {
    console.log("ERROR EN AUTENTICACION", err);
  });

//Aguascalientes
let globalTokenAgs;

fetch(
  "https://api.pilotsolution.net/v1/users/auth.php?username=api.countryaguascalientes@myworkplace.com.ar&password=Hak1Ef.44kfR",
  {
    method: "GET",
  }
)
  .then((response) => response.json())
  .then((json) => {
    globalTokenAgs = json.result.entitydata;
  })
  .catch((err) => {
    console.log("ERROR EN AUTENTICACION", err);
  });

//Linconln GDL
let globalTokenLG;

fetch(
  "https://api.pilotsolution.net/v1/users/auth.php?username=api.countryguadalajara@myworkplace.com.ar&password=FGT.34jm5RA7",
  {
    method: "GET",
  }
)
  .then((response) => response.json())
  .then((json) => {
    globalTokenLG = json.result.entitydata;
  })
  .catch((err) => {
    console.log("ERROR EN AUTENTICACION", err);
  });

//Queretaro
let globalTokenQro;

fetch(
  "https://api.pilotsolution.net/v1/users/auth.php?username=api.countryqueretaro.sicom@myworkplace.com.ar&password=ADRfse.426PF",
  {
    method: "GET",
  }
)
  .then((response) => response.json())
  .then((json) => {
    globalTokenQro = json.result.entitydata;
  })
  .catch((err) => {
    console.log("ERROR EN AUTENTICACION", err);
  });

//Desarrollo
let globalToken;

fetch(
  "https://api.pilotsolution.net/v1/users/auth.php?username=api.sicom@myworkplace.com.ar&password=5AFwBduX88",
  {
    method: "GET",
  }
)
  .then((response) => response.json())
  .then((json) => {
    globalToken = json.result.entitydata;
  })
  .catch((err) => {
    console.log("ERROR EN AUTENTICACION", err);
  });
