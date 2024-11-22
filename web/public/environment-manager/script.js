let regions = []; // Array to store the regions
let editingRegionIndex = null; // Indicates if we are editing a region
let currentRegionIndex = null; // Index of the current region

// *********************************************************************************
// ******************************** Modals *****************************************
// *********************************************************************************
const showRegionModal = (regionIndex = null) => {
    editingRegionIndex = regionIndex; // If null, it means we are adding a new region.

    const regionModal = new bootstrap.Modal(document.getElementById("regionModal"));

    if (regionIndex !== null) {
        // Edit mode: Load the region name
        document.getElementById("regionName").value = regions[regionIndex].name;
        document.getElementById("regionModalLabel").innerText = "Edit Region";
    } else {
        // Add mode: Clear the field
        document.getElementById("regionName").value = "";
        document.getElementById("regionModalLabel").innerText = "Add Region";
    }

    regionModal.show();
};

const showUrlModal = (regionIndex) => {
    currentRegionIndex = regionIndex;

    const urlModal = new bootstrap.Modal(document.getElementById("urlModal"));

    // Add mode: Clear all fields
    document.getElementById("urlForm").reset();
    document.getElementById("urlModalLabel").innerText = "Add URL";

    urlModal.show();
};

// *********************************************************************************
// ********************* Render Regions and URLs ***********************************
// *********************************************************************************
const renderRegions = () => {
    const container = document.getElementById("regions-container");
    container.innerHTML = ""; // Clear the container before rendering

    regions.forEach((region, regionIndex) => {
        const regionCard = document.createElement("div");
        regionCard.classList.add("card", "mb-4");

        regionCard.innerHTML = `
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5>${region.name}</h5>
                <div>
                    <button class="btn btn-warning btn-sm" onclick="showRegionModal(${regionIndex})">Edit Region</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteRegion(${regionIndex})">Delete Region</button>
                </div>
            </div>
            <div class="card-body">
                <button class="btn btn-success mb-3" onclick="showUrlModal(${regionIndex})">Add URL</button>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Environment</th>
                            <th>URL</th>
                            <th>Certificate</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        `;

        const tbody = regionCard.querySelector("tbody");

        region.urls.forEach((url, urlIndex) => {
            const row = document.createElement("tr");
            row.setAttribute("data-region-index", regionIndex);
            row.setAttribute("data-url-index", urlIndex);

            const environments = ["QA", "SBX", "STG", "PRD"];
            const environmentOptions = environments
                .map(env => `<option value="${env}" ${url.environment === env ? "selected" : ""}>${env}</option>`)
                .join("");

            row.innerHTML = `
                <td contenteditable="true">${url.name}</td>
                <td contenteditable="true">
                    <select id="updateUrlEnvironment-${urlIndex}" class="form-select environment-select">
                        ${environmentOptions}
                    </select>
                </td>
                <td contenteditable="true">${url.url}</td>
                <td>
                    <table class="table table-sm table-borderless">
                        <tr>
                            <td><strong>Host:</strong></td>
                            <td contenteditable="true" class="${url.certificate.host ? '' : 'placeholder'}" data-placeholder="Enter a Host">${url.certificate.host || ""}</td>
                        </tr>
                        <tr>
                            <td><strong>Port:</strong></td>
                            <td contenteditable="true" class="${url.certificate.port ? '' : 'placeholder'}" data-placeholder="Enter port">${url.certificate.port || ""}</td>
                        </tr>
                        <tr>
                            <td><strong>CRT:</strong></td>
                            <td contenteditable="true" class="${url.certificate.crtFile ? '' : 'placeholder'}" data-placeholder="Enter a CRT file path">${url.certificate.crtFile || ""}</td>
                        </tr>
                        <tr>
                            <td><strong>Key:</strong></td>
                            <td contenteditable="true" class="${url.certificate.keyFile ? '' : 'placeholder'}" data-placeholder="Enter a Key file path">${url.certificate.keyFile || ""}</td>
                        </tr>
                        <tr>
                            <td><strong>PfxFile:</strong></td>
                            <td contenteditable="true" class="${url.certificate.pfxFile ? '' : 'placeholder'}" data-placeholder="Enter PFX file path">${url.certificate.pfxFile || ""}</td>
                        </tr>
                        <tr>
                            <td><strong>Passphrase:</strong></td>
                            <td contenteditable="true" class="${url.certificate.passphrase ? '' : 'placeholder'}" data-placeholder="Enter Passphrase">${url.certificate.passphrase || ""}</td>
                        </tr>
                    </table>
                </td>
                <td>
                    <button class="btn btn-primary btn-sm save-btn" onclick="updateUrl(${regionIndex}, ${urlIndex})" disabled>Save</button>
                    <button class="btn btn-secondary btn-sm cancel-btn" onclick="cancelEdit(${regionIndex}, ${urlIndex})" disabled>Cancel</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteUrl(${regionIndex}, ${urlIndex})">Delete</button>
                </td>
            `;

            // Add events to each editable cell
            row.querySelectorAll("td[contenteditable='true']").forEach((cell) => {
                cell.addEventListener("input", () => enableSave(regionIndex, urlIndex));
            });

            tbody.appendChild(row);
        });

        container.appendChild(regionCard);
    });
};

document.querySelectorAll('td[contenteditable]').forEach((cell) => {
    // Verifica inicialmente si el contenido está vacío y aplica la clase placeholder
    if (cell.innerText.trim() === "") {
        cell.classList.add("placeholder");
    } else {
        cell.classList.remove("placeholder"); // Asegúrate de quitar la clase si hay contenido
    }

    // Escucha cambios dinámicos en el contenido
    cell.addEventListener('input', () => {
        if (cell.innerText.trim() === "") {
            cell.classList.add("placeholder"); // Reaplica placeholder si queda vacío
        } else {
            cell.classList.remove("placeholder"); // Quita placeholder si hay contenido
        }
    });
});


// *********************************************************************************
// ******************************* REGION ******************************************
// *********************************************************************************
const saveRegion = async () => {
    const name = document.getElementById("regionName").value.trim();
    if (!name) {
        alert("Region name is required!");
        return;
    }

    if (editingRegionIndex === null) {
        const newRegion = { name, urls: [] };
        regions.push(newRegion);

        try {
            const response = await fetch("/api/environments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newRegion),
            });
            if (!response.ok) throw new Error("Failed to add region");
            renderRegions();
            alert("Region added successfully!");
        } catch (error) {
            console.error("Error adding region:", error);
            alert("Failed to add region. Please try again.");
        }
    } else {
        regions[editingRegionIndex].name = name;

        try {
            const response = await fetch(`/api/environments/${editingRegionIndex}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(regions[editingRegionIndex]),
            });
            if (!response.ok) throw new Error("Failed to edit region");
            renderRegions();
            alert("Region updated successfully!");
        } catch (error) {
            console.error("Error editing region:", error);
            alert("Failed to edit region. Please try again.");
        }
    }

    const regionModal = bootstrap.Modal.getInstance(document.getElementById("regionModal"));
    regionModal.hide();
};

document.getElementById("saveRegionBtn").addEventListener("click", saveRegion);

const editRegion = async (regionIndex) => {
    const newName = prompt("Enter the new name for this region:", regions[regionIndex].name);
    if (!newName) return;

    // Update the region locally
    regions[regionIndex].name = newName;

    // Send changes to the server
    try {
        const response = await fetch(`/api/environments/${regionIndex}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(regions[regionIndex]),
        });
        if (!response.ok) throw new Error("Failed to edit region");

        // Update the page.
        renderRegions();
        alert("Region updated successfully!");
    } catch (error) {
        console.error("Error editing region:", error);
        alert("Failed to edit region. Please try again.");
    }
};

const deleteRegion = async (regionIndex) => {
    if (!confirm("Are you sure you want to delete this region?")) return;

    // Delete locally
    regions.splice(regionIndex, 1);

    // Send changes to the server
    try {
        const response = await fetch(`/api/environments/${regionIndex}`, {
            method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete region");

        // Update the page.
        renderRegions();
        alert("Region deleted successfully!");
    } catch (error) {
        console.error("Error deleting region:", error);
        alert("Failed to delete region. Please try again.");
    }
};

// *********************************************************************************
// ******************************* URLs ********************************************
// *********************************************************************************
const saveUrl = async () => {
    // Get the data from the certificate cells

    const newHost = document.getElementById("certificateHost").value.trim();
    const newPort = document.getElementById("certificatePort").value.trim();
    const newCrtFile = document.getElementById("certificateCrtFile").value.trim();
    const newKeyFile = document.getElementById("certificateKeyFile").value.trim();
    const newPfcFile = document.getElementById("certificatePfxFile").value.trim();
    const newPassphrase = document.getElementById("certificatePassphrase").value.trim();

    const url = {
        name: document.getElementById("urlName").value.trim(),
        environment: document.getElementById("urlEnvironment").value.trim(),
        url: document.getElementById("urlAddress").value.trim(),
        certificate: {
            host: newHost || null,
            port: newPort || null,
            crtFile: newCrtFile || null,
            keyFile: newKeyFile || null,
            pfxFile: newPfcFile || null,
            passphrase: newPassphrase || null
        }
    };

    if (!url.name || !url.environment || !url.url) {
        alert("All fields are required except those of the certificate!");
        return;
    }

    // Add a new url
    regions[currentRegionIndex].urls.push(url);

    try {
        const response = await fetch(`/api/environments/${currentRegionIndex}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(regions[currentRegionIndex]),
        });
        if (!response.ok) throw new Error("Failed to save URL");

        renderRegions(); //Update table
        alert("URL saved successfully!");
    } catch (error) {
        console.error("Error saving URL:", error);
        alert("Failed to save URL. Please try again.");
    }

    const urlModal = bootstrap.Modal.getInstance(document.getElementById("urlModal"));
    urlModal.hide();
};

document.getElementById("saveUrlBtn").addEventListener("click", saveUrl);

const updateUrl = async (regionIndex, urlIndex) => {
    console.log("Save button clicked for region:", regionIndex, "URL:", urlIndex);

    // Find the corresponding row
    const row = document.querySelector(
        `tr[data-region-index="${regionIndex}"][data-url-index="${urlIndex}"]`
    );

    if (!row) {
        console.error("Row not found for save operation");
        return;
    }

    // Get data from cells
    const newName = row.children[0].innerText.trim();
    const newEnvironment = document.getElementById(`updateUrlEnvironment-${urlIndex}`).value.trim()
    const newUrl = row.children[2].innerText.trim();

    // Get the data from the certificate cells
    const certificateTable = row.children[3].querySelector("table");
    const newHost = certificateTable.rows[0].cells[1].innerText.trim();
    const newPort = certificateTable.rows[1].cells[1].innerText.trim();
    const newCrtFile = certificateTable.rows[2].cells[1].innerText.trim();
    const newKeyFile = certificateTable.rows[3].cells[1].innerText.trim();
    const newPfcFile = certificateTable.rows[4].cells[1].innerText.trim();
    const newPassphrase = certificateTable.rows[5].cells[1].innerText.trim();

    if (!newName || !newEnvironment || !newUrl) {
        alert("All fields are required except those of the certificate!");
        return;
    }

    // Update locally
    const url = regions[regionIndex].urls[urlIndex];
    url.name = newName;
    url.environment = newEnvironment;
    url.url = newUrl;
    url.certificate = {
        host: newHost || null,
        port: newPort || null,
        crtFile: newCrtFile || null,
        keyFile: newKeyFile || null,
        pfxFile: newPfcFile || null,
        passphrase: newPassphrase || null
    };

    // Synchronize with the server (optional)
    try {
        const response = await fetch(`/api/environments/${regionIndex}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(regions[regionIndex]),
        });

        if (!response.ok) throw new Error("Failed to save URL");

        alert("URL updated successfully!");
        renderRegions(); // Re-render the table
    } catch (error) {
        console.error("Error saving URL:", error);
        alert("Failed to save URL. Please try again.");
    }
};

const deleteUrl = async (regionIndex, urlIndex) => {
    if (!confirm("Are you sure you want to delete this URL?")) return;

    // Delete locally
    regions[regionIndex].urls.splice(urlIndex, 1);

    // Synchronize with the server
    try {
        const response = await fetch(`/api/environments/${regionIndex}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(regions[regionIndex]),
        });
        if (!response.ok) throw new Error("Failed to delete URL");

        renderRegions();
        alert("URL deleted successfully!");
    } catch (error) {
        console.error("Error deleting URL:", error);
        alert("Failed to delete URL. Please try again.");
    }
};

const enableSave = (regionIndex, urlIndex) => {
    console.log(`Enabling Save/Cancel for region ${regionIndex}, URL ${urlIndex}`);

    // Find the corresponding row using data attributes
    const row = document.querySelector(
        `tr[data-region-index="${regionIndex}"][data-url-index="${urlIndex}"]`
    );

    if (!row) {
        console.error("Row not found for region:", regionIndex, "URL:", urlIndex);
        return;
    }

    // Find the Save and Cancel buttons
    const saveButton = row.querySelector(".save-btn");
    const cancelButton = row.querySelector(".cancel-btn");

    if (!saveButton || !cancelButton) {
        console.error("Buttons not found in the row:", row);
        return;
    }

    // Enable buttons
    saveButton.disabled = false;
    cancelButton.disabled = false;
    console.log("Save/Cancel buttons enabled.");
};

const cancelEdit = (regionIndex, urlIndex) => {
    console.log("Cancel button clicked for region:", regionIndex, "URL:", urlIndex);
    renderRegions(); // Re-render the entire table to restore the original data
    alert("Changes canceled.");
};

// *********************************************************************************
// ********---* Initializes the page by loading data from the server ***************
// *********************************************************************************
const loadData = async () => {
    try {
        const response = await fetch("/api/environments");
        if (!response.ok) throw new Error("Failed to load environments");
        regions = await response.json();
        renderRegions();
    } catch (error) {
        console.error("Error loading data:", error);
        alert("Failed to load environments.");
    }
};

loadData();
