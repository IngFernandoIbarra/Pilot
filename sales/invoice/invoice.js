async function processInvoice() {
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

        document.getElementById('info').textContent = "Facturando: " + inv;

        // Cambio de estatus de facturacion de orden

        //Json de solicitud
        const invoiceStatus = await fetchDataJson('json/invoice.json');
        invoiceStatus.data.id = id;
        invoiceStatus.header.access_token = getToken(bid);

        //Mandar cambio de estatus
        const invoiceStatusData = await fetchGetDataPilot(changeStatusURL, invoiceStatus);
        console.log(invoiceStatusData);

        answer = "Unidad facturada: " + invoiceStatusData.result.status;

        colorClass = invoiceStatusData.result.status === "success" ? "success" : "error";

        document.getElementById('data-1').innerHTML = answer.replace(new RegExp(`("${invoiceStatusData.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

        // Información de los datos de facturación de la unidad

        //Json de solicitud
        const invoice = await jsonStatus;
        invoice.data.id = idStock;
        //Formato UTC
        //invoice.data.customer_invoice_date = fullDate;
        invoice.data.customer_invoice_date = formatDate(invoice.data.customer_invoice_date);
        invoice.header.access_token = getToken(bid);

        //Mandar informacion de facturacion
        const invoiceData = await fetchGetDataPilot(invoiceURL, invoice);
        console.log(invoiceData);

        answer = "Informacion factura: " + invoiceData.result.status;

        colorClass = invoiceData.result.status === "success" ? "success" : "error";

        document.getElementById('data-2').innerHTML = answer.replace(new RegExp(`("${invoiceData.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

        //Comentarios unidad Facturada

        //Json de solicitud
        const invoiceComment = await jsonComment;
        invoiceComment.data.sale_id = id;
        invoiceComment.header.access_token = getToken(bid);

        //Mandar comentarios de facturacion
        const invoiceCommentData = await fetchGetDataPilot(commentURL, invoiceComment);
        console.log(invoiceCommentData);

        answer = "Comentarios facturacion: " + invoiceCommentData.result.status;

        colorClass = invoiceCommentData.result.status === "success" ? "success" : "error";

        document.getElementById('data-3').innerHTML = answer.replace(new RegExp(`("${invoiceCommentData.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

        // Cambiar el estado del vehículo igual al del DMS

        //Json de solicitud
        const vehicleState = await fetchDataJson('json/vehicle.json');
        vehicleState.data.id = idStock;
        vehicleState.data.status_code = "F";
        vehicleState.header.access_token = getToken(bid);

        //Cambiar estatus de la unidad
        const vehicleStateData = await fetchGetDataPilot(stockUpdateURL, vehicleState);
        console.log(vehicleStateData);

        answer = "Estado unidad facturada: " + vehicleStateData.result.status;

        colorClass = vehicleStateData.result.status === "success" ? "success" : "error";

        document.getElementById('data-4').innerHTML = answer.replace(new RegExp(`("${vehicleStateData.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

        // Nota informativa de la unidad del VIN asignado

        //Json de solicitud
        const stateComment = await fetchDataJson('json/comment.json');
        stateComment.data.sale_id = id;
        stateComment.data.comment = "Unidad Facturada";
        stateComment.header.access_token = getToken(bid);

        //Cambiar estatus de la unidad
        const stateCommentData = await fetchGetDataPilot(commentURL, stateComment);
        console.log(stateCommentData);

        answer = "Comentario estado unidad facturada: " + stateCommentData.result.status;

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
                invoiceStatus: invoiceStatus
            },
            {
                invoice: invoice
            },
            {
                invoiceComment: invoiceComment
            },
            {
                vehicleState: vehicleState
            },
            {
                stateComment: stateComment
            },
            {
                invoiceStatusData: invoiceStatusData
            },
            {
                invoiceData: invoiceData
            },
            {
                invoiceCommentData: invoiceCommentData
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

setTimeout(processInvoice, 1000);