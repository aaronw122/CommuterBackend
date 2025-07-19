import dotenv from 'dotenv';

dotenv.config({ path: `${__dirname}/.env` });

import cleanTrainData from './cleanTrainData.json'

export interface TrainStop {
    value: string;
    label: string;
}

const TRAIN_KEY = process.env.TRAIN_KEY ?? '';

export async function fetchTrainStops(routeId: string | number | null, direction: string): Promise<TrainStop[]>{

    let direction1: string
    let direction2: string

    return (cleanTrainData as any[])
        .filter(stop => {

            if ((routeId === "G" && direction === "South") || (routeId === "P" && direction === "Howard or Loop")) {
                if (routeId === "G"){
                    direction1 = "Cottage Grove"
                    direction2 = "Ashland/63rd"
                }

                else{
                    direction1 = "Loop"
                    direction2 = "Howard"
                }

                const routeMatch = stop.route_id === routeId

                const directionMatch1 = stop.stop_headsign?.toLowerCase().includes(direction1.toLowerCase()) ||
                    stop.stop_headsign === direction1;

                const directionMatch2 = stop.stop_headsign?.toLowerCase().includes(direction2.toLowerCase()) ||
                    stop.stop_headsign === direction2;

                return routeMatch && (directionMatch1 || directionMatch2)
            }

            else {
                const routeMatch = stop.route_id === routeId

                // More flexible direction matching - case insensitive and partial match
                const directionMatch = stop.stop_headsign?.toLowerCase().includes(direction.toLowerCase()) ||
                    stop.stop_headsign === direction;

                return routeMatch && directionMatch;
            }
            // More flexible route matching - handle different formats

        })
        .sort((a, b) => (a.stop_sequence || 0) - (b.stop_sequence || 0))
        .map(stop => ({
            value: stop.stop_id,
            label: stop.stop_name
        }));

}

export interface RawTrainTimes {
    prdt: string;
    arrT: string;
    isDly: string;
    isApp: string;
    destNm: string;
    rt: string;

}

export interface CtaApiResponse {
    "ctatt":{
        eta: RawTrainTimes[] & Array<Record<string, unknown>>;
    }
}

export interface TrainTime {
    times: string;
    dest: any;
}

/**
 * Parses CTA timestamp strings like "20250617T234532" into Date objects.
 */
function parseTimestamp(ts: string): Date {
    return new Date(ts);

}


export async function fetchTrainTimes(stopId: string, routeId: string, maxResults: number = 4):Promise<TrainTime[]>{

    const url = `http://lapi.transitchicago.com/api/1.0/ttarrivals.aspx?key=${TRAIN_KEY}&stpid=${stopId}&outputType=JSON`;

    const response = await fetch(url);

    if (!response.ok){
        throw new Error('CTA API error')
    }

    const json: CtaApiResponse = await response.json();


    const timesRaw = json["ctatt"].eta;


    const filteredTimes = timesRaw
        .filter((raw: RawTrainTimes) => raw.rt === routeId);



    if (!Array.isArray(filteredTimes)) {
        return [{times: "no service is scheduled at this time", dest: null}]
    }

    const TrainTimes: TrainTime[] = filteredTimes
        .slice(0, maxResults)
        .map((raw):TrainTime => {
                let timesValue: string;
                let destValue = raw.destNm;

                if (raw.isDly === "1") {
                    timesValue = "DLY";
                }
                else if( raw.isApp === "1"){
                    timesValue = "DUE";
                }
                else {
                    console.log("debug", raw.arrT, raw.prdt)
                    const arrivalDate = parseTimestamp(raw.arrT);
                    const predictionDate = parseTimestamp(raw.prdt);
                    if (isNaN(arrivalDate.getTime()) || isNaN(predictionDate.getTime())) {
                        console.error('Invalid Date parsed:', arrivalDate, predictionDate);
                    }
                    const diffMs = arrivalDate.getTime() - Date.now();
                    const diffMinutes = Math.round(diffMs / 60000);
                    timesValue = String(diffMinutes);
                }
                return {times: timesValue, dest: destValue};
            }
        );
    return TrainTimes;
}