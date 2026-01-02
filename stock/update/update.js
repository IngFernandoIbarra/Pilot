async function main() {
    try {

        //Traer datos de DB

        let data = await fetchDataJson('get_data.php');

        let jsonStatus = data.jsonStatus;
        let bid = data.bid;
        let inv = data.inv;

        let result = await jsonStatus;

        console.log(jsonStatus);
        console.log(inv);
        console.log(bid);
        console.log(result);

        let state = await fetchDataJson('json/status.json');
        let filter = await fetchDataJson('json/filters.json');

        let filterDataM2041;
        let filterDataM2042;
        let filterData;
        let answer;

        //Actualizacion del mismo BID

        if (result.data.owner_branch_code === bid) {

            filter.data.filters[0].value = inv;
            filter.header.access_token = getToken(bid);
            filterData = await fetchGetDataPilot(stockListURL, filter);

            result.data.id = filterData.result.entitydata[0].id;
            result.header.access_token = getToken(bid);

            document.getElementById('info').textContent = "Actualizando unidad: " + result.data.integration_reference_code;

            answer = "Actualizacion de la unidad: " + result.data.integration_reference_code;

            document.getElementById('data-2').innerHTML = answer;

            sendData(stockUpdateURL, result, 'log.php');

        }

        //Traspasos

        if (result.data.owner_branch_code !== bid) {

            //Patria a Americas

            if (result.data.owner_branch_code === "M2041" && bid === "M2095") {

                filter.data.filters[0].value = inv;
                filter.header.access_token = getToken(bid);
                filterData = await fetchGetDataPilot(stockListURL, filter);

                result.data.id = filterData.result.entitydata[0].id;
                result.data.availability_status_code = "1";
                result.data.status_code = "I";
                result.data.owner_branch_code = "M2041";
                result.header.access_token = getToken(bid);
                console.log(result);

                document.getElementById('info').textContent = "Traspaso unidad: " + result.data.integration_reference_code;

                answer = "Traspaso de la unidad: " + result.data.integration_reference_code + " De Patria a Americas";

                document.getElementById('data-2').innerHTML = answer;

                sendData(stockUpdateURL, result, 'log.php');

            }

            //Americas a Patria

            if (result.data.owner_branch_code === "M2095" && bid === "M2041") {

                filter.data.filters[0].value = inv;
                filter.header.access_token = getToken(bid);
                filterData = await fetchGetDataPilot(stockListURL, filter);

                result.data.id = filterData.result.entitydata[0].id;
                result.data.availability_status_code = "1";
                result.data.status_code = "I";
                result.data.owner_branch_code = "M2095";
                result.header.access_token = getToken(bid);
                console.log(result);

                document.getElementById('info').textContent = "Traspaso unidad: " + result.data.integration_reference_code;

                answer = "Traspaso de la unidad: " + result.data.integration_reference_code + " De Americas a Patria";

                document.getElementById('data-2').innerHTML = answer;

                sendData(stockUpdateURL, result, 'log.php');
            }

             //Agua Azul a Americas

            if (result.data.owner_branch_code === "M2041" && bid === "M2142") {

                filter.data.filters[0].value = inv;
                filter.header.access_token = getToken(bid);
                filterData = await fetchGetDataPilot(stockListURL, filter);

                result.data.id = filterData.result.entitydata[0].id;
                result.data.availability_status_code = "1";
                result.data.status_code = "I";
                result.data.owner_branch_code = "M2142";
                result.header.access_token = getToken(bid);
                console.log(result);

                document.getElementById('info').textContent = "Traspaso unidad: " + result.data.integration_reference_code;

                answer = "Traspaso de la unidad: " + result.data.integration_reference_code + " De Agua Azul a Americas";

                document.getElementById('data-2').innerHTML = answer;

                sendData(stockUpdateURL, result, 'log.php');

            }

            //Americas a Agua Azul

            if (result.data.owner_branch_code === "M2142" && bid === "M2041") {

                filter.data.filters[0].value = inv;
                filter.header.access_token = getToken(bid);
                filterData = await fetchGetDataPilot(stockListURL, filter);

                result.data.id = filterData.result.entitydata[0].id;
                result.data.availability_status_code = "1";
                result.data.status_code = "I";
                result.data.owner_branch_code = "M2142";
                result.header.access_token = getToken(bid);
                console.log(result);

                document.getElementById('info').textContent = "Traspaso unidad: " + result.data.integration_reference_code;

                answer = "Traspaso de la unidad: " + result.data.integration_reference_code + " De Americas a Agua Azul";

                document.getElementById('data-2').innerHTML = answer;

                sendData(stockUpdateURL, result, 'log.php');
            }

            //Zoo a Americas

            if (result.data.owner_branch_code === "M2041" && bid === "M2042") {

                //buscar ID por medio del filtro

                //Americas

                filter.data.filters[0].value = inv;
                filter.header.access_token = getToken("M2041");
                filterDataM2041 = await fetchGetDataPilot(stockListURL, filter);

                console.log(filterDataM2041);

                //Zoo
                filter.data.filters[0].value = inv;
                filter.header.access_token = getToken("M2042");
                filterDataM2042 = await fetchGetDataPilot(stockListURL, filter);

                console.log(filterDataM2042);

                //Actualizacion Americas

                state.data.id = filterDataM2041.result.entitydata[0].id;
                state.data.availability_status_code = "1";
                state.data.status_code = "I";
                state.data.owner_branch_code = "M2041"
                state.header.access_token = getToken("M2041");

                console.log(state);

                document.getElementById('info').textContent = "Traspaso unidad: " + result.data.integration_reference_code;

                answer = "Estado unidad: " + result.data.integration_reference_code + " En inventario y disponible en Americas";

                document.getElementById('data-2').innerHTML = answer;

                sendData(stockUpdateURL, state, 'log_state.php');

                //Actualizacion Zoo

                state.data.id = filterDataM2042.result.entitydata[0].id;
                state.data.availability_status_code = "0";
                state.data.status_code = "R";
                state.data.owner_branch_code = "M2042"
                state.header.access_token = getToken("M2042");

                console.log(state);

                answer = "Estado unidad: " + result.data.integration_reference_code + " Traspasada y no disponible en Zoo";

                document.getElementById('data-3').innerHTML = answer;

                sendData(stockUpdateURL, state, 'log_state.php');

            }

            //Americas a Zoo 

            if (result.data.owner_branch_code === "M2042" && bid === "M2041") {

                //buscar ID por medio del filtro

                //Americas

                filter.data.filters[0].value = inv;
                filter.header.access_token = getToken("M2041");
                filterDataM2041 = await fetchGetDataPilot(stockListURL, filter);

                console.log(filterDataM2041);

                //Zoo
                filter.data.filters[0].value = inv;
                filter.header.access_token = getToken("M2042");
                filterDataM2042 = await fetchGetDataPilot(stockListURL, filter);

                console.log(filterDataM2042);

                //Actualizacion en Americas

                state.data.id = filterDataM2041.result.entitydata[0].id;
                state.data.availability_status_code = "0";
                state.data.status_code = "R";
                state.data.owner_branch_code = "M2041"
                state.header.access_token = getToken("M2041");

                document.getElementById('info').textContent = "Traspaso unidad: " + result.data.integration_reference_code;

                answer = "Estado unidad: " + result.data.integration_reference_code + " Traspasada y no disponible en Americas";

                document.getElementById('data-2').innerHTML = answer;

                sendData(stockUpdateURL, state, 'log_state.php');

                //Creacion de la unidad en Zoo si no existe, si existe solo se actualiza el estado

                if (filterDataM2042.result && filterDataM2042.result.entitydata && filterDataM2042.result.entitydata.length > 0) {

                    //Actualizacion Zoo

                    state.data.id = filterDataM2042.result.entitydata[0].id;
                    state.data.availability_status_code = "1";
                    state.data.status_code = "I";
                    state.data.owner_branch_code = "M2042"
                    state.header.access_token = getToken("M2042");

                    answer = "Estado unidad: " + result.data.integration_reference_code + " En inventario y disponible en Zoo";

                    document.getElementById('data-3').innerHTML = answer;

                    sendData(stockUpdateURL, state, 'log_state.php');

                } else {

                    //Creacion Zoo

                    delete result.data.id;
                    result.data.integration_reference_code = result.data.integration_reference_code;
                    result.data.availability_status_code = "1";
                    result.data.status_code = "I";
                    result.data.owner_branch_code = "M2042"
                    result.header.access_token = getToken("M2042");
                    console.log(result);

                    answer = "Unidad Creada: " + result.data.integration_reference_code + " En inventario y disponible en Zoo";

                    document.getElementById('data-3').innerHTML = answer;


                    sendData(stockCreateURL, result, 'log_create.php');

                }

            }

            //Actualizacion de Aguascalientes a Americas 

            if (result.data.owner_branch_code === "M2041" && bid === "M2032") {

                filter.data.filters[0].value = inv;
                filter.header.access_token = getToken(bid);
                filterData = await fetchGetDataPilot(stockListURL, filter);

                state.data.id = filterData.result.entitydata[0].id;
                state.data.availability_status_code = "0";
                state.data.status_code = "E";
                state.data.owner_branch_code = "M2032";
                state.header.access_token = getToken("M2032");

                document.getElementById('info').textContent = "Traspaso unidad: " + result.data.integration_reference_code;

                answer = "Traspaso de la unidad: " + result.data.integration_reference_code + " De Aguascaliente a Americas";

                document.getElementById('data-2').innerHTML = answer;

                sendData(stockUpdateURL, state, 'log_state.php');

            }

            //Actualizacion de Americas a Aguascalientes

            if (result.data.owner_branch_code === "M2032" && bid === "M2041") {

                filter.data.filters[0].value = inv;
                filter.header.access_token = getToken(bid);
                filterData = await fetchGetDataPilot(stockListURL, filter);

                state.data.id = filterData.result.entitydata[0].id;
                state.data.availability_status_code = "0";
                state.data.status_code = "E";
                state.data.owner_branch_code = "M2041";
                state.header.access_token = getToken("M2041");

                document.getElementById('info').textContent = "Traspaso unidad: " + result.data.integration_reference_code;

                answer = "Traspaso de la unidad: " + result.data.integration_reference_code + " De Americas a Aguascalientes";

                document.getElementById('data-2').innerHTML = answer;

                sendData(stockUpdateURL, state, 'log_state.php');

            }

        }

        setTimeout(window.location.href = indexUrl, 5000);

    } catch (error) {

        console.log(error);

        setTimeout(window.location.href = indexUrl, 5000);
    }
}

setTimeout(main, 1000);

async function sendData(url, data, log) {

    let answer;
    let colorClass;

    const stockResult = await fetchGetDataPilot(url, data);
    console.log(stockResult);

    answer = "Actualizacion unidad: " + stockResult.result.status;

    colorClass = stockResult.result.status === "success" ? "success" : "error";

    document.getElementById('data-1').innerHTML = answer.replace(new RegExp(`("${stockResult.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

    stockInv = stockResult.result.entitydata.integration_reference_code;

    var jsonResult = [{
            nameFile: stockInv
        },
        {
            bid: stockResult.result.entitydata.owner_branch_code.code
        },
        {
            result: data
        },
        {
            stockResult: stockResult
        }
    ];

    const logResult = await fetchLogData(log, jsonResult);

}