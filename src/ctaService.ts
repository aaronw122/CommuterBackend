import dotenv from 'dotenv';

dotenv.config({ path: `${__dirname}/.env` });

export interface RawCtaRoute {
    rt: string;
    rtnm: string;
}

export interface CtaApiResponse {
    "bustime-response":{
        routes: RawCtaRoute[] & Array<Record<string, unknown>>;
        // ask leo about this
    }
}


//cleaned data below
export interface SimpleRoute {
    value: string;
    label: string;
}

const CTA_BASE_URL = "https://www.ctabustracker.com/bustime/api/v3"
// Bun automatically loads variables from .env into both Bun.env and process.env.
// We prefer process.env here so this file works in both Bun and Node.
const CTA_KEY = process.env.CTA_KEY ?? '';

export interface RawCtaDirection {
    id: string;
}

export interface CtaApiResponseDirection {
    "bustime-response":{
        directions: RawCtaDirection[] & Array<Record<string, unknown>>;
        // ask leo about this
    }
}


//cleaned data below
export interface SimpleDirection {
    id: string;
}




export async function fetchSimpleDirection(routeId: string | number | null): Promise<SimpleDirection[]>{
    const url = `${CTA_BASE_URL}/getdirections?key=${CTA_KEY}&rt=${routeId}&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`CTA API error: ${response.status} ${response.statusText}`);
    }

    const json: CtaApiResponseDirection = await response.json();

    console.log("bus issue:", json);

    const simpleDirections: SimpleDirection[] = json["bustime-response"].directions.map(
        (raw): SimpleDirection => ({
            id: raw.id,
        })
    );
return simpleDirections;
}


export interface RawCtaStop {
    stpid: string;
    stpnm: string;
}

export interface CtaApiResponseStop {
    "bustime-response":{
        stops: RawCtaStop[] & Array<Record<string, unknown>>;
        // ask leo about this
    }
}


//cleaned data below
export interface SimpleStop {
    value: string;
    label: string;
}

export async function fetchSimpleStop(routeId: string, direction: string): Promise<SimpleStop[]>{
    //const url = `${CTA_BASE_URL}/getstops?key=${CTA_KEY}&rt=${routeId}&dir=${direction}&format=json`;

    const url = `${CTA_BASE_URL}/getstops?key=${CTA_KEY}&rt=${routeId}&dir=${direction}&format=json`;


    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`CTA API error: ${response.status} ${response.statusText}`);
    }

    const json: CtaApiResponseStop = await response.json();

    const stopsRaw = json["bustime-response"].stops;

    if (!Array.isArray(stopsRaw)) {
        // The API didn’t return a stops array (often happens if the
        // route‑direction combo is invalid or out of service).
        return [];
    }
    const simpleStops: SimpleStop[] = stopsRaw.map(
        (raw): SimpleStop => ({
            value: raw.stpid,
            label: raw.stpnm,
        })
    );
    return simpleStops;
}



export interface RawCtaTimes {
    error: string | null;
    des: string,
    dly: boolean,
    prdctdn: string,
    stpid: string,
}

export interface CtaApiResponseTimes {
    "bustime-response":{
        prd: RawCtaTimes[] & Array<Record<string, unknown>>;
    }
}


//cleaned data below
export interface SimpleTime {
    times: string;
    dest: any;
}


export async function fetchSimpleTimes(routeId: string | number | null, direction: string, stopId: string, maxResults: number = 4): Promise<SimpleTime[]>{

    const url = `${CTA_BASE_URL}/getpredictions?key=${CTA_KEY}&rt=${routeId}&dir=${direction}&stpid=${stopId}&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`CTA API error: ${response.status} ${response.statusText}`);
    }

    const json: CtaApiResponseTimes = await response.json();

    const timesRaw = json["bustime-response"].prd;

    console.log("json file:", json)

    console.log("times raw", timesRaw)

    if (!Array.isArray(timesRaw)) {
        // The API didn’t return a stops array (often happens if the
        // route‑direction combo is invalid or out of service).
        return [{times: "no service is scheduled at this time", dest: null}];
    }

    const simpleTimes: SimpleTime[] = timesRaw
        .slice(0, maxResults)
        .map(
            (raw): SimpleTime => ({
                times: (raw.dly ? "DLY" : raw.prdctdn),
                dest: null
            })
        );
    return simpleTimes;
}







