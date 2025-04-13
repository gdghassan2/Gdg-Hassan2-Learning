import Cloudflare from 'cloudflare';

export default async function createRecord(apiEmail: string, apiToken: string, recordName: string) {
    const client = new Cloudflare({apiEmail, apiToken});
    const recordResponse = await client.dns.records.create({ 
        zone_id: 'e58108e7f83314b7bb5252959f4edc28',
        type: 'A',
        name: recordName,
        proxied: false,
        content: '84.235.228.85',
        comment: "gdg Learning student",
        ttl: 1,
    });
    return recordResponse;
}