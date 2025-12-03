/* ============================
   PRODUCTOS
============================ */
const productos = [
    { nombre: "Bouquet de Lirios", precio: 18, img: "img/lirio.jpg", descripcion: "Bouquet hermoso." },
    { nombre: "Girasol en Cúpula", precio: 22, img: "img/cupula.jpg", descripcion: "Girasol elegante." },
    { nombre: "Cesta de Girasoles", precio: 25, img: "img/cesta.jpg", descripcion: "Cesta Premium." },
    { nombre: "Caja Romántica", precio: 15, img: "img/rosa.jpg", descripcion: "Detalle romántico." }
];

/* ============================
   CARRITO
============================ */
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function actualizarIconoCarrito() {
    const contador = document.getElementById("contadorCarrito");
    if (contador) contador.textContent = carrito.reduce((s,p)=>s+p.cantidad,0);
}
actualizarIconoCarrito();

/* GENERAR PRODUCTOS EN INDEX */
const grid = document.querySelector(".productos-grid");
if (grid) {
    grid.innerHTML = productos.map((p,i)=>`
        <div class="producto">
            <img onclick="verProducto(${i})" src="${p.img}">
            <h3>${p.nombre}</h3>
            <p>$${p.precio}</p>
            <button onclick="agregarCarrito(${i})">Añadir</button>
        </div>
    `).join("");
}

/* AGREGAR */
function agregarCarrito(id){
    let p = productos[id];
    let existe = carrito.find(x => x.nombre === p.nombre);

    if(existe) existe.cantidad++;
    else carrito.push({ ...p, cantidad: 1 });

    guardarCarrito();
    actualizarIconoCarrito();
    mostrarToast();
}

/* TOAST */
function mostrarToast(){
    const t=document.getElementById("toast");
    t.classList.add("mostrar");
    setTimeout(()=>t.classList.remove("mostrar"),2000);
}

/* IR A DETALLE */
function verProducto(id){
    window.location.href = "producto.html?id="+id;
}

/* DETALLE */
if(window.location.pathname.includes("producto.html")){
    const url = new URLSearchParams(window.location.search);
    const id = url.get("id");
    const p = productos[id];

    document.getElementById("detalleImagen").src = p.img;
    document.getElementById("detalleNombre").textContent = p.nombre;
    document.getElementById("detallePrecio").textContent = "$"+p.precio;
    document.getElementById("detalleDescripcion").textContent = p.descripcion;
    document.getElementById("btnAdd").onclick = ()=>agregarCarrito(id);
}

/* ============================
   CARRITO
============================ */
function cargarCarrito(){
    const cont = document.getElementById("carritoLista");
    if(!cont) return;

    cont.innerHTML = "";
    let total = 0;

    carrito.forEach((p,i)=>{
        let subtotal = p.precio * p.cantidad;
        total += subtotal;

        cont.innerHTML += `
            <div class="item-carrito">
                <img src="${p.img}" class="carrito-img">
                <div class="info">
                    <h3>${p.nombre}</h3>
                    <p class="precio">$${p.precio}</p>

                    <button onclick="menos(${i})">-</button>
                    <span>${p.cantidad}</span>
                    <button onclick="mas(${i})">+</button>

                    <button onclick="eliminar(${i})">🗑️</button>
                </div>
                <p class="precio-final">$${subtotal}</p>
            </div>`;
    });

    document.getElementById("totalFinal").textContent = total.toFixed(2);
}
cargarCarrito();

function mas(i){ carrito[i].cantidad++; guardarCarrito(); cargarCarrito(); actualizarIconoCarrito(); }
function menos(i){ carrito[i].cantidad--; if(carrito[i].cantidad<=0) carrito.splice(i,1); guardarCarrito(); cargarCarrito(); actualizarIconoCarrito(); }
function eliminar(i){ carrito.splice(i,1); guardarCarrito(); cargarCarrito(); actualizarIconoCarrito(); }

/* ============================
   CHECKOUT
============================ */
if(document.getElementById("formCheckout")){
    document.getElementById("formCheckout").addEventListener("submit", e=>{
        e.preventDefault();

        let nombre=document.getElementById("nombre").value;
        let tel=document.getElementById("telefono").value;
        let ciudad=document.getElementById("ciudad").value;
        let dir=document.getElementById("direccion").value;
        let notas=document.getElementById("notas").value;
        let metodo=document.getElementById("metodoEnvio").value;

        let costoEnvio = 0;

        if(metodo==="agencia"){
            const tarifas = {
                "Guayas": 2.50, "Santa Elena": 3.50, "Manabí": 4.00, "Los Ríos": 3.80,
                "El Oro": 4.50, "Azuay": 5.00, "Pichincha": 5.50
            };
            costoEnvio = tarifas[ciudad] || 5.50;
        }

        let lista="";
        let total=0;

        carrito.forEach(p=>{
            lista+=`• ${p.nombre} x${p.cantidad} - $${p.precio * p.cantidad}\n`;
            total += p.precio * p.cantidad;
        });

        total += costoEnvio;

        let mensaje = `
🌸 *Nuevo Pedido PRISFLOWER* 🌸

👤 Nombre: ${nombre}
📞 Teléfono: ${tel}
📍 Ciudad: ${ciudad}
🏠 Dirección: ${dir}

Método de entrega: ${metodo==="publico"?"Punto público (GRATIS)":"Retiro en agencia — $"+costoEnvio}

🛒 *Pedido:*
${lista}

💰 *Total con envío:* $${total.toFixed(2)}

📝 Notas: ${notas}
`;

        window.location.href = "https://wa.me/593984050838?text="+encodeURIComponent(mensaje);

        localStorage.removeItem("carrito");
    });
}

