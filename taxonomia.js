```javascript
/* =========================================================
   TAXOID
   taxonomia.js
========================================================= */

const Taxonomia = {

    database: [],


    inicializar(database) {

        this.database =
            Array.isArray(database)
                ? database
                : [];

    },


    obtenerValores(ruta) {

        const valores =
            new Set();


        for (
            const especie
            of this.database
        ) {

            const valor =
                this.obtenerRuta(
                    especie,
                    ruta
                );


            if (
                valor !== undefined
                &&
                valor !== null
                &&
                valor !== ""
            ) {

                valores.add(valor);

            }

        }


        return [
            ...valores
        ].sort(
            (a,b) =>
                String(a)
                    .localeCompare(
                        String(b),
                        "es"
                    )
        );

    },


    obtenerRuta(
        objeto,
        ruta
    ) {

        return ruta
            .split(".")
            .reduce(
                (
                    actual,
                    propiedad
                ) =>
                    actual?.[propiedad],
                objeto
            );

    },


    filtrar(
        criterios = {}
    ) {

        return this.database.filter(
            especie => {

                const taxonomia =
                    especie.taxonomy || {};


                if (
                    criterios.clase
                    &&
                    taxonomia.class
                    !==
                    criterios.clase
                ) {

                    return false;

                }


                if (
                    criterios.orden
                    &&
                    taxonomia.order
                    !==
                    criterios.orden
                ) {

                    return false;

                }


                if (
                    criterios.familia
                    &&
                    taxonomia.family
                    !==
                    criterios.familia
                ) {

                    return false;

                }


                if (
                    criterios.genero
                    &&
                    taxonomia.genus
                    !==
                    criterios.genero
                ) {

                    return false;

                }


                return true;

            }
        );

    },


    obtenerOrdenes(
        clase = ""
    ) {

        const registros =
            clase
                ? this.filtrar({clase})
                : this.database;


        return this.valoresDesdeRegistros(
            registros,
            "order"
        );

    },


    obtenerFamilias(
        clase = "",
        orden = ""
    ) {

        const registros =
            this.filtrar({
                clase,
                orden
            });


        return this.valoresDesdeRegistros(
            registros,
            "family"
        );

    },


    obtenerGeneros(
        clase = "",
        orden = "",
        familia = ""
    ) {

        const registros =
            this.filtrar({
                clase,
                orden,
                familia
            });


        return this.valoresDesdeRegistros(
            registros,
            "genus"
        );

    },


    valoresDesdeRegistros(
        registros,
        propiedad
    ) {

        const valores =
            new Set();


        for (
            const especie
            of registros
        ) {

            const valor =
                especie.taxonomy?.[
                    propiedad
                ];


            if (valor) {

                valores.add(valor);

            }

        }


        return [
            ...valores
        ].sort(
            (a,b) =>
                String(a)
                    .localeCompare(
                        String(b),
                        "es"
                    )
        );

    }

};
```
