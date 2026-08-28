interface ClienteHomeGreetingProps {
  displayName: string
  summarySubtitle: string
}

export function ClienteHomeGreeting({
  displayName,
  summarySubtitle,
}: ClienteHomeGreetingProps) {
  const firstName = displayName.split(' ')[0] || displayName

  return (
    <header className="flex flex-col gap-1.5">
      <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-extrabold text-brand tracking-tight leading-tight">
        ¡Hola, {firstName}!
      </h1>
      <p className="text-sm sm:text-base text-sage font-medium max-w-2xl">
        {summarySubtitle}
      </p>
    </header>
  )
}
