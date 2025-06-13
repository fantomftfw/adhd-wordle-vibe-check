import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InstructionsPopup } from '@/components/InstructionsPopup';

const Landing = () => {
  const navigate = useNavigate();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleContinue = () => {
    setIsPopupOpen(false);
    const button = document.querySelector('.play-button') as HTMLButtonElement;
    if (button) {
      button.textContent = '🎮 Loading...';
      button.disabled = true;
    }
    setTimeout(() => {
      navigate('/game');
    }, 500);
  };

  return (
    <>
      <InstructionsPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onContinue={handleContinue}
      />
      <style>{`
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.7;
            color: #343a40;
            background-color: #f8f9fa;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
        }

        .hero-section {
            text-align: center;
            padding: 80px 20px;
            background: linear-gradient(135deg, #fdf4f5, #eef2f9);
            border-radius: 16px;
            margin-bottom: 40px;
        }

        .hero-section h1 {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 20px;
            letter-spacing: -1.5px;
            color: #212529;
        }

        .hero-section p {
            font-size: 1.2rem;
            color: #6c757d;
            max-width: 600px;
            margin: 0 auto 30px;
        }

        .play-button {
            background-color: #4c6ef5;
            color: white;
            padding: 16px 36px;
            border: none;
            border-radius: 8px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(76, 110, 245, 0.2);
        }

        .play-button:hover {
            transform: translateY(-3px);
            background-color: #5d7eff;
            box-shadow: 0 7px 20px rgba(76, 110, 245, 0.3);
        }

        .content-card {
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
            padding: 50px;
            margin-bottom: 30px;
        }

        .intro-section h2 {
            font-size: 1.8rem;
            color: #343a40;
            margin-bottom: 20px;
            text-align: center;
            font-weight: 600;
        }

        .symptoms-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 30px;
            margin: 50px 0;
        }

        .symptom-card {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 30px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: 1px solid #e9ecef;
            border-left: 4px solid #4c6ef5;
        }

        .symptom-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
        }

        .symptom-icon {
            font-size: 2.2rem;
            margin-bottom: 15px;
            display: block;
        }

        .symptom-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #212529;
            margin-bottom: 10px;
        }

        .symptom-description {
            color: #495057;
            margin-bottom: 15px;
            font-size: 0.95rem;
        }

        .simulation-tag {
            background-color: #e7f5ff;
            color: #1c7ed6;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            display: inline-block;
            margin-top: 10px;
        }

        .how-it-works {
            background: #f1f3f5;
            border-radius: 12px;
            padding: 30px;
            margin: 50px 0;
            border-left: 4px solid #51cf66;
        }

        .how-it-works h3 {
            color: #2b6b37;
            font-size: 1.4rem;
            margin-bottom: 15px;
            font-weight: 600;
        }

        .disclaimer {
            background: #f1f3f5;
            border-radius: 8px;
            padding: 20px;
            margin-top: 40px;
            border-left: 4px solid #adb5bd;
        }

        @media (max-width: 768px) {
            .hero-section h1 { font-size: 2.2rem; }
            .content-card { padding: 30px 25px; }
            .symptoms-grid { grid-template-columns: 1fr; }
        }

        .fade-in {
            opacity: 0;
            transform: translateY(20px);
            animation: fadeInUp 0.6s ease forwards;
        }

        @keyframes fadeInUp {
            to { opacity: 1; transform: translateY(0); }
        }

        .symptom-card:nth-child(1) { animation-delay: 0.1s; }
        .symptom-card:nth-child(2) { animation-delay: 0.2s; }
        .symptom-card:nth-child(3) { animation-delay: 0.3s; }
      `}</style>
      <div className="container">
        <div className="hero-section fade-in">
          <h1>🧩 ADHD Wordle Experience</h1>
          <p>A Wordle-like game designed to offer a glimpse into the cognitive challenges faced by individuals with ADHD.</p>
          <button className="play-button" onClick={() => setIsPopupOpen(true)}>
            🎮 Play Game
          </button>
        </div>

        <div className="content-card">
          <div className="intro-section">
            <h2 className="fade-in" style={{animationDelay: '0.2s'}}>How It Simulates ADHD</h2>
          </div>

          <div className="symptoms-grid">
            <div className="symptom-card fade-in" style={{animationDelay: '0.3s'}}>
              <span className="symptom-icon">🥶</span>
              <h3 className="symptom-title">Executive Dysfunction</h3>
              <p className="symptom-description">
                Represents moments where initiating a task feels impossible, causing a temporary freeze in action.
              </p>
              <div className="simulation-tag">Simulated: Keyboard may freeze</div>
            </div>

            <div className="symptom-card fade-in" style={{animationDelay: '0.4s'}}>
              <span className="symptom-icon">🎨</span>
              <h3 className="symptom-title">Sensory Overload</h3>
              <p className="symptom-description">
                Simulates how sensory information can become jumbled or confusing under stress or overwhelm.
              </p>
              <div className="simulation-tag">Simulated: Color perception changes</div>
            </div>

            <div className="symptom-card fade-in" style={{animationDelay: '0.5s'}}>
              <span className="symptom-icon">⚡</span>
              <h3 className="symptom-title">Distractibility</h3>
              <p className="symptom-description">
                Mimics how stimuli can pull focus away, requiring mental effort to return to the original task.
              </p>
              <div className="simulation-tag">Simulated: Distracting pop-ups</div>
            </div>
          </div>

          <div className="how-it-works fade-in" style={{animationDelay: '0.6s'}}>
            <h3>💡 How This Works</h3>
            <p>
              This game introduces challenges that mirror common ADHD experiences. You might find your keyboard unresponsive, colors shifting, or distracting pop-ups. These aren't bugs—they're features designed to help build empathy and understanding.
            </p>
          </div>

          <div className="disclaimer fade-in" style={{animationDelay: '0.7s'}}>
            <p>
              <strong>Important:</strong> This is a simplified educational tool, not a diagnostic one. Real ADHD experiences are complex and unique. Please consult a healthcare professional for guidance.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Landing;
