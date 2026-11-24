/* =====================================================================
   OBRAS E INFORMES — para añadir, quitar u ocultar una obra solo se edita esta lista.
   Cada obra necesita: id, activo, estado, titulo, subtitulo, portada y descripcion.
   Las instrucciones completas están en Notas_Locas.txt.
               { img: ["01-fachada.jpg"], pie: "Una sola imagen se muestra a todo el ancho, como una publicación." },
            { h: "Cómo se hace el seguimiento" },
            "El propietario visita la obra cada tres meses y, entre visita y visita, le enviamos fotos y videos del avance para que siempre sepa en qué punto va su proyecto.",
            { img: ["02-panete.jpg", "03-escaleras.jpg", "04-estructura.jpg"], pie: "De 2 a 4 imágenes se acomodan solas en un collage." }
,
            { cita: "Para nosotros es un piso más; para el dueño puede ser la casa de toda su vida." },
            { img: ["01-fachada.jpg", "02-sala.jpg", "03-cocina.jpg", "04-bano.jpg", "05-escalera.jpg"], pie: "Con 5 o más imágenes se crea un carrusel." }
,
            { h: "Una obra similar" },
            { img: ["01-obra-similar.jpg"], pie: "Placa huella que ya construimos." }
   ===================================================================== */
const OBRAS = [
    {
        id: "edificio-7-apartamentos",  // Nombre único, sin tildes ni espacios. También es la carpeta: Imagenes/obras/<id>/
        activo: true,                   // true = se muestra · false = se oculta (no se borra nada)
        estado: "Terminada",           // "Terminada", "En proceso" o "Próxima"
        titulo: "Edificio de 7 apartamentos",
        subtitulo: "Vivienda multifamiliar con la obra negra pañetada y lista para enchapar.",
        portada: "Imagenes/proyecto_1.jpg",  // Con "/" es una ruta completa; sin "/" se busca dentro de la carpeta de la obra.
        datos: { "Tipo": "Vivienda", "Avance": "Listo para enchapar", "Ubicación": "Por confirmar" },  // Ficha lateral (opcional)
        descripcion: [  // Un texto suelto es un párrafo. Los objetos son módulos: { h }, { cita }, { img, pie }.
            "Este edificio de siete apartamentos ya tiene toda su obra negra pañetada y está listo para empezar el enchape. Lo dirigimos con nuestro propio equipo de trabajo.",

        ]
    },
    {
        id: "casa-3-pisos",
        activo: true,
        estado: "Terminada",
        titulo: "Casa de 3 pisos",
        subtitulo: "Vivienda unifamiliar en un sector exclusivo, con acabados de primera.",
        portada: "Imagenes/proyecto_2.jpg",
        datos: { "Tipo": "Vivienda unifamiliar", "Pisos": "3", "Acabados": "De primera" },
        descripcion: [
            "Estamos terminando esta casa de tres pisos en un sector exclusivo. Cada detalle se trabaja con materiales y acabados de primera calidad."
        ]
    },
    {
        id: "placa-huella",
        activo: true,
        estado: "Terminada",
        titulo: "Placa huella",
        subtitulo: "Obra civil de gran tamaño, la siguiente en comenzar.",
        portada: "Imagenes/proyecto_3.jpg",
        datos: { "Tipo": "Obra civil", "Tamaño": "Grande", "Inicio": "Por confirmar" },
        descripcion: [
            "La placa huella es una vía de concreto con dos franjas para el paso de los vehículos. Ya hemos construido placas huella y pavimentos, y ahora vamos por una de mayor tamaño."
        ]
    }
];

/* ---------- Código (no hace falta tocarlo) ---------- */
const el = (etiqueta, clase = "", ...hijos) => { const e = document.createElement(etiqueta); e.className = clase; e.append(...hijos); return e; };
const ruta = (o, f) => f.includes("/") ? f : `Imagenes/obras/${o.id}/${f}`;
const foto = (o, f, alt = "", clase = "") => Object.assign(el("img", clase), { src: ruta(o, f), alt, loading: "lazy" });  // Si falta, script.js muestra el recuadro con la ruta.
const enlace = (texto, clase, href) => Object.assign(el("a", clase, texto), { href });

/* Aviso que aparece cuando una sección (Todas, Terminada, En proceso o Próxima) no tiene obras. Copia los enlaces de redes del pie de página. */
const MENSAJE_VACIO = "El hecho de que no haya nada que mostrar significa que todavía no ha sido registrado, mantente actualizado en nuestras redes sociales.";
const vacio = () => {
    const redes = [...document.querySelectorAll(".pie .redes a")].map(a => a.cloneNode(true));
    const caja = el("div", "vacio", el("p", "", MENSAJE_VACIO));
    if (redes.length) caja.append(el("div", "vacio-redes", ...redes));
    caja.setAttribute("role", "status");
    return caja;
};

function insignia(o) { const s = el("span", "estado", o.estado); s.dataset.e = o.estado; return s; }

function galeria(o, b) {
    const n = b.img.length;
    const modo = b.modo || (n === 1 ? "post" : n < 5 ? "collage" : "carrusel");  // Se puede forzar con modo: "post" | "collage" | "carrusel"
    const marco = el("div", modo === "carrusel" ? "pista" : `galeria-${modo}`, ...b.img.map(f => foto(o, f, b.pie)));
    const fig = el("figure", "galeria", marco);
    if (modo === "carrusel") {
        marco.tabIndex = 0;
        marco.setAttribute("aria-label", "Carrusel de imágenes");
        const boton = (texto, d) => Object.assign(el("button", "boton boton-contorno", texto), { type: "button", onclick: () => marco.scrollBy({ left: d * marco.clientWidth, behavior: "smooth" }) });
        fig.append(el("div", "carrusel-botones", boton("← Anterior", -1), boton("Siguiente →", 1)));
    }
    if (b.pie) fig.append(el("figcaption", "", b.pie));
    return fig;
}

const bloque = (o, b) => typeof b === "string" ? el("p", "", b) : b.h ? el("h3", "", b.h) : b.cita ? el("blockquote", "informe-cita", b.cita) : galeria(o, b);

const tarjeta = o => el("article", "tarjeta tarjeta-obra",
    foto(o, o.portada, o.titulo, "foto-tarjeta"),
    el("div", "tarjeta-texto", insignia(o), el("h3", "", o.titulo), el("p", "", o.subtitulo),
        enlace("Ver informe", "boton boton-verde", `obras.html?obra=${encodeURIComponent(o.id)}`)));

function informe(o) {
    const ficha = el("dl", "ficha");
    Object.entries(o.datos || {}).forEach(([k, v]) => ficha.append(el("dt", "", k), el("dd", "", v)));
    return el("article", "informe",
        enlace("← Todas las obras", "volver", "obras.html"), insignia(o), el("h1", "", o.titulo), el("p", "informe-sub", o.subtitulo),
        foto(o, o.portada, o.titulo, "informe-portada"),
        el("div", "informe-grid", el("div", "informe-cuerpo", ...o.descripcion.map(b => bloque(o, b))), ficha));
}

const activas = OBRAS.filter(o => o.activo);
const destacadas = document.querySelector("#obras-destacadas");  // index.html: las primeras 3 obras y una tarjeta final
const lista = document.querySelector("#obras");                  // obras.html: listado o informe

if (destacadas) {
    if (!activas.length) destacadas.append(vacio());
    destacadas.append(...activas.slice(0, 3).map(tarjeta), el("article", "tarjeta tarjeta-cta",
        el("div", "tarjeta-texto", el("h3", "", "Todas las obras"), el("p", "", "Informes con fotos, avances y detalles de cada proyecto."),
            enlace("Ver todas las obras", "boton boton-rojo", "obras.html"))));
}

if (lista) {
    const o = activas.find(x => x.id === new URLSearchParams(location.search).get("obra"));
    if (o) {
        document.querySelector("#intro").remove();
        document.title = `${o.titulo} · Constructora e Inmobiliaria Medina S.A.S.`;
        preparar(`una obra como ${o.titulo}`);  // El mensaje de contacto menciona esta obra
        lista.append(informe(o));
    } else {
        const rejilla = el("div", "rejilla tarjetas-obras", ...activas.map(tarjeta));
        const sinObras = vacio();
        sinObras.hidden = activas.length > 0;
        const filtros = el("div", "filtros", ...["Todas", "Terminada", "En proceso", "Próxima"].map(f => {
            const b = Object.assign(el("button", "boton boton-contorno", f), { type: "button" });
            b.setAttribute("aria-pressed", f === "Todas");
            b.onclick = () => {
                filtros.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b));
                let visibles = 0;
                [...rejilla.children].forEach((t, i) => { t.hidden = f !== "Todas" && activas[i].estado !== f; if (!t.hidden) visibles++; });
                sinObras.hidden = visibles > 0;  // Si la sección queda vacía, se muestra el aviso.
            };
            return b;
        }));
        lista.append(filtros, rejilla, sinObras);
    }
}
