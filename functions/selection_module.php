<?php

//Deteccion de archivos y clasificacion de envio

function send_data($directory)
{

    if (is_dir($directory)) {

        $iterator = new RecursiveIteratorIterator(

            new RecursiveDirectoryIterator($directory)
        );

        foreach ($iterator as $file) {

            //Unidades

            //Enviar datos de la creacion de la unidad

            if (strpos($file->getPathname(), 'Compras_Nuevos_') !== false) {

                header('Location: http://localhost/Pilot/stock/create/create.html', TRUE, 302);

                //Enviar datos del estado de la unidad

            } elseif (strpos($file->getPathname(), 'Estatus_Nuevos_') !== false) {

                header('Location: http://localhost/Pilot/stock/state/state.html', TRUE, 302);

                //Carga masiva de inventario

            } elseif (strpos($file->getPathname(), 'Carga_Nuevos') !== false) {

                header('Location: http://localhost/Pilot/stock/load/load.html', TRUE, 302);

                //Enviar datos de la actualizacion de la unidad

            } elseif (strpos($file->getPathname(), 'Update_Nuevos_') !== false) {

                header('Location: http://localhost/Pilot/stock/update/update.html', TRUE, 302);

                //Ventas

                //Enviar datos del Pedido a Pilot en caso de que no se encuentre error

            } else if (strpos($file->getPathname(), '_OrdenVenta') !== false) {

                header('Location: http://localhost/Pilot/sales/order/order.html', TRUE, 302);

                //Enviar datos de actualizacion de cliente

            } else if (strpos($file->getPathname(), '_ClienteDatos') !== false) {

                //header('Location: http://localhost/Pilot/sales/customer_update/customer_update.html', TRUE, 302);

                //Enviar datos de creacion de nuevo cliente

            } else if (strpos($file->getPathname(), '_ClienteNuevo') !== false) {

                //header('Location: http://localhost/Pilot/sales/customer_new/customer_new.html', TRUE, 302);

                //Enviar datos de facturacion a Pilot

            } else if (strpos($file->getPathname(), '_DatosFacturacion') !== false) {

                header('Location: http://localhost/Pilot/sales/invoice/invoice.html', TRUE, 302);

                //Enviar datos de refacturacion a Pilot

            } else if (strpos($file->getPathname(), '_Refacturacion') !== false && strlen($file->getPathname()) > 65) {

                header('Location: http://localhost/Pilot/sales/rebilling/rebilling.html', TRUE, 302);

                //Enviar datos de liberacion de unidad - anulacion de venta

            } else if (strpos($file->getPathname(), '_Liberar') !== false && strlen($file->getPathname()) > 54) {

                header('Location: http://localhost/Pilot/sales/release/release.html', TRUE, 302);

                //Enviar datos de entrega de unidad a Pilot

            } else if (strpos($file->getPathname(), '_FechaEntrega') !== false) {

                header('Location: http://localhost/Pilot/sales/delivery/delivery.html', TRUE, 302);
            }
        }
    }
}
