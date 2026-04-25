// components/strategies/EstrategiaCalculo.js — Patrón Strategy
// Define la interfaz y las implementaciones concretas de los
// algoritmos de cálculo del total de una venta.
const logger = require('../../utils/logger');

// Estrategia estándar: precio * cantidad sin descuentos
class EstandarStrategy {
  calcular(productos) {
    return productos.reduce((total, item) => {
      return total + (item.precio * (item.cantidad || 1));
    }, 0);
  }
}

// Estrategia con descuento: aplica 10% si hay más de 3 productos distintos
class DescuentoStrategy {
  calcular(productos) {
    const base = productos.reduce((total, item) => {
      return total + (item.precio * (item.cantidad || 1));
    }, 0);
    const descuento = productos.length > 3 ? 0.10 : 0;
    const total = base * (1 - descuento);
    if (descuento > 0) {
      logger.info(`[Strategy] Descuento del ${descuento * 100}% aplicado. Total: $${total}`);
    }
    return total;
  }
}

module.exports = { EstandarStrategy, DescuentoStrategy };
