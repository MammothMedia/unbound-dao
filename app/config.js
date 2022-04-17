const nodeEnv = process.env.NODE_ENV;
const isStaging = nodeEnv === 'staging';
const isProduction = nodeEnv === 'production';

const tokenAddress = '0xC92D014d0D0590183c078660D0944d653297bB4F';
const stakingAddress = '0x5B55Fa515c3d9A3c36429c22b786c46F8c4E8e24';

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
