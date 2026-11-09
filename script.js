"use strict";

// Datos propios: seis propiedades por producto e identificadores iniciales del 1 al 8.
let inventario = [
  { id: 1, nombre: "Libreta de bocetos A5", categoria: "Papelería", cantidad: 12, precio: 4.50, agotado: false },
  { id: 2, nombre: "Papel adhesivo mate", categoria: "Papelería", cantidad: 25, precio: 0.80, agotado: false },
  { id: 3, nombre: "Marcador punta pincel", categoria: "Ilustración", cantidad: 18, precio: 2.25, agotado: false },
  { id: 4, nombre: "Set de acuarelas", categoria: "Ilustración", cantidad: 6, precio: 12.50, agotado: false },
  { id: 5, nombre: "Pincel de detalle", categoria: "Ilustración", cantidad: 0, precio: 3.75, agotado: true },
  { id: 6, nombre: "Tela de lona índigo", categoria: "Costura", cantidad: 9, precio: 6.00, agotado: false },
  { id: 7, nombre: "Broche metálico", categoria: "Costura", cantidad: 30, precio: 0.65, agotado: false },
  { id: 8, nombre: "Hilo color vino", categoria: "Costura", cantidad: 14, precio: 1.50, agotado: false }
];

// Distintos métodos de selección de elementos del DOM.
const formulario = document.getElementById("formulario-producto");
const cuerpoInventario = document.querySelector("#cuerpo-inventario");
const filtroCategoria = document.getElementById("filtro-categoria");
const mensajeError = document.querySelector("#mensaje-error");
const mensajeVacio = document.getElementById("mensaje-vacio");
const camposFormulario = formulario.getElementsByTagName("input");
const categoriasDisponibles = document.getElementById("categorias-disponibles");
const totalProductos = document.getElementById("total-productos");
const totalUnidades = document.getElementById("total-unidades");
const valorTotal = document.getElementById("valor-total");
const totalAgotados = document.getElementById("total-agotados");

function crearGeneradorId() {
  let contador = 100;
  return function () {
    contador++;
    return contador;
  };
}

function calcularValorTotal(items) {
  let total = 0;
  for (let indice = 0; indice < items.length; indice++) {
    total += items[indice].cantidad * items[indice].precio;
  }
  return total;
}

function contarUnidades(items) {
  let total = 0;
  for (let indice = 0; indice < items.length; indice++) {
    total += items[indice].cantidad;
  }
  return total;
}

function contarPorCategoria(items) {
  // Sin prototipo para admitir incluso categorías como "constructor".
  const conteo = Object.create(null);
  for (let indice = 0; indice < items.length; indice++) {
    const categoria = items[indice].categoria;
    if (conteo[categoria] === undefined) {
      conteo[categoria] = 0;
    }
    conteo[categoria]++;
  }
  return conteo;
}

function formatearMoneda(valor) {
  return "$" + valor.toFixed(2);
}

function crearCelda(texto) {
  const celda = document.createElement("td");
  celda.textContent = texto;
  return celda;
}

function crearFila(item) {
  const fila = document.createElement("tr");
  fila.classList.add(item.agotado ? "fila-agotada" : "fila-disponible");
  fila.appendChild(crearCelda(item.nombre));
  fila.appendChild(crearCelda(item.categoria));
  fila.appendChild(crearCelda(item.cantidad));
  fila.appendChild(crearCelda(formatearMoneda(item.precio)));
  fila.appendChild(crearCelda(formatearMoneda(item.cantidad * item.precio)));

  const celdaEstado = crearCelda("");
  const etiquetaEstado = document.createElement("span");
  etiquetaEstado.textContent = item.agotado ? "Agotado" : "Disponible";
  etiquetaEstado.classList.add("estado", item.agotado ? "estado-agotado" : "estado-disponible");
  celdaEstado.appendChild(etiquetaEstado);
  fila.appendChild(celdaEstado);

  const celdaAcciones = crearCelda("");
  const botonEstado = document.createElement("button");
  botonEstado.type = "button";
  botonEstado.textContent = item.agotado ? "Marcar disponible" : "Marcar agotado";
  botonEstado.classList.add("btn-estado");
  botonEstado.setAttribute("data-id", item.id);
  botonEstado.setAttribute("aria-label", botonEstado.textContent + ": " + item.nombre);
  celdaAcciones.appendChild(botonEstado);

  const botonEliminar = document.createElement("button");
  botonEliminar.type = "button";
  botonEliminar.textContent = "Eliminar";
  botonEliminar.classList.add("btn-eliminar");
  botonEliminar.setAttribute("data-id", item.id);
  botonEliminar.setAttribute("aria-label", "Eliminar: " + item.nombre);
  celdaAcciones.appendChild(botonEliminar);
  fila.appendChild(celdaAcciones);
  return fila;
}

function renderizar(items) {
  cuerpoInventario.textContent = "";
  let agotados = 0;
  for (let indice = 0; indice < items.length; indice++) {
    cuerpoInventario.appendChild(crearFila(items[indice]));
    if (items[indice].agotado) {
      agotados++;
    }
  }
  // Los cuatro indicadores resumen SOLO los datos visibles, después del filtro.
  totalProductos.textContent = items.length;
  totalUnidades.textContent = contarUnidades(items);
  valorTotal.textContent = formatearMoneda(calcularValorTotal(items));
  totalAgotados.textContent = agotados;
  mensajeVacio.hidden = items.length > 0;
}

function filtrarPorCategoria(categoria) {
  const resultado = [];
  for (let indice = 0; indice < inventario.length; indice++) {
    if (categoria === "todas" || inventario[indice].categoria === categoria) {
      resultado.push(inventario[indice]);
    }
  }
  return resultado;
}

function validarProducto(datos) {
  if (typeof datos.nombre !== "string" || datos.nombre.trim() === "") {
    throw new Error("Escribe el nombre del producto.");
  }
  if (typeof datos.categoria !== "string" || datos.categoria.trim() === "") {
    throw new Error("Escribe una categoría.");
  }
  if (datos.categoria.trim().toLowerCase() === "todas") {
    throw new Error('Usa otra categoría: "todas" está reservada para el filtro.');
  }
  if (!Number.isSafeInteger(datos.cantidad) || datos.cantidad <= 0) {
    throw new Error("La cantidad debe ser un número entero mayor que cero.");
  }
  if (typeof datos.precio !== "number" || !Number.isFinite(datos.precio) || datos.precio < 0) {
    throw new Error("El precio debe ser un número mayor o igual que cero.");
  }
}

function agregarProducto(event) {
  event.preventDefault();
  mensajeError.textContent = "";
  mensajeError.hidden = true;
  try {
    const datos = {
      nombre: formulario.elements.nombre.value.trim(),
      categoria: formulario.elements.categoria.value.trim(),
      cantidad: formulario.elements.cantidad.valueAsNumber,
      precio: formulario.elements.precio.valueAsNumber
    };
    validarProducto(datos);
    const producto = {
      id: siguienteId,
      nombre: datos.nombre,
      categoria: datos.categoria,
      cantidad: datos.cantidad,
      precio: datos.precio,
      agotado: false
    };
    inventario.push(producto);
    siguienteId = generarId();
    actualizarCategorias();
    actualizarVista();
    formulario.reset();
    camposFormulario[0].focus();
    console.log("Alta de producto:", producto);
    console.table(inventario);
  } catch (error) {
    mensajeError.textContent = error.message;
    mensajeError.hidden = false;
    console.error("No se pudo agregar el producto:", error.message);
  }
}

function eliminarProducto(id) {
  const resultado = [];
  for (let indice = 0; indice < inventario.length; indice++) {
    if (inventario[indice].id !== id) {
      resultado.push(inventario[indice]);
    }
  }
  return resultado;
}

function cambiarEstado(id) {
  for (let indice = 0; indice < inventario.length; indice++) {
    if (inventario[indice].id === id) {
      // El estado se administra manualmente y no cambia la cantidad registrada.
      inventario[indice].agotado = !inventario[indice].agotado;
      console.log("Cambio de estado:", inventario[indice]);
      break;
    }
  }
}

function actualizarCategorias() {
  const seleccionAnterior = filtroCategoria.value;
  const conteo = contarPorCategoria(inventario);
  filtroCategoria.textContent = "";
  categoriasDisponibles.textContent = "";
  const opcionTodas = document.createElement("option");
  opcionTodas.value = "todas";
  opcionTodas.textContent = "Todas las categorías";
  filtroCategoria.appendChild(opcionTodas);
  const categorias = Object.keys(conteo);
  for (let indice = 0; indice < categorias.length; indice++) {
    const opcion = document.createElement("option");
    opcion.value = categorias[indice];
    opcion.textContent = categorias[indice];
    filtroCategoria.appendChild(opcion);
    const sugerencia = document.createElement("option");
    sugerencia.value = categorias[indice];
    categoriasDisponibles.appendChild(sugerencia);
  }
  // Conservamos un filtro que quedó vacío al eliminar su último producto.
  // Así se muestra el mensaje sin resultados hasta elegir otra categoría.
  if (seleccionAnterior !== "todas" && conteo[seleccionAnterior] === undefined) {
    const opcionVacia = document.createElement("option");
    opcionVacia.value = seleccionAnterior;
    opcionVacia.textContent = seleccionAnterior;
    filtroCategoria.appendChild(opcionVacia);
  }
  filtroCategoria.value = seleccionAnterior;
}

function actualizarVista() {
  renderizar(filtrarPorCategoria(filtroCategoria.value));
}

function gestionarAcciones(event) {
  const boton = event.target.closest("button");
  if (!boton || !cuerpoInventario.contains(boton)) {
    return;
  }
  const id = Number(boton.getAttribute("data-id"));
  if (boton.classList.contains("btn-eliminar")) {
    inventario = eliminarProducto(id);
    console.log("Baja de producto. ID:", id);
    actualizarCategorias();
  } else if (boton.classList.contains("btn-estado")) {
    cambiarEstado(id);
  } else {
    return;
  }
  actualizarVista();
  console.table(inventario);
}

// Flujo principal: el cierre mantiene el contador privado y genera el primer ID.
const generarId = crearGeneradorId();
let siguienteId = generarId();
renderizar(inventario);
actualizarCategorias();
formulario.addEventListener("submit", agregarProducto);
// Único escuchador de clic para todas las filas, incluso las agregadas después.
cuerpoInventario.addEventListener("click", gestionarAcciones);
filtroCategoria.addEventListener("change", actualizarVista);
console.log("Inventario inicial:");
console.table(inventario);
console.log("Cantidad de productos por categoría:");
console.table(contarPorCategoria(inventario));
