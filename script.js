```javascript
const DATABASE_URL = "especies.json";

let database = [];
let resultadosActuales = [];


document.addEventListener(
    "DOMContentLoaded",
    iniciarAplicacion
);



async function iniciarAplicacion() {

    configurarEventos();

    try {

        const respuesta =
            await fetch(DATABASE_URL);

        if (!respuesta.ok) {

            throw new Error(
                "No se pudo cargar especies.json"
            );
        }

        database =
            await respuesta.json();

        Taxonomia.inicializar(database);

        cargarOrdenes();

        actualizarEstadisticas();

        mostrarEstado(
            "Base de datos cargada correctamente.",
            "success"
        );

    } catch (error) {

        console.error(error);

        mostrarEstado(
            "No se pudo cargar la base de datos. Verifique especies.json.",
            "error"
        );
    }
}



function configurarEventos() {

    document
        .getElementById("clase")
        .addEventListener(
            "change",
            cargarOrdenes
        );


    document
        .getElementById("orden")
        .addEventListener(
            "change",
            cargarFamilias
        );


    document
        .getElementById("familia")
        .addEventListener(
            "change",
            cargarGeneros
        );


    document
        .getElementById("imageInput")
        .addEventListener(
            "change",
            manejarImagen
        );


    document
        .getElementById("identifyButton")
        .addEventListener(
            "click",
            identificar
        );


    document
        .getElementById("directSearchButton")
        .addEventListener(
            "click",
            buscarEspecie
        );


    document
        .getElementById("speciesSearch")
        .addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    buscarEspecie();
                }
            }
        );
}



function cargarOrdenes() {

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
        "Todos los órdenes"
    );


    cargarFamilias();
}



function cargarFamilias() {

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
        "Todas las familias"
    );


    cargarGeneros();
}



function cargarGeneros() {

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
        "Todos los géneros"
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

    select.appendChild(inicial);


    valores.forEach(valor => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            valor;

        option.textContent =
            valor;

        select.appendChild(option);

    });
}



function manejarImagen(event) {

    const archivo =
        event.target.files[0];

    if (!archivo) return;


    const preview =
        document.getElementById(
            "preview"
        );


    const icon =
        document.getElementById(
            "uploadIcon"
        );


    preview.src =
        URL.createObjectURL(
            archivo
        );


    preview.style.display =
        "block";


    icon.style.display =
        "none";


    if (
        window.Reconocimiento &&
        typeof Reconocimiento.cargarImagen ===
        "function"
    ) {

        try {

            Reconocimiento.cargarImagen(
                archivo
            );

        } catch (error) {

            mostrarEstado(
                error.message,
                "error"
            );
        }
    }
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

        mouthparts:
            document.getElementById(
                "aparatoBucal"
            ).value,

        symmetry:
            document.getElementById(
                "simetria"
            ).value,

        segmentation:
            document.getElementById(
                "segmentacion"
            ).value
    };
}



function identificar() {

    if (!database.length) {

        mostrarEstado(
            "La base de datos está vacía.",
            "error"
        );

        return;
    }


    const criterios =
        obtenerCriterios();


    const activos =
        Object.values(criterios)
            .filter(
                valor =>
                    valor !== ""
            );


    if (!activos.length) {

        mostrarEstado(
            "Seleccione al menos una característica.",
            "error"
        );

        return;
    }


    resultadosActuales =
        calcularCoincidencias(
            criterios
        );


    if (
        !resultadosActuales.length
    ) {

        mostrarEstado(
            "No se encontraron coincidencias.",
            "error"
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
        antenas: 6,

        mouthparts: 5,
        symmetry: 3,
        segmentation: 4
    };


    const activos =
        Object.keys(criterios)
            .filter(
                key =>
                    criterios[key] !== ""
            );


    return database
        .map(especie => {

            const tax =
                especie.taxonomy || {};

            const morph =
                especie.morphology || {};


            const valores = {

                clase:
                    tax.class,

                orden:
                    tax.order,

                familia:
                    tax.family,

                genero:
                    tax.genus,

                patas:
                    String(
                        morph.legs ?? ""
                    ),

                alas:
                    String(
                        morph.wings ?? ""
                    ),

                antenas:
                    String(
                        morph.antennae ?? ""
                    ),

                mouthparts:
                    normalizar(
                        morph.mouthparts
                    ),

                symmetry:
                    normalizar(
                        morph.symmetry
                    ),

                segmentation:
                    normalizar(
                        morph.segmentation
                    )
            };


            let puntos = 0;

            let pesoTotal = 0;

            const coincidencias = [];


            activos.forEach(
                criterio => {

                    const peso =
                        pesos[criterio] || 1;


                    pesoTotal += peso;


                    if (
                        normalizar(
                            valores[criterio]
                        ) ===
                        normalizar(
                            criterios[criterio]
                        )
                    ) {

                        puntos += peso;

                        coincidencias.push(
                            obtenerNombreCriterio(
                                criterio
                            )
                        );
                    }

                }
            );


            const score =
                pesoTotal > 0
                    ? Math.round(
                        (
                            puntos /
                            pesoTotal
                        ) * 100
                    )
                    : 0;


            return {

                ...especie,

                score,

                coincidencias

            };

        })

        .filter(
            especie =>
                especie.score > 0
        )

        .sort(
            (a, b) =>
                b.score - a.score
        );
}



function mostrarResultados(
    resultados
) {

    const mejor =
        resultados[0];


    document
        .getElementById(
            "emptyResult"
        )
        .style.display =
        "none";


    document
        .getElementById(
            "resultContent"
        )
        .style.display =
        "grid";


    escribir(
        "species",
        mejor.identification
            ?.scientificName ||
        mejor.taxonomy?.species ||
        "Sin identificar"
    );


    escribir(
        "commonName",
        obtenerNombreComun(
            mejor
        )
    );


    const score =
        mejor.score || 0;


    escribir(
        "confidenceText",
        `${score}%`
    );


    document
        .getElementById(
            "confidenceBar"
        )
        .style.width =
        `${score}%`;


    const tax =
        mejor.taxonomy || {};


    escribir(
        "resultReino",
        tax.kingdom
    );


    escribir(
        "resultFilo",
        tax.phylum
    );


    escribir(
        "resultClase",
        tax.class
    );


    escribir(
        "resultOrden",
        tax.order
    );


    escribir(
        "resultFamilia",
        tax.family
    );


    escribir(
        "resultGenero",
        tax.genus
    );


    escribir(
        "resultEspecie",
        tax.species
    );



    mostrarLista(
        "taxonomicDetails",
        mejor.diagnosticCharacters,
        "No registrados."
    );


    mostrarImportancia(
        mejor
    );


    mostrarLista(
        "hosts",
        mejor.veterinaryImportance
            ?.hosts,
        "No registrados."
    );


    mostrarLista(
        "diseases",
        mejor.veterinaryImportance
            ?.diseases,
        "No registrados."
    );


    escribir(
        "treatment",
        mejor.veterinaryImportance
            ?.treatment ||
        "Consultar protocolo veterinario específico según diagnóstico."
    );


    mostrarLista(
        "prevention",
        mejor.veterinaryImportance
            ?.prevention,
        "No registrada."
    );


    mostrarLista(
        "diagnosis",
        mejor.veterinaryImportance
            ?.diagnosis,
        "No registrado."
    );


    escribir(
        "distribution",
        mejor.distribution
            ?.description ||
        "No registrada."
    );


    escribir(
        "zoonoticRisk",
        mejor.veterinaryImportance
            ?.zoonoticRisk ||
        "No registrado."
    );


    mostrarImagen(
        mejor
    );


    mostrarCandidatos(
        resultados
    );
}



function mostrarImportancia(
    especie
) {

    const contenedor =
        document.getElementById(
            "veterinaryImportance"
        );


    const info =
        especie.veterinaryImportance;


    if (!info) {

        contenedor.textContent =
            "No registrada.";

        return;
    }


    contenedor.innerHTML = "";


    const descripcion =
        document.createElement(
            "p"
        );


    descripcion.textContent =
        info.description ||
        "Sin descripción.";


    contenedor.appendChild(
        descripcion
    );


    if (info.category) {

        const categoria =
            document.createElement(
                "p"
            );


        categoria.innerHTML =
            `<strong>Categoría:</strong> ${
                escaparHTML(
                    info.category
                )
            }`;


        contenedor.appendChild(
            categoria
        );
    }


    if (info.importance) {

        const nivel =
            document.createElement(
                "p"
            );


        nivel.innerHTML =
            `<strong>Nivel:</strong> ${
                escaparHTML(
                    info.importance
                )
            }`;


        contenedor.appendChild(
            nivel
        );
    }
}



function mostrarLista(
    id,
    datos,
    vacio
) {

    const contenedor =
        document.getElementById(id);


    if (!datos) {

        contenedor.textContent =
            vacio;

        return;
    }


    const lista =
        Array.isArray(datos)
            ? datos
            : [datos];


    if (!lista.length) {

        contenedor.textContent =
            vacio;

        return;
    }


    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "info-list";


    lista.forEach(item => {

        const elemento =
            document.createElement(
                "div"
            );


        elemento.className =
            "info-list-item";


        elemento.textContent =
            item;


        wrapper.appendChild(
            elemento
        );

    });


    contenedor.innerHTML = "";

    contenedor.appendChild(
        wrapper
    );
}



function mostrarCandidatos(
    resultados
) {

    const contenedor =
        document.getElementById(
            "candidateList"
        );


    contenedor.innerHTML = "";


    resultados
        .slice(0, 7)
        .forEach(
            (especie, index) => {

                const nombre =
                    especie.identification
                        ?.scientificName ||
                    especie.taxonomy
                        ?.species ||
                    "Desconocido";


                const tarjeta =
                    document.createElement(
                        "div"
                    );


                tarjeta.className =
                    "candidate-card";


                const coincidencias =
                    especie.coincidencias
                        ?.length
                        ? especie.coincidencias.join(
                            ", "
                        )
                        : "Coincidencia general";


                tarjeta.innerHTML = `

                    <div class="candidate-number">
                        ${index + 1}
                    </div>

                    <div class="candidate-info">

                        <strong>
                            ${escaparHTML(nombre)}
                        </strong>

                        <span>
                            ${escaparHTML(
                                especie.taxonomy?.order || "-"
                            )}
                            ·
                            ${escaparHTML(
                                especie.taxonomy?.family || "-"
                            )}
                        </span>

                    </div>

                    <div class="candidate-score">
                        ${especie.score}%
                    </div>

                    <div class="candidate-reason">

                        Coincide en:
                        ${escaparHTML(
                            coincidencias
                        )}

                    </div>

                `;


                contenedor.appendChild(
                    tarjeta
                );

            }
        );
}



function buscarEspecie() {

    const texto =
        document.getElementById(
            "speciesSearch"
        ).value
        .trim()
        .toLowerCase();


    const contenedor =
        document.getElementById(
            "directSearchResults"
        );


    contenedor.innerHTML = "";


    if (!texto) {

        return;
    }


    const encontrados =
        database.filter(
            especie => {

                const nombre =
                    especie.identification
                        ?.scientificName ||
                    "";

                const comun =
                    obtenerNombreComun(
                        especie
                    );


                const genero =
                    especie.taxonomy
                        ?.genus ||
                    "";


                return (
                    nombre
                        .toLowerCase()
                        .includes(texto)
                    ||
                    comun
                        .toLowerCase()
                        .includes(texto)
                    ||
                    genero
                        .toLowerCase()
                        .includes(texto)
                );
            }
        );


    if (!encontrados.length) {

        contenedor.innerHTML = `

            <div class="direct-result">

                No se encontró ningún registro
                relacionado con
                <strong>
                    ${escaparHTML(texto)}
                </strong>.

            </div>
        `;

        return;
    }


    encontrados
        .slice(0, 8)
        .forEach(especie => {

            const resultado =
                document.createElement(
                    "div"
                );


            resultado.className =
                "direct-result";


            resultado.innerHTML = `

                <strong>
                    ${escaparHTML(
                        especie.identification
                            ?.scientificName ||
                        especie.taxonomy?.species
                    )}
                </strong>

                <br>

                <span>
                    ${escaparHTML(
                        obtenerNombreComun(
                            especie
                        )
                    )}
                </span>

                <br>

                <small>
                    ${escaparHTML(
                        especie.taxonomy?.class || "-"
                    )}
                    →
                    ${escaparHTML(
                        especie.taxonomy?.order || "-"
                    )}
                    →
                    ${escaparHTML(
                        especie.taxonomy?.family || "-"
                    )}
                    →
                    ${escaparHTML(
                        especie.taxonomy?.genus || "-"
                    )}
                </small>

            `;


            resultado.addEventListener(
                "click",
                () =>
                    mostrarResultados(
                        [
                            {
                                ...especie,
                                score: 100,
                                coincidencias: [
                                    "Búsqueda directa"
                                ]
                            }
                        ]
                    )
            );


            contenedor.appendChild(
                resultado
            );

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
        especie.images?.principal ||
        "";


    if (ruta) {

        img.src = ruta;

        img.style.display =
            "block";

    } else {

        img.removeAttribute(
            "src"
        );

        img.style.display =
            "none";
    }
}



function actualizarEstadisticas() {

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


    const veterinarios =
        database.filter(
            especie =>
                Boolean(
                    especie.veterinaryImportance
                )
        ).length;


    escribir(
        "speciesCount",
        database.length
    );


    escribir(
        "familyCount",
        familias
    );


    escribir(
        "orderCount",
        ordenes
    );


    escribir(
        "veterinaryCount",
        veterinarios
    );
}



function obtenerNombreComun(
    especie
) {

    const nombres =
        especie.identification
            ?.commonNames;


    if (
        Array.isArray(nombres) &&
        nombres.length
    ) {

        return nombres.join(
            " · "
        );
    }


    return "Nombre común no registrado";
}



function obtenerNombreCriterio(
    criterio
) {

    const nombres = {

        clase: "Clase",

        orden: "Orden",

        familia: "Familia",

        genero: "Género",

        patas: "número de patas",

        alas: "alas",

        antenas: "antenas",

        mouthparts: "aparato bucal",

        symmetry: "simetría",

        segmentation:
            "segmentación corporal"
    };


    return (
        nombres[criterio] ||
        criterio
    );
}



function normalizar(
    valor
) {

    return String(
        valor ?? ""
    )
        .toLowerCase()
        .trim();
}



function escribir(
    id,
    valor
) {

    const elemento =
        document.getElementById(id);


    if (elemento) {

        elemento.textContent =
            valor ?? "-";
    }
}



function escaparHTML(
    texto
) {

    return String(
        texto ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}



function mostrarEstado(
    mensaje,
    tipo = "normal"
) {

    const estado =
        document.getElementById(
            "systemStatus"
        );


    estado.textContent =
        mensaje;


    estado.dataset.status =
        tipo;
}



window.TaxoID = {

    obtenerBaseDatos:
        () => database,

    buscar:
        buscarEspecie,

    identificar:
        identificar

};
```
