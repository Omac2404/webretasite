"use client"

// Tiny client wrapper around a server-action form that intercepts the
// submit and asks the user to confirm first. Used for the destructive
// "Sıfırla" buttons in the analytics admin. Server actions can be
// passed in as props — they're serializable references.

export function ConfirmForm({
  action,
  message,
  className,
  children,
}: {
  action: (formData: FormData) => Promise<void>
  message: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(message)) e.preventDefault()
      }}
      className={className}
    >
      {children}
    </form>
  )
}
