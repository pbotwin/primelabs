import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown } from "lucide-react";

export type SelectOption<T extends string> = {
  value: T;
  label: string;
};

type CustomSelectProps<T extends string> = {
  label: string;
  options: readonly SelectOption<T>[];
  value: T | "";
  onChange: (value: T) => void;
  placeholder?: string;
  name?: string;
  required?: boolean;
  error?: string;
};

export function CustomSelect<T extends string>({
  label,
  options,
  value,
  onChange,
  placeholder = "Select",
  name,
  required = false,
  error,
}: CustomSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const id = useId();
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null;

  useEffect(() => {
    if (!open) return;

    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    optionRefs.current[Math.max(selectedIndex, 0)]?.focus();
  }, [open, selectedIndex]);

  const choose = (option: SelectOption<T>) => {
    onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleOptionKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = (index + direction + options.length) % options.length;
      optionRefs.current[nextIndex]?.focus();
    }
    if (event.key === "Home") {
      event.preventDefault();
      optionRefs.current[0]?.focus();
    }
    if (event.key === "End") {
      event.preventDefault();
      optionRefs.current[options.length - 1]?.focus();
    }
    if (event.key === "Escape" || event.key === "Tab") {
      setOpen(false);
      if (event.key === "Escape") {
        event.preventDefault();
        triggerRef.current?.focus();
      }
    }
  };

  return (
    <div
      ref={rootRef}
      className={`custom-select${open ? " custom-select--open" : ""}${error ? " custom-select--error" : ""}`}
    >
      <span id={`${id}-label`} className="custom-select__label">
        {label}
      </span>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        ref={triggerRef}
        type="button"
        className="custom-select__trigger"
        aria-labelledby={`${id}-label ${id}-value`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-required={required || undefined}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
          if (event.key === "Escape") setOpen(false);
        }}
      >
        <span
          id={`${id}-value`}
          className={selectedOption ? "" : "custom-select__placeholder"}
        >
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown aria-hidden="true" />
      </button>
      {open && (
        <div
          id={`${id}-listbox`}
          className="custom-select__menu"
          role="listbox"
          aria-labelledby={`${id}-label`}
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              ref={(element) => {
                optionRefs.current[index] = element;
              }}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className="custom-select__option"
              onClick={() => choose(option)}
              onKeyDown={(event) => handleOptionKeyDown(event, index)}
            >
              <span>{option.label}</span>
              {option.value === value && <Check aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
      {error && (
        <small className="custom-select__error" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}
