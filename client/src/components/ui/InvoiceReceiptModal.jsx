import React from 'react';
import { createPortal } from 'react-dom';
import { AnimatedTicket } from './ticket-confirmation-card';

export default function InvoiceReceiptModal({ isOpen, onClose, details }) {
  if (!isOpen || !details) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 overflow-y-auto">
      {/* Explicit Single Backdrop Layer */}
      <div 
        className="fixed inset-0 bg-zinc-950/20 transition-opacity" 
        onClick={onClose} 
      />

      {/* Ticket Surface Container */}
      <div className="relative z-10 flex flex-col items-center my-auto">
        <AnimatedTicket 
          ticketId={details.invoiceId || `INV-${Date.now().toString().slice(-6)}`}
          date={details.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          cardHolder={details.customerName || "API Customer"}
          last4Digits={details.last4 || "4242"}
          amount={details.amount || 10.00}
          barcodeValue={details.barcode || `849204${Date.now().toString().slice(-4)}`}
          onDismiss={onClose}
        />
        <button
          onClick={onClose}
          className="mt-6 px-6 py-2.5 bg-white text-zinc-900 font-extrabold text-xs rounded-xl shadow-lg hover:bg-zinc-100 transition-all cursor-pointer z-20 active:scale-95 border border-zinc-200"
        >
          Dismiss & Return to Console
        </button>
      </div>
    </div>,
    document.body
  );
}
