export type Fabric = {
    id: string;
    name: string;
    hex: string; // Representative color (normalized)
    type: string;
    colourGroups: Array<{
        id: string;
        name: string;
        colour: string;
    }>;
    price: {
        sku: string;
        price: number;
        name: string;
    };
    maps: {
        map?: string;
        normalMap?: string;
        roughnessMap?: string;
        metalnessMap?: string;
        displacementMap?: string;
        aoMap?: string;
        [key: string]: string | undefined;
    };
    thumbnails: {
        small?: string;
        medium?: string;
        large?: string;
    };
    lockedScale: number; // Tiling repeat divisor (Larger = Larger Pattern)
    lockedNormalScale: number; // Depth intensity
};

/**
 * Normalizes hex strings (lowercase, ensures leading #, handles whitespace).
 */
export const normalizeHex = (hex: string): string => {
    if (!hex) return '#000000';
    let clean = hex.trim().toLowerCase();
    if (clean.startsWith('rgb')) {
        // Simple RGB to Hex if needed
        const matches = clean.match(/\d+/g);
        if (matches && matches.length >= 3) {
            const r = parseInt(matches[0]);
            const g = parseInt(matches[1]);
            const b = parseInt(matches[2]);
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }
    }
    if (!clean.startsWith('#')) clean = '#' + clean;
    if (clean.length === 4) { // Handle short hex #f00 -> #ff0000
        clean = '#' + clean[1] + clean[1] + clean[2] + clean[2] + clean[3] + clean[3];
    }
    return clean;
};

/**
 * Normalizes the deep JSON structure from materials-data.txt into a flat Fabric object.
 */
export const parseFabrics = (jsonData: any[]): Fabric[] => {
    return jsonData.map((item: any) => {
        const attr = item.attributes;

        // Root hex is unreliable in this dataset (#000000 ubiquitous).
        // We prefer the first color group's defined color.
        const colorFromGroup = attr.colourGroups?.data?.[0]?.attributes?.colour;
        const rawHex = colorFromGroup || attr.hex || '#000000';
        const finalHex = normalizeHex(rawHex);

        // Determine locked scaling parameters for optimal "vismat" standard
        let lockedScale = 2.0;
        let lockedNormalScale = 1.0;
        const typeName = (attr.type?.data?.attributes?.name || 'Unknown').toLowerCase();

        if (typeName.includes('satin') || typeName.includes('silk')) {
            lockedScale = 5.0; // Aggressive zoom
            lockedNormalScale = 0.2;
        } else if (typeName.includes('cotton') || typeName.includes('jersey') || typeName.includes('knit')) {
            lockedScale = 15.0; // Large visible weave
            lockedNormalScale = 0.6;
        } else if (typeName.includes('leather')) {
            lockedScale = 5.0; // Clear grain
            lockedNormalScale = 1.0;
        } else if (typeName.includes('fur')) {
            lockedScale = 5.0;
            lockedNormalScale = 0.8;
        } else if (typeName.includes('denim')) {
            lockedScale = 20.0; // Ultra high definition weave
            lockedNormalScale = 1.2;
        } else if (typeName.includes('mesh')) {
            lockedScale = 25.0; // Visible functional cells
            lockedNormalScale = 0.5;
        }

        const fabric: Fabric = {
            id: item.id,
            name: attr.name,
            hex: finalHex,
            type: attr.type?.data?.attributes?.name || 'Unknown',
            colourGroups: (attr.colourGroups?.data || []).map((cg: any) => ({
                id: cg.id,
                name: cg.attributes.name,
                colour: normalizeHex(cg.attributes.colour),
            })),
            price: {
                sku: attr.price?.data?.attributes?.sku || '',
                price: attr.price?.data?.attributes?.price || 0,
                name: attr.price?.data?.attributes?.name || '',
            },
            maps: {},
            thumbnails: {},
            lockedScale: lockedScale,
            lockedNormalScale: lockedNormalScale
        };

        // Parse images and map types
        if (attr.images && Array.isArray(attr.images)) {
            attr.images.forEach((imgObj: any) => {
                const mapType = imgObj.mapType;
                const imgData = imgObj.image?.data?.attributes;
                if (!imgData) return;

                // Pick the best URL (prefer main url, fallback to large)
                const bestUrl = imgData.url;

                if (mapType) {
                    fabric.maps[mapType] = bestUrl;
                }

                // If this is the 'map' (albedo) OR we don't have thumbnails yet, extract them
                // Sometimes the JSON has thumbnails under different map types or a generic 'image'
                if (mapType === 'map' || !fabric.thumbnails.medium) {
                    fabric.thumbnails.small = imgData.formats?.thumbnail?.url || imgData.url;
                    fabric.thumbnails.medium = imgData.formats?.medium?.url || imgData.formats?.small?.url || imgData.url;
                    fabric.thumbnails.large = imgData.formats?.large?.url || imgData.url;
                }
            });
        }

        return fabric;
    });
};

/**
 * Converts Hex to RGB
 */
const hexToRgb = (hex: string) => {
    const h = normalizeHex(hex);
    const r = parseInt(h.substring(1, 3), 16);
    const g = parseInt(h.substring(3, 5), 16);
    const b = parseInt(h.substring(5, 7), 16);
    return { r, g, b };
};

/**
 * Converts RGB to LAB for perceptual color comparisons.
 * Uses a simplified conversion for performance.
 */
const rgbToLab = (r: number, g: number, b: number) => {
    // 1. Normalize RGB to 0-1
    let nr = r / 255;
    let ng = g / 255;
    let nb = b / 255;

    // 2. Linearize (Gamma correction)
    nr = nr > 0.04045 ? Math.pow((nr + 0.055) / 1.055, 2.4) : nr / 12.92;
    ng = ng > 0.04045 ? Math.pow((ng + 0.055) / 1.055, 2.4) : ng / 12.92;
    nb = nb > 0.04045 ? Math.pow((nb + 0.055) / 1.055, 2.4) : nb / 12.92;

    // 3. Convert to XYZ (D65)
    let x = (nr * 0.4124 + ng * 0.3576 + nb * 0.1805) * 100;
    let y = (nr * 0.2126 + ng * 0.7152 + nb * 0.0722) * 100;
    let z = (nr * 0.0193 + ng * 0.1192 + nb * 0.9505) * 100;

    // 4. XYZ to LAB
    x /= 95.047;
    y /= 100.000;
    z /= 108.883;

    x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
    y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
    z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

    const L = (116 * y) - 16;
    const a = 500 * (x - y);
    const b_val = 200 * (y - z);

    return { L, a, b: b_val };
};

/**
 * Perceptual color distance using DeltaE (Euclidean distance in CIELAB space).
 */
export const colorDistance = (hex1: string, hex2: string): number => {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);

    const lab1 = rgbToLab(rgb1.r, rgb1.g, rgb1.b);
    const lab2 = rgbToLab(rgb2.r, rgb2.g, rgb2.b);

    return Math.sqrt(
        Math.pow(lab2.L - lab1.L, 2) +
        Math.pow(lab2.a - lab1.a, 2) +
        Math.pow(lab2.b - lab1.b, 2)
    );
};

/**
 * Filters fabrics by color, returning exact matches or nearest neighbors.
 * Uses CIELAB DeltaE for high-quality perceptual matching.
 */
export const filterFabricsByColor = (fabrics: Fabric[], targetHex: string): Fabric[] => {
    const normalizedTarget = normalizeHex(targetHex);

    // 1. Primary filter: Exact match in colourGroups OR the representative hex
    const exactMatches = fabrics.filter(f =>
        f.hex === normalizedTarget ||
        f.colourGroups.some(cg => cg.colour === normalizedTarget)
    );

    if (exactMatches.length > 0) {
        // Even for exact matches, we sort them so that items where the 
        // representative hex matches are first.
        return [...exactMatches].sort((a, b) => {
            if (a.hex === normalizedTarget && b.hex !== normalizedTarget) return -1;
            if (b.hex === normalizedTarget && a.hex !== normalizedTarget) return 1;
            return 0;
        });
    }

    // 2. Secondary filter: Perceptual Sort (CIELAB)
    // We compute distance once per fabric and sort.
    return fabrics
        .map(f => ({ fabric: f, distance: colorDistance(f.hex, normalizedTarget) }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 16) // Return top 16 for a better grid fill
        .map(entry => entry.fabric);
};
