import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingProgressBarProps {
  steps: { number: number; name: string; completed: boolean }[];
  currentStep: number;
}

export const OnboardingProgressBar = ({ steps, currentStep }: OnboardingProgressBarProps) => {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                  step.completed
                    ? 'bg-primary text-primary-foreground'
                    : step.number === currentStep
                    ? 'bg-primary/20 text-primary border-2 border-primary'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {step.completed ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>
              <span
                className={cn(
                  'text-xs mt-2 text-center max-w-[80px]',
                  step.number === currentStep ? 'font-semibold text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.name}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2 transition-colors',
                  step.completed ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
