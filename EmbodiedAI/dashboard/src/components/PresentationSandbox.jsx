import React, { useState, useRef } from 'react';
import { UploadCloud, Play, Square, Pause, Presentation } from 'lucide-react';

export default function PresentationSandbox({ onTriggerSpeech, isTwinSpeaking, onDoubtSubmit }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [slides, setSlides] = useState([]);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showDoubtPrompt, setShowDoubtPrompt] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [doubtText, setDoubtText] = useState("");
  
  const fileInputRef = useRef(null);
  const speechTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const slideIdxRef = useRef(0);
  const isPresentingRef = useRef(false);
  const isPausedRef = useRef(false);
  const countdownRef = useRef(10);

  const handleFileUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) setFile(selectedFile);
  };

  const generateSlides = async () => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:5002/upload_presentation', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.status === 'success') {
        setSlides(data.slides);
        setCurrentSlideIdx(0);
        slideIdxRef.current = 0;
      } else {
        alert("Generation failed: " + data.message);
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const startPresentation = () => {
    setIsPresenting(true);
    setIsPaused(false);
    isPresentingRef.current = true;
    isPausedRef.current = false;
    setCurrentSlideIdx(0);
    slideIdxRef.current = 0;
    triggerSlideAction(0, true);
  };

  const stopPresentation = () => {
    setIsPresenting(false);
    setIsPaused(false);
    isPresentingRef.current = false;
    isPausedRef.current = false;
    setShowDoubtPrompt(false);
    clearTimeout(speechTimerRef.current);
    clearInterval(countdownTimerRef.current);
    if (onTriggerSpeech) {
      onTriggerSpeech("", "stop_presentation");
    }
  };

  const nextSlide = () => {
    setShowDoubtPrompt(false);
    clearTimeout(speechTimerRef.current);
    clearInterval(countdownTimerRef.current);
    
    if (slideIdxRef.current < slides.length - 1) {
      const nextIdx = slideIdxRef.current + 1;
      slideIdxRef.current = nextIdx;
      setCurrentSlideIdx(nextIdx);
      triggerSlideAction(nextIdx, true);
    } else {
      stopPresentation();
    }
  };

  const pausePresentation = () => {
    setIsPaused(true);
    isPausedRef.current = true;
    clearTimeout(speechTimerRef.current);
    clearInterval(countdownTimerRef.current);
    
    // Immediately stop speech and physical motions
    fetch('http://127.0.0.1:5002/stop_speech', { method: 'POST' }).catch(() => {});
  };

  const resumePresentation = () => {
    setIsPaused(false);
    isPausedRef.current = false;
    // Restart the speech and timer for the current slide
    triggerSlideAction(slideIdxRef.current, true);
  };

  const handleDoubtSubmit = () => {
    if (doubtText.trim() && onDoubtSubmit) {
      onDoubtSubmit(doubtText);
    }
    setDoubtText("");
    setShowDoubtPrompt(false);
    // After submitting doubt, we stop autoplay so they can listen to the answer
    setIsPresenting(false);
    isPresentingRef.current = false;
  };

  const triggerSlideAction = async (idx, forcePresenting = false) => {
    const slide = slides[idx];
    if (slide && onTriggerSpeech) {
      const isLastSlide = idx === slides.length - 1;
      const doubtTextStr = " Does anyone have any doubts, or should I continue to the next slide?";
      const speechText = slide.speaker_notes + (isLastSlide ? "" : doubtTextStr);
      
      if (isPresentingRef.current || forcePresenting) {
        try {
          // Wait exactly for the speech to finish on the backend
          await onTriggerSpeech(speechText, "start_presentation", true);
          
          if (isPresentingRef.current && !isPausedRef.current) {
            onTriggerSpeech("", "stop_presentation", false); // Stop gestures immediately
            
            if (isLastSlide) {
              stopPresentation();
            } else {
              setShowDoubtPrompt(true);
              countdownRef.current = 10;
              setCountdown(10);
              
              countdownTimerRef.current = setInterval(() => {
                countdownRef.current -= 1;
                setCountdown(countdownRef.current);
                if (countdownRef.current <= 0) {
                  clearInterval(countdownTimerRef.current);
                  nextSlide();
                }
              }, 1000);
            }
          }
        } catch (e) {
          console.error("Error in triggerSlideAction:", e);
        }
      } else {
        // Just trigger normally without waiting if autoplay isn't enabled
        onTriggerSpeech(speechText, "start_presentation", false);
      }
    }
  };

  return (
    <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px' }}>
      <div className="panel-header">
        <div className="panel-title">
          <Presentation size={20} className="cyan" />
          <h3>Presentation Sandbox</h3>
        </div>
      </div>

      {!slides.length ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '20px' }}>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileChange} 
            accept=".pdf,.txt"
          />
          <div 
            onClick={handleFileUploadClick}
            style={{
              border: '2px dashed rgba(0, 200, 255, 0.4)',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'rgba(0, 200, 255, 0.05)',
              width: '100%',
              maxWidth: '400px'
            }}
          >
            <UploadCloud size={32} className="cyan" style={{ marginBottom: '10px' }} />
            <h4 style={{ margin: '0 0 5px 0', color: '#fff' }}>{file ? file.name : 'Upload Document'}</h4>
            <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>PDF or TXT formats supported</p>
          </div>
          
          <button 
            className="motion-action-btn active" 
            onClick={generateSlides} 
            disabled={!file || isUploading}
            style={{ padding: '12px 24px', fontSize: '14px' }}
          >
            {isUploading ? 'Generating AI Slides...' : 'Generate Presentation'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <span className="hud-tag">SLIDE {currentSlideIdx + 1} OF {slides.length}</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {!isPresenting ? (
                <button className="motion-action-btn active" onClick={startPresentation}>
                  <Play size={14} /> Start Autoplay
                </button>
              ) : (
                <>
                  {!isPaused ? (
                    <button className="motion-action-btn" onClick={pausePresentation} style={{ background: 'var(--accent-yellow)', color: '#000' }}>
                      <Pause size={14} /> Pause
                    </button>
                  ) : (
                    <button className="motion-action-btn active" onClick={resumePresentation}>
                      <Play size={14} /> Resume
                    </button>
                  )}
                  <button className="motion-action-btn" onClick={stopPresentation} style={{ background: 'var(--accent-red)' }}>
                    <Square size={14} /> Stop
                  </button>
                </>
              )}
              <button className="motion-action-btn" onClick={nextSlide} disabled={currentSlideIdx === slides.length - 1}>
                Next Slide
              </button>
            </div>
          </div>

          <div style={{ 
            flex: 1, 
            background: '#fff', 
            borderRadius: '8px', 
            padding: '30px', 
            color: '#111',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            <h1 style={{ fontSize: '28px', borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>
              {slides[currentSlideIdx]?.title}
            </h1>
            <ul style={{ fontSize: '18px', lineHeight: '1.6', paddingLeft: '20px' }}>
              {slides[currentSlideIdx]?.bullets.map((b, i) => (
                <li key={i} style={{ marginBottom: '12px' }}>{b}</li>
              ))}
            </ul>
          </div>
          
          <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', color: 'var(--primary)', letterSpacing: '1px' }}>SPEAKER NOTES</h4>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', fontStyle: 'italic', color: '#ccc' }}>
              {slides[currentSlideIdx]?.speaker_notes}
            </p>
          </div>
          
          {/* Doubt Prompt Overlay */}
          {showDoubtPrompt && (
            <div style={{ 
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 100, borderRadius: '8px'
            }}>
              <div style={{ 
                background: '#1a1f26', padding: '30px', borderRadius: '12px',
                width: '80%', maxWidth: '500px', border: '1px solid var(--primary)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)', textAlign: 'center'
              }}>
                <h3 style={{ margin: '0 0 15px 0', color: 'var(--primary)' }}>Any Doubts?</h3>
                <p style={{ margin: '0 0 20px 0', color: '#ddd' }}>
                  Auto-continuing in <strong style={{ color: '#fff', fontSize: '18px' }}>{countdown}</strong> seconds...
                </p>
                <input 
                  type="text" 
                  placeholder="Type your question here..."
                  value={doubtText}
                  onChange={(e) => setDoubtText(e.target.value)}
                  onFocus={() => clearInterval(countdownTimerRef.current)}
                  onKeyDown={(e) => e.key === 'Enter' && handleDoubtSubmit()}
                  style={{ 
                    width: '100%', padding: '12px', borderRadius: '6px', 
                    border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)',
                    color: '#fff', marginBottom: '20px'
                  }}
                />
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                  <button className="motion-action-btn" onClick={handleDoubtSubmit} style={{ padding: '10px 20px', flex: 1 }}>
                    Submit Doubt
                  </button>
                  <button className="motion-action-btn active" onClick={nextSlide} style={{ padding: '10px 20px', flex: 1, background: 'var(--primary)', color: '#000' }}>
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
