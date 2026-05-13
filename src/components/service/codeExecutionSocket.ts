import { io, Socket } from 'socket.io-client';

export interface ExecutionOutput {
  executionId: string;
  output: string;
  isError: boolean;
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
type InputCallback = (data: InputRequest) => void;
type CompleteCallback = (data: ExecutionComplete) => void;
type ErrorCallback = (data: ExecutionError) => void;

class CodeExecutionSocketService {
  private socket: Socket | null = null;
  private outputCallbacks: OutputCallback[] = [];
  private inputCallbacks: InputCallback[] = [];
  private completeCallbacks: CompleteCallback[] = [];
  private errorCallbacks: ErrorCallback[] = [];

  connect() {
    if (this.socket?.connected) return;

    this.socket = io('http://localhost:8000', {
      transports: ['websocket'],
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connected to game server');
    });

    this.socket.on('output', (data: ExecutionOutput) => {
      this.outputCallbacks.forEach(cb => cb(data));
    });

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
      console.log('🔌 Disconnected from game server');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Add this method to check connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  executeCode(code: string, language: string) {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('execute-code', { code, language });
  }

  sendInput(executionId: string, input: string) {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('input-response', { executionId, input });
  }

  onOutput(callback: OutputCallback) {
    this.outputCallbacks.push(callback);
    return () => {
      this.outputCallbacks = this.outputCallbacks.filter(cb => cb !== callback);
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