import { pinoHttp} from "pino-http";

const httpLogger = pinoHttp({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  
  ...(process.env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true, 
        translateTime: 'SYS:dd-mm-yyyy HH:MM:ss', 
        ignore: 'pid,hostname,req.headers,res.headers', 
        messageFormat: '{req.method} {req.url} {res.statusCode} - {responseTime}ms',
      },
    },
  }),
  
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 400 && res.statusCode < 500) return 'warn';
    if (res.statusCode >= 500 || err) return 'error';
    return 'info'; 
  },
});

export default httpLogger;