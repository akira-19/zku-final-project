import { exportCallDataGroth16 } from './snarkjsZkproof';

export const verifierCalldata = async (input: any) => {
  let dataResult;

  try {
    dataResult = await exportCallDataGroth16(
      input,
      '/Ghosts.wasm',
      '/circuit_final.zkey',
    );
  } catch (error) {
    console.log(error);
    // window.alert('Wrong answer');
  }

  return dataResult;
};
