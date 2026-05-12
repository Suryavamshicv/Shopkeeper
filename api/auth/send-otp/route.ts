import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
// import { redis } from '@/lib/redis'; // Recommended for transient OTP storage

export async function POST(req: Request) {
  try {
    const { mobile, storeId } = await req.json();

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })

    // 1. Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Save to Database/Redis with an expiry (e.g., 5 minutes)
    // await redis.set(`otp:${mobile}`, otp, { ex: 300 });

    // 3. Send via SMS Provider
    // await smsProvider.send({ to: mobile, message: `Your code is ${otp}` });

    console.log(`OTP for ${mobile} at store ${storeId}: ${otp}`); // For debugging

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}