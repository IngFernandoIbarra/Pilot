async function processOrder() {
    try {

        //Traer datos de DB

        const data = await fetchDataJson('get_data.php');

        const jsonStatus = data.jsonStatus;
        const id = data.id;
        const inv = data.inv;
        const vin = data.vin;
        const idStock = data.idStock;
        const bid = data.bid;
        const jsonComment = data.jsonComment;
        let answer;
        let colorClass;

        document.getElementById('info').textContent = "Orden: " + inv;

        // Cambio de estatus de creación de orden

        //Json de solicitud
        const orderStatus = await fetchDataJson('json/order.json');
        orderStatus.data.id = id;
        orderStatus.header.access_token = getToken(bid);

        //Mandar cambio de estatus
        const orderStatusData = await fetchGetDataPilot(changeStatusURL, orderStatus);
        console.log(orderStatusData);

        answer = "Orden venta creada: " + orderStatusData.result.status;

        colorClass = orderStatusData.result.status === "success" ? "success" : "error";

        document.getElementById('data-1').innerHTML = answer.replace(new RegExp(`("${orderStatusData.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

        // Actualización de número de orden

        //Json de solicitud
        const orderNumber = await jsonStatus;
        orderNumber.data.id = id;
        orderNumber.header.access_token = getToken(bid);

        //Mandar numero de pedido
        const orderNumberData = await fetchGetDataPilot(saleUpdateURL, orderNumber);
        console.log(orderNumberData);

        answer = "Numero de orden de venta: " + orderNumberData.result.status;

        colorClass = orderNumberData.result.status === "success" ? "success" : "error";

        document.getElementById('data-2').innerHTML = answer.replace(new RegExp(`("${orderNumberData.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

        // Comentario de la creación de la orden de venta

        //Json de solicitud
        const orderComment = await jsonComment;
        orderComment.data.sale_id = id;
        orderComment.header.access_token = getToken(bid);

        //Mandar comentario de pedido
        const orderCommentData = await fetchGetDataPilot(commentURL, orderComment);
        console.log(orderCommentData);

        answer = "Comentario orden de venta: " + orderCommentData.result.status;

        colorClass = orderCommentData.result.status === "success" ? "success" : "error";

        document.getElementById('data-3').innerHTML = answer.replace(new RegExp(`("${orderCommentData.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

        // Cambiar el estatus del vehículo

        //Json de solicitud
        const vehicleStatus = await fetchDataJson('json/unidad_asignada.json');
        vehicleStatus.data.id = id;
        vehicleStatus.header.access_token = getToken(bid);

        //Cambiar estatus de la unidad
        const vehicleStatusData = await fetchGetDataPilot(changeStatusURL, vehicleStatus);
        console.log(vehicleStatusData);

        answer = "Unidad asignada: " + vehicleStatusData.result.status;

        colorClass = vehicleStatusData.result.status === "success" ? "success" : "error";

        document.getElementById('data-4').innerHTML = answer.replace(new RegExp(`("${vehicleStatusData.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

        // Nota informativa de la unidad del VIN asignado

        //Json de solicitud
        const vehicleComment = await fetchDataJson('json/comment.json');
        vehicleComment.data.sale_id = id;
        vehicleComment.data.comment = "Unidad asignada: Numero de serie - " + vin;
        vehicleComment.header.access_token = getToken(bid);

        //Cambiar estatus de la unidad
        const vehicleCommentData = await fetchGetDataPilot(commentURL, vehicleComment);
        console.log(vehicleCommentData);

        answer = "Comentario unidad asignada: " + vehicleCommentData.result.status;

        colorClass = vehicleCommentData.result.status === "success" ? "success" : "error";

        document.getElementById('data-5').innerHTML = answer.replace(new RegExp(`("${vehicleCommentData.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

        // Cambiar el estado del vehículo igual al del DMS

        //Json de solicitud
        const vehicleState = await fetchDataJson('json/vehicle.json');
        vehicleState.data.id = idStock;
        vehicleState.data.status_code = "P";
        vehicleState.header.access_token = getToken(bid);

        console.log(vehicleState);

        //Cambiar estatus de la unidad
        const vehicleStateData = await fetchGetDataPilot(stockUpdateURL, vehicleState);
        console.log(vehicleStateData);

        answer = "Estado unidad pedida: " + vehicleStateData.result.status;

        colorClass = vehicleStateData.result.status === "success" ? "success" : "error";

        document.getElementById('data-6').innerHTML = answer.replace(new RegExp(`("${vehicleStateData.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

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

        document.getElementById('data-7').innerHTML = answer.replace(new RegExp(`("${stateCommentData.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

        //Concatenar todos los log de PILOT 
        var jsonResult = [{
                nameFile: inv
            },
            {
                bid: bid
            },
            {
                orderStatus: orderStatus
            },
            {
                orderNumber: orderNumber
            },
            {
                orderComment: orderComment
            },
            {
                vehicleStatus: vehicleStatus
            },
            {
                vehicleComment: vehicleComment
            },
            {
                vehicleState: vehicleState
            },
            {
                stateComment: stateComment
            },
            {
                orderStatusData: orderStatusData
            },
            {
                orderNumberData: orderNumberData
            },
            {
                orderCommentData: orderCommentData
            },
            {
                vehicleStatusData: vehicleStatusData
            },
            {
                vehicleCommentData: vehicleCommentData
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

setTimeout(processOrder, 1000);