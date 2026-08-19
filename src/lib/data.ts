export type Pot = {
  id: string;
  name: string;
  price: number;
  color: string;
  shape: "round" | "tall" | "square" | "bowl";
};
export type Plant = {
  id: string;
  name: string;
  price: number;
  color: string;
  leafShape: "broad" | "narrow" | "round" | "spike";
};
export type Finish = { id: string; name: string; price: number; emoji: string };

export const POTS: Pot[] = [
  { id: "p1", name: "Terra Classic", price: 349, color: "#B5683E", shape: "round" },
  { id: "p2", name: "Sand Dune", price: 399, color: "#D9C39B", shape: "tall" },
  { id: "p3", name: "Forest Stone", price: 449, color: "#5C6E4A", shape: "square" },
  { id: "p4", name: "Cloud White", price: 379, color: "#EFEAE0", shape: "round" },
  { id: "p5", name: "Indigo Bloom", price: 489, color: "#3E4A75", shape: "bowl" },
  { id: "p6", name: "Charcoal Edge", price: 459, color: "#3A3A3A", shape: "tall" },
  { id: "p7", name: "Rose Clay", price: 419, color: "#C98674", shape: "round" },
  { id: "p8", name: "Mint Whisper", price: 429, color: "#A9C9B6", shape: "square" },
  { id: "p9", name: "Sun Ochre", price: 469, color: "#D29A4D", shape: "bowl" },
  { id: "p10", name: "Geo Prism", price: 529, color: "#8A7AAF", shape: "tall" },
];

export const PLANTS: Plant[] = [
  { id: "pl1", name: "Money Plant", price: 249, color: "#3E8E45", leafShape: "broad" },
  { id: "pl2", name: "Snake Plant", price: 299, color: "#3F6E3D", leafShape: "spike" },
  { id: "pl3", name: "Peace Lily", price: 349, color: "#4A8E54", leafShape: "broad" },
  { id: "pl4", name: "Jade Plant", price: 279, color: "#5DA56B", leafShape: "round" },
  { id: "pl5", name: "Aloe Vera", price: 229, color: "#7BAE78", leafShape: "spike" },
  { id: "pl6", name: "Areca Palm", price: 399, color: "#4F9B5A", leafShape: "narrow" },
  { id: "pl7", name: "Rubber Plant", price: 329, color: "#2F5C36", leafShape: "broad" },
  { id: "pl8", name: "Spider Plant", price: 259, color: "#85B47B", leafShape: "narrow" },
  { id: "pl9", name: "ZZ Plant", price: 379, color: "#356E3F", leafShape: "round" },
  { id: "pl10", name: "Tulsi (Holy Basil)", price: 199, color: "#65A05F", leafShape: "broad" },
];

export const FINISHES: Finish[] = [
  { id: "f1", name: "Love", price: 49, emoji: "💚" },
  { id: "f2", name: "Celebration", price: 59, emoji: "🎉" },
  { id: "f3", name: "Gratitude", price: 49, emoji: "🙏" },
  { id: "f4", name: "Blessing", price: 69, emoji: "✨" },
  { id: "f5", name: "Memory", price: 59, emoji: "🌸" },
  { id: "f6", name: "Friendship", price: 49, emoji: "🤝" },
  { id: "f7", name: "Wedding", price: 89, emoji: "💍" },
  { id: "f8", name: "Birthday", price: 79, emoji: "🎂" },
  { id: "f9", name: "Farewell", price: 69, emoji: "🌿" },
  { id: "f10", name: "New Home", price: 79, emoji: "🏡" },
];

export const OCCASIONS = [
  "Birthday",
  "Wedding",
  "Farewell",
  "Anniversary",
  "Housewarming",
  "Thank You",
  "Baby Shower",
  "Just Because",
  "Other (Custom Heading)",
];

export const THEMES = [
  { id: "t1", name: "Cream & Terracotta", bg: "#FBF6EC", accent: "#E4603C" },
  { id: "t2", name: "Golden Mustard", bg: "#FFFDF9", accent: "#EBC85A" },
  { id: "t3", name: "Soft Plum", bg: "#F4ECE0", accent: "#5C3A50" },
  { id: "t4", name: "Sunset Gold", bg: "#F8E6CB", accent: "#D29A4D" },
  { id: "t5", name: "Rose Clay", bg: "#F4E1DD", accent: "#B85D6E" },
];

export type Guest = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  street: string;
  pin: string;
  rsvp: "attending" | "declined" | "pending";
  invite: "not-sent" | "sent" | "viewed";
  delivery: "not-sent" | "transit" | "delivered" | "failed";
  lat?: number;
  lng?: number;
};

export const SAMPLE_GUESTS: Guest[] = [
  {
    id: "g1",
    firstName: "Ananya",
    lastName: "Sharma",
    email: "ananya@example.com",
    phone: "+91 98200 11111",
    city: "Mumbai",
    street: "12 Pali Hill",
    pin: "400050",
    rsvp: "attending",
    invite: "viewed",
    delivery: "delivered",
    lat: 19.07,
    lng: 72.84,
  },
  {
    id: "g2",
    firstName: "Rajan",
    lastName: "Mehta",
    email: "rajan@example.com",
    phone: "+91 98200 22222",
    city: "Delhi",
    street: "5 Hauz Khas",
    pin: "110016",
    rsvp: "pending",
    invite: "sent",
    delivery: "transit",
    lat: 28.55,
    lng: 77.2,
  },
  {
    id: "g3",
    firstName: "Meera",
    lastName: "Iyer",
    email: "meera@example.com",
    phone: "+91 98200 33333",
    city: "Bangalore",
    street: "44 Indiranagar",
    pin: "560038",
    rsvp: "attending",
    invite: "viewed",
    delivery: "delivered",
    lat: 12.97,
    lng: 77.64,
  },
  {
    id: "g4",
    firstName: "Karan",
    lastName: "Patel",
    email: "karan@example.com",
    phone: "+91 98200 44444",
    city: "Ahmedabad",
    street: "9 Bodakdev",
    pin: "380054",
    rsvp: "declined",
    invite: "viewed",
    delivery: "delivered",
    lat: 23.03,
    lng: 72.51,
  },
  {
    id: "g5",
    firstName: "Priya",
    lastName: "Nair",
    email: "priya@example.com",
    phone: "+91 98200 55555",
    city: "Chennai",
    street: "21 Adyar",
    pin: "600020",
    rsvp: "pending",
    invite: "sent",
    delivery: "transit",
    lat: 13.0,
    lng: 80.25,
  },
  {
    id: "g6",
    firstName: "Vikram",
    lastName: "Singh",
    email: "vikram@example.com",
    phone: "+91 98200 66666",
    city: "Pune",
    street: "7 Koregaon Park",
    pin: "411001",
    rsvp: "attending",
    invite: "viewed",
    delivery: "delivered",
    lat: 18.54,
    lng: 73.89,
  },
  {
    id: "g7",
    firstName: "Neha",
    lastName: "Kapoor",
    email: "neha@example.com",
    phone: "+91 98200 77777",
    city: "Hyderabad",
    street: "33 Banjara Hills",
    pin: "500034",
    rsvp: "pending",
    invite: "not-sent",
    delivery: "not-sent",
    lat: 17.41,
    lng: 78.45,
  },
  {
    id: "g8",
    firstName: "Arjun",
    lastName: "Reddy",
    email: "arjun@example.com",
    phone: "+91 98200 88888",
    city: "Kolkata",
    street: "11 Park Street",
    pin: "700016",
    rsvp: "declined",
    invite: "viewed",
    delivery: "failed",
    lat: 22.55,
    lng: 88.36,
  },
];

export const ACTIVITIES = [
  { id: "a1", text: "Ananya RSVP'd: Attending", time: "2 min ago", color: "#E4603C" },
  { id: "a2", text: "Karan's wish memory card posted", time: "8 min ago", color: "#E4603C" },
  { id: "a3", text: "Rajan's voice note uploaded", time: "21 min ago", color: "#D29A4D" },
  { id: "a4", text: "Invite viewed by Meera", time: "32 min ago", color: "#3D2436" },
  { id: "a5", text: "Karan RSVP'd: Declined", time: "1 hr ago", color: "#B85D6E" },
  { id: "a6", text: "Priya's memory photo added", time: "2 hrs ago", color: "#D29A4D" },
  { id: "a7", text: "Bulk invite sent to 8 guests", time: "3 hrs ago", color: "#E4603C" },
];

export type CuratedKeepsake = {
  id: string;
  name: string;
  description: string;
  pot: Pot;
  plant: Plant;
  finish: Finish;
  tagline: string;
  rating: number;
  badge?: string;
  occasion: string;
  image?: string;
};

export const CURATED_KEEPSAKES: CuratedKeepsake[] = [
  {
    id: "ck1",
    name: "The Prosperity Harmony",
    description:
      "Bring home wealth and good fortune with this lush, jade succulent nested in a gorgeous sun ochre glazed ceramic pot. Hand-tied with a golden Blessing tag.",
    pot: POTS.find((p) => p.id === "p9") || POTS[8],
    plant: PLANTS.find((p) => p.id === "pl4") || PLANTS[3],
    finish: FINISHES.find((f) => f.id === "f4") || FINISHES[3],
    tagline: "Ideal for milestone success & career growth",
    rating: 4.9,
    badge: "Best Seller",
    occasion: "Blessings",
    image: "/prosperity_harmony.png",
  },
  {
    id: "ck2",
    name: "Peace & Harmony Lily",
    description:
      "Elegant ivory white blooms of the Peace Lily paired with a satin smooth ivory cloud ceramic pot. Designed to bring harmony, serenity, and a gentle thank you into any home.",
    pot: POTS.find((p) => p.id === "p4") || POTS[3],
    plant: PLANTS.find((p) => p.id === "pl3") || PLANTS[2],
    finish: FINISHES.find((f) => f.id === "f3") || FINISHES[2],
    tagline: "Perfect expression of heartfelt thanks",
    rating: 4.8,
    occasion: "Thank You",
    image: "/peace_harmony_lily.png",
  },
  {
    id: "ck3",
    name: "The Wedding Eternal Bloom",
    description:
      "Symbolizing strong roots and growing in eternal union. Featuring a broad-leaf dark green Rubber Plant in a warm, romantic sunset rose clay pot, finished with a gold-accented Wedding tag.",
    pot: POTS.find((p) => p.id === "p7") || POTS[6],
    plant: PLANTS.find((p) => p.id === "pl7") || PLANTS[6],
    finish: FINISHES.find((f) => f.id === "f7") || FINISHES[6],
    tagline: "Nurturing love that grows stronger over time",
    rating: 5.0,
    badge: "Trending",
    occasion: "Wedding",
    image: "/wedding_eternal_bloom.png",
  },
  {
    id: "ck4",
    name: "Milestone Celebration",
    description:
      "Celebrate a beautiful new year in bloom! A vibrant, climbing money plant in a rich, starry indigo blue glazed ceramic pot, tied with a joyful Birthday badge.",
    pot: POTS.find((p) => p.id === "p5") || POTS[4],
    plant: PLANTS.find((p) => p.id === "pl1") || PLANTS[0],
    finish: FINISHES.find((f) => f.id === "f8") || FINISHES[7],
    tagline: "Vibrant and lively birthday surprise",
    rating: 4.7,
    badge: "Popular",
    occasion: "Birthday",
    image: "/milestone_celebration.png",
  },
  {
    id: "ck5",
    name: "Earthen Farewell Shield",
    description:
      "A resilient, air-purifying Snake Plant paired with a deep mossy forest stone slate pot. A beautiful parting gift wishing them deep roots on their next high flight.",
    pot: POTS.find((p) => p.id === "p3") || POTS[2],
    plant: PLANTS.find((p) => p.id === "pl2") || PLANTS[1],
    finish: FINISHES.find((f) => f.id === "f9") || FINISHES[8],
    tagline: "Sturdy companion for exciting new beginnings",
    rating: 4.9,
    occasion: "Farewell",
    image: "/earthen_farewell_shield.png",
  },
  {
    id: "ck6",
    name: "Sacred Healing Tulsi",
    description:
      "Infuse warm earthen blessings and health into a new home. Features a fragrant, sacred Tulsi plant in a raw handcrafted terracotta clay pot, hand-tied with a copper-finished New Home badge.",
    pot: POTS.find((p) => p.id === "p1") || POTS[0],
    plant: PLANTS.find((p) => p.id === "pl10") || PLANTS[9],
    finish: FINISHES.find((f) => f.id === "f10") || FINISHES[9],
    tagline: "Divine peace and health-giving vibes for new homes",
    rating: 4.8,
    occasion: "Housewarming",
    image: "/sacred_healing_tulsi.png",
  },
  {
    id: "ck7",
    name: "Areca Palm Sanctuary",
    description:
      "Welcome absolute warmth and tropical joy with a tall, vibrant Areca Palm housed in a soft botanical sage green pot. Complemented by a Friendship ribbon.",
    pot: POTS.find((p) => p.id === "p8") || POTS[7],
    plant: PLANTS.find((p) => p.id === "pl6") || PLANTS[5],
    finish: FINISHES.find((f) => f.id === "f6") || FINISHES[5],
    tagline: "Bright green fronds for bright friendships",
    rating: 4.9,
    badge: "Eco Pick",
    occasion: "Friendship",
    image: "/areca_palm_sanctuary.png",
  },
];
