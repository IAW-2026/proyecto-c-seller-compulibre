# CompuLibre Seller App

Panel web para vendedores de CompuLibre. Permite gestionar productos, consultar
ventas, registrar despachos y seguir el estado de los envios. Los usuarios con
rol administrador tambien pueden revisar productos y ventas globales, ademas de
poder editar y eliminar cualquier producto. Los administradores tambien cuentan
con la capacidad de actualizar el estado de un envio en la pagina.

## Deploy

[Abrir Seller App](https://proyecto-c-seller-compulibre.vercel.app)

## Acceso

### Vendedor

Desde la landing page, seleccionar **Registrarse** y crear una cuenta con Clerk.
Luego iniciar sesion para acceder al dashboard del vendedor.

### Administrador

Usar la cuenta de prueba:

- Email: `selleradmin+clerk_test@example.com`
- Contrasena: `selleradmin`
- Codigo de confirmacion: 424242

La cuenta debe tener el siguiente valor configurado en `publicMetadata` de
Clerk:

```json
{
  "role": "admin"
}
```
