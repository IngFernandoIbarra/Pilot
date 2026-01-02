async function main() {
    try {

        //Traer datos de DB

        let data = await fetchDataJson('get_data.php');
        let filter = await fetchDataJson('json/filters.json');

        let jsonStatus = data.jsonStatus;
        let bid = data.bid;
        let inv = data.inv;

        let result = await jsonStatus;

        let stockInv;
        let answer;
        let colorClass;

        document.getElementById('info').textContent = "Estado unidad: " + inv;

        filter.data.filters[0].value = inv;
        filter.header.access_token = getToken(bid);
        filterData = await fetchGetDataPilot(stockListURL, filter);

        console.log(filterData);

        if (filterData.result && filterData.result.entitydata && filterData.result.entitydata.length > 0) {

            result.data.id = filterData.result.entitydata[0].id;
            result.header.access_token = getToken(bid);

            const stockResult = await fetchGetDataPilot(stockUpdateURL, result);
            console.log(stockResult);

            answer = "Estado unidad: " + stockResult.result.status;

            colorClass = stockResult.result.status === "success" ? "success" : "error";

            document.getElementById('data-1').innerHTML = answer.replace(new RegExp(`("${stockResult.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

            stockInv = stockResult.result.entitydata.integration_reference_code;

            var jsonResult = [{
                    nameFile: stockInv
                },
                {
                    bid: bid
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

        } else {

            document.getElementById('data-2').innerHTML = "Unidad no encontrada para actualizar";

            setTimeout(window.location.href = indexUrl, 5000);

        }

    } catch (error) {

        document.getElementById('data-2').innerHTML = "Error: " + error;

        setTimeout(window.location.href = indexUrl, 5000);
    }
}

setTimeout(main, 1000);