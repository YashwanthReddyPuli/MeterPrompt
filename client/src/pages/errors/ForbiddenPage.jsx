import React from 'react';
import { ShieldAlert } from 'lucide-react';
import ErrorLayout from './ErrorLayout';

export default function ForbiddenPage() {
  return (
    <ErrorLayout 
      code="403" 
      title="Administrative Access Restricted" 
      description="Your account permissions do not grant access to this administrative workspace. This security breach attempt has been logged." 
      icon={ShieldAlert} 
      actionText="Go to Developer Console" 
    />
  );
}
