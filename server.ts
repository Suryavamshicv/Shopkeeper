import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Logging Middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

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
    
    /* 
       PRODUCTION CODE WOULD LOOK LIKE THIS:
       const response = await fetch('https://api.msg91.com/v5/otp', {
         method: 'POST',
         headers: { 'authkey': process.env.MSG91_AUTH_KEY },
         body: JSON.stringify({ mobile: `91${mobile}`, template_id: '...' })
       });
    */

    // Simulate success
    setTimeout(() => {
      res.json({ success: true, message: "OTP sent successfully via Provider" });
    }, 1000);
  });

  // Mock API for Payment Receipt (WhatsApp/SMS)
  app.post("/api/notify/receipt", async (req, res) => {
    const { mobile, orderId, amount } = req.body;
    console.log(`[SERVICE] Sending WhatsApp receipt to +91${mobile} for ₹${amount}`);
    
    /* 
       PRODUCTION CODE (e.g. WhatsApp via Twilio):
       client.messages.create({
         from: 'whatsapp:+14155238886',
         to: `whatsapp:+91${mobile}`,
         body: `Your Shopkeeper order ${orderId} for INR ${amount} was successful!`
       });
    */

    res.json({ success: true });
  });

  // Mock API for Help Request
  app.post("/api/help/request", (req, res) => {
    const { name, mobile, location } = req.body;
    console.log(`[SERVICE] Help requested by ${name} (+91${mobile}) at ${location}`);
    res.json({ success: true, message: "Staff alerted" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Shopkeeper Server running on http://localhost:${PORT}`);
  });
}

startServer();
