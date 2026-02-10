/**
 * Stub service for uploading images and submitting orders
 */

export const uploadAsset = async (blob: Blob): Promise<string> => {
    console.log('Uploading asset...', blob);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In production, this would return an S3/CDN URL
    // For MVP, we'll return a local object URL or a mock string
    return URL.createObjectURL(blob);
};

export const submitOrder = async (orderPayload: any): Promise<boolean> => {
    console.log('Submitting order payload:', JSON.stringify(orderPayload, null, 2));

    const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
    }).catch(err => {
        console.warn('API endpoint not found, simulating success for development');
        return { ok: true };
    });

    return response.ok;
};
