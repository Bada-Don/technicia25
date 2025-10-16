import { useState } from 'react';
import ResumeUpload from '../components/student/ResumeUpload';
import ProfileCompletion from '../components/student/ProfileCompletion';

const StudentOnboarding = () => {
  const [step, setStep] = useState('upload'); // 'upload' or 'complete'
  const [extractedData, setExtractedData] = useState(null);
  const [missingFields, setMissingFields] = useState([]);

  const handleResumeSuccess = (data, missing) => {
    setExtractedData(data);
    setMissingFields(missing);
    setStep('complete');
  };

  const handleSkipUpload = () => {
    setExtractedData(null);
    setMissingFields(['all']);
    setStep('complete');
  };

  return (
    <>
      {step === 'upload' && (
        <ResumeUpload 
          onSuccess={handleResumeSuccess}
          onSkip={handleSkipUpload}
        />
      )}
      {step === 'complete' && (
        <ProfileCompletion 
          extractedData={extractedData}
          missingFields={missingFields}
        />
      )}
    </>
  );
};

export default StudentOnboarding;
