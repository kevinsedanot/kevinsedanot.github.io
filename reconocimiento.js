```javascript
/* =========================================================
   TAXOID
   reconocimiento.js

   Módulo de reconocimiento visual.

   Actualmente:
   - procesa la imagen seleccionada
   - obtiene información básica
   - prepara la estructura para conectar
     posteriormente un modelo de visión artificial

   IMPORTANTE:
   Este módulo NO afirma reconocer especies
   únicamente a partir de la fotografía.
========================================================= */


const Reconocimiento = {


    imagenActual: null,


    /**
     * Guarda la imagen seleccionada.
     */
    cargarImagen(file) {

        if (!file) {

            this.imagenActual = null;

            return null;
        }


        if (!file.type.startsWith("image/")) {

            throw new Error(
                "El archivo seleccionado no es una imagen."
            );

        }


        this.imagenActual = file;

        return file;

    },


    /**
     * Devuelve metadatos básicos de la imagen.
     */
    obtenerMetadatos() {

        if (!this.imagenActual) {

            return null;

        }


        return {

            nombre:
                this.imagenActual.name,

            tipo:
                this.imagenActual.type,

            tamaño:
                this.imagenActual.size,

            tamañoKB:
                Math.round(
                    this.imagenActual.size / 1024
                )

        };

    },


    /**
     * Comprueba si hay imagen.
     */
    tieneImagen() {

        return Boolean(
            this.imagenActual
        );

    },


    /**
     * Estructura preparada para una futura IA.
     */
    prepararAnalisisVisual() {

        if (!this.imagenActual) {

            return {

                disponible: false,

                mensaje:
                    "No se ha seleccionado una imagen."

            };

        }


        return {

            disponible: true,

            archivo:
                this.imagenActual.name,

            tipo:
                this.imagenActual.type,

            estado:
                "Imagen preparada para análisis visual."

        };

    },


    /**
     * Punto de integración futura.
     *
     * Aquí posteriormente podremos conectar:
     *
     * - TensorFlow.js
     * - ONNX Runtime
     * - una API de visión
     * - un modelo entrenado específicamente
     *   con insectos y artrópodos.
     */
    async analizarConModelo() {

        return {

            disponible: false,

            mensaje:
                "El modelo de reconocimiento visual todavía no está conectado."

        };

    }

};
```
