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
            padding: 60px 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 60px;
            color: #212529;
        }

        .header h1 {
            font-size: 2.8rem;
            font-weight: 700;
            margin-bottom: 15px;
            letter-spacing: -1px;
        }

        .header p {
            font-size: 1.15rem;
            color: #6c757d;
            max-width: 600px;
            margin: 0 auto;
        }

        .content-card {
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
            padding: 50px;
            margin-bottom: 30px;
        }

        .intro-section {
            margin-bottom: 50px;
        }

        .intro-section h2 {
            font-size: 1.8rem;
            color: #343a40;
            margin-bottom: 20px;
            text-align: center;
            font-weight: 600;
        }

        .intro-text {
            font-size: 1.1rem;
            color: #495057;
            text-align: center;
            max-width: 700px;
            margin: 0 auto;
        }

        .symptoms-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 600;
        }

        .how-it-works p {
            color: #347a43;
            font-size: 1rem;
        }

        .play-section {
            text-align: center;
            margin-top: 50px;
            padding: 40px;
            background-color: transparent;
            border-radius: 0;
            border: none;
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
            margin-top: 20px;
        }

        .play-button:hover {
            transform: translateY(-3px);
            background-color: #5d7eff;
            box-shadow: 0 7px 20px rgba(76, 110, 245, 0.3);
        }

        .play-button:active {
            transform: translateY(0);
        }

        .disclaimer {
            background: #f1f3f5;
            border-radius: 8px;
            padding: 20px;
            margin-top: 40px;
            border-left: 4px solid #adb5bd;
        }

        .disclaimer p {
            color: #495057;
            font-size: 0.9rem;
            font-style: normal;
        }

        @media (max-width: 768px) {
            .header h1 {
                font-size: 2.2rem;
            }
            
            .content-card {
                padding: 30px 25px;
            }
            
            .symptoms-grid {
                grid-template-columns: 1fr;
                gap: 20px;
            }
        }

        .fade-in {
            opacity: 0;
            transform: translateY(20px);
            animation: fadeInUp 0.6s ease forwards;
        }

        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .symptom-card:nth-child(1) { animation-delay: 0.1s; }
        .symptom-card:nth-child(2) { animation-delay: 0.2s; }
        .symptom-card:nth-child(3) { animation-delay: 0.3s; }
        .symptom-card:nth-child(4) { animation-delay: 0.4s; }
      `}</style>
      <div className="container">
        <div className="header">
          <h1>🧩 ADHD Wordle Experience</h1>
          <p>Understanding neurodivergent experiences through interactive gameplay</p>
        </div>

        <div className="content-card">
          <div className="intro-section">
            <h2>What is ADHD?</h2>
            <p className="intro-text">
              Attention Deficit Hyperactivity Disorder (ADHD) is a neurodevelopmental condition that affects how the brain processes information, manages attention, and controls impulses. It's not about being "lazy" or "unfocused" - it's about having a brain that works differently.
            </p>
          </div>

          <div className="symptoms-grid">
            <div className="symptom-card fade-in">
              <span className="symptom-icon">🎯</span>
              <h3 className="symptom-title">Attention Challenges</h3>
              <p className="symptom-description">
                Difficulty maintaining focus on tasks, especially when they're not immediately engaging or rewarding.
              </p>
              <div className="simulation-tag">Simulated: Sudden letter changes mid-game</div>
            </div>

            <div className="symptom-card fade-in">
              <span className="symptom-icon">⚡</span>
              <h3 className="symptom-title">Distractibility</h3>
              <p className="symptom-description">
                Being easily pulled away by external stimuli or internal thoughts, making it hard to stay on task.
              </p>
              <div className="simulation-tag">Simulated: Pop-up distractions during gameplay</div>
            </div>

            <div className="symptom-card fade-in">
              <span className="symptom-icon">🔄</span>
              <h3 className="symptom-title">Working Memory Issues</h3>
              <p className="symptom-description">
                Trouble holding information in mind while working on a task, like forgetting what you just read.
              </p>
              <div className="simulation-tag">Simulated: Previous guesses temporarily disappear</div>
            </div>

            <div className="symptom-card fade-in">
              <span className="symptom-icon">🌪️</span>
              <h3 className="symptom-title">Hyperfocus</h3>
              <p className="symptom-description">
                Intense concentration on interesting tasks, sometimes to the exclusion of everything else.
              </p>
              <div className="simulation-tag">Simulated: Timer becomes invisible during streaks</div>
            </div>
          </div>

          <div className="how-it-works">
            <h3>
              💡 How This Simulation Works
            </h3>
            <p>
              This modified Wordle game introduces challenges that mirror common ADHD experiences. You might find letters changing unexpectedly, distractions appearing on screen, or your previous guesses vanishing temporarily. These aren't bugs - they're features designed to help neurotypical individuals understand what daily tasks can feel like for someone with ADHD.
            </p>
          </div>

          <div className="play-section">
            <h3 style={{ color: '#92400e', marginBottom: '15px' }}>Ready to Experience ADHD Wordle?</h3>
            <p style={{ color: '#a16207', marginBottom: '20px' }}>
              Remember: This is a simplified simulation. Real ADHD experiences are complex and unique to each individual.
            </p>
            <button className="play-button" onClick={() => setIsPopupOpen(true)}>
              🎮 Start ADHD Wordle Experience
            </button>
          </div>

          <div className="disclaimer">
            <p>
              <strong>Important:</strong> This simulation is for educational purposes only and cannot fully represent the lived experience of ADHD. Every person with ADHD is different, and their challenges and strengths are unique. If you're interested in learning more about ADHD or think you might have it, please consult with a healthcare professional.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Landing;
