fetch("data/especies.json")
    .then(respuesta => respuesta.json())
    .then(especies => {

        console.log("Base de datos cargada:");

        console.log(especies);

    })
    .catch(error => {

        console.error(
            "Error cargando la base de datos:",
            error
        );

    });