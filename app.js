```javascript
/* =========================================================
   TAXOID
   app.js
   Aplicación principal
========================================================= */

const DATABASE_URL = "especies.json";

let database = [];
let resultadosActuales = [];
let especieSeleccionada = null;


/* =========================================================
   INICIO
========================================================= */

document.addEventListener("DOMContentLoaded", iniciarAplicacion);


async function iniciarAplicacion() {

    configurarEventos();

    configurarImagen();

    await cargarBaseDatos();

}


/* =========================================================
   EVENTOS
========================================================= */

function configurarEventos() {

    const clase = document.getElementById("clase");
    const orden = document.getElementById("orden");
    const familia = document.getElementById("familia");

    const boton =
        document.getElementById("identifyButton");


    if (clase) {

        clase.addEventListener(
            "change",
            manejarCambioClase
        );

    }


    if (orden) {

        orden.addEventListener(
            "change",
            manejarCambioOrden
        );

    }


    if (familia) {

        familia.addEventListener(
            "change",
            manejarCambioFamilia
        );

    }


    if (boton) {

        boton.addEventListener(
            "click",
            identificar
        );

    }

}


/* =========================================================
   IMAGEN
========================================================= */

function configurarImagen() {

    const input =
        document.getElementById("imageInput");

    const preview =
        document.getElementById("preview");

    const uploadArea =
        document.getElementById("uploadArea");

    const imageInfo =
        document.getElementById("imageInfo");


    if (!input) return;


    input.addEventListener("change", () => {

        const file = input.files[0];

        if (!file) return;


        try {

            Reconocimiento.cargarImagen(file);

            const url =
                URL.createObjectURL(file);

            preview.src = url;

            preview.classList.add("visible");

            uploadArea.classList.add("has-image");


            imageInfo.textContent =
                `${file.name} · ${Math.round(file.size / 1024)} KB`;


            mostrarEstado(
                "Imagen cargada correctamente.",
                "success"
            );

        }

        catch (error) {

            mostrarError(error.message);

        }

    });

}


/* =========================================================
   BASE DE DATOS
========================================================= */

async function cargarBaseDatos() {

    mostrarEstado(
        "Cargando base taxonómica...",
        "loading"
    );


    try {

        const respuesta =
            await fetch(DATABASE_URL);


        if (!respuesta.ok) {

            throw new Error(
                `No se pudo cargar especies.json (${respuesta.status}).`
            );

        }


        database =
            await respuesta.json();


        if (!Array.isArray(database)) {

            throw new Error(
                "especies.json no contiene una lista válida."
            );

        }


        Taxonomia.inicializar(database);

        inicializarFiltros();

        actualizarEstadisticas();


        mostrarEstado(
            `${database.length} registros cargados correctamente.`,
            "success"
        );

    }

    catch (error) {

        console.error(error);

        mostrarError(
            "No se pudo cargar la base de datos. Verifica que especies.json esté en la misma carpeta que index.html."
        );

    }

}


/* =========================================================
   FILTROS TAXONÓMICOS
========================================================= */

function inicializarFiltros() {

    const clase =
        document.getElementById("clase");


    const clases =
        Taxonomia.obtenerValores(
            "taxonomy.class"
        );


    cargarOpciones(
        clase,
        clases,
        "Seleccionar clase"
    );

}


function manejarCambioClase() {

    const clase =
        document.getElementById("clase").value;


    const orden =
        document.getElementById("orden");


    const familia =
        document.getElementById("familia");


    const genero =
        document.getElementById("genero");


    const ordenes =
        Taxonomia.obtenerOrdenes(clase);


    cargarOpciones(
        orden,
        ordenes,
        "Seleccionar orden"
    );


    resetearSelect(
        familia,
        "Seleccionar familia"
    );


    resetearSelect(
        genero,
        "Seleccionar género"
    );

}


function manejarCambioOrden() {

    const clase =
        document.getElementById("clase").value;


    const orden =
        document.getElementById("orden").value;


    const familia =
        document.getElementById("familia");


    const genero =
        document.getElementById("genero");


    const familias =
        Taxonomia.obtenerFamilias(
            clase,
            orden
        );


    cargarOpciones(
        familia,
        familias,
        "Seleccionar familia"
    );


    resetearSelect(
        genero,
        "Seleccionar género"
    );

}


function manejarCambioFamilia() {

    const clase =
        document.getElementById("clase").value;


    const orden =
        document.getElementById("orden").value;


    const familia =
        document.getElementById("familia").value;


    const genero =
        document.getElementById("genero");


    const generos =
        Taxonomia.obtenerGeneros(
            clase,
            orden,
            familia
        );


    cargarOpciones(
        genero,
        generos,
        "Seleccionar género"
    );

}


function cargarOpciones(
    select,
    valores,
    textoInicial
) {

    if (!select) return;


    select.innerHTML = "";


    const inicial =
        document.createElement("option");


    inicial.value = "";

    inicial.textContent =
        textoInicial;

    select.appendChild(inicial);


    valores.forEach(valor => {

        const option =
            document.createElement("option");


        option.value = valor;

        option.textContent = valor;


        select.appendChild(option);

    });

}


function resetearSelect(
    select,
    texto
) {

    if (!select) return;


    select.innerHTML = "";


    const option =
        document.createElement("option");


    option.value = "";

    option.textContent = texto;


    select.appendChild(option);

}


/* =========================================================
   IDENTIFICACIÓN
========================================================= */

function obtenerCriterios() {

    return {

        clase:
            document.getElementById("clase").value,

        orden:
            document.getElementById("orden").value,

        familia:
            document.getElementById("familia").value,

        genero:
            document.getElementById("genero").value,

        patas:
            document.getElementById("patas").value,

        alas:
            document.getElementById("alas").value,

        antenas:
            document.getElementById("antenas").value,

        mouthparts:
            document.getElementById("aparatoBucal").value,

        symmetry:
            document.getElementById("simetria").value,

        segmentation:
            document.getElementById("segmentacion").value

    };

}


/* =========================================================
   CALCULAR COINCIDENCIAS
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

        mouthparts: 5,

        symmetry: 3,

        segmentation: 3

    };


    const seleccionados =
        Object.keys(pesos)
            .filter(
                clave =>
                    criterios[clave] !== ""
            );


    if (
        seleccionados.length === 0
    ) {

        return [];

    }


    const pesoTotal =
        seleccionados.reduce(
            (total, clave) =>
                total + pesos[clave],
            0
        );


    return database
        .map(especie => {

            let puntos = 0;


            for (
                const criterio
                of seleccionados
            ) {

                const valorBase =
                    obtenerValor(
                        especie,
                        criterio
                    );


                const valorUsuario =
                    criterios[criterio];


                if (
                    String(valorBase)
                    ===
                    String(valorUsuario)
                ) {

                    puntos +=
                        pesos[criterio];

                }

            }


            const porcentaje =
                pesoTotal > 0
                    ? Math.round(
                        (puntos / pesoTotal) * 100
                    )
                    : 0;


            return {

                especie,
                puntos,
                porcentaje

            };

        })


        .filter(
            resultado =>
                resultado.puntos > 0
        )


        .sort(
            (a,b) =>
                b.porcentaje - a.porcentaje
        );

}


/* =========================================================
   IDENTIFICAR
========================================================= */

function identificar() {

    if (database.length === 0) {

        mostrarError(
            "La base de datos todavía no está disponible."
        );

        return;

    }


    const criterios =
        obtenerCriterios();


    const hayCriterios =
        Object.values(criterios)
            .some(
                valor => valor !== ""
            );


    if (!hayCriterios) {

        mostrarError(
            "Selecciona al menos un carácter para realizar la identificación."
        );

        return;

    }


    mostrarEstado(
        "Analizando caracteres...",
        "loading"
    );


    resultadosActuales =
        calcularCoincidencias(
            criterios
        );


    if (
        resultadosActuales.length === 0
    ) {

        mostrarError(
            "No se encontraron coincidencias con los caracteres seleccionados."
        );

        return;

    }


    mostrarResultados(
        resultadosActuales
    );


    mostrarEstado(
        "Análisis completado correctamente.",
        "success"
    );


    document
        .getElementById("resultados")
        ?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

}


/* =========================================================
   MOSTRAR RESULTADOS
========================================================= */

function mostrarResultados(
    resultados
) {

    const empty =
        document.getElementById("emptyResult");


    const result =
        document.getElementById("result");


    if (!resultados.length) {

        empty.classList.remove("hidden");

        result.classList.add("hidden");

        return;

    }


    empty.classList.add("hidden");

    result.classList.remove("hidden");


    const mejor =
        resultados[0];


    especieSeleccionada =
        mejor.especie;


    mostrarMejorResultado(
        mejor
    );


    mostrarCandidatos(
        resultados
    );

}


function mostrarMejorResultado(
    resultado
) {

    const especie =
        resultado.especie;


    const tax =
        especie.taxonomy || {};


    escribir(
        "species",
        especie.identification?.scientificName
        || "Sin nombre"
    );


    escribir(
        "commonName",
        obtenerNombreComun(especie)
    );


    escribir(
        "resultNivel",
        especie.identification?.identificationLevel
        || "Resultado"
    );


    escribir(
        "resultReino",
        tax.kingdom || "—"
    );


    escribir(
        "resultFilo",
        tax.phylum || "—"
    );


    escribir(
        "resultClase",
        tax.class || "—"
    );


    escribir(
        "resultOrden",
        tax.order || "—"
    );


    escribir(
        "resultFamilia",
        tax.family || "—"
    );


    escribir(
        "resultGenero",
        tax.genus || "—"
    );


    escribir(
        "resultEspecie",
        tax.species || "—"
    );


    escribir(
        "confidenceText",
        `${resultado.porcentaje}%`
    );


    const bar =
        document.getElementById(
            "confidenceBar"
        );


    if (bar) {

        bar.style.width =
            `${resultado.porcentaje}%`;

    }


    mostrarImagen(especie);

    mostrarDetalles(especie);

}


/* =========================================================
   IMAGEN RESULTADO
========================================================= */

function mostrarImagen(
    especie
) {

    const imagen =
        document.getElementById(
            "speciesImage"
        );


    if (!imagen) return;


    const ruta =
        especie.images?.principal;


    if (ruta) {

        imagen.src = ruta;

        imagen.style.display =
            "block";

    }

    else {

        imagen.removeAttribute("src");

        imagen.style.display =
            "none";

    }

}


/* =========================================================
   DETALLES
========================================================= */

function mostrarDetalles(
    especie
) {

    const contenedor =
        document.getElementById(
            "taxonomicDetails"
        );


    if (!contenedor) return;


    const bio =
        especie.biology || {};

    const ecology =
        especie.ecology || {};

    const importance =
        especie.veterinaryImportance || {};

    const morphology =
        especie.morphology || {};


    contenedor.innerHTML = `

        <article class="detail-card">

            <h4>🔬 Morfología</h4>

            <p>
                Patas:
                ${morphology.legs ?? "—"}
            </p>

            <p>
                Alas:
                ${morphology.wings ? "Sí" : "No"}
            </p>

            <p>
                Antenas:
                ${morphology.antennae ? "Sí" : "No"}
            </p>

            <p>
                Aparato bucal:
                ${morphology.mouthparts || "—"}
            </p>

        </article>


        <article class="detail-card">

            <h4>🧬 Biología</h4>

            <p>
                ${bio.description || "Información no disponible."}
            </p>

        </article>


        <article class="detail-card">

            <h4>🌿 Ecología</h4>

            <p>
                ${ecology.habitat || "Información no disponible."}
            </p>

        </article>


        <article class="detail-card">

            <h4>🩺 Veterinaria</h4>

            <p>
                ${importance.description || "Información veterinaria no registrada."}
            </p>

        </article>

    `;

}


/* =========================================================
   CANDIDATOS
========================================================= */

function mostrarCandidatos(
    resultados
) {

    const contenedor =
        document.getElementById(
            "candidateList"
        );


    if (!contenedor) return;


    contenedor.innerHTML = "";


    resultados
        .slice(0,5)
        .forEach(
            (resultado,index) => {

                const especie =
                    resultado.especie;


                const tax =
                    especie.taxonomy || {};


                const nombre =
                    especie.identification
                        ?.scientificName
                    || "Sin nombre";


                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "candidate";


                item.innerHTML = `

                    <div class="candidate-rank">
                        ${index + 1}
                    </div>

                    <div>

                        <div class="candidate-name">
                            ${escaparHTML(nombre)}
                        </div>

                        <div class="candidate-family">
                            ${escaparHTML(
                                tax.family || "Familia no disponible"
                            )}
                        </div>

                    </div>

                    <div class="candidate-score">
                        ${resultado.porcentaje}%
                    </div>

                `;


                contenedor.appendChild(
                    item
                );

            }
        );

}


/* =========================================================
   ESTADÍSTICAS
========================================================= */

function actualizarEstadisticas() {

    const familias =
        new Set();

    const ordenes =
        new Set();


    database.forEach(
        especie => {

            if (
                especie.taxonomy?.family
            ) {

                familias.add(
                    especie.taxonomy.family
                );

            }


            if (
                especie.taxonomy?.order
            ) {

                ordenes.add(
                    especie.taxonomy.order
                );

            }

        }
    );


    escribir(
        "speciesCount",
        database.length
    );


    escribir(
        "familyCount",
        familias.size
    );


    escribir(
        "orderCount",
        ordenes.size
    );

}


/* =========================================================
   UTILIDADES
========================================================= */

function obtenerValor(
    especie,
    criterio
) {

    const morphology =
        especie.morphology || {};

    const taxonomy =
        especie.taxonomy || {};


    const mapa = {

        clase:
            taxonomy.class,

        orden:
            taxonomy.order,

        familia:
            taxonomy.family,

        genero:
            taxonomy.genus,

        patas:
            morphology.legs,

        alas:
            String(
                morphology.wings
            ),

        antenas:
            String(
                morphology.antennae
            ),

        mouthparts:
            morphology.mouthparts,

        symmetry:
            morphology.symmetry,

        segmentation:
            morphology.segmentation

    };


    return mapa[criterio];

}


function escribir(
    id,
    texto
) {

    const elemento =
        document.getElementById(id);


    if (elemento) {

        elemento.textContent =
            texto ?? "—";

    }

}


function obtenerNombreComun(
    especie
) {

    const nombres =
        especie.identification
            ?.commonNames;


    if (
        Array.isArray(nombres)
        &&
        nombres.length
    ) {

        return nombres.join(", ");

    }


    return "Nombre común no registrado";

}


function escaparHTML(
    texto
) {

    return String(texto)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");

}


function mostrarEstado(
    mensaje,
    tipo = ""
) {

    const estado =
        document.getElementById(
            "systemStatus"
        );


    if (!estado) return;


    estado.textContent =
        mensaje;


    estado.dataset.status =
        tipo;

}


function mostrarError(
    mensaje
) {

    mostrarEstado(
        mensaje,
        "error"
    );

}


/* API */

window.TaxoID = {

    identificar,

    buscarEspecie(nombre) {

        return database.filter(
            especie =>
                especie.identification
                    ?.scientificName
                    ?.toLowerCase()
                    .includes(
                        nombre.toLowerCase()
                    )
        );

    },

    obtenerEspeciePorID(id) {

        return database.find(
            especie =>
                especie.id === id
        );

    },

    obtenerBaseDatos() {

        return database;

    }

};
```
