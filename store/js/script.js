document.addEventListener("DOMContentLoaded", () => {
    const API_BASE_URL = "http://localhost:3000";

    const authBtn = document.getElementById("auth-btn");
    const userStatus = localStorage.getItem("isLoggedIn");
    const navbar = document.querySelector(".nav-links"); 

    if (authBtn) {
        if (userStatus === "true") {
            authBtn.textContent = "Logout";
            authBtn.href = "#";
            authBtn.addEventListener("click", (e) => {
                e.preventDefault();
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("username");
                localStorage.removeItem("role");
                alert("Logged out successfully!");
                window.location.href = "store.html";
            });
        } else {
            authBtn.textContent = "Login";
            authBtn.href = "signin.html";
        }
    }

    if (navbar && localStorage.getItem("role") === "admin") {
        if (!document.getElementById("admin-dash-nav-btn")) {
            const adminBtn = document.createElement("a");
            adminBtn.id = "admin-dash-nav-btn";
            adminBtn.href = "dashboard.html";
            adminBtn.className = "dash-btn";
            adminBtn.textContent = "Control Panel";
            navbar.appendChild(adminBtn);
        }
    }

    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const username = document.getElementById("login-username").value.trim();
            const password = document.getElementById("login-password").value;

            if (!username || !password) {
                alert("Please fill in all fields.");
                return;
            }
            // نعمل صقحه تسجيل الدخول تبع الادمن
            if (username.toLowerCase() === "admin" && password === "admin") {
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("username", "Admin");
                localStorage.setItem("role", "admin");
                alert("Welcome back, Admin!");
                window.location.href = "dashboard.html";
            }
            // صفحه المستحدم
            else {
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("username", username);
                localStorage.setItem("role", "user");
                alert("Welcome back!");
                window.location.href = "store.html";
            }
        });
    }

    const registerForm = document.getElementById("register-form");
    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const username = document.getElementById("username").value.trim();
            const email = document.getElementById("email").value.trim();

            if (!username || !email) {
                alert("Please fill in all fields.");
                return;
            }

            alert("Account registration successful!");
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("username", username);
            localStorage.setItem("role", "user");
            window.location.href = "store.html";
        });
    }
    // عرض السيارات حسب الماركه
    const brandsGrid = document.getElementById("dynamic-cars-grid");
    if (brandsGrid) {
        const brandName = brandsGrid.getAttribute("data-brand") || "BMW";

        const urlParams = new URLSearchParams(window.location.search);
        const categoryFilter = urlParams.get("category");

        const allCars = JSON.parse(localStorage.getItem("drivex_fleet")) || [];

        let filteredCars = allCars.filter(car => car.car_category && car.car_category.toLowerCase() === brandName.toLowerCase());
        if (categoryFilter) {
            filteredCars = filteredCars.filter(car => car.car_type && car.car_type.toLowerCase() === categoryFilter.toLowerCase());
        }

        brandsGrid.innerHTML = "";

        if (filteredCars.length === 0) {
            brandsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color: #a0a5b1; padding: 40px;">No vehicles found. Go to Dashboard to add some!</p>`;
            return;
        }

        filteredCars.forEach(car => {
            const imgUrl = (car.image_url && car.image_url.startsWith("http")) ? car.image_url : "images/hero-immage.jpg";

            brandsGrid.innerHTML += `
                <div class="brand-card" style="height: auto !important; display: flex !important; flex-direction: column !important; background: #1c1e24; border-radius: 12px; overflow: hidden; border: 1px solid #2d3139;">
                    <div style="width: 100%; height: 180px; background: url('${imgUrl}') center center/cover no-repeat;"></div>
                    <div class="brand-info" style="padding: 15px; text-align: left; background: #1c1e24;">
                        <h3 style="color: #fff; font-size: 1.2rem; margin-bottom: 5px;">${car.car_name}</h3>
                        <p style="color: #a0a5b1; font-size: 0.9rem; margin-bottom: 5px;">Condition: <strong>${car.car_condition || 'New'}</strong> | Type: ${car.car_type || 'Sports'}</p>
                        <div style="color:#ff3e3e; font-weight:bold; font-size:1.1rem; margin: 5px 0;">$${car.price || 'N/A'}</div>
                        <a href="car-single.html?id=${car.id}" class="view-store-btn" style="display: block; text-align: center; background: #ff3e3e; color: #fff; padding: 8px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 10px;">View Details</a>
                    </div>
                </div>
            `;
        });
    }
});


document.addEventListener("DOMContentLoaded", () => {
    const carNameEl = document.getElementById("carName");
    if (!carNameEl) return;

    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('id');

    if (!carId) {
        console.error("Error: Car ID is missing in the URL.");
        return;
    }

    const allCars = JSON.parse(localStorage.getItem("drivex_fleet")) || [];
    const carData = allCars.find(c => c.id === carId);

    if (!carData) {
        carNameEl.innerText = "Vehicle not found";
    } else {
        carNameEl.innerText = carData.car_name;
        document.getElementById("carCategory").innerText = `${carData.car_category} - ${carData.car_type}`;
        document.getElementById("carPrice").innerText = `${Number(carData.price).toLocaleString()} $`;
        document.getElementById("carEngine").innerText = carData.features || "N/A";
        document.getElementById("carYear").innerText = "N/A";
        document.getElementById("carCondition").innerText = carData.car_condition;
        if (carData.image_url) {
            document.getElementById("mainCarImage").src = carData.image_url;
        }
    }

    const orderBtn = document.getElementById("btnOrder");
    if (orderBtn) {
        orderBtn.addEventListener("click", () => {
            alert(`Order submitted successfully for Car ID: ${carId}`);
        });
    }
});