// Base de datos en memoria — PoliMarket
const db = {
  vendedores: [
    { id: 'V001', nombre: 'Carlos Ruiz',   email: 'carlos@polimarket.com',  autorizado: false },
    { id: 'V002', nombre: 'Ana Gomez',     email: 'ana@polimarket.com',     autorizado: false },
  ],
  clientes: [
    { id: 'C001', nombre: 'Pedro Ramirez', email: 'pedro@gmail.com',  direccion: 'Calle 10 #5-20' },
    { id: 'C002', nombre: 'Laura Torres',  email: 'laura@gmail.com',  direccion: 'Av. 80 #12-30' },
  ],
  productos: [
    { id: 'P001', nombre: 'Laptop HP',    precio: 2500000, stock: 10 },
    { id: 'P002', nombre: 'Mouse Logitech', precio: 80000, stock: 3  },
    { id: 'P003', nombre: 'Teclado Dell', precio: 120000, stock: 0  },
  ],
  proveedores: [
    { id: 'PR001', nombre: 'TechSupply SAS', contacto: 'Juan Mora', telefono: '3001234567' },
    { id: 'PR002', nombre: 'DigitalParts SA', contacto: 'Maria Paz', telefono: '3109876543' },
  ],
  ventas: [],
  entregas: [],
  pedidos: [],
};

module.exports = db;
