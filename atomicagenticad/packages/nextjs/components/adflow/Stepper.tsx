type Step = { label: string };

type StepperProps = {
  steps: Step[];
  current: number; // 1-based
};

export const Stepper = ({ steps, current }: StepperProps) => (
  <ul className="steps w-full mb-10">
    {steps.map((step, i) => (
      <li key={step.label} className={`step ${i + 1 <= current ? "step-primary" : ""}`}>
        {step.label}
      </li>
    ))}
  </ul>
);
