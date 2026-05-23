// =========================
// LOAD NAVBAR
// =========================
fetch("../components/navbar.html")
    .then(response => response.text())
    .then(data => {
        // render nav
        document.querySelector(".nav-container").innerHTML = data;

        // load nav js
        const script = document.createElement("script");
        script.src = "../assets/js/navbar.js";
        script.onload = function() {
            // Gọi initNavbar() sau khi navbar.js load xong
            console.log('📦 navbar.js đã load');
            if (typeof initNavbar === 'function') {
                initNavbar();
            }
        };
        document.body.appendChild(script);
    })
    .catch(error => {
        console.error('❌ Lỗi khi load navbar:', error);
    });