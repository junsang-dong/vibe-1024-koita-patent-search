import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';
import Step5 from './steps/Step5';
import WizardNav from './components/WizardNav';
import ProgressBar from './components/ProgressBar';
import { useAppStore } from './stores/useAppStore';

function StepLayout({ children }: { children: React.ReactNode }) {
  const { currentStep } = useAppStore();

  return (
    <div className="flex h-screen overflow-hidden">
      <WizardNav currentStep={currentStep} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ProgressBar currentStep={currentStep} totalSteps={5} />
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
        
        <Route
          path="/step1"
          element={
            <StepLayout>
              <Step1 />
            </StepLayout>
          }
        />
        <Route
          path="/step2"
          element={
            <StepLayout>
              <Step2 />
            </StepLayout>
          }
        />
        <Route
          path="/step3"
          element={
            <StepLayout>
              <Step3 />
            </StepLayout>
          }
        />
        <Route
          path="/step4"
          element={
            <StepLayout>
              <Step4 />
            </StepLayout>
          }
        />
        <Route
          path="/step5"
          element={
            <StepLayout>
              <Step5 />
            </StepLayout>
          }
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
