// ComponenteInventario — Bodega
// RF3: Verificar disponibilidad de productos
// RF4: Registrar entradas y salidas de bodega

const db = require('../db');

const ComponenteInventario = {

  // RF3: Verificar disponibilidad de un producto
  verificarDisponibilidad(productoId) {
    const producto = db.productos.find(p => p.id === productoId);
    if (!producto) {
      return { ok: false, mensaje: `Producto ${productoId} no encontrado.` };
    }
    if (producto.stock === 0) {
      return { ok: false, mensaje: `Producto ${producto.nombre} sin stock disponible.` };
    }
    return { ok: true, mensaje: `Stock disponible: ${producto.stock}`, producto };
  },

  // RF4: Registrar entrada de productos a bodega
  registrarEntrada(productoId, cantidad) {
    const producto = db.productos.find(p => p.id === productoId);
    if (!producto) {
      return { ok: false, mensaje: `Producto ${productoId} no encontrado.` };
    }
    producto.stock += cantidad;
    return {
      ok: true,
      mensaje: `Entrada registrada. Stock actual de ${producto.nombre}: ${producto.stock}`,
      producto,
    };
  },

  // Registrar salida de productos de bodega
  registrarSalida(productoId, cantidad) {
    const producto = db.productos.find(p => p.id === productoId);
    if (!producto) {
      return { ok: false, mensaje: `Producto ${productoId} no encontrado.` };
    }
    if (producto.stock < cantidad) {
      return { ok: false, mensaje: `Stock insuficiente para ${producto.nombre}.` };
    }
    producto.stock -= cantidad;
    return {
      ok: true,
      mensaje: `Salida registrada. Stock actual de ${producto.nombre}: ${producto.stock}`,
      producto,
    };
  },

  // Listar todos los productos con su stock
  listarInventario() {
    return { ok: true, productos: db.productos };
  },
};

module.exports = ComponenteInventario;
