export const environment = {
  production: true,
  instances: {
    hg19: {
      apiPath: 'http://localhost:8000/gpf_prefix',
      frontendPath: 'http://localhost:8000/gpf_prefix',
    },
  },
  authPath: 'http://localhost:8000/gpf_prefix',
  oauthClientId: 'gpfjs-frontpage'
};
