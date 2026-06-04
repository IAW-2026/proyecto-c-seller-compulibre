# CompuLibre Seller App

## Deploy

[Abrir Seller App](https://proyecto-c-seller-compulibre.vercel.app)

## Acceso

### Vendedor

Desde la landing page, seleccionar **Registrarse** y crear una cuenta con Clerk.
Luego iniciar sesion para acceder al dashboard del vendedor.

### Administrador

Usar la cuenta de prueba:

- Email: `seller+clerk_test@iaw.com`
- Contrasena: `iawuser#`
- Codigo de confirmacion: 424242

La cuenta debe tener el siguiente valor configurado en `publicMetadata` de
Clerk:

```json
{
  "role": "admin"
}
```

### Usuario No Administrador

Tambien existe una cuenta de usuario sin privilegios de administrador creada:

- Email: `usuario+clerk_test@iaw.com`
- Contraseña: `iawuser#`
- Codigo de confirmacion: 424242

## Descripcion

Panel web para vendedores de CompuLibre. Permite gestionar productos, consultar
ventas, registrar despachos y seguir el estado de los envios. Los usuarios con
rol administrador tambien pueden revisar productos y ventas globales, ademas de
poder editar y eliminar cualquier producto. Los administradores tambien cuentan
con la capacidad de actualizar el estado de un envio en la pagina.

## Notas para la corrección

- La interfaz del dashboard fue modularizada por dominio dentro de `src/app/dashboard/ui`. Los componentes exclusivos de Productos, Ventas y Configuración se encuentran en carpetas separadas, mientras que los componentes compartidos, como paginación, búsqueda y skeletons, permanecen en el nivel general. Esto evita concentrar la lógica visual en los archivos `page.tsx` y facilita la reutilización.

- La lógica de negocio se mantiene separada del frontend dentro de `src/lib`. Por ejemplo, la confirmación de órdenes, la gestión de productos, los despachos y los webhooks de Shipping se resuelven en módulos independientes.

- Los endpoints utilizados para la comunicación entre aplicaciones requieren API keys enviadas mediante el header `x-api-key`. En producción, si falta una key obligatoria, la solicitud es rechazada. En desarrollo local, `/api/orders/confirm` por ejemplo permite realizar pruebas sin `PAYMENTS_API_KEY`; si la variable está configurada, también se exige localmente. Las api keys se encuentran en el archivo `.env.example`.

- En esta entrega, `/api/orders/confirm` registra la venta luego de confirmar el pago y valida que exista stock suficiente, pero no descuenta automáticamente las unidades. Esta es una limitación conocida y temporal: en la entrega 3 se implementará una reserva previa al pago para evitar inconsistencias cuando dos compradores intenten adquirir la última unidad simultáneamente.

- Las órdenes se numeran de forma independiente por vendedor. Cada tienda comienza con `Orden #1`, en lugar de utilizar una secuencia global compartida.

- La aplicación recibe webhooks de Shipping para actualizar el estado de los envíos y generar notificaciones. Como respaldo, los administradores cuentan con una acción manual para consultar nuevamente el estado del envío si un webhook no llega correctamente.

- Las notificaciones ahora mismo requieren hacer F5 para actualizar, ya que no se hace un polling para actualizar el Badge y mostrar la notificación. En la etapa 3 cuando esten funcionando las 4 apps en conjunto se va a añadir.
