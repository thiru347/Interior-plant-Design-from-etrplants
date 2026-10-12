import { PlacedPlant, PlantScheduleItem, MeasurementUnit } from '../types';

// In-memory cache for transparent cutout data URLs
const cutoutCache = new Map<string, string>();

export const BOTANICAL_PLACEHOLDER_URL = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="none">
    <rect width="400" height="400" fill="#F4F1EA"/>
    <rect x="20" y="20" width="360" height="360" rx="12" stroke="#E2DCD0" stroke-width="2" stroke-dasharray="8 8"/>
    <g transform="translate(140, 100)">
      <circle cx="60" cy="60" r="50" fill="#E8E2D5"/>
      <path d="M60 20C40 45 40 80 60 100C80 80 80 45 60 20Z" fill="#2D5A43" opacity="0.6"/>
      <path d="M60 100V40" stroke="#FAF8F5" stroke-width="3" stroke-linecap="round"/>
      <path d="M60 70C70 65 75 55 75 55" stroke="#FAF8F5" stroke-width="3" stroke-linecap="round"/>
      <path d="M60 80C50 75 45 65 45 65" stroke="#FAF8F5" stroke-width="3" stroke-linecap="round"/>
    </g>
    <text x="200" y="260" text-anchor="middle" font-family="serif" font-size="18" fill="#57534E" font-weight="500">Placeholder Specimen</text>
    <text x="200" y="285" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#8C827A">Photo Removed · Click to Upload</text>
  </svg>`
)}`;

/**
 * Converts a plant image with white/light background into a transparent PNG cutout
 * using off-screen canvas pixel manipulation with soft alpha edge feathering.
 */
export async function createTransparentPlantCutout(
  imageUrl: string,
  threshold = 238
): Promise<string> {
  if (cutoutCache.has(imageUrl)) {
    return cutoutCache.get(imageUrl)!;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          resolve(imageUrl);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Chroma / Luminance background removal with soft antialiasing
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Check if pixel is white or off-white background
          const minChannel = Math.min(r, g, b);
          const maxChannel = Math.max(r, g, b);
          const saturation = maxChannel === 0 ? 0 : (maxChannel - minChannel) / maxChannel;

          // Pure / near-white background has low saturation and high brightness
          if (r > threshold && g > threshold && b > threshold && saturation < 0.12) {
            data[i + 3] = 0; // completely transparent
          } else if (r > threshold - 25 && g > threshold - 25 && b > threshold - 25 && saturation < 0.18) {
            // Soft feathering edge
            const brightness = (r + g + b) / 3;
            const factor = Math.max(0, Math.min(1, (255 - brightness) / 30));
            data[i + 3] = Math.round(data[i + 3] * factor);
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const transparentDataUrl = canvas.toDataURL('image/png');
        cutoutCache.set(imageUrl, transparentDataUrl);
        resolve(transparentDataUrl);
      } catch (err) {
        console.warn('Canvas background removal error:', err);
        resolve(imageUrl);
      }
    };
    img.onerror = () => {
      resolve(imageUrl);
    };
    img.src = imageUrl;
  });
}

/**
 * Unit conversion helpers
 */
export function unitToCm(val: number, unit: MeasurementUnit): number {
  if (unit === 'mm') return val / 10;
  if (unit === 'in') return val * 2.54;
  return val;
}

export function cmToUnit(valCm: number, unit: MeasurementUnit): number {
  if (unit === 'mm') return Math.round(valCm * 10);
  if (unit === 'in') return Math.round((valCm / 2.54) * 10) / 10;
  return Math.round(valCm);
}

export function formatDimension(
  length?: number,
  width?: number,
  height?: number,
  unit: MeasurementUnit = 'cm'
): string {
  const parts: string[] = [];
  if (length) parts.push(`L: ${length}${unit}`);
  if (width) parts.push(`W: ${width}${unit}`);
  if (height) parts.push(`H: ${height}${unit}`);
  return parts.join(' × ');
}

/**
 * Composites the room image, plants, pots, and soft contact shadows into a full-resolution canvas
 * exactly matching the on-screen proportions with zero distortion or aspect-ratio alteration.
 */
export async function renderCompositeCanvas(
  roomImageUrl: string,
  plants: PlacedPlant[],
  canvasWidth?: number,
  canvasHeight?: number,
  roomRotation: number = 0
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    bgImg.onload = async () => {
      try {
        const baseW = canvasWidth || bgImg.naturalWidth || 1920;
        const baseH = canvasHeight || bgImg.naturalHeight || 1080;

        // Base canvas representing the unrotated space
        const workCanvas = document.createElement('canvas');
        workCanvas.width = baseW;
        workCanvas.height = baseH;
        const ctx = workCanvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Unable to create canvas context'));
          return;
        }

        // Draw background room photograph
        ctx.drawImage(bgImg, 0, 0, baseW, baseH);

        // Sort plants by zIndex / depth
        const sortedPlants = [...plants]
          .filter((p) => p.visible)
          .sort((a, b) => {
            if (a.zIndex !== b.zIndex) return a.zIndex - b.zIndex;
            return a.y - b.y;
          });

        // Exact screen proportion scaling reference
        const scaleFactor = baseH / 650;

        // Render each plant with its pot and contact shadow
        for (const plant of sortedPlants) {
          try {
            // Ensure transparent cutout is available so white backgrounds are never drawn
            let src = plant.transparentCutoutUrl || plant.imageUrl;
            if (!plant.transparentCutoutUrl && plant.imageUrl) {
              try {
                src = await createTransparentPlantCutout(plant.imageUrl);
              } catch {
                src = plant.imageUrl;
              }
            }

            const plantImg = new Image();
            plantImg.crossOrigin = 'anonymous';

            await new Promise<void>((imgResolve) => {
              plantImg.onload = () => imgResolve();
              plantImg.onerror = () => imgResolve();
              plantImg.src = src;
            });

            const centerX = (plant.x / 100) * baseW;
            const baseY = (plant.y / 100) * baseH;

            // Proportions exactly matching CanvasWorkspace proportions
            const foliageBoxWidth =
              180 * scaleFactor * plant.scale * (plant.widthCm / plant.heightCm);
            const foliageBoxHeight = 220 * scaleFactor * plant.scale * (plant.heightCm / 150);
            const potHeightPx =
              70 * scaleFactor * plant.scale * ((plant.pot.height || 45) / 45);
            const potWidthPx = foliageBoxWidth * 0.58 * ((plant.pot.width || 30) / 30);

            ctx.save();
            ctx.translate(centerX, baseY);
            if (plant.rotation) {
              ctx.rotate((plant.rotation * Math.PI) / 180);
            }

            // 1. Draw realistic floor contact shadow (soft ambient occlusion)
            const shadowRadiusX = potWidthPx * 0.65;
            const shadowRadiusY = potHeightPx * 0.22;

            const shadowGrad = ctx.createRadialGradient(
              0,
              0,
              shadowRadiusX * 0.1,
              0,
              0,
              shadowRadiusX
            );
            shadowGrad.addColorStop(0, 'rgba(15, 20, 25, 0.45)');
            shadowGrad.addColorStop(0.5, 'rgba(15, 20, 25, 0.22)');
            shadowGrad.addColorStop(1, 'rgba(15, 20, 25, 0)');

            ctx.fillStyle = shadowGrad;
            ctx.beginPath();
            ctx.ellipse(0, 2, shadowRadiusX, shadowRadiusY, 0, 0, Math.PI * 2);
            ctx.fill();

            // 2. Draw Pot (use real pot model photograph if present, otherwise vector pot)
            if (plant.pot.imageUrl) {
              try {
                let potImgSrc = plant.pot.imageUrl;
                if (!cutoutCache.has(potImgSrc)) {
                  try {
                    potImgSrc = await createTransparentPlantCutout(potImgSrc);
                  } catch {
                    potImgSrc = plant.pot.imageUrl;
                  }
                }
                const potImg = new Image();
                potImg.crossOrigin = 'anonymous';
                await new Promise<void>((r) => {
                  potImg.onload = () => r();
                  potImg.onerror = () => r();
                  potImg.src = potImgSrc;
                });

                const potNatW = potImg.naturalWidth || 1;
                const potNatH = potImg.naturalHeight || 1;
                const potAspect = potNatW / potNatH;
                const potBoxAspect = potWidthPx / potHeightPx;

                let pDrawW = potWidthPx;
                let pDrawH = potHeightPx;
                if (potAspect > potBoxAspect) {
                  pDrawW = potWidthPx;
                  pDrawH = potWidthPx / potAspect;
                } else {
                  pDrawH = potHeightPx;
                  pDrawW = potHeightPx * potAspect;
                }

                ctx.drawImage(potImg, -pDrawW / 2, -pDrawH, pDrawW, pDrawH);
              } catch {
                drawRealisticPot(ctx, plant.pot, potWidthPx, potHeightPx);
              }
            } else {
              drawRealisticPot(ctx, plant.pot, potWidthPx, potHeightPx);
            }

            // 3. Draw Plant Foliage perched in pot — PRESERVE INTRINSIC ASPECT RATIO
            const foliageBottomY = -potHeightPx * 0.82;
            const naturalW = plantImg.naturalWidth || 1;
            const naturalH = plantImg.naturalHeight || 1;
            const imgAspect = naturalW / naturalH;
            const boxAspect = foliageBoxWidth / foliageBoxHeight;

            let drawW = foliageBoxWidth;
            let drawH = foliageBoxHeight;

            if (imgAspect > boxAspect) {
              // Constrained by bounding width
              drawW = foliageBoxWidth;
              drawH = foliageBoxWidth / imgAspect;
            } else {
              // Constrained by bounding height
              drawH = foliageBoxHeight;
              drawW = foliageBoxHeight * imgAspect;
            }

            const drawX = -drawW / 2;
            const drawY = foliageBottomY - drawH;

            ctx.drawImage(plantImg, drawX, drawY, drawW, drawH);

            ctx.restore();
          } catch (e) {
            console.error('Error drawing plant in composite:', e);
          }
        }

        // Apply roomRotation if photograph was rotated 90/180/270 degrees
        const normRotation = ((roomRotation % 360) + 360) % 360;
        if (normRotation === 0) {
          resolve(workCanvas);
          return;
        }

        const outCanvas = document.createElement('canvas');
        if (normRotation === 90 || normRotation === 270) {
          outCanvas.width = baseH;
          outCanvas.height = baseW;
        } else {
          outCanvas.width = baseW;
          outCanvas.height = baseH;
        }

        const outCtx = outCanvas.getContext('2d');
        if (!outCtx) {
          resolve(workCanvas);
          return;
        }

        outCtx.save();
        if (normRotation === 90) {
          outCtx.translate(baseH, 0);
          outCtx.rotate((90 * Math.PI) / 180);
        } else if (normRotation === 180) {
          outCtx.translate(baseW, baseH);
          outCtx.rotate((180 * Math.PI) / 180);
        } else if (normRotation === 270) {
          outCtx.translate(0, baseW);
          outCtx.rotate((270 * Math.PI) / 180);
        }
        outCtx.drawImage(workCanvas, 0, 0);
        outCtx.restore();

        resolve(outCanvas);
      } catch (err) {
        reject(err);
      }
    };

    bgImg.onerror = (e) => reject(e);
    bgImg.src = roomImageUrl;
  });
}

/**
 * Draws an architecturally styled pot with realistic lighting and bevels
 */
function drawRealisticPot(
  ctx: CanvasRenderingContext2D,
  pot: PlacedPlant['pot'],
  width: number,
  height: number
) {
  const halfW = width / 2;
  const topY = -height;
  const bottomY = 0;
  const color = pot.colorHex || '#1C1D1F';

  ctx.save();

  // Create subtle lighting gradient across the pot cylinder/box
  const potGrad = ctx.createLinearGradient(-halfW, 0, halfW, 0);
  potGrad.addColorStop(0, adjustBrightness(color, -25));
  potGrad.addColorStop(0.25, adjustBrightness(color, 10));
  potGrad.addColorStop(0.7, color);
  potGrad.addColorStop(1, adjustBrightness(color, -35));

  ctx.fillStyle = potGrad;
  ctx.strokeStyle = adjustBrightness(color, -40);
  ctx.lineWidth = 1.5;

  if (pot.shape === 'rectangular' || pot.shape === 'trough') {
    // Rectangular planter box with slight perspective bevel
    const bevel = width * 0.08;
    ctx.beginPath();
    ctx.moveTo(-halfW + bevel, bottomY);
    ctx.lineTo(halfW - bevel, bottomY);
    ctx.lineTo(halfW, topY);
    ctx.lineTo(-halfW, topY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Planter top rim
    ctx.fillStyle = adjustBrightness(color, -30);
    ctx.beginPath();
    ctx.ellipse(0, topY, halfW, width * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (pot.shape === 'cylindrical' || pot.shape === 'fluted') {
    // Cylindrical pot with rounded curved base and top lip
    const taper = width * 0.06;
    ctx.beginPath();
    ctx.moveTo(-halfW + taper, bottomY);
    ctx.quadraticCurveTo(0, bottomY + 4, halfW - taper, bottomY);
    ctx.lineTo(halfW, topY);
    ctx.lineTo(-halfW, topY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Top rim ellipse
    ctx.fillStyle = adjustBrightness(color, -25);
    ctx.beginPath();
    ctx.ellipse(0, topY, halfW, width * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Soil inside top rim
    ctx.fillStyle = '#261E1A';
    ctx.beginPath();
    ctx.ellipse(0, topY + 2, halfW * 0.88, width * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Square / Round default
    ctx.beginPath();
    ctx.roundRect(-halfW, topY, width, height, [4, 4, 2, 2]);
    ctx.fill();
    ctx.stroke();
  }

  // Metallic or luxury accent trim if champagne brass
  if (pot.color.toLowerCase().includes('brass') || pot.color.toLowerCase().includes('gold')) {
    ctx.strokeStyle = 'rgba(255, 230, 150, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-halfW, topY + 4);
    ctx.lineTo(halfW, topY + 4);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Adjust hex color brightness
 */
function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)}`;
}

/**
 * Export plant schedule to CSV
 */
export function exportScheduleToCsv(items: PlantScheduleItem[]): void {
  const headers = [
    'Item #',
    'Plant Name',
    'Botanical Name',
    'Plant Qty',
    'Plant Height (cm)',
    'Approx Width (cm)',
    'Pot Model',
    'Pot Qty',
    'Pot Dimensions',
    'Designated Placement Location',
    'Light Condition Notes',
  ];

  const rows = items.map((item, idx) => [
    `"${idx + 1}"`,
    `"${item.plantName}"`,
    `"${item.botanicalName}"`,
    `"${item.plantQuantity}"`,
    `"${item.plantHeight}"`,
    `"${item.plantWidth}"`,
    `"${item.potName}"`,
    `"${item.potQuantity}"`,
    `"${item.potDimensions}"`,
    `"${item.placementLocation}"`,
    `"${item.lightRequirement}"`,
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `ETR_Plants_Schedule_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
}

/**
 * Nano HD Clarity filter: applies unsharp masking and micro-contrast vibrance
 * to achieve crisp 4K architectural rendering with ultra-sharp leaf details and pot textures.
 */
export function applyUnsharpMaskAndClarity(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  sharpnessPercent = 50,
  vibrancePercent = 25
): void {
  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const len = data.length;

    // Sharpness weight (0 to 1)
    const amount = (sharpnessPercent / 100) * 0.75;
    const vibrance = (vibrancePercent / 100) * 0.35;

    // Fast horizontal & vertical edge-gradient unsharp masking
    const stride = width * 4;
    const original = new Uint8ClampedArray(data);

    for (let y = 1; y < height - 1; y++) {
      const rowOffset = y * stride;
      for (let x = 1; x < width - 1; x++) {
        const i = rowOffset + x * 4;

        // Sample 4-neighborhood average for blur baseline
        const top = i - stride;
        const bottom = i + stride;
        const left = i - 4;
        const right = i + 4;

        for (let c = 0; c < 3; c++) {
          const origVal = original[i + c];
          const neighborAvg = (original[top + c] + original[bottom + c] + original[left + c] + original[right + c]) * 0.25;
          const diff = origVal - neighborAvg;

          // Apply edge sharpening
          let sharpVal = origVal + diff * amount;

          // Micro-contrast S-curve
          sharpVal = sharpVal + (sharpVal - 128) * 0.08;

          data[i + c] = Math.max(0, Math.min(255, Math.round(sharpVal)));
        }

        // Biophilic vibrance boost: enrich foliage greens and deep blacks
        if (vibrance > 0) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const maxC = Math.max(r, g, b);
          const minC = Math.min(r, g, b);
          const sat = maxC === 0 ? 0 : (maxC - minC) / maxC;

          // Boost under-saturated natural tones
          if (sat < 0.8) {
            const avg = (r + g + b) / 3;
            // Green channel slight priority for botanical clarity
            data[i + 1] = Math.min(255, Math.round(g + (g - avg) * vibrance * 1.3));
            data[i] = Math.min(255, Math.round(r + (r - avg) * vibrance));
            data[i + 2] = Math.min(255, Math.round(b + (b - avg) * vibrance));
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  } catch (err) {
    console.warn('Canvas Nano HD filter note:', err);
  }
}

/**
 * Renders full-fidelity Nano HD composite canvas with configurable resolution (up to 4K),
 * realistic soft multi-layer ambient contact shadows, unsharp mask clarity, and optional specification badge.
 */
export async function renderNanoHdCompositeCanvas(
  roomImageUrl: string,
  plants: PlacedPlant[],
  roomRotation = 0,
  options?: {
    resolution?: '1080p' | '2k' | '4k-nano';
    sharpnessLevel?: number;
    foliageVibrance?: number;
    unsharpMask?: boolean;
    includeWatermarkBadge?: boolean;
    roomTitle?: string;
  }
): Promise<HTMLCanvasElement> {
  const {
    resolution = '4k-nano',
    sharpnessLevel = 60,
    foliageVibrance = 25,
    unsharpMask = true,
    includeWatermarkBadge = true,
    roomTitle = 'Interior Space',
  } = options || {};

  return new Promise((resolve, reject) => {
    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';

    bgImg.onload = async () => {
      try {
        const natW = bgImg.naturalWidth || 1920;
        const natH = bgImg.naturalHeight || 1080;
        const aspectRatio = natW / natH;

        // Determine target high-definition resolution
        let targetW = 3840;
        if (resolution === '1080p') {
          targetW = 1920;
        } else if (resolution === '2k') {
          targetW = 2560;
        } else {
          targetW = 3840; // 4K Nano HD
        }
        const targetH = Math.round(targetW / aspectRatio);

        const workCanvas = document.createElement('canvas');
        workCanvas.width = targetW;
        workCanvas.height = targetH;
        const ctx = workCanvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        // High quality bicubic image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // 1. Draw base room photograph with maximum fidelity
        ctx.drawImage(bgImg, 0, 0, targetW, targetH);

        // 2. Sort visible plants by zIndex then floor depth (Y)
        const sortedPlants = [...plants]
          .filter((p) => p.visible)
          .sort((a, b) => {
            if (a.zIndex !== b.zIndex) return a.zIndex - b.zIndex;
            return a.y - b.y;
          });

        const scaleFactor = targetH / 650;

        // 3. Render plants and pots with high-definition contact shadows
        for (const plant of sortedPlants) {
          try {
            let plantSrc = plant.transparentCutoutUrl || plant.imageUrl;
            if (!plant.transparentCutoutUrl && plant.imageUrl) {
              try {
                plantSrc = await createTransparentPlantCutout(plant.imageUrl);
              } catch {
                plantSrc = plant.imageUrl;
              }
            }

            const plantImg = new Image();
            plantImg.crossOrigin = 'anonymous';
            await new Promise<void>((r) => {
              plantImg.onload = () => r();
              plantImg.onerror = () => r();
              plantImg.src = plantSrc;
            });

            const centerX = (plant.x / 100) * targetW;
            const baseY = (plant.y / 100) * targetH;

            const foliageBoxWidth =
              180 * scaleFactor * plant.scale * (plant.widthCm / plant.heightCm);
            const foliageBoxHeight = 220 * scaleFactor * plant.scale * (plant.heightCm / 150);
            const potHeightPx =
              70 * scaleFactor * plant.scale * ((plant.pot.height || 45) / 45);
            const potWidthPx = foliageBoxWidth * 0.58 * ((plant.pot.width || 30) / 30);

            ctx.save();
            ctx.translate(centerX, baseY);
            if (plant.rotation) {
              ctx.rotate((plant.rotation * Math.PI) / 180);
            }

            // Realistic Multi-Layer Ambient Occlusion Contact Shadow
            const shadowRadiusX = potWidthPx * 0.68;
            const shadowRadiusY = potHeightPx * 0.24;

            // Deep contact core
            const coreGrad = ctx.createRadialGradient(0, 1, 0, 0, 1, shadowRadiusX * 0.4);
            coreGrad.addColorStop(0, 'rgba(10, 14, 20, 0.65)');
            coreGrad.addColorStop(1, 'rgba(10, 14, 20, 0)');
            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            ctx.ellipse(0, 1, shadowRadiusX * 0.45, shadowRadiusY * 0.45, 0, 0, Math.PI * 2);
            ctx.fill();

            // Diffuse outer falloff
            const outerGrad = ctx.createRadialGradient(0, 2, shadowRadiusX * 0.15, 0, 2, shadowRadiusX);
            outerGrad.addColorStop(0, 'rgba(15, 20, 26, 0.45)');
            outerGrad.addColorStop(0.5, 'rgba(15, 20, 26, 0.22)');
            outerGrad.addColorStop(1, 'rgba(15, 20, 26, 0)');
            ctx.fillStyle = outerGrad;
            ctx.beginPath();
            ctx.ellipse(0, 2, shadowRadiusX, shadowRadiusY, 0, 0, Math.PI * 2);
            ctx.fill();

            // Draw Pot
            if (plant.pot.imageUrl) {
              try {
                let potImgSrc = plant.pot.imageUrl;
                if (!cutoutCache.has(potImgSrc)) {
                  try {
                    potImgSrc = await createTransparentPlantCutout(potImgSrc);
                  } catch {
                    potImgSrc = plant.pot.imageUrl;
                  }
                }
                const potImg = new Image();
                potImg.crossOrigin = 'anonymous';
                await new Promise<void>((r) => {
                  potImg.onload = () => r();
                  potImg.onerror = () => r();
                  potImg.src = potImgSrc;
                });

                const potNatW = potImg.naturalWidth || 1;
                const potNatH = potImg.naturalHeight || 1;
                const potAspect = potNatW / potNatH;
                const potBoxAspect = potWidthPx / potHeightPx;

                let pDrawW = potWidthPx;
                let pDrawH = potHeightPx;
                if (potAspect > potBoxAspect) {
                  pDrawW = potWidthPx;
                  pDrawH = potWidthPx / potAspect;
                } else {
                  pDrawH = potHeightPx;
                  pDrawW = potHeightPx * potAspect;
                }
                ctx.drawImage(potImg, -pDrawW / 2, -pDrawH, pDrawW, pDrawH);
              } catch {
                drawRealisticPot(ctx, plant.pot, potWidthPx, potHeightPx);
              }
            } else {
              drawRealisticPot(ctx, plant.pot, potWidthPx, potHeightPx);
            }

            // Draw Foliage with preserved aspect ratio
            const foliageBottomY = -potHeightPx * 0.82;
            const naturalW = plantImg.naturalWidth || 1;
            const naturalH = plantImg.naturalHeight || 1;
            const imgAspect = naturalW / naturalH;
            const boxAspect = foliageBoxWidth / foliageBoxHeight;

            let drawW = foliageBoxWidth;
            let drawH = foliageBoxHeight;
            if (imgAspect > boxAspect) {
              drawW = foliageBoxWidth;
              drawH = foliageBoxWidth / imgAspect;
            } else {
              drawH = foliageBoxHeight;
              drawW = foliageBoxHeight * imgAspect;
            }

            ctx.drawImage(plantImg, -drawW / 2, foliageBottomY - drawH, drawW, drawH);
            ctx.restore();
          } catch (e) {
            console.error('Plant render error in Nano HD:', e);
          }
        }

        // 4. Apply Nano HD Unsharp Masking & Botanical Clarity Pass
        if (unsharpMask && sharpnessLevel > 0) {
          applyUnsharpMaskAndClarity(ctx, targetW, targetH, sharpnessLevel, foliageVibrance);
        }

        // 5. Optional Architectural Specification Watermark / Badge
        if (includeWatermarkBadge) {
          const badgeW = 340 * (targetW / 1920);
          const badgeH = 54 * (targetW / 1920);
          const pad = 24 * (targetW / 1920);
          const bx = targetW - badgeW - pad;
          const by = targetH - badgeH - pad;

          ctx.save();
          ctx.fillStyle = 'rgba(15, 23, 20, 0.82)';
          ctx.beginPath();
          ctx.roundRect(bx, by, badgeW, badgeH, [8 * (targetW / 1920)]);
          ctx.fill();

          ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
          ctx.lineWidth = 1.5 * (targetW / 1920);
          ctx.stroke();

          // Green biophilic indicator dot
          ctx.fillStyle = '#10B981';
          ctx.beginPath();
          ctx.arc(bx + 18 * (targetW / 1920), by + badgeH / 2, 4.5 * (targetW / 1920), 0, Math.PI * 2);
          ctx.fill();

          // Title text
          ctx.fillStyle = '#F4F1EA';
          ctx.font = `600 ${Math.round(13 * (targetW / 1920))}px sans-serif`;
          ctx.fillText(
            'ETR PLANTS ARCHITECTURAL SPECIFICATION',
            bx + 32 * (targetW / 1920),
            by + badgeH / 2 - 2 * (targetW / 1920)
          );

          // Subtitle
          ctx.fillStyle = '#9CA3AF';
          ctx.font = `500 ${Math.round(9.5 * (targetW / 1920))}px monospace`;
          ctx.fillText(
            `NANO HD 4K · ${resolution.toUpperCase()} · ${plants.length} SPECIMENS · ${roomTitle.slice(0, 24)}`,
            bx + 32 * (targetW / 1920),
            by + badgeH / 2 + 13 * (targetW / 1920)
          );
          ctx.restore();
        }

        // Handle room rotation if needed
        const normRotation = ((roomRotation % 360) + 360) % 360;
        if (normRotation === 0) {
          resolve(workCanvas);
          return;
        }

        const outCanvas = document.createElement('canvas');
        if (normRotation === 90 || normRotation === 270) {
          outCanvas.width = targetH;
          outCanvas.height = targetW;
        } else {
          outCanvas.width = targetW;
          outCanvas.height = targetH;
        }

        const outCtx = outCanvas.getContext('2d');
        if (!outCtx) {
          resolve(workCanvas);
          return;
        }

        outCtx.save();
        if (normRotation === 90) {
          outCtx.translate(targetH, 0);
          outCtx.rotate((90 * Math.PI) / 180);
        } else if (normRotation === 180) {
          outCtx.translate(targetW, targetH);
          outCtx.rotate((180 * Math.PI) / 180);
        } else if (normRotation === 270) {
          outCtx.translate(0, targetW);
          outCtx.rotate((270 * Math.PI) / 180);
        }
        outCtx.drawImage(workCanvas, 0, 0);
        outCtx.restore();

        resolve(outCanvas);
      } catch (err) {
        reject(err);
      }
    };

    bgImg.onerror = (e) => reject(e);
    bgImg.src = roomImageUrl;
  });
}

