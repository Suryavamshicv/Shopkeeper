import { Product } from '../types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Fresh Paneer (200g)',
    price: 85,
    category: 'Dairy',
    barcode: '4001',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format',
    description: 'Freshly made malai paneer, soft and creamy.'
  },
  {
    id: '2',
    name: 'Organic Alphonso Mangoes',
    price: 450,
    category: 'Produce',
    barcode: '4002',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&auto=format',
    description: 'Seasonal king of mangoes from Ratnagiri.'
  },
  {
    id: '3',
    name: 'Masala Chai Blend (250g)',
    price: 125,
    category: 'Beverage',
    barcode: '4003',
    image: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=400&auto=format',
    description: 'Fine Assam tea blend with ginger, cardamom and cloves.'
  },
  {
    id: '4',
    name: 'Basmati Rice Premium (1kg)',
    price: 180,
    category: 'Pantry',
    barcode: '4004',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format',
    description: 'Extra long grain aged basmati rice with rich aroma.'
  },
  {
    id: '5',
    name: 'Samosa Multipack (4 pcs)',
    price: 60,
    category: 'Snacks',
    barcode: '4005',
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb1ce24?w=400&auto=format',
    description: 'Crispy outer layer with spiced potato filling.'
  }
];
