// Button Component
export function Button({
    className = '',
    variant = 'default',
    size = 'default',
    children,
    ...props
  }) {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
    
    const variants = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'underline-offset-4 hover:underline text-primary',
    };
    
    const sizes = {
      default: 'h-10 py-2 px-4',
      sm: 'h-9 px-3 rounded-md',
      lg: 'h-11 px-8 rounded-md',
      icon: 'h-10 w-10',
    };
    
    const variantStyles = variants[variant] || variants.default;
    const sizeStyles = sizes[size] || sizes.default;
    
    return (
      <button
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
  
  // Card Components
  export function Card({ className, ...props }) {
    return (
      <div
        className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
        {...props}
      />
    );
  }
  
  export function CardHeader({ className, ...props }) {
    return (
      <div
        className={`flex flex-col space-y-1.5 p-6 ${className}`}
        {...props}
      />
    );
  }
  
  export function CardTitle({ className, ...props }) {
    return (
      <h3
        className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
        {...props}
      />
    );
  }
  
  export function CardDescription({ className, ...props }) {
    return (
      <p
        className={`text-sm text-muted-foreground ${className}`}
        {...props}
      />
    );
  }
  
  export function CardContent({ className, ...props }) {
    return (
      <div
        className={`p-6 pt-0 ${className}`}
        {...props}
      />
    );
  }
  
  export function CardFooter({ className, ...props }) {
    return (
      <div
        className={`flex items-center p-6 pt-0 ${className}`}
        {...props}
      />
    );
  }
  
  // Input Component
  export function Input({
    className,
    type,
    ...props
  }) {
    return (
      <input
        type={type}
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      />
    );
  }
  
  // Label Component
  export function Label({
    className,
    ...props
  }) {
    return (
      <label
        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
        {...props}
      />
    );
  }
  
  // Avatar Component
  export function Avatar({
    className,
    ...props
  }) {
    return (
      <div
        className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}
        {...props}
      />
    );
  }
  
  export function AvatarImage({
    className,
    ...props
  }) {
    return (
      <img
        className={`aspect-square h-full w-full object-cover ${className}`}
        {...props}
      />
    );
  }
  
  export function AvatarFallback({
    className,
    ...props
  }) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center rounded-full bg-muted ${className}`}
        {...props}
      />
    );
  }
  
  // Toast Components
  export function Toast({
    className,
    variant = 'default',
    ...props
  }) {
    const variants = {
      default: 'bg-background border',
      destructive: 'group destructive border-destructive bg-destructive text-destructive-foreground',
    };
  
    return (
      <div
        className={`group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
  
  export function ToastAction({ className, ...props }) {
    return (
      <button
        className={`inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-destructive/30 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive ${className}`}
        {...props}
      />
    );
  }
  
  export function ToastTitle({ className, ...props }) {
    return (
      <div
        className={`text-sm font-semibold ${className}`}
        {...props}
      />
    );
  }
  
  export function ToastDescription({ className, ...props }) {
    return (
      <div
        className={`text-sm opacity-90 ${className}`}
        {...props}
      />
    );
  }
  
  // Dialog Components
  export function Dialog({ children, open, onOpenChange }) {
    if (!open) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm" 
          onClick={() => onOpenChange(false)}
        />
        <div className="fixed z-50 grid w-full max-w-lg scale-100 gap-4 bg-background p-6 opacity-100 shadow-lg sm:rounded-lg md:w-full">
          {children}
        </div>
      </div>
    );
  }
  
  export function DialogContent({ children, className, ...props }) {
    return (
      <div
        className={`relative ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
  
  export function DialogHeader({ className, ...props }) {
    return (
      <div
        className={`flex flex-col space-y-2 text-center sm:text-left ${className}`}
        {...props}
      />
    );
  }
  
  export function DialogFooter({ className, ...props }) {
    return (
      <div
        className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`}
        {...props}
      />
    );
  }
  
  export function DialogTitle({ className, ...props }) {
    return (
      <h3
        className={`text-lg font-semibold text-foreground ${className}`}
        {...props}
      />
    );
  }
  
  export function DialogDescription({ className, ...props }) {
    return (
      <div
        className={`text-sm text-muted-foreground ${className}`}
        {...props}
      />
    );
  }
  
  // Select Components
  export function Select({ children, value, onValueChange, ...props }) {
    return (
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      >
        {children}
      </select>
    );
  }
  
  export function SelectItem({ children, value, ...props }) {
    return (
      <option value={value} {...props}>{children}</option>
    );
  }
  
  // Toggle Component
  export function Toggle({
    className,
    variant = 'default',
    size = 'default',
    pressed,
    onPressedChange,
    ...props
  }) {
    const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors data-[state=on]:bg-accent data-[state=on]:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background hover:bg-muted hover:text-muted-foreground';
    
    const variants = {
      default: 'bg-transparent',
      outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
    };
    
    const sizes = {
      default: 'h-10 px-3',
      sm: 'h-9 px-2.5',
      lg: 'h-11 px-5',
    };
    
    const variantStyle = variants[variant] || variants.default;
    const sizeStyle = sizes[size] || sizes.default;
    
    return (
      <button
        aria-pressed={pressed}
        data-state={pressed ? 'on' : 'off'}
        onClick={() => onPressedChange?.(!pressed)}
        className={`${baseStyles} ${variantStyle} ${sizeStyle} ${className}`}
        {...props}
      />
    );
  }
  
  // Alert Component
  export function Alert({
    className,
    variant = 'default',
    ...props
  }) {
    const variants = {
      default: 'bg-background text-foreground',
      destructive: 'text-destructive border-destructive/50 dark:border-destructive [&>svg]:text-destructive',
    };
  
    return (
      <div
        role="alert"
        className={`relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
  
  export function AlertTitle({
    className,
    ...props
  }) {
    return (
      <h5
        className={`mb-1 font-medium leading-none tracking-tight ${className}`}
        {...props}
      />
    );
  }
  
  export function AlertDescription({
    className,
    ...props
  }) {
    return (
      <div
        className={`text-sm [&_p]:leading-relaxed ${className}`}
        {...props}
      />
    );
  }