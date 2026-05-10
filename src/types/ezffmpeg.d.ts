declare module 'ezffmpeg' {
  interface Clip {
    type: 'video' | 'audio' | 'text';
    url?: string;
    text?: string;
    position: number;
    end: number;
    cutFrom?: number;
    volume?: number;
    [key: string]: unknown;
  }

  interface ProjectOptions {
    width: number;
    height: number;
    fps: number;
  }

  interface ExportOptions {
    outputPath: string;
  }

  export default class EZFFMPEG {
    constructor(options: ProjectOptions);
    load(clips: Clip[]): Promise<void>;
    export(options: ExportOptions): Promise<string>;
  }
}
