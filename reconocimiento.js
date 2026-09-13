```javascript
const Reconocimiento = {

    imagenActual: null,


    cargarImagen(
        archivo
    ) {

        if (!archivo) {

            this.imagenActual =
                null;

            return null;
        }


        if (
            !archivo.type.startsWith(
                "image/"
            )
        ) {

            throw new Error(
                "El archivo seleccionado no es una imagen."
            );
        }


        this.imagenActual =
            archivo;


        return archivo;
    },


    tieneImagen() {

        return Boolean(
            this.imagenActual
        );
    },


    obtenerMetadatos() {

        if (
            !this.imagenActual
        ) {

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
                    this.imagenActual.size /
                    1024
                )
        };
    },


    prepararAnalisisVisual() {

        if (
            !this.imagenActual
        ) {

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


    async analizarConModelo() {

        return {

            disponible: false,

            mensaje:
                "El modelo de reconocimiento visual aún no está conectado."
        };
    }

};



window.Reconocimiento =
    Reconocimiento;
```
