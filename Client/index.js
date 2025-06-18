window.addEventListener("load", function () {
    if (typeof MercadoPago !== "undefined") {
        const mp = new MercadoPago('APP_USR-84817fc5-5c0c-4ecb-b68e-b9174b2aa96d', {
            locale: 'es-AR'
        });

        // Define las filas con los IDs deseados
        const filas = [
            [11, 13, 15],
            [20, 21, 22, 23, 24, 25],
            [30, 31, 32, 33, 34, 35],
            [40, 41, 42, 43, 44, 45],
            [50, 51, 52, 53, 54, 55]
        ];

        // Cargar productos desde la API
        fetch("/api/productos")
            .then(res => res.json())
            .then(productos => {
                const container = document.getElementById("product-container");
                container.innerHTML = ""; // Limpia el contenedor

                filas.forEach(idsFila => {
                    const filaDiv = document.createElement("div");
                    filaDiv.style.display = "flex";
                    filaDiv.style.justifyContent = "center";
                    filaDiv.style.gap = "24px";
                    filaDiv.style.marginBottom = "32px";

                    idsFila.forEach(id => {
                        const p = productos.find(prod => prod.id === id);
                        if (p) {
                            // Aquí va el código para crear la tarjeta de producto (igual que antes)
                            const card = document.createElement("div");
                            card.className = "product-card";
                            card.innerHTML = `
                                <div class="product-title">Producto ${p.id}</div>
                                <img src="${p.imagen}" alt="${p.nombre}" class="product-img">
                                <div class="product-price">Precio: $${p.precio}</div>
                                <div class="product-qty">Cantidad: 1</div>
                                <button class="buy-btn">Comprar</button>
                            `;
                            filaDiv.appendChild(card);
                        }
                    });

                    container.appendChild(filaDiv);
                });

                // Agrega listeners a los botones después de crear el HTML
                document.querySelectorAll(".buy-btn").forEach(button => {
                    button.addEventListener("click", function () {
                        // Deshabilita el botón actual
                        button.disabled = true;

                        // Habilita todos los demás botones
                        document.querySelectorAll(".buy-btn").forEach(otherButton => {
                            if (otherButton !== button) {
                                otherButton.disabled = false;
                            }
                        });

                        const suffix = button.dataset.product;

                        const description = document.getElementById(`product-description-${suffix}`).textContent;
                        const price = parseFloat(document.getElementById(`unit-price-${suffix}`).textContent);
                        const quantity = parseInt(document.getElementById(`quantity-${suffix}`).textContent);

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
