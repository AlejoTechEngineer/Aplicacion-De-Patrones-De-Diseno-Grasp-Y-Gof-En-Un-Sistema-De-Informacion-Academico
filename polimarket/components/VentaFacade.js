// components/VentaFacade.js — Patrón Facade
// Simplifica la interfaz de registro de ventas para los clientes.
// Internamente coordina: Autorización → Inventario → Strategy → Persistencia.
// Los clientes (API REST y CLI) solo necesitan llamar registrarVenta().
const logger                 = require('../utils/logger');
const productoRepo           = require('../repositories/ProductoRepository');
const ventaRepo              = require('../repositories/VentaRepository');
const ComponenteAutorizacion     = require('./ComponenteAutorizacion');
const ComponenteInventario       = require('./ComponenteInventario');
const ComponenteReabastecimiento = require('./ComponenteReabastecimiento');
const { EstandarStrategy,
        DescuentoStrategy }      = require('./strategies/EstrategiaCalculo');

class VentaFacade {
  constructor() {
    this.autorizacion = ComponenteAutorizacion;
    this.inventario   = ComponenteInventario;

    // Registra reabastecimiento como observer del inventario (patrón Observer)
    this.inventario.agregarObservador(ComponenteReabastecimiento);
  }

  // Interfaz única para los clientes — una sola llamada orquesta todo
  registrarVenta(vendedorId, clienteId, productosIds) {
    // Paso 1: Verificar autorización del vendedor
    if (!this.autorizacion.estaAutorizado(vendedorId)) {
      return { ok: false, mensaje: 'Vendedor no autorizado para operar.' };
    }

    // Paso 2: Verificar disponibilidad de todos los productos
    for (const pid of productosIds) {
      const disp = this.inventario.verificarDisponibilidad(pid);
      if (!disp.ok) {
        return { ok: false, mensaje: `Sin stock disponible para el producto: ${pid}` };
      }
    }

    // Paso 3: Seleccionar estrategia de cálculo según volumen (patrón Strategy)
    const productos  = productosIds.map(id => productoRepo.findById(id)).filter(Boolean);
    const estrategia = productos.length > 3 ? new DescuentoStrategy() : new EstandarStrategy();
    const total      = estrategia.calcular(productos);

    // Paso 4: Persistir la venta
    const venta = {
      id:          `VNT-${Date.now()}`,
      vendedorId,
      clienteId,
      productosIds,
      total,
      estado:      'pendiente',
      fecha:       new Date().toISOString(),
    };
    ventaRepo.save(venta);

    // Paso 5: Descontar inventario (puede disparar Observer si hay stock bajo)
    productosIds.forEach(pid => this.inventario.registrarSalida(pid, 1));

    logger.info(`[Facade] Venta registrada: ${venta.id} — Total: $${total}`);
    return { ok: true, mensaje: 'Venta registrada exitosamente.', venta };
  }
}

module.exports = new VentaFacade();
