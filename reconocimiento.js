```javascript
const Reconocimiento = {

    imagenActual: null,


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


    tieneImagen() {

        return Boolean(
            this.imagenActual
        );

    },


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
                "Imagen preparada."

        };

    },


    async analizarConModelo() {

        return {

            disponible: false,

            mensaje:
                "El modelo de reconocimiento visual todavía no está conectado."

        };

    }

};
```
