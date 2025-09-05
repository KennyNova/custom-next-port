import Mux from '@mux/mux-node';

let mux: Mux | null = null;

try {
  if (process.env.MUX_TOKEN_ID && process.env.MUX_TOKEN_SECRET) {
    mux = new Mux({
      tokenId: process.env.MUX_TOKEN_ID,
      tokenSecret: process.env.MUX_TOKEN_SECRET,
    });
  } else {
    console.warn('Mux environment variables not configured. Video functionality will be limited.');
  }
} catch (error) {
  console.error('Error initializing Mux client:', error);
}

export { mux };
