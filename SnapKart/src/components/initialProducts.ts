import { Product } from "../types";

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-keyb-001",
    name: "AeroTouch Mechanical Keyboard",
    description: "Ultra-compact 65% wireless mechanical keyboard featuring sound-dampening gasket mounts, hot-swappable tactile switches, and premium frosted polycarbonate housing.",
    price: 129.00,
    wholesalePrice: 58.00,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    inventory: 142,
    category: "Tech & Gadgets",
    createdAt: "2026-06-20T10:00:00Z",
    createdBy: "system"
  },
  {
    id: "prod-organizer-002",
    name: "Bamboo Grid Desk Organizer",
    description: "Minimalist desk shelving unit milled from sustainable organic bamboo. Modular magnetic compartments designed to dock smart devices, writing instruments, and notes.",
    price: 49.00,
    wholesalePrice: 19.50,
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80",
    inventory: 230,
    category: "Aesthetic Home",
    createdAt: "2026-06-21T11:00:00Z",
    createdBy: "system"
  },
  {
    id: "prod-flask-003",
    name: "Lumina Matte Borosilicate Flask",
    description: "Double-walled thermal borosilicate glass bottle wrapped in a textured, grippy matte silicone sleeve. Retains temperature for up to 12 hours with a leakproof wooden lid.",
    price: 34.00,
    wholesalePrice: 12.00,
    inventory: 85,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
    category: "Fitness & Wellness",
    createdAt: "2026-06-22T08:30:00Z",
    createdBy: "system"
  },
  {
    id: "prod-backpack-004",
    name: "Zenith Waterproof Rolltop Backpack",
    description: "Weatherproof 22L commuter rolltop backpack constructed from durable recycled ocean plastics. Features a dedicated 16-inch padded laptop pocket and hidden luggage strap.",
    price: 95.00,
    wholesalePrice: 38.00,
    inventory: 110,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    category: "Minimal Apparel",
    createdAt: "2026-06-23T09:15:00Z",
    createdBy: "system"
  },
  {
    id: "prod-charger-005",
    name: "VoltDock 3-in-1 Magnetic Charger",
    description: "Elegant sandblasted aluminum multi-device charging stand. Wirelessly powers your smartphone, smart watch, and earbuds simultaneously with a single neat cable.",
    price: 79.00,
    wholesalePrice: 31.00,
    inventory: 96,
    image: "https://images.unsplash.com/photo-1622445262465-2481c4574875?auto=format&fit=crop&w=800&q=80",
    category: "Tech & Gadgets",
    createdAt: "2026-06-24T14:40:00Z",
    createdBy: "system"
  },
  {
    id: "prod-lamp-006",
    name: "Aura Ambient Sunset Lamp",
    description: "Aesthetic optical light projector creating natural-looking warm solar gradients. Features 16 adjustable hue presets controlled via a subtle touch dial.",
    price: 38.00,
    wholesalePrice: 14.50,
    inventory: 175,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    category: "Aesthetic Home",
    createdAt: "2026-06-25T16:20:00Z",
    createdBy: "system"
  }
];
