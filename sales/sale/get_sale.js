let comment;
let sale;
let customer;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const numberRegex = /^\d+$/;
const textRegex = /^[A-Za-z]+$/;
let answer;
let colorClass;

async function processSalesData() {

    try {

        // Realizar operaciones con los datos de la venta

        //Traer datos de DB

        const data = await fetchDataJson('get_data.php');

        const idPilot = data.id;
        const bid = data.bid;

        document.getElementById('info').textContent = "Venta: " + bid;

        //Json de solicitud
        const result = await fetchDataJson('json/get_sale.json');
        result.data.id = idPilot;
        result.header.access_token = getToken(bid);

        // Obtener datos de la venta
        const saleResult = await fetchGetDataPilot(saleURL, result);
        console.log(saleResult);

        answer = "Venta: " + saleResult.result.status;

        colorClass = saleResult.result.status === "success" ? "success" : "error";

        document.getElementById('data-1').innerHTML = answer.replace(new RegExp(`("${saleResult.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

        // Realizar operaciones con el cliente
        const customerData = await fetchDataJson('json/customer.json');
        customerData.data.id = saleResult.result.entitydata.customer.id;
        customerData.header.access_token = getToken(bid);

        // Obtener datos del cliente
        const customerResult = await fetchGetDataPilot(customerURL, customerData);
        console.log(customerResult);

        answer = "Cliente: " + customerResult.result.status;

        colorClass = customerResult.result.status === "success" ? "success" : "error";

        document.getElementById('data-2').innerHTML = answer.replace(new RegExp(`("${customerResult.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

        //Numero de vendedor
        customerResult.result.entitydata.sale_representative = saleResult.result.entitydata.sale_representative.integration_reference_code;

        //Precio de venta
        customerResult.result.entitydata.payment = saleResult.result.entitydata.payment_methods.cash_amt;

        //Si los campos obligatorios estan bien se cargan los archivos en el servidor local

        customer = customerResult.result.entitydata;
        sale = saleResult.result.entitydata;

        if (sale.vehicle !== null &&
            sale.sale_representative.integration_reference_code !== "" &&
            //customer.spouse.national_document.number !== null &&
            //String(customer.spouse.national_document.number).length === 5 &&
            customer.name !== null &&
            customer.tax_identification !== null &&
            formatRFC(customer.tax_identification) === true &&
            customer.tax_identification !== "XAXX-010101-000" &&
            customer.tax_identification !== "XAXX010101000" &&
            customer.email !== null &&
            emailRegex.test(customer.email) === true &&
            customer.address.postal_code !== null &&
            String(customer.address.postal_code).length === 5 &&
            numberRegex.test(customer.address.postal_code) === true &&
            customer.phone !== null &&
            String(customer.phone.replace(/\s+/g, '')).length === 10 &&
            numberRegex.test(customer.phone.replace(/\s+/g, '')) === true &&
            customer.cellphone !== null &&
            String(customer.cellphone).length === 10 &&
            numberRegex.test(customer.cellphone) === true &&
            customer.birthday !== null &&
            customer.tax_situation.code !== null &&
            customer.address.street !== null &&
            customer.address.door_number !== null &&
            sale.payment_methods.cash_amt !== 0.00 &&
            sale.payment_methods.cash_amt > 300000.00
        ) {

            // Realizar operaciones con el vehículo
            const stockData = await fetchDataJson('json/stock.json');
            stockData.data.id = saleResult.result.entitydata.vehicle.id;
            stockData.header.access_token = getToken(bid);

            // Obtener datos del vehiculo
            const stockResult = await fetchGetDataPilot(stockURL, stockData);
            console.log(stockResult);

            answer = "Unidad: " + stockResult.result.status;

            colorClass = stockResult.result.status === "success" ? "success" : "error";

            document.getElementById('data-3').innerHTML = answer.replace(new RegExp(`("${stockResult.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

            // Nota informativa para el asesor de ventas

            //Json de solicitud
            const Comment = await fetchDataJson('json/comment.json');
            Comment.data.sale_id = idPilot;
            Comment.data.comment = "Continuar proceso en SICOM buscando la unidad por VIN (" + stockResult.result.entitydata.vin + ") o Inventario (" + stockResult.result.entitydata.integration_reference_code + ")";
            Comment.header.access_token = getToken(bid);

            //Mandar comentario a PILOT
            const CommentData = await fetchGetDataPilot(commentURL, Comment);
            console.log(CommentData);

            answer = "Comentario Asesor: " + CommentData.result.status;

            colorClass = CommentData.result.status === "success" ? "success" : "error";

            document.getElementById('data-4').innerHTML = answer.replace(new RegExp(`("${CommentData.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

            //Concatenar todos los log de PILOT

            let jsonSale = [{
                    nameFile: stockResult.result.entitydata.integration_reference_code
                },
                {
                    bid: bid
                },
                {
                    saleResult: saleResult
                },
                {
                    stockResult: stockResult
                },
                {
                    customerResult: customerResult
                },
                {
                    CommentData: CommentData
                },
                {
                    Comment: Comment
                }
            ];

            //Almacenar datos de la venta en log

            const logResultSale = await fetchLogData('_venta_pilot.php', jsonSale);

            //Almacenar datos del vehiculo en log

            const logResultStock = await fetchLogData('_unidad.php', stockResult);

            //Almacenar datos del cliente en log

            const logResultCustomer = await fetchLogData('_cliente.php', customerResult);

        } else {

            comment = "Revisar campo(s):";

            if (sale.vehicle === null) {
                comment += " Unidad no asignada a la venta, favor de asignar unidad, ";
            }

            if (sale.sale_representative.integration_reference_code === "") {
                comment += " El Agente No tiene Usuario SICOM asignado, ";
            }

            //if (customer.spouse.national_document.number === null) {
            //comment += " Favor de asignar numero de cliente, ";
            //}

            //if (String(customer.spouse.national_document.number.length) !== 5) {
            //comment += " El numero de cliente debe de tener 5 digitos, ";
            //}

            if (sale.payment_methods.cash_amt === 0.00) {
                comment += " Favor de asignar un precio de venta, ";
            }

            if (sale.payment_methods.cash_amt < 300000.00) {
                comment += " Precio de venta por debajo del costo de la unidad, favor de revisar, ";;
            }

            if (customer.name === null) {
                comment += " Campo nombre del cliente vacío,";
            }

            if (customer.tax_identification === null) {
                comment += " Campo Situacion Impositiva (RFC) vacío,";
            }

            if (formatRFC(customer.tax_identification) === false) {
                comment += " Situacion Impositiva (RFC) no cumple con el formato adecuado,";
            }

            if (customer.tax_identification === "XAXX-010101-000" || customer.tax_identification === "XAXX010101000") {
                comment += " Campo Situacion Impositiva (RFC) no puede ser generico,";
            }

            if (customer.email === null) {
                comment += " Campo email vacio,";
            }

            if (emailRegex.test(customer.email) == false) {
                comment += " Formato inválido para Email,";
            }

            if (customer.address.postal_code === null) {
                comment += " Campo código postal vacío,";
            }

            if (String(customer.address.postal_code).length !== 5 || numberRegex.test(customer.address.postal_code) === false) {
                comment += " El código postal es inválido,";
            }

            if (customer.phone === null) {
                comment += " Campo teléfono vacío,";

            } else {

                if (String(customer.phone.replace(/\s+/g, '')).length !== 10 || numberRegex.test(customer.phone.replace(/\s+/g, '')) === false) {
                    comment += " Numero de teléfono con formato incorrecto,";
                }
            }

            if (customer.cellphone === null) {
                comment += " Campo celular vacío,";

            } else {

                if (String(customer.cellphone.replace(/\s+/g, '')).length !== 10 || numberRegex.test(customer.cellphone.replace(/\s+/g, '')) === false) {
                    comment += " Numero de celular con formato incorrecto,";
                }
            }

            if (customer.birthday === null) {
                comment += " Campo fecha de nacimiento vacío,";
            }

            if (customer.tax_situation.code === null) {
                comment += " Regimen fiscal vacío,";
            }

            if (customer.address.street === null) {
                comment += " Campo calle vacio,";
            }

            if (customer.address.door_number === null) {
                comment += " Campo numero interior/exterior vacio,";
            }

            console.log(comment);

            // Obtener ID de la venta

            const errorData = await fetchDataJson('json/change_status.json');
            errorData.data.id = idPilot;
            errorData.header.access_token = getToken(bid);

            // Enviar error de integración
            const errorDataResult = await fetchGetDataPilot(changeStatusURL, errorData);
            console.log(errorDataResult);

            answer = "Error de integracion: " + errorDataResult.result.status;

            colorClass = errorDataResult.result.status === "success" ? "success" : "error";

            document.getElementById('data-3').innerHTML = answer.replace(new RegExp(`("${errorDataResult.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

            // Comentar el error de integración
            const errorComment = await fetchDataJson('json/comment.json');
            errorComment.data.sale_id = idPilot;
            errorComment.data.comment = comment;
            errorComment.header.access_token = getToken(bid);

            // Comentar el error de integración
            const errorCommentResult = await fetchGetDataPilot(commentURL, errorComment);
            console.log(errorCommentResult);

            answer = "Comentario error de integracion: " + errorCommentResult.result.status;

            colorClass = errorCommentResult.result.status === "success" ? "success" : "error";

            document.getElementById('data-4').innerHTML = answer.replace(new RegExp(`("${errorCommentResult.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

            //Concatenar todos los log de PILOT 
            let jsonError = [{
                    nameFile: idPilot
                },
                {
                    bid: bid
                },
                {
                    errorData: errorData
                },
                {
                    errorComment: errorComment
                },
                {
                    errorDataResult: errorDataResult
                },
                {
                    errorCommentResult: errorCommentResult
                }
            ];

            //Almacenar todos los log de PILOT 
            const logResult = await fetchLogData('log.php', jsonError);
        }

        window.location.href = indexUrl;

    } catch (error) {

        window.location.href = indexUrl;

    }
}

setTimeout(processSalesData, 1000);