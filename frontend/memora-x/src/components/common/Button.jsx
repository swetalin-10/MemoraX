import React from "react";
import { Loader2 } from "lucide-react";

const Button = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 whitespace-nowrap cursor-pointer";

  const variantStyles = {
    primary:
      "bg-primary text-white " +
      "shadow-[0_2px_12px_rgba(61,94,229,0.25)] " +
      "hover:bg-primary-dark hover:shadow-[0_4px_20px_rgba(61,94,229,0.35)]",

    secondary:
      "bg-neutral-800 text-neutral-200 border border-neutral-700 " +
      "hover:bg-neutral-700 hover:text-white hover:border-neutral-600",

    outline:
      "bg-transparent border border-neutral-700 text-neutral-300 " +
      "hover:bg-neutral-800/60 hover:text-white hover:border-neutral-600",

    ghost:
      "bg-transparent text-neutral-400 " +
      "hover:bg-neutral-800/60 hover:text-white",

    danger:
      "bg-red-500/90 text-white " +
      "shadow-[0_2px_12px_rgba(239,68,68,0.2)] " +
      "hover:bg-red-600 hover:shadow-[0_4px_20px_rgba(239,68,68,0.3)]",

    "danger-outline":
      "bg-transparent border border-red-500/30 text-red-400 " +
      "hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-300",
  };

  const sizeStyles = {
    sm: "h-9 px-3.5 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-12 px-6 text-base",
    icon: "h-10 w-10 p-0",
    "icon-sm": "h-8 w-8 p-0",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={[
        baseStyles,
        variantStyles[variant] || variantStyles.primary,
        sizeStyles[size] || sizeStyles.md,
        className,
      ].join(" ")}
      {...rest}
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          {children}
        </>
      ) : (
        <>
          {icon && icon}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
