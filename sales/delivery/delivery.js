async function processDelivery() {
    try {

        //Traer datos de DB
        const data = await fetchDataJson('get_data.php');

        const jsonStatus = data.jsonStatus;
        const id = data.id;
        const inv = data.inv;
        const idStock = data.idStock;
        const bid = data.bid;
        const jsonComment = data.jsonComment;
        let answer;
        let colorClass;

        document.getElementById('info').textContent = "Entregando: " + inv;

        // Cambio de estatus de Entrega de la unidad

        //Json de solicitud
        const deliveryStatus = await fetchDataJson('json/delivery.json');
        deliveryStatus.data.id = id;
        deliveryStatus.header.access_token = getToken(bid);

        //Mandar cambio de estatus
        const deliveryStatusData = await fetchGetDataPilot(changeStatusURL, deliveryStatus);
        console.log(deliveryStatusData);

        answer = "Unidad entregada: " + deliveryStatusData.result.status;

        colorClass = deliveryStatusData.result.status === "success" ? "success" : "error";

        document.getElementById('data-1').innerHTML = answer.replace(new RegExp(`("${deliveryStatusData.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

        //Comentarios unidad Entregada

        //Json de solicitud
        const deliveryComment = await jsonComment;
        deliveryComment.data.sale_id = id;
        deliveryComment.header.access_token = getToken(bid);

        //Mandar comentarios de facturacion
        const deliveryCommentData = await fetchGetDataPilot(commentURL, deliveryComment);
        console.log(deliveryCommentData);

        answer = "Comentaios entregada: " + deliveryCommentData.result.status;

        colorClass = deliveryCommentData.result.status === "success" ? "success" : "error";

        document.getElementById('data-2').innerHTML = answer.replace(new RegExp(`("${deliveryCommentData.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

        // Información de la fecha de entrega de la unidad

        //Json de solicitud
        const delivery = await jsonStatus;
        delivery.data.id = idStock;
        //Formato UTC
        delivery.data.customer_delivery_date = formatDate(delivery.data.customer_delivery_date);
        delivery.header.access_token = getToken(bid);

        //Mandar informacion de la entrega
        const deliveryData = await fetchGetDataPilot(deliveryURL, delivery);
        console.log(deliveryData);

        answer = "Fecha entrega: " + deliveryData.result.status;

        colorClass = deliveryData.result.status === "success" ? "success" : "error";

        document.getElementById('data-3').innerHTML = answer.replace(new RegExp(`("${deliveryData.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

        // Cambiar el estado del vehículo igual al del DMS

        //Json de solicitud
        const vehicleState = await fetchDataJson('json/vehicle.json');
        vehicleState.data.id = idStock;
        vehicleState.data.status_code = "E";
        vehicleState.header.access_token = getToken(bid);

        //Cambiar estatus de la unidad
        const vehicleStateData = await fetchGetDataPilot(stockUpdateURL, vehicleState);
        console.log(vehicleStateData);

        answer = "Estado unidad entregada: " + vehicleStateData.result.status;

        colorClass = vehicleStateData.result.status === "success" ? "success" : "error";

        document.getElementById('data-4').innerHTML = answer.replace(new RegExp(`("${vehicleStateData.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

        // Nota informativa de la unidad del VIN asignado

        //Json de solicitud
        const stateComment = await fetchDataJson('json/comment.json');
        stateComment.data.sale_id = id;
        stateComment.data.comment = "Unidad Entregada";
        stateComment.header.access_token = getToken(bid);

        //Cambiar estatus de la unidad
        const stateCommentData = await fetchGetDataPilot(commentURL, stateComment);
        console.log(stateCommentData);

        answer = "Comentario estado unidad entregada: " + stateCommentData.result.status;

        colorClass = stateCommentData.result.status === "success" ? "success" : "error";

        document.getElementById('data-5').innerHTML = answer.replace(new RegExp(`("${stateCommentData.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

        //Concatenar todos los log de PILOT 

        var jsonResult = [{
                nameFile: inv
            },
            {
                bid: bid
            },
            {
                deliveryStatus: deliveryStatus
            },
            {
                deliveryComment: deliveryComment
            },
            {
                delivery: delivery
            },
            {
                vehicleState: vehicleState
            },
            {
                stateComment: stateComment
            },
            {
                deliveryStatusData: deliveryStatusData
            },
            {
                deliveryCommentData: deliveryCommentData
            },
            {
                deliveryData: deliveryData
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

        console.error('Ocurrió un error: ', error);

        window.location.href = indexUrl;
    }
}

setTimeout(processDelivery, 1000);