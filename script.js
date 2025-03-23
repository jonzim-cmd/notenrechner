// Hilfsfunktionen zum Runden auf halbe Punktwerte
function roundUpToNearestHalf(value) {
  return Math.ceil(value * 2) / 2;
}
function roundDownToNearestHalf(value) {
  return Math.floor(value * 2) / 2;
}

// Preset-Notengrenzen als Dezimalwerte
const ihkThresholds = {
  1: 0.92,
  2: 0.81,
  3: 0.67,
  4: 0.50,
  5: 0.30,
  6: 0    // Note 6: unter 30%
};

const apThresholds = {
  1: 0.85,
  2: 0.70,
  3: 0.55,
  4: 0.41,
  5: 0.20,
  6: 0    // Note 6: unter 20%
};

// Aktuelle Thresholds und aktueller Preset-Modus
let currentThresholds = Object.assign({}, ihkThresholds);
let currentPreset = "IHK"; // "IHK", "AP/3.SA" oder "manuell"

// Elemente
const mainTitle = document.getElementById('mainTitle');
const presetIHKBtn = document.getElementById('presetIHK');
const presetAPBtn = document.getElementById('presetAP');
const thresholdInputs = [
  document.getElementById('threshold1'),
  document.getElementById('threshold2'),
  document.getElementById('threshold3'),
  document.getElementById('threshold4'),
  document.getElementById('threshold5')
];
const infoBox = document.getElementById('infoBox');

// Funktion zur Überschriften-Aktualisierung (Hauptüberschrift)
function updateHeader() {
  let suffix = "";
  if (currentPreset === "IHK") {
    suffix = "IHK 92 %";
  } else if (currentPreset === "AP/3.SA") {
    suffix = "AP/3.SA";
  } else {
    suffix = "manuell";
  }
  mainTitle.textContent = "Notenrechner " + suffix;
}

// Funktion zur dynamischen Anpassung der Info-Box-Überschrift
function updateInfoBoxHeader() {
  let suffix = "";
  if (currentPreset === "IHK") {
    suffix = "IHK 92 %";
  } else if (currentPreset === "AP/3.SA") {
    suffix = "AP/3.SA";
  } else {
    suffix = "manuell";
  }
  return "Notengrenzen " + suffix + ":";
}

// Funktion: Preset laden (Werte und Dashboard-Felder aktualisieren)
function loadPreset(preset) {
  if (preset === "IHK") {
    currentThresholds = Object.assign({}, ihkThresholds);
  } else if (preset === "AP/3.SA") {
    currentThresholds = Object.assign({}, apThresholds);
  }
  currentPreset = preset;
  // Dashboard-Felder aktualisieren mit formatierter Ausgabe
  thresholdInputs[0].value = (currentThresholds[1] * 100).toFixed(2).replace('.', ',');
  thresholdInputs[1].value = (currentThresholds[2] * 100).toFixed(2).replace('.', ',');
  thresholdInputs[2].value = (currentThresholds[3] * 100).toFixed(2).replace('.', ',');
  thresholdInputs[3].value = (currentThresholds[4] * 100).toFixed(2).replace('.', ',');
  thresholdInputs[4].value = (currentThresholds[5] * 100).toFixed(2).replace('.', ',');
  
  updateHeader();
  updateInfoBox();
  updateResult();
}

// Preset-Buttons Event Listener
presetIHKBtn.addEventListener('click', function() {
  loadPreset("IHK");
});
presetAPBtn.addEventListener('click', function() {
  loadPreset("AP/3.SA");
});

// Bei manuellen Änderungen in den Dashboard-Feldern wird der Modus auf "manuell" gesetzt.
thresholdInputs.forEach((input, index) => {
  input.addEventListener('input', function() {
    const val = parseFloat(input.value.replace(',', '.')) / 100;
    if (!isNaN(val)) {
      currentThresholds[index + 1] = val;
    }
    currentPreset = "manuell";
    updateHeader();
    updateInfoBox();
    updateResult();
  });
});

// Event Listener für die Eingabefelder: Maximale und erreichte Punktzahl
document.getElementById('maxPoints').addEventListener('input', function() {
  updateInfoBox();
  updateResult();
});

document.getElementById('achievedPoints').addEventListener('input', function() {
  updateInfoBox();
  updateResult();
});

// Event Listener für die Auf/Ab-Buttons für erreichte Punktzahl
document.getElementById('increasePoints').addEventListener('click', function() {
  const achievedPointsInput = document.getElementById('achievedPoints');
  const maxPointsInput = document.getElementById('maxPoints');
  
  // Aktuellen Wert parsen, mit Fallback auf 0 wenn ungültig
  let value = parseFloat((achievedPointsInput.value || '0').replace(',', '.')) || 0;
  const maxValue = parseFloat((maxPointsInput.value || '100').replace(',', '.')) || 100;
  
  // Um 0,5 erhöhen, aber nicht über den Maximalwert
  value = Math.min(value + 0.5, maxValue);
  
  // Formatierung mit Komma statt Punkt und einer Nachkommastelle
  achievedPointsInput.value = value.toFixed(1).replace('.', ',');
  
  // Sofort aktualisieren
  updateInfoBox();
  updateResult();
});

document.getElementById('decreasePoints').addEventListener('click', function() {
  const achievedPointsInput = document.getElementById('achievedPoints');
  
  // Aktuellen Wert parsen, mit Fallback auf 0 wenn ungültig
  let value = parseFloat((achievedPointsInput.value || '0').replace(',', '.')) || 0;
  
  // Um 0,5 verringern, aber nicht unter 0
  value = Math.max(value - 0.5, 0);
  
  // Formatierung mit Komma statt Punkt und einer Nachkommastelle
  achievedPointsInput.value = value.toFixed(1).replace('.', ',');
  
  // Sofort aktualisieren
  updateInfoBox();
  updateResult();
});

// Aktualisiert die Info-Box inklusive dynamischer Überschrift und stellt die Notengrenzen in Tabellenform dar
function updateInfoBox() {
  const maxPointsInput = document.getElementById('maxPoints').value;
  const achievedPointsInput = document.getElementById('achievedPoints').value;
  let html = `<h3>${updateInfoBoxHeader()}</h3>`;
  
  // Versuche, den eingegebenen Maximalwert zu parsen
  const maxPointsValue = maxPointsInput.replace(',', '.');
  const maxPoints = parseFloat(maxPointsValue);
  const hasValidMaxPoints = !isNaN(maxPoints) && maxPoints >= 10 && maxPoints <= 100;
  
  // Errechne, falls möglich, den erreichten Prozentwert und bestimme die Note
  let highlightedGrade = null;
  if (hasValidMaxPoints && achievedPointsInput !== "") {
    const achievedPointsValue = achievedPointsInput.replace(',', '.');
    const achievedPoints = parseFloat(achievedPointsValue);
    if (!isNaN(achievedPoints) && achievedPoints >= 0 && achievedPoints <= maxPoints) {
      const achievedPercentage = (achievedPoints / maxPoints) * 100;
      for (let g = 1; g <= 6; g++) {
        if (achievedPercentage >= currentThresholds[g] * 100) {
          highlightedGrade = g;
          break;
        }
      }
    }
  }
  
  if (hasValidMaxPoints) {
    // Kopfzeile wie im Original, inklusive der Spalte "ab (%)" und "Punkte"
    html += `<table>
              <thead>
                <tr>
                  <th>Note</th>
                  <th>ab (%)</th>
                  <th>Punkte</th>
                </tr>
              </thead>
              <tbody>`;
    // Für Note 1 bis 5: Berechne den Punktebereich als "von … bis … Punkte"
    for (let grade = 1; grade <= 5; grade++) {
      const percentage = (currentThresholds[grade] * 100).toFixed(2).replace('.', ',');
      let lowerPoints = roundUpToNearestHalf(maxPoints * currentThresholds[grade]);
      let upperPoints;
      if (grade === 1) {
        upperPoints = roundDownToNearestHalf(maxPoints);
      } else {
        upperPoints = roundDownToNearestHalf(maxPoints * currentThresholds[grade - 1] - 0.1);
      }
      const lowerStr = lowerPoints.toFixed(1).replace('.', ',');
      const upperStr = upperPoints.toFixed(1).replace('.', ',');
      const rowClass = (highlightedGrade === grade) ? ' class="highlight"' : '';
      html += `<tr${rowClass}>
                 <td>Note ${grade}</td>
                 <td>${percentage}%</td>
                 <td>von ${lowerStr} bis ${upperStr} Punkte</td>
               </tr>`;
    }
    // Für Note 6: "weniger als ..." basierend auf der Schwelle der Note 5
    // KORRIGIERT: Der 0.1 Abzug wurde entfernt
    let upperPoints6 = roundDownToNearestHalf(maxPoints * currentThresholds[5]);
    const upper6Str = upperPoints6.toFixed(1).replace('.', ',');
    const rowClass6 = (highlightedGrade === 6) ? ' class="highlight"' : '';
    html += `<tr${rowClass6}>
               <td>Note 6</td>
               <td>unter ${(currentThresholds[5]*100).toFixed(2).replace('.', ',')}%</td>
               <td>weniger als ${upper6Str} Punkte</td>
             </tr>`;
    html += `</tbody></table>`;
  } else {
    // Wenn keine valide Maximalpunktzahl vorliegt, nur Tabelle mit den Spalten "Note" und "ab (%)"
    html += `<table>
              <thead>
                <tr>
                  <th>Note</th>
                  <th>ab (%)</th>
                </tr>
              </thead>
              <tbody>`;
    for (let grade = 1; grade <= 5; grade++) {
      const percentage = (currentThresholds[grade] * 100).toFixed(2).replace('.', ',');
      const rowClass = (highlightedGrade === grade) ? ' class="highlight"' : '';
      html += `<tr${rowClass}>
                 <td>Note ${grade}</td>
                 <td>${percentage}%</td>
               </tr>`;
    }
    const rowClass6 = (highlightedGrade === 6) ? ' class="highlight"' : '';
    html += `<tr${rowClass6}>
               <td>Note 6</td>
               <td>unter ${(currentThresholds[5]*100).toFixed(2).replace('.', ',')}%</td>
             </tr>`;
    html += `</tbody></table>`;
  }
  
  infoBox.innerHTML = html;
}

// Berechnet die Note anhand der eingegebenen Punktzahlen
function calculateGrade(max, achieved) {
  // Stellt sicher, dass die Werte als Strings behandelt werden, bevor replace aufgerufen wird
  max = String(max).replace(',', '.');
  achieved = String(achieved).replace(',', '.');

  const maxNum = parseFloat(max);
  const achievedNum = parseFloat(achieved);

  if (isNaN(maxNum) || maxNum < 10 || maxNum > 100) {
    return { error: 'Die maximale Punktzahl muss zwischen 10 und 100 liegen.' };
  }
  if (isNaN(achievedNum) || achievedNum < 0 || achievedNum > maxNum) {
    return { error: 'Die erreichte Punktzahl muss zwischen 0 und der maximalen Punktzahl liegen.' };
  }

  const rawPercentage = (achievedNum / maxNum) * 100;
  const percentage = parseFloat(rawPercentage.toFixed(2));

  let grade = 6;
  for (let g = 1; g <= 6; g++) {
    if (percentage >= currentThresholds[g] * 100) {
      grade = g;
      break;
    }
  }
  return {
    grade: grade,
    percentage: percentage.toFixed(2).replace('.', ',')
  };
}

// Aktualisiert die Ergebnisanzeige
function updateResult() {
  const maxPoints = document.getElementById('maxPoints').value;
  const achievedPoints = document.getElementById('achievedPoints').value;
  const resultDiv = document.getElementById('result');

  if (!maxPoints || !achievedPoints) {
    resultDiv.innerHTML = '';
    return;
  }

  const result = calculateGrade(maxPoints, achievedPoints);
  if (result.error) {
    resultDiv.innerHTML = `<div class="alert alert-error"><strong>Fehler:</strong> ${result.error}</div>`;
  } else {
    resultDiv.innerHTML = `<div class="alert alert-success"><strong>Ergebnis:</strong><br>Note: ${result.grade}<br>Erreichte Prozent: ${result.percentage}%</div>`;
  }
}

// Initiale Aktualisierung: Standardmäßig Preset IHK laden und Startpunkte setzen
loadPreset("IHK");
// Lege einen Standardwert für erreichte Punkte fest (0,0 mit Komma)
document.getElementById('achievedPoints').value = "0,0";
updateInfoBox();
