import { CorsOptions } from "cors";

export const corsConfig: CorsOptions = {
    origin: function(origin, callback){
        const whiteList = [process.env.FRONTEND_URL];
        if (!origin) return callback(null, true);  // <-- Nuevo
        const originRegex = new RegExp(process.env.FRONTEND_URL!.replace(/:\d+$/, "(:\\d+)?"));
        if (originRegex.test(origin)){
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    }
}
