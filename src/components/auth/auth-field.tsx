import { Input } from "@/components/ui/input";

interface AuthFieldProps {
  id: string;
  label: string;
  name: string;
  type: string;
  autoComplete: string;
  invalid?: boolean;
}

export function AuthField({
  id,
  label,
  name,
  type,
  autoComplete,
  invalid = false,
}: AuthFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        aria-invalid={invalid || undefined}
      />
    </div>
  );
}
