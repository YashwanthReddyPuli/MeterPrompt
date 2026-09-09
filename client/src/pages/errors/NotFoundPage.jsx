import React from 'react';
import { FileQuestion } from 'lucide-react';
import ErrorLayout from './ErrorLayout';

export default function NotFoundPage() {
  return (
    <ErrorLayout 
      code="404" 
      title="Page Not Found" 
      description="The workspace route, invoice record, or gateway resource you are looking for has been moved or does not exist." 
      icon={FileQuestion} 
    />
  );
}
