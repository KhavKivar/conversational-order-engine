export const env = {
    BACKEND_URL: process.env.ENVIRONMENT === 'testing' ?
        process.env.BACKEND_URL_TESTING : process.env.BACKEND_URL || '', 
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    TARGET_JID: process.env.TARGET_JID || '',
    MESSAGE: process.env.MESSAGE || '',
    BEARER_TOKEN: process.env.BEARER_TOKEN || '',
}