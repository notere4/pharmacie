import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Models & In-Memory Data ---

interface Category {
  id: string;
  name: string;
  description: string;
  type: 'medicine' | 'material';
  created_at: string;
}

interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
}

interface Service {
  id: string;
  name: string;
  etage: string;
  note: string;
  created_at: string;
}

interface StockBatch {
  id: string;
  expiration_date: string;
  quantity: number;
  location: string;
  created_at: string;
}

interface Medicine {
  id: string;
  name: string;
  barcode: string;
  category_id: string | null;
  supplier_id: string | null;
  description: string;
  unit: string;
  min_stock_level: number;
  batch_number: string;
  location: string;
  created_at: string;
  updated_at: string;
  stocks: StockBatch[];
  latest_unit_price: number;
}

interface StockMovement {
  id: string;
  medicine_id: string;
  service_id?: string | null;
  service?: Service | null;
  type: 'entry' | 'exit';
  quantity: number;
  unit_price?: number;
  reference?: string;
  notes?: string;
  movement_date: string;
  created_at: string;
}

interface DeliveryNoteItem {
  id: string;
  medicine_id: string;
  medicine?: { id: string; name: string; barcode: string };
  lot?: string;
  expiration_date?: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface DeliveryNote {
  id: string;
  number: string;
  date: string;
  supplier_id: string;
  supplier?: Supplier;
  reference: string;
  notes: string;
  status: 'draft' | 'validated';
  total_value: number;
  created_at: string;
  items: DeliveryNoteItem[];
}

interface InvoiceItem {
  id: string;
  medicine_id: string;
  medicine?: { id: string; name: string; barcode: string };
  delivery_note_id?: string | null;
  delivery_note_number?: string | null;
  lot?: string;
  expiration_date?: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface Invoice {
  id: string;
  number: string;
  date: string;
  supplier_id: string;
  supplier?: Supplier;
  date_start?: string;
  date_end?: string;
  notes: string;
  status: 'draft' | 'validated';
  total_value: number;
  created_at: string;
  updated_at: string;
  items: InvoiceItem[];
}

// Initial Data
let categories: Category[] = [
  { id: 'cat-1', name: 'Antibiotiques', type: 'medicine', description: 'Médicaments antibiotiques', created_at: new Date().toISOString() },
  { id: 'cat-2', name: 'Antidouleurs', type: 'medicine', description: 'Médicaments contre la douleur et antipyrétiques', created_at: new Date().toISOString() },
  { id: 'cat-3', name: 'Matériel de pansement', type: 'material', description: 'Matériel pour soins, pansements et compresses', created_at: new Date().toISOString() },
  { id: 'cat-4', name: 'Vitamines', type: 'medicine', description: 'Compléments vitaminiques et minéraux', created_at: new Date().toISOString() },
  { id: 'cat-5', name: 'Matériel d\'injection', type: 'material', description: 'Seringues, aiguilles et perfuseurs', created_at: new Date().toISOString() },
];

let suppliers: Supplier[] = [
  { id: 'sup-1', name: 'PharmaPlus', contact_person: 'Jean Dupont', email: 'contact@pharmaplus.com', phone: '0612345678', address: '12 Rue de la Santé, Paris', created_at: new Date().toISOString() },
  { id: 'sup-2', name: 'MediCare Solutions', contact_person: 'Marie Martin', email: 'contact@medicare.com', phone: '0623456789', address: '45 Avenue Pasteur, Lyon', created_at: new Date().toISOString() },
  { id: 'sup-3', name: 'LaboPharma Dist', contact_person: 'Pierre Durand', email: 'contact@labopharma.com', phone: '0634567890', address: '8 Boulevard Médical, Marseille', created_at: new Date().toISOString() },
];

let services: Service[] = [
  { id: 'srv-1', name: 'Urgences', etage: 'RDC', note: 'Service des urgences générales', created_at: new Date().toISOString() },
  { id: 'srv-2', name: 'Pédiatrie', etage: '2ème étage', note: 'Soins enfants et nourrissons', created_at: new Date().toISOString() },
  { id: 'srv-3', name: 'Chirurgie', etage: '3ème étage', note: 'Bloc opératoire et hospitalisation chirurgie', created_at: new Date().toISOString() },
  { id: 'srv-4', name: 'Cardiologie', etage: '4ème étage', note: 'Unité soins intensifs cardio', created_at: new Date().toISOString() },
];

// Seed initial medicines
const formatDate = (daysAhead: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
};

let medicines: Medicine[] = [
  {
    id: 'med-1',
    name: 'Amoxicilline 500mg',
    barcode: '3400936284612',
    category_id: 'cat-1',
    supplier_id: 'sup-1',
    description: 'Antibiotique large spectre de la famille des bêta-lactamines',
    unit: 'boite',
    min_stock_level: 25,
    batch_number: 'B4821',
    location: 'Rayon A-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    latest_unit_price: 4.80,
    stocks: [
      { id: 'stk-1', expiration_date: formatDate(320), quantity: 80, location: 'Rayon A-1', created_at: new Date().toISOString() },
      { id: 'stk-2', expiration_date: formatDate(18), quantity: 15, location: 'Rayon A-1', created_at: new Date().toISOString() }, // expiring soon
    ],
  },
  {
    id: 'med-2',
    name: 'Paracétamol 1g',
    barcode: '3400936173923',
    category_id: 'cat-2',
    supplier_id: 'sup-1',
    description: 'Antalgique et antipyrétique de première intention',
    unit: 'boite',
    min_stock_level: 40,
    batch_number: 'B9102',
    location: 'Rayon A-2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    latest_unit_price: 2.10,
    stocks: [
      { id: 'stk-3', expiration_date: formatDate(450), quantity: 120, location: 'Rayon A-2', created_at: new Date().toISOString() },
    ],
  },
  {
    id: 'med-3',
    name: 'Ibuprofène 400mg',
    barcode: '3400935820491',
    category_id: 'cat-2',
    supplier_id: 'sup-2',
    description: 'Anti-inflammatoire non stéroïdien (AINS)',
    unit: 'boite',
    min_stock_level: 30,
    batch_number: 'B3041',
    location: 'Rayon A-3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    latest_unit_price: 3.50,
    stocks: [
      { id: 'stk-4', expiration_date: formatDate(200), quantity: 12, location: 'Rayon A-3', created_at: new Date().toISOString() }, // low stock
    ],
  },
  {
    id: 'med-4',
    name: 'Azithromycine 250mg',
    barcode: '3400937812904',
    category_id: 'cat-1',
    supplier_id: 'sup-3',
    description: 'Antibiotique de la classe des macrolides',
    unit: 'boite',
    min_stock_level: 20,
    batch_number: 'B7720',
    location: 'Rayon A-4',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    latest_unit_price: 11.20,
    stocks: [
      { id: 'stk-5', expiration_date: formatDate(150), quantity: 45, location: 'Rayon A-4', created_at: new Date().toISOString() },
    ],
  },
  {
    id: 'med-5',
    name: 'Compresses stériles 10x10',
    barcode: '3400938910238',
    category_id: 'cat-3',
    supplier_id: 'sup-2',
    description: 'Compresses de gaze hydrophile stériles pour pansements',
    unit: 'sachet',
    min_stock_level: 100,
    batch_number: 'B1123',
    location: 'Rayon B-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    latest_unit_price: 1.25,
    stocks: [
      { id: 'stk-6', expiration_date: formatDate(600), quantity: 250, location: 'Rayon B-1', created_at: new Date().toISOString() },
    ],
  },
  {
    id: 'med-6',
    name: 'Seringues stériles 5ml',
    barcode: '3400939023412',
    category_id: 'cat-5',
    supplier_id: 'sup-2',
    description: 'Seringues 3 pièces avec embout Luer lock',
    unit: 'pièce',
    min_stock_level: 150,
    batch_number: 'B8842',
    location: 'Rayon B-2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    latest_unit_price: 0.45,
    stocks: [
      { id: 'stk-7', expiration_date: formatDate(720), quantity: 400, location: 'Rayon B-2', created_at: new Date().toISOString() },
    ],
  },
  {
    id: 'med-7',
    name: 'Vitamine D3 1000UI',
    barcode: '3400935519827',
    category_id: 'cat-4',
    supplier_id: 'sup-3',
    description: 'Flacon compte-gouttes cholécalciférol',
    unit: 'flacon',
    min_stock_level: 20,
    batch_number: 'B4412',
    location: 'Rayon C-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    latest_unit_price: 6.80,
    stocks: [
      { id: 'stk-8', expiration_date: formatDate(25), quantity: 8, location: 'Rayon C-1', created_at: new Date().toISOString() }, // low & expiring soon
    ],
  },
  {
    id: 'med-8',
    name: 'Tramadol 50mg',
    barcode: '3400934120938',
    category_id: 'cat-2',
    supplier_id: 'sup-1',
    description: 'Antalgique opioïde de palier II',
    unit: 'boite',
    min_stock_level: 15,
    batch_number: 'B6109',
    location: 'Armoire sécurisée',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    latest_unit_price: 7.90,
    stocks: [
      { id: 'stk-9', expiration_date: formatDate(380), quantity: 35, location: 'Armoire sécurisée', created_at: new Date().toISOString() },
    ],
  },
];

const stockMovements: StockMovement[] = [
  {
    id: 'mov-1',
    medicine_id: 'med-1',
    type: 'entry',
    quantity: 95,
    unit_price: 4.80,
    reference: 'BL-2026-03-0001',
    notes: 'Réception fournisseur initiale',
    movement_date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'mov-2',
    medicine_id: 'med-2',
    type: 'entry',
    quantity: 120,
    unit_price: 2.10,
    reference: 'BL-2026-03-0001',
    notes: 'Réception fournisseur',
    movement_date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'mov-3',
    medicine_id: 'med-1',
    service_id: 'srv-1',
    service: services[0],
    type: 'exit',
    quantity: 5,
    unit_price: 4.80,
    reference: 'SORTIE-URG-01',
    notes: 'Dotation service urgences',
    movement_date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
];

let deliveryNotes: DeliveryNote[] = [
  {
    id: 'dn-1',
    number: 'BL-2026-03-0001',
    date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    supplier_id: 'sup-1',
    supplier: suppliers[0],
    reference: 'CMD-2026-881',
    notes: 'Livraison complète sans réserve',
    status: 'validated',
    total_value: 708.00,
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    items: [
      {
        id: 'dni-1',
        medicine_id: 'med-1',
        medicine: { id: 'med-1', name: 'Amoxicilline 500mg', barcode: '3400936284612' },
        lot: 'B4821',
        expiration_date: formatDate(320),
        quantity: 95,
        unit_price: 4.80,
        line_total: 456.00,
      },
      {
        id: 'dni-2',
        medicine_id: 'med-2',
        medicine: { id: 'med-2', name: 'Paracétamol 1g', barcode: '3400936173923' },
        lot: 'B9102',
        expiration_date: formatDate(450),
        quantity: 120,
        unit_price: 2.10,
        line_total: 252.00,
      },
    ],
  },
  {
    id: 'dn-2',
    number: 'BL-2026-04-0002',
    date: new Date().toISOString().slice(0, 10),
    supplier_id: 'sup-2',
    supplier: suppliers[1],
    reference: 'CMD-2026-902',
    notes: 'En attente de contrôle de réception',
    status: 'draft',
    total_value: 492.50,
    created_at: new Date().toISOString(),
    items: [
      {
        id: 'dni-3',
        medicine_id: 'med-5',
        medicine: { id: 'med-5', name: 'Compresses stériles 10x10', barcode: '3400938910238' },
        lot: 'B9921',
        expiration_date: formatDate(500),
        quantity: 250,
        unit_price: 1.25,
        line_total: 312.50,
      },
      {
        id: 'dni-4',
        medicine_id: 'med-6',
        medicine: { id: 'med-6', name: 'Seringues stériles 5ml', barcode: '3400939023412' },
        lot: 'B8842',
        expiration_date: formatDate(720),
        quantity: 400,
        unit_price: 0.45,
        line_total: 180.00,
      },
    ],
  },
];

let invoices: Invoice[] = [
  {
    id: 'inv-1',
    number: 'FAC-2026-001',
    date: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    supplier_id: 'sup-1',
    supplier: suppliers[0],
    date_start: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    date_end: new Date().toISOString().slice(0, 10),
    notes: 'Facture correspondante au BL-2026-03-0001',
    status: 'validated',
    total_value: 708.00,
    created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    items: [
      {
        id: 'invi-1',
        medicine_id: 'med-1',
        medicine: { id: 'med-1', name: 'Amoxicilline 500mg', barcode: '3400936284612' },
        delivery_note_id: 'dn-1',
        delivery_note_number: 'BL-2026-03-0001',
        lot: 'B4821',
        expiration_date: formatDate(320),
        quantity: 95,
        unit_price: 4.80,
        line_total: 456.00,
      },
      {
        id: 'invi-2',
        medicine_id: 'med-2',
        medicine: { id: 'med-2', name: 'Paracétamol 1g', barcode: '3400936173923' },
        delivery_note_id: 'dn-1',
        delivery_note_number: 'BL-2026-03-0001',
        lot: 'B9102',
        expiration_date: formatDate(450),
        quantity: 120,
        unit_price: 2.10,
        line_total: 252.00,
      },
    ],
  },
];

// Helper to calculate medicine total current stock
function getMedicineCurrentStock(med: Medicine): number {
  return (med.stocks || []).reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
}

function serializeMedicine(med: Medicine) {
  const current_stock = getMedicineCurrentStock(med);
  const cat = categories.find((c) => c.id === med.category_id) || null;
  const sup = suppliers.find((s) => s.id === med.supplier_id) || null;
  return {
    ...med,
    current_stock,
    unit_price: med.latest_unit_price || 0,
    category: cat,
    supplier: sup,
  };
}

const ALL_PERMISSIONS = [
  'inventory.view_medicine',
  'inventory.add_medicine',
  'inventory.change_medicine',
  'inventory.delete_medicine',
  'inventory.view_stockmovement',
  'inventory.add_stockmovement',
  'inventory.view_supplier',
  'inventory.add_supplier',
  'inventory.change_supplier',
  'inventory.delete_supplier',
  'inventory.view_deliverynote',
  'inventory.add_deliverynote',
  'inventory.change_deliverynote',
  'inventory.delete_deliverynote',
  'inventory.delete_validated_deliverynote',
  'inventory.view_invoice',
  'inventory.add_invoice',
  'inventory.change_invoice',
  'inventory.delete_invoice',
  'inventory.delete_validated_invoice',
  'inventory.view_category',
  'inventory.add_category',
  'inventory.change_category',
  'inventory.delete_category',
  'inventory.view_service',
  'inventory.add_service',
  'inventory.change_service',
  'inventory.delete_service',
  'auth.view_user',
  'auth.change_user',
  'auth.view_group',
  'auth.change_group',
];

async function startServer() {
  const app = express();
  const PORT = 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // --- Auth APIs ---
  app.post('/api/token/', (req, res) => {
    const { username } = req.body || {};
    const validUser = username || 'admin';
    const isStorekeeper = validUser.toLowerCase() === 'storekeeper';

    const userObj = {
      id: isStorekeeper ? 2 : 1,
      username: validUser,
      groups: isStorekeeper ? ['Storekeeper'] : ['Admin'],
      is_admin: !isStorekeeper,
      permissions: isStorekeeper
        ? ALL_PERMISSIONS.filter((p) => p.startsWith('inventory.view_'))
        : ALL_PERMISSIONS,
    };

    res.json({
      access: 'mock_jwt_access_token_' + Date.now(),
      refresh: 'mock_jwt_refresh_token_' + Date.now(),
      user: userObj,
    });
  });

  app.post('/api/token/refresh/', (_req, res) => {
    res.json({
      access: 'mock_jwt_access_token_' + Date.now(),
    });
  });

  app.get('/api/me/', (_req, res) => {
    res.json({
      user: {
        id: 1,
        username: 'admin',
        groups: ['Admin'],
        is_admin: true,
        permissions: ALL_PERMISSIONS,
      },
    });
  });

  // --- Categories API ---
  app.get('/api/categories/', (req, res) => {
    const { search, type } = req.query as { search?: string; type?: string };
    let list = [...categories];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q)));
    }
    if (type) {
      list = list.filter((c) => c.type === type);
    }
    res.json(list);
  });

  app.post('/api/categories/', (req, res) => {
    const { name, description, type } = req.body;
    const newCat: Category = {
      id: 'cat-' + Date.now(),
      name: name || 'Nouvelle Catégorie',
      description: description || '',
      type: type || 'medicine',
      created_at: new Date().toISOString(),
    };
    categories.push(newCat);
    res.status(201).json(newCat);
  });

  app.get('/api/categories/:id/', (req, res) => {
    const cat = categories.find((c) => c.id === req.params.id);
    if (!cat) return res.status(404).json({ detail: 'Not found' });
    res.json(cat);
  });

  app.patch('/api/categories/:id/', (req, res) => {
    const cat = categories.find((c) => c.id === req.params.id);
    if (!cat) return res.status(404).json({ detail: 'Not found' });
    Object.assign(cat, req.body);
    res.json(cat);
  });

  app.delete('/api/categories/:id/', (req, res) => {
    categories = categories.filter((c) => c.id !== req.params.id);
    res.status(204).send();
  });

  // --- Suppliers API ---
  app.get('/api/suppliers/', (_req, res) => {
    res.json(suppliers);
  });

  app.post('/api/suppliers/', (req, res) => {
    const newSup: Supplier = {
      id: 'sup-' + Date.now(),
      name: req.body.name || 'Fournisseur',
      contact_person: req.body.contact_person || '',
      email: req.body.email || '',
      phone: req.body.phone || '',
      address: req.body.address || '',
      created_at: new Date().toISOString(),
    };
    suppliers.push(newSup);
    res.status(201).json(newSup);
  });

  app.get('/api/suppliers/:id/', (req, res) => {
    const sup = suppliers.find((s) => s.id === req.params.id);
    if (!sup) return res.status(404).json({ detail: 'Not found' });
    res.json(sup);
  });

  app.patch('/api/suppliers/:id/', (req, res) => {
    const sup = suppliers.find((s) => s.id === req.params.id);
    if (!sup) return res.status(404).json({ detail: 'Not found' });
    Object.assign(sup, req.body);
    res.json(sup);
  });

  app.delete('/api/suppliers/:id/', (req, res) => {
    suppliers = suppliers.filter((s) => s.id !== req.params.id);
    res.status(204).send();
  });

  // --- Services API ---
  app.get('/api/services/', (_req, res) => {
    res.json(services);
  });

  app.post('/api/services/', (req, res) => {
    const newSrv: Service = {
      id: 'srv-' + Date.now(),
      name: req.body.name || 'Nouveau service',
      etage: req.body.etage || '',
      note: req.body.note || '',
      created_at: new Date().toISOString(),
    };
    services.push(newSrv);
    res.status(201).json(newSrv);
  });

  app.get('/api/services/:id/', (req, res) => {
    const srv = services.find((s) => s.id === req.params.id);
    if (!srv) return res.status(404).json({ detail: 'Not found' });
    res.json(srv);
  });

  app.patch('/api/services/:id/', (req, res) => {
    const srv = services.find((s) => s.id === req.params.id);
    if (!srv) return res.status(404).json({ detail: 'Not found' });
    Object.assign(srv, req.body);
    res.json(srv);
  });

  app.delete('/api/services/:id/', (req, res) => {
    services = services.filter((s) => s.id !== req.params.id);
    res.status(204).send();
  });

  // --- Medicines API ---
  app.get('/api/medicines/all/', (_req, res) => {
    res.json(medicines.map(serializeMedicine));
  });

  app.get('/api/medicines/low_stock/', (_req, res) => {
    const low = medicines
      .filter((m) => getMedicineCurrentStock(m) <= m.min_stock_level)
      .map(serializeMedicine);
    res.json(low);
  });

  app.get('/api/medicines/expiring_soon/', (_req, res) => {
    const today = new Date();
    const in30Days = new Date();
    in30Days.setDate(today.getDate() + 30);

    const todayStr = today.toISOString().slice(0, 10);
    const in30Str = in30Days.toISOString().slice(0, 10);

    const expiring = medicines
      .filter((m) =>
        (m.stocks || []).some(
          (s) => s.quantity > 0 && s.expiration_date >= todayStr && s.expiration_date <= in30Str
        )
      )
      .map(serializeMedicine);
    res.json(expiring);
  });

  app.get('/api/medicines/:id/stocks/', (req, res) => {
    const med = medicines.find((m) => m.id === req.params.id);
    if (!med) return res.status(404).json({ detail: 'Not found' });
    res.json(med.stocks || []);
  });

  app.get('/api/medicines/:id/', (req, res) => {
    const med = medicines.find((m) => m.id === req.params.id);
    if (!med) return res.status(404).json({ detail: 'Not found' });
    res.json(serializeMedicine(med));
  });

  app.get('/api/medicines/', (req, res) => {
    const { search, category_id, supplier_id, page = 1, page_size = 25 } = req.query as any;
    let list = [...medicines];

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.barcode && m.barcode.toLowerCase().includes(q)) ||
          (m.batch_number && m.batch_number.toLowerCase().includes(q)) ||
          (m.description && m.description.toLowerCase().includes(q))
      );
    }
    if (category_id) {
      list = list.filter((m) => m.category_id === category_id);
    }
    if (supplier_id) {
      list = list.filter((m) => m.supplier_id === supplier_id);
    }

    const count = list.length;
    const p = Math.max(1, parseInt(page, 10) || 1);
    const ps = Math.max(1, parseInt(page_size, 10) || 25);
    const start = (p - 1) * ps;
    const paginated = list.slice(start, start + ps).map(serializeMedicine);

    res.json({
      count,
      next: start + ps < count ? `/medicines/?page=${p + 1}` : null,
      previous: p > 1 ? `/medicines/?page=${p - 1}` : null,
      results: paginated,
    });
  });

  app.post('/api/medicines/', (req, res) => {
    const body = req.body;
    const newMed: Medicine = {
      id: 'med-' + Date.now(),
      name: body.name || 'Nouveau médicament',
      barcode: body.barcode || String(Math.floor(1000000000000 + Math.random() * 9000000000000)),
      category_id: body.category_id || null,
      supplier_id: body.supplier_id || null,
      description: body.description || '',
      unit: body.unit || 'boite',
      min_stock_level: Number(body.min_stock_level) || 10,
      batch_number: body.batch_number || `B${Math.floor(1000 + Math.random() * 9000)}`,
      location: body.location || 'Rayon A',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      stocks: [],
      latest_unit_price: Number(body.unit_price) || 0,
    };
    medicines.unshift(newMed);
    res.status(201).json(serializeMedicine(newMed));
  });

  app.patch('/api/medicines/:id/', (req, res) => {
    const med = medicines.find((m) => m.id === req.params.id);
    if (!med) return res.status(404).json({ detail: 'Not found' });
    Object.assign(med, req.body, { updated_at: new Date().toISOString() });
    res.json(serializeMedicine(med));
  });

  app.delete('/api/medicines/:id/', (req, res) => {
    medicines = medicines.filter((m) => m.id !== req.params.id);
    res.status(204).send();
  });

  // --- Stock Movements API ---
  app.get('/api/stock-movements/', (req, res) => {
    const { medicine_id, type } = req.query as { medicine_id?: string; type?: string };
    let list = [...stockMovements];
    if (medicine_id) {
      list = list.filter((m) => m.medicine_id === medicine_id);
    }
    if (type) {
      list = list.filter((m) => m.type === type);
    }
    res.json(list);
  });

  app.post('/api/stock-movements/', (req, res) => {
    const {
      medicine_id,
      type,
      quantity,
      expiration_date,
      unit_price,
      service_id,
      location,
      reference,
      notes,
    } = req.body;

    const med = medicines.find((m) => m.id === medicine_id);
    if (!med) return res.status(404).json({ detail: 'Médicament non trouvé' });

    const qty = Number(quantity);
    if (qty <= 0) return res.status(400).json({ detail: 'Quantité invalide' });

    const srv = service_id ? services.find((s) => s.id === service_id) : null;

    if (type === 'exit') {
      const currentStock = getMedicineCurrentStock(med);
      if (qty > currentStock) {
        return res.status(400).json({ detail: `Stock insuffisant. Disponible : ${currentStock}` });
      }

      // Decrement stock batch
      let remainingToDeduct = qty;
      for (const batch of med.stocks) {
        if (remainingToDeduct <= 0) break;
        if (expiration_date && batch.expiration_date !== expiration_date) continue;
        const deduct = Math.min(batch.quantity, remainingToDeduct);
        batch.quantity -= deduct;
        remainingToDeduct -= deduct;
      }
      med.stocks = med.stocks.filter((b) => b.quantity > 0);
    } else {
      // Entry
      const expDate = expiration_date || formatDate(365);
      const existingBatch = med.stocks.find(
        (b) => b.expiration_date === expDate && (!location || b.location === location)
      );
      if (existingBatch) {
        existingBatch.quantity += qty;
      } else {
        med.stocks.push({
          id: 'stk-' + Date.now(),
          expiration_date: expDate,
          quantity: qty,
          location: location || med.location || 'Rayon A',
          created_at: new Date().toISOString(),
        });
      }
      if (unit_price != null) {
        med.latest_unit_price = Number(unit_price);
      }
    }

    const movement: StockMovement = {
      id: 'mov-' + Date.now(),
      medicine_id,
      service_id: service_id || null,
      service: srv || null,
      type,
      quantity: qty,
      unit_price: unit_price != null ? Number(unit_price) : med.latest_unit_price,
      reference: reference || (type === 'entry' ? 'ENTREE-MAN' : 'SORTIE-MAN'),
      notes: notes || '',
      movement_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    stockMovements.unshift(movement);
    res.status(201).json(movement);
  });

  // --- Delivery Notes API ---
  app.get('/api/delivery-notes/', (req, res) => {
    const { search, supplier_id, status } = req.query as any;
    let list = [...deliveryNotes];
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (n) =>
          n.number.toLowerCase().includes(q) ||
          (n.reference && n.reference.toLowerCase().includes(q)) ||
          (n.supplier && n.supplier.name.toLowerCase().includes(q))
      );
    }
    if (supplier_id) {
      list = list.filter((n) => n.supplier_id === supplier_id);
    }
    if (status) {
      list = list.filter((n) => n.status === status);
    }
    res.json(list);
  });

  app.get('/api/delivery-notes/:id/', (req, res) => {
    const note = deliveryNotes.find((n) => n.id === req.params.id);
    if (!note) return res.status(404).json({ detail: 'Not found' });
    res.json(note);
  });

  app.post('/api/delivery-notes/', (req, res) => {
    const { number, date, supplier_id, reference, notes: noteText, items = [] } = req.body;
    const sup = suppliers.find((s) => s.id === supplier_id);

    const generatedNumber =
      number ||
      `BL-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(
        deliveryNotes.length + 1
      ).padStart(4, '0')}`;

    const parsedItems: DeliveryNoteItem[] = items.map((it: any) => {
      const med = medicines.find((m) => m.id === it.medicine_id);
      const q = Number(it.quantity) || 1;
      const up = Number(it.unit_price) || 0;
      return {
        id: 'dni-' + Math.random().toString(36).slice(2, 9),
        medicine_id: it.medicine_id,
        medicine: med ? { id: med.id, name: med.name, barcode: med.barcode } : undefined,
        lot: it.lot || '',
        expiration_date: it.expiration_date || formatDate(365),
        quantity: q,
        unit_price: up,
        line_total: q * up,
      };
    });

    const total_value = parsedItems.reduce((acc, it) => acc + it.line_total, 0);

    const note: DeliveryNote = {
      id: 'dn-' + Date.now(),
      number: generatedNumber,
      date: date || new Date().toISOString().slice(0, 10),
      supplier_id,
      supplier: sup,
      reference: reference || '',
      notes: noteText || '',
      status: 'draft',
      total_value,
      created_at: new Date().toISOString(),
      items: parsedItems,
    };

    deliveryNotes.unshift(note);
    res.status(201).json(note);
  });

  app.patch('/api/delivery-notes/:id/', (req, res) => {
    const note = deliveryNotes.find((n) => n.id === req.params.id);
    if (!note) return res.status(404).json({ detail: 'Not found' });
    if (note.status === 'validated') {
      return res.status(400).json({ detail: 'Un bon validé ne peut pas être modifié' });
    }

    const { items, supplier_id, ...rest } = req.body;
    Object.assign(note, rest);

    if (supplier_id) {
      note.supplier_id = supplier_id;
      note.supplier = suppliers.find((s) => s.id === supplier_id);
    }

    if (items) {
      note.items = items.map((it: any) => {
        const med = medicines.find((m) => m.id === it.medicine_id);
        const q = Number(it.quantity) || 1;
        const up = Number(it.unit_price) || 0;
        return {
          id: it.id || 'dni-' + Math.random().toString(36).slice(2, 9),
          medicine_id: it.medicine_id,
          medicine: med ? { id: med.id, name: med.name, barcode: med.barcode } : undefined,
          lot: it.lot || '',
          expiration_date: it.expiration_date || formatDate(365),
          quantity: q,
          unit_price: up,
          line_total: q * up,
        };
      });
      note.total_value = note.items.reduce((acc, it) => acc + it.line_total, 0);
    }

    res.json(note);
  });

  app.delete('/api/delivery-notes/:id/', (req, res) => {
    deliveryNotes = deliveryNotes.filter((n) => n.id !== req.params.id);
    res.status(204).send();
  });

  app.post('/api/delivery-notes/:id/validate/', (req, res) => {
    const note = deliveryNotes.find((n) => n.id === req.params.id);
    if (!note) return res.status(404).json({ detail: 'Not found' });
    if (note.status === 'validated') {
      return res.status(400).json({ detail: 'Déjà validé' });
    }

    // Add stock movements and batches for each item
    for (const item of note.items) {
      const med = medicines.find((m) => m.id === item.medicine_id);
      if (med) {
        const exp = item.expiration_date || formatDate(365);
        const existingBatch = med.stocks.find((s) => s.expiration_date === exp);
        if (existingBatch) {
          existingBatch.quantity += item.quantity;
        } else {
          med.stocks.push({
            id: 'stk-' + Date.now() + Math.random().toString(36).slice(2, 6),
            expiration_date: exp,
            quantity: item.quantity,
            location: med.location || 'Rayon A',
            created_at: new Date().toISOString(),
          });
        }
        med.latest_unit_price = item.unit_price;

        stockMovements.unshift({
          id: 'mov-' + Date.now() + Math.random().toString(36).slice(2, 6),
          medicine_id: med.id,
          type: 'entry',
          quantity: item.quantity,
          unit_price: item.unit_price,
          reference: `BL ${note.number}`,
          notes: note.notes || '',
          movement_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });
      }
    }

    note.status = 'validated';
    res.json(note);
  });

  // --- Invoices API ---
  app.get('/api/invoices/', (req, res) => {
    const { search, supplier_id, status } = req.query as any;
    let list = [...invoices];
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (inv) =>
          inv.number.toLowerCase().includes(q) ||
          (inv.supplier && inv.supplier.name.toLowerCase().includes(q))
      );
    }
    if (supplier_id) {
      list = list.filter((inv) => inv.supplier_id === supplier_id);
    }
    if (status) {
      list = list.filter((inv) => inv.status === status);
    }
    res.json(list);
  });

  app.get('/api/invoices/:id/', (req, res) => {
    const inv = invoices.find((i) => i.id === req.params.id);
    if (!inv) return res.status(404).json({ detail: 'Not found' });
    res.json(inv);
  });

  app.post('/api/invoices/', (req, res) => {
    const { number, date, supplier_id, date_start, date_end, notes, items = [] } = req.body;
    const sup = suppliers.find((s) => s.id === supplier_id);

    const generatedNumber =
      number ||
      `FAC-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`;

    const parsedItems: InvoiceItem[] = items.map((it: any) => {
      const med = medicines.find((m) => m.id === it.medicine_id);
      const dn = deliveryNotes.find((d) => d.id === it.delivery_note_id);
      const q = Number(it.quantity) || 1;
      const up = Number(it.unit_price) || 0;
      return {
        id: 'invi-' + Math.random().toString(36).slice(2, 9),
        medicine_id: it.medicine_id,
        medicine: med ? { id: med.id, name: med.name, barcode: med.barcode } : undefined,
        delivery_note_id: it.delivery_note_id || null,
        delivery_note_number: dn?.number || it.delivery_note_number || null,
        lot: it.lot || '',
        expiration_date: it.expiration_date || formatDate(365),
        quantity: q,
        unit_price: up,
        line_total: q * up,
      };
    });

    const total_value = parsedItems.reduce((acc, it) => acc + it.line_total, 0);

    const invoice: Invoice = {
      id: 'inv-' + Date.now(),
      number: generatedNumber,
      date: date || new Date().toISOString().slice(0, 10),
      supplier_id,
      supplier: sup,
      date_start: date_start || '',
      date_end: date_end || '',
      notes: notes || '',
      status: 'draft',
      total_value,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: parsedItems,
    };

    invoices.unshift(invoice);
    res.status(201).json(invoice);
  });

  app.patch('/api/invoices/:id/', (req, res) => {
    const inv = invoices.find((i) => i.id === req.params.id);
    if (!inv) return res.status(404).json({ detail: 'Not found' });
    if (inv.status === 'validated') {
      return res.status(400).json({ detail: 'Une facture validée ne peut pas être modifiée' });
    }

    const { items, supplier_id, ...rest } = req.body;
    Object.assign(inv, rest, { updated_at: new Date().toISOString() });

    if (supplier_id) {
      inv.supplier_id = supplier_id;
      inv.supplier = suppliers.find((s) => s.id === supplier_id);
    }

    if (items) {
      inv.items = items.map((it: any) => {
        const med = medicines.find((m) => m.id === it.medicine_id);
        const dn = deliveryNotes.find((d) => d.id === it.delivery_note_id);
        const q = Number(it.quantity) || 1;
        const up = Number(it.unit_price) || 0;
        return {
          id: it.id || 'invi-' + Math.random().toString(36).slice(2, 9),
          medicine_id: it.medicine_id,
          medicine: med ? { id: med.id, name: med.name, barcode: med.barcode } : undefined,
          delivery_note_id: it.delivery_note_id || null,
          delivery_note_number: dn?.number || it.delivery_note_number || null,
          lot: it.lot || '',
          expiration_date: it.expiration_date || formatDate(365),
          quantity: q,
          unit_price: up,
          line_total: q * up,
        };
      });
      inv.total_value = inv.items.reduce((acc, it) => acc + it.line_total, 0);
    }

    res.json(inv);
  });

  app.delete('/api/invoices/:id/', (req, res) => {
    invoices = invoices.filter((i) => i.id !== req.params.id);
    res.status(204).send();
  });

  app.post('/api/invoices/:id/validate/', (req, res) => {
    const inv = invoices.find((i) => i.id === req.params.id);
    if (!inv) return res.status(404).json({ detail: 'Not found' });
    inv.status = 'validated';
    res.json(inv);
  });

  // --- Static & Frontend Serving ---
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    app.use(async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.use((_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MedStock Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
