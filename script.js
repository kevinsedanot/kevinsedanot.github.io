```javascript
/* ============================================================
   TAXOID
   Sistema de Identificación Taxonómica
   ------------------------------------------------------------
   Motor de consulta, filtrado y coincidencia morfológica.

   Estructura esperada:

   /index.html
   /css/style.css
   /js/app.js
   /data/especies.json
   /images/...
============================================================ */


/* ============================================================
   CONFIGURACIÓN
============================================================ */

const DATABASE_URL = "data/especies.json";

let database = [];

let resultadosActuales = [];

let especieSeleccionada = null;


/* ============================================================
   INICIALIZACIÓN
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    cargarBaseDatos();

    configurarImagen();

    configurarEventos();

});


/* ============================================================
   CARGAR BASE DE DATOS
============================================================ */

async function cargarBaseDatos() {

    try {

        const respuesta =
            await fetch(DATABASE_URL);

        if (!respuesta.ok) {

            throw new Error(
                `HTTP ${respuesta.status}`
            );

        }

        database =
            await respuesta.json();


        console.log(
            `TaxoID: ${database.length} registros cargados.`
        );


        resultadosActuales =
            [...database];


        inicializarFiltros();


        mostrarEstadoSistema(
            "Base de datos cargada correctamente",
            true
        );


    } catch (error) {

        console.error(
            "Error cargando especies.json:",
            error
        );


        mostrarEstadoSistema(
            "No se pudo cargar la base de datos",
            false
        );

    }

}


/* ============================================================
   ESTADO DEL SISTEMA
============================================================ */

function mostrarEstadoSistema(mensaje, correcto) {

    const estado =
        document.querySelector(".status");


    if (!estado)
        return;


    estado.innerHTML = `

        <span
            class="status-dot"
            style="
                background:
                ${correcto ? "#67d58b" : "#d9534f"};
            "
        ></span>

        ${mensaje}

    `;

}


/* ============================================================
   INICIALIZAR FILTROS
============================================================ */

function inicializarFiltros() {

    cargarOpciones(
        "clase",
        obtenerValoresUnicos(
            "taxonomia.clase"
        )
    );


    cargarOpciones(
        "orden",
        obtenerValoresUnicos(
            "taxonomia.orden"
        )
    );


    cargarOpciones(
        "familia",
        obtenerValoresUnicos(
            "taxonomia.familia"
        )
    );


    cargarOpciones(
        "genero",
        obtenerValoresUnicos(
            "taxonomia.genero"
        )
    );

}


/* ============================================================
   OBTENER VALORES ÚNICOS
============================================================ */

function obtenerValoresUnicos(ruta) {

    const valores = [];


    database.forEach(especie => {

        const valor =
            obtenerRuta(especie, ruta);


        if (
            valor &&
            !valores.includes(valor)
        ) {

            valores.push(valor);

        }

    });


    return valores.sort();

}


/* ============================================================
   OBTENER PROPIEDAD ANIDADA
============================================================ */

function obtenerRuta(objeto, ruta) {

    return ruta
        .split(".")
        .reduce(
            (actual, propiedad) =>
                actual?.[propiedad],
            objeto
        );

}


/* ============================================================
   CARGAR OPCIONES EN SELECT
============================================================ */

function cargarOpciones(id, opciones) {

    const select =
        document.getElementById(id);


    if (!select)
        return;


    const primeraOpcion =
        select.querySelector("option");


    select.innerHTML = "";


    const opcionInicial =
        document.createElement("option");


    opcionInicial.value = "";

    opcionInicial.textContent =
        primeraOpcion?.textContent ||
        "Seleccionar";


    select.appendChild(
        opcionInicial
    );


    opciones.forEach(valor => {

        const opcion =
            document.createElement("option");


        opcion.value =
            valor;

        opcion.textContent =
            valor;


        select.appendChild(
            opcion
        );

    });

}


/* ============================================================
   CONFIGURAR EVENTOS
============================================================ */

function configurarEventos() {

    const campos = [
        "clase",
        "orden",
        "familia",
        "genero",
        "patas",
        "alas",
        "antenas"
    ];


    campos.forEach(id => {

        const elemento =
            document.getElementById(id);


        if (elemento) {

            elemento.addEventListener(
                "change",
                actualizarFiltros
            );

        }

    });

}


/* ============================================================
   ACTUALIZAR FILTROS
============================================================ */

function actualizarFiltros() {

    const clase =
        obtenerValor("clase");


    const orden =
        obtenerValor("orden");


    const familia =
        obtenerValor("familia");


    const genero =
        obtenerValor("genero");


    let filtradas =
        [...database];


    if (clase) {

        filtradas =
            filtradas.filter(
                especie =>
                    especie.taxonomia?.clase === clase
            );

    }


    if (orden) {

        filtradas =
            filtradas.filter(
                especie =>
                    especie.taxonomia?.orden === orden
            );

    }


    if (familia) {

        filtradas =
            filtradas.filter(
                especie =>
                    especie.taxonomia?.familia === familia
            );

    }


    if (genero) {

        filtradas =
            filtradas.filter(
                especie =>
                    especie.taxonomia?.genero === genero
            );

    }


    resultadosActuales =
        filtradas;


    actualizarFiltrosDependientes(
        filtradas
    );


    console.log(
        "Especies compatibles:",
        filtradas.length
    );

}


/* ============================================================
   FILTROS DEPENDIENTES
============================================================ */

function actualizarFiltrosDependientes(
    especies
) {

    const ordenes =
        [...new Set(
            especies
                .map(
                    e => e.taxonomia?.orden
                )
                .filter(Boolean)
        )]
        .sort();


    const familias =
        [...new Set(
            especies
                .map(
                    e => e.taxonomia?.familia
                )
                .filter(Boolean)
        )]
        .sort();


    const generos =
        [...new Set(
            especies
                .map(
                    e => e.taxonomia?.genero
                )
                .filter(Boolean)
        )]
        .sort();


    actualizarSelect(
        "orden",
        ordenes
    );


    actualizarSelect(
        "familia",
        familias
    );


    actualizarSelect(
        "genero",
        generos
    );

}


/* ============================================================
   ACTUALIZAR SELECT
============================================================ */

function actualizarSelect(
    id,
    valores
) {

    const select =
        document.getElementById(id);


    if (!select)
        return;


    const valorActual =
        select.value;


    select.innerHTML = "";


    const inicial =
        document.createElement(
            "option"
        );


    inicial.value = "";

    inicial.textContent =
        "Seleccionar";


    select.appendChild(
        inicial
    );


    valores.forEach(valor => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            valor;

        option.textContent =
            valor;


        select.appendChild(
            option
        );

    });


    if (
        valores.includes(valorActual)
    ) {

        select.value =
            valorActual;

    }

}


/* ============================================================
   OBTENER VALOR
============================================================ */

function obtenerValor(id) {

    const elemento =
        document.getElementById(id);


    return elemento
        ? elemento.value
        : "";

}


/* ============================================================
   CONFIGURAR IMAGEN
============================================================ */

function configurarImagen() {

    const input =
        document.getElementById(
            "imageInput"
        );


    if (!input)
        return;


    input.addEventListener(
        "change",
        evento => {

            const archivo =
                evento.target.files[0];


            if (!archivo)
                return;


            const preview =
                document.getElementById(
                    "preview"
                );


            if (!preview)
                return;


            preview.src =
                URL.createObjectURL(
                    archivo
                );


            preview.style.display =
                "block";


            const icono =
                document.getElementById(
                    "uploadIcon"
                );


            if (icono) {

                icono.style.display =
                    "none";

            }

        }
    );

}


/* ============================================================
   IDENTIFICACIÓN
============================================================ */

function identificar() {

    if (!database.length) {

        mostrarError(
            "La base de datos todavía no está disponible."
        );

        return;

    }


    const criterios =
        obtenerCriterios();


    const candidatos =
        calcularCoincidencias(
            criterios
        );


    resultadosActuales =
        candidatos;


    mostrarResultados(
        candidatos
    );

}


/* ============================================================
   OBTENER CRITERIOS
============================================================ */

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
            obtenerValor("antenas")

    };

}


/* ============================================================
   MOTOR DE COINCIDENCIA
============================================================ */

function calcularCoincidencias(
    criterios
) {

    const resultados =
        database.map(especie => {

            let puntos = 0;

            let posibles = 0;


            /* -----------------------------------------------
               CLASE
            ------------------------------------------------ */

            if (criterios.clase) {

                posibles += 20;


                if (
                    especie.taxonomia?.clase ===
                    criterios.clase
                ) {

                    puntos += 20;

                }

            }


            /* -----------------------------------------------
               ORDEN
            ------------------------------------------------ */

            if (criterios.orden) {

                posibles += 20;


                if (
                    especie.taxonomia?.orden ===
                    criterios.orden
                ) {

                    puntos += 20;

                }

            }


            /* -----------------------------------------------
               FAMILIA
            ------------------------------------------------ */

            if (criterios.familia) {

                posibles += 15;


                if (
                    especie.taxonomia?.familia ===
                    criterios.familia
                ) {

                    puntos += 15;

                }

            }


            /* -----------------------------------------------
               GÉNERO
            ------------------------------------------------ */

            if (criterios.genero) {

                posibles += 15;


                if (
                    especie.taxonomia?.genero ===
                    criterios.genero
                ) {

                    puntos += 15;

                }

            }


            /* -----------------------------------------------
               PATAS
            ------------------------------------------------ */

            if (criterios.patas) {

                posibles += 10;


                const patas =
                    Number(
                        criterios.patas
                    );


                if (
                    especie.morfologia
                        ?.numero_patas === patas
                ) {

                    puntos += 10;

                }

            }


            /* -----------------------------------------------
               ALAS
            ------------------------------------------------ */

            if (criterios.alas) {

                posibles += 10;


                const tieneAlas =
                    criterios.alas === "si";


                if (
                    especie.morfologia
                        ?.alas
                        ?.presencia === tieneAlas
                ) {

                    puntos += 10;

                }

            }


            /* -----------------------------------------------
               ANTENAS
            ------------------------------------------------ */

            if (criterios.antenas) {

                posibles += 10;


                const tieneAntenas =
                    criterios.antenas === "si";


                if (
                    especie.morfologia
                        ?.antenas
                        ?.presencia === tieneAntenas
                ) {

                    puntos += 10;

                }

            }


            /* -----------------------------------------------
               PORCENTAJE
            ------------------------------------------------ */

            const porcentaje =
                posibles > 0
                    ? Math.round(
                        (puntos / posibles) * 100
                    )
                    : 0;


            return {

                especie,

                puntos,

                porcentaje

            };

        });


    return resultados

        .filter(
            resultado =>
                resultado.porcentaje > 0
        )

        .sort(
            (a, b) =>
                b.porcentaje -
                a.porcentaje
        );

}


/* ============================================================
   MOSTRAR RESULTADOS
============================================================ */

function mostrarResultados(
    resultados
) {

    const contenedor =
        document.getElementById(
            "result"
        );


    const vacio =
        document.getElementById(
            "emptyResult"
        );


    if (!contenedor)
        return;


    if (!resultados.length) {

        if (vacio) {

            vacio.style.display =
                "block";

            vacio.innerHTML = `

                <div>⚠️</div>

                <h3>
                    Sin coincidencias
                </h3>

                <p>
                    No se encontraron organismos
                    compatibles con los caracteres
                    seleccionados.
                </p>

            `;

        }


        contenedor.style.display =
            "none";


        return;

    }


    if (vacio) {

        vacio.style.display =
            "none";

    }


    contenedor.style.display =
        "block";


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


/* ============================================================
   MOSTRAR MEJOR RESULTADO
============================================================ */

function mostrarMejorResultado(
    resultado
) {

    const especie =
        resultado.especie;


    escribir(
        "species",
        especie.identificacion
            ?.nombre_cientifico ||
        "Taxón no determinado"
    );


    escribir(
        "commonName",
        especie.identificacion
            ?.nombre_comun
            ?.join(", ") ||
        "Nombre común no disponible"
    );


    escribir(
        "confidenceText",
        resultado.porcentaje + "%"
    );


    const barra =
        document.getElementById(
            "confidenceBar"
        );


    if (barra) {

        barra.style.width =
            resultado.porcentaje + "%";

    }


    mostrarTaxonomia(
        especie
    );


    mostrarDetalles(
        especie
    );


    mostrarImagen(
        especie
    );

}


/* ============================================================
   MOSTRAR TAXONOMÍA
============================================================ */

function mostrarTaxonomia(
    especie
) {

    const taxonomia =
        especie.taxonomia || {};


    escribir(
        "resultReino",
        taxonomia.reino
    );


    escribir(
        "resultFilo",
        taxonomia.filo
    );


    escribir(
        "resultClase",
        taxonomia.clase
    );


    escribir(
        "resultOrden",
        taxonomia.orden
    );


    escribir(
        "resultFamilia",
        taxonomia.familia
    );


    escribir(
        "resultGenero",
        taxonomia.genero
    );


    escribir(
        "resultEspecie",
        taxonomia.especie
    );

}


/* ============================================================
   MOSTRAR DETALLES
============================================================ */

function mostrarDetalles(
    especie
) {

    const contenedor =
        document.getElementById(
            "taxonomicDetails"
        );


    if (!contenedor)
        return;


    const morfologia =
        especie.morfologia || {};


    const ecologia =
        especie.ecologia || {};


    const importancia =
        especie.importancia || {};


    const caracteres =
        especie.caracteres_diagnosticos ||
        [];


    contenedor.innerHTML = `

        <div class="detail-section">

            <h4>
                🔬 Caracteres diagnósticos
            </h4>

            <ul>

                ${caracteres
                    .map(
                        caracter =>
                            `<li>${caracter}</li>`
                    )
                    .join("")
                }

            </ul>

        </div>


        <div class="detail-section">

            <h4>
                🧬 Morfología
            </h4>

            <p>
                <strong>Patas:</strong>
                ${morfologia.numero_patas ?? "—"}
            </p>

            <p>
                <strong>Simetría:</strong>
                ${morfologia.simetria ?? "—"}
            </p>

            <p>
                <strong>Segmentación:</strong>
                ${morfologia.segmentacion ?? "—"}
            </p>

            <p>
                <strong>Aparato bucal:</strong>
                ${morfologia.aparato_bucal?.tipo ?? "—"}
            </p>

        </div>


        <div class="detail-section">

            <h4>
                🌎 Ecología
            </h4>

            <p>
                <strong>Hábitat:</strong>
                ${ecologia.habitat?.join(", ") ?? "—"}
            </p>

            <p>
                <strong>Alimentación:</strong>
                ${ecologia.alimentacion?.join(", ") ?? "—"}
            </p>

            <p>
                <strong>Rol ecológico:</strong>
                ${ecologia.rol_ecologico?.join(", ") ?? "—"}
            </p>

        </div>


        <div class="detail-section">

            <h4>
                🩺 Importancia
            </h4>

            <p>
                <strong>Veterinaria:</strong>
                ${importancia.veterinaria ?? "—"}
            </p>

            <p>
                <strong>Salud pública:</strong>
                ${importancia.salud_publica ?? "—"}
            </p>

            <p>
                <strong>Ecológica:</strong>
                ${importancia.ecologica ?? "—"}
            </p>

        </div>

    `;

}


/* ============================================================
   MOSTRAR IMAGEN
============================================================ */

function mostrarImagen(
    especie
) {

    const imagen =
        document.getElementById(
            "speciesImage"
        );


    if (!imagen)
        return;


    const ruta =
        especie.imagenes?.principal;


    if (!ruta) {

        imagen.style.display =
            "none";

        return;

    }


    imagen.src =
        ruta;


    imagen.alt =
        especie.identificacion
            ?.nombre_cientifico ||
        "Espécimen";


    imagen.style.display =
        "block";


    imagen.onerror = () => {

        imagen.style.display =
            "none";

        console.warn(
            "No se encontró:",
            ruta
        );

    };

}


/* ============================================================
   MOSTRAR CANDIDATOS
============================================================ */

function mostrarCandidatos(
    resultados
) {

    const contenedor =
        document.getElementById(
            "candidateList"
        );


    if (!contenedor)
        return;


    contenedor.innerHTML = "";


    resultados
        .slice(0, 5)
        .forEach((resultado, indice) => {

            const especie =
                resultado.especie;


            const nombre =
                especie.identificacion
                    ?.nombre_cientifico ||
                "Taxón desconocido";


            const tarjeta =
                document.createElement(
                    "div"
                );


            tarjeta.className =
                "candidate";


            tarjeta.innerHTML = `

                <div>

                    <strong>
                        ${indice + 1}.
                        ${nombre}
                    </strong>

                    <small>
                        ${especie.taxonomia?.familia || ""}
                    </small>

                </div>


                <span>
                    ${resultado.porcentaje}%
                </span>

            `;


            tarjeta.addEventListener(
                "click",
                () => {

                    especieSeleccionada =
                        especie;


                    mostrarMejorResultado(
                        resultado
                    );

                }
            );


            contenedor.appendChild(
                tarjeta
            );

        });

}


/* ============================================================
   BUSCADOR POR NOMBRE
============================================================ */

function buscarEspecie(
    termino
) {

    const texto =
        termino
            .toLowerCase()
            .trim();


    if (!texto) {

        return database;

    }


    return database.filter(
        especie => {

            const cientifico =
                especie.identificacion
                    ?.nombre_cientifico
                    ?.toLowerCase() || "";


            const comunes =
                especie.identificacion
                    ?.nombre_comun
                    ?.join(" ")
                    ?.toLowerCase() || "";


            const genero =
                especie.taxonomia
                    ?.genero
                    ?.toLowerCase() || "";


            return (

                cientifico.includes(texto) ||

                comunes.includes(texto) ||

                genero.includes(texto)

            );

        }
    );

}


/* ============================================================
   OBTENER ESPECIE POR ID
============================================================ */

function obtenerEspeciePorID(
    id
) {

    return database.find(
        especie =>
            especie.id === id
    );

}


/* ============================================================
   FUNCIÓN PARA MOSTRAR TEXTO
============================================================ */

function escribir(
    id,
    valor
) {

    const elemento =
        document.getElementById(id);


    if (!elemento)
        return;


    elemento.textContent =
        valor || "—";

}


/* ============================================================
   ERROR
============================================================ */

function mostrarError(
    mensaje
) {

    console.error(
        mensaje
    );


    alert(
        mensaje
    );

}


/* ============================================================
   API INTERNA
   Permite utilizar el motor desde
   otros archivos JavaScript.
============================================================ */

window.TaxoID = {

    identificar,

    buscarEspecie,

    obtenerEspeciePorID,

    obtenerBaseDatos:
        () => database,

    obtenerResultados:
        () => resultadosActuales

};
```
