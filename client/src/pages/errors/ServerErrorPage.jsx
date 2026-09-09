import React from 'react';
import { ServerCrash } from 'lucide-react';
import ErrorLayout from './ErrorLayout';

export default function ServerErrorPage() {
  return (
    <ErrorLayout 
      code="500" 
      title="Gateway Service Unavailable" 
      description="Our subscription and token metering cluster encountered an unexpected runtime fault. Our telemetry has captured the stack trace." 
      icon={ServerCrash} 
      actionText="Retry Request" 
      onAction={() => window.location.reload()} 
    />
  );
}
