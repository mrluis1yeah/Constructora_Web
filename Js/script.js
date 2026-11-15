/*
    Mensajes prefabricados: cualquier enlace con data-asunto prepara el mensaje
    que se enviará desde los botones de la sección de contacto (WhatsApp o correo).
    El número y el correo se leen del propio HTML, así que solo se cambian allí.
*/
const [ws, correo] = document.querySelectorAll("[data-canal]");
const [urlWs, urlCorreo] = [ws?.href, correo?.href];

function preparar(asunto) {
    if (!ws) return;
    const texto = `Hola, quisiera información sobre ${asunto}.`;
    ws.href = `${urlWs}?text=${encodeURIComponent(texto)}`;
    correo.href = `${urlCorreo}?subject=${encodeURIComponent("Consulta: " + asunto)}&body=${encodeURIComponent(texto)}`;
    document.querySelector("#mensaje").textContent = `Mensaje: “${texto}”`;
}

preparar(document.querySelector("[data-asunto]")?.dataset.asunto ?? "la cotización de mi proyecto");
document.addEventListener("click", e => {
    const boton = e.target.closest("[data-asunto]");
    if (boton) preparar(boton.dataset.asunto);
});

/* Imágenes que aún no existen: se muestra un recuadro con la ruta que falta, para saber dónde colocarlas. */
function faltante(img) {
    const caja = document.createElement("div");
    caja.className = `foto-falta ${img.className}`;
    caja.textContent = `Falta la imagen: ${img.getAttribute("src")}`;
    img.replaceWith(caja);
}
document.addEventListener("error", e => e.target.tagName === "IMG" && faltante(e.target), true);
document.querySelectorAll("img:not([src$='.svg'])").forEach(i => i.complete && !i.naturalWidth && faltante(i));
