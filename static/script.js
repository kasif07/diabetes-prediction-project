const form = document.getElementById("prediction-form");
const resultBox = document.getElementById("result");
const toggleBtn = document.getElementById("toggleTheme");
let chart;

// 🌙☀️ Toggle Dark / Light Mode
toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    document.body.classList.toggle("light");

    toggleBtn.innerHTML = document.body.classList.contains("dark")
        ? '<i class="fas fa-moon"></i>'
        : '<i class="fas fa-sun"></i>';
});

// 📊 Form submit
form.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    for (let key in data) data[key] = parseFloat(data[key]);

    resultBox.style.display = "block";
    resultBox.className = "alert alert-warning";
    resultBox.innerHTML = "⏳ Analyzing data...";

    fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(res => {
        resultBox.className = "alert alert-success";
        resultBox.innerHTML = `
            <strong>Status:</strong> ${res.prediction_label}<br>
            <strong>Diabetic Risk:</strong> ${(res.confidence.Diabetic * 100).toFixed(1)}%
        `;

        drawChart(res.confidence);
    })
    .catch(() => {
        resultBox.className = "alert alert-danger";
        resultBox.innerHTML = "❌ Server error";
    });
});

// 📊 Risk Meter Chart
function drawChart(confidence) {
    const ctx = document.getElementById("riskChart");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Non-Diabetic", "Diabetic"],
            datasets: [{
                data: [
                    confidence["Non-Diabetic"] * 100,
                    confidence["Diabetic"] * 100
                ],
                backgroundColor: ["#198754", "#dc3545"]
            }]
        },
        options: {
            plugins: {
                legend: { labels: { color: "#888" } }
            }
        }
    });
}
