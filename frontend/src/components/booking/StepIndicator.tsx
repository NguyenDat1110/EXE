import { Check } from 'lucide-react';

export default function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = ['Thông Tin', 'Xác Nhận', 'Thanh Toán'];

  return (
    <div className="flex items-center justify-center w-full max-w-3xl mx-auto mb-12">
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isActive = currentStep === stepNum;
        const isCompleted = currentStep > stepNum;

        return (
          <div key={step} className="flex items-center relative flex-1 last:flex-none">
            <div className="flex flex-col items-center relative z-10">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-primary text-background-dark cyan-glow' 
                    : isActive 
                      ? 'bg-primary/20 border-2 border-primary text-primary cyan-glow' 
                      : 'glass-card text-slate-500'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : stepNum}
              </div>
              <span 
                className={`absolute top-12 text-xs font-medium uppercase tracking-widest whitespace-nowrap transition-colors duration-300 ${
                  isActive || isCompleted ? 'text-primary' : 'text-slate-500'
                }`}
              >
                {step}
              </span>
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-4 bg-white/10 relative">
                <div 
                  className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-in-out"
                  style={{ width: isCompleted ? '100%' : '0%' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
