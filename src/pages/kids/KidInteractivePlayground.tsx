import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Copy, Check, Terminal, Moon, Sun } from 'lucide-react';
import toast from 'react-hot-toast';
import { codeExecutionSocket } from '../../components/service/codeExecutionSocket';

interface InteractivePlaygroundProps {
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

interface GameOutput {
  text: string;
  isError: boolean;
  timestamp: number;
}

interface GamesType {
  python: {
    guessNumber: string;
    quiz: string;
    calculator: string;
  };
  javascript: {
    guessNumber: string;
  };
}

const GAMES: GamesType = {
  python: {
    guessNumber: `# 🎮 Number Guessing Game!
import random

print("=" * 40)
print("   WELCOME TO NUMBER GUESSING GAME!")
print("=" * 40)
print()

secret_number = random.randint(1, 100)
attempts = 0

print("I'm thinking of a number between 1 and 100...")
print()

while True:
    try:
        guess = int(input("Your guess: "))
        attempts += 1
        
        if guess < secret_number:
            print(f"  📈 {guess} is too low! Try a higher number.")
        elif guess > secret_number:
            print(f"  📉 {guess} is too high! Try a lower number.")
        else:
            print()
            print("=" * 40)
            print(f"  🎉 CONGRATULATIONS! 🎉")
            print(f"  You guessed {secret_number} in {attempts} attempts!")
            print("=" * 40)
            break
            
        print()
        
    except ValueError:
        print("  ❌ Please enter a valid number!")
        print()

print("\\nThanks for playing! 🎮")`,
    
    quiz: `# 📝 Fun Quiz Game!
print("=" * 40)
print("     WELCOME TO THE QUIZ GAME!")
print("=" * 40)
print()

score = 0
questions = [
    ("What is the capital of France?", "Paris"),
    ("What is 5 + 7?", "12"),
    ("What color is the sky on a clear day?", "Blue"),
    ("Who painted the Mona Lisa?", "Da Vinci"),
]

for i, (question, answer) in enumerate(questions, 1):
    print(f"Question {i}: {question}")
    user_answer = input("Your answer: ")
    
    if user_answer.lower() == answer.lower():
        print("  ✅ Correct! +1 point")
        score += 1
    else:
        print(f"  ❌ Wrong! The answer is {answer}")
    print()

print("=" * 40)
print(f"  Your final score: {score}/{len(questions)}")
if score == len(questions):
    print("  🎉 PERFECT SCORE! You're a genius!")
elif score >= len(questions) // 2:
    print("  👍 Good job! Keep learning!")
else:
    print("  📚 Keep practicing! You'll do better next time!")
print("=" * 40)`,
    
    calculator: `# 🧮 Math Challenge Game!
import random

print("=" * 40)
print("     MATH CHALLENGE CALCULATOR")
print("=" * 40)
print()

score = 0

for round_num in range(1, 6):
    print(f"Round {round_num}/5")
    
    num1 = random.randint(1, 50)
    num2 = random.randint(1, 50)
    operation = random.choice(['+', '-', '*'])
    
    if operation == '+':
        answer = num1 + num2
        question = f"{num1} + {num2}"
    elif operation == '-':
        answer = num1 - num2
        question = f"{num1} - {num2}"
    else:
        answer = num1 * num2
        question = f"{num1} * {num2}"
    
    try:
        user_answer = int(input(f"What is {question}? "))
        
        if user_answer == answer:
            print("  ✅ Correct! +10 points")
            score += 10
        else:
            print(f"  ❌ Wrong! The answer is {answer}")
    except ValueError:
        print("  ❌ Please enter a number!")
    
    print()

print("=" * 40)
print(f"  FINAL SCORE: {score}/50")
if score >= 40:
    print("  🌟 EXCELLENT! Math wizard!")
elif score >= 25:
    print("  👍 Good job! Keep practicing!")
else:
    print("  💪 Keep trying! Math gets easier with practice!")
print("=" * 40)`
  },
  javascript: {
    guessNumber: `// 🎮 Number Guessing Game in JavaScript
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function playGame() {
  console.log("=".repeat(40));
  console.log("   WELCOME TO NUMBER GUESSING GAME!");
  console.log("=".repeat(40));
  console.log();
  
  const secretNumber = Math.floor(Math.random() * 100) + 1;
  let attempts = 0;
  
  console.log("I'm thinking of a number between 1 and 100...");
  console.log();
  
  while (true) {
    const guess = parseInt(await question("Your guess: "));
    attempts++;
    
    if (isNaN(guess)) {
      console.log("  ❌ Please enter a valid number!");
    } else if (guess < secretNumber) {
      console.log(\`  📈 \${guess} is too low! Try a higher number.\`);
    } else if (guess > secretNumber) {
      console.log(\`  📉 \${guess} is too high! Try a lower number.\`);
    } else {
      console.log();
      console.log("=".repeat(40));
      console.log(\`  🎉 CONGRATULATIONS! 🎉\`);
      console.log(\`  You guessed \${secretNumber} in \${attempts} attempts!\`);
      console.log("=".repeat(40));
      break;
    }
    console.log();
  }
  
  console.log("\\nThanks for playing! 🎮");
  rl.close();
}

playGame();`
  }
};

const KidInteractivePlayground: React.FC<InteractivePlaygroundProps> = ({ isDarkMode = true, onToggleDarkMode }) => {
  const [code, setCode] = useState(GAMES.python.guessNumber);
  const [language, setLanguage] = useState<'python' | 'javascript'>('python');
  const [output, setOutput] = useState<GameOutput[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeGame, setActiveGame] = useState<'guessNumber' | 'quiz' | 'calculator'>('guessNumber');
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  
  const outputEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentExecutionId = useRef<string | null>(null);
  // Fixed: Use ReturnType<typeof setTimeout> instead of NodeJS.Timeout
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRunningRef = useRef(false);

  // Define addOutput before using it in useEffect
  const addOutput = (text: string, isError: boolean = false) => {
    setOutput(prev => [...prev, { text, isError, timestamp: Date.now() }]);
    setTimeout(() => {
      outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Reset running state with timeout protection
  const resetRunningState = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsRunning(false);
    isRunningRef.current = false;
    setWaitingForInput(false);
    currentExecutionId.current = null;
  };

  useEffect(() => {
    // Connect to WebSocket
    codeExecutionSocket.connect();
    
    // Monitor connection status
    const checkConnection = setInterval(() => {
      setConnectionStatus(codeExecutionSocket.isConnected() ? 'connected' : 'disconnected');
    }, 1000);

    const unsubscribeOutput = codeExecutionSocket.onOutput((data) => {
      addOutput(data.output, data.isError);
    });

    const unsubscribeInput = codeExecutionSocket.onInputRequest((data) => {
      setWaitingForInput(true);
      addOutput(`🎮 ${data.prompt}`, false);
      setTimeout(() => inputRef.current?.focus(), 100);
      currentExecutionId.current = data.executionId;
    });

    const unsubscribeComplete = codeExecutionSocket.onComplete(() => {
      resetRunningState();
      addOutput('\n✅ Program finished!\n', false);
    });

    const unsubscribeError = codeExecutionSocket.onError((data) => {
      resetRunningState();
      addOutput(`❌ Error: ${data.error}`, true);
    });

    return () => {
      unsubscribeOutput();
      unsubscribeInput();
      unsubscribeComplete();
      unsubscribeError();
      clearInterval(checkConnection);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleRunCode = () => {
    if (isRunningRef.current) {
      resetRunningState();
      addOutput('🛑 Program stopped by user\n', false);
      return;
    }
    
    setOutput([]);
    setIsRunning(true);
    isRunningRef.current = true;
    addOutput('🚀 Running your interactive game...', false);
    addOutput('─'.repeat(50), false);
    addOutput('💡 Tip: The game will ask for input - type your answer and press Enter!', false);
    addOutput('', false);
    
    try {
      codeExecutionSocket.executeCode(code, language);
    } catch (error) {
      resetRunningState();
      addOutput(`❌ Failed to start: ${error}`, true);
    }
    
    timeoutRef.current = setTimeout(() => {
      if (isRunningRef.current) {
        resetRunningState();
        addOutput('\n⚠️ Execution timeout - no response from server\n', true);
      }
    }, 30000);
  };

  const handleSendInput = () => {
    if (!waitingForInput || !currentExecutionId.current) return;
    
    codeExecutionSocket.sendInput(currentExecutionId.current, inputValue);
    addOutput(`📝 You entered: ${inputValue}`, false);
    setInputValue('');
    setWaitingForInput(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (isRunningRef.current) {
          resetRunningState();
          addOutput('\n⚠️ Execution timeout - no response after input\n', true);
        }
      }, 30000);
    }
  };

  const handleGameChange = (game: 'guessNumber' | 'quiz' | 'calculator') => {
    setActiveGame(game);
    if (language === 'python') {
      setCode(GAMES.python[game]);
    } else {
      setCode(GAMES.javascript.guessNumber);
    }
    setOutput([]);
    addOutput(`📚 Loaded ${game === 'guessNumber' ? 'Number Guessing' : game === 'quiz' ? 'Quiz' : 'Math Challenge'} Game!`, false);
  };

  const handleLanguageChange = (newLanguage: 'python' | 'javascript') => {
    setLanguage(newLanguage);
    if (newLanguage === 'python') {
      setCode(GAMES.python[activeGame]);
    } else {
      setCode(GAMES.javascript.guessNumber);
    }
    setOutput([]);
    addOutput(`🔄 Switched to ${newLanguage.toUpperCase()}`, false);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Code copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleClearOutput = () => {
    setOutput([]);
  };

  const dk = (dark: string, light: string) => isDarkMode ? dark : light;

  return (
    <div className={`min-h-screen ${dk("bg-gray-900", "bg-gray-50")} transition-colors duration-300`}>
      {/* Header */}
      <header className={`sticky top-0 z-20 ${dk("bg-gray-800 border-gray-700", "bg-white border-gray-200")} border-b shadow-sm`}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Terminal size={24} className="text-purple-500" />
            <h1 className={`font-bold text-xl ${dk("text-white", "text-gray-800")}`}>🎮 Interactive Game Playground</h1>
            {connectionStatus === 'connected' && (
              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">Connected</span>
            )}
            {connectionStatus === 'disconnected' && (
              <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">Disconnected</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleLanguageChange('python')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${language === 'python' ? 'bg-blue-600 text-white' : dk("bg-gray-700 text-gray-300", "bg-gray-100 text-gray-600")}`}
            >
              🐍 Python
            </button>
            <button
              onClick={() => handleLanguageChange('javascript')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${language === 'javascript' ? 'bg-yellow-600 text-white' : dk("bg-gray-700 text-gray-300", "bg-gray-100 text-gray-600")}`}
            >
              📘 JavaScript
            </button>
            <button onClick={onToggleDarkMode} className={`p-2 rounded-lg transition ${dk("hover:bg-gray-700", "hover:bg-gray-100")}`}>
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row p-4 gap-4 h-[calc(100vh-73px)]">
        {/* Left Panel - Game Selector & Code Editor */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Game Selector */}
          <div className={`p-4 rounded-lg ${dk("bg-gray-800", "bg-white")} shadow-lg`}>
            <h3 className={`font-semibold mb-3 ${dk("text-white", "text-gray-800")}`}>🎲 Choose a Game</h3>
            <div className="flex gap-3">
              <button
                onClick={() => handleGameChange('guessNumber')}
                className={`flex-1 px-4 py-2 rounded-lg transition ${
                  activeGame === 'guessNumber'
                    ? 'bg-purple-600 text-white'
                    : dk("bg-gray-700 text-gray-300 hover:bg-gray-600", "bg-gray-100 text-gray-600 hover:bg-gray-200")
                }`}
              >
                🎯 Guess Number
              </button>
              <button
                onClick={() => handleGameChange('quiz')}
                className={`flex-1 px-4 py-2 rounded-lg transition ${
                  activeGame === 'quiz'
                    ? 'bg-green-600 text-white'
                    : dk("bg-gray-700 text-gray-300 hover:bg-gray-600", "bg-gray-100 text-gray-600 hover:bg-gray-200")
                }`}
              >
                📝 Quiz Game
              </button>
              <button
                onClick={() => handleGameChange('calculator')}
                className={`flex-1 px-4 py-2 rounded-lg transition ${
                  activeGame === 'calculator'
                    ? 'bg-blue-600 text-white'
                    : dk("bg-gray-700 text-gray-300 hover:bg-gray-600", "bg-gray-100 text-gray-600 hover:bg-gray-200")
                }`}
              >
                🧮 Math Challenge
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div className={`flex-1 flex flex-col rounded-lg overflow-hidden ${dk("bg-gray-800", "bg-white")} shadow-lg`}>
            <div className={`flex justify-between items-center px-4 py-2 ${dk("bg-gray-700", "bg-gray-100")}`}>
              <span className={`text-sm ${dk("text-gray-300", "text-gray-600")}`}>📝 Game Code (you can edit it!)</span>
              <div className="flex gap-2">
                <button onClick={handleCopyCode} className="p-1 hover:opacity-70 transition">
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
                <button onClick={handleClearOutput} className="p-1 hover:opacity-70 transition">
                  <Square size={16} />
                </button>
              </div>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={`flex-1 p-4 font-mono text-sm outline-none resize-none ${dk("bg-gray-900 text-green-400", "bg-gray-50 text-gray-800")}`}
              style={{ fontFamily: 'monospace', fontSize: '13px' }}
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right Panel - Output Console */}
        <div className="flex-1 flex flex-col rounded-lg overflow-hidden shadow-lg">
          <div className={`flex justify-between items-center px-4 py-2 ${dk("bg-gray-800", "bg-white")} border-b ${dk("border-gray-700", "border-gray-200")}`}>
            <span className={`text-sm ${dk("text-gray-300", "text-gray-600")}`}>🎮 Game Console</span>
            <button
              onClick={handleRunCode}
              className={`px-4 py-1.5 rounded-lg flex items-center gap-2 transition ${
                isRunning
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isRunning ? <Square size={16} /> : <Play size={16} />}
              {isRunning ? 'Stop' : 'Play Game'}
            </button>
          </div>
          
          <div className={`flex-1 overflow-y-auto p-4 font-mono text-sm ${dk("bg-gray-900", "bg-gray-50")}`}>
            {output.length === 0 ? (
              <div className="text-center text-gray-500 mt-20">
                <div className="text-6xl mb-4">🎮</div>
                <p>Click "Play Game" to start!</p>
                <p className="text-sm mt-2">The game will ask for your input - just type and press Enter</p>
              </div>
            ) : (
              <>
                {output.map((item, idx) => (
                  <div key={idx} className={`mb-1 whitespace-pre-wrap ${item.isError ? 'text-red-400' : 'text-green-400'}`}>
                    {item.text}
                  </div>
                ))}
                
                {waitingForInput && (
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-700">
                    <span className="text-yellow-400 animate-pulse">👉</span>
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendInput()}
                      className="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="Type your answer here and press Enter..."
                      autoFocus
                    />
                    <button
                      onClick={handleSendInput}
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                    >
                      Send
                    </button>
                  </div>
                )}
                
                <div ref={outputEndRef} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KidInteractivePlayground;