async function processRelease() {
    try {

        //Traer datos de DB

        const data = await fetchDataJson('get_data.php');

        const id = data.id;
        const inv = data.inv;
        const idStock = data.idStock;
        const bid = data.bid;
        const vin = data.vin;
        let answer;
        let colorClass;

        document.getElementById('info').textContent = "Anulando: " + inv;

        //Anular venta

        //Json de solicitud
        const cancelSaleStatus = await fetchDataJson('json/cancel.json');
        cancelSaleStatus.data.id = id;
        cancelSaleStatus.header.access_token = getToken(bid);

        //Mandar cambio de estatus
        const cancelSaleStatusData = await fetchGetDataPilot(changeStatusURL, cancelSaleStatus);
        console.log(cancelSaleStatusData);

        answer = "Anular venta: " + cancelSaleStatusData.result.status;

        colorClass = cancelSaleStatusData.result.status === "success" ? "success" : "error";

        document.getElementById('data-1').innerHTML = answer.replace(new RegExp(`("${cancelSaleStatusData.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

        //Nota Anular venta

        //Json de solicitud
        const cancelSaleComment = await fetchDataJson('json/comment.json');
        cancelSaleComment.data.sale_id = id;
        cancelSaleComment.data.comment = "Anulacion total de la venta, con fecha: " + fullDate;
        cancelSaleComment.header.access_token = getToken(bid);

        //Mandar cambio de estatus
        const cancelSaleCommentData = await fetchGetDataPilot(commentURL, cancelSaleComment);
        console.log(cancelSaleCommentData);

        answer = "Comentario anulacion venta: " + cancelSaleCommentData.result.status;

        colorClass = cancelSaleCommentData.result.status === "success" ? "success" : "error";

        document.getElementById('data-2').innerHTML = answer.replace(new RegExp(`("${cancelSaleCommentData.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

        // Cambiar el estado del vehículo igual al del DMS

        //Json de solicitud
        const vehicleState = await fetchDataJson('json/vehicle.json');
        vehicleState.data.id = idStock;
        vehicleState.data.status_code = "I";
        vehicleState.header.access_token = getToken(bid);

        //Cambiar estatus de la unidad
        const vehicleStateData = await fetchGetDataPilot(stockUpdateURL, vehicleState);
        console.log(vehicleStateData);

        answer = "Estado unidad inventario: " + vehicleStateData.result.status;

        colorClass = vehicleStateData.result.status === "success" ? "success" : "error";

        document.getElementById('data-3').innerHTML = answer.replace(new RegExp(`("${vehicleStateData.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

        // Nota informativa de la unidad del VIN asignado

        //Json de solicitud
        const stateComment = await fetchDataJson('json/comment.json');
        stateComment.data.sale_id = id;
        stateComment.data.comment = "Unidad en Inventario disponible";
        stateComment.header.access_token = getToken(bid);

        //Cambiar estatus de la unidad
        const stateCommentData = await fetchGetDataPilot(commentURL, stateComment);
        console.log(stateCommentData);

        answer = "Comentario estado unidad inventario: " + stateCommentData.result.status;

        colorClass = stateCommentData.result.status === "success" ? "success" : "error";

        document.getElementById('data-4').innerHTML = answer.replace(new RegExp(`("${stateCommentData.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

        //Concatenar todos los log de PILOT 

        var jsonResult = [{
                nameFile: inv
            },
            {
                bid: bid
            },
            {
                cancelSaleStatus: cancelSaleStatus
            },
            {
                cancelSaleComment: cancelSaleComment
            },
            {
                vehicleState: vehicleState
            },
            {
                stateComment: stateComment
            },
            {
                cancelSaleStatusData: cancelSaleStatusData
            },
            {
                cancelSaleCommentData: cancelSaleCommentData
            },
            {
                vehicleStateData: vehicleStateData
            },
            {
                stateCommentData: stateCommentData
            },
            {
                vin: vin
            }

        ];

        //Almacenar todos los log de PILOT 

        const logResult = await fetchLogData('log.php', jsonResult);

        window.location.href = indexUrl;

    } catch (error) {

        console.error('Ocurrió un error:', error);

        window.location.href = indexUrl;
    }
}

setTimeout(processRelease, 1000);