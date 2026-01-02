async function processUpdateCustomer() {
    try {

        //Traer datos de DB

        const data = await fetchDataJson('get_data.php');

        const jsonStatus = data.jsonStatus;
        const id = data.id;
        const inv = data.inv;
        const bid = data.bid;
        const idCustomer = data.customer;
        let answer;
        let colorClass;

        document.getElementById('info').textContent = "Actualizando Cliente: " + inv;

        //Actualizar informacion de cliente

        //Json con informacion del cliente enviado a syscountry
        const customerResponse = await jsonStatus;
        customerResponse.data.id = idCustomer;

        //Quitamos espacios o guiones que puedan venir
        customerResponse.data.tax_identification = removeHyphens(customerResponse.data.tax_identification);

        //Buscar cliente

        //Json de solicitud
        const customerFilter = await fetchDataJson('json/filters.json');
        customerFilter.data.filters[0].value = customerResponse.data.tax_identification;
        customerFilter.header.access_token = getToken(bid);

        const customerFilterData = await fetchGetDataPilot(customerListURL, customerFilter);
        console.log(customerFilterData);

        //Actualizar cliente si existe informacion en PILOT

        // Validar si entitydata está vacío

        if (customerFilterData.result && customerFilterData.result.entitydata && customerFilterData.result.entitydata.length > 0) {

            //Codigo de cumpleaños

            let birthday = customerResponse.data.birthday;

            let arraySubcadenas = birthday.split("-");

            customerResponse.data.birthday = arraySubcadenas[2] + "-" + arraySubcadenas[1] + "-" + arraySubcadenas[0];

            //Quitamos espacios que puedan venir del celular/telefono

            customerResponse.data.phone = removeHyphens(customerResponse.data.phone);

            customerResponse.data.cellphone = removeHyphens(customerResponse.data.cellphone);

            customerResponse.header.access_token = getToken(bid);

            console.log(customerResponse);

            //Mandar cambio de estatus
            const customerResponseData = await fetchGetDataPilot(customerUpdateURL, customerResponse);
            console.log(customerResponseData);

            answer = "Cliente actualizado: " + customerResponseData.result.status;

            colorClass = customerResponseData.result.status === "success" ? "success" : "error";

            document.getElementById('data-1').innerHTML = answer.replace(new RegExp(`("${customerResponseData.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

            //Nota actualizacion cliente

            //Json de solicitud

            const updateCustomerComment = await fetchDataJson('json/comment.json');
            updateCustomerComment.data.sale_id = id;
            updateCustomerComment.data.comment = "Los datos del cliente: " + customerResponse.data.name + ", han sido actualizados";
            updateCustomerComment.header.access_token = getToken(bid);

            //Mandar nota informativa
            const updateCustomerCommentData = await fetchGetDataPilot(commentURL, updateCustomerComment);
            console.log(updateCustomerCommentData);

            answer = "Nota cliente actualizado: " + updateCustomerCommentData.result.status;

            colorClass = updateCustomerCommentData.result.status === "success" ? "success" : "error";

            document.getElementById('data-2').innerHTML = answer.replace(new RegExp(`("${updateCustomerCommentData.result.status}": ".*?")`), `<span class="${colorClass}">$1</span>`);

            //Concatenar todos los log de PILOT 

            var jsonResult = [{
                    nameFile: inv
                },
                {
                    bid: bid
                },
                {
                    customerResponse: customerResponse
                },
                {
                    updateCustomerComment: updateCustomerComment
                },
                {
                    customerResponseData: customerResponseData
                },
                {
                    updateCustomerCommentData: updateCustomerCommentData
                }
            ];

            //Almacenar todos los log de PILOT 

            const logResult = await fetchLogData('log.php', jsonResult);

            //window.location.href = indexUrl;

        } else {

            //Si no se encuentra cliente mandar mensaje

            //Json de solicitud

            const Comment = await fetchDataJson('json/comment.json');
            Comment.data.sale_id = id;
            Comment.data.comment = "No se pudo actualizar El cliente : " + customerResponse.data.name + ", ya que no fue encontrado (Hablar a Sistemas)";
            Comment.header.access_token = getToken(bid);

            //Mandar nota informativa
            const CommentData = await fetchGetDataPilot(commentURL, Comment);
            console.log(CommentData);

            answer = "Nota cliente actualizado: " + CommentData.result.status;

            document.getElementById('data-1').innerHTML = answer.replace(new RegExp(`("${CommentData}": ".*?")`), `<span class="error">$1</span>`);

            window.location.href = indexUrl;

        }

    } catch (error) {

        console.error('Ocurrió un error:', error);

        window.location.href = indexUrl;
    }
}

setTimeout(processUpdateCustomer, 1000);