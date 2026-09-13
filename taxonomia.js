```javascript
/* =========================================================
   TAXOID
   taxonomia.js

   Manejo de la jerarquía:

   Clase
      ↓
   Orden
      ↓
   Familia
      ↓
   Género
========================================================= */


const Taxonomia = {

    database: [],


    /**
     * Inicializa la base taxonómica.
     */
    inicializar(database) {

        this.database = Array.isArray(database)
            ? database
            : [];

    },


    /**
     * Obtiene valores únicos de una ruta.
     *
     * Ejemplo:
     * obtenerValores("taxonomy.family")
     */
    obtenerValores(ruta) {

        const valores = new Set();

        for (const especie of this.database) {

            const valor =
                this.obtenerRuta(especie, ruta);

            if (
                valor !== undefined &&
                valor !== null &&
                valor !== ""
            ) {

                valores.add(valor);

            }

        }

        return [...valores].sort(
            (a, b) =>
                String(a).localeCompare(
                    String(b),
                    "es"
                )
        );

    },


    /**
     * Obtiene una propiedad anidada.
     */
    obtenerRuta(objeto, ruta) {

        return ruta
            .split(".")
            .reduce(
                (actual, propiedad) =>
                    actual?.[propiedad],
                objeto
            );

    },


    /**
     * Filtra registros según criterios taxonómicos.
     */
    filtrar(criterios = {}) {

        return this.database.filter(especie => {

            const taxonomia =
                especie.taxonomy || {};

            if (
                criterios.clase &&
                taxonomia.class !== criterios.clase
            ) {
                return false;
            }

            if (
                criterios.orden &&
                taxonomia.order !== criterios.orden
            ) {
                return false;
            }

            if (
                criterios.familia &&
                taxonomia.family !== criterios.familia
            ) {
                return false;
            }

            if (
                criterios.genero &&
                taxonomia.genus !== criterios.genero
            ) {
                return false;
            }

            return true;

        });

    },


    /**
     * Devuelve los órdenes compatibles con una clase.
     */
    obtenerOrdenes(clase = "") {

        const registros =
            clase
                ? this.filtrar({ clase })
                : this.database;

        return this.valoresDesdeRegistros(
            registros,
            "order"
        );

    },


    /**
     * Devuelve familias compatibles.
     */
    obtenerFamilias(clase = "", orden = "") {

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


    /**
     * Devuelve géneros compatibles.
     */
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

        const valores = new Set();

        for (const especie of registros) {

            const valor =
                especie.taxonomy?.[propiedad];

            if (valor) {
                valores.add(valor);
            }

        }

        return [...valores].sort(
            (a, b) =>
                String(a).localeCompare(
                    String(b),
                    "es"
                )
        );

    }

};
```
