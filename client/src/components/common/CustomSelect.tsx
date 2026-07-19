import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type CustomSelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

type CustomSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  className?: string;
};

export const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder = "Select",
  className = ""
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuStyle, setMenuStyle] = useState<{ top: number; left: number; width: number } | null>(null);
  const listboxId = useId();
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const updateMenuPosition = () => {
      if (!buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      setMenuStyle({
        top: rect.bottom + window.scrollY + 10,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    };

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideTrigger = rootRef.current?.contains(target);
      const clickedInsideMenu = menuRef.current?.contains(target);

      if (!clickedInsideTrigger && !clickedInsideMenu) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    if (isOpen) {
      updateMenuPosition();
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${isOpen ? "z-50" : "z-10"} ${className}`.trim()} ref={rootRef}>
      <button
        aria-controls={listboxId}
        aria-expanded={isOpen}
        className="select-modern"
        ref={buttonRef}
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className={selectedOption ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"}>
          {selectedOption?.label || placeholder}
        </span>
        <svg
          aria-hidden="true"
          className={`h-4 w-4 text-slate-500 transition dark:text-slate-400 ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 7.5 10 12.5 15 7.5" />
        </svg>
      </button>

      {isOpen && menuStyle
        ? createPortal(
            <div
              className="select-modern-menu"
              id={listboxId}
              role="listbox"
              ref={menuRef}
              style={{ left: menuStyle.left, top: menuStyle.top, width: menuStyle.width }}
            >
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    className={`select-modern-option ${
                      isSelected ? "select-modern-option-active" : ""
                    } ${option.disabled ? "cursor-not-allowed opacity-50" : ""}`}
                    disabled={option.disabled}
                    onClick={() => {
                      if (option.disabled) return;
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    role="option"
                    type="button"
                  >
                    <span>{option.label}</span>
                    {isSelected ? (
                      <svg
                        aria-hidden="true"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="m5 10 3 3 7-7" />
                      </svg>
                    ) : null}
                  </button>
                );
              })}
            </div>,
            document.body
          )
        : null}
    </div>
  );
};
