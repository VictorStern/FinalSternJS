// se mantiene visible el carrito
let verCarrito = false;

// Espero que los elementos de la página cargen para ejecutar el script
if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready)
} else {
    ready();
}

function ready() {
    // Carga productos desde productos.json
    fetch('productos.json')
        .then(response => response.json())
        .then(productos => {
            const contenedorItems = document.querySelector('.contenedor-items');

            productos.forEach(producto => {
                const itemHTML = `
                    <div class="item">
                        <span class="titulo-item">${producto.titulo}</span>
                        <img src="${producto.imagen}" alt="" class="img-item">
                        <span class="precio-item">$${producto.precio.toFixed(3)}</span>
                        <button class="boton-item">Agregar al Carrito</button>
                    </div>
                `;
                contenedorItems.innerHTML += itemHTML;
            });

            // Luego de cargar los productos, continuar con la inicialización del carrito
            cargarCarritoDesdeLocalStorage();
            agregarEventListenerPorClase('btn-eliminar', eliminarItemCarrito);
            agregarEventListenerPorClase('sumar-cantidad', sumarCantidad);
            agregarEventListenerPorClase('restar-cantidad', restarCantidad);
            agregarEventListenerPorClase('boton-item', agregarAlCarritoClicked);
            document.querySelector('.btn-pagar').addEventListener('click', pagarClicked);
        })
        .catch(error => console.error('Error cargando productos:', error));
}

function agregarEventListenerPorClase(clase, callback) {
    let elementos = document.getElementsByClassName(clase);
    for (let i = 0; i < elementos.length; i++) {
        elementos[i].addEventListener('click', callback);
    }
}

function pagarClicked() {
    Swal.fire(
        'Muchas gracias por la compra!',
        'Que disfrutes nuestros productos!',
        'success'
    )
    let carritoItems = document.querySelector('.carrito-items');
    while (carritoItems.hasChildNodes()) {
        carritoItems.removeChild(carritoItems.firstChild);
    }
    actualizarTotalCarrito();
    ocultarCarrito();
}

//Funciòn que controla el boton clickeado de agregar al carrito
function agregarAlCarritoClicked(event) {
    let button = event.target;
    let item = button.parentElement;
    let titulo = item.getElementsByClassName('titulo-item')[0].innerText;
    let precio = item.getElementsByClassName('precio-item')[0].innerText;
    let imagen = item.getElementsByClassName('img-item')[0].src;
    console.log(imagen);

    agregarItemAlCarrito(titulo, precio, imagen);

    hacerVisibleCarrito();
}

//Funcion que hace visible el carrito
function hacerVisibleCarrito() {
    verCarrito = true;
    let carrito = document.getElementsByClassName('carrito')[0];
    carrito.style.marginRight = '0';
    carrito.style.opacity = '1';

    let items = document.getElementsByClassName('contenedor-items')[0];
    items.style.width = '60%';
}

//Funciòn que agrega un item al carrito
function agregarItemAlCarrito(titulo, precio, imagen) {
    let item = document.createElement('div');
    item.classList.add = ('item');
    let itemsCarrito = document.getElementsByClassName('carrito-items')[0];

    // Guardar el carrito en el LocalStorage
    guardarCarritoEnLocalStorage();

    //controlamos que el item que intenta ingresar no se encuentre en el carrito
    let nombresItemsCarrito = itemsCarrito.getElementsByClassName('carrito-item-titulo');
    for (let i = 0; i < nombresItemsCarrito.length; i++) {
        if (nombresItemsCarrito[i].innerText == titulo) {
            Swal.fire({
                title: "El producto ya esta en el carrito!",
                text: "Continue con la compra, muchas gracias.",
                icon: "question"
            });
            return;
        }
    }

    let itemCarritoContenido = `
    
        <div class="carrito-item">
            <img src="${imagen}" class="imgCarrito" width="80px" alt="imagen del item a comprar">
            <div class="carrito-item-detalles">
                <span class="carrito-item-titulo">${titulo}</span>
                <div class="selector-cantidad">
                    <i class="fa-solid fa-minus restar-cantidad"></i>
                    <input type="text" value="1" class="carrito-item-cantidad" disabled>
                    <i class="fa-solid fa-plus sumar-cantidad"></i>
                </div>
                <span class="carrito-item-precio">${precio}</span>
            </div>
            <button class="btn-eliminar">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `
    item.innerHTML = itemCarritoContenido;
    itemsCarrito.append(item);

    //Agregamos la funcionalidade de eliminar, restar cantidad y sumar cantidad al nuevo item.
    item.querySelector('.btn-eliminar').addEventListener('click', eliminarItemCarrito);
    item.querySelector('.restar-cantidad').addEventListener('click', restarCantidad);
    item.querySelector('.sumar-cantidad').addEventListener('click', sumarCantidad);

    //Actualizamos total
    actualizarTotalCarrito();
}
//Aumento en uno la cantidad del elemento seleccionado
function sumarCantidad(event) {
    let buttonClicked = event.target;
    let selector = buttonClicked.parentElement;
    console.log(selector.getElementsByClassName('carrito-item-cantidad')[0].value);
    let cantidadActual = selector.getElementsByClassName('carrito-item-cantidad')[0].value;
    cantidadActual++;
    selector.getElementsByClassName('carrito-item-cantidad')[0].value = cantidadActual;
    actualizarTotalCarrito();
}
//Resto en uno la cantidad del elemento seleccionado
function restarCantidad(event) {
    let buttonClicked = event.target;
    let selector = buttonClicked.parentElement;
    console.log(selector.getElementsByClassName('carrito-item-cantidad')[0].value);
    let cantidadActual = selector.getElementsByClassName('carrito-item-cantidad')[0].value;
    cantidadActual--;
    if (cantidadActual >= 1) {
        selector.getElementsByClassName('carrito-item-cantidad')[0].value = cantidadActual;
        actualizarTotalCarrito();
    }
}

//Elimino el item seleccionado del carrito
function eliminarItemCarrito(event) {
    let buttonClicked = event.target;
    buttonClicked.parentElement.parentElement.remove();
    //Actualizamos el total del carrito
    actualizarTotalCarrito();

    //la siguiente funciòn controla si hay elementos en el carrito
    //Si no hay elimino el carrito
    ocultarCarrito();
}
//Funciòn que controla si hay elementos en el carrito. Si no hay oculto el carrito.
function ocultarCarrito() {
    let carritoItems = document.getElementsByClassName('carrito-items')[0];
    if (carritoItems.childElementCount == 0) {
        let carrito = document.getElementsByClassName('carrito')[0];
        carrito.style.marginRight = '-100%';
        carrito.style.opacity = '0';
        verCarrito = false;

        let items = document.getElementsByClassName('contenedor-items')[0];
        items.style.width = '100%';
    }
}
//Actualizamos el total de Carrito
function actualizarTotalCarrito() {
    //seleccionamos el contenedor carrito
    let carritoContenedor = document.getElementsByClassName('carrito')[0];
    let carritoItems = carritoContenedor.getElementsByClassName('carrito-item');
    let total = 0;
    //recorremos cada elemento del carrito para actualizar el total
    for (let i = 0; i < carritoItems.length; i++) {
        let item = carritoItems[i];
        let precioElemento = item.getElementsByClassName('carrito-item-precio')[0];
        //quitamos el simobolo peso y el punto de milesimos.
        let precio = parseFloat(precioElemento.innerText.replace('$', '').replace('.', ''));
        let cantidadItem = item.getElementsByClassName('carrito-item-cantidad')[0];
        console.log(precio);
        let cantidad = cantidadItem.value;
        total = total + (precio * cantidad);
    }
    total = Math.round(total * 100) / 100;

    document.getElementsByClassName('carrito-precio-total')[0].innerText = '$' + total.toLocaleString("es") + ",00";

    // Guardar el carrito en el LocalStorage
    guardarCarritoEnLocalStorage();
}
// Función para cargar los elementos del carrito desde el LocalStorage
function cargarCarritoDesdeLocalStorage() {
    let carritoItems = localStorage.getItem('carrito');
    if (carritoItems) {
        carritoItems = JSON.parse(carritoItems);
        let carritoContainer = document.getElementsByClassName('carrito-items')[0];
        carritoContainer.innerHTML = '';
        for (let item of carritoItems) {
            agregarItemAlCarrito(item.titulo, item.precio, item.imagen);
        }
        actualizarTotalCarrito();
    }
}

// Función para guardar los elementos del carrito en el LocalStorage
function guardarCarritoEnLocalStorage() {
    let carritoItems = [];
    let carritoContainer = document.getElementsByClassName('carrito-items')[0];
    let items = carritoContainer.getElementsByClassName('carrito-item');
    for (let item of items) {
        let titulo = item.getElementsByClassName('carrito-item-titulo')[0].innerText;
        let precio = item.getElementsByClassName('carrito-item-precio')[0].innerText;
        let imagen = item.getElementsByTagName('img')[0].src;
        carritoItems.push({ titulo, precio, imagen});
    }
    localStorage.setItem('carrito', JSON.stringify(carritoItems));
}
