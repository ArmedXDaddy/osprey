
import '@radix-ui/react-slot';

declare module '@radix-ui/react-slot' {
  export interface SlotProps {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
  }
}
