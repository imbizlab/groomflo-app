import { ThemeProvider } from "../theme-provider"
import { ThemeToggle } from "../theme-toggle"

export default function ThemeToggleExample() {
  return (
    <ThemeProvider>
      <div className="p-8 flex items-center justify-center">
        <ThemeToggle />
      </div>
    </ThemeProvider>
  )
}