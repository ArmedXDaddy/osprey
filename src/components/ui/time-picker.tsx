
import * as React from "react";
import { Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  label?: string;
  id?: string;
  disabled?: boolean;
  required?: boolean;
}

export function TimePicker({
  value,
  onChange,
  label,
  id = "time",
  disabled = false,
  required = false,
}: TimePickerProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="grid gap-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <Input
          id={id}
          type="time"
          value={value}
          onChange={handleChange}
          className="pl-10"
          disabled={disabled}
          required={required}
        />
        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}
