/* ============================================
   BASE DE PRODUCTOS
============================================ */
const productos = [
    { nombre: "Bouquet de Lirios", precio: 18, img: "img/lirio.jpg", descripcion: "Hermoso bouquet de lirios artesanales, ideal para regalar." },
    { nombre: "Girasol en Cúpula", precio: 22, img: "img/cupula.jpg", descripcion: "Girasol protegido en cúpula elegante, perfecto para decoración." },
    { nombre: "Cesta de Girasoles", precio: 25, img: "img/cesta.jpg", descripcion: "Cesta premium con girasoles tejidos a mano." },
    { nombre: "Caja Romántica", precio: 15, img: "img/rosa.jpg", descripcion: "Caja romántica con detalles delicados." }
];


/* ============================================
   CARRITO — LOCALSTORAGE
============================================ */
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function actualizarIconoCarrito() {
    const a = document.getElementById("contadorCarrito");
    if (!a) return;
    a.textContent = carrito.reduce((acc, p) => acc + p.cantidad, 0);
}
actualizarIconoCarrito();


/* ============================================
   AGREGAR AL CARRITO
============================================ */
function agregarCarrito(id) {
    let existe = carrito.find(p => p.nombre === productos[id].nombre);

    if (existe) existe.cantidad++;
    else carrito.push({ ...productos[id], cantidad: 1 });

    guardarCarrito();
    actualizarIconoCarrito();
    mostrarToast();
}


/* ============================================
   NOTIFICACIÓN
============================================ */
function mostrarToast() {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.classList.add("mostrar");
    setTimeout(() => toast.classList.remove("mostrar"), 2000);
}


/* ============================================
   DETALLE — PRODUCTO.HTML
============================================ */
function verProducto(id) {
    window.location.href = `producto.html?id=${id}`;
}

function cargarDetalle() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) return;

    let p = productos[id];

    document.getElementById("detalleImagen").src = p.img;
    document.getElementById("detalleNombre").textContent = p.nombre;
    document.getElementById("detallePrecio").textContent = "$" + p.precio;
    document.getElementById("detalleDescripcion").textContent = p.descripcion;

    document.getElementById("btnAdd").onclick = function () {
        agregarCarrito(id);
    };
}



/* ============================================
   CARRITO.HTML — LISTADO
============================================ */
function cargarCarrito() {
    const cont = document.getElementById("carritoLista");
    if (!cont) return;

    cont.innerHTML = "";
    let total = 0;

    carrito.forEach((p, i) => {
        let subtotal = p.precio * p.cantidad;
        total += subtotal;

        cont.innerHTML += `
            <div class="item-carrito">
                <img src="${p.img}" class="carrito-img">

                <div class="info-carrito">
                    <h3>${p.nombre}</h3>
                    <p>$${p.precio}</p>

                    <div class="cantidad-box">
                        <button onclick="menos(${i})">-</button>
                        <span>${p.cantidad}</span>
                        <button onclick="mas(${i})">+</button>
                    </div>

                    <button class="basura" onclick="eliminar(${i})">🗑️</button>
                </div>

                <p class="precio-final">$${subtotal}</p>
            </div>
        `;
    });

    document.getElementById("totalFinal").textContent = total.toFixed(2);
}
cargarCarrito();


function mas(i) {
    carrito[i].cantidad++;
    guardarCarrito();
    cargarCarrito();
    actualizarIconoCarrito();
}

function menos(i) {
    carrito[i].cantidad--;
    if (carrito[i].cantidad <= 0) carrito.splice(i, 1);
    guardarCarrito();
    cargarCarrito();
    actualizarIconoCarrito();
}

function eliminar(i) {
    carrito.splice(i, 1);
    guardarCarrito();
    cargarCarrito();
    actualizarIconoCarrito();
}



/* ============================================
   SERVIENTREGA — COSTOS POR CIUDAD
============================================ */
const costosEnvio = {
    "guayaquil": 2,
    "durán": 2,
    "duran": 2,
    "samborondón": 3,
    "samborondon": 3,
    "santa elena": 4,
    "quito": 5,
    "cuenca": 5,
    "manta": 5,
    "machala": 4,
    "ambato": 4,
    "riobamba": 4,
    "santo domingo": 4,
    "loja": 6,
    "esmeraldas": 6,
    "babahoyo": 3,
    "ibarra": 5,
    "galápagos": 12,
    "galapagos": 12
};


/* ============================================
   CHECKOUT — ENVÍO + WHATSAPP
============================================ */
function calcularEnvio(ciudad, metodoEntrega) {
    ciudad = ciudad.toLowerCase().trim();

    // RETIRO GRATIS (Guayaquil)
    if (metodoEntrega === "punto" && ciudad === "guayaquil") {
        return 0;
    }

    // SI ES AGENCIA — SERVIENTREGA
    if (metodoEntrega === "agencia") {
        return costosEnvio[ciudad] || 0;
    }

    return 0;
}



const form = document.getElementById("formCheckout");

if (form) {
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        let nombre = document.getElementById("nombre").value;
        let telefono = document.getElementById("telefono").value;
        let ciudad = document.getElementById("ciudad").value.toLowerCase();
        let direccion = document.getElementById("direccion").value;
        let notas = document.getElementById("notas").value;
        let metodo = document.getElementById("metodoEntrega").value;

        // TOTAL PRODUCTOS
        let totalProductos = carrito.reduce((t, p) => t + p.precio * p.cantidad, 0);

        // ENVÍO AUTOMÁTICO
        let costoEnvio = calcularEnvio(ciudad, metodo);

        // TOTAL FINAL
        let totalFinal = totalProductos + costoEnvio;

        // LISTA CARRITO
        let lista = "";
        carrito.forEach(p => {
            lista += `• ${p.nombre} x${p.cantidad} - $${p.precio * p.cantidad}\n`;
        });

        // MENSAJE WHATSAPP
        let mensaje = 
`🌸 *Nuevo Pedido PRISFLOWER* 🌸

👤 Nombre: ${nombre}
📞 Teléfono: ${telefono}

🏙 Ciudad: ${ciudad}
🚚 Método de entrega: ${metodo === "punto" ? "Retiro en punto público (Guayaquil)" : "Retiro en agencia Servientrega"}

📍 Dirección / Punto público:
${direccion}

🛒 *Pedido:*
${lista}

📦 Envío: $${costoEnvio}
💰 Total final: $${totalFinal}

📝 Notas del cliente:
${notas}
`;

        let numero = "593984050838";
        window.location.href = "https://wa.me/" + numero + "?text=" + encodeURIComponent(mensaje);

        localStorage.removeItem("carrito");
    });
}
