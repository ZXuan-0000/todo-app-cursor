/**
 * 语音识别工具函数
 * 使用浏览器的 Web Speech API
 */

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

export class SpeechToText {
  private recognition: SpeechRecognition | null = null;
  private isSupported: boolean = false;

  constructor() {
    // 检查浏览器是否支持语音识别 - 使用 any 类型绕过 TypeScript 检查
    const SpeechRecognition =
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;
    
    this.isSupported = typeof SpeechRecognition !== 'undefined' && SpeechRecognition !== null;

    if (this.isSupported) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'zh-CN'; // 设置为中文
      } catch (error) {
        // 如果创建实例失败，标记为不支持
        console.error('无法创建语音识别实例:', error);
        this.isSupported = false;
        this.recognition = null;
      }
    }
  }

  /**
   * 检查浏览器是否支持语音识别
   */
  isBrowserSupported(): boolean {
    return this.isSupported;
  }

  /**
   * 开始语音识别
   * @param onResult 识别结果回调（包括临时结果和最终结果）
   * @param onError 错误回调
   * @param onEnd 识别结束回调
   */
  start(
    onResult: (text: string, isFinal: boolean) => void,
    onError?: (error: string) => void,
    onEnd?: () => void
  ): void {
    if (!this.isSupported || !this.recognition) {
      onError?.('浏览器不支持语音识别功能');
      return;
    }

    // 设置回调函数
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // 优先返回最终结果，否则返回临时结果
      if (finalTranscript) {
        onResult(finalTranscript, true);
      } else if (interimTranscript) {
        onResult(interimTranscript, false);
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = '语音识别出错';
      switch (event.error) {
        case 'no-speech':
          errorMessage = '未检测到语音，请重试';
          break;
        case 'audio-capture':
          errorMessage = '无法访问麦克风，请检查权限';
          break;
        case 'not-allowed':
          errorMessage = '麦克风权限被拒绝，请在浏览器设置中允许';
          break;
        case 'network':
          errorMessage = '无法连接到语音识别服务（需要访问 Google 服务）。如果在中国大陆，可能需要使用 VPN 或代理。';
          break;
        case 'service-not-allowed':
          errorMessage = '语音识别服务不可用，请稍后重试';
          break;
        case 'aborted':
          errorMessage = '语音识别已中止';
          break;
        default:
          errorMessage = `识别错误: ${event.error}`;
      }
      onError?.(errorMessage);
    };

    this.recognition.onend = () => {
      onEnd?.();
    };

    // 开始识别
    try {
      this.recognition.start();
    } catch (error) {
      onError?.('无法启动语音识别，请稍后重试');
    }
  }

  /**
   * 停止语音识别
   */
  stop(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        // 忽略停止时的错误
      }
    }
  }

  /**
   * 中止语音识别
   */
  abort(): void {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (error) {
        // 忽略中止时的错误
      }
    }
  }
}

