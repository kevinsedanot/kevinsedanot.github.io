```javascript
const Taxonomia = {

    database: [],


    inicializar(database) {

        this.database =
            Array.isArray(database)
                ? database
                : [];

    },


    obtenerUnicos(registros, propiedad) {

        const valores = new Set();

        registros.forEach(especie => {

            const valor =
                especie.taxonomy?.[propiedad];

            if (
                valor !== undefined &&
                valor !== null &&
                valor !== ""
            ) {

                valores.add(valor);

            }

        });

        return Array.from(valores).sort(
            (a, b) =>
                String(a).localeCompare(
                    String(b),
                    "es"
                )
        );

    },


    obtenerClases() {

        return this.obtenerUnicos(
            this.database,
            "class"
        );

    },


    obtenerOrdenes(clase = "") {

        let registros = this.database;

        if (clase) {

            registros =
                registros.filter(
                    especie =>
                        especie.taxonomy?.class === clase
                );

        }

        return this.obtenerUnicos(
            registros,
            "order"
        );

    },


    obtenerFamilias(
        clase = "",
        orden = ""
    ) {

        let registros = this.database;

        if (clase) {

            registros =
                registros.filter(
                    especie =>
                        especie.taxonomy?.class === clase
                );

        }

        if (orden) {

            registros =
                registros.filter(
                    especie =>
                        especie.taxonomy?.order === orden
                );

        }

        return this.obtenerUnicos(
            registros,
            "family"
        );

    },


    obtenerGeneros(
        clase = "",
        orden = "",
        familia = ""
    ) {

        let registros = this.database;

        if (clase) {

            registros =
                registros.filter(
                    especie =>
                        especie.taxonomy?.class === clase
                );

        }

        if (orden) {

            registros =
                registros.filter(
                    especie =>
                        especie.taxonomy?.order === orden
                );

        }

        if (familia) {

            registros =
                registros.filter(
                    especie =>
                        especie.taxonomy?.family === familia
                );

        }

        return this.obtenerUnicos(
            registros,
            "genus"
        );

    },


    filtrar(criterios = {}) {

        return this.database.filter(
            especie => {

                const tax =
                    especie.taxonomy || {};

                if (
                    criterios.clase &&
                    tax.class !== criterios.clase
                ) {
                    return false;
                }

                if (
                    criterios.orden &&
                    tax.order !== criterios.orden
                ) {
                    return false;
                }

                if (
                    criterios.familia &&
                    tax.family !== criterios.familia
                ) {
                    return false;
                }

                if (
                    criterios.genero &&
                    tax.genus !== criterios.genero
                ) {
                    return false;
                }

                return true;

            }
        );

    }

};
```
