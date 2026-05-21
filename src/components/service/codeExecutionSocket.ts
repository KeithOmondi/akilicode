// CodeExecutionSocketService.ts
import { io, Socket } from 'socket.io-client';

export interface ExecutionOutput {
  executionId: string;
  output: string;
  isError: boolean;
}

export interface HtmlRenderData {
  executionId: string;
  code: string;       // Full HTML/CSS/JS code to render in iframe
  language?: string;  // 'html' or 'css'
}

export interface InputRequest {
  executionId: string;
  prompt: string;
}

export interface ExecutionComplete {
  executionId: string;
  exitCode: number;
}

export interface ExecutionError {
  executionId: string;
  error: string;
}

type OutputCallback = (data: ExecutionOutput) => void;
type HtmlRenderCallback = (data: HtmlRenderData) => void;
type InputCallback = (data: InputRequest) => void;
type CompleteCallback = (data: ExecutionComplete) => void;
type ErrorCallback = (data: ExecutionError) => void;

class CodeExecutionSocketService {
  private socket: Socket | null = null;
  private outputCallbacks: OutputCallback[] = [];
  private htmlRenderCallbacks: HtmlRenderCallback[] = [];
  private inputCallbacks: InputCallback[] = [];
  private completeCallbacks: CompleteCallback[] = [];
  private errorCallbacks: ErrorCallback[] = [];

  connect(url?: string) {
    if (this.socket?.connected) return;
    const wsUrl = url || import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:8000`;
    this.socket = io(wsUrl, {
      transports: ['websocket'],
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connected to code execution server');
    });

    this.socket.on('output', (data: ExecutionOutput) => {
      this.outputCallbacks.forEach(cb => cb(data));
    });

    // New event: backend sends HTML/CSS to be rendered in an iframe
    this.socket.on('html-render', (data: HtmlRenderData) => {
      this.htmlRenderCallbacks.forEach(cb => cb(data));
    });

    // Input request (optional: emitted when Python input() is waiting)
    this.socket.on('input-requested', (data: InputRequest) => {
      this.inputCallbacks.forEach(cb => cb(data));
    });

    this.socket.on('execution-complete', (data: ExecutionComplete) => {
      this.completeCallbacks.forEach(cb => cb(data));
    });

    this.socket.on('execution-error', (data: ExecutionError) => {
      this.errorCallbacks.forEach(cb => cb(data));
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from code execution server');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Execute code – backend supports javascript, python, html, css
  executeCode(code: string, language: string) {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('execute-code', { code, language });
  }

  // Send user input when a program (Python/JS) expects it
  sendInput(executionId: string, input: string) {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('input-response', { executionId, input });
  }

  // Callback registrations
  onOutput(callback: OutputCallback) {
    this.outputCallbacks.push(callback);
    return () => {
      this.outputCallbacks = this.outputCallbacks.filter(cb => cb !== callback);
    };
  }

  onHtmlRender(callback: HtmlRenderCallback) {
    this.htmlRenderCallbacks.push(callback);
    return () => {
      this.htmlRenderCallbacks = this.htmlRenderCallbacks.filter(cb => cb !== callback);
    };
  }

  onInputRequest(callback: InputCallback) {
    this.inputCallbacks.push(callback);
    return () => {
      this.inputCallbacks = this.inputCallbacks.filter(cb => cb !== callback);
    };
  }

  onComplete(callback: CompleteCallback) {
    this.completeCallbacks.push(callback);
    return () => {
      this.completeCallbacks = this.completeCallbacks.filter(cb => cb !== callback);
    };
  }

  onError(callback: ErrorCallback) {
    this.errorCallbacks.push(callback);
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
    };
  }
}

export const codeExecutionSocket = new CodeExecutionSocketService();