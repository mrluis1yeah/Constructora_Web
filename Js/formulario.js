/*
    Envío del formulario de contacto.
    Manda los datos en JSON a /api/enviar (api/enviar.js), que los reenvía por correo con Resend.
*/
const formulario = document.querySelector("#formulario-contacto");

if (formulario) {
    const boton = formulario.querySelector("button[type='submit']");
    const estado = formulario.querySelector("#estado-formulario");
    const textoBoton = boton.textContent;

    function mostrar(mensaje, tipo) {
        estado.textContent = mensaje;
        estado.className = `formulario-estado ${tipo}`;
    }

    formulario.addEventListener("submit", async e => {
        e.preventDefault();
        if (!formulario.reportValidity()) return;

        const datos = Object.fromEntries(new FormData(formulario));
        const digitos = datos.telefono.replace(/\D/g, "");
        if (digitos.length < 7 || digitos.length > 15) {
            mostrar("Revisa el número de contacto: debe tener entre 7 y 15 dígitos.", "error");
            return;
        }

        boton.disabled = true;
        boton.textContent = "Enviando...";
        mostrar("Enviando tu solicitud, espera un momento.", "info");

        try {
            const respuesta = await fetch("/api/enviar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });
            const resultado = await respuesta.json().catch(() => ({}));

            if (!respuesta.ok || !resultado.success) {
                throw new Error(resultado.message || "No se pudo enviar la solicitud.");
            }

            mostrar("¡Gracias! Recibimos tu solicitud y te contactaremos pronto.", "exito");
            formulario.reset();
        } catch (error) {
            // TypeError = no hubo conexión con el servidor (sin internet, o abierta como archivo local).
            mostrar(
                error instanceof TypeError
                    ? "No pudimos conectarnos. Inténtalo de nuevo o escríbenos por WhatsApp."
                    : error.message,
                "error"
            );
        } finally {
            boton.disabled = false;
            boton.textContent = textoBoton;
        }
    });
}
