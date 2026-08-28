"use client";

import * as React from "react";
import { useUser } from "@clerk/nextjs";
import {
  CheckCircle2,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Lock,
  Loader2,
  Sparkles,
  Zap,
  ArrowRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/components/ui/pricing-cards";
import { cn } from "@/lib/utils";

export interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName?: string;
  currency?: "USD" | "GHS";
  interval?: "monthly" | "annual";
  price?: number;
}

type PaymentMethod = "momo" | "card";
type MoMoNetwork = "mtn" | "telecel" | "airteltigo";

const MOMO_NETWORKS: { id: MoMoNetwork; name: string; prefix: string }[] = [
  { id: "mtn", name: "MTN MoMo", prefix: "024, 054, 055, 059" },
  { id: "telecel", name: "Telecel Cash", prefix: "020, 050" },
  { id: "airteltigo", name: "AirtelTigo", prefix: "026, 056, 027, 057" },
];

export function CheckoutModal({
  open,
  onOpenChange,
  planName = "Pixca Pro",
  currency = "USD",
  interval = "monthly",
  price = 10.79,
}: CheckoutModalProps) {
  const { user, isLoaded } = useUser();

  const [selectedMethod, setSelectedMethod] = React.useState<PaymentMethod | null>(null);
  const paymentMethod: PaymentMethod = selectedMethod ?? (currency === "GHS" ? "momo" : "card");

  const [selectedNetwork, setSelectedNetwork] = React.useState<MoMoNetwork>("mtn");
  const [phone, setPhone] = React.useState("");
  const [emailInput, setEmailInput] = React.useState<string | null>(null);
  const [nameInput, setNameInput] = React.useState<string | null>(null);
  const [cardNumber, setCardNumber] = React.useState("");
  const [cardExpiry, setCardExpiry] = React.useState("");
  const [cardCvc, setCardCvc] = React.useState("");

  const [status, setStatus] = React.useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [txRef, setTxRef] = React.useState<string>("");

  const email = emailInput !== null ? emailInput : (isLoaded && user?.primaryEmailAddress?.emailAddress) || "";
  const name = nameInput !== null ? nameInput : (isLoaded && user?.fullName) || "";

  const currencySymbol = currency === "GHS" ? "GH₵" : "$";
  const formattedPrice = formatPrice(price, currencySymbol);

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setStatus("idle");
      setErrorMessage(null);
      setSelectedMethod(null);
      setEmailInput(null);
      setNameInput(null);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (paymentMethod === "momo") {
      const cleanPhone = phone.replace(/\D/g, "");
      if (cleanPhone.length < 9) {
        setErrorMessage("Please enter a valid 10-digit Ghana phone number.");
        return;
      }
    } else {
      if (cardNumber.replace(/\s/g, "").length < 15) {
        setErrorMessage("Please enter a valid 16-digit card number.");
        return;
      }
    }

    const generatedRef = `PX-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setTxRef(generatedRef);
    setStatus("processing");

    // Simulate Paystack / payment verification
    try {
      await new Promise((resolve) => setTimeout(resolve, 1400));
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("Payment initialization failed. Please check your details and retry.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[540px] p-4 sm:p-6 gap-4 sm:gap-5 max-h-[90vh] overflow-y-auto min-w-0">
        {status === "success" ? (
          <div className="py-4 sm:py-6 flex flex-col items-center text-center space-y-4 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 animate-in zoom-in-50 duration-300 shrink-0">
              <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <div className="space-y-1 min-w-0 max-w-full">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Sparkles className="w-3 h-3" />
                Subscription Active
              </span>
              <DialogTitle className="text-lg sm:text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 text-center break-words">
                Welcome to {planName}!
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm text-center break-words">
                Your payment of <strong className="text-zinc-900 dark:text-zinc-100">{formattedPrice}</strong> ({interval}) was processed successfully.
              </DialogDescription>
            </div>

            {/* Receipt Summary */}
            <div className="w-full p-3.5 sm:p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-left space-y-2 text-xs min-w-0">
              <div className="flex flex-wrap justify-between gap-1 text-zinc-500 dark:text-zinc-400">
                <span>Plan</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 break-words">{planName}</span>
              </div>
              <div className="flex flex-wrap justify-between gap-1 text-zinc-500 dark:text-zinc-400">
                <span>Billing Interval</span>
                <span className="font-semibold capitalize text-zinc-900 dark:text-zinc-100">{interval}</span>
              </div>
              <div className="flex flex-wrap justify-between gap-1 text-zinc-500 dark:text-zinc-400">
                <span>Payment Channel</span>
                <span className="font-semibold capitalize text-zinc-900 dark:text-zinc-100 text-right break-words max-w-[65%]">
                  {paymentMethod === "momo"
                    ? `Mobile Money (${selectedNetwork.toUpperCase()}) / Paystack`
                    : "Polar (Merchant of Record / Global Card & Wallets)"}
                </span>
              </div>
              <div className="flex flex-wrap justify-between gap-1 text-zinc-500 dark:text-zinc-400">
                <span>Subscriber Email</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 break-all">{email}</span>
              </div>
              <div className="flex flex-wrap justify-between gap-1 text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-200 dark:border-zinc-800 font-mono text-[10px] sm:text-[11px]">
                <span>Reference</span>
                <span className="font-bold text-zinc-700 dark:text-zinc-300 break-all">{txRef}</span>
              </div>
            </div>

            <div className="w-full pt-1 sm:pt-2 space-y-2 min-w-0">
              <Button
                type="button"
                onClick={() => handleClose(false)}
                className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white font-bold text-xs h-10 cursor-pointer"
              >
                <span>Start Exploring News</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 break-words">
                A confirmation receipt has been sent to {email}.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 min-w-0">
            <DialogHeader className="space-y-1.5 min-w-0 pr-8">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                  <Zap className="w-3 h-3" />
                  Instant Activation
                </span>
                <div className="text-right">
                  <span className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100">
                    {formattedPrice}
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    /{interval === "annual" ? "yr" : "mo"}
                  </span>
                </div>
              </div>
              <DialogTitle className="text-lg sm:text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 break-words">
                Complete your {planName} subscription
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 break-words">
                Global cards & digital wallets processed securely via Polar (Merchant of Record). Local Ghana Mobile Money supported via Paystack.
              </DialogDescription>
            </DialogHeader>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setSelectedMethod("momo")}
                className={cn(
                  "flex items-center justify-center gap-2 py-2 px-2.5 sm:px-3 rounded-lg text-xs font-bold transition-all cursor-pointer min-w-0",
                  paymentMethod === "momo"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs border border-zinc-200 dark:border-zinc-700"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                )}
              >
                <Smartphone className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="truncate">Mobile Money (GH₵)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod("card")}
                className={cn(
                  "flex items-center justify-center gap-2 py-2 px-2.5 sm:px-3 rounded-lg text-xs font-bold transition-all cursor-pointer min-w-0",
                  paymentMethod === "card"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs border border-zinc-200 dark:border-zinc-700"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                )}
              >
                <CreditCard className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="truncate">Card & Wallets (Polar MoR)</span>
              </button>
            </div>

            {/* Account Details */}
            <div className="space-y-3 pt-1 min-w-0">
              <div className="space-y-1 min-w-0">
                <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
                />
                {user && (
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                    Linked to Clerk account ({user.id.slice(0, 10)}...)
                  </p>
                )}
              </div>

              {paymentMethod === "momo" ? (
                /* Mobile Money Details */
                <div className="space-y-3 p-3 sm:p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 min-w-0">
                  <div className="space-y-1.5 min-w-0">
                    <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                      Select MoMo Network
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                      {MOMO_NETWORKS.map((net) => (
                        <button
                          key={net.id}
                          type="button"
                          onClick={() => setSelectedNetwork(net.id)}
                          className={cn(
                            "py-2 px-1 sm:px-2 rounded-lg text-[11px] sm:text-xs font-bold text-center border transition-all cursor-pointer truncate",
                            selectedNetwork === net.id
                              ? "border-amber-500 bg-amber-500/15 text-amber-900 dark:text-amber-200 shadow-xs"
                              : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
                          )}
                        >
                          {net.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                      Ghana Mobile Number
                    </label>
                    <div className="flex rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus-within:ring-2 focus-within:ring-amber-500 min-w-0">
                      <span className="px-2.5 sm:px-3 py-2 text-xs font-semibold bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 select-none flex items-center shrink-0">
                        +233
                      </span>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="024 123 4567"
                        className="w-full min-w-0 px-3 py-2 text-xs bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 break-words">
                      You will receive an instant authorization prompt on your phone.
                    </p>
                  </div>
                </div>
              ) : (
                /* Card Details */
                <div className="space-y-3 p-3 sm:p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 min-w-0">
                  <div className="space-y-1 min-w-0">
                    <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="e.g. Kwame Mensah"
                      className="w-full min-w-0 px-3 py-2 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                      Card Number
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
                        setCardNumber(val);
                      }}
                      placeholder="4111 2222 3333 4444"
                      className="w-full min-w-0 px-3 py-2 text-xs font-mono rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 min-w-0">
                    <div className="space-y-1 min-w-0">
                      <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                        Expires
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "");
                          if (val.length >= 3) {
                            val = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
                          }
                          setCardExpiry(val);
                        }}
                        placeholder="MM/YY"
                        className="w-full min-w-0 px-3 py-2 text-xs font-mono rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                        CVC / CVV
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ""))}
                        placeholder="123"
                        className="w-full min-w-0 px-3 py-2 text-xs font-mono rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium break-words">
                {errorMessage}
              </div>
            )}

            {/* CTA & Security Footer */}
            <div className="pt-2 space-y-2.5 min-w-0">
              <Button
                type="submit"
                disabled={status === "processing"}
                className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white font-bold text-xs h-10 rounded-lg cursor-pointer transition-all"
              >
                {status === "processing" ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>Authorizing {formattedPrice}...</span>
                  </span>
                ) : (
                  <span className="truncate">
                    Pay {formattedPrice} & Subscribe to {planName}
                  </span>
                )}
              </Button>

              <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 text-[10px] text-zinc-400 dark:text-zinc-500 pt-1">
                <div className="flex items-center gap-1 shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>256-Bit SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Lock className="w-3 h-3 text-zinc-400 shrink-0" />
                  <span>
                    {paymentMethod === "card"
                      ? "Secured by Polar (Merchant of Record)"
                      : "Secured by Paystack (Ghana MoMo)"}
                  </span>
                </div>
                <span className="shrink-0">Cancel anytime</span>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
