# PoliMarket — Sistema de Gestión Empresarial

> Implementación de patrones de diseño GoF (Gang of Four) sobre una arquitectura de componentes Node.js.
> Proyecto académico — Maestría en Arquitectura de Software | Unidades 2, 3 y 4.

**¿Quieres ejecutarlo ya?** → [Guía de inicio rápido (QUICKSTART.md)](QUICKSTART.md)

---

## Tabla de Contenidos

1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Arquitectura](#arquitectura)
3. [Patrones GoF Implementados](#patrones-gof-implementados)
4. [Repository Pattern](#repository-pattern)
5. [Logger Centralizado](#logger-centralizado)
6. [Estructura del Proyecto](#estructura-del-proyecto)
7. [Prerrequisitos](#prerrequisitos)
8. [Instalación](#instalación)
9. [Ejecución](#ejecución)
10. [API REST — Referencia Completa](#api-rest--referencia-completa)
11. [Cliente CLI](#cliente-cli)
12. [Datos de Prueba (Seeds)](#datos-de-prueba-seeds)
13. [Testing](#testing)
14. [Diagramas UML](#diagramas-uml)
15. [Tecnologías](#tecnologías)
16. [Autor](#autor)

---

## Descripción del Proyecto

**PoliMarket** es un sistema de gestión empresarial para una empresa de distribución con cinco áreas de negocio interconectadas: Recursos Humanos, Ventas, Bodega, Proveedores y Entregas.

El proyecto fue construido progresivamente en tres unidades:

| Unidad | Alcance |
|--------|---------|
| **U2** | Definición de componentes, diagramas de clases y componentes UML base |
| **U3** | Análisis de patrones GoF aplicables al dominio |
| **U4** | Implementación de 5 patrones GoF, Repository Pattern, Logger (winston) y suite de tests Jest |

### Flujo de negocio principal

```
Cliente Web / CLI
       │
       ▼
  VentaFacade  ◄─── Punto de entrada único (Patrón Facade)
       │
  ┌────┴────────────────────┐
  ▼                         ▼
ComponenteAutorizacion   ComponenteInventario ◄── Subject (Observer)
  (RRHH)                     │
                             ▼
                   ComponenteReabastecimiento ◄── Observer concreto
                   (notificado al bajar stock)
```

---

## Arquitectura

El sistema está organizado en **capas horizontales** con responsabilidades bien delimitadas:

```
┌─────────────────────────────────────────────┐
│              CAPA DE CLIENTES               │
│     API REST (Express)  │  CLI (readline)   │
├─────────────────────────────────────────────┤
│               CAPA FACADE                   │
│              VentaFacade                    │  ◄── Patrón Facade
├─────────────────────────────────────────────┤
│            CAPA DE COMPONENTES              │
│  Autorización │ Inventario │ Ventas         │
│  Reabastecimiento │ Entregas                │  ◄── Patrones GoF
├─────────────────────────────────────────────┤
│           CAPA DE REPOSITORIOS              │
│  ProductoRepo │ VentaRepo │ EntregaRepo     │  ◄── Repository Pattern
│  PedidoRepo   │ VendedorRepo                │
├─────────────────────────────────────────────┤
│           CAPA DE INFRAESTRUCTURA           │
│              DB (Singleton)                 │  ◄── Patrón Singleton
│         Base de datos en memoria            │
└─────────────────────────────────────────────┘
```

### Principios de diseño aplicados

- **SOLID**: Open/Closed en Strategy, Single Responsibility por componente
- **DRY**: Logger centralizado, repositorios reutilizables
- **KISS**: Cada componente tiene una única responsabilidad clara
- **Separation of Concerns**: Acceso a datos en repositorios, lógica en componentes, orquestación en Facade

---

## Patrones GoF Implementados

### 1. Singleton — `db.js`

**Problema:** Se necesita una única instancia de la base de datos en memoria compartida por todos los componentes. Sin Singleton, cada `require('../db')` podría crear datos independientes.

**Solución:** La clase `DB` controla su propia instanciación.

```javascript
class DB {
  constructor() {
    if (DB._instancia) return DB._instancia;  // Retorna instancia existente
    // ... inicialización de datos ...
    DB._instancia = this;
  }

  static getInstance() {
    if (!DB._instancia) new DB();
    return DB._instancia;
  }
}

module.exports = DB.getInstance();  // Punto de acceso global único
```

**Verificación:** Cualquier módulo que haga `require('./db')` obtiene **exactamente el mismo objeto**.

---

### 2. Observer — `ComponenteInventario.js` + `ComponenteReabastecimiento.js`

**Problema:** Cuando el stock de un producto cae por debajo del mínimo (≤ 3 unidades), el sistema de reabastecimiento debe reaccionar automáticamente, sin que el inventario conozca directamente al módulo de proveedores.

**Solución:** `ComponenteInventario` actúa como **Subject** y notifica a todos sus observers registrados.

```javascript
// Subject — ComponenteInventario
registrarSalida(productoId, cantidad) {
  producto.stock -= cantidad;

  if (producto.stock <= STOCK_MINIMO) {
    logger.warn(`[Inventario] Stock bajo en ${productoId}: ${producto.stock}`);
    this.notificarObservadores(productoId, producto.stock);  // ← dispara evento
  }
}

// Observer concreto — ComponenteReabastecimiento
actualizar(productoId, stock) {
  logger.info(`[Reabastecimiento] Notificación recibida — ${productoId}: ${stock}`);
  return this.solicitarReabastecimiento(productoId, 'PROV-1', 20);
}
```

**Registro del observer** (en `VentaFacade`):
```javascript
this.inventario.agregarObservador(ComponenteReabastecimiento);
```

---

### 3. Strategy — `components/strategies/EstrategiaCalculo.js`

**Problema:** El cálculo del total de una venta puede variar (precio estándar vs. precio con descuento por volumen). Hardcodear la lógica viola el principio Open/Closed.

**Solución:** Se define una interfaz de estrategia con dos implementaciones intercambiables.

```javascript
// Estrategia A: sin descuento
class EstandarStrategy {
  calcular(productos) {
    return productos.reduce((t, p) => t + p.precio * (p.cantidad || 1), 0);
  }
}

// Estrategia B: 10% de descuento si hay más de 3 productos
class DescuentoStrategy {
  calcular(productos) {
    const base = productos.reduce((t, p) => t + p.precio * (p.cantidad || 1), 0);
    const descuento = productos.length > 3 ? 0.10 : 0;
    return base * (1 - descuento);
  }
}
```

**Selección dinámica en `VentaFacade`:**
```javascript
const estrategia = productos.length > 3 ? new DescuentoStrategy() : new EstandarStrategy();
const total      = estrategia.calcular(productos);
```

También puede cambiarse en tiempo de ejecución desde `ComponenteRegistroVentas`:
```javascript
componenteVentas.setEstrategia(new DescuentoStrategy());
```

---

### 4. Factory Method — `components/EntregaFactory.js`

**Problema:** El sistema maneja múltiples tipos de entrega (domicilio, express) con comportamientos distintos. Instanciar directamente las clases concretas acopla al cliente con la implementación.

**Solución:** `EntregaFactory` centraliza la creación. Los clientes solo conocen el tipo.

```javascript
const TIPOS_VALIDOS = ['domicilio', 'express'];

class EntregaFactory {
  static crearEntrega(tipo, ventaId, opciones = {}) {
    if (!TIPOS_VALIDOS.includes(tipo)) {
      throw new Error(`[Factory] Tipo de entrega desconocido: "${tipo}"`);
    }
    switch (tipo) {
      case 'domicilio': return new EntregaDomicilio(ventaId, opciones.direccion);
      case 'express':   return new EntregaExpress(ventaId, opciones.tiempoMaximo);
    }
  }
}
```

**Uso en `ComponenteGestionEntregas`:**
```javascript
const entrega = EntregaFactory.crearEntrega('express', ventaId, { tiempoMaximo: 2 });
entrega.registrarEntrega();
```

---

### 5. Facade — `components/VentaFacade.js`

**Problema:** Registrar una venta implica coordinar cuatro subsistemas: verificar autorización, revisar inventario, calcular el total con la estrategia correcta, persistir la venta y descontar stock. Los clientes no deberían conocer esta complejidad.

**Solución:** `VentaFacade` expone **una única operación** que orquesta todo internamente.

```javascript
registrarVenta(vendedorId, clienteId, productosIds) {
  // Paso 1: Autorización (RRHH)
  if (!this.autorizacion.estaAutorizado(vendedorId))
    return { ok: false, mensaje: 'Vendedor no autorizado.' };

  // Paso 2: Disponibilidad (Bodega)
  for (const pid of productosIds) {
    const disp = this.inventario.verificarDisponibilidad(pid);
    if (!disp.ok) return { ok: false, mensaje: `Sin stock: ${pid}` };
  }

  // Paso 3: Estrategia de cálculo (Ventas)
  const estrategia = productos.length > 3 ? new DescuentoStrategy() : new EstandarStrategy();
  const total      = estrategia.calcular(productos);

  // Paso 4: Persistencia (Repositorio)
  ventaRepo.save({ id, vendedorId, clienteId, productosIds, total, estado: 'pendiente' });

  // Paso 5: Descuento de inventario → puede disparar Observer
  productosIds.forEach(pid => this.inventario.registrarSalida(pid, 1));
}
```

**Endpoint dedicado:** `POST /ventas/facade` — una sola llamada HTTP ejecuta los 5 pasos.

---

## Repository Pattern

Los componentes **nunca acceden directamente** a la base de datos. Todo pasa por un repositorio, lo que desacopla la lógica de negocio del mecanismo de persistencia.

| Repositorio | Entidad | Métodos principales |
|-------------|---------|---------------------|
| `ProductoRepository` | Producto | `findById`, `findAll`, `findAvailable`, `findBelowStock(min)` |
| `VentaRepository` | Venta | `save`, `findById`, `findAll`, `findByEstado` |
| `EntregaRepository` | Entrega | `save`, `findById`, `findAll` |
| `PedidoRepository` | Pedido | `save`, `findAll` |
| `VendedorRepository` | Vendedor | `findById`, `findAll` |

**Ventaja:** Para migrar a MongoDB o PostgreSQL en producción, solo se reescriben los repositorios, sin tocar los componentes de negocio.

---

## Logger Centralizado

Todos los `console.log` del sistema fueron reemplazados por **winston**, con niveles semánticos:

```javascript
// utils/logger.js
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message }) =>
      `${timestamp} [${level}] ${message}`
    )
  ),
  transports: [ new winston.transports.Console() ],
});
```

| Nivel | Cuándo se usa |
|-------|--------------|
| `logger.info` | Registro de operaciones normales (venta creada, pedido generado) |
| `logger.warn` | Alertas de negocio (stock bajo detectado) |
| `logger.error` | Errores de sistema (disponible para extensión) |

Configurable via variable de entorno: `LOG_LEVEL=debug npm run start:web`

---

## Estructura del Proyecto

```
polimarket/
│
├── clients/
│   ├── cli/
│   │   └── cliente-cli.js          # Cliente de línea de comandos (readline)
│   └── web/
│       └── servidor.js             # API REST con Express (puerto 3000)
│
├── components/
│   ├── strategies/
│   │   └── EstrategiaCalculo.js    # [Strategy] EstandarStrategy + DescuentoStrategy
│   ├── ComponenteAutorizacion.js   # RF1 — Gestión de autorización de vendedores
│   ├── ComponenteGestionEntregas.js# RF5 — Usa Factory Method para crear entregas
│   ├── ComponenteInventario.js     # RF3/RF4 — [Observer Subject] Control de stock
│   ├── ComponenteReabastecimiento.js# RF4 — [Observer Concreto] Pedidos automáticos
│   ├── ComponenteRegistroVentas.js # RF2 — Usa Strategy para calcular totales
│   ├── EntregaFactory.js           # [Factory Method] Crea EntregaDomicilio/Express
│   └── VentaFacade.js              # [Facade] Orquesta el registro completo de venta
│
├── repositories/
│   ├── EntregaRepository.js        # [Repository] Acceso a datos de entregas
│   ├── PedidoRepository.js         # [Repository] Acceso a datos de pedidos
│   ├── ProductoRepository.js       # [Repository] Acceso a datos de productos
│   ├── VendedorRepository.js       # [Repository] Acceso a datos de vendedores
│   └── VentaRepository.js          # [Repository] Acceso a datos de ventas
│
├── utils/
│   └── logger.js                   # Logger centralizado (winston)
│
├── uml/
│   ├── diagrama-clases.puml        # Diagrama de clases — Unidad 2
│   ├── diagrama-componentes.puml   # Diagrama de componentes — Unidad 2
│   ├── diagrama-clases-u4.puml     # Diagrama de clases con patrones GoF — Unidad 4
│   └── diagrama-componentes-u4.puml# Diagrama de componentes con patrones — Unidad 4
│
├── public/
│   └── index.html                  # Interfaz web estática
│
├── __tests__/
│   ├── singleton.test.js           # Tests: Patrón Singleton
│   ├── observer.test.js            # Tests: Patrón Observer
│   ├── strategy.test.js            # Tests: Patrón Strategy
│   ├── factory.test.js             # Tests: Patrón Factory Method
│   └── facade.test.js              # Tests: Patrón Facade
│
├── db.js                           # [Singleton] Base de datos en memoria
├── package.json
└── README.md
```

---

## Prerrequisitos

- **Node.js** v18 o superior
- **npm** v9 o superior
- (Opcional) Extensión **PlantUML** en VS Code para renderizar los diagramas `.puml`

---

## Instalación

```bash
# 1. Clonar o descargar el proyecto
cd polimarket

# 2. Instalar dependencias
npm install
```

Dependencias instaladas:

| Paquete | Tipo | Propósito |
|---------|------|-----------|
| `express` | producción | Servidor HTTP / API REST |
| `winston` | producción | Logger estructurado con niveles |
| `jest` | desarrollo | Framework de testing unitario |

---

## Ejecución

### API REST (servidor web)

```bash
npm run start:web
```

El servidor inicia en `http://localhost:3000`.  
La interfaz web está disponible en `http://localhost:3000/index.html`.

### Cliente CLI

```bash
npm run start:cli
```

Inicia el menú interactivo de línea de comandos.

### Controlar el nivel de logs

```bash
# Solo errores y advertencias
LOG_LEVEL=warn npm run start:web

# Logs de depuración completos
LOG_LEVEL=debug npm run start:web
```

---

## API REST — Referencia Completa

Base URL: `http://localhost:3000`

### Recursos Humanos — Autorización

#### `POST /rrhh/autorizar`
Autoriza a un vendedor para operar en el sistema.

**Body:**
```json
{ "vendedorId": "V1" }
```

**Respuesta exitosa:**
```json
{
  "ok": true,
  "mensaje": "Vendedor Carlos Ruiz autorizado correctamente.",
  "vendedor": { "id": "V1", "nombre": "Carlos Ruiz", "autorizado": true }
}
```

---

#### `POST /rrhh/revocar`
Revoca la autorización de un vendedor.

**Body:**
```json
{ "vendedorId": "V1" }
```

---

### Ventas

#### `POST /ventas/registrar`
Registra una venta. El vendedor debe estar previamente autorizado. Usa `EstandarStrategy`.

**Body:**
```json
{
  "vendedorId": "V1",
  "clienteId":  "C1",
  "productosIds": ["P1", "P2"]
}
```

**Respuesta exitosa:**
```json
{
  "ok": true,
  "mensaje": "Venta registrada.",
  "venta": {
    "id": "VNT-1700000000000",
    "vendedorId": "V1",
    "clienteId": "C1",
    "productosIds": ["P1", "P2"],
    "total": 3300000,
    "estado": "pendiente",
    "fecha": "2026-04-25T00:00:00.000Z"
  }
}
```

---

#### `POST /ventas/facade`
Registra una venta usando el **Patrón Facade**. Orquesta autorización, disponibilidad, estrategia de cálculo y descuento de inventario en una sola operación. Aplica `DescuentoStrategy` automáticamente si hay más de 3 productos.

**Body:**
```json
{
  "vendedorId": "V1",
  "clienteId":  "C1",
  "productosIds": ["P1", "P2", "P3", "P4"]
}
```

**Respuesta exitosa (con descuento 10%):**
```json
{
  "ok": true,
  "mensaje": "Venta registrada exitosamente.",
  "venta": {
    "id": "VNT-1700000000001",
    "total": 3177000,
    "estado": "pendiente"
  }
}
```

---

#### `GET /ventas`
Lista todas las ventas registradas.

#### `GET /ventas/clientes`
Lista todos los clientes disponibles.

---

### Bodega — Inventario

#### `GET /bodega/disponibilidad/:productoId`
Verifica el stock disponible de un producto.

```
GET /bodega/disponibilidad/P1
```

**Respuesta:**
```json
{
  "ok": true,
  "stock": 10,
  "producto": { "id": "P1", "nombre": "Laptop", "precio": 2500000, "stock": 10 }
}
```

---

#### `GET /bodega/inventario`
Lista el inventario completo con todos los productos y su stock actual.

---

#### `POST /bodega/reabastecer`
Solicita reabastecimiento manual a un proveedor.

**Body:**
```json
{
  "productoId":  "P2",
  "proveedorId": "PROV-1",
  "cantidad":    20
}
```

---

#### `GET /bodega/stock-bajo`
Lista los productos cuyo stock está por debajo del mínimo (≤ 3 unidades).

---

### Entregas

#### `POST /entregas/registrar`
Registra una entrega para una venta pendiente. Usa **Factory Method** para crear el tipo de entrega.

**Body:**
```json
{
  "ventaId": "VNT-1700000000000",
  "tipo":    "domicilio"
}
```

Tipos disponibles: `"domicilio"` | `"express"`

---

#### `GET /entregas/pendientes`
Lista las ventas en estado `pendiente` que aún no tienen entrega asignada.

#### `GET /entregas`
Lista todas las entregas registradas.

---

## Cliente CLI

El cliente CLI ofrece un menú interactivo con 7 opciones:

```
──────────────────────────────────────────────────
       POLIMARKET — SISTEMA DE GESTIÓN
──────────────────────────────────────────────────
1. Autorizar vendedor         (RF1 - RRHH)
2. Registrar venta            (RF2 - Ventas)
3. Ver disponibilidad bodega  (RF3 - Bodega)
4. Solicitar reabastecimiento (RF4 - Bodega)
5. Registrar entrega          (RF5 - Entregas)
6. Ver inventario completo
7. Ver pedidos pendientes de entrega
0. Salir
```

---

## Datos de Prueba (Seeds)

La base de datos se inicializa automáticamente al arrancar con los siguientes datos:

### Vendedores

| ID | Nombre | Email | Autorizado |
|----|--------|-------|------------|
| V1 | Carlos Ruiz | c.ruiz@polimarket.com | false |
| V2 | Ana Torres | a.torres@polimarket.com | false |
| V3 | Luis Mora | l.mora@polimarket.com | false |

> **Nota:** Los vendedores arrancan sin autorización. Usar `POST /rrhh/autorizar` antes de registrar ventas.

### Clientes

| ID | Nombre | Email | Dirección |
|----|--------|-------|-----------|
| C1 | Pedro Gomez | p.gomez@gmail.com | Calle 10 #5-20 |
| C2 | Maria Lopez | m.lopez@gmail.com | Carrera 7 #80-15 |

### Productos

| ID | Nombre | Precio | Stock inicial |
|----|--------|--------|---------------|
| P1 | Laptop | $2,500,000 | 10 |
| P2 | Monitor | $800,000 | 5 |
| P3 | Teclado | $150,000 | 20 |
| P4 | Mouse | $80,000 | 15 |

### Proveedores

| ID | Nombre | Contacto |
|----|--------|----------|
| PROV-1 | TechSupply S.A. | Juan Perez — 3001234567 |

---

## Testing

El proyecto incluye una suite completa de tests unitarios con **Jest**, organizada por patrón de diseño.

### Ejecutar tests

```bash
# Ejecución única con reporte detallado
npm test

# Modo vigilancia (re-ejecuta al guardar cambios)
npm run test:watch
```

### Resultado esperado

```
Test Suites: 5 passed, 5 total
Tests:       31 passed, 31 total
Time:        ~1s
```

### Cobertura por suite

| Suite | Tests | Qué se verifica |
|-------|-------|-----------------|
| `singleton.test.js` | 4 | Misma referencia entre módulos, propagación de cambios, datos iniciales |
| `observer.test.js` | 5 | Registro, remoción, notificación por umbral, múltiples observers |
| `strategy.test.js` | 7 | Cálculo estándar, descuento 10%, límite exacto de 3 productos, lista vacía |
| `factory.test.js` | 8 | Creación por tipo, valores por defecto, persistencia, error con tipo inválido |
| `facade.test.js` | 6 | Rechazo sin autorización, venta exitosa, selección de estrategia, descuento de stock |

### Ejemplo de test representativo

```javascript
// observer.test.js
test('observer ES notificado cuando stock cae por debajo del mínimo', () => {
  const mockObs = { actualizar: jest.fn(), constructor: { name: 'Mock' } };
  inventario.agregarObservador(mockObs);

  const p1 = db.productos.find(p => p.id === 'P1');
  p1.stock = 4;
  inventario.registrarSalida('P1', 2); // stock → 2 (por debajo del mínimo de 3)

  expect(mockObs.actualizar).toHaveBeenCalledWith('P1', 2);
});
```

---

## Diagramas UML

Los diagramas están en la carpeta `uml/` en formato **PlantUML** (`.puml`).

### Renderizar en VS Code

1. Instalar la extensión **PlantUML** (jebbs.plantuml)
2. Abrir cualquier archivo `.puml`
3. Presionar `Alt + D` para previsualizar
4. Click derecho → **Export Current Diagram** → seleccionar formato BMP/PNG/SVG

### Diagramas disponibles

| Archivo | Contenido |
|---------|-----------|
| `diagrama-clases.puml` | Diagrama de clases base — Unidad 2 |
| `diagrama-componentes.puml` | Diagrama de componentes base — Unidad 2 |
| `diagrama-clases-u4.puml` | Diagrama de clases con los 5 patrones GoF anotados |
| `diagrama-componentes-u4.puml` | Diagrama de componentes con capas Facade, Observer, Factory, Strategy, Singleton |

---

## Tecnologías

| Tecnología | Versión | Rol |
|------------|---------|-----|
| Node.js | ≥ 18 | Runtime |
| Express | ^4.18 | Framework HTTP / API REST |
| Winston | ^3.19 | Logger estructurado |
| Jest | ^30 | Framework de testing |
| PlantUML | — | Modelado UML |

---

## Resumen de Patrones GoF

| # | Patrón | Categoría | Archivo principal | Problema que resuelve |
|---|--------|-----------|-------------------|-----------------------|
| 1 | **Singleton** | Creacional | `db.js` | Una sola instancia de datos compartida |
| 2 | **Observer** | Comportamiento | `ComponenteInventario.js` | Notificación automática de stock bajo |
| 3 | **Strategy** | Comportamiento | `EstrategiaCalculo.js` | Algoritmos de cálculo intercambiables |
| 4 | **Factory Method** | Creacional | `EntregaFactory.js` | Creación de tipos de entrega sin acoplar |
| 5 | **Facade** | Estructural | `VentaFacade.js` | Interfaz simple sobre subsistemas complejos |

---

## Autor

**Alejandro De Mendoza**  
Maestría en Arquitectura de Software  
Temas Avanzados de Diseño de Software — Laboratorio No. 4  
2026
