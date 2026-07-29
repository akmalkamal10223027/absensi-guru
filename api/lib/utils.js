// Helper untuk response JSON
export function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    });
}

export function errorResponse(message, status = 500) {
    return jsonResponse({ error: message }, status);
}

// Haversine formula
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) ** 2 +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

// Parse multipart form data (untuk upload foto)
export async function parseFormData(request) {
    const formData = await request.formData();
    const data = {};

    formData.forEach((value, key) => {
        if (value instanceof File) {
            data[key] = {
                buffer: Buffer.from(await value.arrayBuffer()),
                mimetype: value.type,
                filename: value.name
            };
        } else {
            data[key] = value;
        }
    });

    return data;
}