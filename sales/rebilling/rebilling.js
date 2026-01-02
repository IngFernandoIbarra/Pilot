async function processRebilling() {
    try {

        //Traer datos de DB

        const data = await fetchDataJson('get_data.php');

        const jsonStatus = data.jsonStatus;
        const id = data.id;
        const inv = data.inv;
        const idStock = data.idStock;
        const bid = data.bid;
        let answer;
        let colorClass;

        document.getElementById('info').textContent = "Cancelando: " + inv;

        // Cambio de estatus a unidad asignada

        //Json de solicitud
        const rebillingStatus = await fetchDataJson('json/rebilling.json');
        rebillingStatus.data.id = id;
        rebillingStatus.header.access_token = getToken(bid);

        //Mandar cambio de estatus
        const rebillingStatusData = await fetchGetDataPilot(changeStatusURL, rebillingStatus);
        console.log(rebillingStatusData);

        answer = "Unidad asignada: " + rebillingStatusData.result.status;

        colorClass = rebillingStatusData.result.status === "success" ? "success" : "error";

        document.getElementById('data-1').innerHTML = answer.replace(new RegExp(`("${rebillingStatusData.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

        //Comentarios unidad asignada

        //Json de solicitud
        const rebillingComment = await jsonStatus;
        rebillingComment.data.sale_id = id;
        rebillingComment.data.comment = "Cancelacion de la factura con fecha: " + fullDate + ", para la correccion de datos";
        rebillingComment.header.access_token = getToken(bid);

        //Mandar comentarios de nota de credito
        const rebillingCommentData = await fetchGetDataPilot(commentURL, rebillingComment);
        console.log(rebillingCommentData);

        answer = "Comentario unidad asignada: " + rebillingCommentData.result.status;

        colorClass = rebillingCommentData.result.status === "success" ? "success" : "error";

        document.getElementById('data-2').innerHTML = answer.replace(new RegExp(`("${rebillingCommentData.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

        // Cambiar el estado del vehículo igual al del DMS

        //Json de solicitud
        const vehicleState = await fetchDataJson('json/vehicle.json');
        vehicleState.data.id = idStock;
        vehicleState.data.status_code = "P";
        vehicleState.header.access_token = getToken(bid);

        //Cambiar estatus de la unidad
        const vehicleStateData = await fetchGetDataPilot(stockUpdateURL, vehicleState);
        console.log(vehicleStateData);

        answer = "Estado unidad pedida: " + vehicleStateData.result.status;

        colorClass = vehicleStateData.result.status === "success" ? "success" : "error";

        document.getElementById('data-3').innerHTML = answer.replace(new RegExp(`("${vehicleStateData.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

        // Nota informativa de la unidad del VIN asignado

        //Json de solicitud
        const stateComment = await fetchDataJson('json/comment.json');
        stateComment.data.sale_id = id;
        stateComment.data.comment = "Unidad Pedida";
        stateComment.header.access_token = getToken(bid);

        //Cambiar estatus de la unidad
        const stateCommentData = await fetchGetDataPilot(commentURL, stateComment);
        console.log(stateCommentData);

        answer = "Comentario estado unidad pedida: " + stateCommentData.result.status;

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
                rebillingStatus: rebillingStatus
            },
            {
                rebillingComment: rebillingComment
            },
            {
                vehicleState: vehicleState
            },
            {
                stateComment: stateComment
            },
            {
                rebillingStatusData: rebillingStatusData
            },
            {
                rebillingCommentData: rebillingCommentData
            },
            {
                vehicleStateData: vehicleStateData
            },
            {
                stateCommentData: stateCommentData
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

setTimeout(processRebilling, 1000);