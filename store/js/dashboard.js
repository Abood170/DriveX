document.addEventListener("DOMContentLoaded", () => {

    if (localStorage.getItem("isLoggedIn") !== "true" || localStorage.getItem("role") !== "admin") {
        window.location.href = "signin.html";
        return;
    }

    const carForm = document.getElementById("pure-car-form");
    const tableBody = document.getElementById("fleet-table-rows");
    const usersTableBody = document.getElementById("users-table-rows");
    const cancelBtn = document.getElementById("cancel-form-btn");
    // Form fields
    const idField = document.getElementById("car-id-field");
    const classNameInput = document.getElementById("car-class-name");
    const modelYearInput = document.getElementById("car-model-year");
    const priceInput = document.getElementById("car-price");
    const conditionSelect = document.getElementById("car-condition");
    const brandSelect = document.getElementById("car-brand-select");
    const typeSelect = document.getElementById("car-type-select");
    const featuresInput = document.getElementById("car-features");

    // LocalStorage قرائه السياره من ال
    const getLocalFleet = () => JSON.parse(localStorage.getItem("drivex_fleet")) || [];

    const saveLocalFleet = (fleet) => {
        localStorage.setItem("drivex_fleet", JSON.stringify(fleet));
        renderDashboard();
    };

    const updateStats = (fleet) => {
        document.getElementById("total-cars-count").textContent = fleet.length;
        document.getElementById("bmw-count").textContent = fleet.filter(c => c.car_category === "BMW").length;
        document.getElementById("merc-count").textContent = fleet.filter(c => c.car_category === "Mercedes").length;
        document.getElementById("cad-count").textContent = fleet.filter(c => c.car_category === "Cadillac").length;
    };

    const renderUsers = () => {
        const defaultUsers = [
            { username: "admin", email: "admin@drivex.com", role: "admin" },
            { username: "adnanalharahsheh", email: "adnan@drivex.com", role: "user" }
        ];
        const users = JSON.parse(localStorage.getItem("drivex_users")) || defaultUsers;
        localStorage.setItem("drivex_users", JSON.stringify(users));

        if (usersTableBody) {
            usersTableBody.innerHTML = "";
            users.forEach(user => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td><strong>${user.username}</strong></td>
                    <td>${user.email}</td>
                    <td><span style="background: ${user.role === 'admin' ? '#e0a800' : '#252932'}; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem; color:#fff;">${user.role}</span></td>
                `;
                usersTableBody.appendChild(tr);
            });
        }
    };

    const renderDashboard = () => {
        const fleet = getLocalFleet();
        updateStats(fleet);
        tableBody.innerHTML = "";

        if (fleet.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #a0a5b1; padding:15px;">No vehicles found.</td></tr>`;
            return;
        }

        fleet.forEach(car => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${car.car_name}</strong></td>
                <td>${car.car_category}</td>
                <td>${car.car_type}</td>
                <td>$${car.price}</td>
                <td>${car.car_condition}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${car.id}"><i class="fa-solid fa-pen"></i></button>
                    <button class="action-btn delete-btn" data-id="${car.id}"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = e.currentTarget.getAttribute("data-id");
                saveLocalFleet(getLocalFleet().filter(c => c.id !== id));
            });
        });

        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = e.currentTarget.getAttribute("data-id");
                const car = getLocalFleet().find(c => c.id === id);
                if (car) {
                    idField.value = car.id;
                    classNameInput.value = car.image_url || "";
                    modelYearInput.value = car.car_name;
                    priceInput.value = car.price;
                    conditionSelect.value = car.car_condition;
                    brandSelect.value = car.car_category;
                    typeSelect.value = car.car_type;
                    featuresInput.value = car.features || "";
                    document.getElementById("form-action-title").textContent = "Edit Vehicle";
                    if (cancelBtn) cancelBtn.style.display = "block";
                }
            });
        });
    };

    carForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const currentId = idField.value;
        const fleet = getLocalFleet();

        const carData = {
            id: currentId ? currentId : Date.now().toString(),
            image_url: classNameInput.value.trim(),
            car_name: modelYearInput.value.trim(),
            price: priceInput.value,
            car_condition: conditionSelect.value,
            car_category: brandSelect.value,
            car_type: typeSelect.value,
            features: featuresInput.value.trim()
        };

        if (currentId) {
            const idx = fleet.findIndex(c => c.id === currentId);
            if (idx !== -1) fleet[idx] = carData;
        } else {
            fleet.push(carData);
        }

        saveLocalFleet(fleet);
        carForm.reset();
        idField.value = "";
        if (cancelBtn) cancelBtn.style.display = "none";
        document.getElementById("form-action-title").textContent = "Add New Vehicle";
    });

    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            carForm.reset();
            idField.value = "";
            cancelBtn.style.display = "none";
            document.getElementById("form-action-title").textContent = "Add New Vehicle";
        });
    }

    renderDashboard();
    renderUsers();
});
