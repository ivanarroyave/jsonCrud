const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Ruta del archivo JSON
const JSON_FILE = path.join(__dirname, "persons.json");

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Servir archivos estáticos (frontend)
app.use(express.static(path.join(__dirname, "public")));

// Rutas para la API
app.get("/api/persons", (req, res) => {
    fs.readFile(JSON_FILE, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            return res.status(500).json({ error: "Failed to read data" });
        }
        res.json(JSON.parse(data));
    });
});

app.post("/api/persons", (req, res) => {
    const newPerson = req.body;

    fs.readFile(JSON_FILE, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            return res.status(500).json({ error: "Failed to read data" });
        }

        const persons = JSON.parse(data);
        persons.unshift(newPerson); // Agregar nueva persona al inicio del array

        fs.writeFile(JSON_FILE, JSON.stringify(persons, null, 2), "utf8", (err) => {
            if (err) {
                console.error("Error writing file:", err);
                return res.status(500).json({ error: "Failed to write data" });
            }
            res.json({ message: "Person added successfully" });
        });
    });
});

app.put("/api/persons/:index", (req, res) => {
    const index = parseInt(req.params.index);
    const updatedPerson = req.body;

    fs.readFile(JSON_FILE, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            return res.status(500).json({ error: "Failed to read data" });
        }

        const persons = JSON.parse(data);
        if (index < 0 || index >= persons.length) {
            return res.status(404).json({ error: "Person not found" });
        }

        persons[index] = updatedPerson;

        fs.writeFile(JSON_FILE, JSON.stringify(persons, null, 2), "utf8", (err) => {
            if (err) {
                console.error("Error writing file:", err);
                return res.status(500).json({ error: "Failed to write data" });
            }
            res.json({ message: "Person updated successfully" });
        });
    });
});

app.delete("/api/persons/:index", (req, res) => {
    const index = parseInt(req.params.index);

    fs.readFile(JSON_FILE, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            return res.status(500).json({ error: "Failed to read data" });
        }

        const persons = JSON.parse(data);
        if (index < 0 || index >= persons.length) {
            return res.status(404).json({ error: "Person not found" });
        }

        persons.splice(index, 1);

        fs.writeFile(JSON_FILE, JSON.stringify(persons, null, 2), "utf8", (err) => {
            if (err) {
                console.error("Error writing file:", err);
                return res.status(500).json({ error: "Failed to write data" });
            }
            res.json({ message: "Person deleted successfully" });
        });
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
