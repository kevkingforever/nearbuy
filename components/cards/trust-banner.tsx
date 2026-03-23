"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Shield, CreditCard, Lock, Package, CheckCircle } from "lucide-react"

export function TrustBanner() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <div 
          className="relative rounded-lg overflow-hidden h-[140px] cursor-pointer"
          style={{
            background: "linear-gradient(135deg, rgba(0,0,0,.7), rgba(27,107,58,.5))",
          }}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(27,107,58,0.4),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(27,107,58,0.3),transparent_50%)]" />
          </div>

          <div className="absolute inset-0 p-[18px] flex flex-col justify-between">
            <span className="tag tag-green w-fit">
              <Shield className="w-3 h-3" /> NearBuy Guarantee
            </span>
            <div>
              <h3 className="text-lg font-black text-white mb-1">
                Every transaction protected
              </h3>
              <p className="text-[11px] text-white/65">
                Pay into escrow · Receive item · Confirm · Seller gets paid
              </p>
            </div>
          </div>
        </div>
      </SheetTrigger>

      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-[22px] font-extrabold flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" /> Escrow Protection
          </SheetTitle>
        </SheetHeader>

        {/* Flow Diagram */}
        <div className="flex items-center justify-between p-4 bg-info-light rounded-lg mb-4">
          <FlowStep icon={<CreditCard className="w-5 h-5" />} label="YOUR PAYMENT" />
          <span className="text-xl text-info">&rarr;</span>
          <FlowStep icon={<Lock className="w-5 h-5" />} label="ESCROW HOLDS" />
          <span className="text-xl text-info">&rarr;</span>
          <FlowStep icon={<Package className="w-5 h-5" />} label="YOU RECEIVE" />
          <span className="text-xl text-info">&rarr;</span>
          <FlowStep icon={<CheckCircle className="w-5 h-5" />} label="SELLER PAID" />
        </div>

        <div className="text-[13px] text-ink-2 leading-relaxed mb-5">
          <p className="mb-3">
            Your payment goes to a <strong>Paystack-secured escrow account</strong> — not directly to the seller.
          </p>
          <p className="mb-3">
            The seller only receives their money <strong>after you confirm receipt</strong>. If anything is wrong, raise a dispute within 48 hours and funds are frozen while NearBuy mediates.
          </p>
          <p>
            No more paying before seeing. No more trusting strangers blindly. <strong>The escrow is your protection.</strong>
          </p>
        </div>

        <button
          onClick={() => setOpen(false)}
          className="w-full bg-primary text-white py-3.5 rounded-md font-black text-[15px] transition-all active:scale-[0.98]"
        >
          Understood
        </button>
      </SheetContent>
    </Sheet>
  )
}

function FlowStep({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="text-center flex-1">
      <div className="text-info mb-1.5">{icon}</div>
      <div className="text-[10px] font-extrabold text-info">{label}</div>
    </div>
  )
}
