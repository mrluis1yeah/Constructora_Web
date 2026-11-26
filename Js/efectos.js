/*
    EFECTOS: pantalla de carga, modo claro/oscuro, animaciones al desplazarse,
    botones con flecha y onda, y botón flotante de WhatsApp.
    Se carga al final de la página (después de obras.js) para encontrar también las tarjetas que se dibujan solas.
    Si algo falla aquí, la página sigue funcionando: solo se pierden los efectos.
*/
(() => {
    const raiz = document.documentElement;
    const menosMovimiento = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const leer = clave => { try { return localStorage.getItem(clave); } catch { return null; } };
    const guardar = (clave, valor) => { try { localStorage.setItem(clave, valor); } catch { /* sin almacenamiento: no pasa nada */ } };
    const leerSesion = clave => { try { return sessionStorage.getItem(clave); } catch { return null; } };
    const guardarSesion = (clave, valor) => { try { sessionStorage.setItem(clave, valor); } catch { /* idem */ } };

    raiz.classList.add("efectos");

    /* ---------- 1. Pantalla de carga ---------- */
    const cargador = document.querySelector(".cargador");
    const espera = ms => new Promise(r => setTimeout(r, ms));

    function terminarCarga() {
        raiz.classList.add("cargado");   // Arranca la entrada de la portada y del botón de WhatsApp.
        if (!cargador) return;
        cargador.classList.add("salida");
        setTimeout(() => cargador.remove(), 1000);
    }

    if (cargador) {
        // La primera visita muestra la animación completa; al cambiar de página es más corta.
        const primera = !leerSesion("medina-visto");
        guardarSesion("medina-visto", "1");
        const minimo = menosMovimiento ? 250 : primera ? 2100 : 800;
        const listo = document.readyState === "complete" ? Promise.resolve() : new Promise(r => addEventListener("load", r, { once: true }));
        Promise.race([Promise.all([listo, espera(minimo)]), espera(6000)]).then(terminarCarga);
    } else {
        raiz.classList.add("cargado");
    }

    /* ---------- 2. Modo claro / oscuro ---------- */
    const selectores = document.querySelectorAll("[data-tema-toggle]");
    const metaColor = document.querySelector('meta[name="theme-color"]');

    function aplicarTema(tema, animar) {
        if (animar && !menosMovimiento) {
            raiz.classList.add("cambiando-tema");
            setTimeout(() => raiz.classList.remove("cambiando-tema"), 650);
        }
        raiz.dataset.tema = tema;
        selectores.forEach(s => s.setAttribute("aria-checked", tema === "oscuro"));
        if (metaColor) metaColor.content = tema === "oscuro" ? "#09110f" : "#fffefa";
    }

    aplicarTema(raiz.dataset.tema === "oscuro" ? "oscuro" : "claro", false);
    selectores.forEach(s => s.addEventListener("click", () => {
        const nuevo = raiz.dataset.tema === "oscuro" ? "claro" : "oscuro";
        guardar("tema", nuevo);
        aplicarTema(nuevo, true);
    }));
    // Si la persona nunca eligió, se sigue el modo del sistema (también cuando cambia en vivo).
    matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", e => {
        if (!leer("tema")) aplicarTema(e.matches ? "oscuro" : "claro", true);
    });

    /* ---------- 3. Palabras clave de neón: cada una parpadea en su propio ritmo ---------- */
    document.querySelectorAll(".neon").forEach((n, i) => {
        n.style.setProperty("--retardo", `${((i * 1.9) % 7).toFixed(1)}s`);
        n.style.setProperty("--duracion", `${7 + (i % 4) * 1.3}s`);
    });

    /* ---------- 4. Botones: la flecha "→" se separa para poder deslizarse ---------- */
    function prepararFlecha(boton) {
        if (boton.querySelector(".flecha") || boton.children.length) return;
        const m = boton.textContent.match(/^(.*?)\s*→$/);
        if (!m) return;
        boton.textContent = `${m[1]} `;
        const f = document.createElement("span");
        f.className = "flecha";
        f.setAttribute("aria-hidden", "true");
        f.textContent = "→";
        boton.append(f);
    }
    document.querySelectorAll(".boton, .tarjeta-texto > a").forEach(prepararFlecha);

    // Onda al hacer clic.
    document.addEventListener("pointerdown", e => {
        const boton = e.target.closest(".boton");
        if (!boton || menosMovimiento || boton.disabled) return;
        const caja = boton.getBoundingClientRect();
        const onda = document.createElement("span");
        onda.className = "onda";
        onda.style.left = `${e.clientX - caja.left}px`;
        onda.style.top = `${e.clientY - caja.top}px`;
        boton.append(onda);
        setTimeout(() => onda.remove(), 750);
    });

    /* ---------- 5. Aparición suave al desplazarse ---------- */
    const REVELAR = [
        ".titulo-seccion", ".valor", ".tarjeta", ".testimonio", ".pasos article", ".nosotros-texto",
        ".faq details", ".contacto-info", ".formulario", ".filtros", ".informe > *", ".nosotros > img"
    ].join(",");

    if (!menosMovimiento && "IntersectionObserver" in window) {
        const hermanos = new Map();
        const elementos = [...document.querySelectorAll(REVELAR)].filter(el => !el.closest(".encabezado, .cargador"));

        const observador = new IntersectionObserver(entradas => entradas.forEach(entrada => {
            if (!entrada.isIntersecting) return;
            const el = entrada.target;
            observador.unobserve(el);
            el.classList.add("visible");
            // Al terminar se retiran las clases para que el efecto al pasar el cursor (hover) vuelva a funcionar.
            setTimeout(() => {
                el.classList.remove("revela", "revela-img");
                // Se deja "visible" en los contenedores que dibujan líneas y resaltados dentro.
            }, 1300 + (parseFloat(el.style.getPropertyValue("--i")) || 0) * 90);
        }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

        elementos.forEach(el => {
            // Escalonado: cada hermano entra un poco después del anterior (máximo 5 pasos).
            const padre = el.parentElement;
            const n = hermanos.get(padre) ?? 0;
            hermanos.set(padre, n + 1);
            el.style.setProperty("--i", Math.min(n, 5));
            el.classList.add("revela");
            if (el.matches(".nosotros > img")) el.classList.add("revela-img");
            observador.observe(el);
        });
    } else {
        document.querySelectorAll(REVELAR).forEach(el => el.classList.add("visible"));
    }

    /* ---------- 6. Encabezado: sombra y barra de progreso al desplazarse ---------- */
    const encabezado = document.querySelector(".encabezado");
    if (encabezado) {
        const barra = document.createElement("div");
        barra.className = "progreso";
        barra.setAttribute("aria-hidden", "true");
        encabezado.append(barra);

        let pendiente = false;
        const actualizar = () => {
            pendiente = false;
            const max = raiz.scrollHeight - innerHeight;
            barra.style.setProperty("--p", max > 0 ? Math.min(scrollY / max, 1).toFixed(4) : 0);
            encabezado.classList.toggle("compacto", scrollY > 12);
        };
        addEventListener("scroll", () => { if (!pendiente) { pendiente = true; requestAnimationFrame(actualizar); } }, { passive: true });
        addEventListener("resize", actualizar);
        actualizar();
    }
})();
