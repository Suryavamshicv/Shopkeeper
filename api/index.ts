import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// --- VENDOR & INVENTORY REGISTRY ---
const VENDORS: Record<string, any> = {
  "REL-101": { name: "Reliance Fresh", location: "Mumbai South", color: "#2563eb" },
  "MOR-202": { name: "More Supermarket", location: "Bangalore East", color: "#16a34a" },
  "BB-303": { name: "BigBasket Store", location: "Delhi NCR", color: "#65a30d" }
};

// Mock API for Sending OTP
app.post("/api/auth/send-otp", async (req, res) => {
  const { mobile, storeId } = req.body;
  const vendor = VENDORS[storeId] || { name: "General Store" };
  console.log(`[SERVICE] Requesting OTP for +91${mobile} at ${vendor.name}`);
  
  // Simulate success
  setTimeout(() => {
    res.json({ success: true, message: "OTP sent successfully via Provider" });
  }, 1000);
});

// Mock API for Payment Receipt (WhatsApp/SMS)
app.post("/api/notify/receipt", async (req, res) => {
  const { mobile, orderId, amount } = req.body;
  console.log(`[SERVICE] Sending WhatsApp receipt to +91${mobile} for ₹${amount}`);
  res.json({ success: true });
});

// Mock API for Help Request
app.post("/api/help/request", (req, res) => {
  const { name, mobile, location } = req.body;
  console.log(`[SERVICE] Help requested by ${name} (+91${mobile}) at ${location}`);
  res.json({ success: true, message: "Staff alerted" });
});

export default app;
