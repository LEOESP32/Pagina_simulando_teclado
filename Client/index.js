window.addEventListener("load", function () {
    if (typeof MercadoPago !== "undefined") {
        const mp = new MercadoPago('APP_USR-84817fc5-5c0c-4ecb-b68e-b9174b2aa96d', {
            locale: 'es-AR'
        });

        // Cargar productos desde la API
        fetch("https://electronica2-maquina-expendedora.onrender.com/api/productos")
            .then(res => res.json())
            .then(productos => {
                const container = document.getElementById("product-container");
                const container20_25 = document.getElementById("product-container-horizontal-20-25");
                const container30_35 = document.getElementById("product-container-horizontal-30-35");
                const container40_45 = document.getElementById("product-container-horizontal-40-45");
                const container50_55 = document.getElementById("product-container-horizontal-50-55");
                const containerHorizontal = document.getElementById("product-container-horizontal");
                container.innerHTML = "";
                container20_25.innerHTML = "";
                container30_35.innerHTML = "";
                container40_45.innerHTML = "";
                container50_55.innerHTML = "";
                containerHorizontal.innerHTML = "";

                productos.forEach(p => {
                    if ([20, 21, 22, 23, 24, 25].includes(p.id)) {
                        container20_25.innerHTML += `
                            <div class="product-card">
                                <p id="product-description-${p.id}">${p.nombre}</p>
                                <img src="${p.imagen}" alt="${p.nombre}">
                                <p>Precio: $<span id="unit-price-${p.id}">${p.precio}</span></p>
                                
                                <button class="checkout-btn" data-product="${p.id}">Comprar</button>
                                <div id="button-checkout-${p.id}" class="button-checkout"></div>
                            </div>
                        `;
                    }
                    else if ([30, 31, 32, 33, 34, 35].includes(p.id)) {
                        container30_35.innerHTML += `
                            <div class="product-card">
                                <p id="product-description-${p.id}">${p.nombre}</p>
                                <img src="${p.imagen}" alt="${p.nombre}">
                                <p>Precio: $<span id="unit-price-${p.id}">${p.precio}</span></p>
                                
                                <button class="checkout-btn" data-product="${p.id}">Comprar</button>
                                <div id="button-checkout-${p.id}" class="button-checkout"></div>
                            </div>
                        `;
                    } else if ([40, 41, 42, 43, 44, 45].includes(p.id)) {
                        container40_45.innerHTML += `
                            <div class="product-card">
                                <p id="product-description-${p.id}">${p.nombre}</p>
                                <img src="${p.imagen}" alt="${p.nombre}">
                                <p>Precio: $<span id="unit-price-${p.id}">${p.precio}</span></p>
                                
                                <button class="checkout-btn" data-product="${p.id}">Comprar</button>
                                <div id="button-checkout-${p.id}" class="button-checkout"></div>
                            </div>
                        `;
                    } else if ([50, 51, 52, 53, 54, 55].includes(p.id)) {
                        container50_55.innerHTML += `
                            <div class="product-card">
                                <p id="product-description-${p.id}">${p.nombre}</p>
                                <img src="${p.imagen}" alt="${p.nombre}">
                                <p>Precio: $<span id="unit-price-${p.id}">${p.precio}</span></p>
                                
                                <button class="checkout-btn" data-product="${p.id}">Comprar</button>
                                <div id="button-checkout-${p.id}" class="button-checkout"></div>
                            </div>
                        `;
                    } else if ([60, 61, 62, 63, 64, 65].includes(p.id)) {
                        containerHorizontal.innerHTML += `
                            <div class="product-card">
                                <p id="product-description-${p.id}">${p.nombre}</p>
                                <img src="${p.imagen}" alt="${p.nombre}">
                                <p>Precio: $<span id="unit-price-${p.id}">${p.precio}</span></p>
                                
                                <button class="checkout-btn" data-product="${p.id}">Comprar</button>
                                <div id="button-checkout-${p.id}" class="button-checkout"></div>
                            </div>
                        `;
                    } else {
                        container.innerHTML += `
                            <div class="product-card">
                                <p id="product-description-${p.id}">${p.nombre}</p>
                                <img src="${p.imagen}" alt="${p.nombre}">
                                <p>Precio: $<span id="unit-price-${p.id}">${p.precio}</span></p>
                                
                                <button class="checkout-btn" data-product="${p.id}">Comprar</button>
                                <div id="button-checkout-${p.id}" class="button-checkout"></div>
                            </div>
                        `;
                    }
                });

                // Agrega listeners a los botones después de crear el HTML
                document.querySelectorAll(".checkout-btn").forEach(button => {
                    button.addEventListener("click", function () {
                        // Deshabilita el botón actual
                        button.disabled = true;

                        // Habilita todos los demás botones
                        document.querySelectorAll(".checkout-btn").forEach(otherButton => {
                            if (otherButton !== button) {
                                otherButton.disabled = false;
                            }
                        });

                        const suffix = button.dataset.product;

                        const description = document.getElementById(`product-description-${suffix}`).textContent;
                        const price = parseFloat(document.getElementById(`unit-price-${suffix}`).textContent);
                        const quantity = 1;
                        const orderData = {
                            description,
                            price,
                            quantity,
                            orderId: suffix
                        };

                        console.log("Datos enviados al servidor:", orderData);

                        fetch("https://electronica2-maquina-expendedora.onrender.com/create_preference", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(orderData),
                        })
                        .then(response => response.json())
                        .then(preference => {
                            if (!preference.id) {
                                alert("No se pudo generar la preferencia de pago.");
                                button.disabled = false; // Habilita el botón si ocurre un error
                                return;
                            }
                            const targetId = `button-checkout-${suffix}`;
                            createCheckoutButton(preference.id, targetId);
                        })
                        .catch(error => {
                            console.error("Error al comunicarse con el servidor:", error);
                            alert("Error al generar el pago.");
                            button.disabled = false; // Habilita el botón si ocurre un error
                        });
                    });
                });
            });

        function createCheckoutButton(preferenceId, elementId) {
            const bricksBuilder = mp.bricks();

            const renderComponent = async () => {
                try {
                    if (window.checkoutButton) {
                        window.checkoutButton.unmount();
                        window.checkoutButton = null;
                    }

                    window.checkoutButton = await bricksBuilder.create("wallet", elementId, {
                        initialization: { preferenceId },
                        callbacks: {
                            onError: (error) => console.error("Error en el pago:", error),
                            onReady: () => console.log("Botón de pago listo"),
                        },
                    });
                } catch (error) {
                    console.error("Error al renderizar el botón de pago:", error);
                }
            };

            renderComponent();
        }
    } else {
        console.error("MercadoPago SDK no cargado");
    }
});
