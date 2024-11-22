const apiUrl = "http://localhost:3000/api/persons"; // URL del servidor
const rowsPerPage = 10; // Número de registros por página
let currentPage = 1; // Página actual
let data = []; // Todos los datos cargados del servidor
let filteredData = []; // Datos filtrados que se muestran en la tabla


// Cargar datos desde el servidor
const loadData = async () => {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Failed to fetch data");
        data = await response.json();
        filteredData = data; // Inicialmente, los datos filtrados son iguales a todos los datos
        renderTable();
        renderPagination();
    } catch (error) {
        console.error("Error loading data:", error);
    }
};


// Renderizar la tabla
const renderTable = () => {
    const tableBody = document.getElementById("table-body");
    tableBody.innerHTML = "";

    // Calcular los elementos que deben mostrarse en la página actual
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = filteredData.slice(start, end);

    pageData.forEach((person, index) => {
        const dataIndex = data.indexOf(person); // Índice en el array original
        const row = `
            <tr data-index="${dataIndex}">
                <td>${start + index + 1}</td>
                <td>${person.first_name}</td>
                <td>${person.last_name}</td>
                <td>${person.email}</td>
                <td>${person.age}</td>
                <td>${person.address}</td>
                <td>${person.phone_number}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="editPerson(${dataIndex})" id="edit-${dataIndex}">Edit</button>
                    <button class="btn btn-success btn-sm d-none" onclick="savePerson(${dataIndex})" id="save-${dataIndex}">Save</button>
                    <button class="btn btn-danger btn-sm" onclick="deletePerson(${dataIndex})">Delete</button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
};


// Renderizar la paginación
const renderPagination = () => {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const pageItem = `
            <li class="page-item ${i === currentPage ? "active" : ""}">
                <a href="#" class="page-link" onclick="changePage(${i})">${i}</a>
            </li>
        `;
        pagination.innerHTML += pageItem;
    }
};


// Cambiar de página
const changePage = (page) => {
    currentPage = page;
    renderTable();
    renderPagination();
};

// Función para filtrar datos en la tabla
const filterTable = () => {
    const searchTerm = document.getElementById("search-input").value.toLowerCase();
    filteredData = data.filter((person) => {
        return Object.values(person).some((value) =>
            String(value).toLowerCase().includes(searchTerm)
        );
    });
    currentPage = 1; // Reiniciar a la primera página
    renderTable();
    renderPagination();
};


// Filtros activos para cada columna
const activeFilters = {
    first_name: "",
    last_name: "",
    email: "",
    age: "",
    address: "",
    phone_number: "",
};

// Función para filtrar por columna específica
const filterByColumn = (column) => {
    const searchTerm = document.getElementById(`filter-${column}`).value.toLowerCase();
    activeFilters[column] = searchTerm; // Actualizar el filtro activo para esa columna

    filteredData = data.filter((person) => {
        return Object.keys(activeFilters).every((key) => {
            if (activeFilters[key] === "") return true; // Si no hay filtro, incluir todo
            return String(person[key]).toLowerCase().includes(activeFilters[key]);
        });
    });

    currentPage = 1; // Reiniciar a la primera página
    renderTable();
    renderPagination();
};


// Renderizar tabla con datos filtrados
const renderFilteredTable = (filteredData) => {
    const tableBody = document.getElementById("table-body");
    tableBody.innerHTML = "";

    filteredData.forEach((person, index) => {
        const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${person.first_name}</td>
                <td>${person.last_name}</td>
                <td>${person.email}</td>
                <td>${person.age}</td>
                <td>${person.address}</td>
                <td>${person.phone_number}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="editPerson(${index})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deletePerson(${index})">Delete</button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
};

// Habilitar edición de una fila
const editPerson = (index) => {
    const row = document.querySelector(`tr[data-index="${index}"]`);
    const spans = row.querySelectorAll("td:not(:last-child)");

    // Hacer las celdas editables
    spans.forEach((span, idx) => {
        if (idx > 0) { // Evitamos el primer elemento (#)
            span.contentEditable = "true";
            span.classList.add("border", "border-primary");
        }
    });

    // Mostrar el botón Save y ocultar el botón Edit
    document.getElementById(`edit-${index}`).classList.add("d-none");
    document.getElementById(`save-${index}`).classList.remove("d-none");
};


// Guardar cambios en una fila con confirmación
const savePerson = async (index) => {
    const row = document.querySelector(`tr[data-index="${index}"]`);
    const spans = row.querySelectorAll("td:not(:last-child)");

    // Crear el objeto con los datos actualizados
    const updatedPerson = {
        first_name: spans[1].textContent.trim(),
        last_name: spans[2].textContent.trim(),
        email: spans[3].textContent.trim(),
        age: parseInt(spans[4].textContent.trim()),
        address: spans[5].textContent.trim(),
        phone_number: spans[6].textContent.trim(),
    };

    // Confirmación antes de guardar
    if (!confirm("Are you sure you want to save these changes?")) {
        // Restaurar celdas y botones sin guardar cambios
        spans.forEach((span) => {
            span.contentEditable = "false";
            span.classList.remove("border", "border-primary");
        });
        document.getElementById(`edit-${index}`).classList.remove("d-none");
        document.getElementById(`save-${index}`).classList.add("d-none");
        return;
    }

    try {
        // Enviar los cambios al servidor
        const response = await fetch(`${apiUrl}/${index}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedPerson),
        });

        if (!response.ok) throw new Error("Failed to update person");

        // Actualizar el array original
        data[index] = updatedPerson;

        // Deshabilitar edición y restaurar estilos
        spans.forEach((span) => {
            span.contentEditable = "false";
            span.classList.remove("border", "border-primary");
        });

        // Restaurar botones
        document.getElementById(`edit-${index}`).classList.remove("d-none");
        document.getElementById(`save-${index}`).classList.add("d-none");

        alert("Person updated successfully!");
    } catch (error) {
        console.error("Error updating person:", error);
        alert("Failed to update person. Please try again.");
    }
};

// Función para eliminar una persona con validación de página vacía
const deletePerson = async (index) => {
    if (!confirm("Are you sure you want to delete this person?")) return;

    try {
        const response = await fetch(`${apiUrl}/${index}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Failed to delete person");

        // Eliminar del array original
        data.splice(index, 1);

        // Actualizar los datos filtrados
        filteredData = filteredData.filter((person) => data.includes(person));

        // Verificar si la página actual quedó vacía
        const totalPages = Math.ceil(filteredData.length / rowsPerPage);
        if (currentPage > totalPages) {
            currentPage = totalPages; // Mover a la última página válida
        }

        // Renderizar la tabla y la paginación
        renderTable();
        renderPagination();
    } catch (error) {
        console.error("Error deleting person:", error);
        alert("Failed to delete person. Please try again.");
    }
};



// Función para agregar una nueva persona
document.getElementById("add-person-form").addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto del formulario

    // Crear un objeto con los datos del formulario
    const newPerson = {
        first_name: document.getElementById("first-name").value.trim(),
        last_name: document.getElementById("last-name").value.trim(),
        email: document.getElementById("email").value.trim(),
        age: parseInt(document.getElementById("age").value.trim()),
        address: document.getElementById("address").value.trim(),
        phone_number: document.getElementById("phone-number").value.trim(),
    };

    // Validación adicional si es necesario
    if (!newPerson.first_name || !newPerson.last_name || !newPerson.email) {
        alert("Please fill in all required fields.");
        return;
    }

    try {
        // Enviar la nueva persona al servidor
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newPerson),
        });

        if (!response.ok) throw new Error("Failed to add person");

        // Agregar la nueva persona al inicio del array localmente
        data.unshift(newPerson);

        // Renderizar la tabla con los datos actualizados
        renderTable();
        renderPagination();

        // Limpiar el formulario
        document.getElementById("add-person-form").reset();
        alert("Person added successfully!");
    } catch (error) {
        console.error("Error adding person:", error);
        alert("Failed to add person. Please try again.");
    }
});


// Inicializar la aplicación
loadData();
