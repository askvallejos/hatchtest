import { useTooltip } from '@/contexts/TooltipContext';

export const TooltipToggle = () => {
  const { tooltipEnabled, toggleTooltip } = useTooltip();

  return (
    <button
      onClick={toggleTooltip}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600"
      data-state={tooltipEnabled ? 'checked' : 'unchecked'}
      type="button"
      role="switch"
      aria-checked={tooltipEnabled}
    >
      <span className="pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-1" data-state={tooltipEnabled ? 'checked' : 'unchecked'} />
      <span className="sr-only">Toggle tooltips</span>
    </button>
  );
}; 