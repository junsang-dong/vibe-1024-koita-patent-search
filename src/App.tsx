import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step5 from './steps/Step5';
import WizardNav from './components/WizardNav';
import ProgressBar from './components/ProgressBar';
import Footer from './components/Footer';
import { useAppStore } from './stores/useAppStore';

function StepLayout({ children }: { children: React.ReactNode }) {
  const { currentStep } = useAppStore();

  return (
    <div className="flex h-screen flex-col overflow-hidden md:flex-row">
      <WizardNav currentStep={currentStep} />
      <div className="min-w-0 flex-1 flex flex-col overflow-hidden">
        <ProgressBar currentStep={currentStep} />
        <div className="flex-1 overflow-hidden">{children}</div>
        <Footer />
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
          path="/define"
          element={
            <StepLayout>
              <Step1 />
            </StepLayout>
          }
        />
        <Route
          path="/claim-map"
          element={
            <StepLayout>
              <Step2 />
            </StepLayout>
          }
        />
        <Route
          path="/report"
          element={
            <StepLayout>
              <Step5 />
            </StepLayout>
          }
        />
        <Route path="/step1" element={<Navigate to="/define" replace />} />
        <Route path="/step2" element={<Navigate to="/claim-map" replace />} />
        <Route path="/step3" element={<Navigate to="/claim-map" replace />} />
        <Route path="/step4" element={<Navigate to="/claim-map" replace />} />
        <Route path="/step5" element={<Navigate to="/report" replace />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
