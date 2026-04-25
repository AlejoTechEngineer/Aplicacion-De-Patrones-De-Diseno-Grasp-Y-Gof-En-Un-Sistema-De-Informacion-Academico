// __tests__/strategy.test.js — Pruebas para el Patrón Strategy

const { EstandarStrategy, DescuentoStrategy } = require('../components/strategies/EstrategiaCalculo');

const productos2 = [
  { precio: 100000, cantidad: 1 },
  { precio: 200000, cantidad: 1 },
]; // total base: 300 000

const productos4 = [
  { precio: 100000, cantidad: 1 },
  { precio: 200000, cantidad: 1 },
  { precio: 150000, cantidad: 1 },
  { precio:  80000, cantidad: 1 },
]; // total base: 530 000

describe('Patrón Strategy — EstandarStrategy', () => {
  const strategy = new EstandarStrategy();

  test('calcula total correcto sin descuento (2 productos)', () => {
    expect(strategy.calcular(productos2)).toBe(300000);
  });

  test('NO aplica descuento aunque haya más de 3 productos', () => {
    expect(strategy.calcular(productos4)).toBe(530000);
  });

  test('retorna 0 con lista vacía', () => {
    expect(strategy.calcular([])).toBe(0);
  });
});

describe('Patrón Strategy — DescuentoStrategy', () => {
  const strategy = new DescuentoStrategy();

  test('NO aplica descuento con 3 o menos productos', () => {
    expect(strategy.calcular(productos2)).toBe(300000);
  });

  test('aplica descuento del 10% con más de 3 productos', () => {
    expect(strategy.calcular(productos4)).toBeCloseTo(530000 * 0.90);
  });

  test('retorna 0 con lista vacía', () => {
    expect(strategy.calcular([])).toBe(0);
  });
});

describe('Intercambio de estrategia en tiempo de ejecución', () => {
  test('el resultado cambia según la estrategia inyectada', () => {
    const estandar  = new EstandarStrategy();
    const descuento = new DescuentoStrategy();

    const totalEstandar  = estandar.calcular(productos4);
    const totalDescuento = descuento.calcular(productos4);

    expect(totalDescuento).toBeLessThan(totalEstandar);
  });
});
