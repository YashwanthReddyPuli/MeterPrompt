import React from 'react';
import { Gauge } from 'lucide-react';
import ErrorLayout from './ErrorLayout';

export default function QuotaExceededPage() {
  return (
    <ErrorLayout 
      code="429" 
      title="Token Quota Exhausted" 
      description="Your current billing tier has depleted all monthly inference tokens. Upgrade your subscription or purchase an add-on top-up to resume." 
      icon={Gauge} 
      actionText="Upgrade Subscription" 
      onAction={() => { window.location.href = '/console?tab=credits'; }} 
    />
  );
}
