// Vérification du login
function checkLogin() {
    const className = document.getElementById("class-name").value;
    const password = document.getElementById("password").value;
    if (className === "SECONDE SB" && password === "SECONDE_SB@2008") {
        document.getElementById("login-section").style.display = "none";
        document.getElementById("main-section").style.display = "block";
        initTable();
        loadSavedData();
    } else {
        document.getElementById("login-error").innerText = "Nom de classe ou mot de passe incorrect.";
    }
}

// Basculer la visibilité du mot de passe
function togglePassword() {
    const passwordInput = document.getElementById("password");
    const toggleIcon = document.getElementById("toggle-icon");
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleIcon.classList.remove("fa-eye");
        toggleIcon.classList.add("fa-eye-slash");
    } else {
        passwordInput.type = "password";
        toggleIcon.classList.remove("fa-eye-slash");
        toggleIcon.classList.add("fa-eye");
    }
}

// Initialisation du tableau avec les matières
function initTable() {
    const subjects = [
        { name: "Français", coef: 3 },
        { name: "Mathématiques", coef: 5 },
        { name: "Anglais", coef: 3 },
        { name: "Histoire-Géographie", coef: 3 },
        { name: "SVT", coef: 5 },
        { name: "Arabe", coef: 3 },
        { name: "Sciences Physiques", coef: 5 },
        { name: "EPS", coef: 1, noComposition: true }
    ];

    const table = document.getElementById("subjects-table");
    table.innerHTML = ''; // Clear previous table rows

    subjects.forEach((subject, index) => {
        const row = table.insertRow();
        row.insertCell(0).innerText = subject.name;
        row.insertCell(1).innerHTML = `<input type="number" id="devoir1-${index}" class="form-control" min="0" max="20">`;
        row.insertCell(2).innerHTML = `<input type="number" id="devoir2-${index}" class="form-control" min="0" max="20">`;
        row.insertCell(3).innerHTML = `<input type="number" id="moy-devoirs-${index}" class="form-control" readonly>`;

        if (subject.noComposition) {
            row.insertCell(4).innerHTML = `<input type="text" id="composition-${index}" class="form-control" value="-" readonly>`;
        } else {
            row.insertCell(4).innerHTML = `<input type="number" id="composition-${index}" class="form-control" min="0" max="20">`;
        }

        row.insertCell(5).innerHTML = `<input type="number" id="moy-discipline-${index}" class="form-control" readonly>`;
        row.insertCell(6).innerText = subject.coef;
        row.insertCell(7).innerHTML = `<input type="number" id="moy-coef-${index}" class="form-control font-weight-bold" readonly>`;
        row.insertCell(8).innerHTML = `<input type="text" id="appreciation-${index}" class="form-control" readonly>`;

        document.getElementById(`devoir1-${index}`).addEventListener("input", () => calculateAverage(index, subject.coef));
        document.getElementById(`devoir2-${index}`).addEventListener("input", () => calculateAverage(index, subject.coef));
        if (!subject.noComposition) {
            document.getElementById(`composition-${index}`).addEventListener("input", () => calculateAverage(index, subject.coef));
        }
    });
}

// Calcul de la moyenne et de la somme moy x coef pour chaque matière
function calculateAverage(index, coef) {
    const devoir1 = parseFloat(document.getElementById(`devoir1-${index}`).value) || 0;
    const devoir2 = parseFloat(document.getElementById(`devoir2-${index}`).value) || 0;
    const composition = parseFloat(document.getElementById(`composition-${index}`).value) || 0;

    if (devoir1 > 20 || devoir2 > 20 || composition > 20) {
        alert("Les notes doivent être entre 0 et 20.");
        return;
    }

    let moyDevoirs = ((devoir1 + devoir2) / 2).toFixed(2);
    document.getElementById(`moy-devoirs-${index}`).value = moyDevoirs;

    let moyDiscipline = 0;
    if (subjectHasComposition(index)) {
        moyDiscipline = ((parseFloat(moyDevoirs) + composition) / 2).toFixed(2);
    } else {
        moyDiscipline = moyDevoirs;
    }
    document.getElementById(`moy-discipline-${index}`).value = moyDiscipline;

    const moyCoef = (moyDiscipline * coef).toFixed(2);
    document.getElementById(`moy-coef-${index}`).value = moyCoef;

    document.getElementById(`appreciation-${index}`).value = generateAppreciation(moyDiscipline);

    updateTotalMoyCoef();
    saveData();
}

// Vérifie si la matière a une note de composition
function subjectHasComposition(index) {
    return document.getElementById(`composition-${index}`).value !== "-";
}

// Mise à jour du total de la colonne "Moy x Coef"
function updateTotalMoyCoef() {
    let total = 0;
    const rows = document.getElementById("subjects-table").rows.length;
    for (let i = 0; i < rows; i++) {
        total += parseFloat(document.getElementById(`moy-coef-${i}`).value) || 0;
    }
    document.getElementById("total-moy-coef").innerText = total.toFixed(2);

    const totalCoef = Array.from(document.getElementById("subjects-table").rows)
        .map(row => parseFloat(row.cells[6]?.innerText) || 0)
        .reduce((acc, val) => acc + val, 0);
    const moyenneSemestrielle = (total / totalCoef).toFixed(2);
    document.getElementById("semestre-moyenne").innerText = moyenneSemestrielle;
}

// Génération de l'appréciation basée sur la moyenne de la discipline
function generateAppreciation(moyDiscipline) {
    if (moyDiscipline >= 17) return "Excellent";
    if (moyDiscipline >= 16) return "Trés Bien";
    if (moyDiscipline >= 14) return "Bien";
    if (moyDiscipline >= 12) return "Assez Bien";
    if (moyDiscipline >= 10) return "Passable";
    if (moyDiscipline >= 8) return "Insuffisant";
    return "Médiocre";
}

// Sauvegarde des données dans le stockage local
function saveData() {
    const subjects = document.getElementById("subjects-table").rows.length;
    let data = [];
    for (let i = 0; i < subjects; i++) {
        data.push({
            devoir1: document.getElementById(`devoir1-${i}`).value,
            devoir2: document.getElementById(`devoir2-${i}`).value,
            composition: document.getElementById(`composition-${i}`).value,
        });
    }
    localStorage.setItem("savedData", JSON.stringify(data));
}

// Chargement des données sauvegardées
function loadSavedData() {
    const savedData = JSON.parse(localStorage.getItem("savedData"));
    if (savedData) {
        savedData.forEach((subject, index) => {
            document.getElementById(`devoir1-${index}`).value = subject.devoir1;
            document.getElementById(`devoir2-${index}`).value = subject.devoir2;
            document.getElementById(`composition-${index}`).value = subject.composition;
            calculateAverage(index, parseFloat(document.getElementById("subjects-table").rows[index].cells[6].innerText));
        });
    }
}

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    // Nom de l'utilisateur
    const userName = prompt("Entrez votre nom pour générer le PDF");
    if (!userName) {
        alert("Nom d'utilisateur requis pour générer le PDF.");
        return;
    }

    // Couleurs et styles de base
    const headerBgColor = [220, 220, 220];  // Gris très clair pour le fond de l'en-tête
    const headerTextColor = [0, 0, 0];  // Noir pour le texte de l'en-tête
    const textColor = [0, 0, 0];  // Noir pour le texte
    const cellBgColor = [240, 240, 240];  // Gris pour les cellules de ligne alternée
    const footerColor = [33, 150, 243];

    // Titre du document
    doc.setFontSize(16);
    doc.setTextColor(...textColor); 
    doc.text(`Bulletin de Notes de ${userName}`, 105, 20, { align: "center" });

    // En-tête du tableau
    const header = [
        "Discipline", "Moyenne Devoirs", "Note Composition", "Moyenne Discipline", 
        "Coefficient", "Moy x Coef", "Appréciation"
    ];

    const startY = 40;
    const marginLeft = 10;
    const cellWidth = 28;
    const cellHeight = 8;
    let yPosition = startY;

    // Fond et texte de l'en-tête
    doc.setFontSize(10);
    doc.setTextColor(...headerTextColor);  // Noir pour le texte de l'en-tête
    doc.setFont("helvetica", "bold");  // Texte en gras pour l'en-tête
    doc.setFillColor(...headerBgColor);  // Gris très clair pour le fond de l'en-tête

    header.forEach((col, i) => {
        const xPosition = marginLeft + i * cellWidth;
        doc.rect(xPosition, yPosition, cellWidth, cellHeight, 'F');
        doc.text(col, xPosition + cellWidth / 2, yPosition + 5, { align: "center" });
    });

    yPosition += cellHeight;

    // Lignes du tableau avec fond alterné
    const rows = [];
    const subjects = document.getElementById("subjects-table").rows;
    doc.setFont("helvetica", "normal");  // Texte normal pour les données du tableau
    doc.setTextColor(...textColor);  // Noir pour le texte des données

    for (let i = 0; i < subjects.length - 2; i++) {
        const row = subjects[i].cells;
        const subjectName = row[0].innerText;
        
        const devoir1 = parseFloat(document.getElementById(`devoir1-${i}`).value) || 0;
        const devoir2 = parseFloat(document.getElementById(`devoir2-${i}`).value) || 0;
        const moyDevoirs = ((devoir1 + devoir2) / 2).toFixed(2);
        
        const composition = document.getElementById(`composition-${i}`).value || "-";
        const moyDiscipline = document.getElementById(`moy-discipline-${i}`).value || "-";
        const coef = row[6].innerText;
        const moyCoef = document.getElementById(`moy-coef-${i}`).value || "-";
        const appreciation = document.getElementById(`appreciation-${i}`).value || "-";

        rows.push([subjectName, moyDevoirs, composition, moyDiscipline, coef, moyCoef, appreciation]);
    }

    rows.forEach((rowData, rowIndex) => {
        // Alterner la couleur de fond pour chaque ligne
        const bgColor = rowIndex % 2 === 0 ? cellBgColor : [255, 255, 255];
        doc.setFillColor(...bgColor);

        rowData.forEach((data, i) => {
            doc.setFillColor(...bgColor);  // Couleur de fond
            doc.setTextColor(...textColor);  // Couleur du texte
            const xPosition = marginLeft + i * cellWidth;
            doc.rect(xPosition, yPosition, cellWidth, cellHeight, 'FD');
            doc.text(data.toString(), xPosition + cellWidth / 2, yPosition + 5, { align: "center" });
        });
        yPosition += cellHeight;

        if (yPosition > 260) {  // Nouvelle page si dépassement
            doc.addPage();
            yPosition = 20;
        }
    });

    // Totaux et Moyenne Semestrielle
    yPosition += 10;
    doc.setFontSize(12);
    doc.setTextColor(...headerBgColor);
    doc.text(`Total Moy x Coef: ${document.getElementById("total-moy-coef").innerText}`, marginLeft, yPosition);
    doc.text(`Moyenne Semestrielle: ${document.getElementById("semestre-moyenne").innerText}`, marginLeft, yPosition + 10);

    // Pied de page
    yPosition += 30;
    doc.setFillColor(...footerColor);
    doc.rect(0, 285, 210, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text("Développeur: Babacar Doumbia", marginLeft, 290);

    // Sauvegarde du PDF
    doc.save(`bulletin_${userName}.pdf`);
}


// Réinitialisation des notes et du stockage local
function resetData() {
    localStorage.removeItem("savedData"); // Effacer les données sauvegardées
    initTable(); // Réinitialiser le tableau
    updateTotalMoyCoef(); // Recalculer les totaux
}
