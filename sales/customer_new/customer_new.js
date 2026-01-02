let id_customer;
let nombre;

async function processChangeCustomer() {
    try {

        //Traer datos de DB

        const data = await fetchDataJson('get_data.php');

        const jsonStatus = data.jsonStatus;
        const id = data.id;
        const inv = data.inv;
        const bid = data.bid;
        let answer;
        let colorClass;

        document.getElementById('info').textContent = "Cliente nuevo: " + inv;

        //Json con informacion del cliente enviado a syscountry
        const customerResponse = await jsonStatus;

        //Buscar cliente

        //Quitamos espacios o guiones que puedan venir
        customerResponse.data.tax_identification = removeHyphens(customerResponse.data.tax_identification);

        //Json de solicitud
        const customerFilter = await fetchDataJson('json/filters.json');
        customerFilter.data.filters[0].value = removeHyphens(customerResponse.data.tax_identification);
        customerFilter.header.access_token = getToken(bid);

        const customerFilterData = await fetchGetDataPilot(customerListURL, customerFilter);
        console.log(customerFilterData);

        //Crear cliente si no existe informacion de cliente en PILOT

        // Validar si entitydata está vacío

        if (customerFilterData.result && customerFilterData.result.entitydata && customerFilterData.result.entitydata.length > 0) {

            //Respueta del filtro, encontro a un cliente

            id_customer = customerFilterData.result.entitydata[0].id;

            nombre = customerFilterData.result.entitydata[0].name;

        } else {

            //Si no encontro cliente creamos uno nuevo

            //Codigo de cumpleaños

            let birthday = customerResponse.data.birthday;

            let arraySubcadenas = birthday.split("-");

            customerResponse.data.birthday = arraySubcadenas[2] + "-" + arraySubcadenas[1] + "-" + arraySubcadenas[0];

            //Quitamos espacios que puedan venir del celular/telefono

            customerResponse.data.phone = removeHyphens(customerResponse.data.phone);

            customerResponse.data.cellphone = removeHyphens(customerResponse.data.cellphone);

            customerResponse.header.access_token = getToken(bid);

            console.log(customerResponse);

            //Dar de alta cliente en PILOT
            const customerResponseData = await fetchGetDataPilot(customerCreateURL, customerResponse);
            console.log(customerResponseData);

            //ID del cliente en pilot
            id_customer = customerResponseData.result.entitydata.id;

            nombre = customerResponseData.result.entitydata.name;

            answer = "Cliente nuevo: " + customerResponseData.result.status + " Nombre: " + nombre;

            colorClass = customerResponseData.result.status === "success" ? "success" : "error";

            document.getElementById('data-1').innerHTML = answer.replace(new RegExp(`("${customerResponseData.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

            //Nota de creacion de nuevo cliente

            //Json de solicitud
            const customerComment = await fetchDataJson('json/comment.json');
            customerComment.data.sale_id = id;
            customerComment.data.comment = "El cliente: " + customerResponse.data.name + " fue dado de alta";
            customerComment.header.access_token = getToken(bid);

            //Mandar nota informativa

            const customerCommentData = await fetchGetDataPilot(commentURL, customerComment);
            console.log(customerCommentData);

            answer = "Comentario cliente nuevo: " + customerCommentData.result.status;

            colorClass = customerCommentData.result.status === "success" ? "success" : "error";

            document.getElementById('data-2').innerHTML = answer.replace(new RegExp(`("${customerCommentData.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

            //Concatenar todos los log de PILOT 

            var jsonCustomer = [{
                    nameFile: inv
                },
                {
                    bid: bid
                },
                {
                    customerResponse: customerResponse
                },
                {
                    customerComment: customerComment
                },
                {
                    customerResponseData: customerResponseData
                },
                {
                    customerCommentData: customerCommentData
                }
            ];

            //Almacenar todos los log de PILOT 

            const logResult = await fetchLogData('log_customer.php', jsonCustomer);

        }

        //Asignar cliente nuevo a la venta

        //Json de solicitud

        const assignmentCustomer = await fetchDataJson('json/assignment.json');
        assignmentCustomer.data.id = id;
        assignmentCustomer.data.customer_id = id_customer;
        assignmentCustomer.header.access_token = getToken(bid);
        
        //Mandar cambio de estatus
        const assignmentCustomerData = await fetchGetDataPilot(saleUpdateURL, assignmentCustomer);
        console.log(assignmentCustomerData);

        answer = "Cliente asignado a la venta: " + assignmentCustomerData.result.status;

        colorClass = assignmentCustomerData.result.status === "success" ? "success" : "error";

        document.getElementById('data-3').innerHTML = answer.replace(new RegExp(`("${assignmentCustomerData}": ".*?")`), `<span class="${colorClass}">$1</span>`);

        //Nota de Asignar cliente nuevo a la venta

        //Json de solicitud
        const assignmentComment = await fetchDataJson('json/comment.json');
        assignmentComment.data.sale_id = id;
        assignmentComment.data.comment = "El cliente: " + nombre + " fue asignado a la venta";
        assignmentComment.header.access_token = getToken(bid);
        
        //Mandar nota informativa

        const assignmentCommentData = await fetchGetDataPilot(commentURL, assignmentComment);
        console.log(assignmentCommentData);

        answer = "Comentario cliente asignado a la venta: " + assignmentCommentData.result.status;

        colorClass = assignmentCommentData.result.status === "success" ? "success" : "error";

        document.getElementById('data-4').innerHTML = answer.replace(new RegExp(`("${assignmentCommentData}": ".*?")`), `<span class="${colorClass}">$1</span>`);


        //Concatenar todos los log de PILOT 

        var jsonResult = [{
                nameFile: inv
            },
            {
                bid: bid
            },
            {
                assignmentCustomer: assignmentCustomer
            },
            {
                assignmentComment: assignmentComment
            },
            {
                assignmentCustomerData: assignmentCustomerData
            },
            {
                assignmentCommentData: assignmentCommentData
            }
        ];

        //Almacenar todos los log de PILOT 

        const logResult = await fetchLogData('log_assignment.php', jsonResult);

        window.location.href = indexUrl;

    } catch (error) {

        console.error('Ocurrió un error:', error);

        window.location.href = indexUrl;
    }
}

setTimeout(processChangeCustomer, 1000);