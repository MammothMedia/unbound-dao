const nodeEnv = process.env.NODE_ENV;
const isStaging = nodeEnv === 'staging';
const isProduction = nodeEnv === 'production';

const tokenAddress = '0x2aD99E81ceBE06D8C0703457a2DA3D431f7DCF90';
const stakingAddress = '0x87EabB54090ddE3a197fF24A90414c1C83012A06';

const googleTrackingId = 'UA-0000000000';
const googleClientId = isProduction || isStaging ? '' : '';
export {
  tokenAddress,
  stakingAddress,
  googleClientId,
  googleTrackingId,
  isProduction,
  isStaging,
};
