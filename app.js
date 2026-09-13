```javascript
/* =========================================================
   TAXOID
   app.js

   Motor principal de la aplicación.

   Funciones:

   - carga especies.json
   - genera filtros
   - conecta Clase → Orden → Familia → Género
   - procesa características morfológicas
   - calcula coincidencias
   - muestra resultados
   - muestra candidatos
   - prepara futuras funciones de IA
========================================================= */


"use strict";


const DATABASE_URL =
    "data/especies.json";


let database = [];

let resultadosActuales = [];

let especieSeleccionada = null;


/* =========================================================
   INICIO
========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    iniciarAplicacion
);


async function iniciarAplicacion() {

    try {

        configurarEventos();

        configurarImagen();

        await cargarBaseDatos();

    }
    catch (error) {

        console.error(
            "Error inicializando TaxoID:",
            error
        );

        mostrarEstado(
            "No se pudo iniciar el sistema.",
            "error"
        );

    }

}


/* =========================================================
   CARGAR BASE DE DATOS
========================================================= */


async function cargarBaseDatos() {

    mostrarEstado(
        "Cargando base taxonómica...",
        "loading"
    );


    const respuesta =
        await fetch(DATABASE_URL);


    if (!respuesta.ok) {

        throw new Error(
            `HTTP ${respuesta.status}`
        );

    }


    const datos =
        await respuesta.json();


    if (!Array.isArray(datos)) {

        throw new Error(
            "especies.json no contiene un arreglo."
        );

    }


    database = datos;


    Taxonomia.inicializar(
        database
    );


    inicializarFiltros();

    actualizarEstadisticas();


    mostrarEstado(
        `${database.length} registros cargados.`,
        "success"
    );


    console.log(
        "TaxoID:",
        database.length,
        "registros cargados."
    );

}


/* =========================================================
   EVENTOS
========================================================= */


function configurarEventos() {

    const clase =
        document.getElementById("clase");

    const orden =
        document.getElementById("orden");

    const familia =
        document.getElementById("familia");

    const genero =
        document.getElementById("genero");

    const identifyButton =
        document.getElementById(
            "identifyButton"
        );


    clase?.addEventListener(
        "change",
        manejarCambioClase
    );


    orden?.addEventListener(
        "change",
        manejarCambioOrden
    );


    familia?.addEventListener(
        "change",
        manejarCambioFamilia
    );


    genero?.addEventListener(
        "change",
        actualizarCandidatosPorTaxonomia
    );


    identifyButton?.addEventListener(
        "click",
        identificar
    );

}


/* =========================================================
   FILTROS
========================================================= */


function inicializarFiltros() {

    const clases =
        Taxonomia.obtenerValores(
            "taxonomy.class"
        );


    cargarOpciones(
        "clase",
        clases,
        "Seleccionar"
    );


    resetearSelect(
        "orden"
    );

    resetearSelect(
        "familia"
    );

    resetearSelect(
        "genero"
    );

}


/* =========================================================
   CAMBIOS TAXONÓMICOS
========================================================= */


function manejarCambioClase() {

    const clase =
        obtenerValor("clase");


    cargarOpciones(
        "orden",
        Taxonomia.obtenerOrdenes(clase),
        "Seleccionar"
    );


    resetearSelect(
        "familia"
    );


    resetearSelect(
        "genero"
    );

}


function manejarCambioOrden() {

    const clase =
        obtenerValor("clase");

    const orden =
        obtenerValor("orden");


    cargarOpciones(
        "familia",
        Taxonomia.obtenerFamilias(
            clase,
            orden
        ),
        "Seleccionar"
    );


    resetearSelect(
        "genero"
    );

}


function manejarCambioFamilia() {

    const clase =
        obtenerValor("clase");

    const orden =
        obtenerValor("orden");

    const familia =
        obtenerValor("familia");


    cargarOpciones(
        "genero",
        Taxonomia.obtenerGeneros(
            clase,
            orden,
            familia
        ),
        "Seleccionar"
    );

}


/* =========================================================
   ACTUALIZAR CANDIDATOS
========================================================= */


function actualizarCandidatosPorTaxonomia() {

    const criterios =
        obtenerCriterios();


    resultadosActuales =
        calcularCoincidencias(
            criterios
        );


    if (
        resultadosActuales.length
    ) {

        mostrarResultados(
            resultadosActuales
        );

    }

}


/* =========================================================
   SELECTS
========================================================= */


function cargarOpciones(
    id,
    opciones,
    textoInicial = "Seleccionar"
) {

    const select =
        document.getElementById(id);


    if (!select) {
        return;
    }


    const valorAnterior =
        select.value;


    select.innerHTML = "";


    const primeraOpcion =
        document.createElement("option");

    primeraOpcion.value = "";

    primeraOpcion.textContent =
        textoInicial;

    select.appendChild(
        primeraOpcion
    );


    for (const opcion of opciones) {

        const elemento =
            document.createElement("option");

        elemento.value =
            opcion;

        elemento.textContent =
            opcion;

        select.appendChild(
            elemento
        );

    }


    if (
        opciones.includes(
            valorAnterior
        )
    ) {

        select.value =
            valorAnterior;

    }

}


function resetearSelect(id) {

    const select =
        document.getElementById(id);


    if (!select) {
        return;
    }


    select.innerHTML =
        '<option value="">Seleccionar</option>';

}


/* =========================================================
   IMAGEN
========================================================= */


function configurarImagen() {

    const input =
        document.getElementById(
            "imageInput"
        );

    const preview =
        document.getElementById(
            "preview"
        );

    const uploadArea =
        document.getElementById(
            "uploadArea"
        );

    const imageInfo =
        document.getElementById(
            "imageInfo"
        );


    if (!input || !preview) {
        return;
    }


    input.addEventListener(
        "change",
        event => {

            const file =
                event.target.files?.[0];


            if (!file) {
                return;
            }


            try {

                Reconocimiento.cargarImagen(
                    file
                );

            }
            catch (error) {

                mostrarEstado(
                    error.message,
                    "error"
                );

                return;

            }


            const url =
                URL.createObjectURL(
                    file
                );


            preview.src =
                url;


            preview.classList.add(
                "visible"
            );


            uploadArea?.classList.add(
                "has-image"
            );


            const metadata =
                Reconocimiento.obtenerMetadatos();


            if (metadata) {

                imageInfo.textContent =
                    `${metadata.nombre} • ${metadata.tamañoKB} KB`;

            }

        }
    );

}


/* =========================================================
   OBTENER CRITERIOS
========================================================= */


function obtenerCriterios() {

    return {

        clase:
            obtenerValor("clase"),

        orden:
            obtenerValor("orden"),

        familia:
            obtenerValor("familia"),

        genero:
            obtenerValor("genero"),

        patas:
            obtenerValor("patas"),

        alas:
            obtenerValor("alas"),

        antenas:
            obtenerValor("antenas"),

        aparatoBucal:
            obtenerValor("aparatoBucal"),

        simetria:
            obtenerValor("simetria"),

        segmentacion:
            obtenerValor("segmentacion")

    };

}


/* =========================================================
   IDENTIFICACIÓN
========================================================= */


function identificar() {

    if (!database.length) {

        mostrarError(
            "La base de datos todavía no está cargada."
        );

        return;

    }


    const criterios =
        obtenerCriterios();


    const hayCriterios =
        Object.values(criterios)
            .some(Boolean);


    if (!hayCriterios) {

        mostrarError(
            "Selecciona al menos una característica."
        );

        return;

    }


    mostrarEstado(
        "Comparando características...",
        "loading"
    );


    resultadosActuales =
        calcularCoincidencias(
            criterios
        );


    if (!resultadosActuales.length) {

        mostrarError(
            "No se encontraron coincidencias."
        );

        return;

    }


    mostrarResultados(
        resultadosActuales
    );


    mostrarEstado(
        "Identificación completada.",
        "success"
    );


    document
        .getElementById("resultados")
        ?.scrollIntoView({
            behavior: "smooth"
        });

}


/* =========================================================
   MOTOR DE COINCIDENCIA
========================================================= */


function calcularCoincidencias(
    criterios
) {

    const pesos = {

        clase: 20,

        orden: 18,

        familia: 15,

        genero: 12,

        patas: 10,

        alas: 7,

        antenas: 7,

        aparatoBucal: 5,

        simetria: 3,

        segmentacion: 3

    };


    const resultados =
        database.map(especie => {

            const morphology =
                especie.morphology || {};

            const taxonomy =
                especie.taxonomy || {};

            let puntos = 0;

            let pesoDisponible = 0;


            /* CLASE */

            if (criterios.clase) {

                pesoDisponible +=
                    pesos.clase;


                if (
                    taxonomy.class ===
                    criterios.clase
                ) {

                    puntos +=
                        pesos.clase;

                }

            }


            /* ORDEN */

            if (criterios.orden) {

                pesoDisponible +=
                    pesos.orden;


                if (
                    taxonomy.order ===
                    criterios.orden
                ) {

                    puntos +=
                        pesos.orden;

                }

            }


            /* FAMILIA */

            if (criterios.familia) {

                pesoDisponible +=
                    pesos.familia;


                if (
                    taxonomy.family ===
                    criterios.familia
                ) {

                    puntos +=
                        pesos.familia;

                }

            }


            /* GÉNERO */

            if (criterios.genero) {

                pesoDisponible +=
                    pesos.genero;


                if (
                    taxonomy.genus ===
                    criterios.genero
                ) {

                    puntos +=
                        pesos.genero;

                }

            }


            /* PATAS */

            if (criterios.patas) {

                pesoDisponible +=
                    pesos.patas;


                if (
                    String(
                        morphology.legs
                    ) ===
                    String(
                        criterios.patas
                    )
                ) {

                    puntos +=
                        pesos.patas;

                }

            }


            /* ALAS */

            if (criterios.alas) {

                pesoDisponible +=
                    pesos.alas;


                if (
                    Boolean(
                        morphology.wings
                    ) ===
                    (
                        criterios.alas ===
                        "true"
                    )
                ) {

                    puntos +=
                        pesos.alas;

                }

            }


            /* ANTENAS */

            if (criterios.antenas) {

                pesoDisponible +=
                    pesos.antenas;


                if (
                    Boolean(
                        morphology.antennae
                    ) ===
                    (
                        criterios.antenas ===
                        "true"
                    )
                ) {

                    puntos +=
                        pesos.antenas;

                }

            }


            /* APARATO BUCAL */

            if (
                criterios.aparatoBucal
            ) {

                pesoDisponible +=
                    pesos.aparatoBucal;


                if (
                    morphology.mouthparts ===
                    criterios.aparatoBucal
                ) {

                    puntos +=
                        pesos.aparatoBucal;

                }

            }


            /* SIMETRÍA */

            if (criterios.simetria) {

                pesoDisponible +=
                    pesos.simetria;


                if (
                    morphology.symmetry ===
                    criterios.simetria
                ) {

                    puntos +=
                        pesos.simetria;

                }

            }


            /* SEGMENTACIÓN */

            if (
                criterios.segmentacion
            ) {

                pesoDisponible +=
                    pesos.segmentacion;


                if (
                    morphology.segmentation ===
                    criterios.segmentacion
                ) {

                    puntos +=
                        pesos.segmentacion;

                }

            }


            const score =
                pesoDisponible > 0
                    ? Math.round(
                        (
                            puntos /
                            pesoDisponible
                        ) * 100
                    )
                    : 0;


            return {

                especie,

                score

            };

        });


    return resultados
        .filter(
            resultado =>
                resultado.score > 0
        )
        .sort(
            (a, b) =>
                b.score -
                a.score
        );

}


/* =========================================================
   MOSTRAR RESULTADOS
========================================================= */


function mostrarResultados(
    resultados
) {

    if (!resultados.length) {

        mostrarError(
            "No existen candidatos compatibles."
        );

        return;

    }


    especieSeleccionada =
        resultados[0].especie;


    mostrarMejorResultado(
        especieSeleccionada,
        resultados[0].score
    );


    mostrarCandidatos(
        resultados
    );


    document
        .getElementById("emptyResult")
        ?.classList.add("hidden");


    document
        .getElementById("result")
        ?.classList.remove("hidden");

}


/* =========================================================
   MEJOR RESULTADO
========================================================= */


function mostrarMejorResultado(
    especie,
    score
) {

    const identification =
        especie.identification || {};

    const taxonomy =
        especie.taxonomy || {};


    escribir(
        "species",
        identification.scientificName ||
        "Sin nombre científico"
    );


    escribir(
        "commonName",
        obtenerNombreComun(
            identification.commonNames
        )
    );


    escribir(
        "resultNivel",
        identification.identificationLevel ||
        "Registro taxonómico"
    );


    escribir(
        "resultReino",
        taxonomy.kingdom || "—"
    );


    escribir(
        "resultFilo",
        taxonomy.phylum || "—"
    );


    escribir(
        "resultClase",
        taxonomy.class || "—"
    );


    escribir(
        "resultOrden",
        taxonomy.order || "—"
    );


    escribir(
        "resultFamilia",
        taxonomy.family || "—"
    );


    escribir(
        "resultGenero",
        taxonomy.genus || "—"
    );


    escribir(
        "resultEspecie",
        taxonomy.species || "—"
    );


    escribir(
        "confidenceText",
        `${score}%`
    );


    const bar =
        document.getElementById(
            "confidenceBar"
        );


    if (bar) {

        bar.style.width =
            `${score}%`;

    }


    mostrarImagen(
        especie
    );


    mostrarDetalles(
        especie
    );

}


/* =========================================================
   IMAGEN DE LA ESPECIE
========================================================= */


function mostrarImagen(
    especie
) {

    const image =
        document.getElementById(
            "speciesImage"
        );


    if (!image) {
        return;
    }


    const images =
        especie.images || {};


    const source =
        images.principal ||
        "";


    if (source) {

        image.src =
            source;

        image.alt =
            especie.identification
                ?.scientificName ||
            "Espécimen";

    }
    else {

        image.removeAttribute(
            "src"
        );

        image.alt =
            "Imagen no disponible";

    }

}


/* =========================================================
   DETALLES
========================================================= */


function mostrarDetalles(
    especie
) {

    const container =
        document.getElementById(
            "taxonomicDetails"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    const morphology =
        especie.morphology || {};

    const biology =
        especie.biology || {};

    const ecology =
        especie.ecology || {};

    const importance =
        especie.importance || {};


    agregarTarjetaDetalle(
        container,
        "🔬 Morfología",
        construirLista([
            `Patas: ${morphology.legs ?? "—"}`,
            `Alas: ${morphology.wings ? "Presentes" : "Ausentes"}`,
            `Antenas: ${morphology.antennae ? "Presentes" : "Ausentes"}`,
            `Simetría: ${morphology.symmetry ?? "—"}`,
            `Segmentación: ${morphology.segmentation ?? "—"}`,
            `Aparato bucal: ${morphology.mouthparts ?? "—"}`
        ])
    );


    agregarTarjetaDetalle(
        container,
        "🧬 Biología",
        construirLista([
            `Desarrollo: ${biology.developmentType ?? "—"}`,
            `Metamorfosis: ${biology.metamorphosis ?? "—"}`,
            `Reproducción: ${biology.reproduction ?? "—"}`,
            `Organización social: ${biology.socialOrganization ?? "—"}`
        ])
    );


    agregarTarjetaDetalle(
        container,
        "🌎 Ecología",
        construirLista([
            `Hábitat: ${ecology.habitat ?? "—"}`,
            `Dieta: ${ecology.diet ?? "—"}`,
            `Rol ecológico: ${ecology.ecologicalRole ?? "—"}`,
            `Nivel trófico: ${ecology.trophicLevel ?? "—"}`
        ])
    );


    agregarTarjetaDetalle(
        container,
        "📚 Importancia",
        construirLista([
            `Ecológica: ${importance.ecological ?? "—"}`,
            `Agrícola: ${importance.agricultural ?? "—"}`,
            `Veterinaria: ${importance.veterinary ?? "—"}`,
            `Salud pública: ${importance.publicHealth ?? "—"}`
        ])
    );

}


function construirLista(
    elementos
) {

    return `
        <ul>
            ${elementos
                .map(
                    elemento =>
                        `<li>${escaparHTML(
                            elemento
                        )}</li>`
                )
                .join("")}
        </ul>
    `;

}


function agregarTarjetaDetalle(
    container,
    titulo,
    contenido
) {

    const article =
        document.createElement(
            "article"
        );


    article.className =
        "detail-card";


    article.innerHTML = `
        <h4>${titulo}</h4>
        ${contenido}
    `;


    container.appendChild(
        article
    );

}


/* =========================================================
   CANDIDATOS
========================================================= */


function mostrarCandidatos(
    resultados
) {

    const container =
        document.getElementById(
            "candidateList"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    resultados
        .slice(0, 5)
        .forEach(
            (resultado, index) => {

                const identification =
                    resultado.especie
                        .identification || {};

                const taxonomy =
                    resultado.especie
                        .taxonomy || {};


                const element =
                    document.createElement(
                        "div"
                    );


                element.className =
                    "candidate";


                element.innerHTML = `

                    <div class="candidate-rank">
                        ${index + 1}
                    </div>

                    <div>

                        <div class="candidate-name">
                            ${escaparHTML(
                                identification
                                    .scientificName ||
                                "Sin identificar"
                            )}
                        </div>

                        <div class="candidate-family">
                            ${escaparHTML(
                                taxonomy.family ||
                                "Familia no disponible"
                            )}
                        </div>

                    </div>

                    <div class="candidate-score">
                        ${resultado.score}%
                    </div>

                `;


                container.appendChild(
                    element
                );

            }
        );

}


/* =========================================================
   ESTADÍSTICAS
========================================================= */


function actualizarEstadisticas() {

    const especies =
        database.length;


    const familias =
        new Set(
            database
                .map(
                    especie =>
                        especie.taxonomy?.family
                )
                .filter(Boolean)
        ).size;


    const ordenes =
        new Set(
            database
                .map(
                    especie =>
                        especie.taxonomy?.order
                )
                .filter(Boolean)
        ).size;


    escribir(
        "speciesCount",
        especies
    );


    escribir(
        "familyCount",
        familias
    );


    escribir(
        "orderCount",
        ordenes
    );

}


/* =========================================================
   UTILIDADES
========================================================= */


function obtenerValor(id) {

    return (
        document.getElementById(id)
            ?.value ||
        ""
    );

}


function escribir(
    id,
    valor
) {

    const elemento =
        document.getElementById(id);


    if (elemento) {

        elemento.textContent =
            valor ?? "—";

    }

}


function obtenerNombreComun(
    nombres
) {

    if (Array.isArray(nombres)) {

        return nombres.join(
            " • "
        );

    }


    return nombres ||
        "Nombre común no registrado";

}


function escaparHTML(
    texto
) {

    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   ESTADOS
========================================================= */


function mostrarEstado(
    mensaje,
    tipo = "normal"
) {

    const elemento =
        document.getElementById(
            "systemStatus"
        );


    if (!elemento) {
        return;
    }


    elemento.textContent =
        mensaje;


    elemento.dataset.status =
        tipo;

}


function mostrarError(
    mensaje
) {

    mostrarEstado(
        `⚠️ ${mensaje}`,
        "error"
    );

}


/* =========================================================
   API PÚBLICA
========================================================= */


window.TaxoID = {

    identificar,

    buscarEspecie,

    obtenerEspeciePorID,

    obtenerBaseDatos() {

        return database;

    },

    obtenerResultados() {

        return resultadosActuales;

    }

};


/* =========================================================
   BÚSQUEDA
========================================================= */


function buscarEspecie(
    termino
) {

    if (!termino) {
        return [];
    }


    const busqueda =
        String(termino)
            .toLowerCase()
            .trim();


    return database.filter(
        especie => {

            const identification =
                especie.identification || {};

            const taxonomy =
                especie.taxonomy || {};


            const campos = [

                identification
                    .scientificName,

                ...(identification
                    .commonNames || []),

                taxonomy.genus,

                taxonomy.species,

                taxonomy.family,

                taxonomy.order

            ];


            return campos.some(
                campo =>
                    String(campo || "")
                        .toLowerCase()
                        .includes(busqueda)
            );

        }
    );

}


function obtenerEspeciePorID(
    id
) {

    return database.find(
        especie =>
            especie.id === id
    ) || null;

}
```
