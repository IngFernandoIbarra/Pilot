async function main() {
    try {

        //Traer datos de DB

        const data = await fetchDataJson('get_data.php');
        const jsonStatus = data.jsonStatus;
        let filter = await fetchDataJson('json/filters.json');
        let answer;
        let colorClass;

        const result = await jsonStatus;
        result.header.access_token = getToken(result.data.owner_branch_code);

        document.getElementById('info').textContent = "Creando unidad: " + result.data.integration_reference_code;

        filter.data.filters[0].value = result.data.integration_reference_code;
        filter.header.access_token = getToken(result.data.owner_branch_code);
        filterData = await fetchGetDataPilot(stockListURL, filter);

        if (filterData.result && filterData.result.entitydata && filterData.result.entitydata.length > 0) {

            document.getElementById('data-2').innerHTML = "La unidad ya esta dada de alta";

            //Unidad existente

            setTimeout(window.location.href = indexUrl, 5000);

        } else {

            //Crear unidad

            const stockResult = await fetchGetDataPilot(stockCreateURL, result);
            console.log(stockResult);

            answer = "Unidad creada: " + stockResult.result.status;

            colorClass = stockResult.result.status === "success" ? "success" : "error";

            document.getElementById('data-1').innerHTML = answer.replace(new RegExp(`("${stockResult.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

            var jsonResult = [{
                    nameFile: stockResult.result.entitydata.integration_reference_code
                },
                {
                    bid: result.data.owner_branch_code
                },
                {
                    result: result
                },
                {
                    stockResult: stockResult
                }
            ];

            const logResult = await fetchLogData('log.php', jsonResult);

            setTimeout(window.location.href = indexUrl, 5000);
        }

    } catch (error) {

        setTimeout(window.location.href = indexUrl, 5000);
    }
}

setTimeout(main, 1000);