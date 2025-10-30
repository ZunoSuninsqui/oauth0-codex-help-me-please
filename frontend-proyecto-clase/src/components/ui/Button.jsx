const variantClassMap = {
  primary: "btn-primary",
  outline: "btn-outline",
  ghost: "btn-ghost",
};

const Button = ({ children, variant = "primary", className = "", ...props }) => {
  const classes = ["btn", variantClassMap[variant] ?? variantClassMap.primary, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} type="button" {...props}>
      {children}
    </button>
  );
};

export default Button;
