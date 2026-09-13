```javascript
const DATABASE_URL = "especies.json";


let database = [];

let resultadosActuales = [];

let especieSeleccionada = null;



document.addEventListener(
    "DOMContentLoaded",
    iniciarAplicacion
);



async function iniciarAplicacion() {

    configurarEventos();

    await cargarBaseDatos();

}



function configurarEventos() {

    const clase =
        document.getElementById("clase");

    const orden =
        document.getElementById("orden");

    const familia =
        document.getElementById("familia");

    const boton =
        document.getElementById("identifyButton");


    clase.addEventListener(
        "change",
        manejarCambioClase
    );


    orden.addEventListener(
        "change",
        manejarCambioOrden
    );


    familia.addEventListener(
        "change",
        manejarCambioFamilia
    );


    boton.addEventListener(
        "click",
        identificar
    );


    configurarImagen();


    document
        .getElementById("searchScientificButton")
        .addEventListener(
            "click",
            buscarNombresCientificos
        );


    document
        .getElementById("scientificSearch")
        .addEventListener(
            "input",
            buscarNombresCientificos
        );

}



async function cargarBaseDatos() {

    try {

        mostrarEstado(
            "Cargando base taxonómica..."
        );


        const respuesta =
            await fetch(
                DATABASE_URL +
                "?v=" +
                Date.now()
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudo cargar especies.json"
            );

        }


        database =
            await respuesta.json();


        if (!Array.isArray(database)) {

            throw new Error(
                "especies.json debe contener un arreglo."
            );

        }


        Taxonomia.inicializar(
            database
        );


        inicializarFiltros();

        actualizarEstadisticas();

        mostrarEstado(
            "Base taxonómica cargada correctamente."
        );


        mostrarCatalogoVeterinario();

    }
    catch (error) {

        console.error(error);

        mostrarEstado(
            "Error cargando la base de datos.",
            true
        );

    }

}



function inicializarFiltros() {

    const clases =
        Taxonomia.obtenerClases();


    cargarOpciones(
        "clase",
        clases,
        "Todas"
    );


    resetearSelect(
        "orden",
        "Todos"
    );


    resetearSelect(
        "familia",
        "Todas"
    );


    resetearSelect(
        "genero",
        "Todos"
    );

}



function manejarCambioClase() {

    const clase =
        document.getElementById(
            "clase"
        ).value;


    const ordenes =
        Taxonomia.obtenerOrdenes(
            clase
        );


    cargarOpciones(
        "orden",
        ordenes,
        "Todos"
    );


    resetearSelect(
        "familia",
        "Todas"
    );


    resetearSelect(
        "genero",
        "Todos"
    );

}



function manejarCambioOrden() {

    const clase =
        document.getElementById(
            "clase"
        ).value;


    const orden =
        document.getElementById(
            "orden"
        ).value;


    const familias =
        Taxonomia.obtenerFamilias(
            clase,
            orden
        );


    cargarOpciones(
        "familia",
        familias,
        "Todas"
    );


    resetearSelect(
        "genero",
        "Todos"
    );

}



function manejarCambioFamilia() {

    const clase =
        document.getElementById(
            "clase"
        ).value;


    const orden =
        document.getElementById(
            "orden"
        ).value;


    const familia =
        document.getElementById(
            "familia"
        ).value;


    const generos =
        Taxonomia.obtenerGeneros(
            clase,
            orden,
            familia
        );


    cargarOpciones(
        "genero",
        generos,
        "Todos"
    );

}



function cargarOpciones(
    id,
    valores,
    textoInicial
) {

    const select =
        document.getElementById(id);


    select.innerHTML = "";


    const inicial =
        document.createElement(
            "option"
        );


    inicial.value = "";

    inicial.textContent =
        textoInicial;


    select.appendChild(
        inicial
    );


    valores.forEach(valor => {

        const option =
            document.createElement(
                "option"
            );


        option.value = valor;

        option.textContent = valor;


        select.appendChild(
            option
        );

    });

}



function resetearSelect(
    id,
    texto
) {

    const select =
        document.getElementById(id);


    select.innerHTML =
        `<option value="">${texto}</option>`;

}



function configurarImagen() {

    const input =
        document.getElementById(
            "imageInput"
        );


    const preview =
        document.getElementById(
            "preview"
        );


    input.addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];


            if (!file) {

                preview.style.display =
                    "none";

                return;

            }


            try {

                Reconocimiento.cargarImagen(
                    file
                );


                preview.src =
                    URL.createObjectURL(
                        file
                    );


                preview.style.display =
                    "block";

            }
            catch (error) {

                alert(
                    error.message
                );

            }

        }
    );

}



function obtenerCriterios() {

    return {

        clase:
            document.getElementById(
                "clase"
            ).value,

        orden:
            document.getElementById(
                "orden"
            ).value,

        familia:
            document.getElementById(
                "familia"
            ).value,

        genero:
            document.getElementById(
                "genero"
            ).value,

        patas:
            document.getElementById(
                "patas"
            ).value,

        alas:
            document.getElementById(
                "alas"
            ).value,

        antenas:
            document.getElementById(
                "antenas"
            ).value,

        aparatoBucal:
            document.getElementById(
                "aparatoBucal"
            ).value,

        simetria:
            document.getElementById(
                "simetria"
            ).value,

        segmentacion:
            document.getElementById(
                "segmentacion"
            ).value

    };

}



function identificar() {

    const criterios =
        obtenerCriterios();


    const tieneCriterio =
        Object.values(
            criterios
        ).some(
            valor =>
                valor !== ""
        );


    if (!tieneCriterio) {

        mostrarEstado(
            "Selecciona al menos una característica.",
            true
        );

        return;

    }


    resultadosActuales =
        calcularCoincidencias(
            criterios
        );


    if (
        resultadosActuales.length === 0
    ) {

        mostrarEstado(
            "No se encontraron coincidencias.",
            true
        );

        return;

    }


    mostrarResultados(
        resultadosActuales
    );

}



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
        database.map(
            especie => {

                const morphology =
                    especie.morphology || {};

                const tax =
                    especie.taxonomy || {};


                const valores = {

                    clase:
                        tax.class || "",

                    orden:
                        tax.order || "",

                    familia:
                        tax.family || "",

                    genero:
                        tax.genus || "",

                    patas:
                        String(
                            morphology.legs ??
                            ""
                        ),

                    alas:
                        String(
                            morphology.wings ??
                            ""
                        ),

                    antenas:
                        String(
                            morphology.antennae ??
                            ""
                        ),

                    aparatoBucal:
                        morphology.mouthparts ||
                        "",

                    simetria:
                        morphology.symmetry ||
                        "",

                    segmentacion:
                        morphology.segmentation ||
                        ""

                };


                let puntos = 0;

                let posibles = 0;


                Object.keys(
                    pesos
                ).forEach(
                    criterio => {

                        const seleccionado =
                            criterios[
                                criterio
                            ];


                        if (
                            seleccionado === ""
                        ) {

                            return;

                        }


                        posibles +=
                            pesos[
                                criterio
                            ];


                        if (
                            String(
                                valores[
                                    criterio
                                ]
                            ).toLowerCase()
                            ===
                            String(
                                seleccionado
                            ).toLowerCase()
                        ) {

                            puntos +=
                                pesos[
                                    criterio
                                ];

                        }

                    }
                );


                const porcentaje =
                    posibles > 0
                        ? Math.round(
                            (
                                puntos /
                                posibles
                            ) * 100
                        )
                        : 0;


                return {

                    especie,

                    porcentaje

                };

            }
        );


    return resultados
        .filter(
            resultado =>
                resultado.porcentaje > 0
        )
        .sort(
            (a,b) =>
                b.porcentaje -
                a.porcentaje
        );

}



function mostrarResultados(
    resultados
) {

    const mejor =
        resultados[0];


    especieSeleccionada =
        mejor.especie;


    document
        .getElementById(
            "emptyResult"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "result"
        )
        .classList.remove(
            "hidden"
        );


    const especie =
        mejor.especie;


    escribir(
        "species",
        especie.identification?.scientificName ||
        especie.scientificName ||
        "Sin nombre"
    );


    escribir(
        "commonName",
        obtenerNombreComun(
            especie
        )
    );


    escribir(
        "resultNivel",
        especie.identification?.identificationLevel ||
        "ESPECIE"
    );


    const porcentaje =
        mejor.porcentaje;


    escribir(
        "confidenceText",
        porcentaje + "%"
    );


    document
        .getElementById(
            "confidenceBar"
        )
        .style.width =
        porcentaje + "%";


    const tax =
        especie.taxonomy || {};


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


    mostrarImagen(
        especie
    );


    mostrarDetalles(
        especie
    );


    mostrarVeterinaria(
        especie
    );


    mostrarCandidatos(
        resultados
    );


    document
        .getElementById(
            "resultados"
        )
        .scrollIntoView({
            behavior: "smooth"
        });

}



function mostrarImagen(
    especie
) {

    const img =
        document.getElementById(
            "speciesImage"
        );


    const ruta =
        especie.images?.[0] ||
        especie.imageRecognition?.primary ||
        "";


    if (!ruta) {

        img.style.display =
            "none";

        return;

    }


    img.src = ruta;

    img.style.display =
        "block";

}



function mostrarDetalles(
    especie
) {

    const contenedor =
        document.getElementById(
            "taxonomicDetails"
        );


    const caracteres =
        especie.diagnosticCharacters ||
        [];


    contenedor.innerHTML = `

        <h3>🔎 Caracteres diagnósticos</h3>

        ${
            caracteres.length
                ? `<ul>
                    ${caracteres.map(
                        caracter =>
                            `<li>${escaparHTML(
                                caracter
                            )}</li>`
                    ).join("")}
                   </ul>`
                : `<p class="muted">
                    No hay caracteres registrados.
                   </p>`
        }

    `;

}



function mostrarVeterinaria(
    especie
) {

    const contenedor =
        document.getElementById(
            "veterinaryDetails"
        );


    const vet =
        especie.veterinaryImportance ||
        {};


    const enfermedades =
        vet.diseases ||
        [];


    let html = "";


    if (
        vet.importance
    ) {

        html += `
            <p>
                <strong>Importancia:</strong>
                ${escaparHTML(
                    vet.importance
                )}
            </p>
        `;

    }


    if (
        enfermedades.length
    ) {

        html += `
            <h4>Enfermedades o problemas asociados</h4>
        `;


        enfermedades.forEach(
            enfermedad => {

                html += `

                    <div class="disease">

                        <strong>
                            ${escaparHTML(
                                enfermedad.name
                            )}
                        </strong>

                        <p>
                            ${escaparHTML(
                                enfermedad.description ||
                                ""
                            )}
                        </p>

                        <p>
                            <b>Transmisión:</b>
                            ${escaparHTML(
                                enfermedad.transmission ||
                                "No registrada"
                            )}
                        </p>

                        <p>
                            <b>Control:</b>
                            ${escaparHTML(
                                enfermedad.control ||
                                "Consultar protocolo veterinario."
                            )}
                        </p>

                    </div>

                `;

            }
        );

    }
    else {

        html += `
            <p class="muted">
                No existen registros veterinarios
                específicos en la base actual.
            </p>
        `;

    }


    contenedor.innerHTML =
        html;

}



function mostrarCandidatos(
    resultados
) {

    const contenedor =
        document.getElementById(
            "candidateList"
        );


    const candidatos =
        resultados.slice(
            1,
            6
        );


    if (!candidatos.length) {

        contenedor.innerHTML =
            `<p class="muted">
                No hay otros diferenciales.
             </p>`;

        return;

    }


    contenedor.innerHTML =
        candidatos.map(
            resultado => {

                const especie =
                    resultado.especie;


                const nombre =
                    especie.identification?.scientificName ||
                    especie.scientificName ||
                    "Sin nombre";


                return `

                    <div class="candidate-card">

                        <strong>
                            <i>
                                ${escaparHTML(
                                    nombre
                                )}
                            </i>
                        </strong>

                        <span class="candidate-score">
                            ${resultado.porcentaje}%
                        </span>

                    </div>

                `;

            }
        ).join("");

}



function mostrarCatalogoVeterinario(
    termino = ""
) {

    const contenedor =
        document.getElementById(
            "scientificResults"
        );


    const busqueda =
        termino
            .trim()
            .toLowerCase();


    const resultados =
        database.filter(
            especie => {

                const nombre =
                    (
                        especie.identification?.scientificName ||
                        especie.scientificName ||
                        ""
                    ).toLowerCase();


                const comunes =
                    obtenerNombreComun(
                        especie
                    ).toLowerCase();


                return (
                    !busqueda ||
                    nombre.includes(
                        busqueda
                    ) ||
                    comunes.includes(
                        busqueda
                    )
                );

            }
        );


    if (!resultados.length) {

        contenedor.innerHTML =
            `<p class="muted">
                No se encontraron especies.
             </p>`;

        return;

    }


    contenedor.innerHTML =
        resultados.map(
            especie => {

                const nombre =
                    especie.identification?.scientificName ||
                    especie.scientificName ||
                    "Sin nombre";


                const enfermedades =
                    especie.veterinaryImportance?.diseases ||
                    [];


                return `

                    <article class="scientific-card">

                        <h3>
                            ${escaparHTML(
                                nombre
                            )}
                        </h3>

                        <p class="common">
                            ${escaparHTML(
                                obtenerNombreComun(
                                    especie
                                )
                            )}
                        </p>

                        <p>
                            <b>Orden:</b>
                            ${escaparHTML(
                                especie.taxonomy?.order ||
                                "—"
                            )}
                        </p>

                        <p>
                            <b>Familia:</b>
                            ${escaparHTML(
                                especie.taxonomy?.family ||
                                "—"
                            )}
                        </p>

                        ${
                            enfermedades.length
                                ? enfermedades.map(
                                    enfermedad =>
                                        `<div class="disease">

                                            <strong>
                                                ${escaparHTML(
                                                    enfermedad.name
                                                )}
                                            </strong>

                                            <p>
                                                ${escaparHTML(
                                                    enfermedad.description ||
                                                    ""
                                                )}
                                            </p>

                                        </div>`
                                ).join("")
                                :
                                `<p class="muted">
                                    Sin enfermedad veterinaria registrada.
                                 </p>`
                        }

                    </article>

                `;

            }
        ).join("");

}



function buscarNombresCientificos() {

    const termino =
        document
            .getElementById(
                "scientificSearch"
            )
            .value;


    mostrarCatalogoVeterinario(
        termino
    );

}



function actualizarEstadisticas() {

    const especies =
        database.length;


    const familias =
        new Set(
            database.map(
                especie =>
                    especie.taxonomy?.family
            )
        ).size;


    const ordenes =
        new Set(
            database.map(
                especie =>
                    especie.taxonomy?.order
            )
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



function obtenerNombreComun(
    especie
) {

    const nombres =
        especie.identification?.commonNames;


    if (
        Array.isArray(nombres)
    ) {

        return nombres.join(
            ", "
        );

    }


    return (
        especie.commonName ||
        "Nombre común no registrado"
    );

}



function escribir(
    id,
    texto
) {

    const elemento =
        document.getElementById(id);


    if (elemento) {

        elemento.textContent =
            texto;

    }

}



function escaparHTML(
    texto
) {

    return String(
        texto ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}



function mostrarEstado(
    mensaje,
    error = false
) {

    const elemento =
        document.getElementById(
            "systemStatus"
        );


    elemento.textContent =
        mensaje;


    elemento.style.color =
        error
            ? "#c0392b"
            : "#087f76";

}



window.TaxoID = {

    obtenerBaseDatos() {

        return database;

    },

    buscarEspecie(
        nombre
    ) {

        return database.filter(
            especie => {

                const cientifico =
                    especie.identification?.scientificName ||
                    especie.scientificName ||
                    "";

                return cientifico
                    .toLowerCase()
                    .includes(
                        nombre.toLowerCase()
                    );

            }
        );

    }

};
```
