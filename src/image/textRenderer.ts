import sharp from 'sharp';

export class TextRenderer {
  /**
   * Estimates text pixel width using character weights
   */
  public static estimateTextWidth(text: string, fontSize: number): number {
    let width = 0;
    for (const char of text) {
      if (/[MWm\u018F\u0259]/.test(char)) {
        // Wide characters (M, W, m, Ə, ə)
        width += fontSize * 0.82;
      } else if (/[iljtfrI\u01311.,'!]/.test(char)) {
        // Narrow characters (i, l, j, t, r, ı, etc.)
        width += fontSize * 0.32;
      } else if (/[A-Z]/.test(char)) {
        // Uppercase
        width += fontSize * 0.68;
      } else if (/\s/.test(char)) {
        // Space
        width += fontSize * 0.35;
      } else {
        // Average lowercase
        width += fontSize * 0.55;
      }
    }
    return width;
  }

  /**
   * Calculates the optimal font size so the name fits within maxWidth
   */
  public static calculateOptimalFontSize(
    name: string,
    maxWidth: number,
    initialFontSize: number = 54,
    minFontSize: number = 26
  ): number {
    let currentFontSize = initialFontSize;

    while (currentFontSize > minFontSize) {
      const estimatedWidth = this.estimateTextWidth(name, currentFontSize);
      if (estimatedWidth <= maxWidth) {
        return currentFontSize;
      }
      currentFontSize -= 2;
    }

    return minFontSize;
  }

  /**
   * Renders the employee name as an SVG buffer ready to composite with Sharp
   */
  public static renderNameSvg(
    name: string,
    canvasWidth: number,
    maxWidth: number,
    initialFontSize: number,
    minFontSize: number,
    textColor: string
  ): { buffer: Buffer; height: number; fontSize: number } {
    const fontSize = this.calculateOptimalFontSize(name, maxWidth, initialFontSize, minFontSize);
    const svgHeight = Math.round(fontSize * 2.4);
    const escapedName = this.escapeXml(name);
    const centerX = Math.round(canvasWidth / 2);
    const centerY = Math.round(svgHeight / 2);

    const svg = `
      <svg width="${canvasWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.6"/>
          </filter>
        </defs>
        <style>
          .name-text {
            font-family: 'Segoe UI', 'Montserrat', 'Inter', 'Roboto', 'Arial', sans-serif;
            font-size: ${fontSize}px;
            font-weight: 700;
            letter-spacing: 0.5px;
            fill: ${textColor};
            text-anchor: middle;
            dominant-baseline: central;
          }
        </style>
        <text 
          x="${centerX}" 
          y="${centerY}" 
          class="name-text"
          filter="url(#shadow)"
        >${escapedName}</text>
      </svg>
    `.trim();

    return {
      buffer: Buffer.from(svg),
      height: svgHeight,
      fontSize,
    };
  }

  private static escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }
}
