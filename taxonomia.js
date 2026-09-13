```javascript
const Taxonomia = {

    database: [],


    inicializar(database) {

        this.database =
            Array.isArray(database)
                ? database
                : [];
    },


    filtrar(
        criterios = {}
    ) {

        return this.database.filter(
            especie => {

                const tax =
                    especie.taxonomy ||
                    {};


                if (
                    criterios.clase &&
                    tax.class !==
                    criterios.clase
                ) {

                    return false;
                }


                if (
                    criterios.orden &&
                    tax.order !==
                    criterios.orden
                ) {

                    return false;
                }


                if (
                    criterios.familia &&
                    tax.family !==
                    criterios.familia
                ) {

                    return false;
                }


                if (
                    criterios.genero &&
                    tax.genus !==
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

        return this.obtenerValores(

            this.filtrar({
                clase
            }),

            "order"
        );
    },


    obtenerFamilias(
        clase = "",
        orden = ""
    ) {

        return this.obtenerValores(

            this.filtrar({
                clase,
                orden
            }),

            "family"
        );
    },


    obtenerGeneros(
        clase = "",
        orden = "",
        familia = ""
    ) {

        return this.obtenerValores(

            this.filtrar({
                clase,
                orden,
                familia
            }),

            "genus"
        );
    },


    obtenerValores(
        registros,
        propiedad
    ) {

        const valores =
            new Set();


        registros.forEach(
            especie => {

                const valor =
                    especie.taxonomy?.[
                        propiedad
                    ];


                if (valor) {

                    valores.add(
                        valor
                    );
                }
            }
        );


        return [
            ...valores
        ].sort(
            (a, b) =>
                a.localeCompare(
                    b,
                    "es"
                )
        );
    }

};
```
