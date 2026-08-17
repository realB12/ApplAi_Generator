// P11 — Password Toggle Pattern (PATTERNS.md)
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PasswordToggle({ inputId }: { inputId: string }) {
  const [visible, setVisible] = useState(false);

  const toggle = () => {
    const input = document.getElementById(inputId) as HTMLInputElement | null;
    if (input) {
      input.type = visible ? 'password' : 'text';
      setVisible(!visible);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="absolute right-2 top-1/2 -translate-y-1/2"
      onClick={toggle}
      aria-label={visible ? 'Hide password' : 'Show password'}
    >
      {visible ? <EyeOff size={16} /> : <Eye size={16} />}
    </Button>
  );
}
