type Step = { label: string };

type StepperProps = {
  steps: Step[];
  current: number; // 1-based
};

export const Stepper = ({ steps, current }: StepperProps) => (
  <div className="stepper">
    {steps.map((step, i) => {
      const n = i + 1;
      const isDone = n < current;
      const isActive = n === current;
      return (
        <div key={step.label} style={{ display: "flex", alignItems: "center" }}>
          <div className={`step ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}>
            <div className="step-num">{isDone ? "✓" : n}</div>
            <span>{step.label}</span>
          </div>
          {i < steps.length - 1 && <div className={`step-line ${n < current ? "active" : ""}`} />}
        </div>
      );
    })}
  </div>
);
