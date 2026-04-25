// __tests__/facade.test.js — Pruebas para el Patrón Facade

const db                     = require('../db');
const ComponenteAutorizacion = require('../components/ComponenteAutorizacion');
const ComponenteReabastecimiento = require('../components/ComponenteReabastecimiento');
const VentaFacade            = require('../components/VentaFacade');

beforeEach(() => {
  // Limpia ventas acumuladas
  db.ventas = [];
  // Restaura stocks
  const stocks = { P1: 10, P2: 5, P3: 20, P4: 15 };
  db.productos.forEach(p => { if (stocks[p.id] !== undefined) p.stock = stocks[p.id]; });
  // Revoca todas las autorizaciones
  db.vendedores.forEach(v => { v.autorizado = false; });
  // Resetea observers para evitar duplicados entre tests
  VentaFacade.inventario._observadores = [];
  VentaFacade.inventario.agregarObservador(ComponenteReabastecimiento);
});

describe('Patrón Facade — VentaFacade', () => {
  test('rechaza venta si el vendedor NO está autorizado', () => {
    const result = VentaFacade.registrarVenta('V1', 'C1', ['P1']);
    expect(result.ok).toBe(false);
    expect(result.mensaje).toMatch(/no autorizado/i);
  });

  test('registra venta exitosamente con vendedor autorizado', () => {
    ComponenteAutorizacion.autorizarVendedor('V1');
    const result = VentaFacade.registrarVenta('V1', 'C1', ['P1', 'P2']);
    expect(result.ok).toBe(true);
    expect(result.venta).toBeDefined();
    expect(result.venta.vendedorId).toBe('V1');
  });

  test('aplica EstandarStrategy (sin descuento) para 3 o menos productos', () => {
    ComponenteAutorizacion.autorizarVendedor('V1');
    const result = VentaFacade.registrarVenta('V1', 'C1', ['P1', 'P2']);
    const esperado = 2500000 + 800000; // P1 + P2 sin descuento
    expect(result.venta.total).toBe(esperado);
  });

  test('aplica DescuentoStrategy (10% off) para más de 3 productos', () => {
    ComponenteAutorizacion.autorizarVendedor('V1');
    const result = VentaFacade.registrarVenta('V1', 'C1', ['P1', 'P2', 'P3', 'P4']);
    const base = 2500000 + 800000 + 150000 + 80000;
    expect(result.venta.total).toBeCloseTo(base * 0.90);
  });

  test('descuenta el stock del inventario al registrar la venta', () => {
    ComponenteAutorizacion.autorizarVendedor('V1');
    const stockAntes = db.productos.find(p => p.id === 'P1').stock;
    VentaFacade.registrarVenta('V1', 'C1', ['P1']);
    const stockDespues = db.productos.find(p => p.id === 'P1').stock;
    expect(stockDespues).toBe(stockAntes - 1);
  });

  test('rechaza venta si el producto no tiene stock', () => {
    ComponenteAutorizacion.autorizarVendedor('V1');
    db.productos.find(p => p.id === 'P1').stock = 0;
    const result = VentaFacade.registrarVenta('V1', 'C1', ['P1']);
    expect(result.ok).toBe(false);
    expect(result.mensaje).toMatch(/sin stock/i);
  });
});
