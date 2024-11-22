const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Archivos JSON
const personsFile = "./persons.json";
const environmentsFile = "./environments.json";

// --- Rutas para personas ---
app.get("/api/persons", (req, res) => {
    fs.readFile(personsFile, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading persons file:", err);
            return res.status(500).json({ error: "Failed to load persons" });
        }
        res.json(JSON.parse(data));
    });
});

// --- Rutas para ambientes ---
app.get("/api/environments", (req, res) => {
    fs.readFile(environmentsFile, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading environments file:", err);
            return res.status(500).json({ error: "Failed to load environments" });
        }
        res.json(JSON.parse(data));
    });
});

app.post("/api/environments", (req, res) => {
    const newRegion = req.body;

    fs.readFile(environmentsFile, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Failed to read environments file" });

        const environments = JSON.parse(data);
        environments.push(newRegion);

        fs.writeFile(environmentsFile, JSON.stringify(environments, null, 2), "utf8", (err) => {
            if (err) return res.status(500).json({ error: "Failed to save environment" });
            res.json({ message: "Region added successfully!" });
        });
    });
});

app.put("/api/environments/:index", (req, res) => {
    const index = parseInt(req.params.index);
    const updatedRegion = req.body;

    fs.readFile(environmentsFile, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Failed to read environments file" });

        const environments = JSON.parse(data);
        environments[index] = updatedRegion;

        fs.writeFile(environmentsFile, JSON.stringify(environments, null, 2), "utf8", (err) => {
            if (err) return res.status(500).json({ error: "Failed to save environment" });
            res.json({ message: "Region updated successfully!" });
        });
    });
});

app.delete("/api/environments/:index", (req, res) => {
    const index = parseInt(req.params.index);

    fs.readFile(environmentsFile, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Failed to read environments file" });

        const environments = JSON.parse(data);
        environments.splice(index, 1);

        fs.writeFile(environmentsFile, JSON.stringify(environments, null, 2), "utf8", (err) => {
            if (err) return res.status(500).json({ error: "Failed to save environments" });
            res.json({ message: "Region deleted successfully!" });
        });
    });
});






















// Inicia el servidor
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
