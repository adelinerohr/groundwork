import * as React from "react";

import { cn } from "@workspace/ui/lib/utils";
import { Button } from "./button";
import { EyeIcon, EyeOffIcon, SearchIcon, XIcon } from "lucide-react";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

type InputWithAdornmentsProps = React.ComponentProps<"input"> & {
  startAdornment?: React.JSX.Element;
  endAdornment?: React.JSX.Element;
  containerClassName?: string;
};
function InputWithAdornments({
  className,
  startAdornment,
  endAdornment,
  containerClassName,
  ...props
}: InputWithAdornmentsProps) {
  return (
    <div className={cn("relative inline-block h-9 w-full", containerClassName)}>
      {startAdornment && (
        <span className="absolute left-3 top-1/2 flex -translate-y-1/2 text-muted-foreground">
          {startAdornment}
        </span>
      )}
      <input
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          startAdornment && endAdornment
            ? "px-10"
            : startAdornment
              ? "pl-10 pr-4"
              : endAdornment
                ? "pl-4 pr-10"
                : "",
          className
        )}
        {...props}
      />
      {endAdornment && (
        <span className="absolute left-auto right-3 top-1/2 flex -translate-y-1/2 text-muted-foreground">
          {endAdornment}
        </span>
      )}
    </div>
  );
}

function InputPassword(props: InputWithAdornmentsProps) {
  const [showPassword, setShowPassword] = React.useState<boolean>(false);

  const handleClickShowPassword = (): void => {
    setShowPassword((prev) => !prev);
  };

  const handleMouseDownPassword = (event: React.SyntheticEvent): void => {
    event.preventDefault();
  };

  return (
    <InputWithAdornments
      type={showPassword ? "text" : "password"}
      endAdornment={
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Toggle password visibility"
          className="-mr-2.5 size-8"
          onClick={handleClickShowPassword}
          onMouseDown={handleMouseDownPassword}
          disabled={props.disabled}
        >
          {showPassword ? (
            <EyeOffIcon className="size-4 shrink-0" />
          ) : (
            <EyeIcon className="size-4 shrink-0" />
          )}
        </Button>
      }
      {...props}
    />
  );
}

function InputSearch({
  onChange,
  value,
  disabled,
  debounceTime = 175,
  onClear,
  clearButtonProps,
  alwaysShowClearButton,
  ...props
}: Omit<InputWithAdornmentsProps, "startAdornment" | "endAdornment"> & {
  debounceTime?: number;
  onClear?: () => void;
  clearButtonProps?: React.ComponentProps<typeof Button>;
  alwaysShowClearButton?: boolean;
}) {
  const [innerValue, setInnerValue] = React.useState(value || "");
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    setInnerValue(value || "");
  }, [value]);

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setInnerValue(newValue);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        onChange?.(event);
      }, debounceTime);
    },
    [onChange, debounceTime]
  );

  const handleClear = React.useCallback(() => {
    setInnerValue("");
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onChange?.({
      target: { value: "" },
    } as React.ChangeEvent<HTMLInputElement>);
    onClear?.();
  }, [onChange, onClear]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <InputWithAdornments
      disabled={disabled}
      value={innerValue}
      onChange={handleChange}
      startAdornment={<SearchIcon className="size-4 shrink-0" />}
      endAdornment={
        alwaysShowClearButton || innerValue ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="-mr-2.5 flex size-8"
            onClick={handleClear}
            {...clearButtonProps}
          >
            <XIcon className="size-4 shrink-0" />
          </Button>
        ) : undefined
      }
      {...props}
    />
  );
}

export { Input, InputWithAdornments, InputPassword, InputSearch };
