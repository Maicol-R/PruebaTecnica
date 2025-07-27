// URL para API REST
const API_BASE_URL = 'https://localhost:7082/api/clientes';

// Primero capturamos todos los elementos del DOM que vamos a utilizar para manejar la tabla de clientes y el formulario
const clientesTableBody = document.getElementById('clientesTableBody');
const clienteForm = document.getElementById('clienteForm');
const clienteIdInput = document.getElementById('clienteId');
const nombreInput = document.getElementById('nombre');
const apellidoInput = document.getElementById('apellido');
const emailInput = document.getElementById('email');
const telefonoInput = document.getElementById('telefono');
const fechaNacimientoInput = document.getElementById('fechaNacimiento');
const activoInput = document.getElementById('activo');
const saveButton = document.getElementById('saveButton');
const cancelButton = document.getElementById('cancelButton');
const messageArea = document.getElementById('messageArea'); // Para mensajes de ERROR

// Accedemos a los elementos del modal personalizado de eliminación y se muestra cuando el usuario intenta eliminar un cliente.
const customConfirmModal = document.getElementById('customConfirmModal');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

// conectar los elementos del modal donde el usuario confirma si quiere actualizar un cliente
const updateConfirmModal = document.getElementById('updateConfirmModal');
const confirmUpdateBtn = document.getElementById('confirmUpdateBtn');
const cancelUpdateBtn = document.getElementById('cancelUpdateBtn');
const updateChangesSummary = document.getElementById('updateChangesSummary');

// capturamos los elementos del modal que se muestra cuando una acción se completa exitosamente
const successModal = document.getElementById('successModal');
const successModalMessage = document.getElementById('successModalMessage');
const closeSuccessModalBtn = document.getElementById('closeSuccessModalBtn');

// para manejar la búsqueda, la paginación y el ordenamiento de la tabla de clientes
const searchTermInput = document.getElementById('searchTerm');
const pageSizeSelect = document.getElementById('pageSize');
const applyFiltersBtn = document.getElementById('applyFiltersBtn');
const paginationControls = document.getElementById('paginationControls');
const loadingSpinner = document.getElementById('loadingSpinner');
const tableHeaders = document.querySelectorAll('th[data-sort]');

let currentEditingClienteId = null;
let clienteToDeleteId = null;
let originalClienteData = null;
let pendingUpdateClienteData = null;

// Estas variables guardan cómo está configurada la tabla en cada momento
let currentPage = 1;
let currentSearchTerm = '';
let currentOrderBy = 'Id';
let currentOrderDirection = 'asc';
let currentTableRows = [];

// Esta función se encarga de mostrar mensajes de error en la interfaz
function showErrorMessage(message) {
    messageArea.textContent = message;
    messageArea.className = 'alert alert-danger show';
    messageArea.style.display = 'block';

    setTimeout(() => {
        messageArea.classList.remove('show');
        messageArea.classList.add('d-none');
        messageArea.style.display = 'none';
    }, 5000);
}

// Esta función se encarga de ocultar el mensaje de error
function showSuccessModal(message) {
    successModalMessage.textContent = message;
    successModal.classList.add('active');
}

// Esta función se encarga de ocultar el modal de éxito
function hideSuccessModal() {
    successModal.classList.remove('active');
}
closeSuccessModalBtn.addEventListener('click', hideSuccessModal);

// Muestra/Oculta el spinner de carga
function showLoadingSpinner() {
    loadingSpinner.classList.remove('d-none');
}

function hideLoadingSpinner() {
    loadingSpinner.classList.add('d-none');
}

// Esta función se encarga de validar los campos del formulario en tiempo real
const formFields = [
    { input: nombreInput, errorDiv: document.getElementById('nombreError'), validate: (value) => value.trim() !== '', message: 'El nombre es obligatorio.' },
    { input: apellidoInput, errorDiv: document.getElementById('apellidoError'), validate: (value) => value.trim() !== '', message: 'El apellido es obligatorio.' },
    { input: emailInput, errorDiv: document.getElementById('emailError'), validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), message: 'Ingrese un email válido.' },
    { input: telefonoInput, errorDiv: document.getElementById('telefonoError'), validate: (value) => value === '' || /^\d{7,15}$/.test(value.replace(/\s/g, '')), message: 'Ingrese un teléfono válido (7-15 dígitos).' },
    { input: fechaNacimientoInput, errorDiv: document.getElementById('fechaNacimientoError'), validate: (value) => value === '' || new Date(value) <= new Date(), message: 'La fecha de nacimiento no puede ser futura.' },
];

function validateField(field) {
    const isValid = field.validate(field.input.value);
    if (!isValid) {
        field.input.classList.add('is-invalid');
        field.errorDiv.textContent = field.message;
    } else {
        field.input.classList.remove('is-invalid');
        field.errorDiv.textContent = '';
    }
    return isValid;
}

function validateForm() {
    let isFormValid = true;
    formFields.forEach(field => {
        if (!validateField(field)) {
            isFormValid = false;
        }
    });
    return isFormValid;
}

// Agrega event listeners para validación en tiempo real
formFields.forEach(field => {
    field.input.addEventListener('input', () => validateField(field));
    field.input.addEventListener('blur', () => validateField(field)); // Validar al salir del campo
});

// --- Lógica de Carga y Renderizado de Clientes ---
async function loadClientes() {
    showLoadingSpinner();
    try {
        const url = new URL(API_BASE_URL);
        url.searchParams.append('pageNumber', currentPage);
        url.searchParams.append('pageSize', pageSizeSelect.value);
        url.searchParams.append('searchTerm', currentSearchTerm);
        url.searchParams.append('orderBy', currentOrderBy);
        url.searchParams.append('orderDirection', currentOrderDirection);

        const response = await fetch(url.toString());
        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorData}`);
        }
        const paginatedResult = await response.json();
        renderClientes(paginatedResult.data);
        updatePaginationControls(paginatedResult.currentPage, paginatedResult.totalPages);
        hideLoadingSpinner();
    } catch (error) {
        console.error('Error al cargar clientes:', error);
        showErrorMessage('Error al cargar los clientes: ' + error.message);
        hideLoadingSpinner();
    }
}

function renderClientes(clientes) {
    clientesTableBody.innerHTML = '';
    currentTableRows = []; // Limpiar las filas anteriores
    clientes.forEach(cliente => {
        const row = clientesTableBody.insertRow();
        row.dataset.clienteId = cliente.id; // Añadir un data attribute para identificar la fila
        row.insertCell().textContent = cliente.id;
        row.insertCell().textContent = cliente.nombre;
        row.insertCell().textContent = cliente.apellido;
        row.insertCell().textContent = cliente.email;
        row.insertCell().textContent = cliente.telefono || 'N/A';
        row.insertCell().textContent = cliente.fechaNacimiento ? new Date(cliente.fechaNacimiento).toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'N/A';
        row.insertCell().textContent = cliente.activo ? 'Sí' : 'No';

        const actionsCell = row.insertCell();
        actionsCell.classList.add('actions');

        const editButton = document.createElement('button');
        editButton.textContent = 'Editar';
        editButton.className = 'edit';
        editButton.onclick = () => editCliente(cliente);
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.className = 'delete';
        deleteButton.onclick = () => deleteCliente(cliente.id);
        actionsCell.appendChild(deleteButton);

        currentTableRows.push(row); // Guardar la referencia a la fila en la lista
    });
    highlightActiveRow(); // Aplicar resaltado a la fila seleccionada
}

// Esta función se encarga de actualizar los controles de paginación
function updatePaginationControls(currentPage, totalPages) {
    paginationControls.innerHTML = ''; // Limpiar controles existentes

    const createPaginationItem = (page, text, isDisabled = false, isActive = false) => {
        const li = document.createElement('li');
        li.className = `page-item ${isDisabled ? 'disabled' : ''} ${isActive ? 'active' : ''}`;
        const a = document.createElement('a');
        a.className = 'page-link';
        a.href = '#';
        a.textContent = text;
        if (!isDisabled && !isActive) {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = page; // Actualiza la página actual
                loadClientes();
            });
        }
        li.appendChild(a);
        return li;
    };

    // Botón Anterior
    paginationControls.appendChild(createPaginationItem(currentPage - 1, 'Anterior', currentPage === 1));

    // Números de página
    const maxPagesToShow = 5; // Número máximo de botones de página a mostrar
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Ajustar startPage si endPage es muy alto para mantener el número de páginas visibles
    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (startPage > 1) {
        paginationControls.appendChild(createPaginationItem(1, '1'));
        if (startPage > 2) {
            const ellipsis = document.createElement('li');
            ellipsis.className = 'page-item disabled';
            ellipsis.innerHTML = '<span class="page-link">...</span>';
            paginationControls.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationControls.appendChild(createPaginationItem(i, i, false, i === currentPage));
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('li');
            ellipsis.className = 'page-item disabled';
            ellipsis.innerHTML = '<span class="page-link">...</span>';
            paginationControls.appendChild(ellipsis);
        }
        paginationControls.appendChild(createPaginationItem(totalPages, totalPages));
    }

    // Botón Siguiente
    paginationControls.appendChild(createPaginationItem(currentPage + 1, 'Siguiente', currentPage === totalPages));
}

// se encarga de buscar y filtrar los clientes
searchTermInput.addEventListener('input', debounce(() => {
    currentSearchTerm = searchTermInput.value;
    currentPage = 1; // Resetear a la primera página al buscar
    loadClientes();
}, 300));

pageSizeSelect.addEventListener('change', () => {
    currentPage = 1; // Resetear a la primera página al cambiar el tamaño
    loadClientes();
});

applyFiltersBtn.addEventListener('click', () => {
    loadClientes();
});

// Función de debounce para inputs
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// ordenar las columnas de la tabla
tableHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const sortBy = header.dataset.sort;
        const currentDirection = header.dataset.sortDirection;

        // Limpiar iconos de ordenamiento de todos los encabezados
        tableHeaders.forEach(h => {
            const iconSpan = h.querySelector('.sort-icon');
            if (iconSpan) {
                iconSpan.classList.remove('fa-sort-up', 'fa-sort-down');
                iconSpan.classList.add('fa-sort');
            }
            h.removeAttribute('data-sort-direction'); // Quita el atributo de dirección
        });

        if (currentOrderBy === sortBy) {
            // Si es la misma columna, alternar dirección
            currentOrderDirection = currentDirection === 'asc' ? 'desc' : 'asc';
        } else {
            // Si es una nueva columna, ordenar ascendente por defecto
            currentOrderBy = sortBy;
            currentOrderDirection = 'asc';
        }

        // Actualizar el atributo data-sort-direction en el header
        header.dataset.sortDirection = currentOrderDirection;
        const iconSpan = header.querySelector('.sort-icon');
        if (iconSpan) {
            iconSpan.classList.remove('fa-sort');
            iconSpan.classList.add(currentOrderDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down');
        }
        currentPage = 1;
        loadClientes();
    });
});

// resaltar la fila seleccionada
function highlightActiveRow() {
    // Si no hay filas, no hacer nada
    currentTableRows.forEach(row => row.classList.remove('table-active-row'));

    // Añadir la clase a la fila que se está editando
    if (currentEditingClienteId !== null) {
        const activeRow = clientesTableBody.querySelector(`tr[data-cliente-id="${currentEditingClienteId}"]`);
        if (activeRow) {
            activeRow.classList.add('table-active-row');
            activeRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

// guardar o actualizar un cliente
clienteForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!validateForm()) {
        showErrorMessage('Por favor, corrige los errores en el formulario.');
        return;
    }

    pendingUpdateClienteData = {
        id: parseInt(clienteIdInput.value),
        nombre: nombreInput.value,
        apellido: apellidoInput.value,
        email: emailInput.value,
        telefono: telefonoInput.value || null,
        fechaNacimiento: fechaNacimientoInput.value ? new Date(fechaNacimientoInput.value).toISOString().split('T')[0] : null,
        activo: activoInput.checked
    };

    if (pendingUpdateClienteData.id === 0) {
        await saveCliente(pendingUpdateClienteData);
    } else {
        const hasChanges = checkChanges(originalClienteData, pendingUpdateClienteData);

        if (hasChanges) {
            showUpdateConfirmModal(originalClienteData, pendingUpdateClienteData);
        } else {
            showErrorMessage('No se detectaron cambios en la información del cliente.');
        }
    }
});

async function saveCliente(clienteData) {
    showLoadingSpinner();
    try {
        let response;
        let method;
        let url;
        let successMessage;

        if (clienteData.id === 0) {
            // Crear nuevo cliente
            method = 'POST';
            url = API_BASE_URL;
            successMessage = 'Cliente creado exitosamente.';
        } else {
            // Actualizar cliente existente
            method = 'PUT';
            url = `${API_BASE_URL}/${clienteData.id}`;
            successMessage = 'Cliente actualizado exitosamente.';
        }

        response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clienteData)
        });

        if (response.ok) {
            showSuccessModal(successMessage);
            resetForm();
            loadClientes(); // Recarga la tabla para reflejar los cambios
        } else {
            const errorText = await response.text();
            let errorMessage = `Error al ${clienteData.id === 0 ? 'crear' : 'actualizar'} cliente: `;
            try {
                // Intenta parsear como JSON si el backend devuelve un objeto de error
                const errorJson = JSON.parse(errorText);
                errorMessage += errorJson.message || errorText; // Si hay un campo 'message', úsalo
            } catch (e) {
                errorMessage += errorText; // Si no es JSON, usa el texto plano
            }
            showErrorMessage(errorMessage);
        }
    } catch (error) {
        console.error('Error al guardar cliente:', error);
        showErrorMessage(`Error de red al guardar cliente: ${error.message}`);
    } finally {
        hideLoadingSpinner();
    }
}

// Función para comparar datos y detectar cambios
function checkChanges(oldData, newData) {
    const normalize = (data) => {
        return {
            nombre: data.nombre,
            apellido: data.apellido,
            email: data.email,
            telefono: data.telefono || null,
            fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento).toISOString().split('T')[0] : null,
            activo: data.activo
        };
    };

    const normalizedOld = normalize(oldData);
    const normalizedNew = normalize(newData);

    return JSON.stringify(normalizedOld) !== JSON.stringify(normalizedNew);
}

// Llena el formulario con los datos del cliente a editar
function editCliente(cliente) {
    currentEditingClienteId = cliente.id; // Establece el ID del cliente que se está editando
    highlightActiveRow(); // Resalta la fila

    clienteIdInput.value = cliente.id;
    nombreInput.value = cliente.nombre;
    apellidoInput.value = cliente.apellido;
    emailInput.value = cliente.email;
    telefonoInput.value = cliente.telefono || '';
    fechaNacimientoInput.value = cliente.fechaNacimiento ? new Date(cliente.fechaNacimiento).toISOString().split('T')[0] : '';
    activoInput.checked = cliente.activo;

    saveButton.textContent = 'Actualizar Cliente';
    cancelButton.style.display = 'inline-block';

    // Guarda una copia profunda de los datos originales del cliente
    originalClienteData = { ...cliente };
    originalClienteData.fechaNacimiento = cliente.fechaNacimiento ? new Date(cliente.fechaNacimiento).toISOString().split('T')[0] : null;

    clienteForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Reinicia el formulario a su estado inicial
function resetForm() {
    currentEditingClienteId = null; // Quita el ID del cliente en edición
    highlightActiveRow(); // Quita el resaltado
    clienteToDeleteId = null;
    originalClienteData = null;
    pendingUpdateClienteData = null;
    clienteIdInput.value = '0';
    clienteForm.reset();
    saveButton.textContent = 'Guardar Cliente';
    cancelButton.style.display = 'none';
    messageArea.classList.add('d-none'); // Oculta mensajes de error
    // Limpia los mensajes de error de validación
    formFields.forEach(field => {
        field.input.classList.remove('is-invalid');
        field.errorDiv.textContent = '';
    });
}

// Cancelar edición y resetear formulario
cancelButton.addEventListener('click', resetForm);

// Eliminar cliente
async function deleteCliente(id) {
    clienteToDeleteId = id;
    customConfirmModal.classList.add('active');
}

confirmDeleteBtn.addEventListener('click', async () => {
    if (clienteToDeleteId !== null) {
        showLoadingSpinner();
        try {
            const response = await fetch(`${API_BASE_URL}/${clienteToDeleteId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showSuccessModal('Cliente eliminado exitosamente.'); // Usa el nuevo modal de éxito
                loadClientes();
            } else {
                const errorText = await response.text();
                showErrorMessage(`Error al eliminar cliente: ${errorText}`);
            }
        } catch (error) {
            console.error('Error al eliminar cliente:', error);
            showErrorMessage(`Error de red al eliminar cliente: ${error.message}`);
        } finally {
            hideCustomConfirmModal();
            hideLoadingSpinner();
        }
    }
});

cancelDeleteBtn.addEventListener('click', () => {
    hideCustomConfirmModal();
});

function hideCustomConfirmModal() {
    customConfirmModal.classList.remove('active');
    clienteToDeleteId = null;
}

// confirmación de actualización
function showUpdateConfirmModal(oldData, newData) {
    updateChangesSummary.innerHTML = ''; // Limpiar contenido previo

    const fields = [
        { key: 'nombre', label: 'Nombre' },
        { key: 'apellido', label: 'Apellido' },
        { key: 'email', label: 'Email' },
        { key: 'telefono', label: 'Teléfono' },
        { key: 'fechaNacimiento', label: 'Fecha de Nacimiento', format: (val) => val ? new Date(val).toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'N/A' },
        { key: 'activo', label: 'Activo', format: (val) => val ? 'Sí' : 'No' }
    ];

    let hasDisplayedChanges = false;
    fields.forEach(field => {
        const oldVal = (field.format ? field.format(oldData[field.key]) : oldData[field.key]) || 'N/A';
        const newVal = (field.format ? field.format(newData[field.key]) : newData[field.key]) || 'N/A';

        if (oldVal !== newVal) {
            hasDisplayedChanges = true;
            const p = document.createElement('p');
            p.innerHTML = `<strong>${field.label}:</strong> <span class="old-value">${oldVal}</span> &rarr; <span class="new-value">${newVal}</span>`;
            updateChangesSummary.appendChild(p);
        }
    });

    if (!hasDisplayedChanges) {
        const p = document.createElement('p');
        p.textContent = 'No se encontraron diferencias en los campos modificados.';
        updateChangesSummary.appendChild(p);
    }

    updateConfirmModal.classList.add('active');
}

function hideUpdateConfirmModal() {
    updateConfirmModal.classList.remove('active');
    pendingUpdateClienteData = null;
}

// Confirmar actualización
confirmUpdateBtn.addEventListener('click', async () => {
    if (pendingUpdateClienteData) {
        await saveCliente(pendingUpdateClienteData); // Procede a guardar si se confirma
        hideUpdateConfirmModal();
    }
});

// Cancelar actualización
cancelUpdateBtn.addEventListener('click', () => {
    hideUpdateConfirmModal();
});


// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa los parámetros de ordenamiento para los encabezados
    tableHeaders.forEach(header => {
        const sortBy = header.dataset.sort;
        const iconSpan = header.querySelector('.sort-icon');
        if (sortBy === currentOrderBy) {
            header.dataset.sortDirection = currentOrderDirection;
            if (iconSpan) {
                 iconSpan.classList.remove('fa-sort');
                 iconSpan.classList.add(currentOrderDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down');
            }
        } else {
            if (iconSpan) {
                 iconSpan.classList.add('fa-sort');
            }
        }
    });
    loadClientes();
});