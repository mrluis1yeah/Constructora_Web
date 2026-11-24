/*
    Mensajes prefabricados: cualquier enlace con data-asunto prepara el mensaje de WhatsApp
    y deja seleccionada la "Solicitud" correspondiente en el formulario de contacto.
    El número de WhatsApp se lee del propio HTML, así que solo se cambia allí.
*/
const ws = document.querySelector("[data-canal]");
const urlWs = ws?.href;

/* Palabra clave que aparece en data-asunto  →  opción del selector "Solicitud" (mismo texto que en el HTML). */
const SOLICITUDES = [
    ["cotiz", "Cotización de un proyecto"],
    ["construcción", "Construcción desde cero"],
    ["remodel", "Remodelación"],
    ["diseño", "Diseño y apoyo técnico"],
    ["inmobiliari", "Proyectos inmobiliarios y lotes"],
    ["lotes", "Proyectos inmobiliarios y lotes"],
    ["obra", "Información sobre una obra"]
];

function preparar(asunto) {
    const texto = `Hola, quisiera información sobre ${asunto}.`;
    if (ws) ws.href = `${urlWs}?text=${encodeURIComponent(texto)}`;

    const mensaje = document.querySelector("#mensaje");
    if (mensaje) mensaje.textContent = `Mensaje de WhatsApp: “${texto}”`;

    const selector = document.querySelector("#solicitud");
    const coincide = SOLICITUDES.find(([clave]) => asunto.toLowerCase().includes(clave));
    if (selector && coincide) selector.value = coincide[1];
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


/* Menú hamburguesa: abre y cierra las opciones en pantallas angostas. */
const botonMenu = document.querySelector(".hamburguesa");
const menuPrincipal = document.querySelector("#menu-principal");

function alternarMenu(abrir) {
    if (!botonMenu || !menuPrincipal) return;
    menuPrincipal.classList.toggle("abierto", abrir);
    botonMenu.setAttribute("aria-expanded", abrir);
    botonMenu.setAttribute("aria-label", abrir ? "Cerrar menú" : "Abrir menú");
}

botonMenu?.addEventListener("click", () => alternarMenu(!menuPrincipal.classList.contains("abierto")));
menuPrincipal?.addEventListener("click", e => e.target.closest("a") && alternarMenu(false));  // Al elegir una opción se cierra.
document.addEventListener("click", e => !e.target.closest(".encabezado") && alternarMenu(false));  // Tocar fuera lo cierra.
document.addEventListener("keydown", e => e.key === "Escape" && alternarMenu(false));
window.addEventListener("resize", () => alternarMenu(false));
