// ==========================================
// CONFIGURACIÓN SUPABASE
// ==========================================

const SUPABASE_URL =
    "https://kiiwivyuylblgvwphdvd.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_nnjharPVMEbLY7BZpmIGyw_sACG3eBE";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ==========================================
// VEHÍCULOS
// ==========================================

const cars = [
    {
        id: 1,
        name: "Coche 1",
        color: "#3b82f6"
    },
    {
        id: 2,
        name: "Coche 2",
        color: "#10b981"
    },
    {
        id: 3,
        name: "Coche 3",
        color: "#f59e0b"
    },
    {
        id: 4,
        name: "Coche 4",
        color: "#8b5cf6"
    }
];

let selectedCar = 1;

const carsContainer =
    document.getElementById("cars");


// ==========================================
// MOSTRAR LOS 4 COCHES
// ==========================================

function renderCars() {

    carsContainer.innerHTML = "";

    cars.forEach(function(car) {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "car-button";

        if (selectedCar === car.id) {
            button.classList.add("active");
        }

        button.innerHTML = `
            <span
                class="dot"
                style="background: ${car.color}">
            </span>

            ${car.name}
        `;

        button.addEventListener(
            "click",
            function() {

                selectedCar = car.id;

                renderCars();

            }
        );

        carsContainer.appendChild(button);

    });
}

renderCars();


// ==========================================
// ELEMENTOS DEL FORMULARIO
// ==========================================

const reservationForm =
    document.getElementById("reservationForm");

const message =
    document.getElementById("message");

const dateInput =
    document.getElementById("date");

const bookingsContainer =
    document.getElementById("bookings");

const selectedDateLabel =
    document.getElementById("selectedDate");


// ==========================================
// CARGAR RESERVAS DE UNA FECHA
// ==========================================

async function loadBookings(date) {

    if (!date) {
        bookingsContainer.innerHTML = "";
        selectedDateLabel.textContent = "";
        return;
    }

    selectedDateLabel.textContent = date;

    bookingsContainer.innerHTML = `
        <div class="empty">
            Cargando reservas...
        </div>
    `;

    const { data, error } =
        await supabaseClient
            .from("reservas")
            .select("*")
            .eq("fecha", date)
            .order("hora_inicio", {
                ascending: true
            });

    if (error) {

        console.error(
            "ERROR AL CARGAR RESERVAS:",
            error
        );

        bookingsContainer.innerHTML = `
            <div class="empty">
                No se pudieron cargar las reservas.
            </div>
        `;

        return;
    }


    // ======================================
    // NO HAY RESERVAS
    // ======================================

    if (!data || data.length === 0) {

        bookingsContainer.innerHTML = `
            <div class="empty">
                No hay reservas para este día.
            </div>
        `;

        return;
    }


    // ======================================
    // MOSTRAR RESERVAS
    // ======================================

    bookingsContainer.innerHTML = "";

    data.forEach(function(booking) {

        const car =
            cars.find(function(car) {
                return car.id === booking.vehiculo_id;
            });


        const carName =
            car
                ? car.name
                : "Coche " + booking.vehiculo_id;


        const carColor =
            car
                ? car.color
                : "#64748b";


        const bookingElement =
            document.createElement("div");

        bookingElement.className =
            "booking";


        bookingElement.innerHTML = `

            <div
                class="booking-color"
                style="background: ${carColor}">
            </div>

            <div class="booking-info">

                <strong>
                    ${booking.empleado}
                </strong>

                <span>
                    ${carName}
                </span>

            </div>

            <div class="booking-time">

                ${booking.hora_inicio.slice(0, 5)}
                -
                ${booking.hora_fin.slice(0, 5)}

            </div>
        `;


        bookingsContainer.appendChild(
            bookingElement
        );

    });

}


// ==========================================
// CUANDO CAMBIA LA FECHA
// ==========================================

dateInput.addEventListener(
    "change",
    function() {

        loadBookings(
            dateInput.value
        );

    }
);


// ==========================================
// FORMULARIO
// ==========================================

reservationForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const employee =
            document
                .getElementById("employee")
                .value
                .trim();


        const date =
            document
                .getElementById("date")
                .value;


        const start =
            document
                .getElementById("start")
                .value;


        const end =
            document
                .getElementById("end")
                .value;


        // ==================================
        // VALIDACIONES
        // ==================================

        if (!employee) {

            message.className = "error";

            message.textContent =
                "Introduce el nombre del empleado.";

            return;
        }


        if (!date) {

            message.className = "error";

            message.textContent =
                "Selecciona una fecha.";

            return;
        }


        if (!start || !end) {

            message.className = "error";

            message.textContent =
                "Selecciona el horario.";

            return;
        }


        if (start >= end) {

            message.className = "error";

            message.textContent =
                "La hora final debe ser posterior a la inicial.";

            return;
        }


        // ==================================
        // GUARDAR RESERVA
        // ==================================

        message.className = "";

        message.textContent =
            "Guardando reserva...";


        const { data, error } =
            await supabaseClient
                .from("reservas")
                .insert({
                    empleado: employee,
                    fecha: date,
                    vehiculo_id: selectedCar,
                    hora_inicio: start,
                    hora_fin: end
                })
                .select();


        if (error) {

            console.error(
                "ERROR SUPABASE:",
                error
            );

            message.className =
                "error";

            message.textContent =
                "Error al guardar: " +
                error.message;

            return;
        }


        console.log(
            "RESERVA GUARDADA:",
            data
        );


        message.className =
            "success";

        message.textContent =
            "Reserva creada correctamente.";


        reservationForm.reset();

        selectedCar = 1;

        renderCars();


        // ==================================
        // RECARGAR LA AGENDA
        // ==================================

        loadBookings(date);

    }
);