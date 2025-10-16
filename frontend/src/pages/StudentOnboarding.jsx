import { useState } from 'react';
import ResumeUpload from '../components/student/ResumeUpload';
import ProfileCompletion from '../components/student/ProfileCompletion';

const StudentOnboarding = () => {
  const [step, setStep] = useState('upload'); // 'upload' or 'complete'
  const [extractedData, setExtractedData] = useState(null);
  const [missingFields, setMissingFields] = useState([]);

  console.log('StudentOnboarding rendered - step:', step);

  const handleResumeSuccess = (data, missing) => {
    console.log('Resume upload success:', data);
    setExtractedData(data);
    setMissingFields(missing);
    setStep('complete');
  };

  const handleSkipUpload = () => {
    console.log('Skipping resume upload');
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
