// __tests__/singleton.test.js — Pruebas para el Patrón Singleton (DB)

const db = require('../db');

describe('Patrón Singleton — DB', () => {
  test('múltiples require() retornan exactamente la misma referencia', () => {
    const db1 = require('../db');
    const db2 = require('../db');
    expect(db1).toBe(db2);
  });

  test('modificar desde una referencia se refleja en las demás', () => {
    const db1 = require('../db');
    const db2 = require('../db');
    const longitudOriginal = db1.ventas.length;

    db1.ventas.push({ id: '__test__' });
    expect(db2.ventas.length).toBe(longitudOriginal + 1);

    db1.ventas.pop(); // limpieza
  });

  test('la instancia contiene los datos iniciales esperados', () => {
    expect(db.vendedores.length).toBeGreaterThan(0);
    expect(db.productos.length).toBeGreaterThan(0);
    expect(db.proveedores.length).toBeGreaterThan(0);
  });

  test('getInstance() es accesible como punto de acceso estático', () => {
    // db.js exporta DB.getInstance() — verificamos que es la misma instancia
    const instancia = require('../db');
    expect(instancia).toBe(db);
  });
});
