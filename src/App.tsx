import React, { useState, useEffect } from 'react';
import { ShoppingBag, Scan, ShoppingCart, Plus, Minus, Trash2, ArrowRight, CheckCircle2, Store, CreditCard, ChevronRight, Download, FileText, Smartphone, Lock, ShieldCheck, Loader2, Send, X, MessageSquare, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GoogleGenAI } from "@google/genai";
import { Product, CartItem } from './types';
import { MOCK_PRODUCTS } from './data/mockProducts';
import Scanner from './components/Scanner';

export default function App() {

  /*const [storeId, setStoreId] = useState<string>('KPN-101');
  const [vendor, setVendor] = useState({ name: 'KPN Fresh', location: 'Banglore South', color: 'bg-blue-600' });
  */

  const [storeId, setStoreId] = useState<string>('');
  const [vendor, setVendor] = useState({ name: '', location: '', color: 'bg-blue-600' });
  
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const name = params.get('name');
    const loc = params.get('location');

    if (id) setStoreId(id);
    if (name || loc) {
      setVendor({
        name: name || 'Default Store',
        location: loc || 'Unknown Location',
        color: 'bg-blue-600'
      });
    }
  }, []);

    console.log("--- SHOPKEEPER LAUNCH INFO ---");
    console.log("SIMULATE QR LAUNCH BY ADDING '?store=ID' TO URL");
    console.log("VALID IDS: REL-101, MOR-202, BB-303");
    
    
    /*if (id) {
      setStoreId(id);
      // Simulate fetching vendor config from DB
      const configs: Record<string, any> = {
        'REL-101': { name: 'Reliance Fresh', location: 'Mumbai South', color: 'bg-blue-600' },
        'MOR-202': { name: 'More Store', location: 'Bangalore East', color: 'bg-green-600' },
        'BB-303': { name: 'BigBasket', location: 'Delhi NCR', color: 'bg-lime-600' }
      };
      if (configs[id]) setVendor(configs[id]);
    }
  }, []);*/

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [lastScanned, setLastScanned] = useState<Product | null>(null);
  const [step, setStep] = useState<'login' | 'otp' | 'welcome' | 'shopping' | 'checkout' | 'payment' | 'processing' | 'success'>('login');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'wallet' | null>(null);
  const [selectedUpiVendor, setSelectedUpiVendor] = useState<string | null>(null);
  const [cardDetails, setCardDetails] = useState({ number: '', cardName: '', expiry: '', cvv: '' });
  const [processingStatus, setProcessingStatus] = useState('Initiating payment...');
  
  // Login states
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isHelpRequested, setIsHelpRequested] = useState(false);
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [inputMessage, setInputMessage] = useState('');

  const addToCart = (product: Product) => {
    setCart((prev: CartItem[]) => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setLastScanned(product);
    setTimeout(() => setLastScanned(null), 3000);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev: CartItem[]) => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev: CartItem[]) => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleScan = async (barcode: string) => {
    // Log to server (terminal)
    try {
      await fetch('/api/scan/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode })
      });
    } catch (error) {
      console.error('Failed to log barcode to server:', error);
    }

    // Log to browser console as well
    console.log('Decoded barcode value: ${barcode}');
    console.log("Decoded barcode value 111111:", barcode);
    console.log("Looking up product for barcode 222222:", barcode);
    
    const product = MOCK_PRODUCTS.find(p => p.barcode === barcode);
    if (product) {
      console.log("inside handleScan, product found " , product.name);
      addToCart(product);
      setIsScannerOpen(false); 
      if ('vibrate' in navigator) navigator.vibrate(50);
      if (step === 'welcome') setStep('shopping');
    } 
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const date = new Date().toLocaleString();
      
      // Header Styling
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.text(vendor.name.toUpperCase(), 20, 25);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${vendor.name} • ${vendor.location}`, 20, 32);
      doc.text(`Digital Tax Invoice`, 20, 37);
      
      // Divider
      doc.line(20, 42, 190, 42);
      
      doc.text(`Customer: ${customerName.toUpperCase()}`, 20, 48);
      doc.text(`Mobile: +91 ${mobileNumber}`, 20, 53);
      doc.text(`Date: ${date}`, 20, 58);
      doc.text(`Receipt ID: SW-${Math.floor(Math.random() * 1000000)}`, 20, 63);
      
      // Table
      const tableData = cart.map(item => [
        item.name,
        String(item.quantity),
        `INR ${item.price.toFixed(2)}`,
        `INR ${(item.price * item.quantity).toFixed(2)}`
      ]);

      const subTotal = total;
      const gst = total * 0.05;
      const finalTotal = subTotal + gst;

      try {
        autoTable(doc, {
          startY: 70,
          head: [['Product Description', 'Qty', 'Unit Price', 'Amount']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
          styles: { font: 'helvetica', fontSize: 9 },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { halign: 'center' },
            2: { halign: 'right' },
            3: { halign: 'right' }
          }
        });
      } catch (tableErr) {
        console.error("AutoTable Error:", tableErr);
        // Fallback simple line
        doc.text("Items in basket: " + cart.length, 20, 80);
      }

      const finalY = (doc as any).lastAutoTable.finalY || 150;
      
      // Summary
      doc.setFont('helvetica', 'bold');
      doc.text('Total Subtotal:', 130, finalY + 15, { align: 'right' });
      doc.text(`INR ${subTotal.toFixed(2)}`, 190, finalY + 15, { align: 'right' });
      
      doc.setFont('helvetica', 'normal');
      doc.text('GST (5%):', 130, finalY + 22, { align: 'right' });
      doc.text(`INR ${gst.toFixed(2)}`, 190, finalY + 22, { align: 'right' });
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Grand Total:', 130, finalY + 35, { align: 'right' });
      doc.text(`INR ${finalTotal.toFixed(2)}`, 190, finalY + 35, { align: 'right' });
      
      // Footer
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(`Thank you for shopping at ${vendor.name}!`, 105, finalY + 55, { align: 'center' });
      doc.text('This is a computer generated invoice and does not require a physical signature.', 105, finalY + 60, { align: 'center' });

      doc.save(`Shopkeeper_Invoice_${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Billing generation failed. Check console for details.");
    }
  };

  const handleLogin = async () => {
    if (mobileNumber.length !== 10) return;
    setIsLoggingIn(true);
    
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: mobileNumber, storeId: storeId })
      });
      const data = await response.json();
      if (data.success) {
        setStep('otp');
      }
    } catch (err) {
      console.error("Auth Service Error", err);
      setStep('otp'); // Fallback for demo
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 4) return;
    setIsLoggingIn(true);
    
    try {
      // Production: this would check the backend session
      const response = await fetch('/api/auth/send-otp', { // Reusing for demo logic
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: mobileNumber, otp })
      });
      
      const data = await response.json();
      if (data.success) {
        setStep('welcome');
      }
    } catch (err) {
      console.warn("Auth verify fallback", err);
      setStep('welcome');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleHelpRequest = async () => {
    setIsBotOpen(true);
    if (chatMessages.length === 0) {
      setChatMessages([{ role: 'bot', text: `HEY ${customerName.split(' ')[0] || 'THERE'}! I'M YOUR SHOPKEEPER ASSISTANT. HOW CAN I HELP YOU SHOP FASTER TODAY?` }]);
    }
    
    // Original alert still goes to server for staff tracking
    try {
      fetch('/api/help/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: customerName, 
          mobile: mobileNumber,
          location: 'Zone A - Self Checkout'
        })
      });
    } catch (err) {
      console.warn("Help service fallback", err);
    }
  };

  const sendMessageToBot = async (text: string) => {
    if (!text.trim()) return;
    
    const newMessages = [...chatMessages, { role: 'user', text }];
    setChatMessages(newMessages as any);
    setIsBotTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: text,
        config: {
          systemInstruction: `You are Shopkeeper Support Bot. You help customers at ${vendor.name} (${vendor.location}). Be direct, helpful, and occasionally use ALL CAPS for important keywords to match the brutalist aesthetic. You know that milk is in Aisle 4, fruits are in Zone B, and payment includes UPI, Cards, and Wallets. If someone asks for a human, tell them a staff member is on their way but you can help in the meantime.`,
        },
      });

      const botResponse = response.text || "SORRY, I'M HAVING TROUBLE CONNECTING. TRY AGAIN?";
      setChatMessages([...newMessages, { role: 'bot', text: botResponse }] as any);
    } catch (err) {
      console.error("Gemini Error:", err);
      setChatMessages([...newMessages, { role: 'bot', text: "ERROR CONNECTING TO BRAIN. TRY AGAIN SOON." }] as any);
    } finally {
      setIsBotTyping(false);
    }
  };

  const handlePayment = () => {
    setStep('processing');
    const statuses = [
      'Connecting to Payment Gateway...',
      'Verifying Secure Channel...',
      'Gateway Response: AUTHORIZED',
      'Finalizing Transaction...',
      'Generating WhatsApp Receipt...'
    ];
    
    let currentStatus = 0;
    const interval = setInterval(async () => {
      if (currentStatus < statuses.length) {
        setProcessingStatus(statuses[currentStatus]);
        currentStatus++;
      } else {
        clearInterval(interval);
        
        // Call the notification service in the background
        try {
          const res = await fetch('/api/notify/receipt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              mobile: mobileNumber, 
              amount: (total * 1.05).toFixed(2),
              orderId: `SW-${Math.floor(Math.random() * 100010)}`,
              storeId: storeId 
            })
          });
          if (!res.ok) throw new Error(`Status: ${res.status}`);
        } catch (e) {
          console.warn("Notification Service fallback", e);
        }

        setStep('success');
      }
    }, 1200);
  };

  const total = cart.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-yellow-200">
      <AnimatePresence>
        {isScannerOpen && (
          <Scanner 
            onScan={handleScan} 
            onClose={() => setIsScannerOpen(false)} 
          />
        )}
      </AnimatePresence>

      <div className="max-w-md mx-auto min-h-screen bg-white flex flex-col relative border-x-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)]">
        
        {/* Support Bot Overlay */}
        <AnimatePresence>
          {isBotOpen && (
            <motion.div 
              initial={{ y: '100vw' }}
              animate={{ y: 0 }}
              exit={{ y: '100vw' }}
              className="absolute inset-x-0 bottom-0 top-0 z-[100] bg-zinc-50 flex flex-col"
            >
              <header className="h-20 border-b-4 border-black bg-white flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 flex items-center justify-center text-white">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-xl leading-none">SwiftBot</h3>
                    <p className="text-[10px] font-black uppercase opacity-40">AI Support Active</p>
                  </div>
                </div>
                <button onClick={() => setIsBotOpen(false)} className="w-10 h-10 brutalist-button bg-black text-white flex items-center justify-center">
                  <X size={20} />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 border-4 border-black ${msg.role === 'user' ? 'bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white shadow-[-4px_4px_0px_0px_rgba(0,0,0,1)]'}`}>
                      <p className="font-black text-sm leading-tight">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isBotTyping && (
                  <div className="flex justify-start">
                    <div className="p-4 border-4 border-black bg-zinc-200 animate-pulse">
                      <p className="font-black text-xs uppercase italic">Thinking...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-white border-t-4 border-black">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessageToBot(inputMessage);
                    setInputMessage('');
                  }}
                  className="flex gap-2"
                >
                  <input 
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="ASK SOMETHING..."
                    className="flex-1 border-4 border-black p-4 font-black uppercase outline-none"
                  />
                  <button type="submit" className="w-16 bg-black text-white border-4 border-black flex items-center justify-center brutalist-active">
                    <Send size={24} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header - Hidden on Login for cleaner focus */}
        {step !== 'login' && step !== 'otp' && (
          <header className="h-24 border-b-4 border-black flex items-center justify-between px-6 bg-white sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black flex items-center justify-center text-white font-black text-xl">S</div>
              <div>
                <h1 className="font-black text-2xl tracking-tighter uppercase leading-none">Shopkeeper™</h1>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">{vendor.name} • {vendor.location}</p>
              </div>
            </div>
            <button 
              onClick={() => setStep('shopping')}
              className={`w-12 h-12 brutalist-button ${vendor.color}`}
            >
              <ShoppingBag size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-black text-white text-[10px] flex items-center justify-center font-black border-2 border-white">
                  {cart.reduce((s: number, i: CartItem) => s + i.quantity, 0)}
                </span>
              )}
            </button>
          </header>
        )}

        <main className="flex-1 flex flex-col p-6 pb-40 overflow-x-hidden">
          {step === 'login' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col justify-center gap-8 py-12">
               <div className="w-20 h-20 bg-black flex items-center justify-center text-white font-black text-4xl mb-4">S</div>
               <h2 className="text-5xl font-black uppercase tracking-tighter leading-[0.9]">Start<br/>Session</h2>
               
               <p className="text-[10px] font-black uppercase opacity-60">Vendor: {vendor.name}</p>

               <div className="space-y-6">
                 <div className="relative border-4 border-black p-6 bg-white">
                    <p className="text-[10px] font-black uppercase opacity-40 mb-2">Customer Name</p>
                    <input 
                      type="text" 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="YOUR NAME"
                      className="w-full text-2xl font-black tracking-tight outline-none bg-transparent uppercase"
                    />
                 </div>
                 <div className="relative border-4 border-black p-6 bg-white">
                    <p className="text-[10px] font-black uppercase opacity-40 mb-2">Phone Number</p>
                    <div className="flex gap-4 items-center">
                       <span className="font-black text-2xl">+91</span>
                       <input 
                         type="tel" 
                         maxLength={10}
                         value={mobileNumber}
                         onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                         placeholder="MOBILE NUMBER"
                         className="flex-1 text-2xl font-black tracking-widest outline-none bg-transparent"
                       />
                    </div>
                 </div>
                 <button 
                   onClick={handleLogin}
                   disabled={mobileNumber.length !== 10 || !customerName.trim() || isLoggingIn}
                   className={`w-full h-20 brutalist-button text-2xl flex items-center gap-3 ${mobileNumber.length === 10 && customerName.trim() ? 'bg-blue-600 text-white' : 'bg-zinc-100 text-zinc-300'}`}
                 >
                   {isLoggingIn ? <Loader2 className="animate-spin" /> : 'Request OTP'}
                   <ArrowRight size={24} />
                 </button>
                 <p className="text-[10px] font-black uppercase opacity-40 text-center flex items-center justify-center gap-2">
                   <ShieldCheck size={12} />
                   Verified by SecurePay Alliance
                 </p>
               </div>
            </motion.div>
          )}

          {step === 'otp' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col justify-center gap-8 py-12">
               <h2 className="text-5xl font-black uppercase tracking-tighter leading-[0.9]">Verify<br/>OTP</h2>
               <p className="font-black uppercase text-xs opacity-50">Sent to +91 {mobileNumber}</p>
               <div className="space-y-6">
                 <div className="relative border-4 border-black p-6 bg-white">
                    <p className="text-[10px] font-black uppercase opacity-40 mb-2">One-Time Password</p>
                    <input 
                      type="text" 
                      maxLength={4}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="XXXX"
                      className="w-full text-4xl font-black tracking-[0.5em] outline-none text-center"
                    />
                 </div>
                 <button 
                   onClick={handleVerifyOtp}
                   disabled={otp.length !== 4 || isLoggingIn}
                   className={`w-full h-20 brutalist-button text-2xl flex items-center gap-3 ${otp.length === 4 ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-300'}`}
                 >
                   {isLoggingIn ? <Loader2 className="animate-spin" /> : 'Log In'}
                   <ChevronRight size={24} />
                 </button>
                 <button onClick={() => setStep('login')} className="w-full text-[10px] font-black uppercase underline">Change Mobile</button>
               </div>
            </motion.div>
          )}

          {step === 'welcome' && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="py-8 flex flex-col gap-10"
            >
              <h2 className="text-[80px] leading-[0.8] font-black uppercase tracking-tighter">
                READY,<br/>{customerName.split(' ')[0]}?
              </h2>
              
              <div className="p-8 border-4 border-black bg-zinc-100 flex flex-col gap-6">
                <p className="font-black uppercase text-sm tracking-tight leading-tight">
                  Seamlessly checkout without waiting in line. Scan as you shop and pay instantly via UPI or Card.
                </p>
                
                <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest">
                  <div className="w-3 h-3 bg-green-500"></div>
                  <span>System Active • RBI Compliant</span>
                </div>
              </div>

              <button 
                onClick={() => {
                  setIsScannerOpen(true);
                }}
                className="w-full h-24 brutalist-button bg-blue-600 text-white text-3xl shadow-[0px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                Start Shop
                <ArrowRight size={28} className="ml-4" />
              </button>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border-4 border-black">
                  <p className="text-[10px] font-black uppercase opacity-40 mb-1">Store ID</p>
                  <p className="font-black text-xl">{storeId}</p>
                </div>
                <button 
                  onClick={handleHelpRequest}
                  disabled={isHelpRequested}
                  className={`p-4 border-4 border-black transition-all ${isHelpRequested ? 'bg-zinc-200' : 'bg-yellow-400 active:translate-x-1 active:translate-y-1 active:shadow-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'}`}
                >
                  <p className="text-[10px] font-black uppercase opacity-40 mb-1">{isHelpRequested ? 'Status' : 'Help'}</p>
                  <p className="font-black text-xl uppercase italic">
                    {isHelpRequested ? 'Coming...' : 'Staff'}
                  </p>
                </button>
              </div>
            </motion.div>
          )}

          {step === 'shopping' && (
            <div className="flex flex-col flex-1">
              <div className="mb-10 flex justify-between items-end">
                <div>
                   <h2 className="text-6xl font-black uppercase tracking-tighter leading-none">Basket</h2>
                   <div className="h-2 w-20 bg-blue-600 mt-2"></div>
                </div>
                <button onClick={() => setIsScannerOpen(true)} className="flex items-center gap-2 font-black uppercase text-xs mb-1">
                  <Plus size={14} /> Scan item
                </button>
              </div>

              <div className="mb-6 grid grid-cols-5 gap-2 text-[10px] uppercase font-black">
                {MOCK_PRODUCTS.map(product => (
                  <button
                    key={product.id}
                    onClick={() => handleScan(product.barcode)}
                    className="border-4 border-black bg-zinc-100 px-2 py-3 text-center"
                  >
                    {product.barcode}
                  </button>
                ))}
              </div>

              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center border-4 border-dashed border-zinc-300 p-12 text-center">
                  <ShoppingCart size={64} className="mb-6 opacity-20" />
                  <p className="font-black uppercase text-xl leading-tight">Your basket is currently empty</p>
                  <button 
                    onClick={() => setIsScannerOpen(true)}
                    className="mt-8 text-blue-600 font-black uppercase tracking-wider text-sm flex items-center gap-2"
                  >
                    SCAN FIRST ITEM <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <AnimatePresence initial={false}>
                    {cart.map((item, idx) => (
                      <motion.div 
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col"
                      >
                         <div className="flex justify-between items-baseline mb-2">
                           <span className="text-[10px] font-black uppercase opacity-40">Item {String(idx + 1).padStart(2, '0')}</span>
                           <button onClick={() => removeFromCart(item.id)} className="text-[10px] font-black uppercase text-red-500 underline underline-offset-4">Remove</button>
                         </div>
                         <div className="p-4 border-4 border-black flex gap-4 bg-white relative">
                           <div className="w-20 h-20 border-2 border-black bg-zinc-50 flex-shrink-0">
                             <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                           </div>
                           <div className="flex-1 flex flex-col justify-between">
                             <div>
                               <h3 className="font-black uppercase text-xl tracking-tighter leading-tight truncate">{item.name}</h3>
                               <p className="font-black text-lg">₹{item.price.toFixed(2)}</p>
                             </div>
                             <div className="flex items-center gap-1 self-end mt-2">
                               <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 brutalist-button bg-zinc-100 text-xs">-</button>
                               <span className="w-10 text-center font-black text-sm">{item.quantity}</span>
                               <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 brutalist-button bg-black text-white text-xs">+</button>
                             </div>
                           </div>
                         </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}

          {step === 'checkout' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
              <h2 className="text-6xl font-black uppercase tracking-tighter leading-none mb-4">Pay</h2>
              
              <div className="flex flex-col border-4 border-black p-6 bg-black text-white shadow-[8px_8px_0px_0px_#2563eb]">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-8">Statement of Items</p>
                <div className="flex flex-col gap-4 mb-10">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-end border-b border-white/20 pb-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-black uppercase opacity-60">Qty {item.quantity}</span>
                        <span className="font-black text-xl uppercase tracking-tighter leading-none">{item.name}</span>
                      </div>
                      <span className="font-black text-2xl">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2">
                   <div className="flex justify-between font-black uppercase text-sm opacity-50">
                     <span>Subtotal</span>
                     <span>₹{total.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between font-black uppercase text-sm opacity-50">
                     <span>GST (5%)</span>
                     <span>₹{(total * 1.05 * 0.05).toFixed(2)}</span>
                   </div>
                   <div className="mt-4 flex justify-between items-end border-t-4 border-white pt-4">
                     <span className="text-xs font-black uppercase tracking-widest">Grand Total</span>
                     <span className="text-6xl font-black tracking-tighter leading-none">₹{(total * 1.05).toFixed(2)}</span>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => setStep('payment')}
                  className="h-24 brutalist-button bg-yellow-400 text-3xl shadow-[0px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  Confirm Items
                </button>
                <button 
                  onClick={() => setStep('shopping')}
                  className="font-black uppercase text-sm underline underline-offset-8 decoration-4"
                >
                  Back to trolley
                </button>
              </div>
            </motion.div>
          )}

          {step === 'payment' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-8">
              <h2 className="text-5xl font-black uppercase tracking-tighter leading-none mb-4">Select<br/>Payment</h2>
              
              <div className="flex flex-col gap-4">
                {/* Method Selection */}
                {!paymentMethod ? (
                  <>
                    {[
                      { id: 'upi', name: 'UPI Payments', sub: 'Instant via GPay, PhonePe, etc', color: 'bg-emerald-400' },
                      { id: 'card', name: 'Card Payment', sub: 'Visa, Mastercard, RuPay', color: 'bg-blue-400' },
                      { id: 'wallet', name: 'Digital Wallets', sub: 'Paytm, Amazon Pay', color: 'bg-zinc-200' }
                    ].map((p) => (
                      <button 
                        key={p.id}
                        onClick={() => setPaymentMethod(p.id as any)}
                        className="p-6 border-4 border-black text-left bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] brutalist-button"
                      >
                        <div className="w-full text-left">
                          <p className="font-black uppercase text-xl leading-none mb-1">{p.name}</p>
                          <p className="text-[10px] font-black uppercase opacity-60">{p.sub}</p>
                        </div>
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="flex flex-col gap-6">
                    <button 
                      onClick={() => { setPaymentMethod(null); setSelectedUpiVendor(null); }}
                      className="text-[10px] font-black uppercase underline self-start"
                    >
                      ← Change Method
                    </button>

                    {/* UPI Specifics */}
                    {paymentMethod === 'upi' && (
                      <div className="grid grid-cols-2 gap-4">
                        {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(vendor => (
                          <button 
                            key={vendor}
                            onClick={() => setSelectedUpiVendor(vendor)}
                            className={`p-4 border-4 border-black font-black uppercase text-sm ${selectedUpiVendor === vendor ? 'bg-emerald-400 translate-x-1 translate-y-1 shadow-none' : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}
                          >
                            {vendor}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Card Form */}
                    {paymentMethod === 'card' && (
                      <div className="space-y-4">
                        <div className="p-4 border-4 border-black bg-white">
                          <p className="text-[10px] font-black uppercase opacity-40 mb-1">Card Number</p>
                          <input 
                            type="text" 
                            placeholder="4444 4444 4444 4444"
                            maxLength={19}
                            className="w-full font-black text-lg outline-none"
                            value={cardDetails.number}
                            onChange={e => setCardDetails({...cardDetails, number: e.target.value.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ').trim()})}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 border-4 border-black bg-white">
                            <p className="text-[10px] font-black uppercase opacity-40 mb-1">Expiry</p>
                            <input 
                              type="text" 
                              placeholder="MM/YY"
                              maxLength={5}
                              className="w-full font-black text-lg outline-none"
                              value={cardDetails.expiry}
                              onChange={e => setCardDetails({...cardDetails, expiry: e.target.value})}
                            />
                          </div>
                          <div className="p-4 border-4 border-black bg-white">
                            <p className="text-[10px] font-black uppercase opacity-40 mb-1">CVV</p>
                            <input 
                              type="password" 
                              placeholder="***"
                              maxLength={3}
                              className="w-full font-black text-lg outline-none"
                              value={cardDetails.cvv}
                              onChange={e => setCardDetails({...cardDetails, cvv: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="p-4 border-4 border-black bg-white">
                          <p className="text-[10px] font-black uppercase opacity-40 mb-1">Name on Card</p>
                          <input 
                            type="text" 
                            placeholder="RAJESH KUMAR"
                            className="w-full font-black text-lg outline-none uppercase"
                            value={cardDetails.cardName}
                            onChange={e => setCardDetails({...cardDetails, cardName: e.target.value})}
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'wallet' && (
                      <div className="p-8 border-4 border-dashed border-black text-center bg-zinc-50">
                        <p className="font-black uppercase text-xl">Linking Amazon Pay...</p>
                        <p className="text-xs font-black opacity-40 mt-2">Active Wallet Balance: ₹4,500.00</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 mt-8">
                <button 
                  disabled={!paymentMethod || (paymentMethod === 'upi' && !selectedUpiVendor)}
                  onClick={handlePayment}
                  className={`h-24 brutalist-button text-3xl shadow-[0px_4px_0px_0px_rgba(0,0,0,1)] ${paymentMethod ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'}`}
                >
                  Pay ₹{(total * 1.05).toFixed(2)}
                </button>
                <button 
                  onClick={() => setStep('checkout')}
                  className="font-black uppercase text-sm underline underline-offset-8 decoration-4"
                >
                  Go Back
                </button>
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="relative w-48 h-48 mb-12">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-[12px] border-zinc-100 border-t-blue-600 shadow-xl"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                   <CreditCard size={48} className="text-zinc-200" />
                </div>
              </div>
              
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 leading-none">
                Processing<br/>Payment
              </h2>
              
              <div className="p-4 border-4 border-black bg-white inline-flex items-center gap-2">
                <motion.div 
                   animate={{ opacity: [0, 1, 0] }}
                   transition={{ duration: 1.5, repeat: Infinity }}
                   className="w-2 h-2 bg-emerald-500"
                />
                <span className="font-black uppercase text-xs tracking-widest">{processingStatus}</span>
              </div>

              <div className="mt-12 p-6 border-4 border-black bg-yellow-400 w-full text-left">
                <p className="text-[10px] font-black uppercase opacity-60 mb-2">Security Note</p>
                <p className="font-black text-xs leading-tight">Do not close this window or press the back button. Your transaction is being secured via 256-bit AES encryption.</p>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
              <div className="w-32 h-32 bg-green-500 border-8 border-black flex items-center justify-center text-white mb-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <CheckCircle2 size={64} strokeWidth={3} />
              </div>
              <h2 className="text-5xl font-black uppercase tracking-tighter mb-4 leading-none text-center">THANKS,<br/>{customerName.split(' ')[0]}!</h2>
              <p className="font-black uppercase text-sm text-zinc-500 mb-12">Auth: XC-9921-A</p>

              <div className="w-full border-4 border-black p-8 bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-zinc-100 p-4 border-2 border-black">
                     <span className="text-xs font-black uppercase">Receipt</span>
                     <span className="font-mono text-xs">#RF-992-01</span>
                  </div>
                  <p className="text-[10px] font-black uppercase opacity-60">Verified digital signature attached. Receipt also sent to +91 {mobileNumber}.</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={generatePDF}
                    className="h-16 brutalist-button bg-blue-600 text-white flex items-center gap-3"
                  >
                    <Download size={20} />
                    Download Bill
                  </button>
                  <button 
                    onClick={() => {
                      setCart([]);
                      setStep('welcome');
                    }}
                    className="h-16 brutalist-button bg-black text-white"
                  >
                    New Session
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </main>

        {/* Floating Scan Label */}
        <AnimatePresence>
          {step === 'shopping' && !isBotOpen && (
            <motion.button 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ rotate: 5 }}
              onClick={() => setIsBotOpen(true)}
              className="fixed bottom-32 right-8 z-50 w-14 h-14 bg-black text-white border-4 border-white shadow-[0px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center rounded-none"
            >
              <MessageSquare size={24} />
            </motion.button>
          )}

          {lastScanned && step === 'shopping' && (
            <motion.div 
              initial={{ y: 50, rotate: 2 }}
              animate={{ y: 0, rotate: -2 }}
              exit={{ y: 50, opacity: 0 }}
              className="fixed bottom-32 left-8 right-8 z-50 pointer-events-none"
            >
              <div className="bg-yellow-400 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4">
                <Plus size={24} strokeWidth={4} />
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase opacity-60">Scanned</p>
                  <p className="font-black uppercase tracking-tighter truncate">{lastScanned.name}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Navigation Bar */}
        {(step === 'shopping' || step === 'welcome') && !isScannerOpen && (
          <footer className="fixed bottom-0 left-0 right-0 z-40 px-6 py-8">
            <div className="max-w-md mx-auto grid grid-cols-[1fr_auto] gap-4">
               <button 
                 onClick={() => setIsScannerOpen(true)}
                 className="h-20 brutalist-button bg-white text-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
               >
                 <Scan size={24} className="mr-3" strokeWidth={3} />
                 Scan
               </button>
               {cart.length > 0 && (
                 <button 
                   onClick={() => setStep('checkout')}
                   className="h-20 w-20 brutalist-button bg-blue-600 text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                 >
                   <ArrowRight size={32} strokeWidth={3} />
                 </button>
               )}
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
