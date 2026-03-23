"use client"

import Link from "next/link"
import { StatusBar } from "@/components/layout/mobile-shell"

export function OnboardingScreen() {
  return (
    <div className="min-h-screen flex flex-col">
      <StatusBar variant="dark" />
      <div 
        className="flex-1 flex flex-col justify-between px-7 py-9"
        style={{
          background: "linear-gradient(165deg, #0C1A0E 0%, #1a3020 50%, #0c1a0e 100%)"
        }}
      >
        {/* Hero Content */}
        <div className="animate-fade-up" style={{ animationDelay: "0.05s" }}>
          {/* Logo */}
          <div 
            className="w-[72px] h-[72px] rounded-[22px] bg-primary flex items-center justify-center mb-5"
            style={{ boxShadow: "0 8px 32px rgba(27,107,58,.5)" }}
          >
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M18 4L32 12V24L18 32L4 24V12L18 4Z" stroke="#fff" strokeWidth="2" fill="none"/>
              <path d="M18 4L18 32M4 12L32 12M4 24L32 24" stroke="#fff" strokeWidth="1.5" opacity=".4"/>
              <circle cx="18" cy="18" r="4" fill="#fff"/>
            </svg>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-[38px] font-bold text-white leading-[1.05] tracking-tight mb-3.5">
            Buy & sell<br/>
            <em className="text-[#4ade80]">near you.</em><br/>
            Safely.
          </h1>
          
          <p className="text-[15px] text-white/45 leading-[1.75] max-w-[300px]">
            Ghana&apos;s trust-protected commerce platform. Every market, within reach.
          </p>

          {/* Stats Grid */}
          <div 
            className="grid grid-cols-2 gap-2.5 mt-7 animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            <StatCard value="12K+" label="VERIFIED SELLERS" />
            <StatCard value="48K+" label="LIVE LISTINGS" />
            <StatCard value="GHS 0" label="BUYER LOSSES" />
            <StatCard value="4.9" label="AVG SELLER RATING" />
          </div>
        </div>

        {/* CTA Buttons */}
        <div 
          className="flex flex-col gap-2.5 mt-8 animate-fade-up"
          style={{ animationDelay: "0.15s" }}
        >
          <Link
            href="/auth/register"
            className="w-full bg-primary text-white text-center text-base font-extrabold py-[18px] rounded-2xl transition-all active:scale-[0.98] active:bg-primary-dark"
          >
            Start Buying &rarr;
          </Link>
          
          <Link
            href="/auth/register?vendor=true"
            className="w-full text-center text-[15px] font-extrabold py-4 rounded-2xl cursor-pointer transition-all active:scale-[0.98]"
            style={{
              background: "rgba(255,255,255,.09)",
              border: "1px solid rgba(255,255,255,.13)",
              color: "rgba(255,255,255,.8)",
            }}
          >
            I&apos;m a Seller &mdash; Open My Shop
          </Link>
        </div>
      </div>
    </div>
  )
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div 
      className="rounded-[14px] p-4"
      style={{
        background: "rgba(255,255,255,.07)",
        border: "1px solid rgba(255,255,255,.1)",
      }}
    >
      <div className="text-[26px] font-black text-[#4ade80] tracking-tight">
        {value}{label === "AVG SELLER RATING" && <span className="text-lg">★</span>}
      </div>
      <div className="text-[10px] text-white/35 mt-[3px] font-bold tracking-wider">
        {label}
      </div>
    </div>
  )
}
