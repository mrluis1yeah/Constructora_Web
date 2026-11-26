import { Resend } from "resend";

// Opciones válidas del campo "Solicitud" (deben coincidir con el <select> del HTML).
const SOLICITUDES = [
  "Cotización de un proyecto",
  "Construcción desde cero",
  "Remodelación",
  "Diseño y apoyo técnico",
  "Proyectos inmobiliarios y lotes",
  "Información sobre una obra",
  "Otra"
];

function escaparHTML(valor = "") {
  return String(valor).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);
}

// Convierte cualquier valor en texto limpio y sin espacios sobrantes.
function texto(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}

function responder(res, estado, success, message) {
  return res.status(estado).json({ success, message });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return responder(res, 405, false, "Método no permitido.");
  }

  try {
    // Vercel ya convierte el JSON en objeto; por si llega como texto, lo convertimos.
    const cuerpo = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    // Campo trampa para bots: las personas no lo ven ni lo llenan.
    // Si trae contenido, fingimos éxito sin enviar nada.
    if (texto(cuerpo.sitio_web)) {
      return responder(res, 200, true, "Solicitud enviada correctamente.");
    }

    const nombre = texto(cuerpo.nombre);
    const correo = texto(cuerpo.correo);
    const telefono = texto(cuerpo.telefono);
    const solicitud = texto(cuerpo.solicitud);
    const motivo = texto(cuerpo.motivo);

    if (!nombre || !correo || !telefono || !solicitud || !motivo) {
      return responder(res, 400, false, "Completa todos los campos.");
    }

    if (nombre.length < 2 || nombre.length > 100) {
      return responder(res, 400, false, "El nombre no es válido.");
    }

    if (correo.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return responder(res, 400, false, "El correo electrónico no es válido.");
    }

    const digitos = telefono.replace(/\D/g, "");
    if (!/^[+\d][\d\s()-]*$/.test(telefono) || digitos.length < 7 || digitos.length > 15) {
      return responder(res, 400, false, "El número de contacto no es válido.");
    }

    if (!SOLICITUDES.includes(solicitud)) {
      return responder(res, 400, false, "Selecciona un tipo de solicitud válido.");
    }

    if (motivo.length < 10 || motivo.length > 3000) {
      return responder(res, 400, false, "Cuéntanos un poco más en el motivo (mínimo 10 caracteres).");
    }

    const { RESEND_API_KEY, DESTINO_EMAIL, REMITENTE_EMAIL } = process.env;

    if (!RESEND_API_KEY || !DESTINO_EMAIL || !REMITENTE_EMAIL) {
      console.error("Faltan variables de entorno: RESEND_API_KEY, DESTINO_EMAIL o REMITENTE_EMAIL.");
      return responder(res, 500, false, "El envío no está configurado. Escríbenos por WhatsApp.");
    }

    const resend = new Resend(RESEND_API_KEY);

    // Sin saltos de línea en el asunto, por seguridad.
    const nombreAsunto = nombre.replace(/[\r\n]+/g, " ");

    const { error } = await resend.emails.send({
      from: REMITENTE_EMAIL,
      to: [DESTINO_EMAIL],
      replyTo: correo, // al responder el correo, le escribes directo al cliente
      subject: `Nueva solicitud: ${solicitud} · ${nombreAsunto}`,
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; color: #24352f; max-width: 600px;">
          <h2 style="color: #0d4035; margin-bottom: 4px;">Nueva solicitud desde la página web</h2>
          <p style="margin-top: 0; color: #4a554f;">Constructora e Inmobiliaria Medina S.A.S.</p>
          <hr style="border: none; border-top: 1px solid #dedbd2;">
          <p><strong>Nombre:</strong> ${escaparHTML(nombre)}</p>
          <p><strong>Correo:</strong> ${escaparHTML(correo)}</p>
          <p><strong>Teléfono:</strong> ${escaparHTML(telefono)}</p>
          <p><strong>Solicitud:</strong> ${escaparHTML(solicitud)}</p>
          <p><strong>Motivo:</strong></p>
          <p style="background: #faf8f3; padding: 12px; border-radius: 6px;">
            ${escaparHTML(motivo).replace(/\n/g, "<br>")}
          </p>
        </div>
      `
    });

    if (error) {
      console.error("Error de Resend:", error);
      return responder(res, 500, false, "No se pudo enviar el correo. Inténtalo de nuevo o escríbenos por WhatsApp.");
    }

    return responder(res, 200, true, "Solicitud enviada correctamente.");
  } catch (error) {
    console.error("Error en el formulario:", error);
    return responder(res, 400, false, "No se pudo procesar la solicitud. Revisa los datos e inténtalo nuevamente.");
  }
}
