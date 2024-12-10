let materiasData;

// Cargar el archivo JSON
async function cargarDatos() {
    try {
        const response = await fetch('horario_prueba.json');
        if (!response.ok) {
            throw new Error("Error al cargar el archivo JSON");
        }
        const data = await response.json();
        console.log(data); // Verifica que los datos se carguen correctamente
        materiasData = data; // Guarda los datos en una variable global
        generarOpcionesMaterias();
    } catch (error) {
        console.error("Hubo un error:", error);
    }
}

// Llama a cargarDatos al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarDatos();
    setTimeout(() => {
        document.querySelectorAll('.semestre').forEach(checkbox => {
            checkbox.addEventListener('change', generarOpcionesMaterias);
        });
    }, 0); // Registrar eventos después del DOM cargado
});

// ============================================

document.addEventListener('DOMContentLoaded', function () {
    const opcionSelect = document.getElementById("opcionSabatino");
    const sabatinosDiv = document.querySelector('.sabatinos');

    // Inicializar la visibilidad del div.sabatinos en base a la opción seleccionada
    sabatinosDiv.style.display = opcionSelect.value === 'Si' ? 'block' : 'none';

    // Manejar el cambio en el select principal
    opcionSelect.addEventListener('change', function() {
        sabatinosDiv.style.display = this.value === 'Si' ? 'block' : 'none';
        
        // Si se selecciona "No", limpiar las materias seleccionadas
        if (this.value === 'No') {
            const checkboxesSemestre = document.querySelectorAll('.semestre-sabatino');
            const materiasContainer = document.getElementById('materiasSabatinoContainer');
            checkboxesSemestre.forEach(cb => cb.checked = false);
            materiasContainer.innerHTML = '';
        }
    });
});

document.querySelectorAll(".semestre-sabatino").forEach(checkbox => {
    checkbox.addEventListener("change", function () {
        const materiasContainer = document.getElementById("materiasSabatinoContainer");
        materiasContainer.innerHTML = ""; // Limpia el contenedor

        const semestresSeleccionados = [...document.querySelectorAll(".semestre-sabatino:checked")].map(cb => cb.value);

        semestresSeleccionados.forEach(semestre => {
            const semestreData = materiasData.semestres.find(s => s.semestre === semestre);
            if (semestreData) {
                semestreData.materias.forEach(materia => {
                    const checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.value = materia.nombre;
                    checkbox.className = "materia-sabatina";

                    const label = document.createElement("label");
                    label.textContent = materia.nombre;

                    const div = document.createElement("div");
                    div.appendChild(checkbox);
                    div.appendChild(label);

                    materiasContainer.appendChild(div);
                });
            }
        });
    });
});

document.getElementById("guardarMateriasSabatino").addEventListener("click", function () {
    const materiasSeleccionadas = [...document.querySelectorAll(".materia-sabatina:checked")];
    let totalCreditosSabatino = 0;

    // Calcular el total de créditos primero
    materiasSeleccionadas.forEach(input => {
        const materiaData = buscarMateriaPorNombre(input.value);
        if (materiaData) {
            totalCreditosSabatino += parseInt(materiaData.Creditos) || 0;
        }
    });

    // Verificar si excede el límite de 9 créditos
    if (totalCreditosSabatino > 10) {
        alert("No puedes seleccionar materias que excedan 10 créditos en total. Si tienes más de 3 materias el resto se ira a regularización, escoge nuevamente las materias que quieras inscribir en sabatinos.");
        return; // Detiene la ejecución si excede el límite
    }

    // Si no excede el límite, procede a guardar las materias
    const materiasGuardadas = materiasSeleccionadas.map(input => input.value);

    // Guardar el total de créditos sabatinos en localStorage
    localStorage.setItem("materiasSabatinas", JSON.stringify(materiasGuardadas)); // Guardar correctamente
    localStorage.setItem("totalCreditosSabatino", totalCreditosSabatino);

    alert(`Materias sabatinas guardadas: ${materiasGuardadas.join(", ")}\nTotal créditos sabatinos: ${totalCreditosSabatino}`);
    console.log("Créditos sabatinos guardados:", totalCreditosSabatino);
});

// Función para buscar una materia por su nombre
function buscarMateriaPorNombre(nombreMateria) {
    for (let semestre of materiasData.semestres) {
        const materia = semestre.materias.find(m => m.nombre === nombreMateria);
        if (materia) {
            return materia; // Devuelve la materia encontrada
        }
    }
    return null; // Retorna null si no encuentra la materia
}

// ============================================

// Generar opciones de materias según el semestre seleccionado
function generarOpcionesMaterias() {
    const semestresSeleccionados = [...document.querySelectorAll(".semestre:checked")].map(checkbox => checkbox.value);
    const materiasContainer = document.getElementById('materiasContainer');
    materiasContainer.innerHTML = ''; // Limpia las opciones anteriores

    console.log("Semestres seleccionados:", semestresSeleccionados);

    for (let semestre of semestresSeleccionados) {
        const semestreData = materiasData.semestres.find(s => s.semestre === semestre);
        if (semestreData) {
            semestreData.materias.forEach(materia => {
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.className = "materia";
                checkbox.value = materia.nombre;
                const label = document.createElement("label");
                label.textContent = materia.nombre;
                materiasContainer.appendChild(checkbox);
                materiasContainer.appendChild(label);
            });
        }
    }
}

// Función para guardar materias reprobadas seleccionadas
function guardarMateriasReprobadas() {
    const materiasReprobadas = Array.from(document.querySelectorAll('.materia-reprobada:checked'))
        .map(input => input.value);
    localStorage.setItem('materiasReprobadas', JSON.stringify(materiasReprobadas));
    alert('Materias reprobadas guardadas correctamente');
}

document.getElementById('guardarMateriasReprobadas').addEventListener('click', guardarMateriasReprobadas);

// Función para cargar materias aprobadas desde almacenamiento local
function cargarMateriasReprobadas() {
    const materiasReprobadas = JSON.parse(localStorage.getItem('materiasReprobadas')) || [];
    const semestresSeleccionados = Array.from(document.querySelectorAll('.semestre-aprobado:checked')).map(input => input.value);
    const materiasContainer = document.getElementById('materiasReprobadasContainer');
    materiasContainer.innerHTML = '';

    semestresSeleccionados.forEach(semestre => {
        const semestreData = materiasData.semestres.find(s => s.semestre === semestre);
        if (semestreData) {
            semestreData.materias.forEach(materia => {
                const materiaDiv = document.createElement('div');
                const isChecked = materiasReprobadas.includes(materia.nombre);
                materiaDiv.innerHTML = `
                    <input type="checkbox" class="materia-reprobada" value="${materia.nombre}" ${isChecked ? 'checked' : ''}>
                    <label>${materia.nombre}</label>
                `;
                materiasContainer.appendChild(materiaDiv);
            });
        }
    });
}

document.querySelectorAll('.semestre-aprobado').forEach(input => {
    input.addEventListener('change', cargarMateriasReprobadas);
});

cargarMateriasReprobadas();

// Registrar evento para guardar materias aprobadas
// document.getElementById('guardarMateriasAprobadas').addEventListener('click', guardarMateriasAprobadas);

// Actualizar las materias aprobadas al cambiar los semestres seleccionados
// document.querySelectorAll('.semestre-aprobado').forEach(input => {
//     input.addEventListener('change', cargarMateriasAprobadas);
// });

// Llamar a la función cargarMaterias para inicializar las materias
// cargarMateriasAprobadas();

// Función para cargar las materias en el HTML según los semestres seleccionados
function cargarMaterias() {
    const semestresSeleccionados = Array.from(document.querySelectorAll('.semestre:checked')).map(input => input.value);
    
    const materiasContainer = document.getElementById('materiasContainer');
    materiasContainer.innerHTML = '';

    semestresSeleccionados.forEach(semestre => {
        const semestreData = materiasData.semestres.find(s => s.semestre === semestre);

        semestreData.materias.forEach(materia => {
            const materiaDiv = document.createElement('div');
            materiaDiv.innerHTML = `
                <input type="checkbox" class="materia" value="${materia.nombre}">
                <label>${materia.nombre}</label>
            `;
            materiasContainer.appendChild(materiaDiv);
        });
    });
}

// Llamar a la función para cargar las materias cuando se seleccionan los semestres
document.querySelectorAll('.semestre').forEach(input => {
    input.addEventListener('change', cargarMaterias);
});

// Llamar a la función cargarMaterias para inicializar las materias
cargarMaterias();

// Definir rango de horas
let contadorRangos = 1;

document.getElementById('nuevoRangoTiempo').addEventListener('click', function() {
    contadorRangos++;
    
    const nuevoRango = document.createElement('div');
    nuevoRango.className = 'rango-tiempo';
    nuevoRango.id = `rango-${contadorRangos}`;
    
    nuevoRango.innerHTML = `
        <input type="time" name="hora-inicio-${contadorRangos}" id="hora-inicio-${contadorRangos}">
        <label>Hora inicio</label>
        <input type="time" name="hora-fin-${contadorRangos}" id="hora-fin-${contadorRangos}">
        <label>Hora fin</label>
        <button class="eliminar-rango" onclick="eliminarRango(${contadorRangos})">Eliminar</button>
    `;
    
    document.getElementById('contenedor-rangos').appendChild(nuevoRango);
});

function eliminarRango(id) {
    const rangoAEliminar = document.getElementById(`rango-${id}`);
    if (rangoAEliminar) {
        rangoAEliminar.remove();
    }
}

// Función para guardar los rangos
document.getElementById('guardarRangos').addEventListener('click', function() {
    const rangos = [];
    const contenedorRangos = document.getElementById('contenedor-rangos');
    const divRangos = contenedorRangos.getElementsByClassName('rango-tiempo');

    for (let divRango of divRangos) {
        const horaInicio = divRango.querySelector('input[name^="hora-inicio"]').value;
        const horaFin = divRango.querySelector('input[name^="hora-fin"]').value;

        if (horaInicio && horaFin) {  // Solo guarda si ambos campos tienen valor
            rangos.push({
                inicio: horaInicio,
                fin: horaFin
            });
        }
    }

    // Guardar en localStorage
    localStorage.setItem('rangosHorarios', JSON.stringify(rangos));

    // Mostrar los rangos guardados
    mostrarRangosGuardados(rangos);

    // También podrías enviar los datos a un servidor aquí
    console.log('Rangos para enviar al servidor:', rangos);
});

// Función para mostrar los rangos guardados
function mostrarRangosGuardados(rangos) {
    const listaRangos = document.getElementById('lista-rangos');
    listaRangos.innerHTML = '';

    rangos.forEach((rango, index) => {
        const rangoElement = document.createElement('div');
        rangoElement.innerHTML = `
            <p>Rango ${index + 1}: ${rango.inicio} - ${rango.fin}</p>
        `;
        listaRangos.appendChild(rangoElement);
    });
}

// Cargar rangos guardados al iniciar
window.onload = function() {
    const rangosGuardados = localStorage.getItem('rangosHorarios');
    if (rangosGuardados) {
        const rangos = JSON.parse(rangosGuardados);
        mostrarRangosGuardados(rangos);
    }
}

// Definimos los horarios de los turnos
// const turnos = {
//     "Matutino": { inicio: "07:00", fin: "12:00" },
//     "Vespertino": { inicio: "12:00", fin: "17:00" },
//     "Nocturno": { inicio: "17:00", fin: "21:30" }
// };

// Definición de horarios fijos con funciones de conversión
const horariosFijos = [
    "07:00", "07:50", "08:40", "09:30", "10:20", "11:10", "12:00",
    "12:50", "13:40", "14:30", "15:20", "16:10", "17:00", "17:50",
    "18:40", "19:30", "20:20", "21:10"
];

// Función para convertir tiempo (HH:mm) a minutos
function convertToMinutes(hora) {
    const [hours, minutes] = hora.split(":").map(Number);
    return hours * 60 + minutes;
}

// Función para comparar horarios
function compararHorarios(hora1, hora2) {
    return convertToMinutes(hora1) - convertToMinutes(hora2);
}

// Ordenar los horarios fijos de manera ascendente
horariosFijos.sort(compararHorarios);

// Función para calcular la probabilidad de Poisson
function poissonProbability(lambda, k) {
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

// Función factorial auxiliar
function factorial(n) {
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
}

// Función para calcular el tiempo de espera entre clases en minutos
function calcularTiempoEspera(horaFin, horaSiguiente) {
    const [horaFin1, minFin1] = horaFin.split(':').map(Number);
    const [horaIni2, minIni2] = horaSiguiente.split(':').map(Number);
    return (horaIni2 * 60 + minIni2) - (horaFin1 * 60 + minFin1);
}

// Función para evaluar la calidad del horario usando distribución Poisson
function evaluarHorario(horario) {
    let tiemposEspera = [];
    let diasHorario = {};

    // Organizar horario por días
    Object.entries(horario).forEach(([hora, materiasPorDia]) => {
        Object.entries(materiasPorDia).forEach(([dia, materia]) => {
            if (materia) {
                if (!diasHorario[dia]) diasHorario[dia] = [];
                diasHorario[dia].push({ hora, materia });
            }
        });
    });

    // Calcular tiempos de espera por día
    Object.values(diasHorario).forEach(clases => {
        clases.sort((a, b) => convertToMinutes(a.hora) - convertToMinutes(b.hora));
        
        for (let i = 0; i < clases.length - 1; i++) {
            const horaFin = addMinutesToTime(clases[i].hora, 50); // Duración de clase: 50 minutos
            const tiempoEspera = calcularTiempoEspera(horaFin, clases[i + 1].hora);
            if (tiempoEspera > 0) {
                tiemposEspera.push(tiempoEspera);
            }
        }
    });

    // Calcular score usando Poisson
    // Lambda óptimo: 50 minutos de espera entre clases
    const lambda = 100;
    const score = tiemposEspera.reduce((acc, tiempo) => {
        return acc + poissonProbability(lambda, tiempo);
    }, 0);

    console.log(score);

    return {
        score,
        tiemposEspera
    };
}

// Función auxiliar para añadir minutos a una hora
function addMinutesToTime(time, minutes) {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
}

// Define prerequisitos for each course
const PREREQUISITOS = {
    "Física II": ["Física I", "Laboratorio de Física I", "Algebra para Ingeniería"],
    "Laboratorio de Física II": ["Física I", "Laboratorio de Física I", "Algebra para Ingeniería"],
    "Lenguaje ANSI C": ["Matemáticas I"],
    "Programación estructurada": ["Matemáticas I"],
    "Algoritmos computacionales": ["Matemáticas I"],
    "Estructura de datos": ["Matemáticas I"],
    "Laboratorio de Algoritmos Computacionales": ["Matemáticas I"],
    "Laboratorio de Estructura de datos": ["Matemáticas I"],
    "Matemáticas II": ["Matemáticas I"],
    "Matemáticas discretas": ["Matemáticas I"],
    "Física III": ["Matemáticas I"],
    "Laboratorio de Física III": ["Matemáticas I"],
    "Probabilidad y estadística": ["Matemáticas I"],
    "Taller de Programación": ["Matemáticas I"],
    "Matemáticas III": ["Matemáticas II"],
    "Matemáticas IV": ["Matemáticas III"],
    "Física IV": ["Física III, Laboratorio de Física III"],
    "Laboratorio de Física IV": ["Física III, Laboratorio de Física III"],
    "Programación Web": ["Algoritmos Computacionales", "Estructura de datos"],
    "Laboratorio de Programación Web": ["Algoritmos Computacionales", "Estructura de datos"],
    "Tópicos selectos de programación": ["Algoritmos Computacionales", "Estructura de datos"],
    "Laboratorio Tópicos selectos de programación": ["Algoritmos Computacionales", "Estructura de datos"],
    "Lenguajes de programación": ["Lenguaje ANSI C", "Programación estructurada"],
    "Laboratorio Lenguajes de programación": ["Lenguaje ANSI C", "Programación estructurada"],
    "Programación Orientada a Objetos": ["Lenguaje ANSI C", "Programación estructurada"],
    "Taller de programación orientada a objetos": ["Lenguaje ANSI C", "Programación estructurada"],
    "Arquitectura de computadoras": ["Sistemas digitales", "Laboratorio de Sistemas Digitales"],
    "Sistemas operativos": ["Sistemas digitales", "Laboratorio de Sistemas Digitales"],
    "Transmisión y comunicación de datos": ["Sistemas digitales", "Laboratorio de Sistemas Digitales"],
    "Laboratorio de Transmisión y comunicación de datos": ["Sistemas digitales", "Laboratorio de Sistemas Digitales"],
    "Diseño de experimentos": ["Probabilidad y estadística"],
    "Optimización": ["Probabilidad y estadística"],
    "Métodos numéricos": ["Probabilidad y estadística"],
    "Tópicos selectos de la ingeniería de software": ["Probabilidad y estadística"],
    "Interacción humano-computadora": ["Programación Orientada a Objetos", "Taller de programación orientada a objetos"],
    "Laboratorio de Interacción humano-computadora": ["Programación Orientada a Objetos", "Taller de programación orientada a objetos"],
    "Programación de sistemas adaptativos": ["Programación Orientada a Objetos", "Taller de programación orientada a objetos"],
    "Laboratorio de Programación de sistemas adaptativos": ["Programación Orientada a Objetos", "Taller de programación orientada a objetos"],
    "Temas selectos de optimización": ["Optimización"],
    "Modelado y simulación de sistemas dinámicos": ["Diseño de experimentos", "Programación de sistemas adaptativos", "Laboratorio de Programación de sistemas adaptativos"],
    "Computo integrado": ["Sistemas operativos", "Programación Orientada a Objetos"],
    "Laboratorio de Computo integrado": ["Sistemas operativos", "Programación Orientada a Objetos"],
    "Ingeniería de dispositivos móviles": ["Interacción humano-computadora", "Laboratorio de Interacción humano-computadora", "Programación de sistemas adaptativos", "Laboratorio de Programación de sistemas adaptativos"],
    "Laboratorio de Ingeniería de dispositivos móviles": ["Interacción humano-computadora", "Laboratorio de Interacción humano-computadora", "Programación de sistemas adaptativos", "Laboratorio de Programación de sistemas adaptativos"],
    "Sistemas distribuidos y paralelos": ["Sistemas operativos", "Programación de sistemas adaptativos", "Laboratorio de Programación de sistemas adaptativos"],
    "Laboratorio de Sistemas distribuidos y paralelos": ["Sistemas operativos", "Programación de sistemas adaptativos", "Laboratorio de Programación de sistemas adaptativos"],
    "Automatización y control de sistemas dinámicos": ["Modelado y simulación de sistemas dinámicos", "Optimización"],
    "Laboratorio de Automatización y control de sistemas dinámicos": ["Modelado y simulación de sistemas dinámicos", "Optimización"],
    "Verificación y validación de software": ["Modelado y simulación de sistemas dinámicos"]
};

// Función para verificar si se puede tomar un curso en base a cursos aprobados
function canTakeCourse(courseName, approvedCourses) {
    const prerequisitos = PREREQUISITOS[courseName];
    const materiasReprobadas = JSON.parse(localStorage.getItem("materiasReprobadas")) || [];
    const materiasSabatinas = JSON.parse(localStorage.getItem("materiasSabatinas")) || [];

    // Si no hay prerequisitos, se puede cursar
    if (!prerequisitos) return true;

    // Verificar prerequisitos bloqueados por reprobadas
    const bloqueadas = prerequisitos.filter(prereq => materiasReprobadas.includes(prereq));
    if (bloqueadas.length > 0) {
        console.log(`${courseName} bloqueada por: ${bloqueadas.join(", ")}`);
        return false;
    }

    // Verificar prerequisitos bloqueados por sabatinas no aprobadas
    const materiasNoAprobadas = prerequisitos.filter(prereq => materiasSabatinas.includes(prereq));
    if (materiasNoAprobadas.length > 0) {
        console.log(`No se puede tomar ${courseName} porque depende de materias sabatinas no aprobadas: ${materiasNoAprobadas.join(", ")}`);
        return false;
    }

    // Validar requisitos obligatorios
    return prerequisitos.every(prereq => approvedCourses.includes(prereq));
}

// Función para filtrar cursos disponibles según los requisitos previos
function filterAvailableCourses(selectedCourses, approvedCourses) {
    return selectedCourses.filter(course => canTakeCourse(course.nombre, approvedCourses));
}

// Función para calcular el total de créditos de cursos seleccionados.
function calcularCreditosTotales(materiasSeleccionadas, materiasData) {
    let totalCreditos = 0;
    
    for (const materiaSeleccionada of materiasSeleccionadas) {
        const creditos = encontrarCreditosMateria(materiaSeleccionada.nombre, materiasData);
        if (creditos) {
            totalCreditos += parseInt(creditos);
        }
    }
    
    return totalCreditos;
}

// Función para buscar créditos para un curso específico.
function encontrarCreditosMateria(nombreMateria, materiasData) {
    for (const semestre of materiasData.semestres) {
        const materia = semestre.materias.find(m => m.nombre === nombreMateria);
        if (materia) {
            return materia.Creditos;
        }
    }
    return 0;
}

// Función para verificar si los horarios están en los rangos definidos
function verificarHorarioEnRangos(horarios, rangos) {
    return horarios.every(h => {
        const inicioClase = convertToMinutes(h.hora_inicio);
        const finClase = convertToMinutes(h.hora_fin);

        return rangos.some(rango => {
            const inicioRango = convertToMinutes(rango.inicio);
            const finRango = convertToMinutes(rango.fin);
            return inicioClase >= inicioRango && finClase <= finRango;
        });
    });
}

// Función para cargar y mostrar los rangos guardados
window.onload = function() {
    const rangosGuardados = JSON.parse(localStorage.getItem('rangosHorarios')) || [];
    mostrarRangosGuardados(rangosGuardados);
};

// Función para generar horarios optimizados basado en rangos de hora
function generarHorarioOptimizadoConRangos(materiasSeleccionadas, rangos, materiasData) {
    const creditosTotales = calcularCreditosTotales(materiasSeleccionadas, materiasData);

    if (creditosTotales > 27) {
        throw new Error(`Has seleccionado materias que suman ${creditosTotales} créditos. El máximo permitido es 27 créditos.`);
    }

    const materiasAprobadas = JSON.parse(localStorage.getItem('materiasAprobadas')) || [];
    const materiasDisponibles = filterAvailableCourses(materiasSeleccionadas, materiasAprobadas);

    const horariosPosibles = [];
    const MAX_INTENTOS = 5000;

    for (let intento = 0; intento < MAX_INTENTOS; intento++) {
        const horarioTentativo = {};
        const asignaciones = new Set();

        horariosFijos.forEach(hora => {
            horarioTentativo[hora] = {
                "Lunes": "", "Martes": "", "Miércoles": "", "Jueves": "", "Viernes": ""
            };
        });

        let asignacionValida = true;

        for (const materia of materiasSeleccionadas) {
            const opciones = encontrarOpcionesMateria(materia.nombre, materiasData);
            
            if (opciones.length === 0) {
                asignacionValida = false;
                break;
            }

            const opcionesEnRangos = opciones.filter(opcion =>
                verificarHorarioEnRangos(opcion.horarios, rangos)
            );

            if (opcionesEnRangos.length === 0) {
                asignacionValida = false;
                break;
            }

            const opcionSeleccionada = opcionesEnRangos[Math.floor(Math.random() * opcionesEnRangos.length)];

            if (!asignarMateriaHorario(horarioTentativo, opcionSeleccionada, asignaciones)) {
                asignacionValida = false;
                break;
            }
        }

        if (asignacionValida) {
            const evaluacion = evaluarHorario(horarioTentativo);
            horariosPosibles.push({
                horario: horarioTentativo,
                score: evaluacion.score,
                tiemposEspera: evaluacion.tiemposEspera
            });
        }
    }

    if (horariosPosibles.length === 0) {
        throw new Error("No se pudo generar un horario válido con los rangos especificados.");
    }

    return horariosPosibles.sort((a, b) => b.score - a.score).slice(0, 5);
}

// Función para generar horarios basados en rangos
function generarHorarioConRangos() {
    const materiasSeleccionadas = Array.from(document.querySelectorAll(".materia:checked"))
        .map(input => ({
            nombre: input.value,
            tipo: input.dataset.tipo
        }));

    const rangos = JSON.parse(localStorage.getItem('rangosHorarios')) || [];

    if (rangos.length === 0) {
        alert("Por favor, define al menos un rango de hora antes de generar el horario.");
        return;
    }

    try {
        const mejoresHorarios = generarHorarioOptimizadoConRangos(materiasSeleccionadas, rangos, materiasData);

        const contenedorHorarios = document.getElementById('contenedorHorarios') || document.createElement('div');
        contenedorHorarios.id = 'contenedorHorarios';
        contenedorHorarios.innerHTML = '';

        mejoresHorarios.forEach((horario, index) => {
            const horarioDiv = document.createElement('div');
            horarioDiv.className = 'horario-container';
            horarioDiv.innerHTML = `
                <h3>Opción ${index + 1} (Puntuación: ${horario.score.toFixed(3)})</h3>
                <table class="horario-table">
                    <thead>
                        <tr>
                            <th>Hora</th>
                            <th>Lunes</th>
                            <th>Martes</th>
                            <th>Miércoles</th>
                            <th>Jueves</th>
                            <th>Viernes</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${horariosFijos.map(hora => `
                            <tr>
                                <td>${hora}</td>
                                ${["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"].map(dia => {
                                    const materiaProfesor = horario.horario[hora][dia];
                                    return `<td>${materiaProfesor || ''}</td>`;
                                }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            contenedorHorarios.appendChild(horarioDiv);
        });

        const horarioTable = document.getElementById('horarioTable');
        horarioTable.parentNode.replaceChild(contenedorHorarios, horarioTable);
    } catch (error) {
        alert(error.message);
        console.error(error);
    }
}

// Función para verificar si los horarios están dentro del turno
// function verificarHorarioEnTurno(horarios, turno) {
//     return horarios.every(h => {
//         const inicioClase = convertToMinutes(h.hora_inicio);
//         const finClase = convertToMinutes(h.hora_fin);
//         const inicioTurno = convertToMinutes(turno.inicio);
//         const finTurno = convertToMinutes(turno.fin);
        
//         const dentroDelTurno = inicioClase >= inicioTurno && finClase <= finTurno;
        
//         if (!dentroDelTurno) {
//             console.warn(`Horario fuera de turno: ${h.hora_inicio} - ${h.hora_fin}, Turno: ${turno.inicio} - ${turno.fin}`);
//         }
        
//         return dentroDelTurno;
//     });
// }

// Modifique las casillas de verificación del detector de eventos para materia para validar créditos en tiempo real
function actualizarContadorCreditos() {
    // Obtener las materias seleccionadas entre semana
    const materiasSeleccionadas = Array.from(document.querySelectorAll(".materia:checked"))
        .map(input => ({
            nombre: input.value,
            tipo: input.dataset.tipo
        }));
    
    // Calcular los créditos de las materias seleccionadas entre semana
    const totalCreditos = calcularCreditosTotales(materiasSeleccionadas, materiasData);
    
    // Obtener los créditos sabatinos desde localStorage
    const totalCreditosSabatino = parseInt(localStorage.getItem("totalCreditosSabatino")) || 0;

    // Calcular el total de créditos combinados (entre semana + sabatinos)
    const creditosTotales = totalCreditos + totalCreditosSabatino;

    // Actualizar el contador de créditos en la interfaz de usuario
    const contadorCreditos = document.getElementById('contadorCreditos') || 
        (() => {
            const contador = document.createElement('div');
            contador.id = 'contadorCreditos';
            contador.className = 'text-lg font-bold mt-4';
            document.getElementById('materiasContainer').parentNode.insertBefore(
                contador,
                document.getElementById('materiasContainer').nextSibling
            );
            return contador;
        })();
    
    // Mostrar los créditos totales combinados en la interfaz
    contadorCreditos.textContent = `Créditos seleccionados: ${creditosTotales} (Entre semana: ${totalCreditos}, Sabatinos: ${totalCreditosSabatino})`;
    
    // Aplicar estilo visual según el recuento de créditos
    contadorCreditos.style.color = creditosTotales > 27 ? 'red' : 
                                  creditosTotales >= 22 ? 'orange' : 
                                  'green';
    
    // Desactivar las casillas de verificación si se alcanza el máximo de créditos
    const checkboxes = document.querySelectorAll(".materia:not(:checked)");
    checkboxes.forEach(checkbox => {
        const materiaCreditos = encontrarCreditosMateria(checkbox.value, materiasData);
        checkbox.disabled = (creditosTotales + parseInt(materiaCreditos)) > 27;
        checkbox.title = checkbox.disabled ? 
            'Seleccionar esta materia excedería el límite de 27 créditos' : 
            '';
    });
}

// Agregar detectores de eventos para seguimiento de crédito
document.addEventListener('DOMContentLoaded', () => {
    // Agregar seguimiento de crédito a las casillas de verificación de materia
    document.getElementById('materiasContainer').addEventListener('change', (e) => {
        if (e.target.classList.contains('materia')) {
            actualizarContadorCreditos();
        }
    });
    
    // Recuento de crédito inicial
    actualizarContadorCreditos();
});

// Calcula el restante de credtios antes de generar el horario
function calcularCreditosRestantes() {
    const totalCreditosSabatino = JSON.parse(localStorage.getItem("totalCreditosSabatino")) || 0; // Recuperar créditos sabatinos guardados
    const maxCreditosPermitidos = 27;
    const creditosRestantes = maxCreditosPermitidos - totalCreditosSabatino;

    return creditosRestantes >= 0 ? creditosRestantes : 0; // No permitir valores negativos
}

if (!document.getElementById('horarioTable')) {
    document.body.appendChild(contenedorHorarios);
}


// Modificar la función generarHorario para mostrar los 5 mejores horarios
function generarHorario() {
    const materiasSeleccionadas = Array.from(document.querySelectorAll(".materia:checked"))
        .map(input => ({
            nombre: input.value,
            tipo: input.dataset.tipo
        }));
    const materiasReprobadas = JSON.parse(localStorage.getItem("materiasReprobadas")) || [];
    const materiasSabatinas = JSON.parse(localStorage.getItem("materiasSabatinas")) || [];
    const materiasBloqueadas = [];

    // Verificar si alguna materia está bloqueada por reprobadas
    materiasSeleccionadas.forEach(materia => {
        const prerequisitos = PREREQUISITOS[materia.nombre];
        if (prerequisitos) {
            const bloqueadasPorReprobadas = prerequisitos.filter(prereq => materiasReprobadas.includes(prereq));
            const bloqueadasPorSabatinas = prerequisitos.filter(prereq => materiasSabatinas.includes(prereq));
            
            if (bloqueadasPorReprobadas.length > 0 || bloqueadasPorSabatinas.length > 0) {
                materiasBloqueadas.push({
                    materia: materia.nombre,
                    bloqueadasPor: bloqueadasPorReprobadas.concat(bloqueadasPorSabatinas)
                });
            }
        }
    });

    // Si hay materias bloqueadas, mostrar alerta y detener la generación
    if (materiasBloqueadas.length > 0) {
        let mensaje = "No se puede generar el horario porque las siguientes materias están bloqueadas:\n\n";
        materiasBloqueadas.forEach(({ materia, bloqueadasPor }) => {
            mensaje += `- ${materia} está bloqueada por: ${bloqueadasPor.join(", ")}\n`;
        });

        alert(mensaje); // Mostrar alerta al usuario
        console.error("Materias bloqueadas:", materiasBloqueadas); // Para depuración
        return; // Detener completamente la generación
    }

    // Verificar créditos seleccionados
    const totalCreditosSabatino = JSON.parse(localStorage.getItem("totalCreditosSabatino")) || 0;
    const maxCreditosPermitidos = 27;

    // Calcular créditos seleccionados entre semana
    const creditosEntreSemana = calcularCreditosTotales(materiasSeleccionadas, materiasData);
    const creditosTotales = creditosEntreSemana + totalCreditosSabatino;

    if (creditosTotales > maxCreditosPermitidos) {
        alert(`No puedes seleccionar más de ${maxCreditosPermitidos} créditos. Créditos seleccionados: ${creditosTotales}`);
        return;
    }

    // Verificar rangos horarios
    const rangosGuardados = JSON.parse(localStorage.getItem('rangosHorarios')) || [];
    if (rangosGuardados.length === 0) {
        alert("Por favor, define al menos un rango de hora antes de generar el horario.");
        return;
    }

    // Añadir un contenedor para todos los horarios
    const contenedorHorarios = document.getElementById('contenedorHorarios') || 
    document.createElement('div');
    contenedorHorarios.id = 'contenedorHorarios';
    contenedorHorarios.innerHTML = '';

    // Continuar con la lógica de generación del horario
    console.log("Generación de horario exitosa. Materias seleccionadas:", materiasSeleccionadas);
    console.log("Créditos entre semana:", creditosEntreSemana);
    console.log("Créditos sabatinos:", totalCreditosSabatino);
    console.log("Créditos totales:", creditosTotales);

    // Añadir diálogo de carga
    const loadingDialog = document.createElement('div');
    loadingDialog.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                    background: rgba(0,0,0,0.5); display: flex; 
                    justify-content: center; align-items: center; z-index: 1000;">
            <div style="background: white; padding: 20px; border-radius: 10px;">
                Generando los 5 mejores horarios... Por favor espere.
            </div>
        </div>
    `;
    document.body.appendChild(loadingDialog);

    setTimeout(() => {
        try {
            // Generar los mejores horarios basados en los rangos
            const mejoresHorarios = generarHorarioOptimizadoConRangos(
                materiasSeleccionadas,
                rangosGuardados,
                materiasData
            );

            document.body.removeChild(loadingDialog);

            // Crear una tabla para cada horario
            mejoresHorarios.forEach((horario, index) => {
                const horarioDiv = document.createElement('div');
                horarioDiv.className = 'horario-container';
                horarioDiv.innerHTML = `
                    <h3>Opción ${index + 1} (Puntuación: ${horario.score.toFixed(3)})</h3>
                    <table class="horario-table">
                        <thead>
                            <tr>
                                <th>Hora</th>
                                <th>Lunes</th>
                                <th>Martes</th>
                                <th>Miércoles</th>
                                <th>Jueves</th>
                                <th>Viernes</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${horariosFijos.map(hora => `
                                <tr>
                                    <td>${hora}</td>
                                    ${["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"].map(dia => {
                                        const materiaProfesor = horario.horario[hora][dia];
                                        const infoMateria = materiaProfesor ? encontrarInfoMateria(materiaProfesor, materiasData) : null;
                                        return `<td class="${materiaProfesor ? 'clase-asignada' : ''}">
                                            ${infoMateria ? 
                                                `${infoMateria.nombreMateria}<br><small>${materiaProfesor}</small>` 
                                                : (materiaProfesor || '')}
                                        </td>`;
                                    }).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <p>Tiempos de espera promedio: ${
                        horario.tiemposEspera.length > 0 ? 
                        (horario.tiemposEspera.reduce((a, b) => a + b, 0) / horario.tiemposEspera.length).toFixed(1) + 
                        ' minutos' : 'Sin tiempos de espera'
                    }</p>
                    <hr>
                `;
                contenedorHorarios.appendChild(horarioDiv);
            });

            // Reemplazar la tabla original con el contenedor de horarios
            const horarioTable = document.getElementById('horarioTable');
            horarioTable.parentNode.replaceChild(contenedorHorarios, horarioTable);

        } catch (error) {
            if (loadingDialog.parentNode) {
                document.body.removeChild(loadingDialog);
            }
            alert(error.message);
            console.error(error);
        }
    }, 0);
}


// Función auxiliar para encontrar opciones de materia en los datos
function encontrarOpcionesMateria(nombreMateria, materiasData) {
    for (const semestre of materiasData.semestres) {
        const materia = semestre.materias.find(m => m.nombre === nombreMateria);
        if (materia) {
            return materia.profesores;
        }
    }
    return [];
}

// Función para verificar si los horarios están dentro del turno
// function verificarHorarioEnTurno(horarios, turno) {
//     if (!Array.isArray(horarios) || horarios.length === 0) {
//         console.warn("El parámetro 'horarios' no es un array válido:", horarios);
//         return false; // o true, dependiendo de lo que necesites como comportamiento predeterminado
//     }

//     return horarios.every(h => {
//         const inicioClase = convertToMinutes(h.hora_inicio);
//         const finClase = convertToMinutes(h.hora_fin);
//         const inicioTurno = convertToMinutes(turno.inicio);
//         const finTurno = convertToMinutes(turno.fin);
//         return inicioClase >= inicioTurno && finClase <= finTurno;
//     });
// }

// Función para asignar una materia al horario
function asignarMateriaHorario(horario, opcionProfesor, asignaciones) {
    for (const horarioClase of opcionProfesor.horarios) {
        const horaInicio = horarioClase.hora_inicio;
        const horaFin = horarioClase.hora_fin;
        const dia = horarioClase.dia;

        // Verificar conflictos
        const horasAfectadas = horariosFijos.filter(h => 
            convertToMinutes(h) >= convertToMinutes(horaInicio) &&
            convertToMinutes(h) < convertToMinutes(horaFin)
        );

        if (horasAfectadas.some(h => horario[h][dia] !== "")) {
            return false;
        }

        // Asignar la materia
        horasAfectadas.forEach(h => {
            horario[h][dia] = opcionProfesor.nombre;
        });
    }

    return true;
}

// // Actualizar la función generarHorario original
// function generarHorario() {
//     const materiasSeleccionadas = Array.from(document.querySelectorAll(".materia:checked"))
//         .map(input => ({
//             nombre: input.value,
//             tipo: input.dataset.tipo
//         }));

//     const turnosSeleccionados = Array.from(document.querySelectorAll('.turno:checked'))
//         .map(input => input.value);

//     if (turnosSeleccionados.length !== 1) {
//         alert("Por favor, selecciona exactamente un turno.");
//         return;
//     }

//     try {
//         const horarioOptimizado = generarHorarioOptimizado(
//             materiasSeleccionadas, 
//             turnosSeleccionados[0],
//             materiasData
//         );

//         // Renderizar el horario
//         const horarioTable = document.getElementById('horarioTable');
//         horarioTable.innerHTML = '';
        
//         const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
        
//         horariosFijos.forEach(hora => {
//             const row = document.createElement('tr');
//             let rowHTML = `<td>${hora}</td>`;

//             diasSemana.forEach(dia => {
//                 const materiaProfesor = horarioOptimizado[hora][dia];
//                 if (materiaProfesor) {
//                     // Buscar la información completa de la materia y el profesor
//                     const infoMateria = encontrarInfoMateria(materiaProfesor, materiasData);
//                     rowHTML += `<td class="clase-asignada">
//                         ${infoMateria ? 
//                             `${infoMateria.nombreMateria}<br><small>${materiaProfesor}</small>` 
//                             : materiaProfesor}
//                     </td>`;
//                 } else {
//                     rowHTML += `<td></td>`;
//                 }
//             });

//             row.innerHTML = rowHTML;
//             horarioTable.appendChild(row);
//         });
//     } catch (error) {
//         alert(error.message);
//     }
// }

// Nueva función auxiliar para encontrar información de la materia
function encontrarInfoMateria(nombreProfesor, materiasData) {
    for (const semestre of materiasData.semestres) {
        for (const materia of semestre.materias) {
            const profesores = materia.profesores;
            const profesorEncontrado = profesores.find(p => p.nombre === nombreProfesor);
            if (profesorEncontrado) {
                return {
                    nombreMateria: materia.nombre,
                    nombreProfesor: nombreProfesor
                };
            }
        }
    }
    return null;
}

// ========================================================================================================

