const nodeEnv = process.env.NODE_ENV;
const isStaging = nodeEnv === 'staging';
const isProduction = nodeEnv === 'production';

const googleTrackingId = 'UA-0000000000';
const googleClientId = isProduction || isStaging ? '' : '';
export { googleClientId, googleTrackingId, isProduction, isStaging };
