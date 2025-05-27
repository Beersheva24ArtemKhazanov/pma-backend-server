import {createStream} from "rotating-file-stream"
import config from "config"
import morgan from "morgan"

const stream: string = config.get("morgan.stream");
const streamAuth: string = config.get("morgan.stream_auth");
const morganType: string = config.get("morgan.type");

export const logger = morgan(morganType,{
    stream: getStream(stream),
    skip: (req, res) => res.statusCode == 401 || res.statusCode == 403
});

export const loggerAuth = morgan(morganType, {
    stream: getStream(streamAuth),
    skip: (req, res) => res.statusCode != 401 && res.statusCode != 403
});

function getStream(stream: string) {
    const pad = (num: number) => (num > 9 ? "" : "0") + num;
    const fileNameGenerator = (time: Date | number, index?: number) => {
        let res = stream;
        if (time && typeof time !== "number") {
            const month = time.getFullYear() + "" + pad(time.getMonth() + 1);
            const day = pad(time.getDate());
            res = `${month}${day}-${index ?? 0}-${stream}`;
        }
        return res;
    };
    return stream == "console" ? process.stdout : createStream(fileNameGenerator, config.get("morgan.rotation"));
}