// db.js — Patrón Singleton
// Garantiza una única instancia de la base de datos en memoria
// compartida por todos los componentes del sistema.
class DB {
  constructor() {
    // Si ya existe una instancia, la retorna directamente
    if (DB._instancia) return DB._instancia;

    this.vendedores = [
      { id: 'V1', nombre: 'Carlos Ruiz',  email: 'c.ruiz@polimarket.com',  autorizado: false },
      { id: 'V2', nombre: 'Ana Torres',   email: 'a.torres@polimarket.com', autorizado: false },
      { id: 'V3', nombre: 'Luis Mora',    email: 'l.mora@polimarket.com',   autorizado: false },
    ];
    this.clientes = [
      { id: 'C1', nombre: 'Pedro Gomez',  email: 'p.gomez@gmail.com',  direccion: 'Calle 10 #5-20' },
      { id: 'C2', nombre: 'Maria Lopez',  email: 'm.lopez@gmail.com',  direccion: 'Carrera 7 #80-15' },
    ];
    this.productos = [
      { id: 'P1', nombre: 'Laptop',    precio: 2500000, stock: 10 },
      { id: 'P2', nombre: 'Monitor',   precio: 800000,  stock: 5  },
      { id: 'P3', nombre: 'Teclado',   precio: 150000,  stock: 20 },
      { id: 'P4', nombre: 'Mouse',     precio: 80000,   stock: 15 },
    ];
    this.proveedores = [
      { id: 'PROV-1', nombre: 'TechSupply S.A.', contacto: 'Juan Perez', telefono: '3001234567' },
    ];
    this.ventas   = [];
    this.entregas = [];
    this.pedidos  = [];

    // Guarda la instancia única en propiedad estática
    DB._instancia = this;
  }

  // Punto de acceso global — siempre retorna la misma instancia
  static getInstance() {
    if (!DB._instancia) new DB();
    return DB._instancia;
  }
}

DB._instancia = null;
module.exports = DB.getInstance();
